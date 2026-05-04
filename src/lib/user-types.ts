export type UserRole = "Yonetici" | "Kasiyer" | "Garson" | "Mutfak";

export type SessionUser = {
  email: string;
  name: string;
  role: UserRole;
  branch: string;
};

export const rolePermissions: Record<UserRole, string[]> = {
  Yonetici: ["dashboard", "siparis", "masa", "paket", "mutfak", "rapor", "ayar", "rezervasyon"],
  Kasiyer: ["dashboard", "siparis", "masa", "paket", "rapor", "rezervasyon"],
  Garson: ["dashboard", "siparis", "masa", "paket", "rezervasyon"],
  Mutfak: ["dashboard", "mutfak"],
};
