import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pr = await prisma.pRRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!pr) {
      return NextResponse.json({ error: "PR not found" }, { status: 404 });
    }
    if (pr.requesterId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (pr.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft PRs can have attachments added" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 },
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const attachments = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
          { status: 400 },
        );
      }

      const uniqueName = `${Date.now()}-${file.name}`;
      const filePath = join(UPLOAD_DIR, uniqueName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const attachment = await prisma.attachment.create({
        data: {
          prId: Number(id),
          filePath: `/uploads/${uniqueName}`,
          fileName: file.name,
        },
      });
      attachments.push(attachment);
    }

    return NextResponse.json(attachments, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
