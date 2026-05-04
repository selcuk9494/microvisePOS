import { NextResponse } from "next/server";

import { readStore, updateStore } from "@/lib/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.tables);
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    state?: "musait" | "dolu" | "rezerve";
    guest?: string;
    status?: string;
  };

  if (!body.name) {
    return NextResponse.json({ message: "Masa adi gerekli." }, { status: 400 });
  }

  const next = await updateStore((current) => ({
    ...current,
    tables: current.tables.map((table) =>
      table.name === body.name
        ? {
            ...table,
            state: body.state ?? table.state,
            guest: body.guest ?? table.guest,
            status: body.status ?? table.status,
          }
        : table,
    ),
  }));

  return NextResponse.json(next.tables);
}
