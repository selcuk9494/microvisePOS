import { NextResponse } from "next/server";

import { deleteQuickMessage, updateQuickMessage } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const quickMessage = await updateQuickMessage(Number(id), await request.json());
    return NextResponse.json({ ok: true, quickMessage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hazir mesaj guncellenemedi.";
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
    await deleteQuickMessage(Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hazir mesaj silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
