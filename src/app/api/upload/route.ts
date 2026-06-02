import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { DASHBOARD_ROLES } from "@/lib/permissions";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "pdf", "mp4", "webm", "ogg", "mov"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  await requireRole(DASHBOARD_ROLES);

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds the 10 MB limit." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "File type not allowed. Accepted: jpg, jpeg, png, gif, webp, pdf, mp4, webm, ogg, mov." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const fileName = `${Date.now()}-${safeName}`;
  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch (err) {
    console.error("Upload write error:", err);
    return NextResponse.json({ error: "Failed to save file. Check server write permissions." }, { status: 500 });
  }

  const urlBase = process.env.UPLOAD_URL_BASE ?? "/api/uploads";
  return NextResponse.json({ url: `${urlBase}/${fileName}` });
}