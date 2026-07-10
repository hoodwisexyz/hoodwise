# Hoodwise

Hoodwise is a branded explainer chatbot for **Robinhood Chain** — the Layer 2
blockchain built by Robinhood. It answers questions about the tech, Stock
Tokens, Robinhood Earn, the AI/agentic layer, and the memecoin ecosystem
(NOXA Fun, CASHCAT, Cove, Bankr, etc.), with source links attached to relevant
answers. Chat history is saved per anonymous session.

The chat model is **DeepSeek V4 Flash**, called through **OpenRouter** — the
API key lives only on the server, is never sent to the browser, and the
model/provider identity is never surfaced to end users (see CONTEXT.md).

## Architecture

The backend follows a standard layered structure so each concern is easy to
find and change in isolation:

```
server.js                     # thin entry point: config, boot, graceful shutdown
src/
  config/index.js             # all env vars read + validated in ONE place
  lib/
    logger.js                 # structured JSON logging
    errors.js                 # typed HTTP errors (BadRequestError, NotFoundError, ...)
  data/
    db.js                     # SQLite connection + schema
    knowledge.js               # the Robinhood Chain knowledge base (system prompt),
                               #   source-link matcher, and identity sanitizer
  services/
    conversationService.js    # all DB access for conversations/messages
    openrouterService.js      # model API call, with timeout + bounded retry
  middleware/
    requestId.js              # tags each request for correlated logs
    sessionValidation.js      # validates the sessionId shape
    rateLimiter.js            # per-session/IP rate limiting on /api/chat
    errorHandler.js           # asyncHandler wrapper + centralized error responses
  routes/
    health.js, conversations.js, chat.js       # chat.js exposes both POST /api/chat
                                                #   (single JSON response) and
                                                #   POST /api/chat/stream (Server-Sent
                                                #   Events — what the web app uses)
  app.js                       # wires it all together (helmet, cors, static files, routes)
test/
  *.test.js                    # run with `npm test` (Node's built-in test runner, no extra deps)
.github/workflows/test.yml     # CI — runs the test suite on every push/PR (Node 18.x and 20.x)
public/                        # frontend — see below
```

**Design principles behind this structure:**
- Routes never touch SQL or the OpenRouter API directly — they call `services/`.
- Every thrown error is a typed `HttpError` subclass with an explicit
  `expose` flag, so it's structurally impossible to accidentally leak an
  internal error message (stack trace, DB error, provider response) to a
  client — the central `errorHandler` decides what's safe to show.
- Config is read from `process.env` in exactly one file. Everything else
  imports `config` — no scattered `process.env.X` calls to lose track of.
- `openrouterService.js` wraps every model call in a timeout (default 25s)
  and retries once on network failure or 5xx, but never retries a 4xx
  (a bad request fails identically every time, so retrying wastes time/quota).
- `webSearchService.js` is an **optional, additive** "keep learning" layer:
  if `TAVILY_API_KEY` is set, questions that look time-sensitive (regex
  heuristic in `looksTimeSensitive()` — "latest", "today", "trending",
  "price", etc.) trigger a scoped live web search, whose results are folded
  into that one reply and merged into the returned `sources`. With no key
  set, or if the search fails/times out, this silently no-ops — Hoodwise
  falls back to the static knowledge base exactly as before. It is never a
  hard dependency.
- **Streaming is identity-safe by construction.** `POST /api/chat/stream`
  streams tokens as they arrive from the model, but never raw — every
  chunk passes through `createStreamingSanitizer()` in `src/data/knowledge.js`,
  which holds back a small rolling buffer and only releases text up to a
  cut point it has verified doesn't split any monitored identity pattern
  (including multi-word ones like "open router", even if a chunk boundary
  happens to land exactly on the space between the two words). See the
  tests in `test/knowledge.test.js` for the specific split-boundary cases
  this guards against.

## Frontend files

- `public/index.html` — the marketing landing page (served at `/`).
- `public/app.html` — the actual chatbot interface (served at `/app.html`), linked from the landing page's "Launch Hoodwise" button.
- `public/cursor.js` + `public/shared.css` — the custom cursor, page-transition, and scroll-reveal helpers, shared by both pages.
- `public/landing.css` / `public/landing.js` — styling and the ambient network-canvas animation for the landing page only.
- `public/styles.css` / `public/app.js` — styling and logic for the chat app itself.

## 1. Local setup

```bash
npm install
cp .env.example .env
# edit .env and paste your real OPENROUTER_API_KEY
npm start
```

Visit `http://localhost:3000`.

Get an OpenRouter key at **https://openrouter.ai/keys**. While testing, you
can set `OPENROUTER_MODEL=deepseek/deepseek-v4-flash:free` in `.env` to pay
nothing per call (rate-limited by OpenRouter's free tier).

### Running tests

```bash
npm test
```

Runs the unit/integration test suite (identity sanitizer, source matcher,
typed errors, conversation service against an isolated temp SQLite file — it
never touches your real `hoodwise.db`). No extra dependencies required;
uses Node's built-in test runner.

## 2. Deploying to Railway

1. Push this folder to a GitHub repo (make sure `.env` is **not** committed — it's already in `.gitignore`).
2. In Railway: **New Project → Deploy from GitHub repo** → pick this repo.
3. Railway auto-detects Node.js and runs `npm install` + `npm start`.
4. Go to your service's **Variables** tab and add at minimum:
   - `OPENROUTER_API_KEY` = your real key
   - `OPENROUTER_MODEL` = `deepseek/deepseek-v4-flash` (or the `:free` variant)
   - `PUBLIC_APP_URL` = `https://hoodwise.xyz` (or whatever your Railway/custom domain is)
   - `NODE_ENV` = `production`
   All other variables in `.env.example` (timeouts, rate limits, message caps) have sane defaults — only set them if you want to change the behavior.
5. **Persisting chat history across redeploys (important):** Railway's default filesystem is wiped on every redeploy. To keep the SQLite database permanently:
   - In your Railway service, add a **Volume** (Settings → Volumes), mount it at `/data`.
   - Set the variable `DB_PATH=/data/hoodwise.db`.
   - Without this step, Hoodwise still works fine — chat history just resets whenever you redeploy.
6. Once deployed, point your `hoodwise.xyz` domain at the Railway service (Settings → Networking → Custom Domain), and update `PUBLIC_APP_URL` to match.

## 3. Security notes

- The OpenRouter key is read only from `process.env.OPENROUTER_API_KEY` on the server, via `src/config` — it is never sent to, or readable from, the browser.
- `.env` is gitignored. Never paste your real key into chat, commits, or client-side code — if a key is ever pasted somewhere outside your own machine/Railway dashboard, treat it as compromised and rotate it at openrouter.ai/keys immediately.
- The system prompt (`src/data/knowledge.js`) explicitly instructs the model never to reveal implementation details (backend, database, model provider, or the key) even if a user asks directly, and `sanitizeReply()` scrubs any accidental mention of the real provider name as a server-side safety net. `/api/health` also never exposes the model name.
- Chat history is scoped by an anonymous `sessionId` generated in the browser's `localStorage` — there's no login, so anyone with access to a user's browser/localStorage could see their own history, but no one else's history is exposed cross-session (enforced server-side in `conversationService.getOwnedConversation`).
- `/api/chat` is rate-limited per session/IP (`RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MS`, defaults to 20/minute) to protect your OpenRouter bill from a single runaway client. The app trusts one reverse-proxy hop (`app.set('trust proxy', 1)`) so this resolves the real client IP correctly on Railway instead of rate-limiting every visitor as one shared IP.
- Security headers are set via `helmet`, and all inputs are validated (`sessionId` shape, message length, conversationId type) before touching the database or the model API.

## 4. Enabling the "keep learning" live search layer (optional)

By default Hoodwise answers purely from the curated knowledge base in
`src/data/knowledge.js`. To let it also pull a few live web results for
time-sensitive questions:

1. Get a free API key at **https://tavily.com** (has a generous free tier).
2. Set `TAVILY_API_KEY` in `.env` (local) or Railway Variables (production).
3. That's it — no code changes needed. `SEARCH_MAX_RESULTS` (default 4) and
   `SEARCH_TIMEOUT_MS` (default 6000) can be tuned if you want more/fewer
   results or a stricter timeout.

Leave `TAVILY_API_KEY` unset and nothing changes — Hoodwise behaves exactly
as it did before, answering from the static knowledge base only, with no
extra latency or failure surface.

## 5. Customizing the knowledge base

Everything Hoodwise "knows" lives in `src/data/knowledge.js` as
`SYSTEM_PROMPT`. Edit that file directly to add new facts, correct
something, or expand a section (e.g. as Robinhood Chain ships new
products). The `SOURCES` array right above it controls which "learn more"
links get attached to replies — add a new entry with `keywords` + `title` +
`url` any time you want a new topic to surface a source chip. Run
`npm test` after editing to make sure the sanitizer/source-matcher tests
still pass.

## 6. Rebranding / logo

The logo mark is an inline SVG in `public/index.html` (an upward, jagged
line — a nod to Robinhood's green growth-chart identity without reusing
their actual feather logo or wordmark, to stay trademark-safe). Swap the
`<svg class="brand-mark">` block or the favicon `<link>` if you design a
different mark later.
