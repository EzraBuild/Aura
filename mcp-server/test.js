// Step 1 acceptance test: a meaning-based query finds the right memory.
import { addMemory, searchMemory, listMemories } from "@aura/core";

if ((await listMemories()).length === 0) {
  console.log("Seeding memories…");
  for (const text of [
    "My dog is named Bingo.",
    "I'm building Aura: a personal memory that any AI can plug into.",
    "I prefer short, direct answers with code examples.",
    "I live in Addis Ababa.",
  ]) await addMemory({ text });
}

for (const q of ["what pets do I have?", "where do I live?", "how should you write answers for me?"]) {
  const hits = await searchMemory({ query: q, k: 3 });
  console.log(`\nQ: ${q}`);
  for (const h of hits) console.log(`  ${h.similarity.toFixed(3)}  ${h.text}`);
}
