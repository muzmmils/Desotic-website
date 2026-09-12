import { createFileRoute } from "@tanstack/react-router";
import { BASE_URL } from "@/lib/constants";
import { Hero } from "@/components/landing/Hero";
import { SaladSection } from "@/components/landing/SaladSection";
import { JuiceSection } from "@/components/landing/JuiceSection";
import { OatmealSection } from "@/components/landing/OatmealSection";
import { PhilosophySection } from "@/components/landing/PhilosophySection";
import { CategorySection } from "@/components/landing/CategorySection";
import { SubscriptionCTA } from "@/components/landing/SubscriptionCTA";
import { LocationSection } from "@/components/landing/LocationSection";
import { SiteFooter } from "@/components/landing/SiteFooter";

const TITLE = "Infinite Healthy Yumm — Healthy bhi! Tasty bhi! | Pune";
const DESCRIPTION =
  "Premium healthy cafe in Moshi, Pune. Cold-pressed juices, protein-packed salads, power oatmeal bowls — everything made to order. Visit us at High Street Mall.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: BASE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: BASE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Infinite Healthy Yumm",
          description: "Premium healthy cafe — cold-pressed juices, protein salads, power bowls",
          servesCuisine: "Healthy",
          url: "https://infinitehealthyyumm.com",
          menu: "https://infinitehealthyyumm.com/menu",
          address: {
            "@type": "PostalAddress",
            streetAddress: "High Street Mall, Moshi",
            addressLocality: "Pimpri-Chinchwad",
            addressRegion: "Maharashtra",
            postalCode: "412105",
            addressCountry: "IN",
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "22:00",
          },
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      <main className="overflow-x-clip">
        <Hero />
        <SaladSection />
        <JuiceSection />
        <OatmealSection />
        <PhilosophySection />
        <CategorySection />
        <SubscriptionCTA />
        <LocationSection />
      </main>
      <SiteFooter />
    </>
  );
}
