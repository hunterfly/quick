import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
  requiredDate: z.string().min(1, "Required date is required"),
});

const updatePRSchema = z.object({
  note: z.string().nullish(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

export async function GET(
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
      include: {
        items: true,
        attachments: true,
        requester: { select: { id: true, name: true, email: true } },
        approvals: {
          orderBy: { level: "asc" },
          include: {
            approver: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!pr) {
      return NextResponse.json({ error: "PR not found" }, { status: 404 });
    }

    // Owner can always view; approver roles can view submitted PRs
    const isOwner = pr.requesterId === user.id;
    const isApproverRole = ["MANAGER", "FINANCE", "ADMIN"].includes(user.role);
    if (!isOwner && !isApproverRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(pr);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
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
        { error: "Only draft PRs can be edited" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = updatePRSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { items, note } = parsed.data;
    const itemsWithTotal = items.map((item) => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
      requiredDate: new Date(item.requiredDate),
    }));

    const totalAmount = itemsWithTotal.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const updated = await prisma.$transaction(async (tx) => {
      await tx.pRItem.deleteMany({ where: { prId: Number(id) } });
      return tx.pRRequest.update({
        where: { id: Number(id) },
        data: {
          totalAmount,
          note: note ?? null,
          items: { create: itemsWithTotal },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
        { error: "Only draft PRs can be deleted" },
        { status: 400 },
      );
    }

    await prisma.pRRequest.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
