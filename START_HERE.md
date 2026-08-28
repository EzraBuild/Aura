# 🧠 Aura — Start Here

> **One memory. Every AI knows you.**
> Keep one personal memory that you own. Any AI or agent you use plugs into it — with your permission — and instantly knows who you are, what you like, and what you're working on. No more re-explaining yourself in every new tool.

---

## 👋 Read this first

This folder is **your project**. You build Aura **yourself** — hands on keyboard. Claude is your **tutor, not your ghost-writer**: you read, you build each piece, and when stuck you ask *how* and *why*, not "write it all for me."

### Why this is a bet on the *future* (not another basic app)
The whole world is moving toward everyone using AI every day — through dozens of apps and agents. Today, **none of those AIs know you**; you repeat your context every single time. Whoever owns the **portable "you" layer** — the memory that travels *with* you across every AI — sits in the middle of the entire AI future. And it's **early**: the standard for connecting AIs to outside context (**MCP**) is brand new. You're building on the frontier, not in a crowded field.

### Why it can be **simple + cheap**
At its core Aura is just **a memory store + a connector**. No telephony, no heavy training, no big infrastructure. Free tiers the whole way. The cleverness is in the *idea and the wiring*, not in expensive machinery.

### The documents in this folder
| File | What it is | When to read it |
|---|---|---|
| **START_HERE.md** (this file) | The map, the learning path, the tutor method | Now, and every session |
| **BUILD_PLAN.md** | Architecture, the free stack, milestones M0→M6, edge cases | Your main working doc |

---

## 🎯 What we're building (the 30-second version)

- You keep a **personal memory** in Aura: facts about you, preferences, your projects, how you like answers written, important docs.
- You connect Aura to an AI (Claude, an agent, etc.). When you ask that AI something, it can **pull the relevant bits of your memory** and answer like it already knows you.
- **You own the memory.** You decide what each connected app can see, and you can cut off access anytime.
- The magic moment: you tell a *brand-new* AI nothing about yourself, and it still answers perfectly — because it read your Aura.

**Platform:** a web app (to manage your memory) + a **connector** (an MCP server, and later a browser extension) that lets any AI read it. Runs on free tiers.

---

## 🧠 The big ideas you'll learn (this is the "why")

1. **MCP (Model Context Protocol) — the future standard.** It's the new, standard way an AI app reaches out to an external source for context or tools. Aura is an MCP server that exposes *your memory* to any AI that speaks MCP. Learning MCP now is learning the plumbing of the whole agent era.
2. **Embeddings + retrieval (RAG).** You don't dump your entire life into the prompt — you store memories as vectors and **fetch only the relevant ones** for each question. Same core skill as `unique_idea.md` #1, aimed at a bigger idea.
3. **Permissions & scopes.** Personal memory is sensitive. You'll learn to let a "work" AI see only work stuff, revoke an app's access, and keep spaces separate. This is what makes it trustworthy, not creepy.
4. **Own-your-data / privacy architecture.** Export, delete, self-host, encrypt. The pitch *is* "you own it" — so the engineering has to back that up.
5. **Meeting the user where they are.** Not every AI speaks MCP yet, so you'll also build a **browser extension / copy-paste** path so it works with today's web chats too.

⚠️ **The one make-or-break thing:** getting a real AI to actually *read your memory through a connector*. Everything else is a normal web app. That's why **Step 0 is just: make one AI answer using a fact that lives only in Aura.** Prove the magic first.

---

## 🪜 Your build path (learn one layer at a time)

Follow in order. Each maps to a milestone in BUILD_PLAN.md. Finish each "✅ Done when" before moving on.

### Step 0 — The spike *(prove an AI can read your memory)*
**Goal:** stand up the tiniest MCP server with one tool, `search_memory`, connect it to a real AI client, and store a fact the AI can't otherwise know (*"my dog's name is Bingo"*). Ask the AI — it answers correctly by calling your tool.
**You'll learn:** what MCP is, how an AI calls an external tool.
**✅ Done when:** an AI tells you a fact it could only have gotten from Aura.
👉 *Most important step. If this works, the whole product is real.*

### Step 1 — Store & retrieve memories
**Goal:** a database of memories; add one; **semantic search** returns the most relevant ones for a query (embeddings + vector search).
**You'll learn:** Postgres + pgvector, embeddings, cosine similarity, ranking.
**✅ Done when:** asking *"what pets do I have?"* returns the dog memory even without the word "pet."

### Step 2 — The web app (manage your memory)
**Goal:** sign in, add/edit/delete memories, browse them, see your "profile."
**You'll learn:** Next.js, auth, forms, listing/editing data.
**✅ Done when:** you can manage your whole memory in a clean UI, logged in as you.

### Step 3 — Real connectors
**Goal:** harden the MCP server (`search_memory` + `add_memory`) and add a **browser extension / "insert my context" button** for web chats that don't speak MCP yet.
**You'll learn:** MCP tools/auth, browser extension basics.
**✅ Done when:** **two different** AIs (one via MCP, one via the extension) both answer using your memory.

### Step 4 — Permissions & spaces
**Goal:** control what each connected app sees — e.g. a "work" space vs "personal" — and revoke access.
**You'll learn:** scopes, per-connection access rules, tokens.
**✅ Done when:** a connected app can only see the memories you allowed, and revoking cuts it off immediately.

### Step 5 — Effortless capture (the sticky magic)
**Goal:** make *adding* memory frictionless — a quick-capture button, "remember this" from a chat, simple import — so your memory actually grows.
**You'll learn:** capture UX, dedup, letting the AI itself write memories via `add_memory`.
**✅ Done when:** adding a new memory takes one tap, and your memory noticeably grows with use.

### Step 6 — Privacy, own-your-data & ship
**Goal:** export everything, delete everything, encryption, (optional) self-host, deploy.
**You'll learn:** data export, encryption at rest, deployment, env vars.
**✅ Done when:** the full flow is live and you can export or wipe all your data on demand.

---

## 🤝 How to work with Claude (the tutor method)

You drive, Claude coaches.

**✅ Good asks:**
- *"Explain what an MCP server actually is and how a client calls its tools, then let me build the smallest one myself and report back."*
- *"Here's my `search_memory` — it returns unrelated memories. Why, and how should I think about fixing the ranking?"*
- *"I'm on Step 1. Walk me through pgvector one step at a time and wait for me to confirm each works."*
- *"Review my permissions logic — don't rewrite it, tell me the hole and what to learn."*
- *"Quiz me: why do we retrieve only relevant memories instead of sending them all?"*

**🚫 Avoid:** *"Build the whole thing."*

**Paste-able session opener:**
> "I'm building Aura (see START_HERE.md). I'm on **Step [N]**. Teach me this step interactively: explain the concept first, give me the smallest next task to do myself, wait for me to run it and report back, then continue. Correct my mistakes and tell me the *why*. Don't write large chunks of code for me unless I ask for a specific snippet."

**When stuck:** paste the exact error + what you tried + what you expected, and ask *"what concept am I missing?"* first.

---

## 🧰 Tech you'll touch (so the words aren't scary)

| Thing | In plain words | Used in |
|---|---|---|
| **MCP** | The standard way an AI reaches an outside source for context/tools | Steps 0, 3 |
| **Next.js on Vercel** | The website + API, hosted free | Steps 2+ |
| **Neon Postgres + pgvector** | Free cloud DB that also searches by meaning | Steps 1+ |
| **Embeddings** | Turning a memory into numbers so you can search by meaning | Step 1 |
| **Auth** | Logging in so your memory is *yours* | Step 2 |
| **Browser extension** | Injects your context into web chats that don't speak MCP yet | Step 3 |
| **Scopes / tokens** | Deciding what each connected app is allowed to see | Step 4 |

Don't learn these up front — pick each up when its step needs it.

---

## ✅ Before you start — tiny checklist
- [ ] Skim **BUILD_PLAN.md** once, top to bottom, to see the whole journey.
- [ ] Make free accounts: **Neon**, **Vercel**. (An AI client that supports MCP for testing — Claude Desktop works.)
- [ ] Start **Step 0**. Ask Claude to teach it interactively.

---

## 🗺️ Quick reference
- **What / why?** → this file, top.
- **Architecture, stack, milestones, edge cases?** → `BUILD_PLAN.md`.
- **What next & how?** → `BUILD_PLAN.md` milestones = your steps.
- **Stuck / need a concept?** → ask Claude with the tutor method.

---

*You've got this. Start with Step 0 — make one AI answer using a fact that lives only in Aura, and the future you're betting on becomes real on your screen.* 🧠
