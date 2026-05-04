import { DeliveryPage } from "@/components/delivery-page";
import { requireRole } from "@/lib/session";
import { getDeliverySnapshot } from "@/lib/store";

export default async function PaketServisPage() {
  await requireRole(["Yonetici", "Kasiyer", "Garson"]);
  const snapshot = await getDeliverySnapshot();

  return (
    <DeliveryPage
      orders={snapshot.orders}
      selectedOrder={snapshot.selectedOrder}
    />
  );
}
