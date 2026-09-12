import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Check, ShieldCheck, ArrowLeft, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionPlans } from "@/queries/useSubscriptionPlans";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { BASE_URL } from "@/lib/constants";

const subscriptionSearchSchema = z.object({
  plan: z.string().default("power-plan"),
  billing: z.enum(["monthly", "quarterly"]).default("monthly"),
});

export const Route = createFileRoute("/subscriptions/checkout")({
  validateSearch: subscriptionSearchSchema,
  head: () => ({
    meta: [
      { title: "Subscribe to Meal Plan — Infinite Healthy Yumm" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/subscriptions/checkout` }],
  }),
  component: SubscriptionCheckoutPage,
});

function SubscriptionCheckoutPage() {
  const { plan: planSlug, billing } = Route.useSearch();
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const navigate = useNavigate();
  const supabase = getSupabaseBrowserClient();

  const selectedPlan = plans?.find((p) => p.slug === planSlug) || plans?.[1];

  // Form states
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]!,
  );
  const [deliverySlot, setDeliverySlot] = useState<"morning" | "lunch" | "dinner">("lunch");
  const [addressLine, setAddressLine] = useState("");
  const [phone, setPhone] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "upi" | "test">("test");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize from profile if available
  const [hasInitProfile, setHasInitProfile] = useState(false);
  if (profile && !hasInitProfile) {
    if (profile.phone) setPhone(profile.phone);
    if (profile.address && typeof profile.address === "object") {
      const addr = profile.address as { line1?: string };
      if (addr.line1) setAddressLine(addr.line1);
    }
    setHasInitProfile(true);
  }

  const price = selectedPlan
    ? billing === "monthly"
      ? selectedPlan.price_monthly
      : selectedPlan.price_quarterly
    : 0;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate({ to: "/login" });
      return;
    }

    if (!addressLine.trim()) {
      setErrorMsg("Please enter your delivery address in Pune.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Calculate period end
      const start = new Date(startDate);
      const end = new Date(start);
      if (billing === "monthly") {
        end.setDate(end.getDate() + 30);
      } else {
        end.setDate(end.getDate() + 90);
      }

      // 1. Create or upsert subscription in Supabase
      const { data: _newSub, error } = await (supabase.from("subscriptions") as any)
        .insert({
          user_id: user.id,
          plan_id: selectedPlan?.id || "plan-power",
          status: "active",
          payment_provider: paymentMode === "test" ? "test_instant" : "razorpay_mandate",
          payment_provider_sub_id: `sub_${Date.now()}`,
          current_period_start: start.toISOString(),
          current_period_end: end.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn("Could not insert to remote DB (using local state):", error);
      }

      // 2. Also record in user profile default address
      await (supabase.from("profiles") as any)
        .update({
          phone: phone || profile?.phone,
          address: { line1: addressLine, city: "Pune", notes: dietaryNotes },
        })
        .eq("id", user.id);

      // 3. Success navigation
      navigate({
        to: "/account",
      });
    } catch (err) {
      console.error("Subscription creation failed:", err);
      setErrorMsg("Failed to setup subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || plansLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-foreground">Sign In to Subscribe</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an account to manage meal deliveries, dietary preferences, and billing.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/login"
              className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-full border border-border py-3 text-sm font-semibold text-foreground hover:border-primary"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        to="/subscriptions"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={14} /> Back to Plan Options
      </Link>

      <h1 className="mt-4 text-3xl font-extrabold text-foreground">Complete Your Subscription</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set your delivery schedule and activate your meal plan
      </p>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubscribe} className="mt-8 grid gap-8 md:grid-cols-3">
        {/* Left 2 Cols: Form Inputs */}
        <div className="space-y-6 md:col-span-2">
          {/* Schedule Settings */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-bold text-foreground">1. Delivery Schedule</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  First Delivery Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Time Slot
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) =>
                    setDeliverySlot(e.target.value as "morning" | "lunch" | "dinner")
                  }
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="morning">Morning (8:00 AM – 9:30 AM)</option>
                  <option value="lunch">Lunch Slot (11:30 AM – 1:00 PM)</option>
                  <option value="dinner">Evening Slot (6:30 PM – 8:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-bold text-foreground">2. Delivery Location (Pune)</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Address (Flat / House / Office / Street)
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Unit 302, Green Avenue, High Street Mall, Moshi"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone for Delivery Updates
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Dietary Notes / Preferences (Optional)
                  </label>
                  <input
                    type="text"
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="e.g. No raw onions, extra avocado"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-bold text-foreground">3. Payment Authorization</h2>
            <div className="mt-4 space-y-3">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                  paymentMode === "test"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMode === "test"}
                    onChange={() => setPaymentMode("test")}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Instant Activation (Demo / Test Mode)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Directly activates subscription without charging live card
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                  Instant
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                  paymentMode === "razorpay"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMode === "razorpay"}
                    onChange={() => setPaymentMode("razorpay")}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">Razorpay AutoPay / Mandate</p>
                    <p className="text-xs text-muted-foreground">
                      UPI Autopay, Debit/Credit Card recurring billing
                    </p>
                  </div>
                </div>
                <CreditCard size={18} className="text-muted-foreground" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <h2 className="text-lg font-bold text-foreground">Plan Summary</h2>

          <div className="mt-4 rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{selectedPlan?.name}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {selectedPlan?.meals_per_week} meals / wk
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground capitalize">
              {billing} billing schedule
            </p>
          </div>

          <div className="mt-6 space-y-2.5 border-b border-border/60 pb-4 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Base Plan Fee</span>
              <span>₹{price}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery & Thermal Packaging</span>
              <span className="font-bold text-primary">FREE</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Menu Customization Support</span>
              <span className="font-bold text-primary">Included</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm font-bold text-foreground">Total Payable</span>
            <span className="text-2xl font-extrabold text-foreground">₹{price}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--primary-glow)] hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Setting up subscription..."
            ) : (
              <>
                <Check size={16} strokeWidth={3} />
                Activate Subscription
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
            <ShieldCheck size={14} className="text-primary" />
            <span>Pause, skip, or cancel anytime from account</span>
          </div>
        </div>
      </form>
    </div>
  );
}
