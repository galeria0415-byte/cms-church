import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const rootDir = process.cwd();
const artifactDir = path.join(rootDir, ".deploy", "cpanel");
const standaloneDir = path.join(rootDir, ".next", "standalone");
const standaloneStaticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const manifestName = ".cpanel-deploy-manifest.json";

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(sourceDir, destinationDir) {
  await fs.mkdir(destinationDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyDir(sourcePath, destinationPath);
      continue;
    }

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }
}

async function collectFiles(currentDir, relativeDir = "") {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDir, entry.name);
    const absolutePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, relativePath)));
      continue;
    }

    files.push({ absolutePath, relativePath });
  }

  return files;
}

async function sha1(filePath) {
  const content = await fs.readFile(filePath);
  return createHash("sha1").update(content).digest("hex");
}

async function main() {
  if (!(await exists(standaloneDir))) {
    throw new Error("Missing .next/standalone. Run npm run build before npm run build:artifact.");
  }

  await fs.rm(artifactDir, { recursive: true, force: true });
  await copyDir(standaloneDir, artifactDir);

  if (await exists(publicDir)) {
    await copyDir(publicDir, path.join(artifactDir, "public"));
  }

  if (await exists(standaloneStaticDir)) {
    await copyDir(standaloneStaticDir, path.join(artifactDir, ".next", "static"));
  }

  if (await exists(dataDir)) {
    await copyDir(dataDir, path.join(artifactDir, "data"));
  } else {
    await fs.mkdir(path.join(artifactDir, "data"), { recursive: true });
  }

  await fs.mkdir(path.join(artifactDir, "public", "uploads"), { recursive: true });
  await fs.writeFile(path.join(artifactDir, "app.js"), 'require("./server.js");\n', "utf8");

  const manifestPath = path.join(artifactDir, manifestName);
  const files = await collectFiles(artifactDir);
  const manifestFiles = {};

  for (const file of files) {
    if (file.relativePath === manifestName) {
      continue;
    }

    const stats = await fs.stat(file.absolutePath);
    manifestFiles[file.relativePath] = {
      sha1: await sha1(file.absolutePath),
      size: stats.size,
    };
  }

  await fs.writeFile(
    manifestPath,
    `${JSON.stringify({ version: 1, createdAt: new Date().toISOString(), files: manifestFiles }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Prepared standalone deploy artifact at ${artifactDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});