"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const input =
  "w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res =
      mode === "in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: email.split("@")[0] });
    setBusy(false);
    if (res.error) {
      setError(res.error.message ?? "Something went wrong");
      return;
    }
    router.push("/memories");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
      >
        <h1 className="text-2xl font-semibold">🧠 Aura</h1>
        <p className="text-sm text-zinc-500">One memory. Every AI knows you.</p>
        <input className={input} type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded bg-zinc-900 text-white dark:bg-white dark:text-black py-2 disabled:opacity-50"
        >
          {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="w-full text-sm text-zinc-500 underline"
        >
          {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
