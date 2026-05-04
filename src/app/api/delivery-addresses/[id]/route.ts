import { NextResponse } from "next/server";

import { deleteDeliveryAddress, updateDeliveryAddress } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

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

  try {
    const { id } = await context.params;
    const address = await updateDeliveryAddress(id, await request.json());
    return NextResponse.json({ ok: true, address });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Adres guncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !["Yonetici", "Kasiyer"].includes(session.role)) {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await deleteDeliveryAddress(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Adres silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
