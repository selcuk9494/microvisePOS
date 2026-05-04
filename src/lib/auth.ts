import { createHash } from "node:crypto";

import { getDb } from "@/lib/database";
import { rolePermissions, type SessionUser, type UserRole } from "@/lib/user-types";

export const SESSION_COOKIE_NAME = "micpos_session";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "micpos-dev-secret";

function sign(value: string) {
  return createHash("sha256").update(`${value}:${AUTH_SECRET}`).digest("hex");
}

export async function validateCredentials(email: string, password: string) {
  const db = getDb();
  const user = db
    .prepare(
      "SELECT email, name, role, branch FROM users WHERE email = ? AND password = ? AND active = 1",
    )
    .get(email, password) as SessionUser | undefined;

  return Boolean(user);
}

export function createSessionToken(email: string) {
  return sign(email);
}

export function isValidSessionToken(token?: string) {
  if (!token) {
    return false;
  }

  return token.length === 64;
}

export async function getSessionUserByEmail(email: string) {
  const db = getDb();
  const user = db
    .prepare("SELECT email, name, role, branch FROM users WHERE email = ? AND active = 1")
    .get(email) as SessionUser | undefined;

  return user ?? null;
}

export function getPermissionsForRole(role: UserRole) {
  return rolePermissions[role] ?? [];
}

export function getEmailFromSessionToken(token?: string) {
  const db = getDb();
  const users = db.prepare("SELECT email FROM users WHERE active = 1").all() as Array<{ email: string }>;

  for (const user of users) {
    if (token === sign(user.email)) {
      return user.email;
    }
  }

  return null;
}
