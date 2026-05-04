import { NextResponse } from "next/server";

import { runIngenicoPrecheck } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const body = (await request.json()) as { terminalId?: string };
  const result = await runIngenicoPrecheck(body.terminalId);
  return NextResponse.json(result);
}
