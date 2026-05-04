import { getPermissionsForRole } from "@/lib/auth";
import { getDb } from "@/lib/database";
import type { UserRole } from "@/lib/user-types";

export type ManagedUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  branch: string;
  active: boolean;
  permissions: string[];
};

export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  branch: string;
};

export type UpdateUserInput = Partial<CreateUserInput> & {
  active?: boolean;
};

type UserRow = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  branch: string;
  active: number;
};

function mapUser(row: UserRow): ManagedUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    branch: row.branch,
    active: Boolean(row.active),
    permissions: getPermissionsForRole(row.role),
  };
}

function sanitizeText(value: string) {
  return value.trim();
}

export async function listUsers() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, email, name, role, branch, active
        FROM users
        ORDER BY active DESC, role ASC, name ASC
      `,
    )
    .all() as UserRow[];

  return rows.map(mapUser);
}

export async function createUser(input: CreateUserInput) {
  const db = getDb();
  const payload = {
    email: sanitizeText(input.email).toLowerCase(),
    password: sanitizeText(input.password),
    name: sanitizeText(input.name),
    role: input.role,
    branch: sanitizeText(input.branch),
  };

  if (!payload.email || !payload.password || !payload.name || !payload.branch) {
    throw new Error("Tum kullanici alanlarini doldurun.");
  }

  const exists = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(payload.email) as { id: number } | undefined;

  if (exists) {
    throw new Error("Bu e-posta ile kayitli bir kullanici zaten var.");
  }

  const result = db
    .prepare(
      `
        INSERT INTO users (email, password, name, role, branch, active)
        VALUES (@email, @password, @name, @role, @branch, 1)
      `,
    )
    .run(payload);

  const created = db
    .prepare(
      `
        SELECT id, email, name, role, branch, active
        FROM users
        WHERE id = ?
      `,
    )
    .get(result.lastInsertRowid) as UserRow | undefined;

  if (!created) {
    throw new Error("Kullanici olusturulamadi.");
  }

  return mapUser(created);
}

export async function updateUser(id: number, input: UpdateUserInput) {
  const db = getDb();
  const current = db
    .prepare(
      `
        SELECT id, email, name, role, branch, active
        FROM users
        WHERE id = ?
      `,
    )
    .get(id) as UserRow | undefined;

  if (!current) {
    throw new Error("Kullanici bulunamadi.");
  }

  const nextEmail = input.email ? sanitizeText(input.email).toLowerCase() : current.email;
  const nextName = input.name ? sanitizeText(input.name) : current.name;
  const nextRole = input.role ?? current.role;
  const nextBranch = input.branch ? sanitizeText(input.branch) : current.branch;
  const nextActive = typeof input.active === "boolean" ? Number(input.active) : current.active;

  if (!nextEmail || !nextName || !nextBranch) {
    throw new Error("Kullanici bilgileri bos birakilamaz.");
  }

  const existingEmailOwner = db
    .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
    .get(nextEmail, id) as { id: number } | undefined;

  if (existingEmailOwner) {
    throw new Error("Bu e-posta farkli bir kullanici tarafindan kullaniliyor.");
  }

  db.prepare(
    `
      UPDATE users
      SET email = @email,
          name = @name,
          role = @role,
          branch = @branch,
          active = @active
      WHERE id = @id
    `,
  ).run({
    id,
    email: nextEmail,
    name: nextName,
    role: nextRole,
    branch: nextBranch,
    active: nextActive,
  });

  if (input.password && sanitizeText(input.password)) {
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(sanitizeText(input.password), id);
  }

  const updated = db
    .prepare(
      `
        SELECT id, email, name, role, branch, active
        FROM users
        WHERE id = ?
      `,
    )
    .get(id) as UserRow | undefined;

  if (!updated) {
    throw new Error("Kullanici guncellenemedi.");
  }

  return mapUser(updated);
}
