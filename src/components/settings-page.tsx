"use client";

import { useEffect, useMemo, useState } from "react";

import { WebAdminShell } from "@/components/web-admin-shell";
import {
  type MenuModifier,
  type MenuProduct,
  type PaymentTerminal,
  type QuickMessage,
} from "@/lib/pos-data";
import type { PaymentTransaction, TerminalPairingResult, TerminalPrecheckResult } from "@/lib/payment-types";
import { rolePermissions, type SessionUser, type UserRole } from "@/lib/user-types";
import type { ManagedUser } from "@/lib/users";

type SettingsPageProps = {
  initialUsers: ManagedUser[];
  currentUser: SessionUser & {
    permissions: string[];
  };
};

type CatalogPayload = {
  products: MenuProduct[];
  modifiers: MenuModifier[];
  quickMessages: QuickMessage[];
  terminals: PaymentTerminal[];
  payments: PaymentTransaction[];
  orderSettings?: {
    serviceCharge?: {
      enabled: boolean;
      rate: number;
    };
  };
};

const roleOptions: UserRole[] = ["Yonetici", "Kasiyer", "Garson", "Mutfak"];
const fieldClass =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none";
const settingsTabs = [
  { id: "users", label: "Kullanicilar" },
  { id: "menu", label: "Menu ve Fiyat" },
  { id: "terminals", label: "Terminaller" },
  { id: "payments", label: "Odeme Kayitlari" },
] as const;

type SettingsTab = (typeof settingsTabs)[number]["id"];

const createEmptyTerminalForm = () => ({
  name: "Yeni Ingenico Move5000F",
  connectionMode: "ethernet" as PaymentTerminal["connectionMode"],
  interfaceId: "COM1",
  ipAddress: "10.0.1.37",
  port: "7500",
  portName: "\\\\.\\COM5",
  baudRate: "115200",
  useMock: false,
  enabled: true,
  defaultTimeoutMs: "10000",
  cardTimeoutMs: "60000",
  serialNumber: "",
  ecrSerialNumber: "",
  externalDeviceBrand: "WORLDLINE",
  externalDeviceModel: "IWE280",
  notes: "Move5000F serial ve ethernet icin hazir konfigurasyon.",
});

export function SettingsPage({ initialUsers, currentUser }: SettingsPageProps) {
  const [users, setUsers] = useState(initialUsers);
  const [feedback, setFeedback] = useState("");
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUsers[0]?.id ?? null);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [modifiers, setModifiers] = useState<MenuModifier[]>([]);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [selectedTerminalId, setSelectedTerminalId] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalStatus, setTerminalStatus] = useState("");
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "micpos123",
    role: "Garson" as UserRole,
    branch: currentUser.branch,
  });
  const [editForm, setEditForm] = useState({
    name: initialUsers[0]?.name ?? "",
    email: initialUsers[0]?.email ?? "",
    branch: initialUsers[0]?.branch ?? currentUser.branch,
    role: (initialUsers[0]?.role ?? "Garson") as UserRole,
    password: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Ana Yemek",
    groupName: "Mutfak",
    subgroupName: "",
    price: "0",
    prep: "10 dk",
    tag: "Yeni",
    description: "",
    sku: "",
  });
  const [modifierForm, setModifierForm] = useState({
    name: "",
    category: "Genel",
    priceDelta: "0",
  });
  const [messageForm, setMessageForm] = useState({
    title: "",
    message: "",
  });
  const [terminalForm, setTerminalForm] = useState(createEmptyTerminalForm());
  const [terminalCreateForm, setTerminalCreateForm] = useState(createEmptyTerminalForm());
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSort, setProductSort] = useState<{
    field: "name" | "groupName" | "subgroupName" | "price" | "active";
    direction: "asc" | "desc";
  }>({
    field: "name",
    direction: "asc",
  });
  const [productPage, setProductPage] = useState(1);
  const [productFilters, setProductFilters] = useState({
    groupName: "",
    subgroupName: "",
    status: "all" as "all" | "active" | "passive",
  });
  const [productColumns, setProductColumns] = useState({
    groupName: true,
    subgroupName: true,
    price: true,
    active: true,
    links: true,
  });
  const [inlinePrices, setInlinePrices] = useState<Record<number, string>>({});
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkPriceForm, setBulkPriceForm] = useState({
    mode: "percent" as "percent" | "fixed",
    value: "10",
    groupName: "",
    subgroupName: "",
    category: "",
  });
  const [serviceChargeSettings, setServiceChargeSettings] = useState({
    enabled: false,
    rate: "10",
  });

  const activeCount = useMemo(() => users.filter((user) => user.active).length, [users]);
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const selectedTerminal = terminals.find((terminal) => terminal.id === selectedTerminalId) ?? null;
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const roleCards = roleOptions.map((role) => ({
    role,
    count: users.filter((user) => user.role === role && user.active).length,
    permissions: rolePermissions[role],
  }));
  const productGroups = useMemo(
    () => [...new Set(products.map((product) => product.groupName).filter(Boolean))].sort((left, right) => left!.localeCompare(right!, "tr")),
    [products],
  );
  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        [
          product.name,
          product.category,
          product.groupName,
          product.subgroupName,
          product.sku,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesGroup = !productFilters.groupName || product.groupName === productFilters.groupName;
      const matchesSubgroup = !productFilters.subgroupName || product.subgroupName === productFilters.subgroupName;
      const matchesStatus =
        productFilters.status === "all" ||
        (productFilters.status === "active" ? product.active : !product.active);

      return matchesSearch && matchesGroup && matchesSubgroup && matchesStatus;
    });
  }, [productFilters.groupName, productFilters.status, productFilters.subgroupName, productSearch, products]);
  const productSubgroups = useMemo(
    () =>
      [...new Set(products.map((product) => product.subgroupName).filter(Boolean))].sort((left, right) =>
        left!.localeCompare(right!, "tr"),
      ),
    [products],
  );
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((left, right) => {
      const direction = productSort.direction === "asc" ? 1 : -1;
      const leftValue =
        productSort.field === "price"
          ? Number(left.price)
          : productSort.field === "active"
            ? Number(Boolean(left.active))
            : String(left[productSort.field] ?? "");
      const rightValue =
        productSort.field === "price"
          ? Number(right.price)
          : productSort.field === "active"
            ? Number(Boolean(right.active))
            : String(right[productSort.field] ?? "");

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * direction;
      }

      return String(leftValue).localeCompare(String(rightValue), "tr") * direction;
    });
  }, [filteredProducts, productSort]);
  const productPageSize = 12;
  const productPageCount = Math.max(1, Math.ceil(sortedProducts.length / productPageSize));
  const pagedProducts = useMemo(() => {
    const start = (productPage - 1) * productPageSize;
    return sortedProducts.slice(start, start + productPageSize);
  }, [productPage, sortedProducts]);
  const productGridTemplate = useMemo(() => {
    const columns = ["0.4fr", "2.2fr"];
    if (productColumns.groupName) columns.push("1fr");
    if (productColumns.subgroupName) columns.push("1fr");
    if (productColumns.price) columns.push("0.9fr");
    if (productColumns.active) columns.push("0.9fr");
    if (productColumns.links) columns.push("0.8fr");
    return columns.join(" ");
  }, [productColumns]);
  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((product) => selectedProductIds.includes(product.id));

  useEffect(() => {
    if (!sortedProducts.length) {
      setSelectedProductId(null);
      return;
    }

    if (!selectedProductId || !sortedProducts.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(sortedProducts[0].id);
    }
  }, [selectedProductId, sortedProducts]);

  useEffect(() => {
    setProductPage(1);
  }, [productFilters.groupName, productFilters.status, productFilters.subgroupName, productSearch, productSort]);

  useEffect(() => {
    if (productPage > productPageCount) {
      setProductPage(productPageCount);
    }
  }, [productPage, productPageCount]);

  useEffect(() => {
    setInlinePrices((current) => {
      const next = { ...current };
      for (const product of products) {
        if (!(product.id in next)) {
          next[product.id] = String(product.price);
        }
      }
      return next;
    });
  }, [products]);

  const loadCatalog = async () => {
    try {
      const response = await fetch("/api/catalog");
      const data = (await response.json()) as CatalogPayload & { message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Katalog verileri yuklenemedi.");
        return;
      }

      setProducts(data.products ?? []);
      setModifiers(data.modifiers ?? []);
      setQuickMessages(data.quickMessages ?? []);
      setTerminals(data.terminals ?? []);
      setPayments(data.payments ?? []);
      setServiceChargeSettings({
        enabled: data.orderSettings?.serviceCharge?.enabled ?? false,
        rate: String(data.orderSettings?.serviceCharge?.rate ?? 10),
      });
      setSelectedTerminalId((current) => current || data.terminals?.[0]?.id || "");
    } catch {
      setFeedback("Katalog servislerine baglanilamadi.");
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    if (!selectedTerminal) {
      return;
    }

    setTerminalForm({
      name: selectedTerminal.name,
      connectionMode: selectedTerminal.connectionMode,
      interfaceId: selectedTerminal.interfaceId,
      ipAddress: selectedTerminal.ipAddress,
      port: String(selectedTerminal.port),
      portName: selectedTerminal.portName,
      baudRate: String(selectedTerminal.baudRate),
      useMock: selectedTerminal.useMock,
      enabled: selectedTerminal.enabled,
      defaultTimeoutMs: String(selectedTerminal.defaultTimeoutMs),
      cardTimeoutMs: String(selectedTerminal.cardTimeoutMs),
      serialNumber: selectedTerminal.serialNumber,
      ecrSerialNumber: selectedTerminal.ecrSerialNumber,
      externalDeviceBrand: selectedTerminal.externalDeviceBrand,
      externalDeviceModel: selectedTerminal.externalDeviceModel,
      notes: selectedTerminal.notes,
    });
  }, [selectedTerminal]);

  const patchUser = async (id: number, payload: Partial<ManagedUser> & { password?: string }) => {
    setSavingId(id);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string; user?: ManagedUser };
      if (!response.ok || !data.user) {
        setFeedback(data.message ?? "Kullanici guncellenemedi.");
        return;
      }

      setUsers((current) => current.map((user) => (user.id === id ? data.user! : user)));
      setFeedback(`${data.user.name} guncellendi.`);
    } catch {
      setFeedback("Kullanici servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const createUser = async () => {
    setSavingId("user-new");
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = (await response.json()) as { message?: string; user?: ManagedUser };
      if (!response.ok || !data.user) {
        setFeedback(data.message ?? "Kullanici eklenemedi.");
        return;
      }

      setUsers((current) => [data.user!, ...current]);
      setFeedback(`${data.user.name} kullanicisi eklendi.`);
    } catch {
      setFeedback("Kullanici servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const updateProductDraft = (id: number, patch: Partial<MenuProduct>) => {
    setProducts((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const saveProduct = async (product: MenuProduct) => {
    setSavingId(`product-${product.id}`);
    try {
      const response = await fetch(`/api/menu/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = (await response.json()) as { message?: string; product?: MenuProduct };
      if (!response.ok || !data.product) {
        setFeedback(data.message ?? "Menu urunu kaydedilemedi.");
        return;
      }
      setProducts((current) => current.map((item) => (item.id === product.id ? data.product! : item)));
    } catch {
      setFeedback("Menu servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const createProduct = async () => {
    setSavingId("product-new");
    try {
      const response = await fetch("/api/menu/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          groupName: productForm.groupName,
          subgroupName: productForm.subgroupName,
          description: productForm.description,
          sku: productForm.sku,
          active: true,
        }),
      });
      const data = (await response.json()) as { message?: string; product?: MenuProduct };
      if (!response.ok || !data.product) {
        setFeedback(data.message ?? "Menu urunu eklenemedi.");
        return;
      }
      setProducts((current) => [data.product!, ...current]);
      setProductForm({
        name: "",
        category: "Ana Yemek",
        groupName: "Mutfak",
        subgroupName: "",
        price: "0",
        prep: "10 dk",
        tag: "Yeni",
        description: "",
        sku: "",
      });
    } catch {
      setFeedback("Menu servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const updateModifierDraft = (id: number, patch: Partial<MenuModifier>) => {
    setModifiers((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const saveModifier = async (modifier: MenuModifier) => {
    setSavingId(`modifier-${modifier.id}`);
    try {
      const response = await fetch(`/api/menu/modifiers/${modifier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modifier),
      });
      const data = (await response.json()) as { message?: string; modifier?: MenuModifier };
      if (!response.ok || !data.modifier) {
        setFeedback(data.message ?? "Ozellik guncellenemedi.");
        return;
      }
      setModifiers((current) => current.map((item) => (item.id === modifier.id ? data.modifier! : item)));
    } catch {
      setFeedback("Ozellik servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const createModifier = async () => {
    setSavingId("modifier-new");
    try {
      const response = await fetch("/api/menu/modifiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...modifierForm,
          priceDelta: Number(modifierForm.priceDelta),
          active: true,
        }),
      });
      const data = (await response.json()) as { message?: string; modifier?: MenuModifier };
      if (!response.ok || !data.modifier) {
        setFeedback(data.message ?? "Ozellik eklenemedi.");
        return;
      }
      setModifiers((current) => [data.modifier!, ...current]);
      setModifierForm({
        name: "",
        category: "Genel",
        priceDelta: "0",
      });
    } catch {
      setFeedback("Ozellik servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const updateMessageDraft = (id: number, patch: Partial<QuickMessage>) => {
    setQuickMessages((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const saveMessage = async (message: QuickMessage) => {
    setSavingId(`message-${message.id}`);
    try {
      const response = await fetch(`/api/menu/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      const data = (await response.json()) as { message?: string; quickMessage?: QuickMessage };
      if (!response.ok || !data.quickMessage) {
        setFeedback(data.message ?? "Mesaj guncellenemedi.");
        return;
      }
      setQuickMessages((current) => current.map((item) => (item.id === message.id ? data.quickMessage! : item)));
    } catch {
      setFeedback("Mesaj servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const createMessage = async () => {
    setSavingId("message-new");
    try {
      const response = await fetch("/api/menu/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...messageForm,
          active: true,
        }),
      });
      const data = (await response.json()) as { message?: string; quickMessage?: QuickMessage };
      if (!response.ok || !data.quickMessage) {
        setFeedback(data.message ?? "Mesaj eklenemedi.");
        return;
      }
      setQuickMessages((current) => [data.quickMessage!, ...current]);
      setMessageForm({
        title: "",
        message: "",
      });
    } catch {
      setFeedback("Mesaj servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleProductModifier = (productId: number, modifierId: number) => {
    setProducts((current) =>
      current.map((product) =>
        product.id !== productId
          ? product
          : {
              ...product,
              modifierIds: product.modifierIds?.includes(modifierId)
                ? product.modifierIds.filter((id) => id !== modifierId)
                : [...(product.modifierIds ?? []), modifierId],
            },
      ),
    );
  };

  const toggleProductMessage = (productId: number, messageId: number) => {
    setProducts((current) =>
      current.map((product) =>
        product.id !== productId
          ? product
          : {
              ...product,
              messageIds: product.messageIds?.includes(messageId)
                ? product.messageIds.filter((id) => id !== messageId)
                : [...(product.messageIds ?? []), messageId],
            },
      ),
    );
  };

  const parseBulkImportText = () => {
    const raw = bulkImportText.trim();

    if (!raw) {
      throw new Error("Toplu aktarim alani bos.");
    }

    if (raw.startsWith("[")) {
      return JSON.parse(raw) as Array<Record<string, unknown>>;
    }

    const lines = raw.split(/\r?\n/).filter(Boolean);
    const rows = lines.map((line) => line.split(/[;,|\t]/).map((part) => part.trim()));

    if (rows.length < 2) {
      throw new Error("Toplu aktarim icin baslik ve en az bir satir girin.");
    }

    const headers = rows[0];

    return rows.slice(1).map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
    );
  };

  const runBulkImport = async () => {
    try {
      const rows = parseBulkImportText();
      const productsPayload = rows.map((row) => ({
        name: String(row.name ?? row.ad ?? ""),
        category: String(row.category ?? row.kategori ?? ""),
        groupName: String(row.groupName ?? row.grup ?? row.category ?? row.kategori ?? ""),
        subgroupName: String(row.subgroupName ?? row.altGrup ?? ""),
        price: Number(row.price ?? row.fiyat ?? 0),
        prep: String(row.prep ?? row.hazirlama ?? "10 dk"),
        tag: String(row.tag ?? row.etiket ?? "Yeni"),
        description: String(row.description ?? row.aciklama ?? ""),
        sku: String(row.sku ?? row.barkod ?? ""),
        active: String(row.active ?? "true") !== "false",
      }));

      setSavingId("product-import");
      const response = await fetch("/api/menu/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productsPayload }),
      });
      const data = (await response.json()) as { message?: string; products?: MenuProduct[] };

      if (!response.ok || !data.products) {
        setFeedback(data.message ?? "Toplu urun aktarimi basarisiz.");
        return;
      }

      await loadCatalog();
      setBulkImportText("");
      setFeedback(`${data.products.length} urun ice aktarildi.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Toplu aktarim tamamlanamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const runBulkPriceUpdate = async () => {
    const value = Number(bulkPriceForm.value);

    if (Number.isNaN(value)) {
      setFeedback("Toplu fiyat icin gecerli bir deger girin.");
      return;
    }

    setSavingId("product-bulk-price");
    try {
      const response = await fetch("/api/menu/products/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: bulkPriceForm.mode,
          value,
          groupName: bulkPriceForm.groupName || undefined,
          subgroupName: bulkPriceForm.subgroupName || undefined,
          category: bulkPriceForm.category || undefined,
        }),
      });
      const data = (await response.json()) as { message?: string; products?: MenuProduct[] };

      if (!response.ok || !data.products) {
        setFeedback(data.message ?? "Toplu fiyat guncelleme basarisiz.");
        return;
      }

      setProducts(data.products);
      setFeedback("Toplu fiyat guncelleme tamamlandi.");
    } catch {
      setFeedback("Toplu fiyat servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };

  const toggleSelectAllFilteredProducts = () => {
    setSelectedProductIds((current) =>
      allFilteredSelected
        ? current.filter((id) => !filteredProducts.some((product) => product.id === id))
        : [...new Set([...current, ...filteredProducts.map((product) => product.id)])],
    );
  };

  const runBulkStatusUpdate = async (active: boolean) => {
    if (!selectedProductIds.length) {
      setFeedback("Toplu durum degisikligi icin urun secin.");
      return;
    }

    setSavingId("product-bulk-status");
    try {
      await Promise.all(
        selectedProductIds.map(async (id) => {
          const product = products.find((item) => item.id === id);
          if (!product) return;
          await saveProduct({ ...product, active });
        }),
      );
      setFeedback(active ? "Secili urunler aktif edildi." : "Secili urunler pasif edildi.");
    } finally {
      setSavingId(null);
    }
  };

  const runBulkDelete = async () => {
    if (!selectedProductIds.length) {
      setFeedback("Toplu silme icin urun secin.");
      return;
    }

    setSavingId("product-bulk-delete");
    try {
      await Promise.all(selectedProductIds.map(async (id) => deleteProduct(id)));
      setSelectedProductIds([]);
      setFeedback("Secili urunler silindi.");
    } finally {
      setSavingId(null);
    }
  };

  const runBulkPriceForSelection = async () => {
    if (!selectedProductIds.length) {
      setFeedback("Toplu fiyat icin once urun secin.");
      return;
    }

    const value = Number(bulkPriceForm.value);
    if (Number.isNaN(value)) {
      setFeedback("Toplu fiyat icin gecerli bir deger girin.");
      return;
    }

    setSavingId("product-bulk-selection-price");
    try {
      const response = await fetch("/api/menu/products/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: bulkPriceForm.mode,
          value,
          productIds: selectedProductIds,
        }),
      });
      const data = (await response.json()) as { message?: string; products?: MenuProduct[] };
      if (!response.ok || !data.products) {
        setFeedback(data.message ?? "Secili urunler icin fiyat guncellenemedi.");
        return;
      }

      setProducts(data.products);
      setFeedback("Secili urunlerde toplu fiyat guncellendi.");
    } catch {
      setFeedback("Toplu fiyat servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleProductSort = (field: "name" | "groupName" | "subgroupName" | "price" | "active") => {
    setProductSort((current) =>
      current.field === field
        ? { field, direction: current.direction === "asc" ? "desc" : "asc" }
        : { field, direction: field === "price" ? "desc" : "asc" },
    );
  };

  const exportProductsCsv = () => {
    if (!sortedProducts.length) {
      setFeedback("Disa aktarma icin urun bulunamadi.");
      return;
    }

    const rows = [
      ["id", "name", "groupName", "subgroupName", "category", "price", "active", "sku", "prep", "tag"],
      ...sortedProducts.map((product) => [
        String(product.id),
        product.name,
        product.groupName ?? "",
        product.subgroupName ?? "",
        product.category,
        String(product.price),
        product.active ? "1" : "0",
        product.sku ?? "",
        product.prep,
        product.tag,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${cell.replaceAll('"', '""')}"`)
          .join(";"),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "micpos-urunler.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback("Urun listesi CSV olarak disa aktarildi.");
  };

  const toggleProductColumn = (column: keyof typeof productColumns) => {
    setProductColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  const downloadImportTemplate = () => {
    const template = [
      "name;groupName;subgroupName;category;price;prep;tag;description;sku;active",
      "Cheeseburger;Burger;Klasik;Burger;245;12 dk;Yeni;Izgara burger;BRG-001;true",
      "Ayran;Icecek;Soguk;Icecek;45;1 dk;Populer;275 ml ayran;ICK-014;true",
    ].join("\n");
    const blob = new Blob([`\uFEFF${template}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "micpos-urun-aktarim-sablonu.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback("Toplu urun aktarim sablonu indirildi.");
  };

  const saveInlinePrice = async (product: MenuProduct) => {
    const price = Number(inlinePrices[product.id] ?? product.price);
    if (Number.isNaN(price)) {
      setFeedback("Satir ici fiyat icin gecerli bir deger girin.");
      return;
    }

    await saveProduct({ ...product, price });
  };

  const duplicateSelectedProduct = async () => {
    if (!selectedProduct) {
      setFeedback("Kopyalamak icin bir urun secin.");
      return;
    }

    setSavingId("product-duplicate");
    try {
      const response = await fetch("/api/menu/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${selectedProduct.name} Kopya`,
          category: selectedProduct.category,
          groupName: selectedProduct.groupName ?? "",
          subgroupName: selectedProduct.subgroupName ?? "",
          price: Number(selectedProduct.price),
          prep: selectedProduct.prep,
          tag: selectedProduct.tag,
          description: selectedProduct.description ?? "",
          sku: `${selectedProduct.sku ?? ""}-COPY`,
          active: selectedProduct.active,
        }),
      });
      const data = (await response.json()) as { message?: string; product?: MenuProduct };
      if (!response.ok || !data.product) {
        setFeedback(data.message ?? "Urun kopyalanamadi.");
        return;
      }

      setProducts((current) => [data.product!, ...current]);
      setSelectedProductId(data.product.id);
      setFeedback("Secili urunun kopyasi olusturuldu.");
    } catch {
      setFeedback("Urun kopyalama servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const validateTerminalInput = (payload: {
    name: string;
    connectionMode: PaymentTerminal["connectionMode"];
    ipAddress: string;
    port: string;
    portName: string;
  }) => {
    if (!payload.name.trim()) {
      return "Terminal adi zorunludur.";
    }

    if (payload.connectionMode === "ethernet") {
      if (!payload.ipAddress.trim()) {
        return "Ethernet baglantisinda IP adresi zorunludur.";
      }
      if (!payload.port.trim() || Number.isNaN(Number(payload.port))) {
        return "Ethernet baglantisinda gecerli bir port girin.";
      }
    }

    if (payload.connectionMode === "serial" && !payload.portName.trim()) {
      return "Serial baglantida COM port zorunludur.";
    }

    return "";
  };

  const deleteProduct = async (id: number) => {
    setSavingId(`product-delete-${id}`);
    try {
      const response = await fetch(`/api/menu/products/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Menu urunu silinemedi.");
        return;
      }
      setProducts((current) => current.filter((item) => item.id !== id));
    } catch {
      setFeedback("Menu servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteModifier = async (id: number) => {
    setSavingId(`modifier-delete-${id}`);
    try {
      const response = await fetch(`/api/menu/modifiers/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Ozellik silinemedi.");
        return;
      }
      setModifiers((current) => current.filter((item) => item.id !== id));
    } catch {
      setFeedback("Ozellik servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteMessage = async (id: number) => {
    setSavingId(`message-delete-${id}`);
    try {
      const response = await fetch(`/api/menu/messages/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Mesaj silinemedi.");
        return;
      }
      setQuickMessages((current) => current.filter((item) => item.id !== id));
    } catch {
      setFeedback("Mesaj servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const saveTerminal = async () => {
    if (!selectedTerminal) {
      return;
    }

    const validationMessage = validateTerminalInput({
      name: terminalForm.name,
      connectionMode: terminalForm.connectionMode,
      ipAddress: terminalForm.ipAddress,
      port: terminalForm.port,
      portName: terminalForm.portName,
    });

    if (validationMessage) {
      setFeedback(validationMessage);
      return;
    }

    setSavingId(`terminal-${selectedTerminal.id}`);
    try {
      const response = await fetch(`/api/payment-terminals/${selectedTerminal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: terminalForm.name,
          connectionMode: terminalForm.connectionMode,
          interfaceId: terminalForm.interfaceId,
          ipAddress: terminalForm.ipAddress,
          port: Number(terminalForm.port),
          portName: terminalForm.portName,
          baudRate: Number(terminalForm.baudRate),
          useMock: terminalForm.useMock,
          enabled: terminalForm.enabled,
          defaultTimeoutMs: Number(terminalForm.defaultTimeoutMs),
          cardTimeoutMs: Number(terminalForm.cardTimeoutMs),
          serialNumber: terminalForm.serialNumber,
          ecrSerialNumber: terminalForm.ecrSerialNumber,
          externalDeviceBrand: terminalForm.externalDeviceBrand,
          externalDeviceModel: terminalForm.externalDeviceModel,
          notes: terminalForm.notes,
        }),
      });
      const data = (await response.json()) as { message?: string; terminal?: PaymentTerminal };
      if (!response.ok || !data.terminal) {
        setFeedback(data.message ?? "Terminal kaydedilemedi.");
        return;
      }
      setTerminals((current) => current.map((item) => (item.id === data.terminal!.id ? data.terminal! : item)));
      setFeedback(`${data.terminal.name} terminal bilgileri kaydedildi.`);
    } catch {
      setFeedback("Terminal servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const createTerminal = async () => {
    const validationMessage = validateTerminalInput({
      name: terminalCreateForm.name,
      connectionMode: terminalCreateForm.connectionMode,
      ipAddress: terminalCreateForm.ipAddress,
      port: terminalCreateForm.port,
      portName: terminalCreateForm.portName,
    });

    if (validationMessage) {
      setFeedback(validationMessage);
      return;
    }

    setSavingId("terminal-new");
    try {
      const response = await fetch("/api/payment-terminals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: terminalCreateForm.name,
          connectionMode: terminalCreateForm.connectionMode,
          interfaceId: terminalCreateForm.interfaceId,
          ipAddress: terminalCreateForm.ipAddress,
          port: Number(terminalCreateForm.port),
          portName: terminalCreateForm.portName,
          baudRate: Number(terminalCreateForm.baudRate),
          useMock: terminalCreateForm.useMock,
          enabled: terminalCreateForm.enabled,
          defaultTimeoutMs: Number(terminalCreateForm.defaultTimeoutMs),
          cardTimeoutMs: Number(terminalCreateForm.cardTimeoutMs),
          serialNumber: terminalCreateForm.serialNumber,
          ecrSerialNumber: terminalCreateForm.ecrSerialNumber,
          externalDeviceBrand: terminalCreateForm.externalDeviceBrand,
          externalDeviceModel: terminalCreateForm.externalDeviceModel,
          notes: terminalCreateForm.notes,
        }),
      });
      const data = (await response.json()) as { message?: string; terminal?: PaymentTerminal };
      if (!response.ok || !data.terminal) {
        setFeedback(data.message ?? "Terminal olusturulamadi.");
        return;
      }
      setTerminals((current) => [data.terminal!, ...current]);
      setSelectedTerminalId(data.terminal.id);
      setTerminalCreateForm(createEmptyTerminalForm());
      setFeedback(`${data.terminal.name} terminali eklendi.`);
    } catch {
      setFeedback("Terminal servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteTerminal = async (id: string) => {
    setSavingId(`terminal-delete-${id}`);
    try {
      const response = await fetch(`/api/payment-terminals/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Terminal silinemedi.");
        return;
      }
      const nextTerminals = terminals.filter((item) => item.id !== id);
      setTerminals(nextTerminals);
      setSelectedTerminalId(nextTerminals[0]?.id ?? "");
      setTerminalStatus("");
      setTerminalLogs([]);
    } catch {
      setFeedback("Terminal servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const runTerminalAction = async (action: "precheck" | "pairing") => {
    if (!selectedTerminal) {
      return;
    }

    setSavingId(`${action}-${selectedTerminal.id}`);
    try {
      const response = await fetch(`/api/payments/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terminalId: selectedTerminal.id }),
      });
      const data = (await response.json()) as
        | TerminalPrecheckResult
        | TerminalPairingResult
        | { message?: string };
      if (!response.ok) {
        setFeedback((data as { message?: string }).message ?? "Terminal komutu basarisiz.");
        return;
      }

      setTerminalStatus((data as TerminalPrecheckResult).message ?? (data as TerminalPairingResult).message);
      setTerminalLogs((data as TerminalPrecheckResult).logs ?? (data as TerminalPairingResult).logs);
    } catch {
      setFeedback("Terminal komut servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  const saveServiceChargeSettings = async () => {
    setSavingId("service-charge-settings");
    try {
      const response = await fetch("/api/order-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceChargeEnabled: serviceChargeSettings.enabled,
          serviceChargeRate: Number(serviceChargeSettings.rate),
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        serviceCharge?: {
          enabled: boolean;
          rate: number;
        };
      };
      if (!response.ok) {
        setFeedback(data.message ?? "Servis ucreti ayari kaydedilemedi.");
        return;
      }

      setServiceChargeSettings({
        enabled: data.serviceCharge?.enabled ?? false,
        rate: String(data.serviceCharge?.rate ?? 10),
      });
      setFeedback(data.serviceCharge?.enabled ? "Servis ucreti aktif edildi." : "Servis ucreti kapatildi.");
    } catch {
      setFeedback("Servis ucreti ayar servisine baglanilamadi.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <WebAdminShell title="Sistem Ayarlari">
      <div className="space-y-6">
        <div className="rounded-[22px] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {feedback ? <div className="rounded-[18px] bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{feedback}</div> : null}

        <div className="space-y-6">
          <div className="space-y-6">
            {activeTab === "users" ? (
            <section className="rounded-[22px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Kullanici Yonetimi</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Ekip ve erisim rolleri</h3>
                </div>
                <div className="rounded-xl bg-slate-100 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Aktif Kullanici</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{activeCount}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {roleCards.map((card) => (
                  <div key={card.role} className="rounded-xl bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-700">{card.role}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{card.count}</p>
                    <p className="mt-2 text-xs text-slate-500">{card.permissions.join(", ")}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Yeni kullanici</p>
                  <div className="mt-4 grid gap-3">
                    <input value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ad soyad" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <input value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} placeholder="E-posta" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <input value={userForm.branch} onChange={(event) => setUserForm((current) => ({ ...current, branch: event.target.value }))} placeholder="Sube" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as UserRole }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <input value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder="Gecici sifre" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <button onClick={() => void createUser()} disabled={savingId === "user-new"} className="rounded-xl bg-[#2bcbb4] px-4 py-3 text-sm font-semibold text-[#10242a] disabled:opacity-60">Kullaniciyi Olustur</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="rounded-xl bg-slate-50 px-4 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                          {user.active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <select value={user.role} onChange={(event) => void patchUser(user.id, { role: event.target.value as UserRole })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <button onClick={() => {
                          setSelectedUserId(user.id);
                          setEditForm({ name: user.name, email: user.email, branch: user.branch, role: user.role, password: "" });
                        }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Duzenle</button>
                        <button onClick={() => void patchUser(user.id, { active: !user.active })} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Durum Degistir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedUser ? (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Secili kullanici</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <input value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <input value={editForm.branch} onChange={(event) => setEditForm((current) => ({ ...current, branch: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    <select value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as UserRole }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <input value={editForm.password} onChange={(event) => setEditForm((current) => ({ ...current, password: event.target.value }))} placeholder="Yeni sifre" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none md:col-span-2" />
                  </div>
                  <button onClick={() => void patchUser(selectedUser.id, editForm)} disabled={savingId === selectedUser.id} className="mt-4 rounded-xl bg-[#2bcbb4] px-4 py-3 text-sm font-semibold text-[#10242a] disabled:opacity-60">Degisiklikleri Kaydet</button>
                </div>
              ) : null}
            </section>
            ) : null}

            {activeTab === "menu" ? (
            <section className="rounded-[22px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Menu ve Fiyat</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Urun, grup ve toplu yonetim paneli</h3>
                </div>
                <button onClick={() => void loadCatalog()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Yenile</button>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Yeni urun</p>
                  <div className="mt-3 grid gap-3">
                    <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Urun adi" className={fieldClass} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={productForm.groupName} onChange={(event) => setProductForm((current) => ({ ...current, groupName: event.target.value }))} placeholder="Grup" className={fieldClass} />
                      <input value={productForm.subgroupName} onChange={(event) => setProductForm((current) => ({ ...current, subgroupName: event.target.value }))} placeholder="Alt grup" className={fieldClass} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} placeholder="Kategori" className={fieldClass} />
                      <input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} placeholder="SKU / Barkod" className={fieldClass} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <input value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="Fiyat" className={fieldClass} />
                      <input value={productForm.prep} onChange={(event) => setProductForm((current) => ({ ...current, prep: event.target.value }))} placeholder="Hazirlama suresi" className={fieldClass} />
                      <input value={productForm.tag} onChange={(event) => setProductForm((current) => ({ ...current, tag: event.target.value }))} placeholder="Etiket" className={fieldClass} />
                    </div>
                    <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Urun aciklamasi" className={fieldClass} />
                    <button onClick={() => void createProduct()} disabled={savingId === "product-new"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Urun Ekle</button>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Toplu urun aktarim</p>
                  <p className="mt-2 text-xs text-slate-500">JSON veya `name;groupName;subgroupName;category;price;prep;tag;description;sku` baslikli satirlar ekleyin.</p>
                  <textarea value={bulkImportText} onChange={(event) => setBulkImportText(event.target.value)} rows={10} placeholder="name;groupName;subgroupName;category;price;prep;tag;description;sku" className={`mt-3 w-full ${fieldClass}`} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => void runBulkImport()} disabled={savingId === "product-import"} className="rounded-xl bg-[#2bcbb4] px-4 py-3 text-sm font-semibold text-[#10242a] disabled:opacity-60">Toplu Ice Aktar</button>
                    <button onClick={downloadImportTemplate} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Sablon Indir</button>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Toplu fiyat guncelleme</p>
                  <div className="mt-3 grid gap-3">
                    <select value={bulkPriceForm.mode} onChange={(event) => setBulkPriceForm((current) => ({ ...current, mode: event.target.value as "percent" | "fixed" }))} className={fieldClass}>
                      <option value="percent">Yuzde</option>
                      <option value="fixed">Sabit Tutar</option>
                    </select>
                    <input value={bulkPriceForm.value} onChange={(event) => setBulkPriceForm((current) => ({ ...current, value: event.target.value }))} placeholder="Deger" className={fieldClass} />
                    <input value={bulkPriceForm.groupName} onChange={(event) => setBulkPriceForm((current) => ({ ...current, groupName: event.target.value }))} placeholder="Grup filtresi" className={fieldClass} />
                    <input value={bulkPriceForm.subgroupName} onChange={(event) => setBulkPriceForm((current) => ({ ...current, subgroupName: event.target.value }))} placeholder="Alt grup filtresi" className={fieldClass} />
                    <input value={bulkPriceForm.category} onChange={(event) => setBulkPriceForm((current) => ({ ...current, category: event.target.value }))} placeholder="Kategori filtresi" className={fieldClass} />
                    <button onClick={() => void runBulkPriceUpdate()} disabled={savingId === "product-bulk-price"} className="rounded-xl bg-[#f32774] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Toplu Fiyat Uygula</button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Urun Listesi</p>
                        <p className="mt-1 text-xs text-slate-500">{filteredProducts.length} urun, {productGroups.length} grup, {selectedProductIds.length} secili</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Urun, grup, barkod ara" className={fieldClass} />
                        <select value={productFilters.groupName} onChange={(event) => setProductFilters((current) => ({ ...current, groupName: event.target.value }))} className={fieldClass}>
                          <option value="">Tum Gruplar</option>
                          {productGroups.map((groupName) => (
                            <option key={groupName} value={groupName}>{groupName}</option>
                          ))}
                        </select>
                        <select value={productFilters.subgroupName} onChange={(event) => setProductFilters((current) => ({ ...current, subgroupName: event.target.value }))} className={fieldClass}>
                          <option value="">Tum Alt Gruplar</option>
                          {productSubgroups.map((subgroupName) => (
                            <option key={subgroupName} value={subgroupName}>{subgroupName}</option>
                          ))}
                        </select>
                        <select value={productFilters.status} onChange={(event) => setProductFilters((current) => ({ ...current, status: event.target.value as "all" | "active" | "passive" }))} className={fieldClass}>
                          <option value="all">Tum Durumlar</option>
                          <option value="active">Aktif</option>
                          <option value="passive">Pasif</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {([
                        ["groupName", "Grup"],
                        ["subgroupName", "Alt Grup"],
                        ["price", "Fiyat"],
                        ["active", "Durum"],
                        ["links", "Baglar"],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleProductColumn(key)}
                          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                            productColumns[key] ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                      <button onClick={toggleSelectAllFilteredProducts} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                        {allFilteredSelected ? "Secimi Temizle" : "Tumunu Sec"}
                      </button>
                      <button onClick={() => void runBulkStatusUpdate(true)} disabled={savingId === "product-bulk-status"} className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-60">
                        Secilileri Aktif Et
                      </button>
                      <button onClick={() => void runBulkStatusUpdate(false)} disabled={savingId === "product-bulk-status"} className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">
                        Secilileri Pasif Et
                      </button>
                      <button onClick={() => void runBulkPriceForSelection()} disabled={savingId === "product-bulk-selection-price"} className="rounded-xl bg-[#f32774] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                        Secililere Fiyat Uygula
                      </button>
                      <button onClick={() => void runBulkDelete()} disabled={savingId === "product-bulk-delete"} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60">
                        Secilileri Sil
                      </button>
                      <button onClick={exportProductsCsv} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                        CSV Aktar
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" style={{ gridTemplateColumns: productGridTemplate }}>
                      <label className="flex items-center">
                        <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFilteredProducts} />
                      </label>
                      <button onClick={() => toggleProductSort("name")} className="text-left">Urun</button>
                      {productColumns.groupName ? <button onClick={() => toggleProductSort("groupName")} className="text-left">Grup</button> : null}
                      {productColumns.subgroupName ? <button onClick={() => toggleProductSort("subgroupName")} className="text-left">Alt Grup</button> : null}
                      {productColumns.price ? <button onClick={() => toggleProductSort("price")} className="text-left">Fiyat</button> : null}
                      {productColumns.active ? <button onClick={() => toggleProductSort("active")} className="text-left">Durum</button> : null}
                      {productColumns.links ? <span>Baglar</span> : null}
                    </div>
                    <div className="max-h-[720px] overflow-auto">
                      {pagedProducts.map((product) => (
                        <div
                          key={product.id}
                          className={`grid gap-3 border-t border-slate-200 px-4 py-4 transition ${
                            selectedProductId === product.id ? "bg-[#fff4f8]" : "bg-white hover:bg-slate-50"
                          }`}
                          style={{ gridTemplateColumns: productGridTemplate }}
                        >
                          <label className="flex items-start pt-2">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                            />
                          </label>
                          <div className="min-w-0">
                            <button onClick={() => setSelectedProductId(product.id)} className="w-full text-left">
                              <p className="truncate font-semibold text-slate-900">{product.name}</p>
                            </button>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>{product.category}</span>
                              <span>•</span>
                              <span>{product.sku || "SKU yok"}</span>
                              <span>•</span>
                              <span>{product.prep}</span>
                            </div>
                          </div>
                          {productColumns.groupName ? <div className="text-sm text-slate-700">{product.groupName || "-"}</div> : null}
                          {productColumns.subgroupName ? <div className="text-sm text-slate-700">{product.subgroupName || "-"}</div> : null}
                          {productColumns.price ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={inlinePrices[product.id] ?? String(product.price)}
                                onChange={(event) => setInlinePrices((current) => ({ ...current, [product.id]: event.target.value }))}
                                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-900 outline-none"
                              />
                              <button onClick={() => void saveInlinePrice(product)} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700">
                                Kaydet
                              </button>
                            </div>
                          ) : null}
                          {productColumns.active ? (
                            <div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                              {product.active ? "Aktif" : "Pasif"}
                            </span>
                            </div>
                          ) : null}
                          {productColumns.links ? (
                            <div className="text-sm text-slate-600">
                            <p>{product.modifierIds?.length ?? 0} oz.</p>
                            <p>{product.messageIds?.length ?? 0} msg.</p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      <p>Sayfa {productPage} / {productPageCount}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setProductPage((current) => Math.max(current - 1, 1))} disabled={productPage === 1} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50">
                          Geri
                        </button>
                        <button onClick={() => setProductPage((current) => Math.min(current + 1, productPageCount))} disabled={productPage === productPageCount} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50">
                          Ileri
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedProduct ? (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Secili urun</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{selectedProduct.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => void saveProduct(selectedProduct)} disabled={savingId === `product-${selectedProduct.id}`} className="rounded-xl bg-[#2bcbb4] px-4 py-2 text-sm font-semibold text-[#10242a] disabled:opacity-60">Kaydet</button>
                          <button onClick={() => void duplicateSelectedProduct()} disabled={savingId === "product-duplicate"} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">Kopyala</button>
                          <button onClick={() => void deleteProduct(selectedProduct.id)} disabled={savingId === `product-delete-${selectedProduct.id}`} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60">Sil</button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3">
                        <input value={selectedProduct.name} onChange={(event) => updateProductDraft(selectedProduct.id, { name: event.target.value })} placeholder="Urun adi" className={fieldClass} />
                        <div className="grid gap-3 md:grid-cols-2">
                          <input value={selectedProduct.groupName ?? ""} onChange={(event) => updateProductDraft(selectedProduct.id, { groupName: event.target.value })} placeholder="Grup" className={fieldClass} />
                          <input value={selectedProduct.subgroupName ?? ""} onChange={(event) => updateProductDraft(selectedProduct.id, { subgroupName: event.target.value })} placeholder="Alt grup" className={fieldClass} />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <input value={selectedProduct.category} onChange={(event) => updateProductDraft(selectedProduct.id, { category: event.target.value })} placeholder="Kategori" className={fieldClass} />
                          <input value={selectedProduct.sku ?? ""} onChange={(event) => updateProductDraft(selectedProduct.id, { sku: event.target.value })} placeholder="SKU / Barkod" className={fieldClass} />
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <input value={selectedProduct.price} onChange={(event) => updateProductDraft(selectedProduct.id, { price: Number(event.target.value) })} placeholder="Fiyat" className={fieldClass} />
                          <input value={selectedProduct.prep} onChange={(event) => updateProductDraft(selectedProduct.id, { prep: event.target.value })} placeholder="Hazirlama suresi" className={fieldClass} />
                          <input value={selectedProduct.tag} onChange={(event) => updateProductDraft(selectedProduct.id, { tag: event.target.value })} placeholder="Etiket" className={fieldClass} />
                        </div>
                        <textarea value={selectedProduct.description ?? ""} onChange={(event) => updateProductDraft(selectedProduct.id, { description: event.target.value })} rows={3} placeholder="Aciklama" className={fieldClass} />
                        <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <input type="checkbox" checked={selectedProduct.active} onChange={(event) => updateProductDraft(selectedProduct.id, { active: event.target.checked })} />
                          Aktif urun
                        </label>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ekstra Secenekler</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {modifiers.map((modifier) => {
                              const active = selectedProduct.modifierIds?.includes(modifier.id);
                              return (
                                <button
                                  key={`${selectedProduct.id}-modifier-${modifier.id}`}
                                  onClick={() => toggleProductModifier(selectedProduct.id, modifier.id)}
                                  className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#2bcbb4] text-[#10242a]" : "bg-slate-100 text-slate-600"}`}
                                >
                                  {modifier.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Urun Mesajlari</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {quickMessages.map((message) => {
                              const active = selectedProduct.messageIds?.includes(message.id);
                              return (
                                <button
                                  key={`${selectedProduct.id}-message-${message.id}`}
                                  onClick={() => toggleProductMessage(selectedProduct.id, message.id)}
                                  className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#f32774] text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                  {message.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-700">Yeni ozellik</p>
                    <div className="mt-3 grid gap-3">
                      <input value={modifierForm.name} onChange={(event) => setModifierForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ozellik adi" className={fieldClass} />
                      <input value={modifierForm.category} onChange={(event) => setModifierForm((current) => ({ ...current, category: event.target.value }))} placeholder="Kategori" className={fieldClass} />
                      <input value={modifierForm.priceDelta} onChange={(event) => setModifierForm((current) => ({ ...current, priceDelta: event.target.value }))} placeholder="Fiyat farki" className={fieldClass} />
                      <button onClick={() => void createModifier()} disabled={savingId === "modifier-new"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Ozellik Ekle</button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-700">Ozellik listesi</p>
                    <p className="mt-1 text-xs text-slate-500">Urun kartlarindan secilerek ekstra secenek olarak baglanir.</p>
                    <div className="mt-3 space-y-3">
                      {modifiers.map((modifier) => (
                        <div key={modifier.id} className="rounded-xl bg-slate-50 p-3">
                          <div className="grid gap-2 md:grid-cols-3">
                            <input value={modifier.name} onChange={(event) => updateModifierDraft(modifier.id, { name: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                            <input value={modifier.category} onChange={(event) => updateModifierDraft(modifier.id, { category: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                            <input value={modifier.priceDelta} onChange={(event) => updateModifierDraft(modifier.id, { priceDelta: Number(event.target.value) })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                              <input type="checkbox" checked={modifier.active} onChange={(event) => updateModifierDraft(modifier.id, { active: event.target.checked })} />
                              Aktif
                            </label>
                            <button onClick={() => void saveModifier(modifier)} disabled={savingId === `modifier-${modifier.id}`} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">Kaydet</button>
                            <button onClick={() => void deleteModifier(modifier.id)} disabled={savingId === `modifier-delete-${modifier.id}`} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-60">Sil</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-700">Yeni mesaj</p>
                    <div className="mt-3 grid gap-3">
                      <input value={messageForm.title} onChange={(event) => setMessageForm((current) => ({ ...current, title: event.target.value }))} placeholder="Baslik" className={fieldClass} />
                      <textarea value={messageForm.message} onChange={(event) => setMessageForm((current) => ({ ...current, message: event.target.value }))} rows={3} placeholder="Mesaj" className={fieldClass} />
                      <button onClick={() => void createMessage()} disabled={savingId === "message-new"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Mesaj Ekle</button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-700">Hazir mesajlar</p>
                    <p className="mt-1 text-xs text-slate-500">Urun bazinda eklenebilir, siparis notlarina hizli aktarilir.</p>
                    <div className="mt-3 space-y-3">
                      {quickMessages.map((message) => (
                        <div key={message.id} className="rounded-xl bg-slate-50 p-3">
                          <input value={message.title} onChange={(event) => updateMessageDraft(message.id, { title: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                          <textarea value={message.message} onChange={(event) => updateMessageDraft(message.id, { message: event.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                              <input type="checkbox" checked={message.active} onChange={(event) => updateMessageDraft(message.id, { active: event.target.checked })} />
                              Aktif
                            </label>
                            <button onClick={() => void saveMessage(message)} disabled={savingId === `message-${message.id}`} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">Kaydet</button>
                            <button onClick={() => void deleteMessage(message.id)} disabled={savingId === `message-delete-${message.id}`} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-60">Sil</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-700">Servis ucreti</p>
                    <p className="mt-1 text-xs text-slate-500">Varsayilan olarak kapali. Istendiginde siparis ve hizli satis toplamlarina yuzde olarak eklenir.</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_160px]">
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={serviceChargeSettings.enabled}
                          onChange={(event) =>
                            setServiceChargeSettings((current) => ({ ...current, enabled: event.target.checked }))
                          }
                        />
                        Servis ucreti aktif
                      </label>
                      <input
                        value={serviceChargeSettings.rate}
                        onChange={(event) =>
                          setServiceChargeSettings((current) => ({ ...current, rate: event.target.value }))
                        }
                        placeholder="Yuzde"
                        className={fieldClass}
                      />
                    </div>
                    <button
                      onClick={() => void saveServiceChargeSettings()}
                      disabled={savingId === "service-charge-settings"}
                      className="mt-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      Servis Ayarini Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </section>
            ) : null}
          </div>

          <div className="space-y-6">
            {activeTab === "terminals" ? (
            <section className="rounded-[22px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Ingenico Move5000F</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Serial ve ethernet baglantisi</h3>
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Yeni terminal</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input value={terminalCreateForm.name} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, name: event.target.value }))} placeholder="Terminal adi" className={fieldClass} />
                  <select value={terminalCreateForm.connectionMode} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, connectionMode: event.target.value as PaymentTerminal["connectionMode"] }))} className={fieldClass}>
                    <option value="ethernet">Ethernet</option>
                    <option value="serial">Serial</option>
                  </select>
                  <input value={terminalCreateForm.ipAddress} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, ipAddress: event.target.value }))} placeholder="IP adresi" className={fieldClass} />
                  <input value={terminalCreateForm.port} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, port: event.target.value }))} placeholder="TCP Port" className={fieldClass} />
                  <input value={terminalCreateForm.portName} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, portName: event.target.value }))} placeholder="COM port" className={fieldClass} />
                  <input value={terminalCreateForm.baudRate} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, baudRate: event.target.value }))} placeholder="Baud rate" className={fieldClass} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {terminalCreateForm.connectionMode === "ethernet"
                    ? "Ethernet icin IP adresi ve port zorunludur."
                    : "Serial icin COM port zorunludur."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={terminalCreateForm.useMock} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, useMock: event.target.checked }))} />
                    Mock
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={terminalCreateForm.enabled} onChange={(event) => setTerminalCreateForm((current) => ({ ...current, enabled: event.target.checked }))} />
                    Etkin
                  </label>
                  <button onClick={() => void createTerminal()} disabled={savingId === "terminal-new"} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Terminal Ekle</button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {terminals.map((terminal) => (
                  <button key={terminal.id} onClick={() => setSelectedTerminalId(terminal.id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedTerminalId === terminal.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {terminal.name}
                  </button>
                ))}
              </div>

              {selectedTerminal ? (
                <div className="mt-5 space-y-3">
                  <input value={terminalForm.name} onChange={(event) => setTerminalForm((current) => ({ ...current, name: event.target.value }))} className={`w-full ${fieldClass}`} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <select value={terminalForm.connectionMode} onChange={(event) => setTerminalForm((current) => ({ ...current, connectionMode: event.target.value as PaymentTerminal["connectionMode"] }))} className={fieldClass}>
                      <option value="ethernet">Ethernet</option>
                      <option value="serial">Serial</option>
                    </select>
                    <input value={terminalForm.interfaceId} onChange={(event) => setTerminalForm((current) => ({ ...current, interfaceId: event.target.value }))} placeholder="Interface ID" className={fieldClass} />
                    <input value={terminalForm.ipAddress} onChange={(event) => setTerminalForm((current) => ({ ...current, ipAddress: event.target.value }))} placeholder="IP" className={fieldClass} />
                    <input value={terminalForm.port} onChange={(event) => setTerminalForm((current) => ({ ...current, port: event.target.value }))} placeholder="Port" className={fieldClass} />
                    <input value={terminalForm.portName} onChange={(event) => setTerminalForm((current) => ({ ...current, portName: event.target.value }))} placeholder="COM port" className={fieldClass} />
                    <input value={terminalForm.baudRate} onChange={(event) => setTerminalForm((current) => ({ ...current, baudRate: event.target.value }))} placeholder="Baud" className={fieldClass} />
                    <input value={terminalForm.defaultTimeoutMs} onChange={(event) => setTerminalForm((current) => ({ ...current, defaultTimeoutMs: event.target.value }))} placeholder="Genel timeout" className={fieldClass} />
                    <input value={terminalForm.cardTimeoutMs} onChange={(event) => setTerminalForm((current) => ({ ...current, cardTimeoutMs: event.target.value }))} placeholder="Kart timeout" className={fieldClass} />
                    <input value={terminalForm.serialNumber} onChange={(event) => setTerminalForm((current) => ({ ...current, serialNumber: event.target.value }))} placeholder="Cihaz seri no" className={fieldClass} />
                    <input value={terminalForm.ecrSerialNumber} onChange={(event) => setTerminalForm((current) => ({ ...current, ecrSerialNumber: event.target.value }))} placeholder="ECR seri no" className={fieldClass} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {terminalForm.connectionMode === "ethernet"
                      ? "Ethernet modunda IP ve port dolu olmali."
                      : "Serial modunda COM port dolu olmali."}
                  </p>
                  <textarea value={terminalForm.notes} onChange={(event) => setTerminalForm((current) => ({ ...current, notes: event.target.value }))} rows={3} placeholder="Terminal notlari" className={`w-full ${fieldClass}`} />
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={terminalForm.useMock} onChange={(event) => setTerminalForm((current) => ({ ...current, useMock: event.target.checked }))} /> Mock bridge kullan</label>
                    <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={terminalForm.enabled} onChange={(event) => setTerminalForm((current) => ({ ...current, enabled: event.target.checked }))} /> Terminal etkin</label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => void saveTerminal()} disabled={savingId === `terminal-${selectedTerminal.id}`} className="rounded-xl bg-[#2bcbb4] px-4 py-3 text-sm font-semibold text-[#10242a] disabled:opacity-60">Kaydet</button>
                    <button onClick={() => void runTerminalAction("precheck")} disabled={savingId === `precheck-${selectedTerminal.id}`} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Precheck</button>
                    <button onClick={() => void runTerminalAction("pairing")} disabled={savingId === `pairing-${selectedTerminal.id}`} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60">Pairing</button>
                    <button onClick={() => void deleteTerminal(selectedTerminal.id)} disabled={savingId === `terminal-delete-${selectedTerminal.id}`} className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 disabled:opacity-60">Sil</button>
                  </div>
                  {terminalStatus ? <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{terminalStatus}</div> : null}
                  {terminalLogs.length ? (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      {terminalLogs.map((line) => (
                        <p key={line} className="leading-6">{line}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
            ) : null}

            {activeTab === "payments" ? (
            <section className="rounded-[22px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Odeme Kayitlari</p>
              <div className="mt-4 space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{payment.paymentName}</p>
                        <p className="mt-1 text-sm text-slate-500">{payment.orderId} / {payment.terminalId}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "approved" ? "bg-emerald-100 text-emerald-700" : payment.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">₺{payment.amount.toLocaleString("tr-TR")}</div>
                  </div>
                ))}
              </div>
            </section>
            ) : null}
          </div>
        </div>
      </div>
    </WebAdminShell>
  );
}
