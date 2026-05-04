"use client";

import { useEffect, useState } from "react";

import type { SessionUser } from "@/lib/user-types";

export type ClientSessionUser = SessionUser & {
  permissions: string[];
};

export function useSession() {
  const [user, setUser] = useState<ClientSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = (await response.json()) as { user?: ClientSessionUser };
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  return {
    user,
    loading,
  };
}
