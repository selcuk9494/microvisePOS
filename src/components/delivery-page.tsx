"use client";

import { useEffect, useMemo, useState } from "react";

import { PosScreen } from "@/components/pos-screen";
import { useSession } from "@/hooks/use-session";
import type {
  DeliveryAddress,
  DeliveryOrder,
  DeliveryOrderLineItem,
  MenuModifier,
  MenuProduct,
  QuickMessage,
} from "@/lib/pos-data";

const deliveryStyles = {
  hazirlaniyor: "bg-cyan-100 text-cyan-700",
  "kurye-atandi": "bg-amber-100 text-amber-700",
  yolda: "bg-emerald-100 text-emerald-700",
  teslim: "bg-slate-200 text-slate-500",
} as const;

type DeliveryPageProps = {
  orders: DeliveryOrder[];
  selectedOrder: DeliveryOrder | null;
};

type CatalogPayload = {
  products: MenuProduct[];
  modifiers: MenuModifier[];
  quickMessages: QuickMessage[];
  addresses: DeliveryAddress[];
};

type DeliveryCreateStep = "customer" | "address" | "menu";

type CustomerOption = {
  name: string;
  phone: string;
  zone: string;
  addressCount: number;
  defaultAddressId?: string;
};

function formatTotal(items: DeliveryOrderLineItem[]) {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return `TL${total}`;
}

export function DeliveryPage({ orders, selectedOrder }: DeliveryPageProps) {
  const { user } = useSession();
  const canManageDelivery = user?.role === "Yonetici" || user?.role === "Kasiyer" || user?.role === "Garson";
  const [deliveryOrders, setDeliveryOrders] = useState(orders);
  const [selectedOrderId, setSelectedOrderId] = useState(selectedOrder?.id ?? orders[0]?.id ?? "");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState<DeliveryCreateStep>("customer");
  const [customerSearch, setCustomerSearch] = useState("");
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [modifiers, setModifiers] = useState<MenuModifier[]>([]);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedModifierIds, setSelectedModifierIds] = useState<number[]>([]);
  const [lineQty, setLineQty] = useState(1);
  const [lineNote, setLineNote] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState("Hepsi");
  const [cart, setCart] = useState<DeliveryOrderLineItem[]>(selectedOrder?.items ?? []);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressForm, setAddressForm] = useState({
    customer: "",
    label: "Ev",
    phone: "",
    zone: "",
    addressLine: "",
    note: "",
    defaultAddress: true,
  });
  const [form, setForm] = useState({
    channel: selectedOrder?.channel ?? "Telefon",
    customer: selectedOrder?.customer ?? "",
    zone: selectedOrder?.zone ?? "",
    eta: selectedOrder?.eta ?? "20 dk",
    courier: selectedOrder?.courier ?? "Atanacak",
    phone: selectedOrder?.phone ?? "",
    address: selectedOrder?.address ?? "",
    note: selectedOrder?.note ?? "",
    addressId: selectedOrder?.addressId ?? "",
    paymentMethod: selectedOrder?.paymentMethod ?? "nakit",
  });

  const selectedDeliveryOrder = useMemo(
    () => deliveryOrders.find((order) => order.id === selectedOrderId) ?? null,
    [deliveryOrders, selectedOrderId],
  );
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const selectedModifiers = modifiers.filter((modifier) => selectedModifierIds.includes(modifier.id));
  const menuCategories = useMemo(
    () => ["Hepsi", ...new Set(products.filter((product) => product.active !== false).map((product) => product.category))],
    [products],
  );
  const visibleMenuProducts = useMemo(() => {
    const activeProducts = products.filter((product) => product.active !== false);

    if (selectedMenuCategory === "Hepsi") {
      return activeProducts;
    }

    return activeProducts.filter((product) => product.category === selectedMenuCategory);
  }, [products, selectedMenuCategory]);
  const customerOptions = useMemo(() => {
    const grouped = new Map<string, CustomerOption>();

    for (const address of addresses) {
      const key = address.customer.trim().toLowerCase();

      if (!key) {
        continue;
      }

      const existing = grouped.get(key);

      if (existing) {
        existing.addressCount += 1;
        if (!existing.phone && address.phone) {
          existing.phone = address.phone;
        }
        if (!existing.zone && address.zone) {
          existing.zone = address.zone;
        }
        if (address.defaultAddress) {
          existing.defaultAddressId = address.id;
        }
        continue;
      }

      grouped.set(key, {
        name: address.customer,
        phone: address.phone,
        zone: address.zone,
        addressCount: 1,
        defaultAddressId: address.defaultAddress ? address.id : undefined,
      });
    }

    return [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name, "tr"));
  }, [addresses]);
  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();

    if (!search) {
      return customerOptions;
    }

    return customerOptions.filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.zone}`.toLowerCase().includes(search),
    );
  }, [customerOptions, customerSearch]);
  const selectedCustomerAddresses = useMemo(
    () =>
      addresses
        .filter((address) => address.customer === form.customer)
        .sort((left, right) => Number(right.defaultAddress) - Number(left.defaultAddress)),
    [addresses, form.customer],
  );
  const filteredAddresses = addresses.filter((address) =>
    form.customer ? address.customer.toLowerCase().includes(form.customer.toLowerCase()) : true,
  );
  const activeTotalAmount = useMemo(
    () =>
      deliveryOrders
        .filter((order) => order.status !== "teslim")
        .reduce((sum, order) => sum + Number(order.total.replace(/[^\d]/g, "")), 0),
    [deliveryOrders],
  );
  const incoming = deliveryOrders.filter((order) => order.status === "hazirlaniyor").length;
  const outgoing = deliveryOrders.filter((order) => order.status === "yolda").length;
  const courierAssigned = deliveryOrders.filter((order) => order.status === "kurye-atandi").length;
  const completed = deliveryOrders.filter((order) => order.status === "teslim").length;
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const applyAddressToOrder = (address: DeliveryAddress) => {
    setForm((current) => ({
      ...current,
      customer: address.customer,
      phone: address.phone,
      zone: address.zone,
      address: address.addressLine,
      note: current.note || address.note,
      addressId: address.id,
    }));
  };

  const populateAddressForm = (address: DeliveryAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      customer: address.customer,
      label: address.label,
      phone: address.phone,
      zone: address.zone,
      addressLine: address.addressLine,
      note: address.note,
      defaultAddress: address.defaultAddress,
    });
  };

  const resetAddressForm = () => {
    setEditingAddressId("");
    setAddressForm({
      customer: form.customer,
      label: "Ev",
      phone: form.phone,
      zone: form.zone,
      addressLine: form.address,
      note: "",
      defaultAddress: true,
    });
  };

  const upsertAddressState = (nextAddress: DeliveryAddress) => {
    setAddresses((current) => {
      const base =
        nextAddress.defaultAddress
          ? current.map((item) =>
              item.customer === nextAddress.customer ? { ...item, defaultAddress: false } : item,
            )
          : current;
      const existing = base.some((item) => item.id === nextAddress.id);
      if (existing) {
        return base.map((item) => (item.id === nextAddress.id ? nextAddress : item));
      }
      return [...base, nextAddress];
    });
  };

  const prepareAddressForm = (customer: string, phone = "", zone = "", addressLine = "") => {
    setEditingAddressId("");
    setAddressForm({
      customer,
      label: "Ev",
      phone,
      zone,
      addressLine,
      note: "",
      defaultAddress: true,
    });
  };

  const selectCustomer = (customer: CustomerOption) => {
    const customerAddresses = addresses
      .filter((address) => address.customer === customer.name)
      .sort((left, right) => Number(right.defaultAddress) - Number(left.defaultAddress));
    const defaultAddress = customerAddresses[0];

    setForm((current) => ({
      ...current,
      customer: customer.name,
      phone: defaultAddress?.phone ?? customer.phone ?? current.phone,
      zone: defaultAddress?.zone ?? customer.zone ?? current.zone,
      address: defaultAddress?.addressLine ?? "",
      addressId: defaultAddress?.id ?? "",
    }));

    if (defaultAddress) {
      populateAddressForm(defaultAddress);
    } else {
      prepareAddressForm(customer.name, customer.phone, customer.zone);
    }

    setCreateStep("address");
  };

  const startNewCustomerFlow = () => {
    setForm((current) => ({
      ...current,
      customer: "",
      phone: "",
      zone: "",
      address: "",
      addressId: "",
    }));
    prepareAddressForm("");
    setCreateStep("address");
  };

  const chooseAddressForCreate = (address: DeliveryAddress) => {
    applyAddressToOrder(address);
    populateAddressForm(address);
    setCreateStep("menu");
  };

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
      setAddresses(data.addresses ?? []);
      setSelectedProductId((current) => current ?? data.products?.[0]?.id ?? null);
    } catch {
      setFeedback("Katalog servislerine baglanilamadi.");
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  const loadOrderIntoState = (order: DeliveryOrder) => {
    setCreating(false);
    setCreateStep("menu");
    setSelectedOrderId(order.id);
    setCart(order.items);
    setForm({
      channel: order.channel,
      customer: order.customer,
      zone: order.zone,
      eta: order.eta,
      courier: order.courier,
      phone: order.phone,
      address: order.address,
      note: order.note,
      addressId: order.addressId ?? "",
      paymentMethod: order.paymentMethod ?? "nakit",
    });
  };

  const resetForCreate = () => {
    setCreating(true);
    setCreateStep("customer");
    setCustomerSearch("");
    setSelectedOrderId("");
    setCart([]);
    setForm({
      channel: "Telefon",
      customer: "",
      zone: "",
      eta: "20 dk",
      courier: "Atanacak",
      phone: "",
      address: "",
      note: "",
      addressId: "",
      paymentMethod: "nakit",
    });
    setLineNote("");
    setSelectedMessageId(null);
    setSelectedModifierIds([]);
    setLineQty(1);
    setSelectedMenuCategory("Hepsi");
    setEditingAddressId("");
    setAddressForm({
      customer: "",
      label: "Ev",
      phone: "",
      zone: "",
      addressLine: "",
      note: "",
      defaultAddress: true,
    });
  };

  const refreshFromPayload = (nextOrders: DeliveryOrder[]) => {
    setDeliveryOrders(nextOrders);
    if (!nextOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(nextOrders[0]?.id ?? "");
    }
  };

  const addLineToCart = () => {
    if (!selectedProduct) {
      return;
    }

    const modifierNames = selectedModifiers.map((item) => item.name);
    const modifierExtra = selectedModifiers.reduce((sum, item) => sum + item.priceDelta, 0);
    const noteParts = [lineNote.trim(), quickMessages.find((item) => item.id === selectedMessageId)?.message ?? ""]
      .filter(Boolean)
      .join(" / ");
    const unitPrice = selectedProduct.price + modifierExtra;

    setCart((current) => [
      ...current,
      {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        qty: lineQty,
        unitPrice,
        totalPrice: unitPrice * lineQty,
        modifiers: modifierNames,
        note: noteParts,
      },
    ]);

    setLineQty(1);
    setSelectedModifierIds([]);
    setLineNote("");
    setSelectedMessageId(null);
  };

  const removeLine = (index: number) => {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const createAddress = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/delivery-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = (await response.json()) as { message?: string; address?: DeliveryAddress };
      if (!response.ok || !data.address) {
        setFeedback(data.message ?? "Adres eklenemedi.");
        return;
      }
      upsertAddressState(data.address);
      applyAddressToOrder(data.address);
      populateAddressForm(data.address);
      if (creating) {
        setCreateStep("menu");
      }
      setFeedback(`${data.address.label} adresi eklendi.`);
    } catch {
      setFeedback("Adres servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const updateAddress = async () => {
    if (!editingAddressId) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/delivery-addresses/${editingAddressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = (await response.json()) as { message?: string; address?: DeliveryAddress };
      if (!response.ok || !data.address) {
        setFeedback(data.message ?? "Adres guncellenemedi.");
        return;
      }
      upsertAddressState(data.address);
      applyAddressToOrder(data.address);
      populateAddressForm(data.address);
      if (creating) {
        setCreateStep("menu");
      }
      setFeedback(`${data.address.label} adresi guncellendi.`);
    } catch {
      setFeedback("Adres servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/delivery-addresses/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setFeedback(data.message ?? "Adres silinemedi.");
        return;
      }
      setAddresses((current) => current.filter((item) => item.id !== id));
      if (form.addressId === id) {
        setForm((current) => ({ ...current, addressId: "" }));
      }
      if (editingAddressId === id) {
        resetAddressForm();
      }
      setFeedback("Adres silindi.");
    } catch {
      setFeedback("Adres servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const buildPayload = () => ({
    channel: form.channel,
    customer: form.customer,
    zone: form.zone,
    total: formatTotal(cart),
    eta: form.eta,
    courier: form.courier,
    phone: form.phone,
    address: form.address,
    note: form.note,
    addressId: form.addressId || undefined,
    paymentMethod: form.paymentMethod,
    items: cart,
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/delivery-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = (await response.json()) as { message?: string; order?: DeliveryOrder; deliveryOrders?: DeliveryOrder[] };
      if (!response.ok || !data.order || !data.deliveryOrders) {
        setFeedback(data.message ?? "Paket siparisi olusturulamadi.");
        return;
      }
      refreshFromPayload(data.deliveryOrders);
      loadOrderIntoState(data.order);
      setFeedback(`${data.order.id} olusturuldu.`);
    } catch {
      setFeedback("Paket servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (patch?: Partial<DeliveryOrder>) => {
    if (!selectedDeliveryOrder) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/delivery-orders/${selectedDeliveryOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch ?? buildPayload()),
      });
      const data = (await response.json()) as { message?: string; order?: DeliveryOrder; deliveryOrders?: DeliveryOrder[] };
      if (!response.ok || !data.order || !data.deliveryOrders) {
        setFeedback(data.message ?? "Paket siparisi guncellenemedi.");
        return;
      }
      refreshFromPayload(data.deliveryOrders);
      loadOrderIntoState(data.order);
      setFeedback(`${data.order.id} guncellendi.`);
    } catch {
      setFeedback("Paket guncelleme servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeliveryOrder) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/delivery-orders/${selectedDeliveryOrder.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string; deliveryOrders?: DeliveryOrder[] };
      if (!response.ok || !data.deliveryOrders) {
        setFeedback(data.message ?? "Paket siparisi silinemedi.");
        return;
      }
      refreshFromPayload(data.deliveryOrders);
      resetForCreate();
      setFeedback(`${selectedDeliveryOrder.id} silindi.`);
    } catch {
      setFeedback("Silme servisine baglanilamadi.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!selectedDeliveryOrder) {
      return;
    }
    const nextStatusMap: Record<DeliveryOrder["status"], DeliveryOrder["status"]> = {
      hazirlaniyor: "kurye-atandi",
      "kurye-atandi": "yolda",
      yolda: "teslim",
      teslim: "teslim",
    };
    await handleUpdate({ status: nextStatusMap[selectedDeliveryOrder.status] });
  };

  const cancelCreate = () => {
    const fallbackOrder = deliveryOrders[0] ?? null;

    setCreating(false);

    if (fallbackOrder) {
      loadOrderIntoState(fallbackOrder);
      return;
    }

    setSelectedOrderId("");
  };

  return (
    <PosScreen
      section="Take Away"
      tabs={[
        { label: "Gelen Siparisler", active: true, count: String(incoming + courierAssigned) },
        { label: "Giden Siparisler", count: String(outgoing + completed) },
      ]}
      leftPanel={
        <div className="flex h-full flex-col">
          <div className="border-b border-[#ddd4e5] px-4 py-3">
            <div className="flex items-center justify-between text-sm font-semibold text-[#6c5b89]">
              <span>Paket Sirasi</span>
              <span>{deliveryOrders.length} kayit</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {deliveryOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => loadOrderIntoState(order)}
                className={`block w-full border-b border-[#e3dce9] px-4 py-3 text-left ${selectedOrderId === order.id ? "bg-[#f1e5b8]" : "bg-white/40"}`}
              >
                <div className="flex items-center justify-between text-xs text-[#8b819b]">
                  <span>{order.channel}</span>
                  <span>{order.id}</span>
                </div>
                <p className="mt-2 text-base font-semibold text-[#4e4460]">{order.customer}</p>
                <p className="mt-1 text-xs text-[#8b819b]">{order.address}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${deliveryStyles[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-[#7a6a8f]">{order.total}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-[#f61c74] px-4 py-4 text-white">
            <button
              disabled={!canManageDelivery}
              onClick={resetForCreate}
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-bold text-[#ec1b64] disabled:cursor-not-allowed disabled:opacity-50"
            >
              YENI SIPARIS
            </button>
            <div className="text-right">
              <p className="text-xs font-medium text-white/80">AKTIF TUTAR</p>
              <p className="text-3xl font-bold">₺{activeTotalAmount.toLocaleString("tr-TR")}</p>
            </div>
          </div>
        </div>
      }
      mainPanel={
        <div className="relative h-full overflow-auto px-5 py-5">
          {feedback ? (
            <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {feedback}
            </div>
          ) : null}
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#6c5b89]">Siparis Formu</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} placeholder="Musteri" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <select value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value }))} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                      {["Telefon", "Getir", "Trendyol", "Web"].map((channel) => (
                        <option key={channel} value={channel}>{channel}</option>
                      ))}
                    </select>
                    <select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value as NonNullable<DeliveryOrder["paymentMethod"]> }))} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                      <option value="nakit">Nakit</option>
                      <option value="kart">Kart</option>
                      <option value="online">Online</option>
                    </select>
                    <input value={form.zone} onChange={(event) => setForm((current) => ({ ...current, zone: event.target.value }))} placeholder="Bolge" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={form.courier} onChange={(event) => setForm((current) => ({ ...current, courier: event.target.value }))} placeholder="Kurye" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={form.eta} onChange={(event) => setForm((current) => ({ ...current, eta: event.target.value }))} placeholder="Teslim suresi" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Adres" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                    <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} rows={3} placeholder="Siparis notu" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none md:col-span-2" />
                  </div>
                </div>

                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#6c5b89]">Urun Girisi</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <select value={selectedProductId ?? ""} onChange={(event) => setSelectedProductId(Number(event.target.value))} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name} - ₺{product.price}</option>
                      ))}
                    </select>
                    <input value={lineQty} onChange={(event) => setLineQty(Number(event.target.value) || 1)} placeholder="Adet" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {modifiers.map((modifier) => {
                      const active = selectedModifierIds.includes(modifier.id);
                      return (
                        <button
                          key={modifier.id}
                          onClick={() =>
                            setSelectedModifierIds((current) =>
                              active ? current.filter((id) => id !== modifier.id) : [...current, modifier.id],
                            )
                          }
                          className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#4a297e] text-white" : "bg-[#f3edf8] text-[#5a4f6f]"}`}
                        >
                          {modifier.name} {modifier.priceDelta ? `(+₺${modifier.priceDelta})` : ""}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <textarea value={lineNote} onChange={(event) => setLineNote(event.target.value)} rows={2} placeholder="Satir notu" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <select value={selectedMessageId ?? ""} onChange={(event) => setSelectedMessageId(event.target.value ? Number(event.target.value) : null)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                      <option value="">Hazir mesaj sec</option>
                      {quickMessages.map((message) => (
                        <option key={message.id} value={message.id}>{message.title}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={addLineToCart} className="mt-4 rounded-xl bg-[#f32774] px-4 py-3 text-sm font-semibold text-white">Sepete Ekle</button>
                </div>

                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => void handleUpdate()} disabled={saving || !canManageDelivery} className="rounded-xl bg-[#63bf77] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                      Siparisi Guncelle
                    </button>
                    <button onClick={() => void handleAdvanceStatus()} disabled={!selectedDeliveryOrder || saving} className="rounded-xl bg-[#4a297e] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Durum Ilerlet</button>
                    <button onClick={() => void handleDelete()} disabled={!selectedDeliveryOrder || saving} className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60">Siparisi Sil</button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#6c5b89]">Adres Defteri</p>
                    <span className="text-xs text-slate-500">Birden fazla adres secimi</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {filteredAddresses.map((address) => (
                      <div key={address.id} className={`rounded-xl border px-4 py-3 ${form.addressId === address.id ? "border-[#f32774] bg-[#fff2f7]" : "border-slate-200 bg-slate-50"}`}>
                        <button
                          onClick={() => {
                            applyAddressToOrder(address);
                            populateAddressForm(address);
                          }}
                          className="block w-full text-left"
                        >
                          <p className="font-semibold text-slate-900">{address.customer} / {address.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{address.addressLine}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{address.phone} / {address.zone} {address.defaultAddress ? "/ Varsayilan" : ""}</p>
                        </button>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => populateAddressForm(address)} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-700">Duzenle</button>
                          <button onClick={() => void deleteAddress(address.id)} disabled={saving} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-rose-600 disabled:opacity-60">Sil</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">{editingAddressId ? "Adres duzenle" : "Yeni adres"}</p>
                      {editingAddressId ? (
                        <button onClick={resetAddressForm} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          Yeni Form
                        </button>
                      ) : null}
                    </div>
                    <input value={addressForm.customer} onChange={(event) => setAddressForm((current) => ({ ...current, customer: event.target.value }))} placeholder="Yeni adres musteri" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} placeholder="Etiket" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <input value={addressForm.zone} onChange={(event) => setAddressForm((current) => ({ ...current, zone: event.target.value }))} placeholder="Bolge" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <textarea value={addressForm.addressLine} onChange={(event) => setAddressForm((current) => ({ ...current, addressLine: event.target.value }))} rows={2} placeholder="Adres satiri" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <textarea value={addressForm.note} onChange={(event) => setAddressForm((current) => ({ ...current, note: event.target.value }))} rows={2} placeholder="Adres notu" className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none" />
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={addressForm.defaultAddress} onChange={(event) => setAddressForm((current) => ({ ...current, defaultAddress: event.target.checked }))} />
                      Varsayilan adres yap
                    </label>
                    <button onClick={() => void (editingAddressId ? updateAddress() : createAddress())} disabled={saving} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                      {editingAddressId ? "Adresi Guncelle" : "Adresi Kaydet"}
                    </button>
                  </div>
                </div>

                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#6c5b89]">Siparis Sepeti</p>
                  <div className="mt-3 space-y-3">
                    {cart.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{item.qty}x {item.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.modifiers.join(", ") || "Standart"} {item.note ? ` / ${item.note}` : ""}</p>
                          </div>
                          <button onClick={() => removeLine(index)} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-rose-600">Sil</button>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#f32774]">₺{item.totalPrice.toLocaleString("tr-TR")}</p>
                      </div>
                    ))}
                    {!cart.length ? <p className="text-sm text-slate-500">Sepette henuz urun yok.</p> : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-lg font-bold text-slate-900">
                    <span>Toplam</span>
                    <span>₺{cartTotal.toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              </div>
            </div>

          {creating ? (
            <div className="absolute inset-0 z-20 flex items-start justify-center bg-[#1b1034]/45 p-5 backdrop-blur-[2px]">
              {createStep === "customer" ? (
                <div className="mt-8 w-full max-w-2xl rounded-[28px] bg-white shadow-[0_24px_80px_rgba(18,8,38,0.28)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f32774]">Musteri</p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-900">Musteri Listesi</h3>
                    </div>
                    <button onClick={cancelCreate} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">X</button>
                  </div>
                  <div className="px-6 py-5">
                    <input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Arama"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <div className="mt-4 max-h-[420px] space-y-2 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={`${customer.name}-${customer.phone}`}
                          onClick={() => selectCustomer(customer)}
                          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-[#f32774] hover:bg-[#fff4f8]"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{customer.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{customer.phone || "Telefon yok"}</p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>{customer.addressCount} adres</p>
                            <p className="mt-1">{customer.zone || "-"}</p>
                          </div>
                        </button>
                      ))}
                      {!filteredCustomers.length ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                          Sonuca ulasilamadi.
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-6 py-4">
                    <button onClick={startNewCustomerFlow} className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
                      Yeni Musteri Ekle
                    </button>
                  </div>
                </div>
              ) : null}

              {createStep === "address" ? (
                <div className="mt-6 w-full max-w-4xl rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(18,8,38,0.28)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f32774]">Musteri / Adres</p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-900">{form.customer || "Yeni Musteri"}</h3>
                    </div>
                    <button onClick={cancelCreate} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">X</button>
                  </div>
                  <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[24px] border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-500">Kayitli Adresler</p>
                      <div className="mt-4 space-y-3">
                        {selectedCustomerAddresses.map((address) => (
                          <div key={address.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{address.label}</p>
                                <p className="mt-1 text-sm text-slate-500">{address.addressLine}</p>
                                <p className="mt-1 text-xs text-slate-500">{address.phone} / {address.zone}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => chooseAddressForCreate(address)} className="rounded-xl bg-[#ff416c] px-4 py-2 text-xs font-semibold text-white">Sec</button>
                                <button onClick={() => populateAddressForm(address)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">Duzenle</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {!selectedCustomerAddresses.length ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                            Kayitli adres yok.
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-500">{editingAddressId ? "Musteri / Adres Duzenle" : "Yeni Adres"}</p>
                      <div className="mt-4 grid gap-3">
                        <input value={addressForm.customer} onChange={(event) => setAddressForm((current) => ({ ...current, customer: event.target.value }))} placeholder="Musteri adi" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                        <input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telefon" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                        <div className="grid gap-3 md:grid-cols-2">
                          <input value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} placeholder="Etiket" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                          <input value={addressForm.zone} onChange={(event) => setAddressForm((current) => ({ ...current, zone: event.target.value }))} placeholder="Bolge" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                        </div>
                        <textarea value={addressForm.addressLine} onChange={(event) => setAddressForm((current) => ({ ...current, addressLine: event.target.value }))} rows={3} placeholder="Adres satiri" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                        <textarea value={addressForm.note} onChange={(event) => setAddressForm((current) => ({ ...current, note: event.target.value }))} rows={2} placeholder="Adres notu" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input type="checkbox" checked={addressForm.defaultAddress} onChange={(event) => setAddressForm((current) => ({ ...current, defaultAddress: event.target.checked }))} />
                          Varsayilan adres
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button onClick={() => setCreateStep("customer")} className="rounded-2xl border-2 border-[#ff416c] px-5 py-3 text-sm font-semibold text-[#ff416c]">Geri</button>
                          <button onClick={() => void (editingAddressId ? updateAddress() : createAddress())} disabled={saving} className="rounded-2xl bg-[#ff416c] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                            {editingAddressId ? "Guncelle" : "Kaydet"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {createStep === "menu" ? (
                <div className="h-full w-full rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(18,8,38,0.28)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f32774]">Siparisler</p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-900">{form.customer}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCreateStep("address")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Adresi Degistir</button>
                      <button onClick={cancelCreate} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">X</button>
                    </div>
                  </div>
                  <div className="mt-5 grid h-[calc(100%-4.5rem)] gap-5 xl:grid-cols-[0.34fr_0.66fr_0.24fr]">
                    <div className="flex min-h-0 flex-col rounded-[24px] border border-slate-200">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-500">Siparis Listesi</p>
                      </div>
                      <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
                        {cart.map((item, index) => (
                          <div key={`${item.productId}-${index}`} className="rounded-xl bg-slate-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">{item.qty}x {item.name}</p>
                                <p className="mt-1 text-xs text-slate-500">{item.modifiers.join(", ") || "Standart"} {item.note ? ` / ${item.note}` : ""}</p>
                              </div>
                              <button onClick={() => removeLine(index)} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-rose-600">Sil</button>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-[#ff416c]">₺{item.totalPrice.toLocaleString("tr-TR")}</p>
                          </div>
                        ))}
                        {!cart.length ? <p className="text-sm text-slate-500">Sepette urun yok.</p> : null}
                      </div>
                      <div className="border-t border-slate-100 px-4 py-4">
                        <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                          <span>Toplam</span>
                          <span>₺{cartTotal.toLocaleString("tr-TR")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-col rounded-[24px] border border-slate-200 p-4">
                      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                        <div className="rounded-2xl bg-[#fff4f8] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-[#d8507d]">Secili Musteri</p>
                          <p className="mt-1 font-semibold text-slate-900">{form.customer}</p>
                          <p className="mt-1 text-xs text-slate-500">{form.phone} / {form.address}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kanal</p>
                          <p className="mt-1">{form.channel}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Odeme</p>
                          <p className="mt-1">{form.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <select value={selectedProductId ?? ""} onChange={(event) => setSelectedProductId(Number(event.target.value))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none">
                          {visibleMenuProducts.map((product) => (
                            <option key={product.id} value={product.id}>{product.name} - ₺{product.price}</option>
                          ))}
                        </select>
                        <input value={lineQty} onChange={(event) => setLineQty(Number(event.target.value) || 1)} placeholder="Adet" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {menuCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedMenuCategory(category)}
                            className={`rounded-full px-3 py-2 text-xs font-semibold ${
                              selectedMenuCategory === category
                                ? "bg-[#4a247d] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {modifiers.map((modifier) => {
                          const active = selectedModifierIds.includes(modifier.id);
                          return (
                            <button
                              key={modifier.id}
                              onClick={() =>
                                setSelectedModifierIds((current) =>
                                  active ? current.filter((id) => id !== modifier.id) : [...current, modifier.id],
                                )
                              }
                              className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#4a297e] text-white" : "bg-[#f4eff8] text-[#5a4f6f]"}`}
                            >
                              {modifier.name} {modifier.priceDelta ? `(+₺${modifier.priceDelta})` : ""}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 grid flex-1 grid-cols-2 gap-3 overflow-auto md:grid-cols-3 xl:grid-cols-4">
                        {visibleMenuProducts.map((product) => (
                          <button
                            key={`card-${product.id}`}
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setCart((current) => [
                                ...current,
                                {
                                  productId: product.id,
                                  name: product.name,
                                  qty: 1,
                                  unitPrice: product.price,
                                  totalPrice: product.price,
                                  modifiers: [],
                                  note: "",
                                },
                              ]);
                            }}
                            className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#ff416c] hover:bg-[#fff5f8]"
                          >
                            <div className="h-20 rounded-xl bg-gradient-to-br from-[#ffe5ef] to-[#f3eefe]" />
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{product.category}</p>
                            <p className="mt-3 font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 text-sm font-semibold text-[#ff416c]">₺{product.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-col rounded-[24px] border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-500">Not ve Gonder</p>
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-900">{form.customer}</p>
                        <p className="text-xs text-slate-500">{form.address}</p>
                        <select value={selectedMessageId ?? ""} onChange={(event) => setSelectedMessageId(event.target.value ? Number(event.target.value) : null)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none">
                          <option value="">Hazir mesaj sec</option>
                          {quickMessages.map((message) => (
                            <option key={message.id} value={message.id}>{message.title}</option>
                          ))}
                        </select>
                        <textarea value={lineNote} onChange={(event) => setLineNote(event.target.value)} rows={4} placeholder="Varsa not ekleyin" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                        <select value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none">
                          {["Telefon", "Getir", "Trendyol", "Web"].map((channel) => (
                            <option key={channel} value={channel}>{channel}</option>
                          ))}
                        </select>
                        <button onClick={addLineToCart} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Secili Urunu Ekle</button>
                      </div>
                      <div className="mt-auto space-y-3 pt-4">
                        <button onClick={() => setCreateStep("address")} className="w-full rounded-2xl border-2 border-[#ff416c] px-4 py-3 text-sm font-semibold text-[#ff416c]">
                          Geri
                        </button>
                        <button
                          onClick={() => void handleCreate()}
                          disabled={saving || !canManageDelivery || !cart.length || !form.customer.trim() || !form.address.trim()}
                          className="w-full rounded-2xl bg-[#4660d9] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Gonder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      }
      rightPanel={
        <div className="flex h-full flex-col px-4 py-5">
          <p className="mb-4 text-right text-xs uppercase tracking-[0.34em] text-white/60">Paket Ozet</p>
          <div className="rounded-[18px] bg-white/10 p-4 text-sm text-white/85">
            <div className="flex justify-between">
              <span>Acik Siparis</span>
              <span>{incoming + courierAssigned}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Yolda</span>
              <span>{outgoing}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Tamamlanan</span>
              <span>{completed}</span>
            </div>
            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Aktif Tutar</span>
              <span>₺{activeTotalAmount.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
