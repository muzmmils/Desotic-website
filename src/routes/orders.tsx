import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Truck,
  Utensils,
  MapPin,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrders, type StoredOrder, type OrderStatus } from "@/lib/checkout";
import { useCartStore, type SelectedCustomizations } from "@/stores/cartStore";

const TITLE = "My Orders — Infinite Healthy Yumm";
const DESCRIPTION =
  "View your past and active healthy meal orders from Infinite Healthy Yumm, Moshi, Pune. Reorder your favorite nutritious bowls with one click.";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${BASE_URL}/orders` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/orders` }],
  }),
  component: CustomerOrdersPage,
});

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </span>
      );
    case "out_for_delivery":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-400">
          <Truck className="h-3 w-3" /> Out for Delivery
        </span>
      );
    case "preparing":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-500">
          <Utensils className="h-3 w-3" /> Preparing Fresh
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-400">
          <CheckCircle2 className="h-3 w-3" /> Confirmed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/30 px-2.5 py-0.5 text-xs font-bold text-destructive">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-xs font-bold text-primary">
          <Clock className="h-3 w-3" /> Order Received
        </span>
      );
  }
}

function CustomerOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderedId, setReorderedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await getUserOrders(user?.id);
      if (isMounted) {
        setOrders(data);
        setLoading(false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Handle re-ordering items
  const handleReorder = (order: StoredOrder) => {
    for (const it of order.items) {
      addItem({
        menuItemId: it.menu_item_id,
        name: it.item_name,
        slug: it.item_name.toLowerCase().replace(/\s+/g, "-"),
        price: it.unit_price,
        basePrice: it.unit_price,
        quantity: it.quantity,
        customizations: it.customizations as SelectedCustomizations,
      });
    }

    setReorderedId(order.id);
    setTimeout(() => {
      navigate({ to: "/cart" });
    }, 400);
  };

  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(o.status),
  );

  const pastOrders = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              My Orders & Deliveries
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Track your live meal preparations and reorder your favorite nutrition bowls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>Browse Menu</span>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-border/80 bg-surface/80 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No Orders Yet</h2>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
              You haven't placed any orders yet. Discover our fresh high-protein bowls, keto salads,
              and organic smoothies freshly prepared in Moshi.
            </p>
            <div className="mt-6">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <span>Explore Menu Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <h2 className="text-base font-black text-foreground">
                    Active Deliveries ({activeOrders.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-3xl border border-primary/30 bg-gradient-to-r from-surface via-card to-surface p-5 sm:p-6 shadow-sm ring-1 ring-primary/10"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-foreground">
                              {order.order_number}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            • Slot: {order.delivery_slot}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to="/order/$orderId"
                            params={{ orderId: order.order_number || order.id }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                          >
                            <span>Track Live</span>
                            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                          </Link>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <p key={item.id} className="text-xs font-bold text-foreground">
                              {item.quantity} × {item.item_name}
                            </p>
                          ))}
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> Delivering to:{" "}
                            {order.delivery_address.line1}, {order.delivery_address.city}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground">Total Paid</span>
                          <p className="text-lg font-black text-primary">₹{order.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past Orders Section */}
            {pastOrders.length > 0 && (
              <section>
                <h2 className="mb-4 text-base font-black text-foreground">
                  Past Orders ({pastOrders.length})
                </h2>

                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm hover:border-border transition-colors"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-foreground">
                              {order.order_number}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Delivered on{" "}
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>
                              {reorderedId === order.id ? "Adding to Cart..." : "Reorder Dishes"}
                            </span>
                          </button>
                          <Link
                            to="/order/$orderId"
                            params={{ orderId: order.order_number || order.id }}
                            className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface transition-all"
                          >
                            <span>Receipt</span>
                          </Link>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          {order.items.map((item) => (
                            <p key={item.id} className="text-xs text-foreground">
                              <span className="font-bold">{item.quantity}×</span> {item.item_name}
                            </p>
                          ))}
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground">Total</span>
                          <p className="text-base font-bold text-foreground">₹{order.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
