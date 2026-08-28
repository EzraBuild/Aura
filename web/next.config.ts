import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // @aura/core lives one level up; make the whole Aura folder the workspace root.
  turbopack: { root: path.join(__dirname, "..") },
  outputFileTracingRoot: path.join(__dirname, ".."),
  // Native / heavy packages load from node_modules at runtime instead of being bundled.
  serverExternalPackages: [
    "@aura/core",
    "@huggingface/transformers",
    "onnxruntime-node",
    "sharp",
    "pg",
    "@electric-sql/pglite",
    "@electric-sql/pglite-pgvector",
  ],
};

export default nextConfig;
