import { NextResponse } from "next/server";

import { deletePaymentTerminal, getPaymentTerminal, updatePaymentTerminal } from "@/lib/payments";
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
  const terminal = await getPaymentTerminal(id);

  if (!terminal) {
    return NextResponse.json({ message: "Terminal bulunamadi." }, { status: 404 });
  }

  return NextResponse.json(terminal);
}

export async function PATCH(request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const terminal = await updatePaymentTerminal(id, await request.json());
    return NextResponse.json({ ok: true, terminal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terminal guncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await deletePaymentTerminal(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terminal silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
