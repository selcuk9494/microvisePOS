"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PosScreen } from "@/components/pos-screen";
import { useSession } from "@/hooks/use-session";
import { menuCategories, menuProducts, type MenuProduct, type PaymentTerminal, type QuickMessage, type TableItem } from "@/lib/pos-data";
import type { StoredOrder } from "@/lib/store";

type CartItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
  note?: string;
};

export function OrderPage() {
  const router = useRouter();
  const { user } = useSession();
  const [tableList, setTableList] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [productList, setProductList] = useState<MenuProduct[]>(menuProducts);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<(typeof menuCategories)[number]>("Hepsi");
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { id: 3, name: "Special Burger", qty: 2, price: 390, note: "Bir tanesi acisiz" },
    { id: 7, name: "Cold Brew", qty: 2, price: 120 },
  ]);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState<"idle" | "draft" | "kitchen">("idle");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [selectedMoveTable, setSelectedMoveTable] = useState("");
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);
  const [isIngenicoProcessing, setIsIngenicoProcessing] = useState(false);
  const [isReceiptCancelling, setIsReceiptCancelling] = useState(false);
  const [showReceiptCancelButton, setShowReceiptCancelButton] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tableResponse, orderResponse, catalogResponse] = await Promise.all([
          fetch("/api/tables"),
          fetch("/api/orders"),
          fetch("/api/catalog"),
        ]);
        const tableData = (await tableResponse.json()) as TableItem[];
        const orderData = (await orderResponse.json()) as StoredOrder[];
        const catalogData = (await catalogResponse.json()) as {
          products?: MenuProduct[];
          quickMessages?: QuickMessage[];
          terminals?: PaymentTerminal[];
          orderSettings?: {
            serviceCharge?: {
              enabled: boolean;
              rate: number;
            };
          };
        };

        setTableList(tableData);
        setOrders(orderData);
        setProductList(catalogData.products?.length ? catalogData.products : menuProducts);
        setQuickMessages(catalogData.quickMessages ?? []);
        setTerminals(catalogData.terminals ?? []);
        setServiceChargeEnabled(catalogData.orderSettings?.serviceCharge?.enabled ?? false);
        setServiceChargeRate(catalogData.orderSettings?.serviceCharge?.rate ?? 10);
        setSelectedTable(
          (current) =>
            current ||
            tableData.find((table) => table.state !== "musait")?.name ||
            tableData[0]?.name ||
            "",
        );
      } catch {
        setFeedback("Veriler yuklenemedi.");
      }
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    const tableOrder = orders.find(
      (order) => order.table === selectedTable && order.status !== "odendi",
    );

    if (tableOrder) {
      setCart(
        tableOrder.items.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          note: item.note,
        })),
      );
    }
  }, [orders, selectedTable]);

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "Hepsi") {
      return productList;
    }

    return productList.filter((product) => product.category === selectedCategory);
  }, [productList, selectedCategory]);

  const subtotal = cart.reduce((total, item) => total + item.qty * item.price, 0);
  const service = serviceChargeEnabled ? Math.round(subtotal * (serviceChargeRate / 100)) : 0;
  const grandTotal = subtotal + service;
  const currentOrder = orders.find(
    (order) => order.table === selectedTable && order.status !== "odendi",
  );
  const splitAmount = Math.ceil(grandTotal / splitCount);
  const moveTableOptions = tableList.filter((table) => table.name !== selectedTable);
  const canCollectPayment = user?.role === "Yonetici" || user?.role === "Kasiyer";
  const canManageChecks = user?.role === "Yonetici" || user?.role === "Kasiyer";
  const openMoveModal = () => {
    setSelectedMoveTable(moveTableOptions[0]?.name ?? "");
    setShowMoveModal(true);
  };

  const finalizeOrderWithRetry = async (orderId: string, payment: "nakit" | "kart") => {
    const payload = JSON.stringify({
      status: "odendi",
      payment,
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      if (response.ok) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }

    return false;
  };

  const addProduct = (id: number) => {
    const product = productList.find((item) => item.id === id);

    if (!product) {
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === id);

      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [...current, { id: product.id, name: product.name, qty: 1, price: product.price }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const refreshOrders = async () => {
    const response = await fetch("/api/orders");
    const data = (await response.json()) as StoredOrder[];
    setOrders(data);
    return data;
  };

  const saveOrder = async (sendToKitchen: boolean) => {
    if (!selectedTable || cart.length === 0) {
      setFeedback("Kayit icin masa ve en az bir urun secin.");
      return null;
    }

    setSaving(sendToKitchen ? "kitchen" : "draft");
    setFeedback("");

    try {
      const response = await fetch(currentOrder ? `/api/orders/${currentOrder.id}` : "/api/orders", {
        method: currentOrder ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: selectedTable,
          items: cart,
          sendToKitchen,
          status: sendToKitchen ? "mutfaga-gonderildi" : "acik",
          payment: currentOrder?.payment ?? "bekliyor",
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        order?: StoredOrder;
        tables?: TableItem[];
        id?: string;
        table?: string;
        status?: StoredOrder["status"];
        payment?: StoredOrder["payment"];
        items?: StoredOrder["items"];
        subtotal?: number;
        service?: number;
        total?: number;
      };

      if (!response.ok) {
        setFeedback(data.message ?? "Siparis kaydedilemedi.");
        return null;
      }

      if (data.tables) {
        setTableList(data.tables);
      }
      await refreshOrders();

      const normalizedOrder =
        data.order ??
        (data.id
          ? {
              id: data.id,
              table: data.table ?? selectedTable,
              status: data.status ?? (sendToKitchen ? "mutfaga-gonderildi" : "acik"),
              payment: data.payment ?? "bekliyor",
              items: data.items ?? cart,
              subtotal: data.subtotal ?? subtotal,
              service: data.service ?? service,
              total: data.total ?? grandTotal,
              createdAt: new Date().toISOString(),
            }
          : null);

      setFeedback(
        sendToKitchen
          ? `Siparis mutfaga gonderildi. Fis no: ${normalizedOrder?.id ?? "-"}`
          : `Siparis taslak olarak kaydedildi. Fis no: ${normalizedOrder?.id ?? "-"}`,
      );
      return normalizedOrder;
    } catch {
      setFeedback("Kayit sirasinda baglanti hatasi olustu.");
      return null;
    } finally {
      setSaving("idle");
    }
  };

  const ensureCurrentOrder = async () => {
    if (currentOrder) {
      const response = await fetch(`/api/orders/${currentOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          status: currentOrder.status,
          payment: currentOrder.payment,
        }),
      });

      if (!response.ok) {
        setFeedback("Aktif adisyon guncellenemedi.");
        return null;
      }

      const updated = (await response.json()) as StoredOrder;
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      return updated;
    }

    return saveOrder(false);
  };

  const handlePayment = async (payment: "nakit" | "kart") => {
    if (isIngenicoProcessing) {
      return;
    }

    setIsIngenicoProcessing(true);
    setShowReceiptCancelButton(false);
    setActivePaymentId(null);

    const order = await ensureCurrentOrder();

    if (!order) {
      setIsIngenicoProcessing(false);
      return;
    }

    try {
      const paymentResponse = await fetch("/api/payments/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          terminalId: terminals[0]?.id,
          method: payment,
          paymentName: `Adisyon ${order.id}`,
          paymentInfo: `${selectedTable} masasi`,
        }),
      });
      const paymentData = (await paymentResponse.json()) as {
        ok?: boolean;
        success?: boolean;
        message?: string;
        payment?: { id?: string; status?: string };
        data?: { status?: string };
      };
      const paymentId = paymentData.payment?.id ?? null;
      if (paymentId) {
        setActivePaymentId(paymentId);
      }

      const paymentStatus = (paymentData.payment?.status ?? paymentData.data?.status ?? "").toLowerCase();
      const paymentAccepted = paymentData.ok === true || paymentData.success === true || paymentResponse.ok;

      if (!paymentAccepted || paymentStatus !== "approved") {
        if (payment === "kart") {
          setShowReceiptCancelButton(true);
        }
        setFeedback(
          paymentData.message ??
            (payment === "kart"
              ? "Kart odemesi terminalden onaylanmadi."
              : "Nakit odemesi Ingenico tarafinda tamamlanmadi."),
        );
        return;
      }

      const finalized = await finalizeOrderWithRetry(order.id, payment);

      if (!finalized) {
        const latestOrders = await refreshOrders();
        const latestOrder = latestOrders.find((item) => item.id === order.id);
        if (latestOrder?.status !== "odendi") {
          setFeedback("Odeme tamamlarken bir hata olustu.");
          return;
        }
      }

      const tableResponse = await fetch("/api/tables");
      const nextTables = (await tableResponse.json()) as TableItem[];
      setTableList(nextTables);
      await refreshOrders();
      setCart([]);
      setShowPaymentModal(false);
      setFeedback(`Odeme ${payment} ile alindi. Adisyon kapatildi.`);
      router.push("/masa-yonetimi");
    } catch {
      setFeedback("Ingenico odeme istegi sirasinda baglanti hatasi olustu.");
    } finally {
      setIsIngenicoProcessing(false);
      setActivePaymentId(null);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleCancelHalfReceipt = async () => {
    if (isReceiptCancelling) {
      return;
    }

    setIsReceiptCancelling(true);
    setFeedback("Yarim kalan fis iptal ediliyor...");
    try {
      const cancelActiveResponse = await fetch("/api/payments/cancel-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terminalId: terminals[0]?.id }),
      });
      if (activePaymentId) {
        await fetch(`/api/payments/${activePaymentId}/cancel`, {
          method: "POST",
        });
      }
      if (!cancelActiveResponse.ok) {
        setFeedback("Yarim kalan fis iptal edilemedi.");
        return;
      }
      setShowReceiptCancelButton(false);
      setFeedback("Yarim kalan fis iptal edildi.");
      setShowPaymentModal(false);
      setActivePaymentId(null);
    } catch {
      setFeedback("Yarim kalan fis iptal edilemedi.");
    } finally {
      setIsReceiptCancelling(false);
    }
  };

  const applyQuickMessage = (message: string) => {
    setCart((current) => {
      if (!current.length) {
        return current;
      }

      const last = current[current.length - 1];
      return [
        ...current.slice(0, -1),
        {
          ...last,
          note: last.note ? `${last.note} / ${message}` : message,
        },
      ];
    });
  };

  const handleMoveTable = async () => {
    if (!selectedMoveTable) {
      setFeedback("Tasima icin hedef masa secin.");
      return;
    }

    const order = await ensureCurrentOrder();

    if (!order) {
      return;
    }

    const response = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table: selectedMoveTable,
      }),
    });

    if (!response.ok) {
      setFeedback("Masa tasima basarisiz oldu.");
      return;
    }

    const tableResponse = await fetch("/api/tables");
    const nextTables = (await tableResponse.json()) as TableItem[];
    setTableList(nextTables);
    await refreshOrders();
    setSelectedTable(selectedMoveTable);
    setShowMoveModal(false);
    setFeedback(`Adisyon ${selectedMoveTable} masasına tasindi.`);
  };

  const handleSplitBill = async () => {
    if (!cart.length) {
      setFeedback("Bolmek icin aktif urun bulunmuyor.");
      return;
    }

    setShowSplitModal(false);
    setFeedback(`Hesap ${splitCount} parcaya bolundu. Kisi basi tutar ₺${splitAmount.toLocaleString("tr-TR")}.`);
  };

  return (
    <>
      <PosScreen
        section="Siparis"
        backHref="/masa-yonetimi"
        leftTools={[
          {
            label: "Yeni",
            short: "+",
            roles: ["Yonetici", "Kasiyer", "Garson"],
            onClick: () => {
              setCart([]);
              setFeedback("Yeni adisyon icin satirlar temizlendi.");
            },
          },
          {
            label: "Ikram",
            short: "I",
            roles: ["Yonetici", "Kasiyer", "Garson"],
            onClick: () => setFeedback("Ikram islemi icin urun secip fiyat duzenleyin."),
          },
          {
            label: "Iade",
            short: "R",
            roles: ["Yonetici", "Kasiyer"],
            onClick: () => setFeedback("Iade islemi aktif urunlere uygulanacak sekilde hazirlaniyor."),
          },
          {
            label: "Bol",
            short: "%",
            roles: ["Yonetici", "Kasiyer"],
            onClick: () => setShowSplitModal(true),
          },
          {
            label: "Iskonto",
            short: "T",
            roles: ["Yonetici", "Kasiyer"],
            onClick: () => setFeedback("Iskonto islemi icin secili urunlerde fiyat duzenleyin."),
          },
          {
            label: "Yazdir",
            short: "Y",
            roles: ["Yonetici", "Kasiyer", "Garson"],
            onClick: () => window.print(),
          },
          {
            label: "Iptal",
            short: "X",
            roles: ["Yonetici", "Kasiyer"],
            onClick: () => {
              setCart([]);
              setFeedback("Adisyon satirlari iptal edildi.");
            },
          },
          {
            label: "Tasi",
            short: ">",
            roles: ["Yonetici", "Kasiyer"],
            onClick: openMoveModal,
          },
        ]}
        leftPanel={
          <div className="flex h-full flex-col">
            <div className="border-b border-[#ddd4e5] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#f32774] px-3 py-1 text-xs font-bold text-white">
                    {cart.length}
                  </span>
                  <span className="text-lg font-semibold text-[#e73974]">{selectedTable || "Salon 8"}</span>
                </div>
                <span className="rounded-lg bg-[#f27f4e] px-3 py-2 text-sm font-semibold text-white">
                  {currentOrder?.id ?? "Yeni Adisyon"}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-4 py-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start justify-between border-b border-[#e3dce9] py-3">
                  <div>
                    <p className="text-sm font-bold text-[#f23c76]">{item.qty}x</p>
                    <p className="mt-1 text-lg font-medium text-[#4e4560]">{item.name}</p>
                    {item.note ? (
                      <p className="mt-1 text-xs text-[#8b819b]">{item.note}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#5a516b]">₺{item.qty * item.price}</p>
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-7 w-7 rounded-full bg-[#ede6f5] text-sm font-bold text-[#5a4f6f]"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-7 w-7 rounded-full bg-[#ede6f5] text-sm font-bold text-[#5a4f6f]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ddd4e5] p-4">
              {feedback ? (
                <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {feedback}
                </div>
              ) : null}
              <div className="mb-4 flex items-center justify-between text-4xl font-bold text-[#463d60]">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!canCollectPayment}
                  className="rounded-xl bg-[#5bc17c] px-6 py-3 text-lg text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ODEME AL
                </button>
                <span>₺{grandTotal.toLocaleString("tr-TR")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => void saveOrder(false)}
                  disabled={saving !== "idle"}
                  className="rounded-xl bg-[#e8e1ef] px-4 py-3 text-sm font-semibold text-[#5a4f6f] disabled:opacity-60"
                >
                  {saving === "draft" ? "Kaydediliyor" : "Kaydet"}
                </button>
                <button
                  onClick={() => void saveOrder(true)}
                  disabled={saving !== "idle"}
                  className="rounded-xl bg-[#f32774] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving === "kitchen" ? "Gonderiliyor" : "Mutfaga Gonder"}
                </button>
                <button
                  onClick={() => setShowSplitModal(true)}
                  disabled={!canManageChecks}
                  className="rounded-xl bg-[#ede6f5] px-4 py-3 text-sm font-semibold text-[#5a4f6f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hesap Bol
                </button>
                <button
                  onClick={() => {
                    openMoveModal();
                  }}
                  disabled={!canManageChecks}
                  className="rounded-xl bg-[#ede6f5] px-4 py-3 text-sm font-semibold text-[#5a4f6f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Masa Tasi
                </button>
              </div>
            </div>
          </div>
        }
        mainPanel={
          <div className="h-full px-4 py-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#7d718e]">
                  <span>Menuler</span>
                  <span>{">"}</span>
                  <span className="font-semibold text-[#554969]">{selectedCategory}</span>
                  {currentOrder ? (
                    <span className="rounded-full bg-[#f4edf9] px-3 py-1 text-xs font-semibold text-[#6c5b89]">
                      {currentOrder.status}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tableList.slice(0, 5).map((table) => (
                    <button
                      key={table.name}
                      onClick={() => setSelectedTable(table.name)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        selectedTable === table.name
                          ? "bg-[#ef3c76] text-white"
                          : "bg-white text-[#5a4f6f]"
                      }`}
                    >
                      {table.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-full bg-[#4a297e] px-4 py-2 text-sm font-medium text-white">Ara</div>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product.id)}
                  className="overflow-hidden rounded-[18px] border border-[#ddd4e7] bg-white p-2 text-left shadow-sm transition hover:-translate-y-0.5"
                >
                  <div className="h-28 rounded-[14px] bg-gradient-to-br from-[#b7724d] via-[#f0d4a9] to-[#7f4a34]" />
                  <div className="p-2">
                    <p className="text-base font-semibold text-[#544c64]">{product.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-[#ef3c76]">₺{product.price}</span>
                      <span className="text-xs text-[#8b819b]">{product.prep}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        }
        rightPanel={
          <div className="flex h-full flex-col px-4 py-5">
            <p className="mb-4 text-right text-xs uppercase tracking-[0.34em] text-white/60">Menuler</p>
            <div className="space-y-3">
              {menuCategories.slice(1).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                    selectedCategory === category ? "bg-white text-[#34185c]" : "bg-white/5 text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[18px] bg-white/10 p-4 text-sm text-white/85">
              <p className="font-semibold">Adisyon Ozet</p>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Fis No</span>
                  <span>{currentOrder?.id ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durum</span>
                  <span>{currentOrder?.status ?? "yeni"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Odeme</span>
                  <span>{currentOrder?.payment ?? "bekliyor"}</span>
                </div>
              </div>
            </div>

            {quickMessages.length ? (
              <div className="mt-5 rounded-[18px] bg-white/10 p-4 text-sm text-white/85">
                <p className="font-semibold">Hazir Mesajlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickMessages.slice(0, 6).map((message) => (
                    <button
                      key={message.id}
                      onClick={() => applyQuickMessage(message.message)}
                      className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {message.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        }
      />

      {showPaymentModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12062a]/70 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8d839d]">Odeme Al</p>
                <h3 className="mt-1 text-2xl font-bold text-[#4f465f]">{selectedTable}</h3>
              </div>
              <button onClick={() => void handleClosePaymentModal()} className="text-[#8d839d]">
                Kapat
              </button>
            </div>
            <div className="mt-5 rounded-[18px] bg-[#f7f3fb] p-4">
              <div className="flex items-center justify-between text-sm text-[#6e6480]">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toLocaleString("tr-TR")}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-[#6e6480]">
                <span>Servis</span>
                <span>₺{service.toLocaleString("tr-TR")}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-2xl font-bold text-[#4f465f]">
                <span>Toplam</span>
                <span>₺{grandTotal.toLocaleString("tr-TR")}</span>
              </div>
            </div>
            {isIngenicoProcessing ? (
              <div className="mt-5 rounded-xl border border-[#e3dce9] bg-[#faf7fd] px-4 py-5 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d9cbe9] border-t-[#4a297e]" />
                <p className="mt-3 text-sm font-semibold text-[#4f465f]">Ingenico odemesi tamamlanıyor...</p>
                <p className="mt-1 text-xs text-[#8d839d]">Lutfen bekleyin, islemi yarida kesmeyin.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => void handlePayment("nakit")}
                    className="rounded-xl bg-[#63bf77] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Nakit Tahsil Et
                  </button>
                  <button
                    onClick={() => void handlePayment("kart")}
                    className="rounded-xl bg-[#4a297e] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Kart Tahsil Et{terminals[0] ? ` (${terminals[0].model})` : ""}
                  </button>
                </div>
                {showReceiptCancelButton ? (
                  <button
                    onClick={() => void handleCancelHalfReceipt()}
                    disabled={isReceiptCancelling}
                    className="w-full rounded-xl bg-[#f32774] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isReceiptCancelling ? "Fis Iptal Ediliyor..." : "Fis Iptal"}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {showSplitModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12062a]/70 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8d839d]">Hesap Bolme</p>
                <h3 className="mt-1 text-2xl font-bold text-[#4f465f]">{selectedTable}</h3>
              </div>
              <button onClick={() => setShowSplitModal(false)} className="text-[#8d839d]">
                Kapat
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setSplitCount(count)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    splitCount === count ? "bg-[#f32774] text-white" : "bg-[#f3edf8] text-[#5a4f6f]"
                  }`}
                >
                  {count} Kisi
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-[18px] bg-[#f7f3fb] p-4">
              <div className="flex items-center justify-between text-sm text-[#6e6480]">
                <span>Toplam</span>
                <span>₺{grandTotal.toLocaleString("tr-TR")}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-2xl font-bold text-[#4f465f]">
                <span>Kisi Basi</span>
                <span>₺{splitAmount.toLocaleString("tr-TR")}</span>
              </div>
            </div>
            <button
              onClick={handleSplitBill}
              className="mt-5 w-full rounded-xl bg-[#4a297e] px-4 py-3 text-sm font-semibold text-white"
            >
              Bolunmus Hesabi Hazirla
            </button>
          </div>
        </div>
      ) : null}

      {showMoveModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12062a]/70 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8d839d]">Masa Tasi</p>
                <h3 className="mt-1 text-2xl font-bold text-[#4f465f]">{selectedTable}</h3>
              </div>
              <button onClick={() => setShowMoveModal(false)} className="text-[#8d839d]">
                Kapat
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {moveTableOptions.map((table) => (
                <button
                  key={table.name}
                  onClick={() => setSelectedMoveTable(table.name)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ${
                    selectedMoveTable === table.name ? "bg-[#f32774] text-white" : "bg-[#f3edf8] text-[#5a4f6f]"
                  }`}
                >
                  <span className="font-semibold">{table.name}</span>
                  <span className="text-sm">{table.state}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => void handleMoveTable()}
              className="mt-5 w-full rounded-xl bg-[#63bf77] px-4 py-3 text-sm font-semibold text-white"
            >
              Secili Masaya Tasi
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
