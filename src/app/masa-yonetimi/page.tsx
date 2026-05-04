import { TablesPage } from "@/components/tables-page";
import { requireRole } from "@/lib/session";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MasaYonetimiPage() {
  await requireRole(["Yonetici", "Kasiyer", "Garson"]);
  const store = await readStore();
  return <TablesPage tables={store.tables} />;
}
