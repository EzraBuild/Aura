import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Better Auth owns its own tables (user, session, account, verification) in the same Neon DB.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }),
  emailAndPassword: { enabled: true },
});
