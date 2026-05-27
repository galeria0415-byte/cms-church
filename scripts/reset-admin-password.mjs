/**
 * Reset the admin user password.
 * Run from the app root on the server:
 *   node scripts/reset-admin-password.mjs
 *
 * Optionally override via env vars:
 *   RESET_EMAIL=admin@graceharbor.org RESET_PASSWORD=NewPassword1! node scripts/reset-admin-password.mjs
 */

import { createHash, randomBytes } from "crypto";
import { spawnSync } from "child_process";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

// Load .env manually so we don't need dotenv installed
import { promises as fs } from "fs";

async function loadEnv() {
  try {
    const raw = await fs.readFile(path.join(rootDir, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    // .env not found — rely on existing process.env
  }
}

async function main() {
  await loadEnv();

  const targetEmail = process.env.RESET_EMAIL?.trim() || "admin@graceharbor.org";
  const newPassword = process.env.RESET_PASSWORD?.trim() || "ChangeMe123!";

  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set. Make sure .env exists in the app root.");
    process.exit(1);
  }

  // Dynamically import prisma + bcrypt from the app's node_modules
  let prisma, bcrypt;
  try {
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  } catch {
    console.error("ERROR: @prisma/client not found. Run `npm install` first.");
    process.exit(1);
  }
  try {
    bcrypt = require("bcryptjs");
  } catch {
    console.error("ERROR: bcryptjs not found. Run `npm install` first.");
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const user = await prisma.user.update({
      where: { email: targetEmail },
      data: { passwordHash },
      select: { id: true, email: true, role: true },
    });
    console.log(`\nPassword reset successfully for: ${user.email} (role: ${user.role})`);
    console.log(`New password: ${newPassword}`);
    console.log("\nYou can now log in at /login with the credentials above.");
  } catch (err) {
    if (err?.code === "P2025") {
      console.error(`ERROR: No user found with email "${targetEmail}".`);
      console.error("Check the email address or run the seed first: npm run prisma:seed");
    } else {
      console.error("ERROR:", err?.message ?? err);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
