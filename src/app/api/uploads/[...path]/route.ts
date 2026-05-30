import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

type Params = Promise<{ path: string[] }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { path: parts } = await params;

  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "public", "uploads");

  // Prevent directory traversal
  const filePath = path.resolve(path.join(uploadDir, ...parts));
  if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = parts[parts.length - 1].split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  try {
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
