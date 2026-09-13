import { createFileRoute } from "@tanstack/react-router";
import { BASE_URL } from "@/lib/constants";
import { VideoHero } from "@/components/landing/VideoHero";
import { ProblemPromise } from "@/components/landing/ProblemPromise";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { CinematicFooter } from "@/components/landing/CinematicFooter";

const TITLE = "Desotiq — Eat Clean. Live Bold. | Pune";
const DESCRIPTION =
  "Premium healthy food subscriptions in Pune. Chef-crafted salad bowls, cold-pressed juices, and power oatmeal — delivered fresh daily. Your first box is free.";

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
          "@type": "FoodService",
          name: "Desotiq",
          alternateName: "Infinite Healthy Yumm",
          description:
            "Premium healthy food subscription — chef-crafted salads, cold-pressed juices, power bowls delivered fresh daily in Pune",
          url: "https://desotiq.com",
          areaServed: {
            "@type": "City",
            name: "Pune",
            "@id": "https://www.wikidata.org/wiki/Q1538",
          },
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
      <main className="overflow-x-clip bg-background">
        <VideoHero />
        <ProblemPromise />
        <ProductShowcase />
        <HowItWorks />
        <SocialProof />
        <FinalCTA />
      </main>
      <CinematicFooter />
    </>
  );
}
