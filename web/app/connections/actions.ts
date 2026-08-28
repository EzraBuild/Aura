"use server";
import { revalidatePath } from "next/cache";
import { createConnection, revokeConnection } from "@aura/core";
import { requireUser } from "@/lib/session";

export type CreateResult = { token: string; appName: string } | { error: string };

export async function createConnectionAction(_prev: CreateResult | null, formData: FormData): Promise<CreateResult> {
  const user = await requireUser();
  const appName = String(formData.get("appName") ?? "").trim();
  if (!appName) return { error: "Give the app a name" };
  const picked = formData.getAll("spaces").map(String).filter(Boolean);
  const allowedSpaces = picked.length ? picked : null; // none picked = all spaces
  const canWrite = formData.get("canWrite") === "on";
  const c = await createConnection({ userId: user.id, appName, allowedSpaces, canWrite });
  revalidatePath("/connections");
  return { token: c.token, appName };
}

export async function revokeConnectionAction(formData: FormData) {
  const user = await requireUser();
  await revokeConnection({ id: String(formData.get("id")), userId: user.id });
  revalidatePath("/connections");
}
