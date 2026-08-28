# Aura MCP server

Exposes your personal memory to any MCP-capable AI.

| Tool | Does |
|---|---|
| `search_memory(query, limit)` | Semantic search (pgvector cosine) over your memories |
| `add_memory(text, space)` | Saves a fact; lets the AI grow your memory |

**Stack (local dev, $0, no accounts):** PGlite (embedded Postgres + pgvector, files in `./data`) + local embeddings (all-MiniLM-L6-v2 via transformers.js, cached in `./.models`). Swap to Neon by wiring `DATABASE_URL` in `db.js`.

```
npm test                          # seeds + runs meaning-based search checks
npm run memory -- add "I like tea"
npm run memory -- search "drinks"
npm run memory -- list
```

Registered in Claude Code (project scope = this folder): start `claude` **from this folder**, then ask "what's my dog's name?".

Note: PGlite allows one process at a time. Don't run the CLI while an MCP client has the server open.
