import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
  MapPin,
  Tag,
  Check,
  Sparkles,
  CreditCard,
  Banknote,
  AlertCircle,
  Calendar,
  Utensils,
  Leaf,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore, useCartHydrated } from "@/stores/cartStore";
import { createOrder, verifyPayment, type DeliveryAddress } from "@/lib/checkout";

const TITLE = "Cart & Checkout — Infinite Healthy Yumm";
const DESCRIPTION =
  "Review your healthy meal order, select a Pune delivery slot, and checkout safely from Infinite Healthy Yumm, Moshi.";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${BASE_URL}/cart` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/cart` }],
  }),
  component: CartAndCheckoutPage,
});

interface AddressErrors {
  fullName?: string;
  phone?: string;
  line1?: string;
  pincode?: string;
}

function formatDateOption(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const value = date.toISOString().split("T")[0] ?? "2026-09-12";

  const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });
  const dayMonth = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  let label = dayMonth;
  if (daysFromToday === 0) label = "Today";
  else if (daysFromToday === 1) label = "Tomorrow";

  return { value, label, sub: `${weekday}, ${dayMonth}` };
}

function CartAndCheckoutPage() {
  const isHydrated = useCartHydrated();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();

  // Cart store selectors
  const items = useCartStore((s) => s.items);
  const deliverySlot = useCartStore((s) => s.deliverySlot);
  const deliveryDate = useCartStore((s) => s.deliveryDate);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);

  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setDeliverySlot = useCartStore((s) => s.setDeliverySlot);
  const setDeliveryDate = useCartStore((s) => s.setDeliveryDate);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);

  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscount = useCartStore((s) => s.getDiscount);
  const getDeliveryFee = useCartStore((s) => s.getDeliveryFee);
  const getTax = useCartStore((s) => s.getTax);
  const getTotal = useCartStore((s) => s.getTotal);

  // Address form state
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "Pune",
    pincode: "",
  });
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; success: boolean } | null>(
    null,
  );

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-fill address from Supabase user profile when available
  useEffect(() => {
    if (profile) {
      const rawAddr =
        profile.address && typeof profile.address === "object"
          ? (profile.address as Record<string, unknown>)
          : {};

      const profileName = profile ? (profile["full_name"] as string | undefined) : undefined;
      const profilePhone = profile ? (profile["phone"] as string | undefined) : undefined;
      const metaName = user?.user_metadata
        ? (user.user_metadata["full_name"] as string | undefined)
        : undefined;
      const metaPhone = user?.user_metadata
        ? (user.user_metadata["phone"] as string | undefined)
        : undefined;

      setAddress((prev) => ({
        fullName: prev.fullName || profileName || metaName || "",
        phone: prev.phone || profilePhone || metaPhone || "",
        line1: prev.line1 || (typeof rawAddr["line1"] === "string" ? rawAddr["line1"] : ""),
        line2: prev.line2 || (typeof rawAddr["line2"] === "string" ? rawAddr["line2"] : ""),
        landmark:
          prev.landmark || (typeof rawAddr["landmark"] === "string" ? rawAddr["landmark"] : ""),
        city: "Pune",
        pincode: prev.pincode || (typeof rawAddr["pincode"] === "string" ? rawAddr["pincode"] : ""),
      }));
    }
  }, [profile, user]);

  // Delivery date choices (Today, Tomorrow, +2, +3, +4 days)
  const dateOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i <= 4; i++) {
      options.push(formatDateOption(i));
    }
    return options;
  }, []);

  // Ensure valid initial deliveryDate
  useEffect(() => {
    const firstOption = dateOptions[0];
    if (!deliveryDate && firstOption) {
      setDeliveryDate(firstOption.value);
    }
  }, [deliveryDate, dateOptions, setDeliveryDate]);

  // Calculations
  const subtotal = isHydrated ? getSubtotal() : 0;
  const discount = isHydrated ? getDiscount() : 0;
  const deliveryFee = isHydrated ? getDeliveryFee() : 0;
  const tax = isHydrated ? getTax() : 0;
  const total = isHydrated ? getTotal() : 0;

  // Free delivery threshold is ₹500
  const freeDeliveryThreshold = 500;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  // Handle coupon submission
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponFeedback({
      text: result.message,
      success: result.success,
    });
    if (result.success) {
      setCouponInput("");
    }
  };

  // Address validation
  const validateAddress = (): boolean => {
    const errors: AddressErrors = {};

    if (!address.fullName.trim() || address.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!address.phone.trim()) {
      errors.phone = "Mobile number is required";
    } else if (!phoneRegex.test(address.phone.trim())) {
      errors.phone = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
    }

    if (!address.line1.trim() || address.line1.trim().length < 5) {
      errors.line1 = "Please enter complete house/flat number and street name";
    }

    const pincodeRegex = /^41\d{4}$/;
    if (!address.pincode.trim()) {
      errors.pincode = "Pune pincode is required";
    } else if (!pincodeRegex.test(address.pincode.trim())) {
      errors.pincode =
        "Delivery is currently available for Pune pincodes starting with 41 (e.g. 412105, 411001)";
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      const firstKey = Object.keys(addressErrors)[0] || "address";
      const el = document.getElementById(`field-${firstKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create order in Edge Function or direct DB
      const firstOptVal = dateOptions[0]?.value ?? "2026-09-12";
      const orderParams: any = {
        items,
        deliveryDate: deliveryDate || firstOptVal,
        deliverySlot: deliverySlot || "morning",
        deliveryAddress: address,
        paymentMethod,
      };
      if (orderNotes.trim()) {
        orderParams.notes = orderNotes.trim();
      }
      if (appliedCoupon?.code) {
        orderParams.couponCode = appliedCoupon.code;
      }
      if (user?.id) {
        orderParams.userId = user.id;
      }

      const result = await createOrder(orderParams);

      if (!result.success || !result.orderId) {
        throw new Error("Unable to create order. Please check connection and try again.");
      }

      // 2. If online payment, perform simulation or signature verification
      if (paymentMethod === "online") {
        const verifyPayload: any = {
          orderId: result.orderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          paymentMethod: "online",
        };
        if (result.razorpayOrderId) {
          verifyPayload.razorpayOrderId = result.razorpayOrderId;
        }
        await verifyPayment(verifyPayload);
      }

      // 3. Clear cart
      clearCart();

      // 4. Redirect to tracking page
      navigate({
        to: "/order/$orderId",
        params: { orderId: result.orderNumber || result.orderId },
      });
    } catch (err: unknown) {
      console.error("Failed to place order:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong while processing your order.",
      );
      setIsSubmitting(false);
    }
  };

  // Empty Cart State
  if (isHydrated && items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-background py-16 px-4">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 shadow-inner">
            <ShoppingBag className="h-12 w-12 stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Your Cart is Empty
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Good health starts on your plate. Browse our chef-crafted bowls, high-protein meals, and
            cold-pressed smoothies delivered fresh in Moshi & Pune.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Utensils className="h-4 w-4" />
              Explore Healthy Menu
            </Link>
            <Link
              to="/subscriptions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface px-6 py-3.5 text-sm font-bold text-foreground hover:bg-background transition-all"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Weekly Meal Plans
            </Link>
          </div>

          <div className="mt-12 rounded-2xl border border-border/60 bg-surface/50 p-6 text-left">
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground mb-3">
              <Leaf className="h-4 w-4 text-emerald-500" />
              <span>Why Infinite Healthy Yumm?</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Zero refined sugars, seed oils, or artificial preservatives
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Customizable macros, dressings, and superfood add-ons
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                FREE delivery on orders over ₹500 in PCMC & Pune
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <Link to="/menu" className="hover:text-primary transition-colors">
                Menu
              </Link>
              <span>/</span>
              <span className="text-foreground">Checkout</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Cart & Checkout
            </h1>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            + Add more dishes
          </Link>
        </div>

        {/* Free Delivery Banner Progress Bar */}
        <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-surface p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2 text-foreground">
              <Truck className="h-4 w-4 text-primary" />
              {amountToFreeDelivery > 0 ? (
                <span>
                  Add <span className="font-extrabold text-primary">₹{amountToFreeDelivery}</span>{" "}
                  more for <span className="text-emerald-500 uppercase">FREE delivery</span>!
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <Check className="h-4 w-4 stroke-[3]" />
                  Congratulations! You unlocked FREE delivery across Pune!
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Threshold: ₹500</span>
          </div>

          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Cart Items + Address + Slot Picker (8 Cols) */}
          <div className="space-y-8 lg:col-span-7">
            {/* 1. Line Items Review */}
            <section className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
                <h2 className="text-base font-black text-foreground sm:text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Order Review ({items.length} {items.length === 1 ? "item" : "items"})
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-border/40">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl">
                            🥗
                          </div>
                        )}
                      </div>

                      {/* Info & Customization Chips */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-xs font-black text-primary mt-0.5">₹{item.price}</p>

                        {/* Customization Details Chips */}
                        {item.customizations && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.customizations.dressing && (
                              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                Dressing: {item.customizations.dressing}
                              </span>
                            )}
                            {item.customizations.spiceLevel && (
                              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                                Spice: {item.customizations.spiceLevel}
                              </span>
                            )}
                            {item.customizations.milkBase && (
                              <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                                Milk: {item.customizations.milkBase}
                              </span>
                            )}
                            {item.customizations.grainBase && (
                              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                                Grain: {item.customizations.grainBase}
                              </span>
                            )}
                            {item.customizations.addons?.map((addon) => (
                              <span
                                key={addon.id}
                                className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-500"
                              >
                                + {addon.name} (₹{addon.price})
                              </span>
                            ))}
                            {item.customizations.options &&
                              Object.entries(item.customizations.options).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="inline-flex items-center rounded-md bg-surface border border-border/80 px-2 py-0.5 text-[10px] font-medium text-foreground"
                                >
                                  {k}: {v}
                                </span>
                              ))}
                            {item.customizations.notes && (
                              <span className="w-full text-[10px] italic text-muted-foreground mt-0.5">
                                Note: “{item.customizations.notes}”
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quantity Stepper */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 20}
                              className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-foreground">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Delivery Address Form */}
            <section className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm">
              <div className="border-b border-border/60 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-foreground sm:text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Pune Delivery Address
                  </h2>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Sign in to auto-fill
                    </Link>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deliveries dispatched from Moshi Central Kitchen across Pune & PCMC.
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name & Mobile */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="field-fullName"
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="field-fullName"
                      type="text"
                      value={address.fullName}
                      onChange={(e) => {
                        setAddress({ ...address, fullName: e.target.value });
                        if (addressErrors.fullName) {
                          setAddressErrors({ ...addressErrors, fullName: "" });
                        }
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                        addressErrors.fullName
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:ring-primary/30"
                      }`}
                    />
                    {addressErrors.fullName && (
                      <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {addressErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-phone"
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Mobile Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-muted-foreground">
                        +91
                      </span>
                      <input
                        id="field-phone"
                        type="tel"
                        maxLength={10}
                        value={address.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setAddress({ ...address, phone: val });
                          if (addressErrors.phone) {
                            setAddressErrors({ ...addressErrors, phone: "" });
                          }
                        }}
                        placeholder="9876543210"
                        className={`w-full rounded-xl border bg-background pl-12 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                          addressErrors.phone
                            ? "border-destructive focus:ring-destructive/30"
                            : "border-border focus:ring-primary/30"
                        }`}
                      />
                    </div>
                    {addressErrors.phone && (
                      <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {addressErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Flat / House No / Street */}
                <div>
                  <label
                    htmlFor="field-line1"
                    className="block text-xs font-bold text-foreground mb-1.5"
                  >
                    Flat / Society / Street Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="field-line1"
                    type="text"
                    value={address.line1}
                    onChange={(e) => {
                      setAddress({ ...address, line1: e.target.value });
                      if (addressErrors.line1) {
                        setAddressErrors({ ...addressErrors, line1: "" });
                      }
                    }}
                    placeholder="e.g. Flat 402, High Street Heights, Spine Road"
                    className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                      addressErrors.line1
                        ? "border-destructive focus:ring-destructive/30"
                        : "border-border focus:ring-primary/30"
                    }`}
                  />
                  {addressErrors.line1 && (
                    <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {addressErrors.line1}
                    </p>
                  )}
                </div>

                {/* Landmark & Area */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="field-landmark"
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Landmark (Optional)
                    </label>
                    <input
                      id="field-landmark"
                      type="text"
                      value={address.landmark || ""}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="e.g. Near Moshi Toll Plaza / Bharat Petrol Pump"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="field-line2"
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Area / Suburb
                    </label>
                    <input
                      id="field-line2"
                      type="text"
                      value={address.line2 || ""}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      placeholder="e.g. Moshi / Bhosari / Chakan / Wakad"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">City</label>
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs font-bold text-foreground">
                      <span>Pune, Maharashtra</span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-500">
                        Operational Hub
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="field-pincode"
                      className="block text-xs font-bold text-foreground mb-1.5"
                    >
                      Pune Pincode <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="field-pincode"
                      type="text"
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setAddress({ ...address, pincode: val });
                        if (addressErrors.pincode) {
                          setAddressErrors({ ...addressErrors, pincode: "" });
                        }
                      }}
                      placeholder="412105"
                      className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                        addressErrors.pincode
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:ring-primary/30"
                      }`}
                    />
                    {addressErrors.pincode && (
                      <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {addressErrors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Delivery Slot Picker */}
            <section className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm">
              <div className="border-b border-border/60 pb-4 mb-4">
                <h2 className="text-base font-black text-foreground sm:text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Delivery Schedule & Time Slot
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Food is freshly prepared within 30 minutes prior to your selected window.
                </p>
              </div>

              {/* Delivery Date Selection */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Select Delivery Date
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                  {dateOptions.map((opt) => {
                    const isSelected = deliveryDate === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDeliveryDate(opt.value)}
                        className={`rounded-2xl border p-2.5 text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground font-black shadow-sm ring-1 ring-primary"
                            : "border-border/80 bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Slot Selection */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Select Delivery Window
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Morning */}
                  <button
                    type="button"
                    onClick={() => setDeliverySlot("morning")}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      deliverySlot === "morning"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/80 bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-foreground">🌅 Morning</span>
                      {deliverySlot === "morning" && (
                        <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-primary mt-1">7:00 – 9:30 AM</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Breakfast bowls, juices & oats
                    </span>
                  </button>

                  {/* Lunch */}
                  <button
                    type="button"
                    onClick={() => setDeliverySlot("lunch")}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      deliverySlot === "lunch"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/80 bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-foreground">☀️ Lunch</span>
                      {deliverySlot === "lunch" && (
                        <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-primary mt-1">12:00 – 2:30 PM</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Power meals, fresh salads & wraps
                    </span>
                  </button>

                  {/* Dinner */}
                  <button
                    type="button"
                    onClick={() => setDeliverySlot("dinner")}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      deliverySlot === "dinner"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/80 bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-foreground">🌙 Dinner</span>
                      {deliverySlot === "dinner" && (
                        <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-primary mt-1">7:00 – 9:30 PM</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Warm dinners, recovery smoothies
                    </span>
                  </button>
                </div>
              </div>

              {/* Kitchen Instructions */}
              <div className="mt-4">
                <label
                  htmlFor="field-orderNotes"
                  className="block text-xs font-bold text-foreground mb-1"
                >
                  Delivery / Kitchen Note (Optional)
                </label>
                <input
                  id="field-orderNotes"
                  type="text"
                  maxLength={150}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Ring bell, leave at security, make dressing extra light"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Order Summary Card + Payment + CTA (5 Cols) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="sticky top-20 space-y-6">
              {/* Payment Method Selection */}
              <section className="rounded-3xl border border-border/80 bg-surface/80 p-5 shadow-sm">
                <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Option
                </h3>

                <div className="space-y-2.5">
                  <label
                    className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/80 bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                          <span>Online Payment (UPI, Cards, NetBanking)</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Instant confirmation via Razorpay & UPI QR
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
                      Fastest
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/80 bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Cash on Delivery (Pay on Delivery)</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Pay cash or UPI scan at your door
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Order Summary Breakdown */}
              <section className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 shadow-sm">
                <h3 className="text-base font-black text-foreground mb-4">Order Summary</h3>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon (e.g. HEALTHY10)"
                        className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs uppercase font-bold text-foreground placeholder:normal-case placeholder:font-normal placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary/15 px-3.5 py-2 text-xs font-extrabold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponFeedback && (
                    <p
                      className={`mt-1.5 text-[11px] font-medium ${
                        couponFeedback.success ? "text-emerald-500" : "text-destructive"
                      }`}
                    >
                      {couponFeedback.text}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-500">
                      <span className="font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 stroke-[3]" /> Coupon {appliedCoupon.code}{" "}
                        applied!
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[10px] font-bold text-destructive hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="space-y-2.5 border-t border-border/60 pt-4 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-bold text-foreground">₹{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Coupon Discount</span>
                      <span className="font-bold">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Delivery Fee
                      {deliveryFee === 0 && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          (Free over ₹500)
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-foreground">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-500 font-bold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (5% Prepared Food Tax)</span>
                    <span className="font-bold text-foreground">₹{tax}</span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-border/80 pt-3 text-sm font-black text-foreground">
                    <span>Total Amount</span>
                    <span className="text-2xl text-primary font-black">₹{total}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="mt-4 rounded-xl bg-destructive/15 p-3 text-xs text-destructive border border-destructive/30">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Order Error
                    </p>
                    <p className="mt-0.5 text-[11px]">{submitError}</p>
                  </div>
                )}

                {/* Place Order CTA */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || items.length === 0}
                  className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order • ₹{total}</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>100% Clean Ingredients & Safe Contactless Delivery</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
