import { NextResponse } from "next/server";

import { cancelActiveBridgePayment } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { terminalId?: string };
    const result = await cancelActiveBridgePayment(body.terminalId);
    return NextResponse.json({ ok: result.ok, message: result.message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aktif Ingenico islemi iptal edilemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
