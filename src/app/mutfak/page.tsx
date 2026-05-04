import { KitchenPage } from "@/components/kitchen-page";
import { requireRole } from "@/lib/session";

export default async function MutfakPage() {
  await requireRole(["Yonetici", "Mutfak"]);
  return <KitchenPage />;
}
