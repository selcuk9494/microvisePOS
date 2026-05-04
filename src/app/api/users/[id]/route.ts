import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import type { UserRole } from "@/lib/user-types";
import { updateUser } from "@/lib/users";

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
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Gecersiz kullanici." }, { status: 400 });
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      role?: UserRole;
      branch?: string;
      active?: boolean;
    };

    const user = await updateUser(userId, body);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kullanici guncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
