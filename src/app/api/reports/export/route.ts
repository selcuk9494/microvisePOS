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

  const rows = [
    ["Metrik", "Deger", "Detay"],
    ...snapshot.metrics.map((metric) => [metric.title, String(metric.value), metric.detail]),
    ["", "", ""],
    ["Odeme Tipi", "Tutar", "Adet"],
    ...snapshot.paymentBreakdown.map((item) => [item.label, String(item.amount), String(item.count)]),
    ["", "", ""],
    ["Urun", "Satis", "Ciro"],
    ...snapshot.topProducts.map((item) => [item.name, String(item.qty), String(item.revenue)]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="micpos-rapor-${snapshot.filters.range}-${snapshot.filters.payment}.csv"`,
    },
  });
}
