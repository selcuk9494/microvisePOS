import { NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  getSessionUserByEmail,
  validateCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (!(await validateCredentials(email, password))) {
    return NextResponse.json(
      { message: "E-posta veya sifre hatali." },
      { status: 401 },
    );
  }

  const user = await getSessionUserByEmail(email);

  if (!user) {
    return NextResponse.json({ message: "Kullanici bulunamadi." }, { status: 404 });
  }

  const response = NextResponse.json({
    ok: true,
    user,
  });

  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
