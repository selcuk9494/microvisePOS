import { NextResponse } from "next/server";

import { getReportsSnapshotWithFilters } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range");
  const payment = searchParams.get("payment");

  const snapshot = await getReportsSnapshotWithFilters({
    range: range === "today" || range === "last7" || range === "all" ? range : "all",
    payment:
      payment === "all" || payment === "bekliyor" || payment === "nakit" || payment === "kart"
        ? payment
        : "all",
  });

  return NextResponse.json(snapshot);
}
