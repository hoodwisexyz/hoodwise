# CONTEXT.md — What is Hoodwise?

## One-line description
Hoodwise is a standalone, branded AI chatbot whose only job is to explain
**Robinhood Chain** (the Layer 2 blockchain launched by Robinhood Markets on
July 1, 2026) — its official products, technical architecture, AI/agentic
layer, and the unofficial memecoin/degen ecosystem that grew around it.

## Why it exists
Robinhood Chain mainnet is brand new (launched July 1, 2026). Information
about it is scattered across dozens of press releases, news articles, and
docs pages — there's no single, approachable place for a retail user to ask
"what is this, actually?" and get a clear answer in plain English. Hoodwise
fills that gap: a knowledge-base-grounded chatbot, not a generic wrapper
around an LLM's raw training data.

## Who it's for
Retail users who are curious or already trading on Robinhood Chain but don't
want to read five news articles to understand a new term (Stock Tokens,
Robinhood Earn, Trading MCP, NOXA Fun, etc.). Not aimed at developers or
institutional users.

## What Hoodwise is NOT
- **Not affiliated with Robinhood Markets.** It's an independent, third-party
  explainer project. This is stated in the UI disclaimer and should stay
  that way — do not imply official partnership anywhere in copy or branding.
- **Not a trading bot.** It never executes trades, connects wallets, or
  gives financial advice — only explains how things work.
- **Not a general-purpose chatbot.** It stays scoped to Robinhood Chain
  topics by design (see the system prompt in `src/data/knowledge.js`).

## Brand identity
- **Name:** Hoodwise (domain: hoodwise.xyz)
- **Naming logic:** "Hood" echoes "Robinhood" without using the name/logo
  directly; "-wise" signals the product's function (making the user wiser
  about the chain). Chosen deliberately to associate with Robinhood Chain by
  vibe/word-association while remaining trademark-safe — see "Trademark
  safety" below.
- **Visual identity:** Deep green/black premium palette (`#00e676` primary
  green, near-black backgrounds), evoking Robinhood's brand color and a
  "growth chart" feel, without reusing Robinhood's actual feather icon or
  wordmark. Typography: Space Grotesk (display) + Inter (body) + JetBrains
  Mono (data/labels, ticker-style).
- **Signature visual motif:** An animated "pulse ledger" line (a scrolling
  stock-chart-like waveform) in the header, and a matching waveform "thinking"
  indicator instead of a generic spinner or dot animation — this was a
  deliberate choice to avoid the generic AI-chatbot look.

## Trademark safety (important — read before touching branding)
Robinhood's actual logo (the feather icon) and wordmark are trademarked.
Hoodwise's mark is an original geometric "broken upward line" shape — never
replace it with anything resembling the feather, and never use Robinhood's
official font/wordmark treatment. The goal is association through color and
vibe, not visual copying. If you commission a new logo later, keep this
constraint in mind.

## Model & backend choice
- LLM: **DeepSeek V4 Flash**, accessed via **OpenRouter** (model slug
  `deepseek/deepseek-v4-flash`, or `:free` variant for zero-cost testing).
  This was an explicit choice by the project owner, not a default.
- The API key is a private developer credential and must never be exposed
  client-side — this is why the project has its own Express backend acting
  as a proxy, instead of calling OpenRouter directly from the browser.
- **The underlying model/provider identity is treated as private
  infrastructure, not user-facing information.** Publicly, "Hoodwise" is the
  only name that should ever surface — never "DeepSeek," "OpenRouter," or
  any other model/provider name. This is enforced in three places, and all
  three should be kept in sync if the model is ever swapped:
  1. The system prompt's IDENTITY RULE in `src/data/knowledge.js` instructs the model
     to never confirm/deny/hint at its real identity.
  2. `sanitizeReply()` in `src/data/knowledge.js` scrubs any accidental mention of
     "DeepSeek" / "OpenRouter" out of a reply as a safety net, in case the
     model self-identifies despite the instruction.
  3. `GET /api/health` intentionally omits the model name from its public
     JSON response — it only confirms the service is up.
  If you ever change providers/models, update all three, and re-test by
  directly asking the deployed bot "what model are you?" a few different
  ways before considering it done.

## Where the "knowledge" comes from
Everything the bot knows is hand-compiled into `src/data/knowledge.js` as a system
prompt — the default, always-on source of truth. On top of that, an OPTIONAL
live web search layer (`src/services/webSearchService.js`, Tavily-backed) can
supplement it for questions that look time-sensitive, if TAVILY_API_KEY is
configured — see the "Backend architecture, briefly" section below and
STATUS.md for details.
It covers: chain overview & timeline, technical architecture, flagship
products (Stock Tokens, Earn, perps), infra partners (Chainlink, Uniswap,
etc.), the AI/agentic layer (Trading MCP, Agentic Accounts), the memecoin/
launchpad ecosystem (NOXA Fun, CASHCAT, Cove, Bankr), how it compares to
Base/Tempo, company/business context, and key risk caveats. See
`STATUS.md` for what's covered vs. what needs future updates.

## Backend architecture, briefly
The backend is a layered Express app (`src/config`, `src/lib`, `src/data`,
`src/services`, `src/middleware`, `src/routes`) rather than one flat file —
routes call services, services touch the database/API, and errors flow
through one typed, centralized handler. See the "Architecture" section of
`README.md` for the full breakdown and the reasoning behind it. If you (or
an AI coding agent) are extending this project, put new logic in the layer
it belongs to rather than adding it inline in a route — that's the whole
point of the structure.
