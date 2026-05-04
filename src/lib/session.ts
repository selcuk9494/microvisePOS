import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getEmailFromSessionToken,
  getPermissionsForRole,
  getSessionUserByEmail,
  isValidSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import type { UserRole } from "@/lib/user-types";

export async function getCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!isValidSessionToken(token)) {
    return null;
  }

  const email = getEmailFromSessionToken(token);

  if (!email) {
    return null;
  }

  const user = await getSessionUserByEmail(email);

  if (!user) {
    return null;
  }

  return user;
}

export async function requireSession() {
  const user = await getCurrentSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireSession();

  if (!allowedRoles.includes(user.role)) {
    redirect("/");
  }

  return {
    ...user,
    permissions: getPermissionsForRole(user.role),
  };
}

export async function redirectIfAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (isValidSessionToken(token) && getEmailFromSessionToken(token)) {
    redirect("/");
  }
}
