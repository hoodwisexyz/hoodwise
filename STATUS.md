# Hoodwise status

**Last reviewed:** July 12, 2026

## Live production baseline

- **Domain:** `https://hoodwise.xyz`
- **Hosting:** Railway production service, sourced from `hoodwisexyz/hoodwise`.
- **Health check:** `GET /api/health` configured through `railway.toml`.
- **Persistence:** Railway volume mounted at `/data`; production database path is `/data/hoodwise.db`.
- **Custom domain state:** `hoodwise.xyz` is canonical. `www.hoodwise.xyz` is not configured as an additional Railway custom domain.
- **Automated verification:** `npm test` - 97 passing tests at this review.
- **Production smoke:** `npm run smoke:prod` - 20 live cases covering NOXA, Bankr, HoodFun, Virtuals, CashCat, Hoodwise token, canonical assets, privacy, and developer answers.

## Shipped

### Product and frontend

- Premium marketing landing page with animated network/aurora surfaces, signal console, coverage deck, observatory, interactive Chain Intelligence Map, action-ready starter prompts, source-led product narrative, responsive navigation, and accessible motion fallbacks.
- Clean URLs: `/`, `/token`, `/app`, and `/app/c/<conversation-id>`; legacy `.html` URLs redirect to canonical routes.
- Chat briefing interface with streaming replies, source chips, persistent evidence/contract/risk briefing cards, action-ready welcome lanes, suggested prompts, message copy, anonymous conversation history, mobile sidebar behavior, light/dark theme, character counter, keyboard support, and clear loading/interaction state.
- Streaming UI supports server-side final answer replacement when a first pass is repaired by the answer-quality layer.
- Original Hoodwise logo mark, favicon, social preview banner, brand assets, and a shareable Hoodwise token/contract page with copy, Blockscout, and Ask Hoodwise actions.
- Public SEO basics are in place: canonical clean routes, robots, sitemap, social preview image, and Google Search Console verification already completed by the owner.

### Backend and reliability

- Layered Express architecture: config, middleware, routes, services, SQLite data access, typed errors, and structured request logging.
- Centralized environment configuration, input validation, session ownership checks, rate limiting, Helmet/CSP, request IDs, graceful shutdown, and safe public error messages.
- OpenRouter requests with timeout, bounded retry for transient failures, streaming SSE, and non-stream completion fallback.
- Runtime answer repair: completed answers are reviewed for directness, source support, research shape, evasive launchpad responses, raw URLs, and internal/provider leaks. Low-quality or evasive answers trigger one repair pass before persistence/response.
- SQLite conversation persistence, transcript export, source storage, and volume-backed production database.
- Public health endpoint intentionally does not expose provider/model details.
- Protected `/ops` dashboard is disabled unless `OPS_DASHBOARD_TOKEN` is configured; when enabled, it exposes aggregate counters only.

### Knowledge and answer quality

- Curated Robinhood Chain baseline covering architecture, EVM/AA, chain IDs/RPCs, bridges, developer workflow, Stock Tokens, Robinhood Earn, ecosystem partners, community tokens, and risk context.
- Canonical contract references for WETH, USDG, key Stock Tokens, and tokenized ETFs.
- Direct-answer prompt rules: factual answer first, then only the caveat that changes it.
- Real-user answer contract tests cover natural NOXA, Bankr, Virtuals, CashCat, Hoodwise-token, safety-check, identity/privacy, and private-data prompts.
- Granular cross-launchpad ecosystem intelligence for NOXA Fun, Bankr/Doppler, hood.fun/HoodFun, Virtuals-related Robinhood Chain research, ForagePad, Cash Cat lore, Uniswap/DEX liquidity context, and Blockscout verification.
- Ecosystem directory entries now include category, chain support, evidence level, user intents, candidate policy, answer hints, examples, and exact verification checklist.
- Live candidate extraction from search snippets for visible token names, tickers, contracts, and market-context terms, passed to the model as evidence-bound research context.
- Tavily live-search layer is configured in production for time-sensitive questions, source merging, and prompt-injection-safe handling of fetched snippets.
- Live contract intelligence for pasted addresses: RPC bytecode/metadata, official canonical-directory match, Blockscout source-verification status, explorer token activity, indexed DEX-pool lookup when available, and Hoodwise project-context framing for the Virtuals launch contract `0x6bdb637a9e988835dc368ef72cb5d143540f037c`.

### Engineering quality

- Node built-in test suite covering conversations, errors, identity sanitization, source matching, streaming safety, candidate extraction, search-trigger behavior, answer contracts, answer repair, onchain scans, metrics, and granular ecosystem directory behavior.
- GitHub Actions CI runs the test suite on supported Node versions.
- Privacy-safe in-memory observability counters for chat/verifier requests, errors, average chat latency, live-search usage, answer-quality reviews, and quality flags.
- Production smoke script validates live behavior against 20 representative cases after material changes.

## Current limitations

- **Live sources remain supplemental.** Tavily and explorer/DEX results can be unavailable, delayed, incomplete, or inconsistent; Hoodwise labels missing evidence rather than inventing it.
- **No guaranteed market feed.** Explorer, launchpad, and DEX snapshots are informational, may be unavailable, and never establish safety, a current ranking, or a trading recommendation.
- **Community-token candidate quality is evidence-bound.** Hoodwise can name research candidates when supported by directory/live context, but it must not fabricate tickers, contracts, prices, liquidity, holder counts, or returns.
- **No accounts.** Clearing browser storage loses the local session identifier; server-side history can no longer be reopened from that browser.
- **Aggregate-only operations dashboard.** `/ops` exposes service aggregates only and never prompts or user message content.
- **No build script.** This repo currently validates through syntax checks, `npm test`, and production smoke; `npm run build` is not defined.

## Explicit non-goals

- Wallet connection, transaction signing, swaps, trading signals, or price predictions.
- Personalized financial, legal, or tax advice.
- General-purpose chat outside Robinhood Chain context.
- Exposing model/provider identity, system prompts, API keys, private session data, database paths, Railway internals, or other private implementation details.

See [ROADMAP.md](./ROADMAP.md) for prioritized next work.
