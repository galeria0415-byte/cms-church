import Link from "next/link";
import { connection } from "next/server";

import { getOptionalAuthSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteHeaderShell } from "@/components/layout/site-header-shell";

export async function SiteHeader() {
  await connection();
  const session = await getOptionalAuthSession();
  const settings = await getSiteSettings();

  return (
    <SiteHeaderShell
      isAuthenticated={Boolean(session?.user)}
      name={settings.name}
      tagline={settings.tagline}
      logoUrl={settings.logoUrl}
      enableMemberRegistration={settings.enableMemberRegistration}
    />
  );
}