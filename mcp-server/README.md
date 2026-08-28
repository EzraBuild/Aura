# Aura MCP server

Exposes your personal memory to any MCP-capable AI.

| Tool | Does |
|---|---|
| `search_memory(query, limit)` | Semantic search (pgvector cosine) over your memories |
| `add_memory(text, space)` | Saves a fact; lets the AI grow your memory |

**Stack:** Neon Postgres + pgvector, embeddings via Vercel AI Gateway (`openai/text-embedding-3-small`). Config comes from the root `.env` (`DATABASE_URL`, `AI_GATEWAY_API_KEY`, `AURA_TOKEN`).

```
npm test                          # seeds + runs meaning-based search checks
npm run memory -- add "I like tea"
npm run memory -- search "drinks"
npm run memory -- list
```

Registered in Claude Code (project scope = this folder): start `claude` **from this folder**, then ask "what's my dog's name?".
