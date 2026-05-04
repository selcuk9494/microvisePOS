import { NextResponse } from "next/server";

import { startPayment } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      amount?: number;
      terminalId?: string;
      method?: "nakit" | "kart";
      paymentName?: string;
      paymentInfo?: string;
    };

    if (!body.orderId || typeof body.amount !== "number") {
      return NextResponse.json({ message: "Siparis ve tutar zorunludur." }, { status: 400 });
    }

    const payment = await startPayment({
      orderId: body.orderId,
      amount: body.amount,
      terminalId: body.terminalId,
      method: body.method ?? "kart",
      paymentName: body.paymentName ?? `Adisyon ${body.orderId}`,
      paymentInfo: body.paymentInfo ?? `Kasiyer: ${session.name}`,
    });

    if (!payment) {
      return NextResponse.json({ message: "Odeme kaydi olusturulamadi." }, { status: 500 });
    }

    if (payment.status === "failed") {
      return NextResponse.json(
        {
          message: payment.errorMessage || "Ingenico odemesi basarisiz.",
          payment,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Odeme baslatilamadi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
