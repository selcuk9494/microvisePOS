import { QuickSalePage } from "@/components/quick-sale-page";
import { requireRole } from "@/lib/session";

export default async function HizliSatisPage() {
  await requireRole(["Yonetici", "Kasiyer", "Garson"]);

  return <QuickSalePage />;
}
