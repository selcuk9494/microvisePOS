import {
  type KitchenTicket,
  type DeliveryOrder,
  type DeliveryOrderLineItem,
  type MenuProduct,
  type ReservationItem,
  type TableItem,
} from "@/lib/pos-data";
import { getDb } from "@/lib/database";
import type { UserRole } from "@/lib/user-types";

export type StoredOrderItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
  note?: string;
};

export type StoredOrder = {
  id: string;
  table: string;
  status: "acik" | "mutfaga-gonderildi" | "beklemede" | "odendi";
  payment: "bekliyor" | "nakit" | "kart";
  items: StoredOrderItem[];
  subtotal: number;
  service: number;
  total: number;
  createdAt: string;
};

export type StoreData = {
  tables: TableItem[];
  menuProducts: MenuProduct[];
  kitchenTickets: KitchenTicket[];
  deliveryOrders: DeliveryOrder[];
  reservations: ReservationItem[];
  orders: StoredOrder[];
};

export type PaymentSnapshotItem = {
  label: string;
  amount: number;
  count: number;
  share: number;
};

export type TopProductSnapshotItem = {
  name: string;
  qty: number;
  revenue: number;
};

export type HourlySnapshotItem = {
  hour: string;
  value: number;
};

export type RoleSnapshotItem = {
  role: UserRole;
  count: number;
};

function formatOrderId(orderCount: number) {
  return `ADS-${String(orderCount + 1001).padStart(4, "0")}`;
}

type ServiceChargeSettings = {
  enabled: boolean;
  rate: number;
};

function getServiceChargeSettings(): ServiceChargeSettings {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT key, value
        FROM app_settings
        WHERE key IN ('service_charge_enabled', 'service_charge_rate')
      `,
    )
    .all() as Array<{ key: string; value: string }>;

  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const enabled = values.service_charge_enabled === "1";
  const parsedRate = Number(values.service_charge_rate ?? "10");

  return {
    enabled,
    rate: Number.isFinite(parsedRate) ? Math.max(0, parsedRate) : 10,
  };
}

function calculateOrderTotals(items: StoredOrderItem[]) {
  const subtotal = items.reduce((total, item) => total + item.qty * item.price, 0);
  const serviceSettings = getServiceChargeSettings();
  const service = serviceSettings.enabled ? Math.round(subtotal * (serviceSettings.rate / 100)) : 0;
  const total = subtotal + service;

  return { subtotal, service, total };
}

function mapTables() {
  const db = getDb();
  return db
    .prepare(
      `
        SELECT name, guest, status, total, progress, area, seats, spend, state
        FROM restaurant_tables
        ORDER BY name
      `,
    )
    .all() as TableItem[];
}

function mapMenuProducts() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, name, category, price, prep, tag, active
        FROM menu_products
        ORDER BY id
      `,
    )
    .all() as Array<MenuProduct & { active: number | boolean }>;

  return rows.map((row) => ({
    ...row,
    active: Boolean(row.active),
  }));
}

function normalizeDeliveryItems(itemsJson: string | null) {
  const parsed = JSON.parse(itemsJson ?? "[]") as Array<string | DeliveryOrderLineItem>;

  return parsed.map((item, index) => {
    if (typeof item === "string") {
      const match = item.match(/^(\d+)x\s+(.+)$/);
      const qty = Number(match?.[1] ?? 1);
      const name = match?.[2] ?? item;

      return {
        productId: index + 1,
        name,
        qty,
        unitPrice: 0,
        totalPrice: 0,
        modifiers: [],
        note: "",
      } satisfies DeliveryOrderLineItem;
    }

    return {
      productId: item.productId,
      name: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      modifiers: item.modifiers ?? [],
      note: item.note ?? "",
    } satisfies DeliveryOrderLineItem;
  });
}

function mapKitchenTickets() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, table_name, guest, lane, minutes, priority, items_json
        FROM kitchen_tickets
        ORDER BY id DESC
      `,
    )
    .all() as Array<{
      id: string;
      table_name: string;
      guest: string;
      lane: KitchenTicket["lane"];
      minutes: number;
      priority: KitchenTicket["priority"];
      items_json: string;
    }>;

  return rows.map((row) => ({
    id: row.id,
    table: row.table_name,
    guest: row.guest,
    lane: row.lane,
    minutes: row.minutes,
    priority: row.priority,
    items: JSON.parse(row.items_json) as string[],
  }));
}

function mapDeliveryOrders() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT id, channel, customer, zone, total, eta, courier, status, phone, address, note, items_json, created_at
               , address_id, payment_method
        FROM delivery_orders
        ORDER BY id DESC
      `,
    )
    .all() as Array<{
      id: string;
      channel: string;
      customer: string;
      zone: string;
      total: string;
      eta: string;
      courier: string;
      status: DeliveryOrder["status"];
      phone: string | null;
      address: string | null;
      note: string | null;
      items_json: string | null;
      created_at: string | null;
      address_id: string | null;
      payment_method: DeliveryOrder["paymentMethod"] | null;
    }>;

  return rows.map((row) => ({
    id: row.id,
    channel: row.channel,
    customer: row.customer,
    zone: row.zone,
    total: row.total,
    eta: row.eta,
    courier: row.courier,
    status: row.status,
    phone: row.phone ?? "-",
    address: row.address ?? "",
    note: row.note ?? "",
      items: normalizeDeliveryItems(row.items_json),
    createdAt: row.created_at ?? "",
      addressId: row.address_id ?? undefined,
      paymentMethod: row.payment_method ?? "nakit",
  }));
}

function mapReservations() {
  const db = getDb();
  return db
    .prepare(
      `
        SELECT id, name, guests, time, area, phone, note, status
        FROM reservations
        ORDER BY id DESC
      `,
    )
    .all() as ReservationItem[];
}

function mapOrders() {
  const db = getDb();
  const orders = db
    .prepare(
      `
        SELECT id, table_name, status, payment, subtotal, service, total, created_at
        FROM orders
        ORDER BY datetime(created_at) DESC, id DESC
      `,
    )
    .all() as Array<{
      id: string;
      table_name: string;
      status: StoredOrder["status"];
      payment: StoredOrder["payment"];
      subtotal: number;
      service: number;
      total: number;
      created_at: string;
    }>;

  const items = db
    .prepare(
      `
        SELECT order_id, item_id, name, qty, price, note
        FROM order_items
        ORDER BY rowid ASC
      `,
    )
    .all() as Array<{
      order_id: string;
      item_id: number;
      name: string;
      qty: number;
      price: number;
      note: string | null;
    }>;

  return orders.map((order) => ({
    id: order.id,
    table: order.table_name,
    status: order.status,
    payment: order.payment,
    subtotal: order.subtotal,
    service: order.service,
    total: order.total,
    createdAt: order.created_at,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.item_id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        note: item.note ?? undefined,
      })),
  }));
}

function parseCurrencyLabel(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

function getPaymentBreakdown(orders: StoredOrder[]) {
  const totals = {
    kart: 0,
    nakit: 0,
    bekliyor: 0,
  };
  const counts = {
    kart: 0,
    nakit: 0,
    bekliyor: 0,
  };

  for (const order of orders) {
    if (order.payment === "kart") {
      totals.kart += order.total;
      counts.kart += 1;
    } else if (order.payment === "nakit") {
      totals.nakit += order.total;
      counts.nakit += 1;
    } else {
      totals.bekliyor += order.total;
      counts.bekliyor += 1;
    }
  }

  const totalRevenue = totals.kart + totals.nakit + totals.bekliyor;

  return [
    {
      label: "Kart",
      amount: totals.kart,
      count: counts.kart,
      share: totalRevenue ? Math.round((totals.kart / totalRevenue) * 100) : 0,
    },
    {
      label: "Nakit",
      amount: totals.nakit,
      count: counts.nakit,
      share: totalRevenue ? Math.round((totals.nakit / totalRevenue) * 100) : 0,
    },
    {
      label: "Bekliyor",
      amount: totals.bekliyor,
      count: counts.bekliyor,
      share: totalRevenue ? Math.round((totals.bekliyor / totalRevenue) * 100) : 0,
    },
  ] satisfies PaymentSnapshotItem[];
}

function getTopProducts(orders: StoredOrder[], limit = 4) {
  const aggregate = new Map<string, TopProductSnapshotItem>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = aggregate.get(item.name) ?? {
        name: item.name,
        qty: 0,
        revenue: 0,
      };

      current.qty += item.qty;
      current.revenue += item.qty * item.price;
      aggregate.set(item.name, current);
    }
  }

  return [...aggregate.values()]
    .sort((left, right) => {
      if (right.qty === left.qty) {
        return right.revenue - left.revenue;
      }

      return right.qty - left.qty;
    })
    .slice(0, limit);
}

function getHourlySales(orders: StoredOrder[]) {
  const buckets = [
    { hour: "12:00", min: 0, max: 12 },
    { hour: "14:00", min: 12, max: 14 },
    { hour: "16:00", min: 14, max: 16 },
    { hour: "18:00", min: 16, max: 18 },
    { hour: "20:00", min: 18, max: 20 },
    { hour: "22:00", min: 20, max: 24 },
  ];

  return buckets.map((bucket) => ({
    hour: bucket.hour,
    value: orders
      .filter((order) => {
        const hour = new Date(order.createdAt).getHours();
        return hour >= bucket.min && hour < bucket.max;
      })
      .reduce((total, order) => total + order.total, 0),
  })) satisfies HourlySnapshotItem[];
}

function getRoleSummary() {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT role, COUNT(*) AS count
        FROM users
        WHERE active = 1
        GROUP BY role
      `,
    )
    .all() as Array<{ role: UserRole; count: number }>;

  return rows.sort((left, right) => right.count - left.count) satisfies RoleSnapshotItem[];
}

export async function readStore() {
  return {
    tables: mapTables(),
    menuProducts: mapMenuProducts(),
    kitchenTickets: mapKitchenTickets(),
    deliveryOrders: mapDeliveryOrders(),
    reservations: mapReservations(),
    orders: mapOrders(),
  } satisfies StoreData;
}

function replaceTables(nextTables: TableItem[]) {
  const db = getDb();
  db.prepare("DELETE FROM restaurant_tables").run();
  const insert = db.prepare(`
    INSERT INTO restaurant_tables (name, guest, status, total, progress, area, seats, spend, state)
    VALUES (@name, @guest, @status, @total, @progress, @area, @seats, @spend, @state)
  `);

  for (const table of nextTables) {
    insert.run(table);
  }
}

function replaceReservations(nextReservations: ReservationItem[]) {
  const db = getDb();
  db.prepare("DELETE FROM reservations").run();
  const insert = db.prepare(`
    INSERT INTO reservations (id, name, guests, time, area, phone, note, status)
    VALUES (@id, @name, @guests, @time, @area, @phone, @note, @status)
  `);

  for (const reservation of nextReservations) {
    insert.run(reservation);
  }
}

function replaceDeliveryOrders(nextDeliveryOrders: DeliveryOrder[]) {
  const db = getDb();
  db.prepare("DELETE FROM delivery_orders").run();
  const insert = db.prepare(`
    INSERT INTO delivery_orders (id, channel, customer, zone, total, eta, courier, status, phone, address, note, items_json, created_at, address_id, payment_method)
    VALUES (@id, @channel, @customer, @zone, @total, @eta, @courier, @status, @phone, @address, @note, @items_json, @created_at, @address_id, @payment_method)
  `);

  for (const order of nextDeliveryOrders) {
    insert.run({
      ...order,
      items_json: JSON.stringify(order.items),
      created_at: order.createdAt,
      address_id: order.addressId ?? null,
      payment_method: order.paymentMethod ?? "nakit",
    });
  }
}

function replaceKitchenTickets(nextTickets: KitchenTicket[]) {
  const db = getDb();
  db.prepare("DELETE FROM kitchen_tickets").run();
  const insert = db.prepare(`
    INSERT INTO kitchen_tickets (id, table_name, guest, lane, minutes, priority, items_json)
    VALUES (@id, @table_name, @guest, @lane, @minutes, @priority, @items_json)
  `);

  for (const ticket of nextTickets) {
    insert.run({
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

function replaceOrders(nextOrders: StoredOrder[]) {
  const db = getDb();
  db.prepare("DELETE FROM order_items").run();
  db.prepare("DELETE FROM orders").run();

  const insertOrder = db.prepare(`
    INSERT INTO orders (id, table_name, status, payment, subtotal, service, total, created_at)
    VALUES (@id, @table_name, @status, @payment, @subtotal, @service, @total, @created_at)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, item_id, name, qty, price, note)
    VALUES (@order_id, @item_id, @name, @qty, @price, @note)
  `);

  for (const order of nextOrders) {
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

export async function updateStore(updater: (current: StoreData) => StoreData | Promise<StoreData>) {
  const current = await readStore();
  const next = await updater(current);
  const db = getDb();

  db.transaction(() => {
    replaceTables(next.tables);
    replaceKitchenTickets(next.kitchenTickets);
    replaceDeliveryOrders(next.deliveryOrders);
    replaceReservations(next.reservations);
    replaceOrders(next.orders);
  })();

  return readStore();
}

export async function createOrder(input: {
  table: string;
  items: StoredOrderItem[];
  sendToKitchen?: boolean;
}) {
  return updateStore((current) => {
    const { subtotal, service, total } = calculateOrderTotals(input.items);
    const createdAt = new Date().toISOString();

    const newOrder: StoredOrder = {
      id: formatOrderId(current.orders.length),
      table: input.table,
      status: input.sendToKitchen ? "mutfaga-gonderildi" : "acik",
      payment: "bekliyor",
      items: input.items,
      subtotal,
      service,
      total,
      createdAt,
    };

    const nextTables = current.tables.map((table) =>
      table.name === input.table
        ? {
            ...table,
            guest: table.guest === "Musait" ? "Yeni Misafir" : table.guest,
            state: "dolu" as const,
            status: input.sendToKitchen ? "Siparis Alindi" : "Acik Adisyon",
            total: `TL${total}`,
            spend: total,
            progress: Math.max(table.progress, input.sendToKitchen ? 25 : 10),
          }
        : table,
    );

    const nextKitchenTickets = input.sendToKitchen
      ? [
          {
            id: `K-${String(current.kitchenTickets.length + 101).padStart(3, "0")}`,
            table: input.table,
            guest: "Yeni Misafir",
            lane: "yeni" as const,
            minutes: 0,
            items: input.items.map((item) => `${item.qty}x ${item.name}`),
            priority: "normal" as const,
          },
          ...current.kitchenTickets,
        ]
      : current.kitchenTickets;

    return {
      ...current,
      tables: nextTables,
      kitchenTickets: nextKitchenTickets,
      orders: [newOrder, ...current.orders],
    };
  });
}

export async function updateOrderById(
  id: string,
  updates: Partial<Pick<StoredOrder, "status" | "payment" | "table" | "items" | "subtotal" | "service" | "total">>,
) {
  return updateStore((current) => {
    const recalculatedTotals = updates.items ? calculateOrderTotals(updates.items) : null;
    const nextOrders = current.orders.map((order) =>
      order.id === id
        ? {
            ...order,
            ...updates,
            ...(recalculatedTotals ?? {}),
          }
        : order,
    );

    const updatedOrder = nextOrders.find((order) => order.id === id);

    if (!updatedOrder) {
      return current;
    }

    const nextTables = current.tables.map((table) => {
      if (table.name === updatedOrder.table) {
        return {
          ...table,
          state: updatedOrder.status === "odendi" ? "musait" as const : "dolu" as const,
          guest: updatedOrder.status === "odendi" ? "Musait" : table.guest,
          status: updatedOrder.status === "odendi" ? "Hazir" : "Siparis Alindi",
          total: updatedOrder.status === "odendi" ? "TL0" : `TL${updatedOrder.total}`,
          spend: updatedOrder.status === "odendi" ? 0 : updatedOrder.total,
          progress: updatedOrder.status === "odendi" ? 0 : Math.max(table.progress, 25),
        };
      }

      return table;
    });

    return {
      ...current,
      tables: nextTables,
      orders: nextOrders,
    };
  });
}

export async function getOrderSettings() {
  return {
    serviceCharge: getServiceChargeSettings(),
  };
}

export async function updateOrderSettings(input: { serviceChargeEnabled?: boolean; serviceChargeRate?: number }) {
  const db = getDb();

  if (typeof input.serviceChargeEnabled === "boolean") {
    db.prepare(
      `
        INSERT INTO app_settings (key, value)
        VALUES ('service_charge_enabled', @value)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
    ).run({ value: input.serviceChargeEnabled ? "1" : "0" });
  }

  if (typeof input.serviceChargeRate === "number" && Number.isFinite(input.serviceChargeRate)) {
    db.prepare(
      `
        INSERT INTO app_settings (key, value)
        VALUES ('service_charge_rate', @value)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
    ).run({ value: String(Math.max(0, input.serviceChargeRate)) });
  }

  return getOrderSettings();
}

export async function moveOrderToTable(id: string, nextTableName: string) {
  return updateStore((current) => {
    const targetOrder = current.orders.find((order) => order.id === id);

    if (!targetOrder) {
      return current;
    }

    const previousTableName = targetOrder.table;
    const nextOrders = current.orders.map((order) =>
      order.id === id
        ? {
            ...order,
            table: nextTableName,
          }
        : order,
    );

    const nextTables = current.tables.map((table) => {
      if (table.name === previousTableName) {
        return {
          ...table,
          guest: "Musait",
          state: "musait" as const,
          status: "Hazir",
          total: "TL0",
          spend: 0,
          progress: 0,
        };
      }

      if (table.name === nextTableName) {
        return {
          ...table,
          guest: targetOrder.items.length ? targetOrder.items[0]?.name?.slice(0, 12) || "Yeni Misafir" : "Yeni Misafir",
          state: "dolu" as const,
          status: "Siparis Alindi",
          total: `TL${targetOrder.total}`,
          spend: targetOrder.total,
          progress: Math.max(table.progress, 28),
        };
      }

      return table;
    });

    const nextKitchenTickets = current.kitchenTickets.map((ticket) =>
      ticket.table === previousTableName && ticket.lane !== "tamamlandi"
        ? {
            ...ticket,
            table: nextTableName,
          }
        : ticket,
    );

    return {
      ...current,
      tables: nextTables,
      kitchenTickets: nextKitchenTickets,
      orders: nextOrders,
    };
  });
}

export async function advanceKitchenTicket(id: string) {
  const nextLaneMap: Record<KitchenTicket["lane"], KitchenTicket["lane"]> = {
    yeni: "hazirlaniyor",
    hazirlaniyor: "hazir",
    hazir: "tamamlandi",
    tamamlandi: "tamamlandi",
  };

  return updateStore((current) => ({
    ...current,
    kitchenTickets: current.kitchenTickets.map((ticket) =>
      ticket.id === id
        ? {
            ...ticket,
            lane: nextLaneMap[ticket.lane],
            minutes: ticket.minutes + 4,
          }
        : ticket,
    ),
  }));
}

export async function getDashboardSnapshot() {
  const current = await readStore();
  const openTables = current.tables.filter((table) => table.state === "dolu").length;
  const reservationsCount = current.reservations.length;
  const kitchenNew = current.kitchenTickets.filter((ticket) => ticket.lane === "yeni").length;
  const revenue = current.orders.reduce((total, order) => total + order.total, 0);
  const paymentBreakdown = getPaymentBreakdown(current.orders);
  const topProducts = getTopProducts(current.orders);
  const hourlySales = getHourlySales(current.orders);
  const activeUsers = getRoleSummary();

  return {
    revenue,
    openTables,
    reservationsCount,
    kitchenNew,
    tables: current.tables,
    orders: current.orders,
    paymentBreakdown,
    topProducts,
    hourlySales,
    activeUsers,
  };
}

export async function getReportsSnapshot() {
  return getReportsSnapshotWithFilters();
}

type ReportsFilter = {
  range?: "today" | "last7" | "all";
  payment?: "all" | StoredOrder["payment"];
};

function filterOrdersForReports(orders: StoredOrder[], filters: ReportsFilter) {
  const now = new Date();
  const range = filters.range ?? "all";
  const payment = filters.payment ?? "all";

  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    const matchesPayment = payment === "all" ? true : order.payment === payment;
    let matchesRange = true;

    if (range === "today") {
      matchesRange =
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getDate() === now.getDate();
    }

    if (range === "last7") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesRange = createdAt >= sevenDaysAgo;
    }

    return matchesPayment && matchesRange;
  });
}

export async function getReportsSnapshotWithFilters(filters: ReportsFilter = {}) {
  const current = await readStore();
  const filteredOrders = filterOrdersForReports(current.orders, filters);
  const filteredDeliveryOrders = current.deliveryOrders.filter((order) => {
    if ((filters.range ?? "all") === "all") {
      return true;
    }

    const createdAt = new Date(order.createdAt);
    const now = new Date();

    if ((filters.range ?? "all") === "today") {
      return (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getDate() === now.getDate()
      );
    }

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    return createdAt >= sevenDaysAgo;
  });
  const revenue = filteredOrders.reduce((total, order) => total + order.total, 0);
  const averageTicket = filteredOrders.length ? Math.round(revenue / filteredOrders.length) : 0;
  const openTables = current.tables.filter((table) => table.state === "dolu").length;
  const tableTurnover = openTables ? Number((filteredOrders.length / openTables).toFixed(1)) : 0;
  const deliveryRevenue = filteredDeliveryOrders.reduce((total, order) => total + parseCurrencyLabel(order.total), 0);

  return {
    paymentBreakdown: getPaymentBreakdown(filteredOrders),
    hourlySales: getHourlySales(filteredOrders),
    topProducts: getTopProducts(filteredOrders, 6),
    metrics: [
      {
        title: "Gunluk Ciro",
        value: revenue,
        detail: `${filteredOrders.length} filtrelenmis adisyon`,
      },
      {
        title: "Ortalama Fis",
        value: averageTicket,
        detail: "Tum siparislerden hesaplandi",
      },
      {
        title: "Masa Donusumu",
        value: tableTurnover,
        detail: `${openTables} acik masa uzerinden`,
      },
      {
        title: "Paket Cirosu",
        value: deliveryRevenue,
        detail: `${filteredDeliveryOrders.length} filtrelenmis paket siparis`,
      },
    ],
    filters: {
      range: filters.range ?? "all",
      payment: filters.payment ?? "all",
    },
  };
}

export async function getDeliverySnapshot() {
  const current = await readStore();
  const selectedOrder =
    current.deliveryOrders.find((order) => order.status !== "teslim") ?? current.deliveryOrders[0] ?? null;
  const activeTotal = current.deliveryOrders
    .filter((order) => order.status !== "teslim")
    .reduce((total, order) => total + parseCurrencyLabel(order.total), 0);

  return {
    orders: current.deliveryOrders,
    selectedOrder,
    activeTotal,
    incomingCount: current.deliveryOrders.filter((order) => order.status === "hazirlaniyor").length,
    outgoingCount: current.deliveryOrders.filter((order) => order.status === "yolda").length,
    courierAssignedCount: current.deliveryOrders.filter((order) => order.status === "kurye-atandi").length,
    completedCount: current.deliveryOrders.filter((order) => order.status === "teslim").length,
  };
}

export async function createDeliveryOrder(input: {
  channel: string;
  customer: string;
  zone: string;
  total: string;
  eta: string;
  courier: string;
  phone: string;
  address: string;
  note: string;
  items: DeliveryOrderLineItem[];
  addressId?: string;
  paymentMethod?: DeliveryOrder["paymentMethod"];
}) {
  return updateStore((current) => {
    const nextId = `PK-${String(current.deliveryOrders.length + 201).padStart(3, "0")}`;
    const newOrder: DeliveryOrder = {
      id: nextId,
      channel: input.channel.trim(),
      customer: input.customer.trim(),
      zone: input.zone.trim(),
      total: input.total.trim(),
      eta: input.eta.trim(),
      courier: input.courier.trim(),
      status: "hazirlaniyor",
      phone: input.phone.trim(),
      address: input.address.trim(),
      note: input.note.trim(),
      items: input.items,
      createdAt: new Date().toISOString(),
      addressId: input.addressId,
      paymentMethod: input.paymentMethod ?? "nakit",
    };

    return {
      ...current,
      deliveryOrders: [newOrder, ...current.deliveryOrders],
    };
  });
}

export async function updateDeliveryOrder(id: string, updates: Partial<DeliveryOrder>) {
  return updateStore((current) => ({
    ...current,
    deliveryOrders: current.deliveryOrders.map((order) =>
      order.id === id
        ? {
            ...order,
            ...updates,
            items: updates.items ?? order.items,
          }
        : order,
    ),
  }));
}

export async function deleteDeliveryOrder(id: string) {
  return updateStore((current) => ({
    ...current,
    deliveryOrders: current.deliveryOrders.filter((order) => order.id !== id),
  }));
}

export async function getReservationsSnapshot() {
  const current = await readStore();
  const vipCount = current.reservations.filter((reservation) => reservation.area === "VIP").length;

  return {
    reservations: current.reservations,
    totalCount: current.reservations.length,
    waitingCount: current.reservations.filter((reservation) => reservation.status === "bekliyor").length,
    confirmedCount: current.reservations.filter((reservation) => reservation.status === "onaylandi").length,
    arrivedCount: current.reservations.filter((reservation) => reservation.status === "geldi").length,
    vipCount,
  };
}

export async function updateReservationById(id: string, updates: Partial<ReservationItem>) {
  return updateStore((current) => ({
    ...current,
    reservations: current.reservations.map((reservation) =>
      reservation.id === id
        ? {
            ...reservation,
            ...updates,
          }
        : reservation,
    ),
  }));
}

export async function deleteReservationById(id: string) {
  return updateStore((current) => ({
    ...current,
    reservations: current.reservations.filter((reservation) => reservation.id !== id),
  }));
}
