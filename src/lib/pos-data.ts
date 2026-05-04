export type SummaryCard = {
  title: string;
  value: string;
  change: string;
  detail: string;
};

export type TableItem = {
  name: string;
  guest: string;
  status: string;
  total: string;
  progress: number;
  area: string;
  seats: number;
  spend: number;
  state: "musait" | "dolu" | "rezerve";
};

export type KitchenLane = {
  title: string;
  count: string;
  tone: string;
  border: string;
};

export type ProductStat = {
  name: string;
  tag: string;
  sales: string;
  revenue: string;
};

export type StaffItem = {
  name: string;
  role: string;
  score: string;
  tables: string;
};

export type NavItem = {
  title: string;
  href: string;
  badge?: string;
};

export type MenuProduct = {
  id: number;
  name: string;
  category: string;
  groupName?: string;
  subgroupName?: string;
  price: number;
  prep: string;
  tag: string;
  description?: string;
  sku?: string;
  modifierIds?: number[];
  messageIds?: number[];
  active?: boolean;
};

export type MenuModifier = {
  id: number;
  name: string;
  category: string;
  priceDelta: number;
  active: boolean;
};

export type QuickMessage = {
  id: number;
  title: string;
  message: string;
  active: boolean;
};

export type DeliveryAddress = {
  id: string;
  customer: string;
  label: string;
  phone: string;
  zone: string;
  addressLine: string;
  note: string;
  defaultAddress: boolean;
};

export type KitchenTicket = {
  id: string;
  table: string;
  guest: string;
  lane: "yeni" | "hazirlaniyor" | "hazir" | "tamamlandi";
  minutes: number;
  items: string[];
  priority: "normal" | "yuksek";
};

export type DeliveryOrder = {
  id: string;
  channel: string;
  customer: string;
  zone: string;
  total: string;
  eta: string;
  courier: string;
  status: "hazirlaniyor" | "kurye-atandi" | "yolda" | "teslim";
  phone: string;
  address: string;
  note: string;
  items: DeliveryOrderLineItem[];
  createdAt: string;
  addressId?: string;
  paymentMethod?: "nakit" | "kart" | "online";
};

export type DeliveryOrderLineItem = {
  productId: number;
  name: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: string[];
  note: string;
};

export type PaymentTerminal = {
  id: string;
  name: string;
  brand: string;
  model: string;
  connectionMode: "serial" | "ethernet";
  interfaceId: string;
  ipAddress: string;
  port: number;
  portName: string;
  baudRate: number;
  enabled: boolean;
  useMock: boolean;
  defaultTimeoutMs: number;
  cardTimeoutMs: number;
  serialNumber: string;
  ecrSerialNumber: string;
  externalDeviceBrand: string;
  externalDeviceModel: string;
  notes: string;
};

export type ReservationItem = {
  id: string;
  name: string;
  guests: number;
  time: string;
  area: string;
  phone: string;
  note: string;
  status: "onaylandi" | "bekliyor" | "geldi";
};

export type ReportMetric = {
  title: string;
  value: string;
  detail: string;
};

export type SettingSection = {
  title: string;
  description: string;
  items: string[];
};

export const branchInfo = {
  name: "Kadikoy Merkez",
  detail: "42 aktif personel, 3 salon, 12 kurye",
  status: "Sistem Stabil",
};

export const navItems: NavItem[] = [
  { title: "Genel Bakis", href: "/", badge: "Canli" },
  { title: "Masa Yonetimi", href: "/masa-yonetimi" },
  { title: "Siparis Alma", href: "/siparis" },
  { title: "Hizli Satis", href: "/hizli-satis" },
  { title: "Mutfak Ekrani", href: "/mutfak", badge: "12" },
  { title: "Paket Servis", href: "/paket-servis", badge: "6" },
  { title: "Rezervasyonlar", href: "/rezervasyonlar" },
  { title: "Raporlar", href: "/raporlar" },
  { title: "Ayarlar", href: "/ayarlar" },
];

export const summaryCards: SummaryCard[] = [
  {
    title: "Anlik Ciro",
    value: "TL128.450",
    change: "+%18.4",
    detail: "Dun ayni saate gore",
  },
  {
    title: "Acik Masa",
    value: "24 / 38",
    change: "+7 yeni siparis",
    detail: "Salon doluluk %63",
  },
  {
    title: "Paket Siparis",
    value: "42",
    change: "11 yolda",
    detail: "Ortalama teslimat 27 dk",
  },
  {
    title: "Mutfak Hizi",
    value: "13 dk",
    change: "-2 dk",
    detail: "Hedef servis suresi",
  },
];

export const tables: TableItem[] = [
  {
    name: "T01",
    guest: "Mustafa Bey",
    status: "VIP",
    total: "TL1.240",
    progress: 82,
    area: "Salon A",
    seats: 4,
    spend: 1240,
    state: "dolu",
  },
  {
    name: "T04",
    guest: "Aile Masasi",
    status: "Ana Yemek",
    total: "TL860",
    progress: 64,
    area: "Salon A",
    seats: 6,
    spend: 860,
    state: "dolu",
  },
  {
    name: "T09",
    guest: "Rezervasyon",
    status: "Tatli",
    total: "TL470",
    progress: 48,
    area: "Teras",
    seats: 2,
    spend: 470,
    state: "rezerve",
  },
  {
    name: "B02",
    guest: "Bar",
    status: "Ikinci tur",
    total: "TL520",
    progress: 58,
    area: "Bar",
    seats: 3,
    spend: 520,
    state: "dolu",
  },
  {
    name: "T11",
    guest: "Musait",
    status: "Hazir",
    total: "TL0",
    progress: 0,
    area: "Teras",
    seats: 4,
    spend: 0,
    state: "musait",
  },
  {
    name: "T15",
    guest: "Kurumsal Grup",
    status: "Aperatif",
    total: "TL2.180",
    progress: 36,
    area: "VIP",
    seats: 8,
    spend: 2180,
    state: "dolu",
  },
];

export const orderFlow: KitchenLane[] = [
  {
    title: "Yeni Siparis",
    count: "18",
    tone: "from-sky-500/20 to-sky-400/5",
    border: "border-sky-400/20",
  },
  {
    title: "Hazirlaniyor",
    count: "12",
    tone: "from-amber-500/20 to-amber-400/5",
    border: "border-amber-400/20",
  },
  {
    title: "Kurye Bekliyor",
    count: "6",
    tone: "from-fuchsia-500/20 to-fuchsia-400/5",
    border: "border-fuchsia-400/20",
  },
  {
    title: "Teslim Edildi",
    count: "31",
    tone: "from-emerald-500/20 to-emerald-400/5",
    border: "border-emerald-400/20",
  },
];

export const products: ProductStat[] = [
  { name: "Izgara Somon", tag: "Populer", sales: "84 adet", revenue: "TL31.200" },
  { name: "Special Burger", tag: "Hizli Cikis", sales: "73 adet", revenue: "TL21.900" },
  { name: "Fettuccine Alfredo", tag: "Yuksek Marj", sales: "56 adet", revenue: "TL16.800" },
];

export const staff: StaffItem[] = [
  { name: "Ayse K.", role: "Salon Sorumlusu", score: "4.9", tables: "8 masa" },
  { name: "Mert A.", role: "Kurye Lideri", score: "4.8", tables: "15 teslimat" },
  { name: "Deniz T.", role: "Barista", score: "4.7", tables: "62 icecek" },
];

export const areaFilters = ["Tum Alanlar", "Salon A", "Teras", "Bar", "VIP"] as const;

export const menuCategories = ["Hepsi", "Baslangic", "Ana Yemek", "Pizza", "Icecek", "Tatli"] as const;

export const menuProducts: MenuProduct[] = [
  { id: 1, name: "Truflu Patates", category: "Baslangic", price: 190, prep: "6 dk", tag: "Hizli", active: true },
  { id: 2, name: "Dana Carpaccio", category: "Baslangic", price: 260, prep: "8 dk", tag: "Imza", active: true },
  { id: 3, name: "Special Burger", category: "Ana Yemek", price: 390, prep: "12 dk", tag: "Populer", active: true },
  { id: 4, name: "Izgara Somon", category: "Ana Yemek", price: 520, prep: "14 dk", tag: "Premium", active: true },
  { id: 5, name: "Margarita Pizza", category: "Pizza", price: 320, prep: "10 dk", tag: "Klasik", active: true },
  { id: 6, name: "Prosciutto Pizza", category: "Pizza", price: 420, prep: "11 dk", tag: "Yeni", active: true },
  { id: 7, name: "Cold Brew", category: "Icecek", price: 120, prep: "3 dk", tag: "Serin", active: true },
  { id: 8, name: "Limonata", category: "Icecek", price: 95, prep: "2 dk", tag: "Ferah", active: true },
  { id: 9, name: "San Sebastian", category: "Tatli", price: 210, prep: "4 dk", tag: "Cok Satan", active: true },
];

export const menuModifiers: MenuModifier[] = [
  { id: 1, name: "Ek Kasar", category: "Burger", priceDelta: 35, active: true },
  { id: 2, name: "Glutensiz Taban", category: "Pizza", priceDelta: 45, active: true },
  { id: 3, name: "Double Et", category: "Burger", priceDelta: 120, active: true },
  { id: 4, name: "Buzsuz", category: "Icecek", priceDelta: 0, active: true },
  { id: 5, name: "Ek Sos", category: "Genel", priceDelta: 20, active: true },
];

export const quickMessages: QuickMessage[] = [
  { id: 1, title: "Alerjen", message: "Alerjen bilgisi teyit edildi.", active: true },
  { id: 2, title: "Acisiz", message: "Acisiz hazirlansin.", active: true },
  { id: 3, title: "Zile Basma", message: "Zile basmadan ara.", active: true },
  { id: 4, title: "Temassiz", message: "Temassiz teslimat istendi.", active: true },
  { id: 5, title: "Paket Sos", message: "Ek paket sos eklensin.", active: true },
];

export const kitchenTickets: KitchenTicket[] = [
  {
    id: "K-104",
    table: "T01",
    guest: "Mustafa Bey",
    lane: "yeni",
    minutes: 2,
    items: ["1x Izgara Somon", "2x Cold Brew"],
    priority: "yuksek",
  },
  {
    id: "K-105",
    table: "P-22",
    guest: "Getir",
    lane: "yeni",
    minutes: 4,
    items: ["2x Special Burger", "1x Truflu Patates"],
    priority: "normal",
  },
  {
    id: "K-101",
    table: "T04",
    guest: "Aile Masasi",
    lane: "hazirlaniyor",
    minutes: 10,
    items: ["1x Margarita Pizza", "1x Prosciutto Pizza"],
    priority: "normal",
  },
  {
    id: "K-099",
    table: "B02",
    guest: "Bar",
    lane: "hazirlaniyor",
    minutes: 7,
    items: ["3x Cold Brew", "1x San Sebastian"],
    priority: "normal",
  },
  {
    id: "K-093",
    table: "T09",
    guest: "Rezervasyon",
    lane: "hazir",
    minutes: 13,
    items: ["2x Dana Carpaccio", "2x Limonata"],
    priority: "yuksek",
  },
  {
    id: "K-084",
    table: "P-19",
    guest: "Yemeksepeti",
    lane: "tamamlandi",
    minutes: 16,
    items: ["1x Special Burger", "1x Limonata"],
    priority: "normal",
  },
];

export const deliveryOrders: DeliveryOrder[] = [
  {
    id: "PK-201",
    channel: "Getir",
    customer: "Seda Y.",
    zone: "Moda",
    total: "TL640",
    eta: "18 dk",
    courier: "Fiyuu / Arda",
    status: "hazirlaniyor",
    phone: "0532 100 00 01",
    address: "Moda Caddesi No:18 Kadikoy/Istanbul",
    note: "Zile basmadan ara",
    items: [
      { productId: 3, name: "Special Burger", qty: 2, unitPrice: 390, totalPrice: 780, modifiers: ["Ek Kasar"], note: "Bir tanesi acisiz" },
      { productId: 1, name: "Truflu Patates", qty: 1, unitPrice: 190, totalPrice: 190, modifiers: [], note: "" },
      { productId: 7, name: "Cold Brew", qty: 2, unitPrice: 120, totalPrice: 240, modifiers: ["Buzsuz"], note: "" },
    ],
    createdAt: "2026-05-02T12:10:00.000Z",
    addressId: "ADR-101",
    paymentMethod: "online",
  },
  {
    id: "PK-202",
    channel: "Telefon",
    customer: "Can K.",
    zone: "Fenerbahce",
    total: "TL390",
    eta: "25 dk",
    courier: "Mert A.",
    status: "kurye-atandi",
    phone: "0532 100 00 02",
    address: "Fenerbahce Mah. Lale Sk. No:9 Kadikoy/Istanbul",
    note: "Site guvenligine birakilabilir",
    items: [
      { productId: 5, name: "Margarita Pizza", qty: 1, unitPrice: 320, totalPrice: 320, modifiers: ["Glutensiz Taban"], note: "" },
      { productId: 8, name: "Limonata", qty: 1, unitPrice: 95, totalPrice: 95, modifiers: [], note: "" },
    ],
    createdAt: "2026-05-02T13:00:00.000Z",
    addressId: "ADR-102",
    paymentMethod: "nakit",
  },
  {
    id: "PK-203",
    channel: "Trendyol",
    customer: "Burcu A.",
    zone: "Goztepe",
    total: "TL820",
    eta: "11 dk",
    courier: "Paket Taksi",
    status: "yolda",
    phone: "0532 100 00 03",
    address: "Goztepe Minibus Cad. No:55 Kadikoy/Istanbul",
    note: "Kapiya birak",
    items: [
      { productId: 4, name: "Izgara Somon", qty: 1, unitPrice: 520, totalPrice: 520, modifiers: [], note: "" },
      { productId: 9, name: "San Sebastian", qty: 1, unitPrice: 210, totalPrice: 210, modifiers: [], note: "Temassiz teslimat" },
    ],
    createdAt: "2026-05-02T14:20:00.000Z",
    addressId: "ADR-103",
    paymentMethod: "kart",
  },
  {
    id: "PK-204",
    channel: "Web",
    customer: "Emre T.",
    zone: "Caddebostan",
    total: "TL510",
    eta: "Tamamlandi",
    courier: "Deniz C.",
    status: "teslim",
    phone: "0532 100 00 04",
    address: "Caddebostan Sahil Yolu No:3 Kadikoy/Istanbul",
    note: "Temassiz teslimat",
    items: [
      { productId: 6, name: "Prosciutto Pizza", qty: 1, unitPrice: 420, totalPrice: 420, modifiers: [], note: "" },
      { productId: 7, name: "Cold Brew", qty: 1, unitPrice: 120, totalPrice: 120, modifiers: [], note: "" },
    ],
    createdAt: "2026-05-01T20:15:00.000Z",
    addressId: "ADR-104",
    paymentMethod: "online",
  },
];

export const deliveryAddresses: DeliveryAddress[] = [
  {
    id: "ADR-101",
    customer: "Seda Y.",
    label: "Ev",
    phone: "0532 100 00 01",
    zone: "Moda",
    addressLine: "Moda Caddesi No:18 Kadikoy/Istanbul",
    note: "Zile basmadan ara",
    defaultAddress: true,
  },
  {
    id: "ADR-102",
    customer: "Can K.",
    label: "Ev",
    phone: "0532 100 00 02",
    zone: "Fenerbahce",
    addressLine: "Fenerbahce Mah. Lale Sk. No:9 Kadikoy/Istanbul",
    note: "Site guvenligine birakilabilir",
    defaultAddress: true,
  },
  {
    id: "ADR-103",
    customer: "Burcu A.",
    label: "Ofis",
    phone: "0532 100 00 03",
    zone: "Goztepe",
    addressLine: "Goztepe Minibus Cad. No:55 Kadikoy/Istanbul",
    note: "Kapiya birak",
    defaultAddress: true,
  },
  {
    id: "ADR-104",
    customer: "Emre T.",
    label: "Sahil",
    phone: "0532 100 00 04",
    zone: "Caddebostan",
    addressLine: "Caddebostan Sahil Yolu No:3 Kadikoy/Istanbul",
    note: "Temassiz teslimat",
    defaultAddress: true,
  },
  {
    id: "ADR-105",
    customer: "Seda Y.",
    label: "Ofis",
    phone: "0532 100 00 01",
    zone: "Kozyatagi",
    addressLine: "Kozyatagi Mah. Finans Cad. No:11 Atasehir/Istanbul",
    note: "Resepsiyona teslim et",
    defaultAddress: false,
  },
];

export const paymentTerminals: PaymentTerminal[] = [
  {
    id: "TERM-001",
    name: "Kasa 1 Ingenico",
    brand: "Ingenico",
    model: "Move5000F",
    connectionMode: "ethernet",
    interfaceId: "COM1",
    ipAddress: "192.168.2.13",
    port: 7500,
    portName: "\\\\.\\COM5",
    baudRate: 115200,
    enabled: true,
    useMock: true,
    defaultTimeoutMs: 10000,
    cardTimeoutMs: 60000,
    serialNumber: "12344567",
    ecrSerialNumber: "JHWE20000079",
    externalDeviceBrand: "WORLDLINE",
    externalDeviceModel: "IWE280",
    notes: "Move5000F serial ve ethernet icin hazir konfigurasyon.",
  },
];

export const reservations: ReservationItem[] = [
  {
    id: "R-301",
    name: "Nehir Demir",
    guests: 4,
    time: "19:30",
    area: "Teras",
    phone: "0532 000 00 01",
    note: "Dogum gunu pastasi hazir olsun",
    status: "onaylandi",
  },
  {
    id: "R-302",
    name: "Atlas Medya",
    guests: 8,
    time: "20:00",
    area: "VIP",
    phone: "0532 000 00 02",
    note: "Kurumsal yemek, sessiz alan talebi",
    status: "bekliyor",
  },
  {
    id: "R-303",
    name: "Esra Kaya",
    guests: 2,
    time: "20:15",
    area: "Salon A",
    phone: "0532 000 00 03",
    note: "Cam kenari tercih edildi",
    status: "geldi",
  },
  {
    id: "R-304",
    name: "Murat Alp",
    guests: 6,
    time: "21:00",
    area: "Teras",
    phone: "0532 000 00 04",
    note: "Cocuk sandalyesi gerekiyor",
    status: "onaylandi",
  },
];

export const reportMetrics: ReportMetric[] = [
  { title: "Gunluk Ciro", value: "TL128.450", detail: "Hedefin %112 ustu" },
  { title: "Ortalama Fis", value: "TL684", detail: "Gecen haftaya gore +%9" },
  { title: "Masa Donusumu", value: "3.8x", detail: "Aksam pik saat ortalamasi" },
  { title: "Paket Karliligi", value: "%27", detail: "Komisyon sonrasi net marj" },
];

export const hourlySales = [
  { hour: "12:00", value: 34 },
  { hour: "14:00", value: 56 },
  { hour: "16:00", value: 28 },
  { hour: "18:00", value: 72 },
  { hour: "20:00", value: 96 },
  { hour: "22:00", value: 65 },
];

export const paymentBreakdown = [
  { label: "Kart", value: "TL78.400", share: 61 },
  { label: "Nakit", value: "TL23.950", share: 19 },
  { label: "Online", value: "TL26.100", share: 20 },
];

export const settingSections: SettingSection[] = [
  {
    title: "Sube ve Donanim",
    description: "Yazici, kasa, terminal ve servis istasyonu ayarlari.",
    items: ["Adisyon yazicilari", "Mutfak yazicilari", "Terminal eslesmeleri"],
  },
  {
    title: "Menu ve Fiyatlandirma",
    description: "Kategori, varyasyon ve zaman bazli fiyat yonetimi.",
    items: ["Saatlik fiyat kurallari", "Menu gorunurlugu", "Stok uyarilari"],
  },
  {
    title: "Personel ve Yetki",
    description: "Rol bazli yetkiler, vardiyalar ve log takibi.",
    items: ["Yoneticiler", "Garson izinleri", "Kasiyer kapanis yetkileri"],
  },
];
