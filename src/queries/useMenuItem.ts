import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_MENU_ITEMS } from "@/lib/mockData";
import { enrichMenuItem, type MenuItem } from "@/components/menu/menuData";

export function menuItemQueryOptions(idOrSlug: string) {
  return queryOptions({
    queryKey: ["menu-item", idOrSlug],
    queryFn: async (): Promise<MenuItem | null> => {
      if (!idOrSlug) return null;

      try {
        const cleanIdOrSlug = idOrSlug.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          cleanIdOrSlug,
        );
        let query = (getSupabaseBrowserClient().from("menu_items") as any).select(
          "*, categories(*)",
        );

        if (isUuid) {
          query = query.eq("id", cleanIdOrSlug);
        } else {
          query = query.eq("slug", cleanIdOrSlug);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
          const fallback = MOCK_MENU_ITEMS.find(
            (i) => i.slug === cleanIdOrSlug || i.id === cleanIdOrSlug,
          );
          if (!fallback) return null;
          return enrichMenuItem(fallback);
        }

        const categorySlug =
          typeof data.categories === "object" && data.categories && "slug" in data.categories
            ? (data.categories as { slug: string }).slug
            : "salads";

        const rawItem: any = {
          id: data.id,
          category_id: data.category_id,
          category_slug: categorySlug,
          name: data.name,
          slug: data.slug,
          description: data.description ?? "",
          price: Number(data.price),
          image_url: data.image_url ?? MOCK_MENU_ITEMS[0]!.image_url,
          calories: data.calories ?? 0,
          protein_g: Number(data.protein_g ?? 0),
          carbs_g: Number(data.carbs_g ?? 0),
          fat_g: Number(data.fat_g ?? 0),
          fiber_g: Number(data.fiber_g ?? 0),
          is_vegan: Boolean(data.is_vegan),
          is_gluten_free: Boolean(data.is_gluten_free),
          is_available: Boolean(data.is_available),
          tags: data.tags ?? [],
          sort_order: data.sort_order,
        };
        if (Array.isArray(data.ingredients)) {
          rawItem.ingredients = data.ingredients;
        }
        if (data.prep_time_minutes != null) {
          rawItem.prep_time_minutes = Number(data.prep_time_minutes);
        }
        if (Array.isArray(data.customization_options)) {
          rawItem.customization_options = data.customization_options;
        }

        const mapped: MenuItem = enrichMenuItem(rawItem);

        return mapped;
      } catch {
        const cleanIdOrSlug = idOrSlug.trim();
        const fallback = MOCK_MENU_ITEMS.find(
          (i) => i.slug === cleanIdOrSlug || i.id === cleanIdOrSlug,
        );
        if (!fallback) return null;
        return enrichMenuItem(fallback);
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useMenuItem(idOrSlug: string) {
  return useQuery(menuItemQueryOptions(idOrSlug));
}

export type { MenuItem };
