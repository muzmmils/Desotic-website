import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function SubscriptionCTA() {
  const miniPlans = [
    {
      name: "Starter Routine",
      meals: "3 meals / week",
      price: "₹2,499",
      desc: "Perfect for weekday office lunches & light weeks",
      popular: false,
    },
    {
      name: "Power Plan",
      meals: "5 meals / week",
      price: "₹3,999",
      desc: "Our signature Monday–Friday complete high-protein routine",
      popular: true,
    },
    {
      name: "Ultimate 360°",
      meals: "7 meals / week",
      price: "₹5,999",
      desc: "Comprehensive daily health coverage & free weekly juices",
      popular: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background px-6 py-20 md:px-12 md:py-28">
      {/* Background ambient radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]"
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles size={14} /> Weekly Meal Subscriptions
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Healthy Eating on <span className="text-primary">Autopilot</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Skip grocery shopping, chopping, and calorie counting. Handcrafted gourmet salads and
            cold-pressed elixirs delivered fresh every morning in Pune.
          </p>
        </div>

        {/* 3 Mini Plan Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {miniPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
                plan.popular
                  ? "border-primary bg-surface shadow-[0_12px_40px_var(--primary-glow)] sm:-translate-y-2"
                  : "border-border bg-surface hover:border-border/80"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
                  Bestseller
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                  <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {plan.meals}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{plan.desc}</p>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground"> / mo</span>
                  </div>
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View Plan <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Central CTA Button */}
        <div className="mt-12 text-center">
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_30px_var(--primary-glow)] transition-all hover:opacity-90"
          >
            Explore All Subscription Options <ArrowRight size={16} />
          </Link>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> Pause anytime up to 30 days
            </span>
            <span>•</span>
            <span>Free Pune delivery</span>
            <span>•</span>
            <span>100% Made to Order</span>
          </div>
        </div>
      </div>
    </section>
  );
}
