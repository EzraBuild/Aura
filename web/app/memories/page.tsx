import Link from "next/link";
import { listMemories, listSpaces } from "@aura/core";
import { requireUser } from "@/lib/session";
import { addMemoryAction, deleteAllAction, deleteMemoryAction } from "./actions";
import { SignOut } from "./sign-out";

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const user = await requireUser();
  const [memories, spaces] = await Promise.all([
    listMemories({ userId: user.id }),
    listSpaces({ userId: user.id }),
  ]);
  const spaceNames = Array.from(new Set(["personal", ...spaces.map((s) => s.name)]));

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">🧠 Your memory</h1>
          <p className="text-sm text-zinc-500">
            {user.email} · {memories.length} memories
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/connections" className="underline">Connected apps</Link>
          <a href="/api/export" className="underline">Export JSON</a>
          <SignOut />
        </div>
      </header>

      <form
        action={addMemoryAction}
        className="space-y-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
      >
        <textarea
          name="text"
          required
          minLength={3}
          rows={2}
          placeholder="Something an AI should know about you, e.g. 'My dog is named Bingo.'"
          className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
        />
        <div className="flex gap-2">
          <input
            name="space"
            list="spaces"
            defaultValue="personal"
            className="rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1 text-sm"
          />
          <datalist id="spaces">
            {spaceNames.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <button className="rounded bg-zinc-900 text-white dark:bg-white dark:text-black px-4 py-1 text-sm">
            Remember
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {memories.length === 0 && (
          <li className="text-sm text-zinc-500">Nothing yet. Add your first memory above.</li>
        )}
        {memories.map((m) => (
          <li
            key={m.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
          >
            <div>
              <p>{m.text}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {m.space} · {m.source} · {new Date(m.created_at).toLocaleDateString()}
              </p>
            </div>
            <form action={deleteMemoryAction}>
              <input type="hidden" name="id" value={m.id} />
              <button className="text-xs text-red-600 hover:underline">delete</button>
            </form>
          </li>
        ))}
      </ul>

      <details className="text-sm text-zinc-500">
        <summary className="cursor-pointer">Danger zone</summary>
        <form action={deleteAllAction} className="mt-2 flex items-center gap-2">
          <input name="confirm" placeholder="type DELETE" className="rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1" />
          <button className="text-red-600 underline">Delete all my memories</button>
        </form>
      </details>
    </main>
  );
}
