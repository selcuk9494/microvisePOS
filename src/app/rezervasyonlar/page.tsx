import { ReservationsPage } from "@/components/reservations-page";
import { requireRole } from "@/lib/session";
import { getReservationsSnapshot } from "@/lib/store";

export default async function RezervasyonlarPage() {
  await requireRole(["Yonetici", "Kasiyer", "Garson"]);
  const snapshot = await getReservationsSnapshot();

  return (
    <ReservationsPage
      reservations={snapshot.reservations}
    />
  );
}
