"use client";

import { useSession } from "@/hooks/use-session";

type SessionChipProps = {
  variant?: "dark" | "light";
};

export function SessionChip({ variant = "dark" }: SessionChipProps) {
  const { user } = useSession();

  if (!user) {
    return null;
  }

  if (variant === "light") {
    return (
      <div className="rounded-xl bg-slate-100 px-4 py-2 text-right">
        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">
          {user.role} • {user.branch}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/10 px-4 py-2 text-right text-white">
      <p className="text-sm font-semibold">{user.name}</p>
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">{user.role}</p>
    </div>
  );
}
