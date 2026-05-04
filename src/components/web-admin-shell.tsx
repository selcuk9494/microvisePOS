"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SessionChip } from "@/components/session-chip";
import { useSession } from "@/hooks/use-session";

type WebShellProps = {
  title: string;
  children: React.ReactNode;
};

const webNav = [
  { href: "/", label: "Ana Panel", short: "A", permission: "dashboard" },
  { href: "/raporlar", label: "Raporlar", short: "R", permission: "rapor" },
  { href: "/masa-yonetimi", label: "Masalar", short: "M", permission: "masa" },
  { href: "/hizli-satis", label: "Hizli Satis", short: "H", permission: "siparis" },
  { href: "/paket-servis", label: "Paket", short: "P", permission: "paket" },
  { href: "/ayarlar", label: "Ayarlar", short: "Y", permission: "ayar" },
];

export function WebAdminShell({ title, children }: WebShellProps) {
  const pathname = usePathname();
  const { user, loading } = useSession();
  const visibleNav = loading || !user
    ? webNav
    : webNav.filter((item) => user.permissions.includes(item.permission));

  return (
    <main className="min-h-screen bg-[#e8edf2] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[28px] bg-[#f7f8fb] shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <div className="flex min-h-[calc(100vh-2.5rem)]">
          <aside className="flex w-[92px] shrink-0 flex-col items-center bg-[#1e232d] py-6 text-white">
            <div className="text-xs font-semibold tracking-[0.18em]">MICROVISE</div>
            <nav className="mt-10 flex flex-1 flex-col gap-3">
              {visibleNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                      active ? "bg-[#d946ef] text-[#2a1330]" : "bg-white/5 text-white/85 hover:bg-white/10"
                    }`}
                    title={item.label}
                  >
                    {item.short}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto text-[10px] uppercase tracking-[0.26em] text-white/45">TR</div>
          </aside>

          <section className="min-w-0 flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">web panel</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-[#d946ef]/15 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b227c5]">Abonelik Durumu</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Aktif</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">SUSHI & NIGIRI</p>
                  <p className="text-xs text-slate-500">sushihandgrill@micpos.co</p>
                </div>
                <SessionChip variant="light" />
              </div>
            </header>

            <div className="p-8">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
