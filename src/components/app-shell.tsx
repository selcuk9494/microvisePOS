"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { SessionBadge } from "@/components/session-badge";
import { branchInfo, navItems } from "@/lib/pos-data";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  eyebrow,
  description,
  actions,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen px-4 py-4 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4">
        <aside className="glass-panel hidden w-72 shrink-0 rounded-[28px] p-5 xl:flex xl:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-xl font-semibold text-amber-300 ring-accent">
              M
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">
                Restoran POS
              </p>
              <h1 className="text-xl font-semibold">Microvise POS</h1>
            </div>
          </Link>

          <nav className="mt-10 space-y-2 text-sm">
            {navItems.map((item) => {
              const isActive = item.href !== "#" && pathname === item.href;

              if (item.href === "#") {
                return (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-slate-500"
                  >
                    <span>{item.title}</span>
                    <span className="text-xs">Yakinda</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? "bg-white/10 text-white shadow-lg shadow-amber-950/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.title}</span>
                  <span className={`text-xs ${isActive ? "text-amber-300" : "text-slate-500"}`}>
                    {item.badge ?? ">"}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[24px] border border-white/10 bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-5">
            <p className="text-sm font-medium text-white">Aksam Yogunlugu</p>
            <p className="mt-2 text-3xl font-semibold">19:00 - 22:30</p>
            <p className="mt-2 text-sm text-slate-300">
              Akilli kapasite tahmini bu saat araliginda %87 doluluk bekliyor.
            </p>
            <div className="mt-4">
              <SessionBadge />
            </div>
            <LogoutButton />
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <header className="glass-panel-strong rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-amber-300">
                  {eyebrow}
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  {title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {description}
                </p>
              </div>

              <div className="grid gap-3 sm:min-w-[320px] sm:grid-cols-2">
                {actions}
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Sube Durumu</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold">{branchInfo.name}</p>
                      <p className="text-sm text-slate-400">{branchInfo.detail}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-300">
                      {branchInfo.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
