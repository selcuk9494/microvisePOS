"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PosScreen } from "@/components/pos-screen";
import { useSession } from "@/hooks/use-session";
import { menuProducts, type MenuProduct, type PaymentTerminal, type QuickMessage } from "@/lib/pos-data";
import type { StoredOrder } from "@/lib/store";

type CartItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
  note?: string;
};

const quickSaleTable = "HIZLI SATIS";

export function QuickSalePage() {
  const { user } = useSession();
  const [productList, setProductList] = useState<MenuProduct[]>(menuProducts);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Hepsi");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [barcodeDraft, setBarcodeDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isIngenicoProcessing, setIsIngenicoProcessing] = useState(false);
  const [isReceiptCancelling, setIsReceiptCancelling] = useState(false);
  const [showReceiptCancelButton, setShowReceiptCancelButton] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catalogResponse, ordersResponse] = await Promise.all([fetch("/api/catalog"), fetch("/api/orders")]);
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
        const orderData = (await ordersResponse.json()) as StoredOrder[];

        setProductList(catalogData.products?.length ? catalogData.products : menuProducts);
        setQuickMessages(catalogData.quickMessages ?? []);
        setTerminals(catalogData.terminals ?? []);
        setServiceChargeEnabled(catalogData.orderSettings?.serviceCharge?.enabled ?? false);
        setServiceChargeRate(catalogData.orderSettings?.serviceCharge?.rate ?? 10);
        setOrders(orderData);
      } catch {
        setFeedback("Hizli satis verileri yuklenemedi.");
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const categories = useMemo(
    () => ["Hepsi", ...new Set(productList.map((product) => product.category))],
    [productList],
  );

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "Hepsi") {
      return productList;
    }

    return productList.filter((product) => product.category === selectedCategory);
  }, [productList, selectedCategory]);

  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const service = serviceChargeEnabled ? Math.round(subtotal * (serviceChargeRate / 100)) : 0;
  const total = subtotal + service;
  const recentSales = orders
    .filter((order) => order.table === quickSaleTable)
    .slice(0, 8);
  const canCollectPayment = user?.role === "Yonetici" || user?.role === "Kasiyer";

  const finalizeOrderWithRetry = async (orderId: string, payment: "nakit" | "kart") => {
    const payload = JSON.stringify({
      status: "odendi",
      payment,
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (response.ok) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }

    return false;
  };

  const refreshOrders = async () => {
    const response = await fetch("/api/orders");
    const data = (await response.json()) as StoredOrder[];
    setOrders(data);
    return data;
  };

  const addProduct = (product: MenuProduct) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          qty: 1,
          price: product.price,
          note: "",
        },
      ];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (id: number) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const applyNote = (message: string) => {
    setCart((current) => {
      if (!current.length) {
        return current;
      }

      const last = current[current.length - 1];
      const note = [last.note, message].filter(Boolean).join(" / ");

      return [...current.slice(0, -1), { ...last, note }];
    });
  };

  const applyDraftNote = () => {
    if (!noteDraft.trim()) {
      return;
    }

    applyNote(noteDraft.trim());
    setNoteDraft("");
  };

  const addProductByBarcode = () => {
    const code = barcodeDraft.trim();
    if (!code) {
      return;
    }

    const normalized = code.toLowerCase();
    const matchedProduct = productList.find((product) => {
      const sku = product.sku?.trim().toLowerCase() ?? "";
      return (
        (sku.length > 0 && sku === normalized) ||
        String(product.id) === code ||
        product.name.toLowerCase() === normalized
      );
    });

    if (!matchedProduct) {
      setFeedback(`Barkod bulunamadi: ${code}`);
      return;
    }

    if (matchedProduct.active === false) {
      setFeedback(`${matchedProduct.name} satisa kapali.`);
      return;
    }

    addProduct(matchedProduct);
    setFeedback(`${matchedProduct.name} barkod ile eklendi.`);
    setBarcodeDraft("");
  };

  const handlePayment = async (payment: "nakit" | "kart") => {
    if (isIngenicoProcessing) {
      return;
    }

    if (!cart.length) {
      setFeedback("Satis icin sepete urun ekleyin.");
      return;
    }

    setIsIngenicoProcessing(true);
    setShowReceiptCancelButton(false);
    setActivePaymentId(null);
    setFeedback("");

    try {
      let workingOrder = orders.find((item) => item.id === activeOrderId) ?? null;
      if (!workingOrder) {
        const createResponse = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: quickSaleTable,
            items: cart.map((item) => ({
              id: item.id,
              name: item.name,
              qty: item.qty,
              price: item.price,
              note: item.note,
            })),
            sendToKitchen: false,
          }),
        });

        const createData = (await createResponse.json()) as {
          message?: string;
          order?: StoredOrder;
        };

        if (!createResponse.ok || !createData.order) {
          setFeedback(createData.message ?? "Hizli satis fis olusturulamadi.");
          return;
        }

        workingOrder = createData.order;
        setActiveOrderId(createData.order.id);
      }

      const paymentResponse = await fetch("/api/payments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: workingOrder.id,
          amount: workingOrder.total,
          terminalId: terminals[0]?.id,
          method: payment,
          paymentName: `Hizli Satis ${workingOrder.id}`,
          paymentInfo: "Ayakta satis",
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

      const finalized = await finalizeOrderWithRetry(workingOrder.id, payment);

      if (!finalized) {
        const latestOrders = await refreshOrders();
        const latestOrder = latestOrders.find((item) => item.id === workingOrder.id);
        if (latestOrder?.status !== "odendi") {
          setFeedback("Satis odeme sonlandirma adiminda hata olustu.");
          return;
        }
      }

      await refreshOrders();
      setCart([]);
      setNoteDraft("");
      setShowPaymentModal(false);
      setFeedback(`Hizli satis ${payment} ile tamamlandi. Fis no: ${workingOrder.id}`);
      setActiveOrderId(null);
    } catch {
      setFeedback("Hizli satis sirasinda baglanti hatasi olustu.");
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
      setActiveOrderId(null);
    } catch {
      setFeedback("Yarim kalan fis iptal edilemedi.");
    } finally {
      setIsReceiptCancelling(false);
    }
  };

  const resetQuickSale = () => {
    setCart([]);
    setNoteDraft("");
    setActiveOrderId(null);
    setFeedback("Hizli satis ekrani sifirlandi.");
  };

  return (
    <>
    <PosScreen
      section="Hizli Satis"
      backHref="/masa-yonetimi"
      leftTools={[
        {
          label: "Yeni",
          short: "NW",
          onClick: resetQuickSale,
        },
        {
          label: "Barkod",
          short: "BC",
          onClick: () => barcodeInputRef.current?.focus(),
        },
        {
          label: "Not",
          short: "NT",
          onClick: applyDraftNote,
        },
        {
          label: "Kart",
          short: "CRD",
          roles: ["Yonetici", "Kasiyer"],
          onClick: () => setShowPaymentModal(true),
        },
        {
          label: "Nakit",
          short: "CSH",
          roles: ["Yonetici", "Kasiyer"],
          onClick: () => setShowPaymentModal(true),
        },
      ]}
      leftPanel={
        <div className="h-full overflow-auto px-4 py-5">
          <div className="rounded-[22px] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Barkod ile Satis</p>
            <div className="mt-3 flex gap-2">
              <input
                ref={barcodeInputRef}
                value={barcodeDraft}
                onChange={(event) => setBarcodeDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addProductByBarcode();
                  }
                }}
                placeholder="Barkod / SKU okut"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
              />
              <button
                onClick={addProductByBarcode}
                className="rounded-xl bg-[#4a247d] px-3 py-2 text-xs font-semibold text-white"
              >
                Ekle
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Anlik Sepet</p>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.qty}x {item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.note || "Not yok"}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-rose-600">
                      Sil
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-slate-700">-</button>
                    <button onClick={() => updateQuantity(item.id, 1)} className="rounded-lg bg-white px-2 py-1 text-sm font-semibold text-slate-700">+</button>
                    <span className="ml-auto text-sm font-semibold text-[#ef3c76]">₺{(item.qty * item.price).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              ))}
              {!cart.length ? <p className="text-sm text-slate-500">Sepette urun yok.</p> : null}
            </div>
          </div>

          <div className="mt-4 rounded-[22px] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Fis Ozeti</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Servis</span>
                <span>₺{service.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                <span>Toplam</span>
                <span>₺{total.toLocaleString("tr-TR")}</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={!canCollectPayment}
                className="w-full rounded-xl bg-[#2bcbb4] px-4 py-3 text-sm font-semibold text-[#10242a] disabled:opacity-60"
              >
                Odeme Al
              </button>
              <button
                onClick={resetQuickSale}
                disabled={isIngenicoProcessing}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Vazgec
              </button>
            </div>
          </div>
        </div>
      }
      mainPanel={
        <div className="h-full overflow-auto px-5 py-5">
          {feedback ? (
            <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {feedback}
            </div>
          ) : null}
          <div className="mb-5 flex items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-[#7b718b]">
              <span>KATEGORILER</span>
              <span>{">"}</span>
              <span className="font-semibold text-[#564b68]">{selectedCategory.toUpperCase()}</span>
            </div>
            <div className="rounded-full bg-[#4a247d] px-4 py-2 text-sm font-semibold text-white">ARA</div>
          </div>

          <div className="mb-5 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedCategory === category ? "bg-[#4a247d] text-white" : "bg-white text-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  if (product.active === false) {
                    return;
                  }
                  addProduct(product);
                }}
                className={`relative rounded-[22px] bg-white p-4 text-left shadow-sm transition ${
                  product.active === false ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="h-28 rounded-[18px] bg-gradient-to-br from-[#ffe5ef] to-[#efe8fb]" />
                <p className="mt-4 text-lg font-semibold text-slate-900">{product.name}</p>
                <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-[#ef3c76]">₺{product.price}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {product.active === false ? "Kapali" : "Ekle"}
                  </span>
                </div>
                {product.active === false ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[22px] bg-[#1a1330]/55 text-center text-sm font-semibold text-white">
                    Satisa Kapali
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      }
      rightPanel={
        <div className="flex h-full flex-col px-4 py-5">
          <div className="rounded-[20px] bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Hazir Mesajlar</p>
            <div className="mt-4 space-y-2">
              {quickMessages.slice(0, 8).map((message) => (
                <button
                  key={message.id}
                  onClick={() => applyNote(message.message)}
                  className="w-full rounded-xl bg-white/10 px-3 py-2 text-left text-sm text-white transition hover:bg-white/20"
                >
                  {message.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[20px] bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Not Ekle</p>
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={4}
              placeholder="Secili urun notu"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/50"
            />
            <button onClick={applyDraftNote} className="mt-3 w-full rounded-xl bg-white px-3 py-3 text-sm font-semibold text-[#381768]">
              Nota Ekle
            </button>
          </div>

          <div className="mt-4 rounded-[20px] bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Son Hizli Satislar</p>
            <div className="mt-4 space-y-3">
              {recentSales.map((order) => (
                <div key={order.id} className="rounded-xl bg-white/10 px-3 py-3 text-sm text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{order.id}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">{order.payment}</span>
                  </div>
                  <p className="mt-1 text-white/70">₺{order.total.toLocaleString("tr-TR")}</p>
                </div>
              ))}
              {!recentSales.length ? <p className="text-sm text-white/70">Kayit yok.</p> : null}
            </div>
          </div>

          <div className="mt-auto rounded-[20px] bg-white/10 p-4 text-sm text-white/80">
            <p className="font-semibold text-white">Terminal</p>
            <p className="mt-2">{terminals[0]?.name ?? "Aktif terminal yok"}</p>
          </div>
        </div>
      }
    />
    {showPaymentModal ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12062a]/70 px-4">
        <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#8d839d]">Odeme Al</p>
              <h3 className="mt-1 text-2xl font-bold text-[#4f465f]">Hizli Satis</h3>
            </div>
            <button onClick={handleClosePaymentModal} className="text-[#8d839d]">
              Vazgec
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
              <span>₺{total.toLocaleString("tr-TR")}</span>
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
    </>
  );
}
