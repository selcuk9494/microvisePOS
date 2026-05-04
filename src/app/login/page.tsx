import { LoginForm } from "@/components/login-form";
import { redirectIfAuthenticated } from "@/lib/session";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="glass-panel hidden rounded-[36px] p-8 lg:block">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Yeni Nesil Restoran Yonetimi</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-white">
              Hizli, guclu ve premium gorunumlu restoran operasyon merkezi
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Adisyon, masa, mutfak, kurye, rezervasyon ve raporlari ayni urun deneyiminde birlestiren,
              oturum korumali ve API destekli yonetim paneli.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Masa", detail: "Canli salon plani" },
              { title: "Mutfak", detail: "Kanban siparis akisi" },
              { title: "Rapor", detail: "Anlik performans" },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex justify-center">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
