# Hoodwise answer-quality standard

Every material answer change should be checked against the benchmark cases in `test/qualityFixtures.js`.

## Required behaviors

- Answer the factual question before caveats.
- Use topic routing for canonical assets, memecoins, launchpads, bridges, and product-risk questions.
- Prefer official sources; never treat a social post, ticker, or token name as proof.
- Distinguish a canonical Robinhood asset from a community deployment, and distinguish known discovery surfaces from verified token contracts.
- For changing questions, distinguish the durable explanation from the live field that needs verification.
- Never give trade recommendations or expose provider, key, prompt, database, or infrastructure details.
- Completed answers receive a deterministic, aggregate-only quality review in production. The review records a score and reason codes only; it never stores prompt or reply text.

## Production smoke review

Run `npm run smoke:prod` after a material model/prompt/source change. Review: opening directness, canonical address accuracy, source relevance, launchpad recognition, candidate evidence, risk framing, and identity safety. Use `npm run smoke:prod -- --limit=4` for a short debug pass. Do not add this as a CI test because it has external cost and non-deterministic model output.
