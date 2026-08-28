"use client";
import { useActionState } from "react";
import { createConnectionAction, type CreateResult } from "./actions";

export function NewConnection({ spaces, mcpPath }: { spaces: string[]; mcpPath: string }) {
  const [result, action, pending] = useActionState<CreateResult | null, FormData>(createConnectionAction, null);

  if (result && "token" in result) {
    return (
      <div className="space-y-3 rounded-xl border border-emerald-300 dark:border-emerald-800 p-4">
        <p className="font-medium">Token for “{result.appName}” — copy it now, it won’t be shown again.</p>
        <code className="block break-all rounded bg-zinc-100 dark:bg-zinc-900 p-2 text-sm">{result.token}</code>
        <details className="text-sm text-zinc-500">
          <summary className="cursor-pointer">How to connect Claude Code</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded bg-zinc-100 dark:bg-zinc-900 p-2 text-xs">
{`claude mcp add aura -e AURA_TOKEN=${result.token} -- node "${mcpPath}"`}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h2 className="font-medium">Connect a new app</h2>
      <input
        name="appName"
        required
        placeholder="App name, e.g. Claude Code, ChatGPT extension"
        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
      />
      <fieldset className="text-sm">
        <legend className="text-zinc-500 mb-1">Spaces it may see (none checked = all)</legend>
        <div className="flex flex-wrap gap-3">
          {spaces.map((s) => (
            <label key={s} className="flex items-center gap-1">
              <input type="checkbox" name="spaces" value={s} /> {s}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="canWrite" defaultChecked /> May add memories (add_memory)
      </label>
      {result && "error" in result && <p className="text-sm text-red-600">{result.error}</p>}
      <button disabled={pending} className="rounded bg-zinc-900 text-white dark:bg-white dark:text-black px-4 py-1 text-sm disabled:opacity-50">
        {pending ? "…" : "Create token"}
      </button>
    </form>
  );
}
