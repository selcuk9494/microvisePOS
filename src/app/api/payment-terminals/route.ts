import { NextResponse } from "next/server";

import { createPaymentTerminal, listPaymentTerminals } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadi." }, { status: 401 });
  }

  return NextResponse.json(await listPaymentTerminals());
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const terminal = await createPaymentTerminal(await request.json());
    return NextResponse.json({ ok: true, terminal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terminal olusturulamadi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
