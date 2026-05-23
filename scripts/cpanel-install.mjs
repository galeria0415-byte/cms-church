import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import readline from "readline";
import { stdin as input, stdout as output, version as nodeVersion } from "process";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");
const uploadsPath = path.join(rootDir, "public", "uploads");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function maskConnectionPassword(url) {
  return url.replace(/:(.*?)@/, ":****@");
}

function askQuestion(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function getMajorNodeVersion() {
  const match = /^v(\d+)/.exec(nodeVersion);
  return match ? Number(match[1]) : 0;
}

async function fileExists(filePath) {
  try {
    await fs.readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const nodeMajor = getMajorNodeVersion();

    if (nodeMajor < 18) {
      console.error(`Detected Node.js ${nodeVersion}. This app requires Node.js 18+ and is tested on Node.js 20+.`);
      console.error("In cPanel, switch the Node.js app version to 20.x, restart the shell, and run the installer again.");
      process.exit(1);
    }

    const hasExistingEnv = await fileExists(envPath);
    const nonInteractive = process.env.CPANEL_INSTALL_NON_INTERACTIVE === "1";
    let overwrite = true;

    if (hasExistingEnv && !nonInteractive) {
      const answer = (await askQuestion(rl, "An .env file already exists. Overwrite it? (y/N): ")).trim().toLowerCase();
      overwrite = answer === "y" || answer === "yes";
    }

    let existingEnv = "";
    if (!overwrite && hasExistingEnv) {
      existingEnv = await fs.readFile(envPath, "utf8");
    }

    const appUrl = nonInteractive
      ? (process.env.CPANEL_APP_URL?.trim() || "https://your-domain.com")
      : (await askQuestion(rl, "Application URL [https://your-domain.com]: ")).trim() || "https://your-domain.com";
    const dbHost = nonInteractive
      ? (process.env.CPANEL_DB_HOST?.trim() || "localhost")
      : (await askQuestion(rl, "MySQL host [localhost]: ")).trim() || "localhost";
    const dbPort = nonInteractive
      ? (process.env.CPANEL_DB_PORT?.trim() || "3306")
      : (await askQuestion(rl, "MySQL port [3306]: ")).trim() || "3306";
    const dbName = nonInteractive
      ? (process.env.CPANEL_DB_NAME?.trim() || "")
      : (await askQuestion(rl, "MySQL database name: ")).trim();
    const dbUser = nonInteractive
      ? (process.env.CPANEL_DB_USER?.trim() || "")
      : (await askQuestion(rl, "MySQL username: ")).trim();
    const dbPassword = nonInteractive
      ? (process.env.CPANEL_DB_PASSWORD?.trim() || "")
      : (await askQuestion(rl, "MySQL password: ")).trim();

    if (!dbName || !dbUser) {
      console.error("Database name and username are required.");
      process.exit(1);
    }

    const shouldSeed = nonInteractive
      ? process.env.CPANEL_SEED !== "0"
      : ["y", "yes", ""].includes((await askQuestion(rl, "Seed sample data? (Y/n): ")).trim().toLowerCase());
    const shouldBuild = nonInteractive
      ? process.env.CPANEL_BUILD !== "0"
      : ["y", "yes", ""].includes((await askQuestion(rl, "Build production bundle now? (Y/n): ")).trim().toLowerCase());
    const nextAuthSecret = process.env.CPANEL_NEXTAUTH_SECRET?.trim() || randomBytes(32).toString("hex");
    const databaseUrl = `mysql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`;

    const envContents = [
      `DATABASE_URL="${databaseUrl}"`,
      `NEXTAUTH_URL="${appUrl}"`,
      `NEXTAUTH_SECRET="${nextAuthSecret}"`,
    ].join("\n");

    if (overwrite || !hasExistingEnv) {
      await fs.writeFile(envPath, `${envContents}\n`, "utf8");
      console.log(`Wrote ${envPath}`);
    } else {
      console.log("Keeping existing .env file.");
      console.log(existingEnv);
    }

    await fs.mkdir(uploadsPath, { recursive: true });
    console.log(`Ensured upload directory exists: ${uploadsPath}`);
    console.log(`Using database: ${maskConnectionPassword(databaseUrl)}`);

    run(npxCommand, ["prisma", "generate"]);
    run(npxCommand, ["prisma", "db", "push"]);

    if (shouldSeed) {
      run(npmCommand, ["run", "prisma:seed"]);
    }

    if (shouldBuild) {
      run(npmCommand, ["run", "build"]);
    }

    console.log("\nInstallation completed.");
    console.log("Next steps:");
    console.log("1. In cPanel, set the application startup file or command for your Node.js app.");
    console.log("2. Restart the Node.js application from cPanel.");
    console.log("3. Visit /login and sign in with the seeded admin account if you enabled sample data.");
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
