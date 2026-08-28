// Tiny CLI to manage memories until the web app (Step 2) exists.
//   node cli.js add "My dog is named Bingo" [--space work]
//   node cli.js search "what pets do I have?"
//   node cli.js list
//   node cli.js delete <id>
import { addMemory, searchMemory, listMemories, deleteMemory, getDb, LOCAL_USER_ID } from "@aura/core";
const userId = process.env.AURA_USER_ID || LOCAL_USER_ID;

const [cmd, ...rest] = process.argv.slice(2);
const spaceIdx = rest.indexOf("--space");
const space = spaceIdx >= 0 ? rest.splice(spaceIdx, 2)[1] : "personal";
const arg = rest.join(" ");

switch (cmd) {
  case "add": {
    const m = await addMemory({ text: arg, space, userId });
    console.log(`✔ saved [${m.space}] ${m.text}`);
    break;
  }
  case "search":
    for (const h of await searchMemory({ query: arg, userId })) console.log(`${h.similarity.toFixed(2)}  [${h.space}] ${h.text}`);
    break;
  case "list":
    for (const m of await listMemories({ userId })) console.log(`${m.id}  [${m.space}] ${m.text}`);
    break;
  case "delete":
    console.log((await deleteMemory(arg, userId)) ? "✔ deleted" : "not found");
    break;
  case "claim": {
    // Move the seeded local-user memories to your real account: node cli.js claim <your-user-id>
    const d = await getDb();
    const r = await d.query(`UPDATE memories SET user_id = $1 WHERE user_id = $2`, [arg, LOCAL_USER_ID]);
    await d.query(`UPDATE spaces SET user_id = $1 WHERE user_id = $2 AND name NOT IN (SELECT name FROM spaces WHERE user_id = $1)`, [arg, LOCAL_USER_ID]);
    await d.query(`UPDATE memories m SET space_id = s2.id FROM spaces s1, spaces s2 WHERE m.space_id = s1.id AND s1.user_id = $2 AND s2.user_id = $1 AND s2.name = s1.name`, [arg, LOCAL_USER_ID]);
    await d.query(`DELETE FROM spaces WHERE user_id = $1`, [LOCAL_USER_ID]);
    console.log(`✔ moved ${r.rowCount} memories to ${arg}`);
    break;
  }
  case "whoami": {
    const d = await getDb();
    const r = await d.query(`SELECT id, email FROM "user" ORDER BY "createdAt"`);
    for (const u of r.rows) console.log(`${u.id}  ${u.email}`);
    break;
  }
  default:
    console.log("usage: node cli.js add|search|list|delete|claim <userId>|whoami");
}
await (await getDb()).close();
