# Hoodwise status

**Last reviewed:** July 11, 2026

## Live production baseline

- **Domain:** `https://hoodwise.xyz`
- **Hosting:** Railway production service, sourced from `hoodwisexyz/hoodwise`.
- **Health check:** `GET /api/health` configured through `railway.toml`.
- **Persistence:** Railway volume mounted at `/data`; production database path is `/data/hoodwise.db`.
- **Automated verification:** `npm test` - 25 passing tests at the last review.

## Shipped

### Product and frontend

- Premium marketing landing page with animated network/aurora surfaces, signal console, coverage deck, observatory, interactive Chain Intelligence Map, source-led product narrative, responsive navigation, and accessible motion fallbacks.
- Clean URLs: `/`, `/app`, and `/app/c/<conversation-id>`; legacy `.html` URLs redirect to canonical routes.
- Chat briefing interface with streaming replies, source chips, persistent evidence/contract/risk briefing cards, suggested prompts, message copy, anonymous conversation history, mobile sidebar behavior, light/dark theme, character counter, keyboard support, and clear loading/interaction state.
- Original Hoodwise logo mark, favicon, social preview banner, and brand assets.

### Backend and reliability

- Layered Express architecture: config, middleware, routes, services, SQLite data access, typed errors, and structured request logging.
- Centralized environment configuration, input validation, session ownership checks, rate limiting, Helmet/CSP, request IDs, graceful shutdown, and safe public error messages.
- OpenRouter requests with timeout, bounded retry for transient failures, streaming SSE, and non-stream completion fallback.
- SQLite conversation persistence, transcript export, source storage, and volume-backed production database.
- Public health endpoint that intentionally does not expose provider/model details.

### Knowledge and answer quality

- Curated Robinhood Chain baseline covering architecture, EVM/AA, chain IDs/RPCs, bridges, developer workflow, Stock Tokens, Robinhood Earn, ecosystem partners, community tokens, and risk context.
- Canonical contract references for WETH, USDG, key Stock Tokens, and tokenized ETFs.
- Direct-answer prompt rules: factual answer first, then only the caveat that changes it.
- Memecoin/community-token handling that answers the question while distinguishing unofficial deployments from canonical Robinhood assets.
- Optional Tavily live-search layer for time-sensitive questions, source merging, and prompt-injection-safe handling of fetched snippets.

### Engineering quality

- Node built-in test suite covering conversations, errors, identity sanitization, source matching, streaming safety, and search-trigger behavior.
- GitHub Actions CI runs the test suite on supported Node versions.`n- Privacy-safe in-memory observability counters for chat/verifier requests, errors, average chat latency, and live-search usage; protected ops summary API is disabled unless `OPS_DASHBOARD_TOKEN` is configured.

## Current limitations

- **Tavily is not configured in production.** The live-search code is ready, but no `TAVILY_API_KEY` is currently set; changing facts therefore rely on the curated baseline unless this is enabled.
- **No structured onchain/market feed.** Hoodwise does not provide guaranteed real-time prices, liquidity, holders, TVL, status, or token safety scores.
- **No accounts.** Clearing browser storage loses the local session identifier; server-side history can no longer be reopened from that browser.
- **No analytics or operations dashboard.** Railway logs are available, but there is no first-party product/usage dashboard.
- **`www.hoodwise.xyz` is not configured as an additional Railway custom domain.** The canonical production URL is `https://hoodwise.xyz`.

## Explicit non-goals

- Wallet connection, transaction signing, swaps, trading signals, or price predictions.
- Personalized financial, legal, or tax advice.
- General-purpose chat outside Robinhood Chain context.

See [ROADMAP.md](./ROADMAP.md) for prioritized next work.