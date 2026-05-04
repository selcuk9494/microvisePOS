import Link from "next/link";

import { WebAdminShell } from "@/components/web-admin-shell";
import { summaryCards, type TableItem } from "@/lib/pos-data";
import type {
  HourlySnapshotItem,
  PaymentSnapshotItem,
  RoleSnapshotItem,
  TopProductSnapshotItem,
} from "@/lib/store";

type DashboardPageProps = {
  revenue: number;
  openTables: number;
  reservationsCount: number;
  kitchenNew: number;
  tables: TableItem[];
  paymentBreakdown: PaymentSnapshotItem[];
  topProducts: TopProductSnapshotItem[];
  hourlySales: HourlySnapshotItem[];
  activeUsers: RoleSnapshotItem[];
};

export function DashboardPage({
  revenue,
  openTables,
  reservationsCount,
  kitchenNew,
  tables,
  paymentBreakdown,
  topProducts,
  hourlySales,
  activeUsers,
}: DashboardPageProps) {
  const liveSummaryCards = [
    {
      ...summaryCards[0],
      value: `TL${revenue.toLocaleString("tr-TR")}`,
      detail: "Kayitli siparisler uzerinden hesaplandi",
    },
    {
      ...summaryCards[1],
      value: `${openTables} / ${tables.length}`,
      detail: `${reservationsCount} rezervasyon plani aktif`,
    },
    {
      ...summaryCards[2],
      value: String(kitchenNew),
      change: `${kitchenNew} yeni fis`,
      detail: "Mutfaga dusen canli siparis adedi",
    },
    {
      ...summaryCards[3],
      value: `${activeUsers.reduce((total, item) => total + item.count, 0)} kisi`,
      detail: "Aktif personel hesabi",
    },
  ];
  const totalPayments = paymentBreakdown.reduce((total, item) => total + item.amount, 0);

  return (
    <WebAdminShell title="Yonetim Ozeti">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] bg-[#f26768] p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/75">Bugun</p>
                <p className="mt-3 text-4xl font-bold">₺{revenue.toLocaleString("tr-TR")}</p>
              </div>
              <span className="rounded-lg bg-[#ffd86d] px-3 py-1 text-xs font-bold text-[#7f5721]">+18.4%</span>
            </div>
            <p className="mt-3 text-sm text-white/80">Yarin dun ayni saate gore daha yuksek</p>
          </div>

          <div className="rounded-[22px] bg-[#6e6be8] p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/75">Bu Hafta</p>
                <p className="mt-3 text-4xl font-bold">₺{(revenue * 4.2).toLocaleString("tr-TR")}</p>
              </div>
              <span className="rounded-lg bg-[#ffd86d] px-3 py-1 text-xs font-bold text-[#7f5721]">Acik</span>
            </div>
            <p className="mt-3 text-sm text-white/80">%13.1 gecen haftaya gore daha dusuk</p>
          </div>

          <div className="rounded-[22px] bg-[#2bcbb4] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/75">Satis</p>
            <p className="mt-3 text-4xl font-bold">{tables.length}</p>
            <p className="mt-3 text-sm text-white/80">Toplam masa tanimi</p>
            <Link href="/siparis" className="mt-5 inline-flex rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold">
              Satislara git
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Istanbul, TR</p>
              <div className="mt-8 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-slate-900">30°</p>
                  <p className="text-sm text-slate-500">Sali</p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-[#f6d25a]" />
              </div>
              <p className="mt-5 text-sm text-slate-500">Saat 17:46, Acik</p>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Gunluk Satis</p>
              <div className="mt-5 flex h-36 items-end gap-3">
                {hourlySales.map((point) => {
                  const maxValue = Math.max(...hourlySales.map((item) => item.value), 1);
                  return (
                    <div key={point.hour} className="flex-1">
                      <div className="rounded-t-xl bg-[#cfeef0]" style={{ height: `${Math.max((point.value / maxValue) * 100, 12)}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-400">
                {hourlySales.map((point) => (
                  <span key={point.hour}>{point.hour}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] bg-[#edca5e] p-5 text-[#584511]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8d6b11]">Simdiki Kur</p>
              <p className="mt-6 text-4xl font-bold">£12.0406</p>
              <p className="mt-3 text-sm">GBP/TRY</p>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Personel Dagilimi</p>
              <div className="mt-4 space-y-3">
                {activeUsers.map((person) => (
                  <div key={person.role} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{person.role}</p>
                      <p className="text-slate-500">Aktif personel</p>
                    </div>
                    <span className="font-semibold text-[#2bcbb4]">{person.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Ciro</p>
            <div className="mt-4 space-y-4">
              {paymentBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">₺{item.amount.toLocaleString("tr-TR")}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#2bcbb4] px-4 py-3 text-white">
              <span className="font-medium">TOPLAM</span>
              <span className="text-xl font-bold">₺{totalPayments.toLocaleString("tr-TR")}</span>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">En Cok Satanlar</p>
            <div className="mt-4 flex items-center gap-5">
              <div className="h-36 w-36 rounded-full bg-[conic-gradient(#4ca8ff_0_35%,#f7a53a_35%_60%,#d6e6f3_60%_82%,#7f9cb5_82%_100%)] p-6">
                <div className="h-full w-full rounded-full bg-white" />
              </div>
              <div className="flex-1 space-y-3">
                {topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{product.name}</span>
                    <span className="font-semibold text-slate-900">{product.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {liveSummaryCards.slice(1, 3).map((card) => (
              <div key={card.title} className="rounded-[20px] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.title}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WebAdminShell>
  );
}
