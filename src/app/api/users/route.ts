import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import type { UserRole } from "@/lib/user-types";
import { createUser, listUsers } from "@/lib/users";

export async function GET() {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "Yonetici") {
    return NextResponse.json({ message: "Bu islem icin yetkiniz yok." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      role?: UserRole;
      branch?: string;
    };

    if (!body.email || !body.password || !body.name || !body.role || !body.branch) {
      return NextResponse.json({ message: "Tum alanlar zorunludur." }, { status: 400 });
    }

    const user = await createUser({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
      branch: body.branch,
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kullanici olusturulamadi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
