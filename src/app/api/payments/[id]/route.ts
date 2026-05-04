import { NextResponse } from "next/server";

import { getPaymentTransaction } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadi." }, { status: 401 });
  }

  const { id } = await context.params;
  const payment = await getPaymentTransaction(id);

  if (!payment) {
    return NextResponse.json({ message: "Odeme bulunamadi." }, { status: 404 });
  }

  return NextResponse.json(payment);
}
