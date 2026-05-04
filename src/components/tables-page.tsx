import Link from "next/link";

import { PosScreen } from "@/components/pos-screen";
import { areaFilters, summaryCards, type TableItem } from "@/lib/pos-data";

const stateStyles = {
  dolu: "bg-[#f22d76] text-white",
  rezerve: "bg-[#dba66c] text-white",
  musait: "bg-white text-[#5e556e]",
};

type TablesPageProps = {
  tables: TableItem[];
};

export function TablesPage({ tables }: TablesPageProps) {
  const filledCount = tables.filter((table) => table.state === "dolu").length;
  const reservedCount = tables.filter((table) => table.state === "rezerve").length;
  const availableCount = tables.filter((table) => table.state === "musait").length;
  const totalAmount = tables.reduce((sum, table) => sum + table.spend, 0);

  return (
    <PosScreen
      section="Masalar"
      backHref="/"
      leftTools={[
        { label: "Barkod", short: "B", href: "/hizli-satis" },
        { label: "Duzenle", short: "D", href: "/ayarlar" },
        { label: "Iptal", short: "X", href: "/masa-yonetimi" },
        { label: "Paket", short: "P", href: "/paket-servis" },
        { label: "Notlar", short: "N", href: "/raporlar" },
        { label: "Tasi", short: ">", href: "/siparis" },
      ]}
      leftPanel={
        <div className="flex h-full flex-col">
          <div className="border-b border-[#ddd4e5] px-5 py-4">
            <p className="text-lg font-bold text-[#f22d76]">{filledCount} ADISYON</p>
          </div>

          <div className="flex-1 overflow-auto">
            {tables
              .filter((table) => table.state !== "musait")
              .map((table, index) => (
                <div key={table.name} className="flex items-center justify-between border-b border-[#e4dde9] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#f22d76] px-3 py-1 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-[#4f465f]">{table.name}</p>
                      <p className="text-sm text-[#8d839d]">{table.guest}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#7d718e]">17:{20 + index}</p>
                    <p className="text-lg font-semibold text-[#4f465f]">{table.total}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="border-t border-[#ddd4e5] px-5 py-4">
            <div className="flex items-center justify-between text-[#483f60]">
              <span className="text-xl font-semibold">TOPLAM</span>
              <span className="text-4xl font-bold">₺{totalAmount.toLocaleString("tr-TR")}</span>
            </div>
          </div>
        </div>
      }
      mainPanel={
        <div className="h-full px-5 py-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#7b718b]">
              <span>Katlar</span>
              <span>{">"}</span>
              <span className="font-semibold text-[#564b68]">Salon</span>
            </div>
            <div className="flex items-center gap-2 text-[#4a3d64]">
              <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold">o o</div>
              <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold">[]</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {tables.map((table) => (
              <Link
                key={table.name}
                href="/siparis"
                className={`flex min-h-[170px] flex-col justify-between rounded-[20px] border border-[#ddd4e5] p-4 shadow-sm transition hover:-translate-y-0.5 ${stateStyles[table.state]}`}
              >
                <div className="mx-auto h-2 w-14 rounded-full bg-[#d8d0df]" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{table.name.replace("T", "Salon ")}</p>
                  <p className={`mt-2 text-lg ${table.state === "musait" ? "text-[#8a8199]" : "text-white/90"}`}>
                    {table.state === "musait" ? "Bos" : table.total}
                  </p>
                </div>
                <div className="flex items-end justify-between text-sm">
                  <span>{table.guest === "Musait" ? "" : table.guest.split(" ")[0]}</span>
                  <span>{table.state === "rezerve" ? "Rezervo" : `19:${String(3 + table.seats).padStart(2, "0")}`}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      }
      rightPanel={
        <div className="h-full px-4 py-5">
          <p className="mb-4 text-right text-xs uppercase tracking-[0.34em] text-white/60">Masalar</p>
          <div className="space-y-3">
            <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#35195d]">
              Dolu Masalar
            </button>
            {areaFilters.slice(1).map((filter, index) => (
              <button
                key={filter}
                className={`w-full rounded-full px-4 py-3 text-sm font-semibold ${
                  index === 0 ? "bg-white text-[#35195d]" : "bg-white/5 text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3 rounded-[22px] bg-white/5 p-4 text-sm text-white/80">
            <p>Dolu Masa: {filledCount}</p>
            <p>Rezervasyon: {reservedCount}</p>
            <p>Musait: {availableCount}</p>
            <p>{summaryCards[0].title}: {summaryCards[0].value}</p>
          </div>
        </div>
      }
    />
  );
}
