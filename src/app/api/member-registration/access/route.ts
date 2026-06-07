import { NextResponse } from "next/server";

import { getSiteSettings } from "@/lib/site-settings";

export async function POST(request: Request) {
  const settings = await getSiteSettings();

  if (!settings.enableMemberRegistration || !settings.memberRegistrationPasscode) {
    return NextResponse.json({ error: "Member registration is not enabled." }, { status: 403 });
  }

  const body = await request.json();
  const passcode = String(body.passcode ?? "").trim();

  if (!passcode || passcode !== settings.memberRegistrationPasscode) {
    return NextResponse.json({ error: "Invalid registration passcode." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}