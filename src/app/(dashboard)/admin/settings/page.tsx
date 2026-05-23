import { connection } from "next/server";

import { SiteSettingsForm } from "@/components/forms/site-settings-form";
import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage() {
  await requireRole(DASHBOARD_ROLES);
  await connection();
  const settings = await getSiteSettings();

  return <SiteSettingsForm initialSettings={settings} />;
}
