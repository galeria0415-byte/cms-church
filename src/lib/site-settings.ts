import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { siteConfig, type SiteConfig } from "@/lib/site";

const settingsDir = path.join(process.cwd(), "data");
const settingsPath = path.join(settingsDir, "site-settings.json");

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSettings(value: unknown): SiteConfig {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    ...siteConfig,
    name: normalizeString(input.name) || siteConfig.name,
    tagline: normalizeString(input.tagline) || siteConfig.tagline,
    description: normalizeString(input.description) || siteConfig.description,
    heroHeadline: normalizeString(input.heroHeadline) || siteConfig.heroHeadline,
    heroBadge: normalizeString(input.heroBadge) || siteConfig.heroBadge,
    address: normalizeString(input.address) || siteConfig.address,
    phone: normalizeString(input.phone) || siteConfig.phone,
    email: normalizeString(input.email) || siteConfig.email,
    logoUrl: normalizeString(input.logoUrl),
  };
}

export async function getSiteSettings() {
  try {
    const content = await readFile(settingsPath, "utf8");
    return normalizeSettings(JSON.parse(content));
  } catch {
    return siteConfig;
  }
}

export async function saveSiteSettings(input: Partial<SiteConfig>) {
  const settings = normalizeSettings(input);

  await mkdir(settingsDir, { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");

  return settings;
}
