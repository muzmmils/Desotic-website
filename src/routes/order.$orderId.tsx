import { useState, useEffect, useTransition } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Utensils,
  MapPin,
  CreditCard,
  MessageCircle,
  Sparkles,
  ChevronRight,
  RotateCw,
  FastForward,
  ShoppingBag,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  getOrderDetails,
  advanceOrderStatus,
  type StoredOrder,
  type OrderStatus,
} from "@/lib/checkout";

export const Route = createFileRoute("/order/$orderId")({
  head: ({ params }) => {
    const title = `Order #${params.orderId} Tracking — Infinite Healthy Yumm`;
    const description = `Live tracking for order #${params.orderId} from Infinite Healthy Yumm, Moshi, Pune. Realtime kitchen preparation and delivery updates.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${BASE_URL}/order/${params.orderId}` },
        { name: "robots", content: "noindex" },
      ],
      links: [{ rel: "canonical", href: `${BASE_URL}/order/${params.orderId}` }],
    };
  },
  component: OrderTrackingPage,
});

interface StepperStage {
  key: OrderStatus;
  label: string;
  sub: string;
  icon: typeof Clock;
}

const STAGES: StepperStage[] = [
  {
    key: "pending",
    label: "Order Received",
    sub: "Kitchen queued & checking ingredients",
    icon: Clock,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    sub: "Order scheduled & chef allocated",
    icon: CheckCircle2,
  },
  {
    key: "preparing",
    label: "Preparing Fresh",
    sub: "Cooking with zero seed oil & fresh organic greens",
    icon: Utensils,
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    sub: "Delivery executive en route with insulated hot bag",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    sub: "Freshly delivered at your doorstep. Bon appétit!",
    icon: Package,
  },
];

function getStageIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function OrderTrackingPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [, startTransition] = useTransition();

  const supabase = getSupabaseBrowserClient();

  // Initial fetch
  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      setLoading(true);
      const data = await getOrderDetails(orderId);
      if (isMounted) {
        setOrder(data);
        setLoading(false);
      }
    }
    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Supabase Realtime Channel Subscription
  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as unknown as Partial<StoredOrder>;
            setOrder((curr) => (curr ? { ...curr, ...updated } : null));
          }
        },
      )
      .subscribe();

    // Also listen to local events
    const handleLocalUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ orderId?: string }>;
      if (customEvt.detail?.orderId === order.id || !customEvt.detail?.orderId) {
        getOrderDetails(order.id).then((refreshed) => {
          if (refreshed) setOrder(refreshed);
        });
      }
    };
    window.addEventListener("ihy-order-update", handleLocalUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("ihy-order-update", handleLocalUpdate);
    };
  }, [order?.id, supabase]);

  // Simulation handler: Advance order status
  const handleAdvanceStatus = async (target?: OrderStatus) => {
    if (!order) return;
    setAdvancing(true);
    try {
      const next = await advanceOrderStatus(order.id, target);
      startTransition(() => {
        setOrder((curr) => (curr ? { ...curr, status: next } : null));
      });
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-muted-foreground">
          Locating order details & connecting live updates...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-background py-16 px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mb-5">
            <Package className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Order Not Found</h1>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            We couldn't locate an order with ID “{orderId}”. It may have been placed under another
            account or session.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/orders"
              className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              View Order History
            </Link>
            <Link
              to="/menu"
              className="w-full sm:w-auto rounded-xl border border-border px-6 py-2.5 text-xs font-bold text-foreground hover:bg-surface"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStageIndex = getStageIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const formattedPlacedTime = new Date(order.created_at).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

  const slotLabels: Record<string, string> = {
    morning: "🌅 Morning (7:00 – 9:30 AM)",
    lunch: "☀️ Lunch (12:00 – 2:30 PM)",
    dinner: "🌙 Dinner (7:00 – 9:30 PM)",
    afternoon: "☀️ Lunch (12:00 – 2:30 PM)",
    evening: "🌙 Dinner (7:00 – 9:30 PM)",
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Infinite Healthy Yumm team! Inquiring about my Order #${order.order_number} (${order.status}).`,
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link to="/orders" className="hover:text-primary transition-colors">
              My Orders
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">{order.order_number}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              All Orders <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Order Header Banner */}
        <div className="mb-8 rounded-3xl border border-border/80 bg-gradient-to-r from-surface via-card to-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-foreground">{order.order_number}</span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${
                    order.status === "delivered"
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      : order.status === "cancelled"
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-primary/20 text-primary border border-primary/30"
                  }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Placed on {formattedPlacedTime} • {order.items.length}{" "}
                {order.items.length === 1 ? "dish" : "dishes"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Kitchen</span>
              </a>
              <button
                type="button"
                onClick={() => getOrderDetails(order.id).then((o) => o && setOrder(o))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface transition-all cursor-pointer"
                title="Refresh tracking data"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5-STAGE VISUAL TRACKING STEPPER */}
        <section className="mb-8 rounded-3xl border border-border/80 bg-surface/80 p-6 sm:p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Live Order Progress
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Realtime updates synchronized with Moshi Kitchen dispatch desk.
              </p>
            </div>

            {order.status === "delivered" ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" /> Order Complete
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Active Delivery
              </div>
            )}
          </div>

          {/* Stepper container */}
          <div className="relative">
            {/* Desktop Stepper Bar */}
            <div className="hidden md:block">
              {/* Connecting line background */}
              <div className="absolute top-6 left-12 right-12 h-1 bg-border/60 -z-0" />
              {/* Connecting line progress */}
              <div
                className="absolute top-6 left-12 h-1 bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 -z-0"
                style={{
                  width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100 * 0.85)}%`,
                }}
              />

              <div className="grid grid-cols-5 gap-2 relative z-10">
                {STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isDone = !isCancelled && idx < currentStageIndex;
                  const isCurrent = !isCancelled && idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center px-2">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shadow-md ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-emerald-500/25"
                            : isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/25 shadow-primary/30 scale-105 animate-pulse"
                              : "border border-border/80 bg-background text-muted-foreground/60"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                        ) : (
                          <Icon className="h-5 w-5 stroke-[2]" />
                        )}
                      </div>

                      <span
                        className={`mt-3 text-xs font-extrabold ${
                          isCurrent
                            ? "text-primary"
                            : isDone
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="mt-1 text-[10px] text-muted-foreground line-clamp-2">
                        {stage.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="md:hidden space-y-6">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isDone = !isCancelled && idx < currentStageIndex;
                const isCurrent = !isCancelled && idx === currentStageIndex;

                return (
                  <div key={stage.key} className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/25 animate-pulse"
                            : "border border-border bg-background text-muted-foreground/60"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black ${
                            isCurrent
                              ? "text-primary"
                              : isDone
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stage.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="mt-10 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Interactive Realtime Test Simulation</span>
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                    Dev Demo
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Advance order status through the 5 stages to verify live UI stepper advancement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={advancing}
                  onClick={() => handleAdvanceStatus()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  <FastForward className="h-3.5 w-3.5" />
                  <span>{advancing ? "Advancing..." : "Advance Next Status"}</span>
                </button>
              </div>
            </div>

            {/* Direct Status Jump Buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-primary/20 pt-3">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleAdvanceStatus(s.key)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                    order.status === s.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/80 text-foreground hover:bg-surface border border-border/80"
                  }`}
                >
                  Set: {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* DETAILS GRID: Delivery Details & Receipt */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Delivery Address & Slot (6 Cols) */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Recipient:</span>
                  <p className="font-bold text-foreground">{order.delivery_address.fullName}</p>
                  <p className="text-muted-foreground">+91 {order.delivery_address.phone}</p>
                </div>

                <div className="border-t border-border/40 pt-2.5">
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium text-foreground">{order.delivery_address.line1}</p>
                  {order.delivery_address.line2 && (
                    <p className="text-muted-foreground">{order.delivery_address.line2}</p>
                  )}
                  {order.delivery_address.landmark && (
                    <p className="text-muted-foreground">
                      Landmark: {order.delivery_address.landmark}
                    </p>
                  )}
                  <p className="font-bold text-foreground">
                    {order.delivery_address.city} — {order.delivery_address.pincode}
                  </p>
                </div>

                <div className="border-t border-border/40 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground">Scheduled Window:</span>
                    <p className="font-bold text-foreground">
                      {slotLabels[order.delivery_slot] || order.delivery_slot}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Delivery Date:</span>
                    <p className="font-bold text-foreground">{order.delivery_date}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="border-t border-border/40 pt-2.5">
                    <span className="text-muted-foreground">Delivery Notes:</span>
                    <p className="italic text-foreground">“{order.notes}”</p>
                  </div>
                )}
              </div>
            </div>

            {/* Kitchen & Dispatch Guarantee */}
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card to-surface p-5 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Utensils className="h-4 w-4 text-emerald-500" />
                <span>Infinite Healthy Yumm Quality Promise</span>
              </div>
              <p>
                Cooked fresh at our Moshi facility using cold-pressed oils and high-grade organic
                produce. Delivered in reusable insulated temperature bags to retain peak freshness.
              </p>
            </div>
          </div>

          {/* RIGHT: Receipt Line Items Breakdown (6 Cols) */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" /> Itemized Bill Receipt
              </h3>

              <div className="divide-y divide-border/40 mb-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">
                        {item.quantity} × {item.item_name}
                      </span>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {Object.entries(item.customizations)
                            .filter(([, v]) => Boolean(v))
                            .map(([k, v]) => (typeof v === "object" ? "" : `${k}: ${String(v)}`))
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-foreground">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">₹{order.subtotal}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount Applied</span>
                    <span className="font-bold">-₹{order.discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-foreground">
                    {order.delivery_fee === 0 ? "FREE" : `₹${order.delivery_fee}`}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>GST (5% Prepared Food Tax)</span>
                  <span className="font-bold text-foreground">₹{order.tax}</span>
                </div>

                <div className="flex items-baseline justify-between border-t border-border/80 pt-3 text-sm font-black text-foreground">
                  <span>Total Paid / Due</span>
                  <span className="text-xl text-primary font-black">₹{order.total}</span>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Payment Method:
                  </span>
                  <span className="font-bold uppercase text-foreground">
                    {order.payment_provider} ({order.payment_status})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
