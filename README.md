# 🧠 Aura — one memory, every AI knows you

npm workspace with three packages:

| Package | What |
|---|---|
| `core/` | `@aura/core` — memory store: Neon Postgres + pgvector, embeddings via Vercel AI Gateway, `addMemory` / `searchMemory` / … |
| `mcp-server/` | MCP server (stdio) exposing `search_memory` + `add_memory` to any MCP-capable AI |
| `web/` | Next.js app — Better Auth sign-in, manage memories, connected apps (tokens/scopes/revoke), export, delete-all, JSON API |
| `extension/` | Chrome extension (MV3) — 🧠 button inserts your context into ChatGPT/Claude/Gemini web chats; right-click "Remember in Aura" |

## Run
```
npm install                # once, at the root
npm run dev                # web app → http://localhost:3100 (see web/.env.local)
npm run test               # semantic-search acceptance test
npm run memory -w mcp-server -- list|add|search|delete|claim|whoami
```
Secrets live in `.env` (root: `DATABASE_URL`, `AI_GATEWAY_API_KEY`, `AURA_TOKEN`) and `web/.env.local` (`BETTER_AUTH_*`). Both are git-ignored; see the `.env.example` files.

## Deploy
Production runs on Vercel (project `aura`, root directory `web`): https://aura-alpha-eosin.vercel.app. `vercel deploy --prod` from the repo root. Embeddings use AI Gateway with automatic OIDC auth on Vercel, so only `DATABASE_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are needed as project env vars.

## Connect an AI
**Every connection is a token** made on the web app's *Connected apps* page. A token is tied to your account, limited to the spaces you tick, optionally read-only, and can be revoked instantly. Only its hash is stored.

- **MCP (Claude Code, Claude Desktop, Cursor…):** `claude mcp add aura -e AURA_TOKEN=aura_… -- node "<abs path>/mcp-server/server.js"` (the Connections page prints this for you). Dev fallback with no token: `AURA_USER_ID` in `.env`, else the seeded local user.
- **Web chats (no MCP):** load `extension/` in Chrome (`chrome://extensions` → Developer mode → Load unpacked), click the icon, paste your Aura URL + token. On chatgpt.com / claude.ai / gemini, the 🧠 button inserts relevant memories into your draft. Select text anywhere → right-click → *Remember in Aura*.
- **Your own code:** `GET /api/memories?q=…` / `POST /api/memories` with `Authorization: Bearer aura_…`.

## Own your data
Export JSON and *Delete all* live on the memories page. `add_memory` dedups paraphrases (cosine ≥ 0.80).

Progress: Steps 0–6 done. See `START_HERE.md` / `BUILD_PLAN.md`.
