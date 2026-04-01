import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generatePRNumber } from "@/utils/pr-number";

const itemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
  requiredDate: z.string().min(1, "Required date is required"),
});

const createPRSchema = z.object({
  note: z.string().nullish(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prs = await prisma.pRRequest.findMany({
      where: { requesterId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prs);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPRSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { items, note } = parsed.data;
    const prNumber = await generatePRNumber();

    const itemsWithTotal = items.map((item) => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
      requiredDate: new Date(item.requiredDate),
    }));

    const totalAmount = itemsWithTotal.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const pr = await prisma.pRRequest.create({
      data: {
        prNumber,
        requesterId: user.id,
        status: "DRAFT",
        totalAmount,
        note: note ?? null,
        items: { create: itemsWithTotal },
      },
      include: { items: true },
    });

    return NextResponse.json(pr, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
