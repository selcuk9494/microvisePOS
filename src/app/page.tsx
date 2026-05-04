import { DashboardPage } from "@/components/dashboard-page";
import { requireSession } from "@/lib/session";
import { getDashboardSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireSession();
  const snapshot = await getDashboardSnapshot();

  return (
    <DashboardPage
      revenue={snapshot.revenue}
      openTables={snapshot.openTables}
      reservationsCount={snapshot.reservationsCount}
      kitchenNew={snapshot.kitchenNew}
      tables={snapshot.tables}
      paymentBreakdown={snapshot.paymentBreakdown}
      topProducts={snapshot.topProducts}
      hourlySales={snapshot.hourlySales}
      activeUsers={snapshot.activeUsers}
    />
  );
}
