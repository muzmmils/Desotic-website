import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BASE_URL } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { MOCK_MENU_ITEMS } from "@/lib/mockData";

interface SitemapEntry {
  path: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request?: Request } = {}) => {
        let itemSlugs: string[] = [];
        const today: string = new Date().toISOString().split("T")[0] ?? "2026-09-12";

        try {
          if (request) {
            const { supabase } = getSupabaseServerClient(request);
            const { data, error } = (await supabase
              .from("menu_items")
              .select("slug")
              .eq("is_available", true)) as {
              data: Array<{ slug: string }> | null;
              error: unknown;
            };

            if (!error && data && data.length > 0) {
              itemSlugs = data.map((d) => d.slug);
            }
          }
        } catch {
          // Fallback handled below
        }

        if (itemSlugs.length === 0) {
          itemSlugs = MOCK_MENU_ITEMS.filter((i) => i.is_available).map((m) => m.slug);
        }

        const staticPages: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0", lastmod: today },
          { path: "/menu", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/subscriptions", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/about", changefreq: "monthly", priority: "0.6", lastmod: today },
        ];

        const itemPages: SitemapEntry[] = itemSlugs.map((slug) => ({
          path: `/menu/${slug}`,
          changefreq: "weekly",
          priority: "0.7",
          lastmod: today,
        }));

        const entries: SitemapEntry[] = [...staticPages, ...itemPages];

        const urlsXml = entries
          .map(
            (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
