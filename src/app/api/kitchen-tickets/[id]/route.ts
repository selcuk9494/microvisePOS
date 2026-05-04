import { NextResponse } from "next/server";

import { advanceKitchenTicket, readStore } from "@/lib/store";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_: Request, context: Context) {
  const { id } = await context.params;
  const next = await advanceKitchenTicket(id);
  const ticket = next.kitchenTickets.find((item) => item.id === id);

  if (!ticket) {
    return NextResponse.json({ message: "Fis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    ticket,
    kitchenTickets: next.kitchenTickets,
  });
}

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const store = await readStore();
  const ticket = store.kitchenTickets.find((item) => item.id === id);

  if (!ticket) {
    return NextResponse.json({ message: "Fis bulunamadi." }, { status: 404 });
  }

  return NextResponse.json(ticket);
}
