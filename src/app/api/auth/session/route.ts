import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getEmailFromSessionToken,
  getPermissionsForRole,
  getSessionUserByEmail,
  isValidSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!isValidSessionToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const email = getEmailFromSessionToken(token);

  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await getSessionUserByEmail(email);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      permissions: getPermissionsForRole(user.role),
    },
  });
}
