import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import { getOrderSettings, updateOrderSettings } from "@/lib/store";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadi." }, { status: 401 });
  }

  return NextResponse.json(await getOrderSettings());
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadi." }, { status: 401 });
  }

  const body = (await request.json()) as {
    serviceChargeEnabled?: boolean;
    serviceChargeRate?: number;
  };

  const next = await updateOrderSettings({
    serviceChargeEnabled: body.serviceChargeEnabled,
    serviceChargeRate: body.serviceChargeRate,
  });

  return NextResponse.json(next);
}
