import { NextResponse } from "next/server";

import {
  moveOrderToTable,
  readStore,
  type StoredOrderItem,
  updateOrderById,
  updateStore,
} from "@/lib/store";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const store = await readStore();
  const order = store.orders.find((item) => item.id === id);

  if (!order) {
    return NextResponse.json({ message: "Siparis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: "acik" | "mutfaga-gonderildi" | "beklemede" | "odendi";
    payment?: "bekliyor" | "nakit" | "kart";
    table?: string;
    items?: StoredOrderItem[];
  };

  const next = body.table
    ? await moveOrderToTable(id, body.table)
    : await updateOrderById(id, {
        status: body.status,
        payment: body.payment,
        items: body.items,
      });

  const order = next.orders.find((item) => item.id === id);

  if (!order) {
    return NextResponse.json({ message: "Siparis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;

  const next = await updateStore((current) => ({
    ...current,
    orders: current.orders.filter((order) => order.id !== id),
  }));

  return NextResponse.json({
    ok: true,
    orders: next.orders,
  });
}
