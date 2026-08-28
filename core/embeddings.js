// Embeddings: turn text into a vector so we can search by *meaning*.
// One hosted model everywhere (web app, MCP server, scripts) via Vercel AI Gateway, so every
// vector lives in the same space. Auth: on Vercel it's automatic (OIDC); locally use
// AI_GATEWAY_API_KEY in .env (or VERCEL_OIDC_TOKEN from `vercel env pull`).

import { embed as aiEmbed, embedMany as aiEmbedMany } from "ai";

export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

/** @returns {Promise<number[]>} */
export async function embed(text) {
  const { embedding } = await aiEmbed({ model: EMBEDDING_MODEL, value: text });
  return embedding;
}

/** @returns {Promise<number[][]>} */
export async function embedMany(texts) {
  if (texts.length === 0) return [];
  const { embeddings } = await aiEmbedMany({ model: EMBEDDING_MODEL, values: texts });
  return embeddings;
}

/** Postgres vector literal: '[0.1,0.2,...]' */
export const toVectorLiteral = (v) => `[${v.join(",")}]`;
