// Re-embed every memory with the current model (run after changing EMBEDDING_MODEL / EMBEDDING_DIM).
//   node core/reembed.js
import { getDb, EMBEDDING_DIM, EMBEDDING_MODEL } from "./index.js";
import { embedMany, toVectorLiteral } from "./embeddings.js";

const d = await getDb();
const cur = await d.query(`SELECT atttypmod AS dim FROM pg_attribute WHERE attrelid = 'memories'::regclass AND attname = 'embedding'`);
if (cur.rows[0]?.dim !== EMBEDDING_DIM) {
  console.log(`column is vector(${cur.rows[0]?.dim}); rebuilding as vector(${EMBEDDING_DIM})`);
  await d.exec(`
    DROP INDEX IF EXISTS memories_embedding_idx;
    ALTER TABLE memories DROP COLUMN embedding;
    ALTER TABLE memories ADD COLUMN embedding vector(${EMBEDDING_DIM});
  `);
}
const rows = (await d.query(`SELECT id, text FROM memories ORDER BY created_at`)).rows;
const vecs = await embedMany(rows.map((r) => r.text));
for (let i = 0; i < rows.length; i++) {
  await d.query(`UPDATE memories SET embedding = $1::vector WHERE id = $2`, [toVectorLiteral(vecs[i]), rows[i].id]);
}
await d.exec(`
  ALTER TABLE memories ALTER COLUMN embedding SET NOT NULL;
  CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories USING hnsw (embedding vector_cosine_ops);
`);
console.log(`re-embedded ${rows.length} memories with ${EMBEDDING_MODEL}`);
await d.close();
