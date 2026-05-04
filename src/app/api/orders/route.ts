import { NextResponse } from "next/server";

import { createOrder, readStore, type StoredOrderItem } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.orders);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    table?: string;
    items?: StoredOrderItem[];
    sendToKitchen?: boolean;
  };

  if (!body.table || !body.items?.length) {
    return NextResponse.json(
      { message: "Masa ve en az bir urun gerekli." },
      { status: 400 },
    );
  }

  const next = await createOrder({
    table: body.table,
    items: body.items,
    sendToKitchen: body.sendToKitchen,
  });

  return NextResponse.json({
    ok: true,
    order: next.orders[0],
    kitchenTickets: next.kitchenTickets,
    tables: next.tables,
  });
}
