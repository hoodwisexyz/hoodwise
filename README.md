<p align="center">
  <img src="./public/hoodwise-banner.png" alt="Hoodwise — Your AI guide to Robinhood Chain" width="100%" />
</p>

<p align="center">
  <a href="https://hoodwise.xyz"><strong>Explore Hoodwise ↗</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#the-signal"><strong>The signal</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#under-the-hood"><strong>Under the hood</strong></a>
</p>

<h1 align="center">Chain intelligence, without the noise.</h1>

<p align="center">
  Hoodwise is an independent, source-grounded guide to Robinhood Chain.<br />
  Clear context for the products, infrastructure, ecosystem, and risks that matter.
</p>

<p align="center">
  <a href="https://hoodwise.xyz"><img alt="Launch Hoodwise" src="https://img.shields.io/badge/Launch_Hoodwise-00D97E?style=for-the-badge&logoColor=07120d" /></a>
  <a href="https://github.com/hoodwisexyz/hoodwise/actions"><img alt="Tests" src="https://img.shields.io/github/actions/workflow/status/hoodwisexyz/hoodwise/test.yml?branch=main&style=for-the-badge&label=Product%20checks" /></a>
</p>

<p align="center">
  <img src="./public/hoodwise-signal.svg" alt="Animated Hoodwise signal surface" width="100%" />
</p>

## The signal

Hoodwise turns a fast-moving chain into a briefing you can actually use. Ask a direct question, follow the source links, and stay oriented without digging through a dozen tabs.

| | What Hoodwise makes easier |
| --- | --- |
| **Products** | Stock Tokens, Robinhood Earn, and the practical “what does this mean?” layer. |
| **Infrastructure** | Orbit, Chainlink, DeFi, wallets, access, and how the chain fits together. |
| **Ecosystem** | Agents, experiments, culture, memes, and the trade-offs behind the headline. |
| **Risk context** | A clear distinction between structural facts, current context, and uncertainty. |

> **Independent by design.** Hoodwise is educational, not financial advice, and is not affiliated with Robinhood Markets.

## Built for a better first question

<table>
  <tr>
    <td width="56%" valign="top">
      <h3>Focused answers</h3>
      <p>Start with the signal, not the noise. Hoodwise keeps explanations direct and keeps the important caveats visible.</p>
      <h3>Sources in the flow</h3>
      <p>Relevant answers carry source links so you can go from a quick briefing to primary context without breaking your flow.</p>
    </td>
    <td width="44%" align="center">
      <img src="./public/hoodwise-profile.png" alt="Hoodwise mark" width="220" />
    </td>
  </tr>
</table>

## Under the hood

The product is intentionally simple at the surface and deliberate underneath.

~~~
Question → curated chain context → optional live context → source-grounded answer
~~~

- A curated knowledge layer is the always-on source of truth.
- An optional, scoped live-search layer can supplement questions that are clearly time-sensitive.
- Conversation history is private to each anonymous browser session.
- Responses stream into a polished chat surface, with safe identity handling and source matching built in.

For the fuller product picture, see [CONTEXT.md](./CONTEXT.md), [STATUS.md](./STATUS.md), and [ROADMAP.md](./ROADMAP.md).

## A product, not a black box

| Surface | What it does |
| --- | --- |
| Landing experience | Sets the context, explains coverage, and gives users a confident starting point. |
| Briefing chat | Saves a user’s own conversation history and delivers grounded answers progressively. |
| Source layer | Matches relevant links to help users verify and continue their research. |
| Production baseline | Input validation, rate limiting, safe error handling, health checks, and automated tests. |

---

<details>
<summary><strong>Run Hoodwise locally</strong></summary>

<br />

~~~
npm install
cp .env.example .env
# Add OPENROUTER_API_KEY to .env
npm start
~~~

Open http://localhost:3000, then run npm test for the automated suite. Keep .env private; it is intentionally ignored by Git.
</details>

<details>
<summary><strong>Deploy</strong></summary>

<br />

Railway detects the Node service automatically. Set OPENROUTER_API_KEY, NODE_ENV=production, and PUBLIC_APP_URL in Railway Variables. For persistent conversation history, mount a Railway volume at /data and set DB_PATH=/data/hoodwise.db.
</details>

<p align="center">
  <sub>Hoodwise explains how Robinhood Chain works. It is not affiliated with Robinhood Markets, and nothing here is financial advice.</sub>
</p>