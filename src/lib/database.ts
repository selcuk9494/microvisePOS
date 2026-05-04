import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import {
  deliveryAddresses,
  deliveryOrders,
  kitchenTickets,
  menuModifiers,
  menuProducts,
  paymentTerminals,
  quickMessages,
  reservations,
  tables as seedTables,
} from "@/lib/pos-data";
import type { StoredOrder } from "@/lib/store";
import type { UserRole } from "@/lib/user-types";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "micpos.sqlite");
const legacyStorePath = path.join(dataDirectory, "store.json");

type LegacyStore = {
  orders?: StoredOrder[];
};

const defaultUsers: Array<{
  email: string;
  password: string;
  name: string;
  role: UserRole;
  branch: string;
}> = [
  {
    email: process.env.DEMO_USER_EMAIL ?? "admin@micpos.local",
    password: process.env.DEMO_USER_PASSWORD ?? "micpos123",
    name: "Selcuk Yilmaz",
    role: "Yonetici",
    branch: "Kadikoy Merkez",
  },
  {
    email: "kasa@micpos.local",
    password: "micpos123",
    name: "Deniz Aksoy",
    role: "Kasiyer",
    branch: "Kadikoy Merkez",
  },
  {
    email: "garson@micpos.local",
    password: "micpos123",
    name: "Ece Demir",
    role: "Garson",
    branch: "Kadikoy Merkez",
  },
  {
    email: "mutfak@micpos.local",
    password: "micpos123",
    name: "Kaan Usta",
    role: "Mutfak",
    branch: "Kadikoy Merkez",
  },
];

let dbInstance: Database.Database | null = null;

function getCount(db: Database.Database, tableName: string) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get() as
    | { count: number }
    | undefined;
  return Number(row?.count ?? 0);
}

function ensureColumn(db: Database.Database, tableName: string, columnName: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getLegacyOrders() {
  if (!existsSync(legacyStorePath)) {
    return [];
  }

  try {
    const raw = readFileSync(legacyStorePath, "utf8");
    const parsed = JSON.parse(raw) as LegacyStore;
    return parsed.orders ?? [];
  } catch {
    return [];
  }
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      branch TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS restaurant_tables (
      name TEXT PRIMARY KEY,
      guest TEXT NOT NULL,
      status TEXT NOT NULL,
      total TEXT NOT NULL,
      progress INTEGER NOT NULL,
      area TEXT NOT NULL,
      seats INTEGER NOT NULL,
      spend INTEGER NOT NULL,
      state TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      group_name TEXT NOT NULL DEFAULT '',
      subgroup_name TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      prep TEXT NOT NULL,
      tag TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sku TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS menu_modifiers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_delta INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS quick_messages (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS product_modifier_links (
      product_id INTEGER NOT NULL,
      modifier_id INTEGER NOT NULL,
      PRIMARY KEY (product_id, modifier_id)
    );

    CREATE TABLE IF NOT EXISTS product_message_links (
      product_id INTEGER NOT NULL,
      message_id INTEGER NOT NULL,
      PRIMARY KEY (product_id, message_id)
    );

    CREATE TABLE IF NOT EXISTS kitchen_tickets (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      guest TEXT NOT NULL,
      lane TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      priority TEXT NOT NULL,
      items_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_orders (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      customer TEXT NOT NULL,
      zone TEXT NOT NULL,
      total TEXT NOT NULL,
      eta TEXT NOT NULL,
      courier TEXT NOT NULL,
      status TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '-',
      address TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT '',
      address_id TEXT,
      payment_method TEXT NOT NULL DEFAULT 'nakit'
    );

    CREATE TABLE IF NOT EXISTS delivery_addresses (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      label TEXT NOT NULL,
      phone TEXT NOT NULL,
      zone TEXT NOT NULL,
      address_line TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      default_address INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      guests INTEGER NOT NULL,
      time TEXT NOT NULL,
      area TEXT NOT NULL,
      phone TEXT NOT NULL,
      note TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      status TEXT NOT NULL,
      payment TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      service INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      order_id TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price INTEGER NOT NULL,
      note TEXT,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payment_terminals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      connection_mode TEXT NOT NULL,
      interface_id TEXT NOT NULL,
      ip_address TEXT NOT NULL DEFAULT '',
      port INTEGER NOT NULL DEFAULT 0,
      port_name TEXT NOT NULL DEFAULT '',
      baud_rate INTEGER NOT NULL DEFAULT 115200,
      enabled INTEGER NOT NULL DEFAULT 1,
      use_mock INTEGER NOT NULL DEFAULT 1,
      default_timeout_ms INTEGER NOT NULL DEFAULT 10000,
      card_timeout_ms INTEGER NOT NULL DEFAULT 60000,
      serial_number TEXT NOT NULL DEFAULT '',
      ecr_serial_number TEXT NOT NULL DEFAULT '',
      external_device_brand TEXT NOT NULL DEFAULT 'WORLDLINE',
      external_device_model TEXT NOT NULL DEFAULT 'IWE280',
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      terminal_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency_code INTEGER NOT NULL DEFAULT 949,
      status TEXT NOT NULL,
      method TEXT NOT NULL,
      payment_name TEXT NOT NULL DEFAULT '',
      payment_info TEXT NOT NULL DEFAULT '',
      approval_code TEXT NOT NULL DEFAULT '',
      reference_number TEXT NOT NULL DEFAULT '',
      masked_pan TEXT NOT NULL DEFAULT '',
      batch_number TEXT NOT NULL DEFAULT '',
      error_code TEXT NOT NULL DEFAULT '',
      error_message TEXT NOT NULL DEFAULT '',
      request_payload TEXT NOT NULL DEFAULT '{}',
      response_payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS payment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id TEXT NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  ensureColumn(db, "delivery_orders", "phone", "TEXT NOT NULL DEFAULT '-'");
  ensureColumn(db, "delivery_orders", "address", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "delivery_orders", "note", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "delivery_orders", "items_json", "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, "delivery_orders", "created_at", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "delivery_orders", "address_id", "TEXT");
  ensureColumn(db, "delivery_orders", "payment_method", "TEXT NOT NULL DEFAULT 'nakit'");
  ensureColumn(db, "menu_products", "active", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn(db, "menu_products", "group_name", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "menu_products", "subgroup_name", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "menu_products", "description", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "menu_products", "sku", "TEXT NOT NULL DEFAULT ''");
  db.exec(`
    UPDATE delivery_orders SET phone = '-' WHERE phone IS NULL OR phone = '';
    UPDATE delivery_orders SET address = '' WHERE address IS NULL;
    UPDATE delivery_orders SET note = '' WHERE note IS NULL;
    UPDATE delivery_orders SET items_json = '[]' WHERE items_json IS NULL OR items_json = '';
    UPDATE delivery_orders SET created_at = datetime('now') WHERE created_at IS NULL OR created_at = '';
    UPDATE delivery_orders SET payment_method = 'nakit' WHERE payment_method IS NULL OR payment_method = '';
    UPDATE menu_products SET group_name = category WHERE group_name IS NULL OR group_name = '';
    UPDATE menu_products SET subgroup_name = '' WHERE subgroup_name IS NULL;
    UPDATE menu_products SET description = '' WHERE description IS NULL;
    UPDATE menu_products SET sku = '' WHERE sku IS NULL;
  `);

  db.prepare(`INSERT OR IGNORE INTO app_settings (key, value) VALUES ('service_charge_enabled', '0')`).run();
  db.prepare(`INSERT OR IGNORE INTO app_settings (key, value) VALUES ('service_charge_rate', '10')`).run();

  const counts = {
    users: getCount(db, "users"),
    tables: getCount(db, "restaurant_tables"),
    products: getCount(db, "menu_products"),
    modifiers: getCount(db, "menu_modifiers"),
    messages: getCount(db, "quick_messages"),
    tickets: getCount(db, "kitchen_tickets"),
    deliveries: getCount(db, "delivery_orders"),
    deliveryAddresses: getCount(db, "delivery_addresses"),
    reservations: getCount(db, "reservations"),
    orders: getCount(db, "orders"),
    paymentTerminals: getCount(db, "payment_terminals"),
  };

  if (counts.users === 0) {
    const stmt = db.prepare(
      `
        INSERT INTO users (email, password, name, role, branch, active)
        VALUES (@email, @password, @name, @role, @branch, 1)
      `,
    );
    for (const user of defaultUsers) {
      stmt.run(user);
    }
  } else {
    const stmt = db.prepare(
      `
        INSERT OR IGNORE INTO users (email, password, name, role, branch, active)
        VALUES (@email, @password, @name, @role, @branch, 1)
      `,
    );
    for (const user of defaultUsers) {
      stmt.run(user);
    }
  }

  if (counts.tables === 0) {
    const stmt = db.prepare(`
      INSERT INTO restaurant_tables (name, guest, status, total, progress, area, seats, spend, state)
      VALUES (@name, @guest, @status, @total, @progress, @area, @seats, @spend, @state)
    `);
    for (const table of seedTables) {
      stmt.run(table);
    }
  }

  if (counts.products === 0) {
    const stmt = db.prepare(`
      INSERT INTO menu_products (id, name, category, group_name, subgroup_name, price, prep, tag, description, sku, active)
      VALUES (@id, @name, @category, @groupName, @subgroupName, @price, @prep, @tag, @description, @sku, @active)
    `);
    for (const product of menuProducts) {
      stmt.run({
        ...product,
        groupName: product.groupName ?? product.category,
        subgroupName: product.subgroupName ?? "",
        description: product.description ?? "",
        sku: product.sku ?? "",
        active: Number(product.active),
      });
    }
  }

  if (counts.modifiers === 0) {
    const stmt = db.prepare(`
      INSERT INTO menu_modifiers (id, name, category, price_delta, active)
      VALUES (@id, @name, @category, @priceDelta, @active)
    `);
    for (const modifier of menuModifiers) {
      stmt.run({
        ...modifier,
        active: Number(modifier.active),
      });
    }
  }

  if (counts.messages === 0) {
    const stmt = db.prepare(`
      INSERT INTO quick_messages (id, title, message, active)
      VALUES (@id, @title, @message, @active)
    `);
    for (const message of quickMessages) {
      stmt.run({
        ...message,
        active: Number(message.active),
      });
    }
  }

  if (counts.tickets === 0) {
    const stmt = db.prepare(`
      INSERT INTO kitchen_tickets (id, table_name, guest, lane, minutes, priority, items_json)
      VALUES (@id, @table_name, @guest, @lane, @minutes, @priority, @items_json)
    `);
    for (const ticket of kitchenTickets) {
      stmt.run({
        id: ticket.id,
        table_name: ticket.table,
        guest: ticket.guest,
        lane: ticket.lane,
        minutes: ticket.minutes,
        priority: ticket.priority,
        items_json: JSON.stringify(ticket.items),
      });
    }
  }

  if (counts.deliveries === 0) {
    const stmt = db.prepare(`
      INSERT INTO delivery_orders (id, channel, customer, zone, total, eta, courier, status, phone, address, note, items_json, created_at, address_id, payment_method)
      VALUES (@id, @channel, @customer, @zone, @total, @eta, @courier, @status, @phone, @address, @note, @items_json, @created_at, @address_id, @payment_method)
    `);
    for (const order of deliveryOrders) {
      stmt.run({
        ...order,
        items_json: JSON.stringify(order.items),
        created_at: order.createdAt,
        address_id: order.addressId ?? null,
        payment_method: order.paymentMethod ?? "nakit",
      });
    }
  }

  if (counts.deliveryAddresses === 0) {
    const stmt = db.prepare(`
      INSERT INTO delivery_addresses (id, customer, label, phone, zone, address_line, note, default_address)
      VALUES (@id, @customer, @label, @phone, @zone, @addressLine, @note, @defaultAddress)
    `);
    for (const address of deliveryAddresses) {
      stmt.run({
        ...address,
        defaultAddress: Number(address.defaultAddress),
      });
    }
  }

  if (counts.reservations === 0) {
    const stmt = db.prepare(`
      INSERT INTO reservations (id, name, guests, time, area, phone, note, status)
      VALUES (@id, @name, @guests, @time, @area, @phone, @note, @status)
    `);
    for (const reservation of reservations) {
      stmt.run(reservation);
    }
  }

  if (counts.orders === 0) {
    const legacyOrders = getLegacyOrders();
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, table_name, status, payment, subtotal, service, total, created_at)
      VALUES (@id, @table_name, @status, @payment, @subtotal, @service, @total, @created_at)
    `);
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, item_id, name, qty, price, note)
      VALUES (@order_id, @item_id, @name, @qty, @price, @note)
    `);

    for (const order of legacyOrders) {
      insertOrder.run({
        id: order.id,
        table_name: order.table,
        status: order.status,
        payment: order.payment,
        subtotal: order.subtotal,
        service: order.service,
        total: order.total,
        created_at: order.createdAt,
      });
      for (const item of order.items) {
        insertItem.run({
          order_id: order.id,
          item_id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          note: item.note ?? null,
        });
      }
    }
  }

  if (counts.paymentTerminals === 0) {
    const stmt = db.prepare(`
      INSERT INTO payment_terminals (
        id, name, brand, model, connection_mode, interface_id, ip_address, port, port_name, baud_rate,
        enabled, use_mock, default_timeout_ms, card_timeout_ms, serial_number, ecr_serial_number,
        external_device_brand, external_device_model, notes
      )
      VALUES (
        @id, @name, @brand, @model, @connectionMode, @interfaceId, @ipAddress, @port, @portName, @baudRate,
        @enabled, @useMock, @defaultTimeoutMs, @cardTimeoutMs, @serialNumber, @ecrSerialNumber,
        @externalDeviceBrand, @externalDeviceModel, @notes
      )
    `);
    for (const terminal of paymentTerminals) {
      stmt.run({
        ...terminal,
        enabled: Number(terminal.enabled),
        useMock: Number(terminal.useMock),
      });
    }
  }
}

export function getDb() {
  if (!dbInstance) {
    mkdirSync(dataDirectory, { recursive: true });
    dbInstance = new Database(databasePath);
    initializeDatabase(dbInstance);
  }

  return dbInstance;
}
