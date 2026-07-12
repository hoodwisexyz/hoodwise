<p align="center">
  <img src="./public/hoodwise-banner.png" alt="Hoodwise - Your AI guide to Robinhood Chain" width="100%" />
</p>

<h1 align="center">Chain intelligence, without the noise.</h1>

<p align="center">
  Hoodwise is an independent, source-grounded AI guide to Robinhood Chain.<br />
  It turns protocol, product, ecosystem, community-token, and risk context into direct answers with source chips, optional live search, and read-only onchain checks.
</p>

<p align="center">
  <a href="https://hoodwise.xyz"><strong>Open Hoodwise</strong></a> |
  <a href="https://hoodwise.xyz/token"><strong>Token page</strong></a> |
  <a href="./CONTEXT.md"><strong>Product context</strong></a> |
  <a href="./STATUS.md"><strong>Status</strong></a> |
  <a href="./ROADMAP.md"><strong>Roadmap</strong></a> |
  <a href="./CONTENT.md"><strong>Content kit</strong></a>
</p>

## What Hoodwise does

Hoodwise is built for the question behind the headline: what is confirmed, how does it work, what does it not imply, and what should be verified next?

| Area | What users can ask |
| --- | --- |
| Chain mechanics | Arbitrum L2 architecture, ETH gas, EVM compatibility, account abstraction, RPCs, bridges, and contract deployment. |
| Robinhood products | Stock Tokens, Robinhood Earn, access constraints, and the distinction between product availability and a permissionless chain. |
| Canonical assets | WETH, USDG, major Robinhood Stock Token and tokenized ETF contract references, with exact-address verification. |
| Ecosystem | Infrastructure partners, DEXs, lending, perps, wallets, Chainlink, LayerZero, Uniswap, Morpho, Lighter, analytics, custody, and agentic/onchain tools. |
| Community tokens | Evidence-led memecoin and launchpad research across NOXA Fun, Bankr/Doppler, hood.fun/HoodFun, Virtuals-related claims, Cash Cat lore, DEX liquidity, and Blockscout checks. |
| Hoodwise token | Public project-context answers for the Hoodwise Virtuals launch contract `0x6bdb637a9e988835dc368ef72cb5d143540f037c`. |
| Risk context | Jurisdiction, smart-contract, liquidity, bridge, product-structure, holder, owner-control, and source-verification caveats without personalized trade recommendations. |

> Hoodwise is educational, independent, and not affiliated with Robinhood Markets. It does not connect wallets, sign transactions, execute trades, or provide financial advice.

## Product principles

- **Direct, not vague.** The answer comes first; caveats explain what changes that answer.
- **Source-grounded.** Curated Robinhood Chain knowledge is the baseline. Relevant replies attach source chips instead of raw URLs in the answer body.
- **Research-capable, not reckless.** Community-token and launchpad questions get concrete research framing, candidate context when supported, and a DYOR verification footer.
- **Current when needed.** Tavily live search and read-only onchain/explorer checks can add fresh evidence for changing questions. They supplement the baseline; they never replace verification.
- **Private by default.** No login or wallet connection. Conversation history belongs to an anonymous browser session and production storage uses the Railway volume.

## Current intelligence layer

Hoodwise now has three quality layers around the model response:

1. **Curated baseline** in `src/data/knowledge.js` for stable Robinhood Chain facts, canonical contracts, product boundaries, and answer rules.
2. **Granular ecosystem directory** in `src/services/ecosystemDirectoryService.js` covering launchpad/trading surfaces, AI launch terminals, agent-token identity, community-token lore, DEX liquidity, and verification workflows.
3. **Answer quality guardrails** in `src/services/answerContractService.js` and `src/services/answerQualityService.js`, including real-user answer contracts, privacy/internal-leak checks, raw-URL blocking, and a runtime repair pass for evasive or low-quality answers.

## Production status

Hoodwise is live at [hoodwise.xyz](https://hoodwise.xyz) on Railway.

- Clean public routes: `/`, `/token`, `/app`, `/app/c/<conversation-id>`, guides, and sitemap/robots.
- Health check: `/api/health`.
- Persistent SQLite volume mounted at `/data` in production.
- Streaming chat with completion fallback and final-answer repair when quality review flags the first pass.
- Landing starter prompts hand off into the composer, and chat briefing lanes launch real questions directly.
- Pasted addresses receive a live Token Intelligence Card: canonical status, source-code verification, explorer activity, indexed DEX pools when available, and Hoodwise project-context framing for the Virtuals launch contract.
- Protected `/ops` view is aggregate-only and requires `OPS_DASHBOARD_TOKEN`.
- Automated verification: `npm test` (97 tests) and `npm run smoke:prod` (20 live production cases) after material intelligence changes.

## Architecture

```text
Browser UI -> Express API -> validated chat turn -> curated knowledge
                                   |                 + ecosystem directory
                                   |                 + optional live search
                                   |                 + read-only onchain scan
                                   v
                            quality review / repair
                                   v
                            conversation store + source-linked response
```

The backend is deliberately layered: routes validate and orchestrate, services handle conversations/model/search/onchain/directory/quality, data owns SQLite, and middleware owns request IDs, rate limits, sessions, security headers, and error handling.

## Local development

```bash
npm install
cp .env.example .env
# set OPENROUTER_API_KEY in .env
npm start
```

Open `http://localhost:3000` and run `npm test`. Keep `.env` private; it is ignored by Git.

Useful commands:

```bash
npm test
npm run smoke:prod
```

There is currently no `npm run build` script; validation is Node syntax checks, unit tests, and production smoke where appropriate.

## Deployment

Railway is the production target. Required production variables:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `NODE_ENV=production`
- `PUBLIC_APP_URL=https://hoodwise.xyz`
- `DB_PATH=/data/hoodwise.db`

Recommended/optional variables:

- `TAVILY_API_KEY` for optional live search.
- `SEARCH_MAX_RESULTS=3` and `SEARCH_TIMEOUT_MS=6000` for controlled live context.
- `OPS_DASHBOARD_TOKEN` for the protected aggregate-only ops view.

Mount a Railway volume at `/data`. `railway.toml` configures the `/api/health` deployment check.

For operational detail, limitations, and future work, read [STATUS.md](./STATUS.md) and [ROADMAP.md](./ROADMAP.md).
