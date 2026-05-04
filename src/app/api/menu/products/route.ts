import { NextResponse } from "next/server";

import { createMenuProduct, listMenuProducts } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json(await listMenuProducts());
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      category?: string;
      groupName?: string;
      subgroupName?: string;
      price?: number;
      prep?: string;
      tag?: string;
      description?: string;
      sku?: string;
      modifierIds?: number[];
      messageIds?: number[];
      active?: boolean;
    };
    const product = await createMenuProduct({
      name: body.name ?? "",
      category: body.category ?? "",
      groupName: body.groupName ?? body.category ?? "",
      subgroupName: body.subgroupName ?? "",
      price: Number(body.price ?? 0),
      prep: body.prep ?? "",
      tag: body.tag ?? "",
      description: body.description ?? "",
      sku: body.sku ?? "",
      modifierIds: body.modifierIds ?? [],
      messageIds: body.messageIds ?? [],
      active: body.active ?? true,
    });

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Menu urunu olusturulamadi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
