import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { CONTENT_MANAGER_ROLES, DASHBOARD_ROLES } from "@/lib/permissions";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";

const siteSettingsSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().min(2),
  description: z.string().min(2),
  heroHeadline: z.string().min(2),
  heroBadge: z.string().min(2),
  address: z.string().min(2),
  phone: z.string().min(2),
  email: z.string().email(),
  logoUrl: z.string().optional().default(""),
  faviconUrl: z.string().optional().default(""),
  memberIdPrefix: z.string().trim().min(1).max(12),
  enableMemberRegistration: z.boolean().default(false),
  memberRegistrationPasscode: z.string().trim().max(64).default(""),
}).superRefine((data, ctx) => {
  if (data.enableMemberRegistration && !data.memberRegistrationPasscode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["memberRegistrationPasscode"],
      message: "Enter a registration passcode before enabling public member registration.",
    });
  }
});

export async function GET() {
  await requireRole(DASHBOARD_ROLES);
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  await requireRole(CONTENT_MANAGER_ROLES);
  const body = await request.json();
  const parsed = siteSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid site settings." }, { status: 400 });
  }

  const settings = await saveSiteSettings(parsed.data);

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/ministries");
  revalidatePath("/events");
  revalidatePath("/programs");
  revalidatePath("/gallery");
  revalidatePath("/updates");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  revalidatePath("/login");
  revalidatePath("/register/member");

  return NextResponse.json({ settings });
}
