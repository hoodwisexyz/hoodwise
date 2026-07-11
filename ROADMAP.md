# Hoodwise roadmap

This roadmap reflects the live product as of July 11, 2026. It is ordered by product value and operational safety, not by novelty.

## Recently shipped

- **Interactive Chain Intelligence Map:** a landing-page exploration surface for network, products, ecosystem, and risk context.
- **Structured briefing cards:** completed chat replies now retain evidence state, canonical contract references when present, material risk tags, and a next verification step.
- **Interaction polish:** landing starter prompts hand off cleanly into the chat composer, while chat briefing lanes are directly actionable with motion-safe tactile states.
- **Privacy-safe quality observation:** aggregate answer-quality reviews and flags are available in the protected ops view without storing prompt or reply content.
- **Lightweight knowledge routing:** developer, Stock Token, memecoin, bridge, and Earn/perps questions receive focused answer instructions without adding another model call.
## Now: protect quality in production

1. **Knowledge refresh cadence**
   - Review official Robinhood Chain docs, contract lists, and newsroom updates on a recurring schedule.
   - Keep `src/data/knowledge.js`, source links, and the canonical asset directory aligned.
   - Add regression tests whenever a new answer rule or critical fact is introduced.

2. **Live context decision**
   - If fresh availability, incident, token, or market questions become important, configure `TAVILY_API_KEY` with a controlled usage limit.
   - Keep the existing rule: live web context supplements sources; it never becomes an unverified replacement for the baseline.

3. **Production observation**
   - Review Railway logs and error rate after releases. The owner-facing protected `/ops` view now exposes aggregate request, latency, search, verifier, and answer-quality signals.
   - Define a simple incident checklist: health endpoint, provider error rate, stream fallback frequency, database volume status, and domain/SSL status.

## Next: make the product easier to use

4. **Mobile real-device QA**
   - Test the landing page and chat on current iOS/Android browsers, small screens, reduced-motion mode, and slow networks.

5. **Answer-quality evaluation set**
   - Add a small set of representative prompts: Stock Token authenticity, bridge mechanics, canonical contract lookup, memecoin explanation, access/jurisdiction, and developer setup.
   - Assert answer properties rather than brittle full text: direct opening, source presence, no unsupported claims, and no identity leaks.

6. **Structured live data, only where defensible**
   - Consider read-only Blockscout/network status integration for exact contract/transaction data.
   - Consider a reliable market-data source only if it can identify the asset/venue unambiguously and disclose freshness. Never style delayed data as live.

7. **Conversation experience**
   - Evaluate better conversation titles and a user-controlled transcript export action in the UI.
   - Keep sharing opt-in and read-only; never expose an anonymous conversation by default.

## Later: learn without compromising privacy

8. **Privacy-respecting product analytics**
   - Measure aggregate errors, latency, and topic gaps without logging sensitive prompt content or tying activity to an identity.

9. **Operations view**
   - Add a small internal dashboard or log integration for uptime, requests, provider failures, and knowledge-refresh reminders.

10. **Intentional multilingual support**
    - Add explicit language selection only after maintaining equivalent source quality and safety rules for each supported language.

## Not planned

- Wallet connection, custody, transaction signing, or execution.
- Trading recommendations, price targets, or personalized investment advice.
- Mandatory account creation or tracking-heavy analytics.
- Rebranding with Robinhood's official logo, feather, or wordmark.