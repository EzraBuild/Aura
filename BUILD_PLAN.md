# 🧠 Aura — Build Plan

> The *what*, the *how*, and the *in-what-order*. Read `START_HERE.md` first for the map and the tutor method. This is your working reference while you build.

---

## 1. Problem statement

Everyone is starting to use AI every day — but through **many different tools** (ChatGPT, Claude, coding assistants, agents, work apps). Each one starts from **zero knowledge of you**. You re-explain your role, your preferences, your projects, your writing style — over and over, forever. As AI spreads and agents start acting on your behalf, this gets worse, and your context stays **trapped inside each separate app**, owned by them, not you.

## 2. What Aura does (the product)

A **personal memory you own** that any AI can plug into (with permission):
- You store memories: facts, preferences, projects, style, key docs.
- Any connected AI can **retrieve the relevant memories** for a given question and answer as if it already knows you.
- **You control** what each app sees and can revoke access instantly.

**The bet:** the portable "you" layer that travels across every AI is a foundational piece of the AI future — and it's early enough that no one owns it yet.

**Non-goals (keep scope tight):** Aura is not itself a chatbot, not a note-taking app to live in daily, not a team/enterprise tool in v1. It's the **memory + the connector**.

---

## 3. Architecture (all free tier)

```
   ┌─────────────────────────────┐         You manage your memory here
   │   Aura Web App (Next.js)    │◀─────────  add / edit / browse memories,
   │   + Auth                    │            set permissions, export/delete
   └──────────────┬──────────────┘
                  │ read / write
                  ▼
   ┌─────────────────────────────┐
   │  Neon Postgres + pgvector   │   memories stored as text + embedding,
   │  (memories, embeddings,     │   grouped into spaces, with per-app scopes
   │   spaces, app permissions)  │
   └──────────────┬──────────────┘
                  │ retrieval (semantic search)
                  ▼
   ┌─────────────────────────────┐        ┌──────────────────────────────┐
   │   Aura Connector            │        │  Any AI / agent               │
   │   • MCP server (main)       │◀──────▶│  Claude, agents (via MCP),    │
   │     tools: search_memory,   │  reads │  web ChatGPT (via extension)  │
   │             add_memory      │  your  │                               │
   │   • Browser extension /     │  memory│                               │
   │     "insert my context"     │        │                               │
   └─────────────────────────────┘        └──────────────────────────────┘
```

**Why this stack:** MCP is the emerging standard for giving AIs access to external context — building Aura *as* an MCP server means "any MCP-capable AI can use it" for free. pgvector gives semantic retrieval so the AI gets only the *relevant* memory, not a wall of text. Next.js + Vercel + Neon are all free-tier and fast to build on. The browser extension covers AIs that don't speak MCP yet.

---

## 4. Key design decisions (the interesting choices)

- **Retrieve, don't dump.** Never shove the whole memory into the prompt. Embed each memory; on a question, **semantic-search the top-K relevant memories** and hand only those to the AI. Cheaper, faster, and it scales as memory grows. (This is RAG.)
- **MCP first, extension second.** MCP is the future-proof connector and gets you real AIs for free. But today's *web* ChatGPT/Claude don't all speak MCP, so a browser extension (or a copy-paste "insert my context" block) covers the near term. Build MCP in Step 0/3; add the extension in Step 3.
- **Let the AI write memories too.** Expose an `add_memory` tool so an AI can save something you tell it ("remember I'm allergic to X"). This is what makes memory grow effortlessly (Step 5) — the killer of every memory product is that people don't bother adding to it.
- **Spaces + per-app scopes are the trust spine.** A memory belongs to a space (e.g. *personal*, *work*). Each connected app gets a token that grants access to chosen spaces only. Revoking a token cuts an app off instantly. Without this, Aura is creepy; with it, it's trustworthy. (Step 4.)
- **You own it — literally.** One-tap export (all memories as JSON/markdown), one-tap delete-everything, and a self-host path. The differentiator vs "AI company remembers you" is that *you* hold the data.

---

## 5. Data model (start tiny)

```
users        id, email, ...
spaces       id, user_id, name            -- e.g. "personal", "work"
memories     id, user_id, space_id,
             text,                         -- the memory itself
             embedding vector(N),          -- for semantic search
             source,                       -- typed by user / added by AI / imported
             created_at, updated_at
connections  id, user_id, app_name,
             token_hash,                   -- the app's access token (store the hash)
             allowed_space_ids,            -- what this app may read
             created_at, revoked_at
```

Retrieval query (concept): embed the incoming question → `SELECT ... ORDER BY embedding <=> :q LIMIT k` filtered to the spaces the calling connection is allowed to see.

---

## 6. Connector surface (v1)

**MCP tools:**
| Tool | Does |
|---|---|
| `search_memory(query)` | Returns the top relevant memories for a query (within allowed spaces) |
| `add_memory(text, space?)` | Saves a new memory (lets the AI grow your memory) |

**Web app APIs:** standard CRUD for memories, spaces, and connections (create/revoke tokens).

**Browser extension:** a button in the chat box that fetches relevant context (or your profile) and inserts it into the prompt — for AIs that don't speak MCP.

---

## 7. Milestones (these ARE your Steps in START_HERE.md)

- **M0 — The spike.** Minimal MCP server with `search_memory` (can be hardcoded to one fact at first) → connect to an AI client → the AI answers using a fact only Aura knows. ✅ AI says "Bingo" because Aura told it.
- **M1 — Store & retrieve.** Neon + pgvector; add memories; embed; semantic search returns the right ones. ✅ meaning-based query finds the right memory.
- **M2 — Web app.** Auth + add/edit/browse memories + profile view. ✅ you manage your memory as *you*, logged in.
- **M3 — Real connectors.** Harden MCP (`search_memory` + `add_memory`) + browser extension / insert-context. ✅ two different AIs use your memory.
- **M4 — Permissions & spaces.** Spaces + per-connection scopes + revoke. ✅ an app sees only allowed memories; revoke works.
- **M5 — Effortless capture.** Quick-capture, "remember this," AI-written memories, dedup. ✅ adding memory is one tap; it grows.
- **M6 — Privacy & ship.** Export, delete-all, encryption, deploy, optional self-host. ✅ live; full export/wipe on demand.

---

## 8. Edge cases & gotchas (don't let these surprise you)

- **Stale / contradictory memories.** "I live in Addis" then later "I moved to Nairobi." Let memories be edited/superseded; prefer recent; let the user pin/correct. Don't blindly stack conflicting facts.
- **Bad retrieval = broken magic.** If `search_memory` returns junk, the AI answers wrong and trust dies. Tune top-K, thresholds, and test with real questions early.
- **Prompt-injection through memory.** A memory (or an imported doc) could contain "ignore your instructions." Treat memory as *data*, label it clearly to the AI, and never let it override the AI's safety. Real security lesson.
- **Privacy is the whole promise.** A leaked token that reads someone's entire life is catastrophic. Hash tokens, scope them, allow revoke, encrypt sensitive fields. Don't cut corners here.
- **Empty-memory cold start.** New users have nothing stored, so the magic doesn't show. Seed with a 60-second "tell me about yourself" onboarding that writes the first memories.
- **Getting people to add memory.** The #1 killer of memory products. That's why `add_memory` + effortless capture (Step 5) matter — design for growth, not a one-time dump.
- **MCP is young.** The spec and client support are evolving; expect rough edges and keep the extension path as a fallback so you're never blocked.

---

## 9. Cost model

| Piece | Tier | Cost |
|---|---|---|
| Next.js hosting | Vercel free | $0 |
| Neon Postgres + pgvector | Free plan | $0 at this scale |
| Embeddings | pay-per-call, once per memory | pennies |
| MCP server | runs as a small service / function | $0 free tier |
| Browser extension | just code | $0 |

**Total: ~free** to build and run at personal scale.

---

## 10. Why this is defensible (not a weekend clone)

- **Standard + timing:** building on MCP early puts you where the ecosystem is heading, before it's crowded.
- **Data gravity:** the more a user feeds Aura, the more painful it is to leave — memory compounds.
- **Trust:** "you own it, you control it, you can leave with it" is a real wedge against AI companies that lock your context inside their product.
- **Network of connectors:** every AI/app you support makes Aura more useful — a moat that grows.

---

## 11. What to read when
- **Whole journey / why:** START_HERE.md.
- **MCP setup:** the Model Context Protocol docs (Claude will point you to the exact pages at Step 0).
- **Each step's concept:** ask Claude with the tutor opener in START_HERE.md.

*Start at M0. Make one AI answer using a fact only Aura knows — everything good follows from that.*
