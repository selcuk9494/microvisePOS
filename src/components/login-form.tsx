"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@micpos.local");
  const [password, setPassword] = useState("micpos123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setError(data.message ?? "Giris yapilamadi.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Baglanti kurulurken bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong w-full max-w-md rounded-[32px] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-xl font-semibold text-amber-300 ring-accent">
          M
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">Restoran POS</p>
          <h1 className="text-2xl font-semibold text-white">Microvise POS</h1>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Giris</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Operasyon paneline baglanin</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Demo kullanici ile tum modullere erisebilir, siparis kaydi olusturabilir ve API akislarini test edebilirsiniz.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">E-posta</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40"
            placeholder="admin@micpos.local"
            type="email"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Sifre</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40"
            placeholder="micpos123"
            type="password"
          />
        </label>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <button
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Baglaniyor..." : "Giris Yap"}
      </button>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Demo hesaplar</p>
        <div className="mt-3 space-y-2">
          <p>`admin@micpos.local` / `micpos123`</p>
          <p>`kasa@micpos.local` / `micpos123`</p>
          <p>`garson@micpos.local` / `micpos123`</p>
          <p>`mutfak@micpos.local` / `micpos123`</p>
        </div>
      </div>
    </form>
  );
}
