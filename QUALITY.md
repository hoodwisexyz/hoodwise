# Hoodwise answer-quality standard

Every material answer change should be checked against the benchmark cases in `test/qualityFixtures.js`.

## Required behaviors

- Answer the factual question before caveats.
- Use topic routing for canonical assets, memecoins, bridges, and product-risk questions.
- Prefer official sources; never treat a social post, ticker, or token name as proof.
- Distinguish a canonical Robinhood asset from a community deployment.
- For changing questions, distinguish the durable explanation from the live field that needs verification.
- Never give trade recommendations or expose provider, key, prompt, database, or infrastructure details.

## Production smoke review

Run a small, deliberate set of live questions after a material model/prompt/source change. Review: opening directness, canonical address accuracy, source relevance, risk framing, and identity safety. Do not add this as a CI test because it has external cost and non-deterministic model output.