import { NextResponse } from "next/server";

import { bulkAdjustMenuPrices } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      mode?: "fixed" | "percent";
      value?: number;
      groupName?: string;
      subgroupName?: string;
      category?: string;
      productIds?: number[];
    };

    if (!body.mode || typeof body.value !== "number" || Number.isNaN(body.value)) {
      return NextResponse.json({ message: "Fiyat guncelleme modu ve degeri zorunludur." }, { status: 400 });
    }

    const products = await bulkAdjustMenuPrices({
      mode: body.mode,
      value: body.value,
      groupName: body.groupName,
      subgroupName: body.subgroupName,
      category: body.category,
      productIds: body.productIds,
    });

    return NextResponse.json({ ok: true, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Toplu fiyat guncelleme tamamlanamadi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
