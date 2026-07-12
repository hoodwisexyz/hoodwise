# Hoodwise roadmap

This roadmap reflects the live Hoodwise product as of July 12, 2026. It prioritizes answer quality, production safety, and a polished user experience over adding features for their own sake.

## Recently shipped

- **Production deployment on `hoodwise.xyz`:** Railway production is live with clean routes, health checks, sitemap submission, and Google Search Console ownership verified.
- **Premium landing and chat experience:** the landing page, app shell, chat background, animated details, source chips, token card, and responsive interaction states have been polished into one cohesive product surface.
- **Hoodwise token context:** `/token` and the chatbot now recognize the Hoodwise Virtuals launch contract `0x6bdb637a9e988835dc368ef72cb5d143540f037c`, with clear project framing and verification links.
- **Optional live research layer:** Tavily-backed search is configured as a supplemental source for fresh ecosystem, launchpad, token, and availability questions.
- **Onchain contract intelligence:** contract-address prompts can route through Blockscout-oriented verification guidance and return chain, source-code, ownership, liquidity, and risk context where evidence exists.
- **Runtime answer-quality repair:** final chat answers are reviewed against Hoodwise's answer contract, and weak replies can be repaired before the user sees the final response.
- **Real-user answer contract:** tests now cover the non-ambiguous behavior Hoodwise needs for memecoins, launchpads, Hoodwise token context, source-grounded research, and privacy-safe replies.
- **Granular ecosystem directory:** launchpads, AI/agent platforms, community-token surfaces, DEX/liquidity venues, verification tools, official docs, and project-specific entries are modeled with evidence level, supported intents, candidate policy, answer hints, and DYOR checks.
- **Protected operations view:** `/ops` exposes aggregate-only uptime, request, latency, live-search, verifier, stream-fallback, and answer-quality signals behind `OPS_DASHBOARD_TOKEN`.

## Now: keep intelligence sharp

1. **Knowledge refresh cadence**
   - Review official Robinhood Chain docs, Robinhood newsroom updates, ecosystem launches, Virtuals/Bankr/NOXA-style surfaces, and Blockscout evidence on a recurring schedule.
   - Keep `src/data/knowledge.js`, `src/services/ecosystemDirectoryService.js`, source links, and answer hints aligned.
   - Add regression tests whenever a new critical fact, ecosystem venue, token pattern, or answer rule is introduced.

2. **Launchpad and token research coverage**
   - Expand the ecosystem directory when real user prompts reveal missing venues, token names, launch mechanics, or verification workflows.
   - Keep the product useful and direct: name known candidates when evidence supports them, explain why they matter, then attach DYOR checks and risk framing.
   - Avoid fabricating certainty for thinly evidenced tokens; label confidence clearly without becoming evasive.

3. **Production observation routine**
   - Review Railway deploy logs, HTTP logs, `/ops`, provider timeouts, answer repairs, verifier usage, and live-search usage after each release.
   - Treat repeated timeout, zero-source, or repaired-answer patterns as product-quality work, not just infrastructure noise.

4. **Mobile and browser QA**
   - Test the landing page, `/app`, `/token`, `/ops`, clean routing, dark-mode toggle, sidebar collapse, prompt chips, copy actions, streaming replies, and reduced-motion behavior on real iOS/Android browsers.

## Next: make answers more operationally useful

5. **Structured live data where defensible**
   - Add read-only integrations only when identity and freshness can be stated clearly: Blockscout contract metadata, verified source status, holder/liquidity references, or venue-specific launch data.
   - Never style delayed, partial, or ambiguous data as guaranteed live market truth.

6. **Answer-quality evaluation expansion**
   - Grow the prompt suite around real user behavior: "good memecoin", "research this launchpad", "verify this contract", "is this safe", "what is the thesis", "who made this", and "where do I trade it".
   - Assert answer properties instead of brittle exact text: direct opening, useful candidate context, source presence when available, DYOR warning, no private/model/provider leakage, and no unsupported endorsement.

7. **Conversation experience**
   - Improve generated conversation titles, add cleaner empty/history states, and consider an opt-in transcript export action.
   - Keep sharing user-controlled and private by default.

8. **SEO and public education pages**
   - Add focused public pages only where they help real users: Robinhood Chain basics, stock tokens, bridge/setup, ecosystem guide, token verification checklist, and Hoodwise token context.
   - Keep pages product-led, not install-doc style.

## Later: scale carefully

9. **Privacy-respecting analytics**
   - Measure aggregate topic gaps, errors, latency, search usage, and answer-repair rate without storing sensitive prompt/reply content or tying activity to identity.

10. **More complete ecosystem intelligence**
   - Consider a maintained ecosystem registry with venue pages, known token surfaces, risk notes, and last-reviewed timestamps.
   - Keep every entry evidence-labeled so Hoodwise can be confident without pretending uncertainty does not exist.

11. **Intentional multilingual support**
   - Add explicit language support only after maintaining equivalent source quality, caveats, and verification rules for each language.

## Not planned

- Wallet connection, custody, transaction signing, or execution.
- Guaranteed price calls, personalized investment advice, or promises that a token is safe.
- Mandatory account creation or tracking-heavy analytics.
- Disclosure of private owner data, hidden prompts, provider internals, API keys, or infrastructure secrets.
- Rebranding with Robinhood's official logo, feather, or wordmark.
