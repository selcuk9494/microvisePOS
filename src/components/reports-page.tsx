"use client";

import { useEffect, useMemo, useState } from "react";

import { PosScreen } from "@/components/pos-screen";
import type { HourlySnapshotItem, PaymentSnapshotItem, TopProductSnapshotItem } from "@/lib/store";

type ReportsPageProps = {
  paymentBreakdown: PaymentSnapshotItem[];
  hourlySales: HourlySnapshotItem[];
  topProducts: TopProductSnapshotItem[];
  metrics: Array<{
    title: string;
    value: number;
    detail: string;
  }>;
  filters?: {
    range: "today" | "last7" | "all";
    payment: "all" | "bekliyor" | "nakit" | "kart";
  };
};

type ReportState = {
  paymentBreakdown: PaymentSnapshotItem[];
  hourlySales: HourlySnapshotItem[];
  topProducts: TopProductSnapshotItem[];
  metrics: Array<{
    title: string;
    value: number;
    detail: string;
  }>;
};

type ReportTab =
  | "ozet"
  | "satislar"
  | "odemeler"
  | "urunler"
  | "operasyon"
  | "disa-aktar";

const reportTabs: Array<{ id: ReportTab; label: string; helper: string }> = [
  { id: "ozet", label: "Ozet", helper: "Genel tablo" },
  { id: "satislar", label: "Satislar", helper: "Saatlik akis" },
  { id: "odemeler", label: "Odemeler", helper: "Tahsilat dagilimi" },
  { id: "urunler", label: "Urunler", helper: "Cok satanlar" },
  { id: "operasyon", label: "Operasyon", helper: "Servis hizi" },
  { id: "disa-aktar", label: "Disa Aktar", helper: "CSV cikisi" },
];

export function ReportsPage({
  paymentBreakdown,
  hourlySales,
  topProducts,
  metrics,
  filters,
}: ReportsPageProps) {
  const [range, setRange] = useState<"today" | "last7" | "all">(filters?.range ?? "all");
  const [payment, setPayment] = useState<"all" | "bekliyor" | "nakit" | "kart">(filters?.payment ?? "all");
  const [reportState, setReportState] = useState<ReportState>({
    paymentBreakdown,
    hourlySales,
    topProducts,
    metrics,
  });
  const [activeTab, setActiveTab] = useState<ReportTab>("ozet");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports?range=${range}&payment=${payment}`);

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ReportState;
        setReportState(data);
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, [range, payment]);

  const totalAmount = reportState.paymentBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalOrders = reportState.topProducts.reduce((sum, item) => sum + item.qty, 0);
  const averageBasket = totalOrders ? Math.round(totalAmount / totalOrders) : 0;
  const maxHourlyValue = useMemo(
    () => Math.max(...reportState.hourlySales.map((item) => item.value), 1),
    [reportState.hourlySales],
  );

  return (
    <PosScreen
      section="Raporlar"
      leftPanel={
        <div className="h-full bg-gradient-to-b from-[#a70f66] to-[#2b1958] p-4 text-white">
          <div className="rounded-[18px] bg-white/10 px-4 py-5">
            <p className="text-xs uppercase tracking-[0.26em] text-white/60">Canli Rapor</p>
            <p className="mt-2 text-xl font-semibold text-white">Filtreli gorunum</p>
          </div>
          <div className="mt-4 space-y-3">
            {reportTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full rounded-[16px] px-4 py-3 text-left ${
                  activeTab === item.id ? "bg-white text-[#a50e66]" : "bg-white/5 text-white"
                }`}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={`mt-1 text-xs ${activeTab === item.id ? "text-[#7e678f]" : "text-white/65"}`}>
                  {item.helper}
                </p>
              </button>
            ))}
          </div>
        </div>
      }
      mainPanel={
        <div className="h-full px-5 py-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <select
                value={range}
                onChange={(event) => setRange(event.target.value as "today" | "last7" | "all")}
                className="rounded-[14px] border border-[#e5dcef] bg-white px-4 py-3 text-sm font-semibold text-[#5a516b] outline-none"
              >
                <option value="all">Tum Tarihler</option>
                <option value="today">Bugun</option>
                <option value="last7">Son 7 Gun</option>
              </select>
              <select
                value={payment}
                onChange={(event) => setPayment(event.target.value as "all" | "bekliyor" | "nakit" | "kart")}
                className="rounded-[14px] border border-[#e5dcef] bg-white px-4 py-3 text-sm font-semibold text-[#5a516b] outline-none"
              >
                <option value="all">Tum Odemeler</option>
                <option value="nakit">Nakit</option>
                <option value="kart">Kart</option>
                <option value="bekliyor">Bekliyor</option>
              </select>
            </div>
            <div className="rounded-[14px] bg-white px-4 py-3 text-sm font-semibold text-[#8a8199] shadow-sm">
              {loading ? "Raporlar yenileniyor" : "Canli veri gosteriliyor"}
            </div>
          </div>

          {activeTab === "ozet" ? (
            <>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-8">
                    <div className="h-48 w-48 rounded-full bg-[conic-gradient(#51576a_0_38%,#acb6c9_38%_56%,#dad8d0_56%_79%,#ff4f59_79%_89%,#eceff5_89%_100%)] p-8">
                      <div className="h-full w-full rounded-full bg-white" />
                    </div>
                    <div className="space-y-3 text-sm text-[#5d556f]">
                      {reportState.topProducts.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span className={`h-4 w-4 rounded-full ${["bg-[#51576a]", "bg-[#ff4f59]", "bg-[#dad8d0]", "bg-[#acb6c9]", "bg-[#eceff5]"][index] ?? "bg-[#51576a]"}`} />
                          <span>
                            %{Math.max(Math.round((item.revenue / Math.max(totalAmount, 1)) * 100), 1)} {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    {reportState.paymentBreakdown.map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b border-slate-100 pb-4 text-[#5a516b]">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-lg font-semibold">₺{item.amount.toLocaleString("tr-TR")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center justify-between text-[#4d4461]">
                    <span className="text-2xl font-medium">Toplam</span>
                    <span className="text-4xl font-bold text-[#ef3c76]">₺{totalAmount.toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                {reportState.metrics.slice(0, 4).map((metric) => (
                  <div key={metric.title} className="rounded-[22px] bg-white px-6 py-5 text-[#4e4560] shadow-sm">
                    <p className="text-sm font-medium text-[#ef3c76]">{metric.title}</p>
                    <p className="mt-2 text-4xl font-bold">
                      {metric.title === "Masa Donusumu" ? `${metric.value}x` : `₺${metric.value.toLocaleString("tr-TR")}`}
                    </p>
                    <p className="mt-2 text-xs text-[#8a8199]">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "satislar" ? (
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#8a8199]">Saatlik Satis</p>
                  <p className="text-sm font-semibold text-[#ef3c76]">Ortalama Sepet ₺{averageBasket.toLocaleString("tr-TR")}</p>
                </div>
                <div className="mt-4 flex h-56 items-end gap-3">
                  {reportState.hourlySales.map((point) => (
                    <div key={point.hour} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-40 w-full items-end rounded-xl bg-[#f3eff8] p-1">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-[#8640c6] to-[#f25f89]"
                          style={{ height: `${Math.max((point.value / maxHourlyValue) * 100, 18)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#8a8199]">{point.hour}</span>
                      <span className="text-xs font-semibold text-slate-600">₺{point.value.toLocaleString("tr-TR")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#8a8199]">Hizli Ozet</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Toplam Hasilat</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">₺{totalAmount.toLocaleString("tr-TR")}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tahmini Siparis Adedi</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{totalOrders}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">En Yogun Saat</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {reportState.hourlySales.reduce((best, item) => (item.value > best.value ? item : best), reportState.hourlySales[0] ?? { hour: "-", value: 0 }).hour}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "odemeler" ? (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#8a8199]">Odeme Dagilimi</p>
                <div className="mt-4 space-y-3">
                  {reportState.paymentBreakdown.map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        <span className="text-lg font-bold text-[#ef3c76]">₺{item.amount.toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-slate-200">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-[#8640c6] to-[#f25f89]"
                          style={{ width: `${Math.max((item.amount / Math.max(totalAmount, 1)) * 100, 8)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#8a8199]">Odeme KPI</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 px-4 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Toplam Tahsilat</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">₺{totalAmount.toLocaleString("tr-TR")}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Odeme Tipi</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{payment === "all" ? "Tum" : payment}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-[#fff4f8] px-4 py-5 text-sm text-[#7d4560]">
                  Filtreler degistikce odeme dagilimi ve toplamlar ayni anda yenilenir. Boylece kasa, kart ve bekleyen odemeler tek ekrandan izlenir.
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "urunler" ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#8a8199]">Cok Satanlar</p>
                <div className="mt-4 space-y-3">
                  {reportState.topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4 text-[#544b66]">
                      <div className="flex items-center gap-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3eff8] text-sm font-bold text-[#8640c6]">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.qty} adet</p>
                        </div>
                      </div>
                      <span className="font-semibold">₺{product.revenue.toLocaleString("tr-TR")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#8a8199]">Urun Ozeti</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Toplam Adet</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{totalOrders}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">En Iyi Urun</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{reportState.topProducts[0]?.name ?? "-"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sepet Katkisi</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      %{Math.max(Math.round(((reportState.topProducts[0]?.revenue ?? 0) / Math.max(totalAmount, 1)) * 100), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "operasyon" ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {reportState.metrics.map((metric) => (
                <div key={metric.title} className="rounded-[22px] bg-white px-6 py-5 text-[#4e4560] shadow-sm">
                  <p className="text-sm font-medium text-[#ef3c76]">{metric.title}</p>
                  <p className="mt-2 text-4xl font-bold">
                    {metric.title === "Masa Donusumu" ? `${metric.value}x` : `₺${metric.value.toLocaleString("tr-TR")}`}
                  </p>
                  <p className="mt-2 text-xs text-[#8a8199]">{metric.detail}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "disa-aktar" ? (
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-[#8a8199]">Disa Aktarma</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Filtreli raporu CSV olarak indir</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tarih</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{range}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Odeme</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{payment}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Toplam</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">₺{totalAmount.toLocaleString("tr-TR")}</p>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm text-slate-500">
                Bu alan gostermelik degil. Asagidaki buton mevcut filtrelerle `CSV` dosyasi olusturur ve muhasebe ya da yonetim paylasimi icin indirir.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => {
                setLoading(true);
                fetch(`/api/reports?range=${range}&payment=${payment}`)
                  .then((response) => response.json())
                  .then((data: ReportState) => setReportState(data))
                  .finally(() => setLoading(false));
              }}
              className="rounded-[14px] bg-[#f32774] px-6 py-3 text-sm font-semibold text-white"
            >
              YENILE
            </button>
            <a
              href={`/api/reports/export?range=${range}&payment=${payment}`}
              className="rounded-[14px] bg-[#f32774] px-6 py-3 text-sm font-semibold text-white"
            >
              DISA AKTAR
            </a>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#8a8199]">Saatlik Satis</p>
              <div className="mt-4 flex h-40 items-end gap-3">
                {reportState.hourlySales.map((point) => (
                  <div key={point.hour} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end rounded-xl bg-[#f3eff8] p-1">
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-[#8640c6] to-[#f25f89]"
                        style={{ height: `${Math.max((point.value / maxHourlyValue) * 100, 18)}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#8a8199]">{point.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#8a8199]">Cok Satanlar</p>
              <div className="mt-4 space-y-3">
                {reportState.topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between text-[#544b66]">
                    <span>{product.name}</span>
                    <span className="font-semibold">₺{product.revenue.toLocaleString("tr-TR")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
