# ROADMAP.md — What's next

Suggested order, roughly grouped by priority.

## Priority 1 — Before/at public launch

1. **Deploy to Railway + connect hoodwise.xyz**
   Follow README.md section 2. This is the one hard blocker to actually
   being live.
2. **Attach a Railway Volume for the database**
   Without this, chat history resets on every redeploy. Cheap to set up,
   easy to forget — do it at the same time as the first deploy.
3. **Real logo / brand mark**
   Current mark is a functional placeholder. Worth a proper design pass
   once the brand direction feels locked in — keep the trademark-safety
   constraints from CONTEXT.md in mind.

~~Basic abuse protection~~ — done: `/api/chat` and `/api/chat/stream` are
rate-limited per session/IP via `express-rate-limit` (see
`src/middleware/rateLimiter.js`), and Express trusts Railway's proxy hop so
this resolves the real client IP correctly in production.

~~Automated tests~~ — done: `npm test` runs the suite in `test/` (21 tests).

~~Streaming responses~~ — done: `POST /api/chat/stream` streams tokens via
Server-Sent Events, with a dedicated streaming-safe identity sanitizer.

~~CI pipeline~~ — done: `.github/workflows/test.yml` runs the suite on
every push/PR.

## Priority 2 — Quality of life

4. **Knowledge base refresh workflow**
   Robinhood Chain is evolving fast. Consider a lightweight process (even
   just a recurring reminder) to re-check for major changes — new
   launchpads, partner announcements, regulatory news, a possible native
   token — and update `src/data/knowledge.js` accordingly. Run `npm test`
   after any edit.
5. **Mobile polish pass**
   The layout is responsive but hasn't been stress-tested on a range of
   real devices — worth a dedicated pass once real users start hitting it
   from phones.
6. **Conversation titles**
   Titles are currently just the first ~48 characters of the user's first
   message. Could upgrade to an LLM-generated short title for a cleaner
   sidebar, at the cost of one extra model call per new conversation.
7. **Structured request logs → a log viewer**
   Logs are already structured JSON (`src/lib/logger.js`) — piping them into
   something like Railway's log explorer, Axiom, or Better Stack would make
   the existing logging actually useful for debugging production issues,
   not just local ones.

## Priority 3 — Nice to have / explore later

8. ~~Live data hooks~~ — partially done: the optional live web search layer
   (`src/services/webSearchService.js`) covers ad-hoc "what's the latest on
   X" questions. A structured live feed (e.g. a direct Blockscout API
   integration for token/TVL data, or a price feed) is still open if you
   want numeric live data rather than search-result summaries.
9. **Analytics**
    Lightweight, privacy-respecting usage analytics (e.g. daily active
    sessions, most-asked topics) to understand what people actually want to
    know, and to spot knowledge-base gaps.
10. ~~Shareable answers~~ — partially done: conversations can now be
    exported as a plain-text transcript (`GET /api/conversations/:id/export`).
    A "share via link" feature (public read-only URL for one conversation)
    is still open if that's wanted.
11. **Multi-language support**
    Current scope is English-only by design. If demand shows up from other
    regions, an explicit language toggle (not auto-detection) would keep
    quality controlled — reuse the same knowledge base, translate the
    system-prompt instructions and UI copy.
## Explicitly not planned (unless priorities change)

- Wallet connection / on-chain actions of any kind — Hoodwise is
  informational only, by design.
- Trading signals, price predictions, or anything resembling financial
  advice.
- User accounts / login — the anonymous session model is intentional for
  a low-friction, no-signup experience.
