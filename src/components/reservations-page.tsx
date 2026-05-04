"use client";

import { useMemo, useState } from "react";

import { PosScreen } from "@/components/pos-screen";
import { useSession } from "@/hooks/use-session";
import type { ReservationItem } from "@/lib/pos-data";

const reservationStyles = {
  onaylandi: "bg-emerald-100 text-emerald-700",
  bekliyor: "bg-amber-100 text-amber-700",
  geldi: "bg-sky-100 text-sky-700",
} as const;

type ReservationsPageProps = {
  reservations: ReservationItem[];
};

export function ReservationsPage({ reservations }: ReservationsPageProps) {
  const { user } = useSession();
  const canManageReservations = user?.role === "Yonetici" || user?.role === "Kasiyer";
  const canDeleteReservations = user?.role === "Yonetici" || user?.role === "Kasiyer";
  const [reservationList, setReservationList] = useState(reservations);
  const [selectedReservationId, setSelectedReservationId] = useState(reservations[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    name: reservations[0]?.name ?? "",
    guests: String(reservations[0]?.guests ?? 2),
    time: reservations[0]?.time ?? "19:30",
    area: reservations[0]?.area ?? "Salon A",
    phone: reservations[0]?.phone ?? "",
    note: reservations[0]?.note ?? "",
    status: reservations[0]?.status ?? ("bekliyor" as ReservationItem["status"]),
  });
  const selectedReservation = useMemo(
    () => reservationList.find((reservation) => reservation.id === selectedReservationId) ?? null,
    [reservationList, selectedReservationId],
  );
  const counts = useMemo(
    () => ({
      total: reservationList.length,
      waiting: reservationList.filter((item) => item.status === "bekliyor").length,
      confirmed: reservationList.filter((item) => item.status === "onaylandi").length,
      arrived: reservationList.filter((item) => item.status === "geldi").length,
      vip: reservationList.filter((item) => item.area === "VIP").length,
    }),
    [reservationList],
  );

  const loadReservationIntoForm = (reservation: ReservationItem) => {
    setForm({
      name: reservation.name,
      guests: String(reservation.guests),
      time: reservation.time,
      area: reservation.area,
      phone: reservation.phone,
      note: reservation.note,
      status: reservation.status,
    });
  };

  const handleCreate = async () => {
    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          guests: Number(form.guests),
        }),
      });
      const data = (await response.json()) as { message?: string; reservation?: ReservationItem };

      if (!response.ok || !data.reservation) {
        setFeedback(data.message ?? "Rezervasyon olusturulamadi.");
        return;
      }

      const nextReservations = [data.reservation, ...reservationList];
      setReservationList(nextReservations);
      setSelectedReservationId(data.reservation.id);
      loadReservationIntoForm(data.reservation);
      setCreating(false);
      setFeedback(`${data.reservation.id} olusturuldu.`);
    } catch {
      setFeedback("Rezervasyon servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (updates?: Partial<ReservationItem>) => {
    if (!selectedReservation) {
      return;
    }

    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          updates ?? {
            name: form.name,
            guests: Number(form.guests),
            time: form.time,
            area: form.area,
            phone: form.phone,
            note: form.note,
            status: form.status,
          },
        ),
      });
      const data = (await response.json()) as { message?: string; reservation?: ReservationItem; reservations?: ReservationItem[] };

      if (!response.ok || !data.reservation || !data.reservations) {
        setFeedback(data.message ?? "Rezervasyon guncellenemedi.");
        return;
      }

      setReservationList(data.reservations);
      loadReservationIntoForm(data.reservation);
      setFeedback(`${data.reservation.id} guncellendi.`);
    } catch {
      setFeedback("Rezervasyon guncelleme servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReservation) {
      return;
    }

    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string; reservations?: ReservationItem[] };

      if (!response.ok || !data.reservations) {
        setFeedback(data.message ?? "Rezervasyon silinemedi.");
        return;
      }

      setReservationList(data.reservations);
      setSelectedReservationId(data.reservations[0]?.id ?? "");
      if (data.reservations[0]) {
        loadReservationIntoForm(data.reservations[0]);
      }
      setFeedback(`${selectedReservation.id} silindi.`);
    } catch {
      setFeedback("Rezervasyon silme servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PosScreen
      section="Rezervasyon"
      tabs={[
        { label: "Bugun", active: true, count: String(counts.total) },
        { label: "Bekleyen", count: String(counts.waiting) },
      ]}
      leftPanel={
        <div className="flex h-full flex-col">
          <div className="border-b border-[#ddd4e5] px-5 py-4">
            <p className="text-lg font-bold text-[#f22d76]">REZERVASYONLAR</p>
          </div>
          <div className="flex-1 overflow-auto">
            {reservationList.map((reservation) => (
              <button
                key={reservation.id}
                onClick={() => {
                  setSelectedReservationId(reservation.id);
                  loadReservationIntoForm(reservation);
                  setCreating(false);
                }}
                className="block w-full border-b border-[#e4dde9] px-5 py-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#f22d76]">{reservation.time}</p>
                    <p className="mt-1 text-lg font-semibold text-[#4f465f]">{reservation.name}</p>
                    <p className="text-sm text-[#8d839d]">{reservation.area}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reservationStyles[reservation.status]}`}>
                    {reservation.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      }
      mainPanel={
        <div className="grid h-full gap-4 px-5 py-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {feedback ? (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{feedback}</div>
            ) : null}

            {creating ? (
              <div className="rounded-[22px] border border-[#ddd4e5] bg-white p-5 shadow-sm">
                <h3 className="text-2xl font-bold text-[#4f465f]">Yeni Rezervasyon</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ad soyad" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none" />
                  <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none" />
                  <input value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} placeholder="Saat" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none" />
                  <input value={form.guests} onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))} placeholder="Kisi sayisi" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none" />
                  <input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Alan" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none" />
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ReservationItem["status"] }))} className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none">
                    <option value="bekliyor">bekliyor</option>
                    <option value="onaylandi">onaylandi</option>
                    <option value="geldi">geldi</option>
                  </select>
                  <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Not" className="min-h-24 rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none md:col-span-2" />
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => void handleCreate()} disabled={!canManageReservations || saving} className="rounded-xl bg-[#63bf77] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Kaydi Olustur</button>
                  <button onClick={() => setCreating(false)} className="rounded-xl bg-[#ede6f5] px-4 py-3 text-sm font-semibold text-[#5a4f6f]">Vazgec</button>
                </div>
              </div>
            ) : selectedReservation ? (
              <div className="rounded-[22px] border border-[#ddd4e5] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8b819b]">{selectedReservation.id}</p>
                    <h3 className="mt-2 text-2xl font-bold text-[#4f465f]">{selectedReservation.name}</h3>
                    <p className="mt-1 text-sm text-[#8d839d]">{selectedReservation.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#4f465f]">{selectedReservation.time}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${reservationStyles[selectedReservation.status]}`}>
                      {selectedReservation.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} disabled={!canManageReservations} placeholder="Ad soyad" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70" />
                  <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} disabled={!canManageReservations} placeholder="Telefon" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70" />
                  <input value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} disabled={!canManageReservations} placeholder="Saat" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70" />
                  <input value={form.guests} onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))} disabled={!canManageReservations} placeholder="Kisi sayisi" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70" />
                  <input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} disabled={!canManageReservations} placeholder="Alan" className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70" />
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ReservationItem["status"] }))} disabled={!canManageReservations} className="rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70">
                    <option value="bekliyor">bekliyor</option>
                    <option value="onaylandi">onaylandi</option>
                    <option value="geldi">geldi</option>
                  </select>
                  <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} disabled={!canManageReservations} placeholder="Not" className="min-h-24 rounded-xl border border-[#ddd4e5] px-4 py-3 text-sm outline-none disabled:opacity-70 md:col-span-2" />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => void handleUpdate()} disabled={!canManageReservations || saving} className="rounded-xl bg-[#63bf77] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Kaydet</button>
                  <button onClick={() => void handleUpdate({ status: "onaylandi" })} disabled={!canManageReservations || saving} className="rounded-xl bg-[#f32774] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Onayla</button>
                  <button onClick={() => void handleUpdate({ status: "geldi" })} disabled={!canManageReservations || saving} className="rounded-xl bg-[#4a297e] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Geldi Isaretle</button>
                  <button onClick={() => { window.location.href = "/siparis"; }} className="rounded-xl bg-[#ede6f5] px-4 py-3 text-sm font-semibold text-[#5a4f6f]">Siparise Donustur</button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#8d839d]">Host Aksiyonlari</p>
              <div className="mt-4 grid gap-3">
                <button
                  onClick={() => {
                    setCreating(true);
                    setForm({
                      name: "",
                      guests: "2",
                      time: "19:30",
                      area: "Salon A",
                      phone: "",
                      note: "",
                      status: "bekliyor",
                    });
                  }}
                  disabled={!canManageReservations}
                  className="rounded-xl bg-[#63bf77] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Rezervasyon Ekle
                </button>
                <button
                  onClick={() => void handleUpdate({ status: "onaylandi" })}
                  disabled={!canManageReservations}
                  className="rounded-xl bg-[#f32774] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  On Odeme Al
                </button>
                <button
                  onClick={() => { window.location.href = "/siparis"; }}
                  disabled={!canManageReservations}
                  className="rounded-xl bg-[#4a297e] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siparise Donustur
                </button>
                <button
                  onClick={() => void handleDelete()}
                  disabled={!canDeleteReservations || saving || !selectedReservation}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Seciliyi Sil
                </button>
              </div>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#8d839d]">Bugun Ozeti</p>
              <div className="mt-4 space-y-3">
                {[
                  `${counts.total} planli rezervasyon`,
                  `${counts.confirmed} onayli giris`,
                  `${counts.waiting} teyit bekleyen kayit`,
                  `${counts.vip} VIP misafir`,
                  `${counts.arrived} geldi durumunda misafir`,
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-[#f5f1fa] px-4 py-3 text-sm text-[#5b516d]">
                    {item}
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
