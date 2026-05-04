"use client";

import { useMemo, useState } from "react";

import { PosScreen } from "@/components/pos-screen";
import { kitchenTickets } from "@/lib/pos-data";

const laneMeta = {
  yeni: {
    title: "Yeni Siparis",
  },
  hazirlaniyor: {
    title: "Hazirlaniyor",
  },
  hazir: {
    title: "Hazir Servis",
  },
  tamamlandi: {
    title: "Tamamlandi",
  },
} as const;

export function KitchenPage() {
  const lanes = Object.keys(laneMeta) as Array<keyof typeof laneMeta>;
  const [tickets, setTickets] = useState(kitchenTickets);
  const [feedback, setFeedback] = useState("");
  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.lane !== "tamamlandi"),
    [tickets],
  );
  const dynamicFlow = useMemo(
    () =>
      lanes.map((lane) => ({
        title: laneMeta[lane].title,
        count: tickets.filter((ticket) => ticket.lane === lane).length,
      })),
    [lanes, tickets],
  );

  const handleAdvance = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/kitchen-tickets/${ticketId}`, {
        method: "PATCH",
      });
      const data = (await response.json()) as {
        message?: string;
        kitchenTickets?: typeof kitchenTickets;
        ticket?: { lane: string };
      };

      if (!response.ok || !data.kitchenTickets) {
        setFeedback(data.message ?? "Fis guncellenemedi.");
        return;
      }

      setTickets(data.kitchenTickets);
      setFeedback(`Fis ${ticketId} ${data.ticket?.lane ?? "sonraki"} asamasina alindi.`);
    } catch {
      setFeedback("Mutfak servisine baglanirken hata olustu.");
    }
  };

  return (
    <PosScreen
      section="Mutfak"
      leftPanel={
        <div className="flex h-full flex-col">
          <div className="border-b border-[#ddd4e5] px-5 py-4">
            <p className="text-lg font-bold text-[#f22d76]">{activeTickets.length} AKTIF FIS</p>
          </div>

          <div className="flex-1 overflow-auto">
            {feedback ? (
              <div className="border-b border-[#e4dde9] bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
                {feedback}
              </div>
            ) : null}
            {activeTickets.map((ticket) => (
              <div key={ticket.id} className="border-b border-[#e4dde9] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#f22d76]">{ticket.id}</p>
                    <p className="mt-1 text-lg font-semibold text-[#4f465f]">{ticket.table}</p>
                    <p className="text-sm text-[#8d839d]">{ticket.guest}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-[#4f465f]">{ticket.minutes} dk</p>
                    <p className="text-[#8d839d]">{ticket.priority}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      mainPanel={
        <div className="grid h-full gap-4 px-5 py-4 lg:grid-cols-4">
          {lanes.map((lane) => {
            const items = tickets.filter((ticket) => ticket.lane === lane);

            return (
              <div key={lane} className="rounded-[22px] bg-white/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8b819b]">{laneMeta[lane].title}</p>
                    <p className="text-2xl font-bold text-[#4f465f]">{items.length}</p>
                  </div>
                  <span className="rounded-full bg-[#efe7f7] px-3 py-1 text-xs font-semibold text-[#5c5070]">
                    Hat
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((ticket) => (
                    <div key={ticket.id} className="rounded-[18px] border border-[#ddd4e5] bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b819b]">
                            {ticket.id}
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#4f465f]">{ticket.table}</p>
                          <p className="text-sm text-[#8d839d]">{ticket.guest}</p>
                        </div>
                        <span className="rounded-full bg-[#f3ecfa] px-3 py-1 text-xs font-semibold text-[#5d5171]">
                          {ticket.minutes} dk
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {ticket.items.map((item) => (
                          <div key={item} className="rounded-xl bg-[#f5f1fa] px-3 py-2 text-sm text-[#554a67]">
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => void handleAdvance(ticket.id)}
                          className="flex-1 rounded-xl bg-[#63bf77] px-3 py-2 text-sm font-semibold text-white"
                        >
                          Ilerlet
                        </button>
                        <button className="rounded-xl bg-[#f32774] px-3 py-2 text-sm font-semibold text-white">
                          Not
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      }
      rightPanel={
        <div className="h-full px-4 py-5">
          <p className="mb-4 text-right text-xs uppercase tracking-[0.34em] text-white/60">Akis</p>
          <div className="space-y-3">
            {dynamicFlow.map((lane) => (
              <div key={lane.title} className="rounded-[18px] bg-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">{lane.title}</p>
                <p className="mt-1 text-2xl font-bold text-white">{lane.count}</p>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
