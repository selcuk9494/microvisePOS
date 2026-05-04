import { getDb } from "@/lib/database";
import type {
  DeliveryAddress,
  DeliveryOrderLineItem,
  MenuModifier,
  MenuProduct,
  QuickMessage,
} from "@/lib/pos-data";

function sanitizeText(value: string) {
  return value.trim();
}

function normalizeBool(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function mapProduct(row: {
  id: number;
  name: string;
  category: string;
  group_name: string;
  subgroup_name: string;
  price: number;
  prep: string;
  tag: string;
  description: string;
  sku: string;
  active: number;
  modifierIds?: number[];
  messageIds?: number[];
}) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    groupName: row.group_name,
    subgroupName: row.subgroup_name,
    price: row.price,
    prep: row.prep,
    tag: row.tag,
    description: row.description,
    sku: row.sku,
    modifierIds: row.modifierIds ?? [],
    messageIds: row.messageIds ?? [],
    active: Boolean(row.active),
  } satisfies MenuProduct;
}

function mapModifier(row: {
  id: number;
  name: string;
  category: string;
  price_delta: number;
  active: number;
}) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceDelta: row.price_delta,
    active: Boolean(row.active),
  } satisfies MenuModifier;
}

function mapQuickMessage(row: {
  id: number;
  title: string;
  message: string;
  active: number;
}) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    active: Boolean(row.active),
  } satisfies QuickMessage;
}

function mapAddress(row: {
  id: string;
  customer: string;
  label: string;
  phone: string;
  zone: string;
  address_line: string;
  note: string;
  default_address: number;
}) {
  return {
    id: row.id,
    customer: row.customer,
    label: row.label,
    phone: row.phone,
    zone: row.zone,
    addressLine: row.address_line,
    note: row.note,
    defaultAddress: Boolean(row.default_address),
  } satisfies DeliveryAddress;
}

export async function listMenuProducts() {
  const db = getDb();
  const modifierLinks = db
    .prepare("SELECT product_id, modifier_id FROM product_modifier_links")
    .all() as Array<{ product_id: number; modifier_id: number }>;
  const messageLinks = db
    .prepare("SELECT product_id, message_id FROM product_message_links")
    .all() as Array<{ product_id: number; message_id: number }>;
  const rows = db
    .prepare(
      `
        SELECT id, name, category, group_name, subgroup_name, price, prep, tag, description, sku, active
        FROM menu_products
        ORDER BY active DESC, group_name ASC, subgroup_name ASC, category ASC, name ASC
      `,
    )
    .all() as Array<{
      id: number;
      name: string;
      category: string;
      group_name: string;
      subgroup_name: string;
      price: number;
      prep: string;
      tag: string;
      description: string;
      sku: string;
      active: number;
    }>;

  return rows.map((row) =>
    mapProduct({
      ...row,
      modifierIds: modifierLinks.filter((link) => link.product_id === row.id).map((link) => link.modifier_id),
      messageIds: messageLinks.filter((link) => link.product_id === row.id).map((link) => link.message_id),
    }),
  );
}

export async function createMenuProduct(input: Omit<MenuProduct, "id"> & { id?: number }) {
  const db = getDb();
  const payload = {
    id:
      typeof input.id === "number"
        ? input.id
        : ((db.prepare("SELECT COALESCE(MAX(id), 0) AS max_id FROM menu_products").get() as { max_id: number })
            .max_id ?? 0) + 1,
    name: sanitizeText(input.name),
    category: sanitizeText(input.category),
    groupName: sanitizeText(input.groupName ?? input.category),
    subgroupName: sanitizeText(input.subgroupName ?? ""),
    price: Number(input.price),
    prep: sanitizeText(input.prep),
    tag: sanitizeText(input.tag),
    description: sanitizeText(input.description ?? ""),
    sku: sanitizeText(input.sku ?? ""),
    active: Number(normalizeBool(input.active, true)),
  };

  if (!payload.name || !payload.category || !payload.groupName || !payload.prep || !payload.tag || Number.isNaN(payload.price)) {
    throw new Error("Menu urunu icin gerekli alanlari doldurun.");
  }

  db.prepare(
    `
      INSERT INTO menu_products (id, name, category, group_name, subgroup_name, price, prep, tag, description, sku, active)
      VALUES (@id, @name, @category, @groupName, @subgroupName, @price, @prep, @tag, @description, @sku, @active)
    `,
  ).run(payload);

  replaceProductLinks(db, payload.id, input.modifierIds ?? [], input.messageIds ?? []);

  return createReadProduct(payload.id);
}

export async function updateMenuProduct(id: number, input: Partial<MenuProduct>) {
  const db = getDb();
  const current = db
    .prepare(
      `
        SELECT id, name, category, group_name, subgroup_name, price, prep, tag, description, sku, active
        FROM menu_products
        WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: number;
        name: string;
        category: string;
        group_name: string;
        subgroup_name: string;
        price: number;
        prep: string;
        tag: string;
        description: string;
        sku: string;
        active: number;
      }
    | undefined;

  if (!current) {
    throw new Error("Menu urunu bulunamadi.");
  }

  db.prepare(
    `
      UPDATE menu_products
      SET name = @name,
          category = @category,
          group_name = @groupName,
          subgroup_name = @subgroupName,
          price = @price,
          prep = @prep,
          tag = @tag,
          description = @description,
          sku = @sku,
          active = @active
      WHERE id = @id
    `,
  ).run({
    id,
    name: input.name ? sanitizeText(input.name) : current.name,
    category: input.category ? sanitizeText(input.category) : current.category,
    groupName:
      typeof input.groupName === "string" ? sanitizeText(input.groupName) : current.group_name,
    subgroupName:
      typeof input.subgroupName === "string" ? sanitizeText(input.subgroupName) : current.subgroup_name,
    price: typeof input.price === "number" ? input.price : current.price,
    prep: input.prep ? sanitizeText(input.prep) : current.prep,
    tag: input.tag ? sanitizeText(input.tag) : current.tag,
    description:
      typeof input.description === "string" ? sanitizeText(input.description) : current.description,
    sku: typeof input.sku === "string" ? sanitizeText(input.sku) : current.sku,
    active: Number(typeof input.active === "boolean" ? input.active : Boolean(current.active)),
  });

  if (input.modifierIds || input.messageIds) {
    replaceProductLinks(db, id, input.modifierIds ?? getProductModifierIds(db, id), input.messageIds ?? getProductMessageIds(db, id));
  }

  return createReadProduct(id);
}

export async function deleteMenuProduct(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM product_modifier_links WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM product_message_links WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM menu_products WHERE id = ?").run(id);
}

export async function bulkImportMenuProducts(items: Array<Omit<MenuProduct, "id"> & { id?: number }>) {
  const created: MenuProduct[] = [];

  for (const item of items) {
    created.push(await createMenuProduct(item));
  }

  return created;
}

export async function bulkAdjustMenuPrices(input: {
  mode: "fixed" | "percent";
  value: number;
  groupName?: string;
  subgroupName?: string;
  category?: string;
  productIds?: number[];
}) {
  const db = getDb();
  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (input.groupName) {
    whereClauses.push("group_name = ?");
    params.push(input.groupName);
  }

  if (input.subgroupName) {
    whereClauses.push("subgroup_name = ?");
    params.push(input.subgroupName);
  }

  if (input.category) {
    whereClauses.push("category = ?");
    params.push(input.category);
  }

  if (input.productIds?.length) {
    whereClauses.push(`id IN (${input.productIds.map(() => "?").join(",")})`);
    params.push(...input.productIds);
  }

  const query = `
    SELECT id, price
    FROM menu_products
    ${whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : ""}
  `;
  const rows = db.prepare(query).all(...params) as Array<{ id: number; price: number }>;

  const stmt = db.prepare("UPDATE menu_products SET price = ? WHERE id = ?");

  for (const row of rows) {
    const nextPrice =
      input.mode === "fixed"
        ? row.price + input.value
        : Math.round(row.price * (1 + input.value / 100));
    stmt.run(Math.max(nextPrice, 0), row.id);
  }

  return listMenuProducts();
}

function createReadProduct(id: number) {
  const db = getDb();
  const row = db
    .prepare(
      `
        SELECT id, name, category, group_name, subgroup_name, price, prep, tag, description, sku, active
        FROM menu_products
        WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: number;
        name: string;
        category: string;
        group_name: string;
        subgroup_name: string;
        price: number;
        prep: string;
        tag: string;
        description: string;
        sku: string;
        active: number;
      }
    | undefined;

  if (!row) {
    throw new Error("Menu urunu bulunamadi.");
  }

  return mapProduct({
    ...row,
    modifierIds: getProductModifierIds(db, id),
    messageIds: getProductMessageIds(db, id),
  });
}

function getProductModifierIds(db: ReturnType<typeof getDb>, productId: number) {
  return (
    db.prepare("SELECT modifier_id FROM product_modifier_links WHERE product_id = ? ORDER BY modifier_id ASC").all(productId) as Array<{
      modifier_id: number;
    }>
  ).map((item) => item.modifier_id);
}

function getProductMessageIds(db: ReturnType<typeof getDb>, productId: number) {
  return (
    db.prepare("SELECT message_id FROM product_message_links WHERE product_id = ? ORDER BY message_id ASC").all(productId) as Array<{
      message_id: number;
    }>
  ).map((item) => item.message_id);
}

function replaceProductLinks(db: ReturnType<typeof getDb>, productId: number, modifierIds: number[], messageIds: number[]) {
  db.prepare("DELETE FROM product_modifier_links WHERE product_id = ?").run(productId);
  db.prepare("DELETE FROM product_message_links WHERE product_id = ?").run(productId);

  const insertModifier = db.prepare("INSERT OR IGNORE INTO product_modifier_links (product_id, modifier_id) VALUES (?, ?)");
  for (const modifierId of modifierIds) {
    insertModifier.run(productId, modifierId);
  }

  const insertMessage = db.prepare("INSERT OR IGNORE INTO product_message_links (product_id, message_id) VALUES (?, ?)");
  for (const messageId of messageIds) {
    insertMessage.run(productId, messageId);
  }
}

export async function listMenuModifiers() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, name, category, price_delta, active
        FROM menu_modifiers
        ORDER BY active DESC, category ASC, name ASC
      `,
    )
    .all() as Array<{
      id: number;
      name: string;
      category: string;
      price_delta: number;
      active: number;
    }>;

  return rows.map(mapModifier);
}

export async function createMenuModifier(input: Omit<MenuModifier, "id"> & { id?: number }) {
  const db = getDb();
  const payload = {
    id:
      typeof input.id === "number"
        ? input.id
        : ((db.prepare("SELECT COALESCE(MAX(id), 0) AS max_id FROM menu_modifiers").get() as { max_id: number })
            .max_id ?? 0) + 1,
    name: sanitizeText(input.name),
    category: sanitizeText(input.category),
    priceDelta: Number(input.priceDelta),
    active: Number(normalizeBool(input.active, true)),
  };

  if (!payload.name || !payload.category || Number.isNaN(payload.priceDelta)) {
    throw new Error("Ozellik alanlarini eksiksiz doldurun.");
  }

  db.prepare(
    `
      INSERT INTO menu_modifiers (id, name, category, price_delta, active)
      VALUES (@id, @name, @category, @priceDelta, @active)
    `,
  ).run(payload);

  return listMenuModifiers().then((items) => items.find((item) => item.id === payload.id)!);
}

export async function updateMenuModifier(id: number, input: Partial<MenuModifier>) {
  const db = getDb();
  const current = db
    .prepare("SELECT id, name, category, price_delta, active FROM menu_modifiers WHERE id = ?")
    .get(id) as { id: number; name: string; category: string; price_delta: number; active: number } | undefined;

  if (!current) {
    throw new Error("Ozellik bulunamadi.");
  }

  db.prepare(
    `
      UPDATE menu_modifiers
      SET name = @name,
          category = @category,
          price_delta = @priceDelta,
          active = @active
      WHERE id = @id
    `,
  ).run({
    id,
    name: input.name ? sanitizeText(input.name) : current.name,
    category: input.category ? sanitizeText(input.category) : current.category,
    priceDelta: typeof input.priceDelta === "number" ? input.priceDelta : current.price_delta,
    active: Number(typeof input.active === "boolean" ? input.active : Boolean(current.active)),
  });

  return listMenuModifiers().then((items) => items.find((item) => item.id === id)!);
}

export async function deleteMenuModifier(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM menu_modifiers WHERE id = ?").run(id);
}

export async function listQuickMessages() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, title, message, active
        FROM quick_messages
        ORDER BY active DESC, title ASC
      `,
    )
    .all() as Array<{ id: number; title: string; message: string; active: number }>;

  return rows.map(mapQuickMessage);
}

export async function createQuickMessage(input: Omit<QuickMessage, "id"> & { id?: number }) {
  const db = getDb();
  const payload = {
    id:
      typeof input.id === "number"
        ? input.id
        : ((db.prepare("SELECT COALESCE(MAX(id), 0) AS max_id FROM quick_messages").get() as { max_id: number })
            .max_id ?? 0) + 1,
    title: sanitizeText(input.title),
    message: sanitizeText(input.message),
    active: Number(normalizeBool(input.active, true)),
  };

  if (!payload.title || !payload.message) {
    throw new Error("Mesaj basligi ve icerigi zorunludur.");
  }

  db.prepare(
    `
      INSERT INTO quick_messages (id, title, message, active)
      VALUES (@id, @title, @message, @active)
    `,
  ).run(payload);

  return listQuickMessages().then((items) => items.find((item) => item.id === payload.id)!);
}

export async function updateQuickMessage(id: number, input: Partial<QuickMessage>) {
  const db = getDb();
  const current = db
    .prepare("SELECT id, title, message, active FROM quick_messages WHERE id = ?")
    .get(id) as { id: number; title: string; message: string; active: number } | undefined;

  if (!current) {
    throw new Error("Mesaj bulunamadi.");
  }

  db.prepare(
    `
      UPDATE quick_messages
      SET title = @title,
          message = @message,
          active = @active
      WHERE id = @id
    `,
  ).run({
    id,
    title: input.title ? sanitizeText(input.title) : current.title,
    message: input.message ? sanitizeText(input.message) : current.message,
    active: Number(typeof input.active === "boolean" ? input.active : Boolean(current.active)),
  });

  return listQuickMessages().then((items) => items.find((item) => item.id === id)!);
}

export async function deleteQuickMessage(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM quick_messages WHERE id = ?").run(id);
}

export async function listDeliveryAddresses() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, customer, label, phone, zone, address_line, note, default_address
        FROM delivery_addresses
        ORDER BY customer ASC, default_address DESC, label ASC
      `,
    )
    .all() as Array<{
      id: string;
      customer: string;
      label: string;
      phone: string;
      zone: string;
      address_line: string;
      note: string;
      default_address: number;
    }>;

  return rows.map(mapAddress);
}

export async function createDeliveryAddress(input: Omit<DeliveryAddress, "id"> & { id?: string }) {
  const db = getDb();
  const payload = {
    id: input.id?.trim() || `ADR-${String(Date.now()).slice(-6)}`,
    customer: sanitizeText(input.customer),
    label: sanitizeText(input.label),
    phone: sanitizeText(input.phone),
    zone: sanitizeText(input.zone),
    addressLine: sanitizeText(input.addressLine),
    note: sanitizeText(input.note),
    defaultAddress: Number(normalizeBool(input.defaultAddress, false)),
  };

  if (!payload.customer || !payload.label || !payload.phone || !payload.zone || !payload.addressLine) {
    throw new Error("Adres alanlarini eksiksiz doldurun.");
  }

  if (payload.defaultAddress) {
    db.prepare("UPDATE delivery_addresses SET default_address = 0 WHERE customer = ?").run(payload.customer);
  }

  db.prepare(
    `
      INSERT INTO delivery_addresses (id, customer, label, phone, zone, address_line, note, default_address)
      VALUES (@id, @customer, @label, @phone, @zone, @addressLine, @note, @defaultAddress)
    `,
  ).run(payload);

  return listDeliveryAddresses().then((items) => items.find((item) => item.id === payload.id)!);
}

export async function updateDeliveryAddress(id: string, input: Partial<DeliveryAddress>) {
  const db = getDb();
  const current = db
    .prepare(
      `
        SELECT id, customer, label, phone, zone, address_line, note, default_address
        FROM delivery_addresses
        WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: string;
        customer: string;
        label: string;
        phone: string;
        zone: string;
        address_line: string;
        note: string;
        default_address: number;
      }
    | undefined;

  if (!current) {
    throw new Error("Adres bulunamadi.");
  }

  const nextCustomer = input.customer ? sanitizeText(input.customer) : current.customer;
  const nextDefault =
    typeof input.defaultAddress === "boolean" ? Number(input.defaultAddress) : current.default_address;

  if (nextDefault) {
    db.prepare("UPDATE delivery_addresses SET default_address = 0 WHERE customer = ?").run(nextCustomer);
  }

  db.prepare(
    `
      UPDATE delivery_addresses
      SET customer = @customer,
          label = @label,
          phone = @phone,
          zone = @zone,
          address_line = @addressLine,
          note = @note,
          default_address = @defaultAddress
      WHERE id = @id
    `,
  ).run({
    id,
    customer: nextCustomer,
    label: input.label ? sanitizeText(input.label) : current.label,
    phone: input.phone ? sanitizeText(input.phone) : current.phone,
    zone: input.zone ? sanitizeText(input.zone) : current.zone,
    addressLine: input.addressLine ? sanitizeText(input.addressLine) : current.address_line,
    note: typeof input.note === "string" ? sanitizeText(input.note) : current.note,
    defaultAddress: nextDefault,
  });

  return listDeliveryAddresses().then((items) => items.find((item) => item.id === id)!);
}

export async function deleteDeliveryAddress(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM delivery_addresses WHERE id = ?").run(id);
}

export function buildDeliveryLines(items: DeliveryOrderLineItem[]) {
  return items.map((item) => {
    const modifierText = item.modifiers.length ? ` (${item.modifiers.join(", ")})` : "";
    const noteText = item.note ? ` - ${item.note}` : "";
    return `${item.qty}x ${item.name}${modifierText}${noteText}`;
  });
}
