import path from "node:path";
import Link from "next/link";
import { listConnections, listSpaces } from "@aura/core";
import { requireUser } from "@/lib/session";
import { revokeConnectionAction } from "./actions";
import { NewConnection } from "./new-connection";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const user = await requireUser();
  const [connections, spaces] = await Promise.all([
    listConnections({ userId: user.id }),
    listSpaces({ userId: user.id }),
  ]);
  const mcpPath = path.resolve(process.cwd(), "..", "mcp-server", "server.js");

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">🔌 Connected apps</h1>
        <p className="text-sm text-zinc-500">
          Each app gets its own token, sees only the spaces you allow, and can be cut off instantly.{" "}
          <Link href="/memories" className="underline">← memories</Link>
        </p>
      </header>

      <NewConnection spaces={Array.from(new Set(["personal", ...spaces.map((s) => s.name)]))} mcpPath={mcpPath} />

      <ul className="space-y-2">
        {connections.length === 0 && <li className="text-sm text-zinc-500">No apps connected yet.</li>}
        {connections.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div>
              <p className={c.revoked_at ? "line-through text-zinc-400" : ""}>{c.app_name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                sees: {c.allowed_spaces?.join(", ") ?? "all spaces"} · {c.can_write ? "read/write" : "read-only"} · last used:{" "}
                {c.last_used_at ? new Date(c.last_used_at).toLocaleString() : "never"}
                {c.revoked_at && ` · revoked ${new Date(c.revoked_at).toLocaleDateString()}`}
              </p>
            </div>
            {!c.revoked_at && (
              <form action={revokeConnectionAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-red-600 hover:underline">revoke</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
