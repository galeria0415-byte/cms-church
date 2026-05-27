/**
 * Reset the admin user password to the seeded default.
 * Run from the app root on the server:
 *   node scripts/reset-admin-password.mjs
 *
 * To target a different account:
 *   RESET_EMAIL=other@example.com node scripts/reset-admin-password.mjs
 *
 * To set a custom password, supply a pre-computed bcrypt hash
 * (generate locally: node -e 'require("./node_modules/bcryptjs").hash("YourPass",12).then(console.log)'):
 *   RESET_HASH='$2b$12$...' node scripts/reset-admin-password.mjs
 */

import { promises as fs } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const require = createRequire(path.join(rootDir, "package.json"));

// Pre-computed bcrypt hash for "ChangeMe123!" (rounds=12) — no bcryptjs needed at runtime.
const DEFAULT_PASSWORD = "ChangeMe123!";
const DEFAULT_HASH = "$2b$12$PjLG5KRfeAcwoxTtzF8FUOFfu41Rlf7b3KXdl5Nfbb9BBgIEfWpXy";

async function loadEnv() {
  try {
    const raw = await fs.readFile(path.join(rootDir, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {}
}

async function main() {
  await loadEnv();
  const targetEmail = process.env.RESET_EMAIL?.trim() || "admin@graceharbor.org";
  const passwordHash = process.env.RESET_HASH?.trim() || DEFAULT_HASH;
  const isDefault = !process.env.RESET_HASH;

  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set. Make sure .env exists in the app root.");
    process.exit(1);
  }

  let prisma;
  try {
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  } catch {
    console.error("ERROR: @prisma/client not found.");
    process.exit(1);
  }

  try {
    const updated = await prisma.$executeRaw`UPDATE User SET passwordHash = ${passwordHash} WHERE email = ${targetEmail}`;
    if (updated === 0) {
      console.error(`ERROR: No user found with email "${targetEmail}".`);
      process.exit(1);
    }
    console.log(`\nPassword reset successfully for: ${targetEmail}`);
    if (isDefault) console.log(`New password: ${DEFAULT_PASSWORD}`);
    console.log("\nYou can now log in at /login.");
  } catch (err) {
    console.error("ERROR:", err?.message ?? err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
