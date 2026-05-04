import { SettingsPage } from "@/components/settings-page";
import { requireRole } from "@/lib/session";
import { listUsers } from "@/lib/users";

export default async function AyarlarPage() {
  const currentUser = await requireRole(["Yonetici"]);
  const initialUsers = await listUsers();

  return <SettingsPage initialUsers={initialUsers} currentUser={currentUser} />;
}
