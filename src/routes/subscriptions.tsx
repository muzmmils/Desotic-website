import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck, Calendar, Sparkles, ChevronDown, RefreshCw } from "lucide-react";
import { useSubscriptionPlans } from "@/queries/useSubscriptionPlans";
import { BASE_URL } from "@/lib/constants";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Healthy Meal Subscriptions in Pune — Infinite Healthy Yumm" },
      {
        name: "description",
        content:
          "Subscribe to weekly fresh salads, cold-pressed juices, and protein power meals delivered daily to your home or office in Moshi & Pune.",
      },
      { property: "og:title", content: "Meal Subscriptions — Infinite Healthy Yumm" },
      {
        property: "og:description",
        content: "Clean eating on autopilot. Choose 3, 5, or 7 meals a week.",
      },
      { property: "og:url", content: `${BASE_URL}/subscriptions` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/subscriptions` }],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data: plans, isLoading } = useSubscriptionPlans();

  const faqs = [
    {
      q: "Can I swap or customize my meals every week?",
      a: "Yes! Every Friday we release next week's menu. You can customize your salad bases, dressings, and shake flavors directly via WhatsApp or your account dashboard.",
    },
    {
      q: "How does the delivery schedule work in Pune?",
      a: "Meals are prepared fresh every morning and delivered in temperature-insulated packaging between 11:30 AM and 1:00 PM (lunch slot) or 6:30 PM to 8:00 PM (dinner slot) across Moshi, PCMC, and Pune.",
    },
    {
      q: "What if I go out of town or want to pause?",
      a: "You can pause your subscription anytime with 1 tap for up to 30 days. Your remaining meal credits never expire and will resume automatically on the date you select.",
    },
    {
      q: "Are the dressings and ingredients 100% clean?",
      a: "Absolutely. Zero refined white sugar, zero palm oil, zero chemical preservatives. We cold-press juices in-house and hand-make our vinaigrettes and tahini dressings daily.",
    },
    {
      q: "Can I cancel my subscription if I change my mind?",
      a: "Yes. You can cancel with zero cancellation fees at any time from your account dashboard before your next billing cycle.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
      {/* Hero Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles size={14} /> Nutrition on Autopilot
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Weekly Clean Eating, <span className="text-primary">Zero Prep Work</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Chef-crafted high-protein salads, cold-pressed juices, and balanced power bowls delivered
          fresh to your door in Pune.
        </p>

        {/* Billing Switcher */}
        <div className="mt-8 inline-flex items-center rounded-full border border-border bg-surface p-1.5 shadow-md">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-6 py-2 text-xs font-bold transition-all sm:text-sm ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("quarterly")}
            className={`flex items-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold transition-all sm:text-sm ${
              billingCycle === "quarterly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Quarterly</span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-accent">
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[520px] animate-pulse rounded-3xl border border-border bg-surface/50"
              />
            ))
          : plans?.map((plan) => {
              const price =
                billingCycle === "monthly"
                  ? plan.price_monthly
                  : Math.round(plan.price_quarterly / 3);
              const totalPrice =
                billingCycle === "monthly" ? plan.price_monthly : plan.price_quarterly;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all duration-300 ${
                    plan.is_popular
                      ? "border-primary bg-surface shadow-[0_12px_40px_var(--primary-glow)] lg:-translate-y-2"
                      : "border-border bg-surface hover:border-border/80"
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-extrabold tracking-wider text-primary-foreground uppercase shadow-md">
                      Most Popular Plan
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                      <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-bold text-primary">
                        {plan.meals_per_week} meals / wk
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                      {plan.description}
                    </p>

                    {/* Price Block */}
                    <div className="mt-6 border-y border-border/50 py-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-foreground sm:text-4xl">
                          ₹{price}
                        </span>
                        <span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                      {billingCycle === "quarterly" && (
                        <p className="mt-1 text-[11px] font-semibold text-accent">
                          Billed ₹{totalPrice} every 3 months (Save 10%)
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Approx. ₹{Math.round(price / (plan.meals_per_week * 4))} per meal delivered
                      </p>
                    </div>

                    {/* Features checklist */}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-foreground sm:text-sm"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      to="/subscriptions/checkout"
                      search={{ plan: plan.slug, billing: billingCycle }}
                      className={`flex w-full items-center justify-center rounded-full py-3.5 text-sm font-bold transition-all ${
                        plan.is_popular
                          ? "bg-primary text-primary-foreground shadow-[0_0_30px_var(--primary-glow)] hover:opacity-90"
                          : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      Choose {plan.name.split(" ")[0]}
                    </Link>
                    <p className="mt-2 text-center text-[10px] text-muted-foreground">
                      Pause or cancel anytime • No lock-in contracts
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-16 grid gap-6 rounded-2xl border border-border bg-surface/60 p-8 sm:grid-cols-3">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Flexible Pause Anytime</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Traveling? Pause your subscription for up to 30 days without losing any meals.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">100% Freshness Guarantee</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              If a meal ever falls short of crisp freshness, we replace it or refund it instantly.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Weekly Menu Rotation</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Over 30 distinct chef-curated recipes rotate so your palate never gets bored.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to know about our meal subscriptions
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border bg-surface transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-foreground sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border/40 px-5 pb-5 pt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
