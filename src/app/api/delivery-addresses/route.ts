import { NextResponse } from "next/server";

import { createDeliveryAddress, listDeliveryAddresses } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadi." }, { status: 401 });
  }

  return NextResponse.json(await listDeliveryAddresses());
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer", "Garson"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const address = await createDeliveryAddress(body);
    return NextResponse.json({ ok: true, address }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Adres eklenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
