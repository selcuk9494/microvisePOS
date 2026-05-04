import { NextResponse } from "next/server";

import { createQuickMessage, listQuickMessages } from "@/lib/catalog";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json(await listQuickMessages());
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      message?: string;
      active?: boolean;
    };
    const quickMessage = await createQuickMessage({
      title: body.title ?? "",
      message: body.message ?? "",
      active: body.active ?? true,
    });

    return NextResponse.json({ ok: true, quickMessage }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hazir mesaj eklenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
