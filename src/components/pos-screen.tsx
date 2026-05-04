"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { SessionChip } from "@/components/session-chip";
import { useSession } from "@/hooks/use-session";
import type { UserRole } from "@/lib/user-types";

type PosTool = {
  label: string;
  short: string;
  href?: string;
  onClick?: () => void;
  permission?: string;
  roles?: UserRole[];
};

type PosTab = {
  label: string;
  active?: boolean;
  count?: string;
};

type PosScreenProps = {
  section: string;
  backHref?: string;
  tabs?: PosTab[];
  leftTools?: PosTool[];
  leftPanel?: React.ReactNode;
  mainPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
};

export function PosScreen({
  section,
  backHref,
  tabs,
  leftTools,
  leftPanel,
  mainPanel,
  rightPanel,
}: PosScreenProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();
  const visibleTools = !leftTools?.length
    ? []
    : loading || !user
      ? leftTools
      : leftTools.filter((tool) => {
          if (tool.permission && !user.permissions.includes(tool.permission)) {
            return false;
          }

          if (tool.roles && !tool.roles.includes(user.role)) {
            return false;
          }

          return true;
        });

  return (
    <main className="min-h-screen bg-[#12062a] p-0 sm:p-3">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col overflow-hidden bg-[#e9e5f0] sm:min-h-[calc(100vh-1.5rem)] sm:rounded-[28px] sm:shadow-[0_30px_80px_rgba(8,4,22,0.32)]">
          <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#e4327a] via-[#b32786] to-[#4f2a86] px-5 py-4 text-white">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (backHref) {
                    router.push(backHref);
                    return;
                  }
                  router.back();
                }}
                className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold"
              >
                {"<"}
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xl font-bold tracking-wide">Microvise POS</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                  {section}
                </span>
              </div>
            </div>

            <div className="hidden items-center gap-6 text-right text-xs font-medium text-white/85 md:flex">
              <div>
                <p>Internet</p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200">Bagli</p>
              </div>
              <div>
                <p>Server</p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200">Bagli</p>
              </div>
              <SessionChip />
            </div>
          </header>

          {tabs?.length ? (
            <div className="flex gap-2 border-b border-[#d6d0df] px-4 pt-3">
              {tabs.map((tab) => (
                <div
                  key={tab.label}
                  className={`rounded-t-[18px] px-5 py-3 text-sm font-semibold ${
                    tab.active ? "bg-white text-[#4f2a86]" : "bg-[#6c4c93] text-white/95"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count ? (
                    <span className="ml-2 rounded-full bg-fuchsia-500 px-2 py-0.5 text-[11px] text-white">
                      {tab.count}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1">
            {visibleTools.length ? (
              <aside className="flex w-[76px] shrink-0 flex-col gap-3 bg-gradient-to-b from-[#b81c72] to-[#542885] px-3 py-4">
                {visibleTools.map((tool) => {
                  const isActive = tool.href ? pathname === tool.href : false;
                  const classes = `flex min-h-[56px] flex-col items-center justify-center rounded-[18px] px-2 py-2 text-center text-[11px] font-semibold transition ${
                    isActive ? "bg-white text-[#a01466]" : "bg-white/8 text-white hover:bg-white/14"
                  }`;

                  if (tool.href) {
                    return (
                      <Link key={tool.label} href={tool.href} className={classes}>
                        <span className="mb-1 text-lg">{tool.short}</span>
                        <span>{tool.label}</span>
                      </Link>
                    );
                  }

                  return (
                    <button key={tool.label} type="button" onClick={tool.onClick} className={classes}>
                      <span className="mb-1 text-lg">{tool.short}</span>
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </aside>
            ) : null}

            {leftPanel ? (
              <aside className="w-[320px] shrink-0 border-r border-[#d7d0de] bg-[#f7f4fa]">
                {leftPanel}
              </aside>
            ) : null}

            <section className="min-w-0 flex-1 bg-[#f6f2fa]">{mainPanel}</section>

            {rightPanel ? (
              <aside className="w-[190px] shrink-0 border-l border-[#d7d0de] bg-[#27124f] text-white">
                {rightPanel}
              </aside>
            ) : null}
          </div>
      </div>
    </main>
  );
}
