import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // @aura/core lives one level up; make the whole Aura folder the workspace root.
  turbopack: { root: path.join(__dirname, "..") },
  outputFileTracingRoot: path.join(__dirname, ".."),
  // Load these from node_modules at runtime instead of bundling them.
  serverExternalPackages: ["@aura/core", "pg"],
};

export default nextConfig;
