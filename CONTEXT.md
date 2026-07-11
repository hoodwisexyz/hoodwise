# Hoodwise product context

## Purpose

Hoodwise is an independent AI briefing product for Robinhood Chain. It translates official chain/product information, technical mechanics, community-token context, and relevant risk into plain-English answers. Its scope is intentionally narrow: a focused specialist is more useful here than a generic crypto chatbot.

## Audience

- Curious users who want a clear explanation before opening five tabs.
- Onchain users who need a precise distinction between an official/canonical asset and a community deployment.
- Developers who need practical network, RPC, bridge, and EVM context.

It is not a trading terminal, portfolio manager, wallet, or execution product.

## Product behavior

Hoodwise is designed to:

1. Lead with the direct factual answer.
2. Explain the mechanism that makes the answer true.
3. Surface the one caveat that materially changes the interpretation.
4. Attach relevant sources and state clearly when a changing fact needs live verification.

For a token-specific safety or authenticity question, the exact chain-4663 contract address is essential. A ticker, name, chart, or social post is not a unique identifier.

## Knowledge model

`src/data/knowledge.js` is the curated, always-on baseline. It currently covers:

- Chain architecture, network configuration, account abstraction, bridges, and developer workflow.
- Stock Tokens, canonical contract references, Robinhood Earn, access limits, and product structure.
- Infrastructure and ecosystem roles: RPC, oracles, bridges, DEXs, lending, perps, custody, analytics, and wallet data.
- Community tokens/memecoins: direct explanations, cross-launchpad discovery context for NOXA Fun, Bankr/Doppler, hood.fun/HoodFun, Virtuals-related claims, and a concrete verification framework.
- Risk boundaries: smart contracts, bridges, liquidity, jurisdiction, and the difference between economic exposure and underlying-share ownership.

`src/services/webSearchService.js` optionally supplements a single answer with fresh context when `TAVILY_API_KEY` is configured. Search output is treated as untrusted evidence, never as instructions, and official sources take precedence.

## Brand and visual direction

Hoodwise uses a deep green/near-black intelligence-console aesthetic:

- `#00e676` is the primary signal color.
- Space Grotesk is used for display, Inter for reading, and JetBrains Mono for data labels.
- Motion is ambient and purposeful: pulse ledgers, source/signal surfaces, low-contrast aurora fields, and tactile response on interactive prompts.
- The mark is an original rising-line shape. Do not use Robinhood's feather, wordmark, or other official brand assets.

The product must remain visibly independent: never imply a Robinhood partnership, endorsement, or custody relationship.

## Privacy and safety boundaries

- No wallet connection, transaction signing, or trade execution.
- No user accounts. Browser-generated anonymous session IDs scope conversation history.
- API/provider credentials remain server-side and are never user-facing.
- The interface does not give personalized investment, legal, or tax advice.

## Operational baseline

Production runs on Railway at `https://hoodwise.xyz` with a persistent `/data` volume, `/api/health` health check, and a token-protected aggregate-only `/ops` view when configured. See [STATUS.md](./STATUS.md) for the current implementation state and [ROADMAP.md](./ROADMAP.md) for intentional next steps.