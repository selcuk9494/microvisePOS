"use client";

import { useEffect, useState } from "react";

type SessionUser = {
  name: string;
  role: string;
  branch: string;
  permissions?: string[];
};

export function SessionBadge() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session");

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user?: SessionUser };
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      }
    };

    void loadSession();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Aktif Kullanici</p>
      <p className="mt-2 text-sm font-semibold text-white">{user.name}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">{user.role}</span>
        <span className="text-slate-400">{user.branch}</span>
      </div>
    </div>
  );
}
