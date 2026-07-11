# STATUS.md — What's done, what's not

Last updated: July 10, 2026 — streaming responses, CI pipeline, and a
critical streaming-sanitizer edge case fixed before shipping
(handoff point — update this date whenever you revisit the project).

## ✅ Done

**Backend**
- [x] **Rebuilt as a layered architecture** (`src/config`, `src/lib`, `src/data`, `src/services`, `src/middleware`, `src/routes`, `src/app.js`) — routes never touch SQL or the model API directly, everything goes through a service layer
- [x] Centralized, validated config (`src/config`) — every env var read in exactly one place
- [x] Structured JSON logging with per-request correlation IDs (`src/lib/logger.js`, `src/middleware/requestId.js`)
- [x] Typed error classes (`src/lib/errors.js`) with an explicit `expose` flag — impossible to accidentally leak an internal error message to a client
- [x] Centralized error-handling middleware — one place that decides what error detail is safe to return
- [x] Input validation on every route (sessionId shape, message length/type, conversationId type)
- [x] Rate limiting on `/api/chat` (`express-rate-limit`, keyed by session/IP, default 20 req/min) — protects the OpenRouter bill from a single runaway client
- [x] Security headers via `helmet` (including a scoped Content-Security-Policy)
- [x] OpenRouter calls wrapped with a hard timeout (default 25s) and one bounded retry on network failure/5xx — never retries 4xx
- [x] Graceful shutdown (`SIGTERM`/`SIGINT`) — drains in-flight requests and closes the DB connection cleanly instead of dying mid-request on a Railway redeploy
- [x] Automated test suite (`npm test`, Node's built-in test runner, zero extra dependencies) covering the identity sanitizer, source-link matcher, typed errors, and the conversation service (against an isolated temp DB)
- [x] **Personality/intelligence pass on the system prompt** — calibrated to answer with depth matching the question (quick answers stay quick, genuinely open questions get real analysis), confident and specific rather than hedgy, defines jargon inline without over-explaining to advanced users, no filler openers
- [x] **Optional live web search "keep learning" layer** (`src/services/webSearchService.js`, Tavily-backed) — triggers only for questions that look time-sensitive (regex heuristic), folds results into that one reply and into `sources`, fully optional and gracefully no-ops with no key configured or on any failure/timeout (tested against both cases)
- [x] **Streaming responses** (`POST /api/chat/stream`, Server-Sent Events) — the web app now shows tokens arriving progressively instead of waiting for the full reply. Built with a dedicated streaming-safe sanitizer (`createStreamingSanitizer()`) that provably never leaks a split identity match across chunk boundaries — including the specific case of a two-word phrase split exactly on the space between words, which an earlier, simpler version of this got wrong before it shipped (see the fix documented in `test/knowledge.test.js`). The non-streaming `POST /api/chat` endpoint is kept as a fallback/simple-client option.
- [x] **CI pipeline** (`.github/workflows/test.yml`) — runs `npm test` on every push/PR against Node 18.x and 20.x
- [x] Express server (`server.js` + `src/app.js`) with OpenRouter proxy — key never touches the client
- [x] SQLite persistence (`src/data/db.js`) — conversations + messages tables
- [x] Anonymous session model (client-generated UUID in `localStorage`, no login)
- [x] `POST /api/chat` — sends capped conversation history (last 20 messages) + system prompt to DeepSeek V4 Flash
- [x] `GET /api/conversations`, `GET /api/conversations/:id/messages`, `DELETE /api/conversations/:id`
- [x] `GET /api/conversations/:id/export` — download a conversation as a plain-text transcript (new)
- [x] `GET /api/health` — uptime check, no model name exposed
- [x] Keyword-based source-link matcher (`findSources` in `src/data/knowledge.js`) — attaches up to 3 "learn more" links per relevant reply, no paid search API needed
- [x] System prompt hardened against leaking backend/model/key details if asked
- [x] Model/provider identity treated as private: strict system-prompt IDENTITY RULE + server-side `sanitizeReply()` scrub + `/api/health` no longer exposes the model name publicly

**Frontend**
- [x] Full chat UI: message bubbles, auto-scroll, Enter-to-send, multiline input
- [x] Sidebar with persistent chat history (open/delete past conversations, "New chat")
- [x] Dark/light theme toggle (persisted via `localStorage`)
- [x] Signature "pulse ledger" animation + waveform "thinking" indicator (custom, non-generic)
- [x] Source link chips rendered under bot messages when available
- [x] Suggested-question chips on empty state
- [x] Responsive layout (sidebar collapses on mobile)
- [x] Original logo mark (SVG, trademark-safe) + favicon
- [x] **Marketing landing page** (`index.html`) — hero with animated ambient network canvas, ticker strip, "How it works" 3-step process, "what it knows" card grid, "Why Hoodwise" comparison section, chat preview mockup, trust/transparency strip, public roadmap teaser, FAQ, final CTA banner, footer — all with scroll-reveal animation
- [x] **Custom cursor** (`cursor.js` + rules in `shared.css`) — site-wide on both landing and app, auto-disabled on touch devices and when the OS "reduce motion" setting is on
- [x] App interface now lives at `/app`, linked from the landing page's "Launch Hoodwise" CTA and from the sidebar logo (click to go home)
- [x] **Premium interaction pass**: working mobile hamburger menu (previously nav links just vanished on small screens with no replacement), scroll-spy active nav state, staggered hero entrance animation, cursor-following "spotlight" hover on feature cards, scripted live-typing demo in the preview window (loops automatically), smooth fade page-transition between landing ↔ app, visible `:focus-visible` keyboard-navigation states site-wide, and a copy-to-clipboard button on bot chat bubbles

**Docs**
- [x] `README.md` — local setup + Railway deployment steps
- [x] `CONTEXT.md` — what Hoodwise is, brand identity, trademark constraints
- [x] `STATUS.md` — this file
- [x] `ROADMAP.md` — what's next

**Knowledge base coverage (`knowledge.js`)**
- [x] Chain overview & timeline (testnet Feb 2026 → mainnet July 1, 2026)
- [x] Technical architecture (Arbitrum Orbit, EVM compat, ERC-4337, FCFS sequencer)
- [x] Stock Tokens, Robinhood Earn, perpetual futures (Lighter)
- [x] Infra partners (Chainlink, Uniswap, Pleiades, Alchemy, BitGo, 0x)
- [x] AI/agentic layer (Trading MCP, Agentic Accounts, Agentic Credit Card)
- [x] Memecoin/degen ecosystem (NOXA Fun, CASHCAT, Cove, Bankr, Blockscout)
- [x] Comparison vs. Base / Tempo
- [x] Company/business context (HOOD stock, customer counts, layoffs)
- [x] Risk caveats (no native token, jurisdiction limits, regulatory uncertainty)

## 🚧 Not done yet / explicitly out of scope for v1

- [ ] **No structured live data feeds.** The bot cannot fetch real-time prices,
      TVL, or trending tokens from dedicated data feeds. Its static knowledge
      base is a snapshot, though the optional Tavily-backed web search layer can
      supplement time-sensitive questions when `TAVILY_API_KEY` is configured.

- [ ] **No user accounts / login.** Sessions are anonymous and tied to
      browser `localStorage` only — clearing browser data loses access to
      that history (though the data itself stays in the server DB, just
      orphaned).
- [ ] **No admin dashboard.** There's no UI to view usage, costs, or edit the
      knowledge base without touching code directly.
- [ ] **No production deployment yet.** Code is built and locally verified,
      but has not been deployed to Railway or connected to hoodwise.xyz —
      that's the next manual step for the project owner.
- [ ] **No custom-designed logo.** Current mark is a simple, original
      geometric placeholder (see CONTEXT.md) — good enough to ship, but not
      a fully art-directed brand mark.
- [ ] **Landing page ticker is static/ambient, not live data.** The strip of
      labels ("MAINNET · JUL 01 2026", "NO NATIVE TOKEN", etc.) is
      intentionally presented as fixed facts, not a real-time feed — do not
      wire it up to look like live data unless it's actually backed by a
      live source, to avoid misleading users.
- [ ] **Live search trigger is a keyword heuristic, not perfect.** `looksTimeSensitive()`
      is a regex match on words like "latest"/"today"/"trending" — it will
      occasionally miss a question that's actually time-sensitive but phrased
      unusually, and occasionally trigger a search that wasn't really needed.
      This is a deliberate speed/cost tradeoff (a full intent-classification
      call would be slower and cost more per message) — revisit if it proves
      too imprecise in practice.
- [ ] **No Tavily key is provided/configured yet.** The live search layer is
      built and tested (including graceful failure), but `TAVILY_API_KEY` is
      not set anywhere by default — get a free key at tavily.com if you want
      this feature active.
- [ ] **No analytics.** No tracking of how many people use it, common
      questions, drop-off points, etc.

## Known limitations to be aware of

- Railway's default filesystem is **ephemeral** — the SQLite file will be
  wiped on every redeploy unless a Volume is attached (see README.md, step 5
  under deployment). Until that's set up, "persistent" chat history only
  persists between requests, not across redeploys.
- `better-sqlite3` is a native module — Railway's Nixpacks builder handles
  this fine in almost all cases, but if a build ever fails on this
  dependency, that's the first thing to check.
- The knowledge base is a snapshot in time. Robinhood Chain is very new and
  actively evolving (new launchpads, new partners, possible native token
  discussions, regulatory developments) — treat `knowledge.js` as something
  that needs periodic manual review, not a "set and forget" file.
