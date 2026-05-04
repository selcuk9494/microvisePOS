import { NextResponse } from "next/server";

import type { DeliveryOrder } from "@/lib/pos-data";
import { getCurrentSession } from "@/lib/session";
import { deleteDeliveryOrder, readStore, updateDeliveryOrder } from "@/lib/store";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer", "Garson"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<DeliveryOrder>;
  const next = await updateDeliveryOrder(id, body);
  const order = next.deliveryOrders.find((item) => item.id === id);

  if (!order) {
    return NextResponse.json({ message: "Paket siparis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order, deliveryOrders: next.deliveryOrders });
}

export async function DELETE(_: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const { id } = await context.params;
  const store = await readStore();
  const exists = store.deliveryOrders.some((item) => item.id === id);

  if (!exists) {
    return NextResponse.json({ message: "Paket siparis bulunamadi." }, { status: 404 });
  }

  const next = await deleteDeliveryOrder(id);
  return NextResponse.json({ ok: true, deliveryOrders: next.deliveryOrders });
}
