// Embeddings: turn text into a vector of numbers so we can search by *meaning*.
// Uses a small local model (all-MiniLM-L6-v2, 384 dims) via transformers.js —
// no API key, $0, runs on your machine. Swap for a hosted model later by
// changing only this file (keep EMBEDDING_DIM in sync with the DB column).

import { pipeline, env } from "@huggingface/transformers";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
env.cacheDir = path.join(HERE, "..", ".models");

export const EMBEDDING_DIM = 384;

let extractor; // lazily loaded, cached across calls
async function getExtractor() {
  extractor ??= await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  return extractor;
}

/** @returns {Promise<number[]>} unit-length vector, so cosine distance is meaningful */
export async function embed(text) {
  const ex = await getExtractor();
  const out = await ex(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

/** Postgres vector literal: '[0.1,0.2,...]' */
export const toVectorLiteral = (v) => `[${v.join(",")}]`;
