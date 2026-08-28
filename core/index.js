// @aura/core — the memory store. Shared by the MCP server and the web app.
// Driver: Neon/Postgres via `pg` when DATABASE_URL is set, else embedded PGlite (./data).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createHash, randomBytes } from "node:crypto";
import { embed, toVectorLiteral, EMBEDDING_DIM } from "./embeddings.js";
export { embed, EMBEDDING_DIM };

const HERE = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(HERE, "..", ".env"), quiet: true });

// Single local user until auth (Step 2). user_id is text to match Better Auth's ids.
export const LOCAL_USER_ID = "local-user";

let driver; // { query(sql, params) -> { rows, rowCount }, close() }

export async function getDb() {
  if (driver) return driver;
  if (process.env.DATABASE_URL) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
    driver = { kind: "neon", query: (sql, params) => pool.query(sql, params), exec: (sql) => pool.query(sql), close: () => pool.end() };
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { vector } = await import("@electric-sql/pglite-pgvector");
    const dir = path.join(HERE, "..", "data");
    const db = new PGlite(dir, { extensions: { vector } });
    driver = { kind: "pglite", query: async (s, p) => { const r = await db.query(s, p); return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length }; }, exec: (s) => db.exec(s), close: () => db.close() };
  }
  await migrate(driver);
  return driver;
}

export const SCHEMA_SQL = `
  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE TABLE IF NOT EXISTS spaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    name text NOT NULL,
    UNIQUE (user_id, name)
  );
  CREATE TABLE IF NOT EXISTS memories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    text text NOT NULL,
    embedding vector(${EMBEDDING_DIM}) NOT NULL,
    source text NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS memories_user_idx ON memories (user_id);
  CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories USING hnsw (embedding vector_cosine_ops);
  CREATE TABLE IF NOT EXISTS connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    app_name text NOT NULL,
    token_hash text NOT NULL UNIQUE,          -- sha256 of the token; the token itself is never stored
    allowed_spaces text[],                    -- NULL = all spaces
    can_write boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_used_at timestamptz,
    revoked_at timestamptz
  );
`;
async function migrate(d) { await d.exec(SCHEMA_SQL); }

async function spaceId(d, userId, name) {
  const r = await d.query(
    `INSERT INTO spaces (user_id, name) VALUES ($1, $2)
     ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [userId, name]
  );
  return r.rows[0].id;
}

// Near-duplicate guard: if an existing memory says (almost) the same thing, return it instead of
// stacking a copy. 0.80 cosine similarity ≈ same fact, different wording (paraphrases score 0.82–0.87 with MiniLM; merely related facts ~0.5).
const DEDUP_THRESHOLD = 0.8;

export async function addMemory({ text, space = "personal", source = "user", userId = LOCAL_USER_ID, embedding, dedup = true }) {
  const d = await getDb();
  const sid = await spaceId(d, userId, space);
  const vec = embedding ?? (await embed(text));
  if (dedup) {
    const dup = await d.query(
      `SELECT m.id, m.text, s.name AS space, m.source, m.created_at, 1 - (m.embedding <=> $1::vector) AS similarity
         FROM memories m JOIN spaces s ON s.id = m.space_id
        WHERE m.user_id = $2 ORDER BY m.embedding <=> $1::vector LIMIT 1`,
      [toVectorLiteral(vec), userId]
    );
    const top = dup.rows[0];
    if (top && Number(top.similarity) >= DEDUP_THRESHOLD) return { ...top, similarity: Number(top.similarity), duplicate: true };
  }
  const r = await d.query(
    `INSERT INTO memories (user_id, space_id, text, embedding, source)
     VALUES ($1, $2, $3, $4::vector, $5) RETURNING id, created_at`,
    [userId, sid, text, toVectorLiteral(vec), source]
  );
  return { id: r.rows[0].id, text, space, source, created_at: r.rows[0].created_at };
}

export async function updateMemory({ id, text, userId = LOCAL_USER_ID }) {
  const d = await getDb();
  const vec = await embed(text);
  const r = await d.query(
    `UPDATE memories SET text = $1, embedding = $2::vector, updated_at = now()
      WHERE id = $3 AND user_id = $4 RETURNING id`,
    [text, toVectorLiteral(vec), id, userId]
  );
  return r.rowCount > 0;
}

/** Semantic search: rank by cosine distance (<=>), top-k, optional space filter. */
export async function searchMemory({ query, k = 5, spaces = null, minSimilarity = 0.2, userId = LOCAL_USER_ID }) {
  const d = await getDb();
  const vec = toVectorLiteral(await embed(query));
  const r = await d.query(
    `SELECT m.id, m.text, s.name AS space, m.source, m.created_at,
            1 - (m.embedding <=> $1::vector) AS similarity
       FROM memories m JOIN spaces s ON s.id = m.space_id
      WHERE m.user_id = $2 AND ($3::text[] IS NULL OR s.name = ANY($3::text[]))
      ORDER BY m.embedding <=> $1::vector LIMIT $4`,
    [vec, userId, spaces, k]
  );
  return r.rows.filter((row) => Number(row.similarity) >= minSimilarity).map((row) => ({ ...row, similarity: Number(row.similarity) }));
}

export async function listMemories({ userId = LOCAL_USER_ID } = {}) {
  const d = await getDb();
  const r = await d.query(
    `SELECT m.id, m.text, s.name AS space, m.source, m.created_at
       FROM memories m JOIN spaces s ON s.id = m.space_id
      WHERE m.user_id = $1 ORDER BY m.created_at DESC`, [userId]);
  return r.rows;
}

export async function listSpaces({ userId = LOCAL_USER_ID } = {}) {
  const d = await getDb();
  return (await d.query(`SELECT id, name FROM spaces WHERE user_id = $1 ORDER BY name`, [userId])).rows;
}

export async function deleteMemory(id, userId = LOCAL_USER_ID) {
  const d = await getDb();
  return (await d.query(`DELETE FROM memories WHERE id = $1 AND user_id = $2`, [id, userId])).rowCount > 0;
}

export async function deleteAllMemories(userId) {
  const d = await getDb();
  await d.query(`DELETE FROM memories WHERE user_id = $1`, [userId]);
  await d.query(`DELETE FROM spaces WHERE user_id = $1`, [userId]);
}

// ---------- Connections (per-app access tokens) ----------
// A connection = one app's key to your memory. Token format: aura_<32 random bytes>.
// We store only its hash; a leaked DB doesn't leak tokens. Revoking sets revoked_at.

const hashToken = (t) => createHash("sha256").update(t).digest("hex");

export async function createConnection({ userId, appName, allowedSpaces = null, canWrite = true }) {
  const d = await getDb();
  const token = "aura_" + randomBytes(32).toString("base64url");
  const r = await d.query(
    `INSERT INTO connections (user_id, app_name, token_hash, allowed_spaces, can_write)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
    [userId, appName, hashToken(token), allowedSpaces, canWrite]
  );
  return { id: r.rows[0].id, appName, allowedSpaces, canWrite, token }; // token shown once
}

/** Token -> { userId, allowedSpaces, canWrite, appName } or null if unknown/revoked. */
export async function resolveToken(token) {
  if (!token || !token.startsWith("aura_")) return null;
  const d = await getDb();
  const r = await d.query(
    `UPDATE connections SET last_used_at = now()
      WHERE token_hash = $1 AND revoked_at IS NULL
      RETURNING id, user_id, app_name, allowed_spaces, can_write`,
    [hashToken(token)]
  );
  const c = r.rows[0];
  return c ? { id: c.id, userId: c.user_id, appName: c.app_name, allowedSpaces: c.allowed_spaces, canWrite: c.can_write } : null;
}

export async function listConnections({ userId }) {
  const d = await getDb();
  return (await d.query(
    `SELECT id, app_name, allowed_spaces, can_write, created_at, last_used_at, revoked_at
       FROM connections WHERE user_id = $1 ORDER BY created_at DESC`, [userId])).rows;
}

export async function revokeConnection({ id, userId }) {
  const d = await getDb();
  return (await d.query(`UPDATE connections SET revoked_at = now() WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`, [id, userId])).rowCount > 0;
}

/** Export everything a user owns (Step 6 "you own it"). */
export async function exportAll({ userId }) {
  const d = await getDb();
  const memories = (await d.query(
    `SELECT m.id, m.text, s.name AS space, m.source, m.created_at, m.updated_at
       FROM memories m JOIN spaces s ON s.id = m.space_id WHERE m.user_id = $1 ORDER BY m.created_at`, [userId])).rows;
  const spaces = (await d.query(`SELECT name FROM spaces WHERE user_id = $1 ORDER BY name`, [userId])).rows.map((r) => r.name);
  return { exported_at: new Date().toISOString(), spaces, memories };
}
