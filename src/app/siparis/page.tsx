import { OrderPage } from "@/components/order-page";
import { requireRole } from "@/lib/session";

export default async function SiparisPage() {
  await requireRole(["Yonetici", "Kasiyer", "Garson"]);
  return <OrderPage />;
}
