import { headers } from "next/headers";
import { resolveToken, type Access } from "@aura/core";
import { auth } from "./auth";

/**
 * Who is calling an API route? Either a signed-in browser session (cookie) — full access —
 * or an app holding a connection token (`Authorization: Bearer aura_…`) — scoped access.
 */
export async function getAccess(): Promise<Access | null> {
  const h = await headers();
  const bearer = h.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer) return resolveToken(bearer);
  const session = await auth.api.getSession({ headers: h });
  if (!session) return null;
  return { id: "session", userId: session.user.id, appName: "web", allowedSpaces: null, canWrite: true };
}
