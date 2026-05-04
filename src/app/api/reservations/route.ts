import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import { readStore, updateStore } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.reservations);
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer", "Garson"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    guests?: number;
    time?: string;
    area?: string;
    phone?: string;
    note?: string;
    status?: "onaylandi" | "bekliyor" | "geldi";
  };
  const name = body.name?.trim();
  const guests = body.guests;
  const time = body.time?.trim();

  if (!name || !guests || !time) {
    return NextResponse.json(
      { message: "Isim, kisi sayisi ve saat bilgisi zorunlu." },
      { status: 400 },
    );
  }

  const next = await updateStore((current) => ({
    ...current,
    reservations: [
      {
        id: `R-${String(current.reservations.length + 301).padStart(3, "0")}`,
        name,
        guests,
        time,
        area: body.area ?? "Salon A",
        phone: body.phone ?? "-",
        note: body.note ?? "",
        status: body.status ?? "bekliyor",
      },
      ...current.reservations,
    ],
  }));

  return NextResponse.json({
    ok: true,
    reservation: next.reservations[0],
  });
}
