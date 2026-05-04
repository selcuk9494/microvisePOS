import { ReportsPage } from "@/components/reports-page";
import { requireRole } from "@/lib/session";
import { getReportsSnapshot } from "@/lib/store";

export default async function RaporlarPage() {
  await requireRole(["Yonetici", "Kasiyer"]);
  const snapshot = await getReportsSnapshot();

  return (
    <ReportsPage
      paymentBreakdown={snapshot.paymentBreakdown}
      hourlySales={snapshot.hourlySales}
      topProducts={snapshot.topProducts}
      metrics={snapshot.metrics}
      filters={snapshot.filters}
    />
  );
}
