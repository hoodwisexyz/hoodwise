const fetch = require('node-fetch');
const { config } = require('../config');
const logger = require('../lib/logger');
const { UpstreamServiceError, InternalError } = require('../lib/errors');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calls OpenRouter's chat completions endpoint with:
 *  - a hard timeout (AbortController) so one slow upstream call can never
 *    hang a request indefinitely
 *  - a small bounded retry on network failure or 5xx (never on 4xx — a bad
 *    request will fail identically every time, so retrying just burns time
 *    and quota)
 * Returns the raw assistant message text. Throws UpstreamServiceError for
 * anything the client should see as "the model provider had a problem",
 * and never lets the API key or provider identity leak into a thrown error
 * message.
 */
async function callChatModel({ systemPrompt, messages, requestId }) {
  if (!config.openrouter.apiKey) {
    throw new InternalError('Model provider is not configured on this server.');
  }

  const body = JSON.stringify({
    model: config.openrouter.model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: config.chat.maxOutputTokens,
    temperature: 0.4
  });

  let lastError;
  for (let attempt = 0; attempt <= config.openrouter.maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.openrouter.timeoutMs);

    try {
      const response = await fetch(config.openrouter.url, {
        method: 'POST',
        signal: controller.signal,
        // Avoid node-fetch v2's decompression path, which can turn an otherwise
        // valid chunked provider response into ERR_STREAM_PREMATURE_CLOSE.
        compress: false,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openrouter.apiKey}`,
          'HTTP-Referer': config.openrouter.referer,
          'X-Title': 'Hoodwise'
        },
        body
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '<no body>');
        logger.error('model provider returned non-OK status', {
          requestId, status: response.status, body: errText.slice(0, 500)
        });
        // Retry on 5xx (transient), fail fast on 4xx (won't fix itself)
        if (response.status >= 500 && attempt < config.openrouter.maxRetries) {
          lastError = new UpstreamServiceError();
          await sleep(300 * (attempt + 1));
          continue;
        }
        throw new UpstreamServiceError('The model provider returned an error. Please try again.');
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new UpstreamServiceError("The model provider returned an empty response.");
      }
      return text;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        logger.error('model provider request timed out', { requestId, attempt });
        lastError = new UpstreamServiceError('The model provider took too long to respond. Please try again.');
        if (attempt < config.openrouter.maxRetries) { await sleep(300 * (attempt + 1)); continue; }
        throw lastError;
      }
      if (err instanceof UpstreamServiceError) throw err;
      // Network-level failure (DNS, connection reset, etc.) — retry once.
      logger.error('model provider request failed', { requestId, attempt, error: err.message });
      lastError = new UpstreamServiceError();
      if (attempt < config.openrouter.maxRetries) { await sleep(300 * (attempt + 1)); continue; }
      throw lastError;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError || new UpstreamServiceError();
}

module.exports = { callChatModel, streamChatModel };

/**
 * Streaming variant: same request, but with stream:true, parsing the
 * OpenAI-compatible SSE format OpenRouter returns and invoking onToken(text)
 * for each incremental piece as it arrives. Still wrapped in the same hard
 * timeout as the non-streaming path — if the very first bytes don't arrive
 * in time, this throws UpstreamServiceError just like callChatModel does.
 * Unlike callChatModel, this does not retry: a stream that's already begun
 * emitting to the client can't be silently restarted without producing
 * duplicated/garbled output, so a mid-stream failure surfaces as a thrown
 * error for the route to handle (typically: stop the stream, tell the user
 * to try again).
 */
async function streamChatModel({ systemPrompt, messages, requestId, onToken, signal }) {
  if (!config.openrouter.apiKey) {
    throw new InternalError('Model provider is not configured on this server.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.openrouter.timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

  const body = JSON.stringify({
    model: config.openrouter.model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: config.chat.maxOutputTokens,
    temperature: 0.4,
    stream: true
  });

  try {
    const response = await fetch(config.openrouter.url, {
      method: 'POST',
      signal: controller.signal,
      // Avoid node-fetch v2's decompression path, which can turn an otherwise
      // valid chunked provider response into ERR_STREAM_PREMATURE_CLOSE.
      compress: false,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'HTTP-Referer': config.openrouter.referer,
        'X-Title': 'Hoodwise'
      },
      body
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '<no body>');
      logger.error('model provider returned non-OK status (stream)', {
        requestId, status: response.status, body: errText.slice(0, 500)
      });
      throw new UpstreamServiceError('The model provider returned an error. Please try again.');
    }

    let buffered = '';
    let receivedAnyToken = false;

    for await (const rawChunk of response.body) {
      buffered += rawChunk.toString('utf8');
      const lines = buffered.split('\n');
      buffered = lines.pop(); // keep the last (possibly incomplete) line for next iteration

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue; // skip any malformed/partial SSE line rather than crashing the stream
        }
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          receivedAnyToken = true;
          onToken(delta);
        }
      }
    }

    if (!receivedAnyToken) {
      throw new UpstreamServiceError('The model provider returned an empty response.');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      logger.error('model provider stream timed out or was aborted', { requestId });
      throw new UpstreamServiceError('The model provider took too long to respond. Please try again.');
    }
    if (err instanceof UpstreamServiceError) throw err;
    logger.error('model provider stream failed', { requestId, error: err.message });
    throw new UpstreamServiceError();
  } finally {
    clearTimeout(timeout);
  }
}
