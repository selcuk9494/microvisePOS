import { NextResponse } from "next/server";

import type { DeliveryOrderLineItem } from "@/lib/pos-data";
import { getCurrentSession } from "@/lib/session";
import { createDeliveryOrder, readStore } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.deliveryOrders);
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer", "Garson"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const body = (await request.json()) as {
    channel?: string;
    customer?: string;
    zone?: string;
    total?: string;
    eta?: string;
    courier?: string;
    phone?: string;
    address?: string;
    note?: string;
    items?: DeliveryOrderLineItem[];
    addressId?: string;
    paymentMethod?: "nakit" | "kart" | "online";
  };

  if (!body.customer?.trim() || !body.channel?.trim() || !body.total?.trim()) {
    return NextResponse.json({ message: "Kanal, musteri ve toplam tutar zorunludur." }, { status: 400 });
  }

  const next = await createDeliveryOrder({
    channel: body.channel,
    customer: body.customer,
    zone: body.zone ?? "-",
    total: body.total,
    eta: body.eta ?? "20 dk",
    courier: body.courier ?? "Atanacak",
    phone: body.phone ?? "-",
    address: body.address ?? "",
    note: body.note ?? "",
    items: body.items ?? [],
    addressId: body.addressId,
    paymentMethod: body.paymentMethod ?? "nakit",
  });

  return NextResponse.json({
    ok: true,
    order: next.deliveryOrders[0],
    deliveryOrders: next.deliveryOrders,
  });
}
