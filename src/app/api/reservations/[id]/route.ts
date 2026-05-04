import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import { deleteReservationById, readStore, updateReservationById } from "@/lib/store";
import type { ReservationItem } from "@/lib/pos-data";

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
  const body = (await request.json()) as Partial<ReservationItem>;
  const next = await updateReservationById(id, body);
  const reservation = next.reservations.find((item) => item.id === id);

  if (!reservation) {
    return NextResponse.json({ message: "Rezervasyon bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, reservation, reservations: next.reservations });
}

export async function DELETE(_: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const { id } = await context.params;
  const store = await readStore();
  const exists = store.reservations.some((item) => item.id === id);

  if (!exists) {
    return NextResponse.json({ message: "Rezervasyon bulunamadi." }, { status: 404 });
  }

  const next = await deleteReservationById(id);
  return NextResponse.json({ ok: true, reservations: next.reservations });
}
