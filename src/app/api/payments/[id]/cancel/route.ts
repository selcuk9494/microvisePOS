import { NextResponse } from "next/server";

import { cancelPayment } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const payment = await cancelPayment(id);
    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Odeme iptal edilemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
