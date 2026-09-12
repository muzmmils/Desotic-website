import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Heart, Leaf, MapPin, Clock, ArrowRight } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export const Route = createFileRoute("/about")({
  head: () => {
    const title = "About Us — Infinite Healthy Yumm | Healthy Cafe in Moshi, Pune";
    const description =
      "Learn about Infinite Healthy Yumm in Moshi, Pune. Our mission is to make real, chef-crafted, cold-pressed clean eating accessible with zero compromises.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${BASE_URL}/about` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: `${BASE_URL}/about` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Infinite Healthy Yumm",
            description,
            url: `${BASE_URL}/about`,
            mainEntity: {
              "@type": "Restaurant",
              name: "Infinite Healthy Yumm",
              address: {
                "@type": "PostalAddress",
                streetAddress: "High Street Mall, Moshi",
                addressLocality: "Pimpri-Chinchwad, Pune",
                postalCode: "412105",
                addressCountry: "IN",
              },
            },
          }),
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const pillars = [
    {
      icon: Leaf,
      title: "100% Made to Order",
      desc: "No pre-sliced wilted veggies sitting in cold display cases. Every single salad, bowl, and smoothie is chopped, blended, and plated the minute you hit order.",
    },
    {
      icon: Sparkles,
      title: "Cold-Pressed In-House",
      desc: "Our cold-press hydraulic mastication extracts pure, unfiltered juices without generating friction heat, keeping living enzymes and micronutrients completely intact.",
    },
    {
      icon: Heart,
      title: "Clean Macro Balance",
      desc: "We believe food is cellular fuel. Every recipe is calibrated for optimal protein-to-carb ratios, complex dietary fibers, and anti-inflammatory healthy fats.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      {/* Header Section */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles size={14} /> Our Story & Mission
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
          Healthy bhi! <span className="text-primary">Tasty bhi!</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Born at High Street Mall, Moshi, Infinite Healthy Yumm was created to solve a modern
          dilemma: why does healthy food have to be bland, and why does delicious food have to be
          toxic?
        </p>
      </div>

      {/* Story Card */}
      <div className="mt-12 rounded-3xl border border-border/80 bg-surface/80 p-8 shadow-xl backdrop-blur-md sm:p-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">A Fresh Standard for Pune</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Most commercial &apos;healthy&apos; spots rely on pre-bottled dressings loaded with
              refined seed oils and disguised sugar. We refused to cut those corners.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              From stone-ground hummus to hand-pressed cold juices and protein-packed quinoa bowls,
              every element is prepared in our open-air hygienic kitchen right here in Moshi, PCMC.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
              >
                Browse Our Menu <ArrowRight size={14} />
              </Link>
              <Link
                to="/subscriptions"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-bold text-foreground hover:border-primary"
              >
                Weekly Meal Plans
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-6 text-center">
            <span className="text-5xl">🥗</span>
            <h3 className="mt-3 text-lg font-bold text-foreground">
              Pune&apos;s Clean Fuel Kitchen
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Serving mindful professionals, fitness enthusiasts, and families across Pune.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-center">
              <div>
                <span className="block text-2xl font-black text-primary">0%</span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Refined Sugar
                </span>
              </div>
              <div>
                <span className="block text-2xl font-black text-primary">100%</span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Made to Order
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
          What Makes Us Different
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{pillar.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visit Us Info */}
      <div className="mt-16 rounded-3xl border border-border bg-surface p-8 sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Physical Cafe & Pickup
            </span>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Visit Us in Moshi</h2>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-primary" />
                <span>Shop 12, High Street Mall, Spine Road, Moshi, Pune 412105</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-primary" />
                <span>Open Daily: 9:00 AM – 10:00 PM</span>
              </p>
            </div>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--primary-glow)] hover:opacity-90"
          >
            Order Delivery Now
          </Link>
        </div>
      </div>
    </div>
  );
}
