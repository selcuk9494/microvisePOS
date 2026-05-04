import { NextResponse } from "next/server";

import { bulkImportMenuProducts } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      products?: Array<{
        id?: number;
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
      }>;
    };

    if (!body.products?.length) {
      return NextResponse.json({ message: "Ice aktarim icin en az bir urun gerekli." }, { status: 400 });
    }

    const products = await bulkImportMenuProducts(
      body.products.map((product) => ({
        name: product.name ?? "",
        category: product.category ?? "",
        groupName: product.groupName ?? product.category ?? "",
        subgroupName: product.subgroupName ?? "",
        price: Number(product.price ?? 0),
        prep: product.prep ?? "",
        tag: product.tag ?? "",
        description: product.description ?? "",
        sku: product.sku ?? "",
        modifierIds: product.modifierIds ?? [],
        messageIds: product.messageIds ?? [],
        active: product.active ?? true,
      })),
    );

    return NextResponse.json({ ok: true, products }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Toplu urun aktarimi tamamlanamadi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
