import { NextResponse } from "next/server";

import {
  listDeliveryAddresses,
  listMenuModifiers,
  listMenuProducts,
  listQuickMessages,
} from "@/lib/catalog";
import { getOrderSettings } from "@/lib/store";
import { getCurrentSession } from "@/lib/session";
import { listPaymentTerminals, listPaymentTransactions } from "@/lib/payments";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Oturum bulunamadi." }, { status: 401 });
  }

  const [products, modifiers, quickMessages, addresses, terminals, payments, orderSettings] = await Promise.all([
    listMenuProducts(),
    listMenuModifiers(),
    listQuickMessages(),
    listDeliveryAddresses(),
    listPaymentTerminals(),
    listPaymentTransactions(8),
    getOrderSettings(),
  ]);

  return NextResponse.json({
    products,
    modifiers,
    quickMessages,
    addresses,
    terminals,
    payments,
    orderSettings,
  });
}
