import { NextResponse } from "next/server";

import { createMenuModifier, listMenuModifiers } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json(await listMenuModifiers());
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
      priceDelta?: number;
      active?: boolean;
    };
    const modifier = await createMenuModifier({
      name: body.name ?? "",
      category: body.category ?? "",
      priceDelta: Number(body.priceDelta ?? 0),
      active: body.active ?? true,
    });

    return NextResponse.json({ ok: true, modifier }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ozellik eklenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
