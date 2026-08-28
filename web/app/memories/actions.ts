"use server";
import { revalidatePath } from "next/cache";
import { addMemory, deleteAllMemories, deleteMemory, updateMemory } from "@aura/core";
import { requireUser } from "@/lib/session";

export async function addMemoryAction(formData: FormData) {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  const space = String(formData.get("space") ?? "personal").trim() || "personal";
  if (text.length < 3) return;
  await addMemory({ text, space, source: "user", userId: user.id });
  revalidatePath("/memories");
}

export async function deleteMemoryAction(formData: FormData) {
  const user = await requireUser();
  await deleteMemory(String(formData.get("id")), user.id);
  revalidatePath("/memories");
}

export async function updateMemoryAction(formData: FormData) {
  const user = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (text.length < 3) return;
  await updateMemory({ id: String(formData.get("id")), text, userId: user.id });
  revalidatePath("/memories");
}

/** Wipe every memory and space. Requires typing DELETE in the form. */
export async function deleteAllAction(formData: FormData) {
  const user = await requireUser();
  if (String(formData.get("confirm")) !== "DELETE") return;
  await deleteAllMemories(user.id);
  revalidatePath("/memories");
}
