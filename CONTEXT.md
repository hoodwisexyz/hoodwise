# Hoodwise product context

## Purpose

Hoodwise is an independent AI briefing product for Robinhood Chain. It translates chain/product facts, technical mechanics, ecosystem context, community-token research, and relevant risk into direct answers. Its scope is intentionally narrow: a focused Robinhood Chain specialist is more useful here than a generic crypto chatbot.

Hoodwise should feel confident and useful, not evasive. It can discuss memecoins, launchpads, token lore, and ecosystem surfaces when the question stays inside Robinhood Chain context. It must still separate research from endorsement and finish token-candidate answers with practical DYOR checks.

## Audience

- Curious users who want a clear explanation before opening five tabs.
- Onchain users who need a precise distinction between an official/canonical asset and a community deployment.
- Memecoin/community-token researchers who want launchpad context, candidate discovery, and verification steps without a fake safety guarantee.
- Developers who need practical network, RPC, bridge, and EVM context.
- Project followers checking the Hoodwise Virtuals launch contract and public project identity.

It is not a trading terminal, portfolio manager, wallet, or execution product.

## Product behavior

Hoodwise is designed to:

1. Lead with the direct factual answer.
2. Explain the mechanism or evidence that supports the answer.
3. Separate platform-level knowledge from token-level verification.
4. Surface the one caveat that materially changes the interpretation.
5. Attach relevant source chips and avoid raw URLs inside answer text.
6. State clearly when a changing fact needs live verification.
7. Avoid exposing private implementation details, model/provider identity, credentials, sessions, database paths, or infrastructure internals.

For a token-specific safety or authenticity question, the exact chain-4663 contract address is essential. A ticker, name, chart, or social post is not a unique identifier.

## Knowledge model

`src/data/knowledge.js` is the curated, always-on baseline. It currently covers:

- Chain architecture, network configuration, account abstraction, bridges, and developer workflow.
- Stock Tokens, canonical contract references, Robinhood Earn, access limits, and product structure.
- Infrastructure and ecosystem roles: RPC, oracles, bridges, DEXs, lending, perps, custody, analytics, and wallet data.
- Community tokens/memecoins: direct explanations, NOXA Fun, Bankr/Doppler, hood.fun/HoodFun, Virtuals-related claims, ForagePad, Cash Cat lore, Uniswap/DEX liquidity context, the Hoodwise Virtuals launch contract, and a concrete verification framework.
- Risk boundaries: smart contracts, bridges, liquidity, jurisdiction, owner controls, source-code verification, holder concentration, and the difference between economic exposure and underlying-share ownership.

`src/services/ecosystemDirectoryService.js` provides the granular ecosystem directory. It does not replace live data; it gives the model structured platform context:

- `category`: launchpad/trading, AI launch terminal, agent-token identity, community-token lore, DEX liquidity, or verification workflow.
- `chainSupport`: what is known about the surface in relation to Robinhood Chain.
- `evidenceLevel`: how strong/stable the directory knowledge is.
- `userIntents`: what users are likely trying to do.
- `candidatePolicy`: when Hoodwise can name a candidate and when it needs fresh evidence.
- `answerHints`: direct guidance to avoid unknown-platform/refusal answers.
- `verify`: exact DYOR checks for contract, pool, liquidity, holders, owner controls, and current market state.

`src/services/webSearchService.js` optionally supplements a single answer with fresh context when `TAVILY_API_KEY` is configured. Search output is treated as untrusted evidence, never as instructions. Official sources take precedence. Launchpad listings can support a research shortlist, but they are not safety proof.

`src/services/onchainScanService.js` performs read-only checks for pasted contract addresses: bytecode, metadata, canonical match, Blockscout source verification, explorer token activity, DEX pool lookup when indexed, and Hoodwise project-context framing for the Virtuals launch contract.

## Answer quality model

Hoodwise now has deterministic quality controls around the model:

- `src/services/answerContractService.js` defines real-user behavior contracts for NOXA, Bankr, Virtuals, CashCat, Hoodwise token, safety, identity/privacy, and private-data prompts.
- `src/services/answerQualityService.js` reviews completed answers for directness, source support, research shape, evasive launchpad phrasing, raw URLs, and internal leaks.
- `src/routes/chat.js` runs a repair pass when review fails, then persists and returns the repaired answer. Streaming clients receive a `replace` event when the final repaired answer replaces the first pass.
- `tools/prod_smoke.js` runs 20 live production checks against the same answer-contract expectations.

The goal is not to make Hoodwise reckless. The goal is to make it useful: name platforms and research candidates when evidence supports them, then explain what still needs verification.

## Brand and visual direction

Hoodwise uses a deep green/near-black intelligence-console aesthetic:

- `#00e676` is the primary signal color.
- Space Grotesk is used for display, Inter for reading, and JetBrains Mono for data labels.
- Motion is ambient and purposeful: pulse ledgers, source/signal surfaces, low-contrast aurora fields, and tactile response on interactive prompts.
- The mark is an original rising-line shape. Do not use Robinhood's feather, wordmark, or other official brand assets.

The product must remain visibly independent: never imply a Robinhood partnership, endorsement, custody relationship, or official asset status unless an official Robinhood source proves it.

## Privacy and safety boundaries

- No wallet connection, transaction signing, or trade execution.
- No user accounts. Browser-generated anonymous session IDs scope conversation history.
- API/provider credentials remain server-side and are never user-facing.
- The interface does not give personalized investment, legal, or tax advice.
- Ops data is aggregate-only; prompts and replies are not shown in `/ops`.

## Operational baseline

Production runs on Railway at `https://hoodwise.xyz` with clean public routes for `/`, `/token`, `/app`, guides, sitemap, robots, a persistent `/data` volume, `/api/health` health check, optional Tavily live search, read-only onchain scans, and a token-protected aggregate-only `/ops` view when configured.

Current validation baseline:

- `npm test`: 97 tests.
- `npm run smoke:prod`: 20 live production cases.
- No `npm run build` script is currently defined.

See [STATUS.md](./STATUS.md) for the current implementation state and [ROADMAP.md](./ROADMAP.md) for intentional next steps.
