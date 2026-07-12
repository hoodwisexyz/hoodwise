<p align="center">
  <img src="./public/hoodwise-banner.png" alt="Hoodwise - Your AI guide to Robinhood Chain" width="100%" />
</p>

<h1 align="center">Chain intelligence, without the noise.</h1>

<p align="center">
  Hoodwise is an independent, source-grounded guide to Robinhood Chain.<br />
  It turns product, protocol, ecosystem, and risk context into clear, evidence-led answers - with live source and onchain context when it helps.
</p>

<p align="center">
  <a href="https://hoodwise.xyz"><strong>Open Hoodwise</strong></a> |
  <a href="https://hoodwise.xyz/token"><strong>Token page</strong></a> |
  <a href="./CONTEXT.md"><strong>Product context</strong></a> |
  <a href="./ROADMAP.md"><strong>Roadmap</strong></a> |
  <a href="./CONTENT.md"><strong>Content kit</strong></a>
</p>

## What Hoodwise does

Hoodwise is built for the question behind the headline: what is confirmed, how does it work, what does it not imply, and what should be verified next?

| Area | What users can ask |
| --- | --- |
| Chain mechanics | Arbitrum L2 architecture, ETH gas, EVM compatibility, account abstraction, RPCs, bridges, and contract deployment. |
| Robinhood products | Stock Tokens, Robinhood Earn, access constraints, and the distinction between product availability and a permissionless chain. |
| Ecosystem | Infrastructure partners, DEXs, lending, perps, wallets, and agentic/onchain tools. |
| Community tokens | Evidence-led memecoin and launchpad research across NOXA Fun, Bankr/Doppler, hood.fun/HoodFun, Virtuals-related claims, and onchain/DEX checks when an exact contract is available. |
| Risk context | Jurisdiction, smart-contract, liquidity, bridge, and product-structure caveats without trade recommendations. |

> Hoodwise is educational, independent, and not affiliated with Robinhood Markets. It does not connect wallets, execute trades, or provide financial advice.

## Product principles

- **Direct, not vague.** The answer comes first; caveats explain what changes that answer.
- **Source-grounded.** Curated official documentation is the baseline. Relevant replies include source links.
- **Current when needed.** Tavily and onchain/explorer checks can add live evidence for changing questions; neither replaces the curated baseline.
- **Private by default.** No login or wallet connection. Conversation history belongs to an anonymous browser session and is stored on the production volume.

## Production status

Hoodwise is live at [hoodwise.xyz](https://hoodwise.xyz) on Railway.

- Clean public routes: `/`, `/token`, `/app`, and `/app/c/<conversation-id>`.
- Health check: `/api/health`.
- Persistent SQLite volume mounted at `/data` in production.
- Streaming chat with a completion fallback if an upstream stream closes early.
- Landing starter prompts hand off into the composer, and chat briefing lanes launch real questions directly.
- Pasted addresses receive a live Token Intelligence Card: canonical status, source-code verification, explorer activity, indexed DEX pools when available, and a Hoodwise project callout for the Virtuals launch contract `0x6bdb637a9e988835dc368ef72cb5d143540f037c`.
- Automated test suite: `npm test` (97 passing tests at the latest stabilization review).

For operational detail, limitations, and future work, read [STATUS.md](./STATUS.md) and [ROADMAP.md](./ROADMAP.md). To enable live context, set `TAVILY_API_KEY` plus the optional `SEARCH_MAX_RESULTS=3` and `SEARCH_TIMEOUT_MS=6000`; `/api/health` then reports `liveSearchConfigured: true` without exposing the key.

## Architecture

```text
Browser UI -> Express API -> validated chat turn -> curated knowledge
                                   |                 + optional live context
                                   v
                            conversation store + source-linked response
```

The backend is deliberately layered: routes validate and orchestrate, services handle conversations/model/search, data owns SQLite, and middleware owns request IDs, rate limits, and error handling.

## Local development

```bash
npm install
cp .env.example .env
# set OPENROUTER_API_KEY in .env
npm start
```

Open `http://localhost:3000` and run `npm test`. Keep `.env` private; it is ignored by Git.

## Deployment

Railway is the production target. Set `OPENROUTER_API_KEY`, `NODE_ENV=production`, `PUBLIC_APP_URL=https://hoodwise.xyz`, and `DB_PATH=/data/hoodwise.db`; mount a volume at `/data`. `railway.toml` configures the `/api/health` deployment check.
