import { NextResponse } from "next/server";
import { exportAll } from "@aura/core";
import { getAccess } from "@/lib/access";

// You own your data: GET /api/export downloads everything as JSON. Session only (not app tokens).
export async function GET() {
  const a = await getAccess();
  if (!a || a.appName !== "web") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await exportAll({ userId: a.userId });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="aura-export-${data.exported_at.slice(0, 10)}.json"`,
    },
  });
}
