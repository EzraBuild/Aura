import { NextResponse } from "next/server";
import { addMemory, listMemories, searchMemory } from "@aura/core";
import { getAccess } from "@/lib/access";

// JSON API for memories. Auth: browser session cookie, or `Authorization: Bearer aura_…`
// (a connection token — scoped to allowed spaces). Used by the browser extension.
//   GET  /api/memories            -> all memories (in allowed spaces)
//   GET  /api/memories?q=pets     -> semantic search
//   POST /api/memories {text, space?} -> add

export async function GET(req: Request) {
  const a = await getAccess();
  if (!a) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q");
  let memories = q
    ? await searchMemory({ query: q, userId: a.userId, spaces: a.allowedSpaces })
    : await listMemories({ userId: a.userId });
  if (!q && a.allowedSpaces) memories = memories.filter((m) => a.allowedSpaces!.includes(m.space));
  return NextResponse.json({ memories });
}

export async function POST(req: Request) {
  const a = await getAccess();
  if (!a) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!a.canWrite) return NextResponse.json({ error: "read-only connection" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "").trim();
  const space = String(body.space || "personal");
  if (text.length < 3) return NextResponse.json({ error: "text too short" }, { status: 400 });
  if (a.allowedSpaces && !a.allowedSpaces.includes(space)) {
    return NextResponse.json({ error: `may only write to: ${a.allowedSpaces.join(", ")}` }, { status: 403 });
  }
  const source = a.appName === "web" ? "user" : "ai";
  const memory = await addMemory({ text, space, source, userId: a.userId });
  return NextResponse.json({ memory }, { status: 201 });
}
