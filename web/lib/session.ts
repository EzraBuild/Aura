import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Server-side: the signed-in user, or redirect to /login. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session.user;
}
