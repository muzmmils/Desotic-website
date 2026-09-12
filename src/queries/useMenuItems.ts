import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_MENU_ITEMS } from "@/lib/mockData";
import { enrichMenuItem, type MenuItem } from "@/components/menu/menuData";

export interface MenuFilters {
  categorySlug?: string | undefined;
  categoryId?: string | undefined;
  searchQuery?: string | undefined;
  isVegan?: boolean | undefined;
  isGlutenFree?: boolean | undefined;
  minProtein?: number | undefined;
  maxCalories?: number | undefined;
  sortBy?: "recommended" | "price_asc" | "price_desc" | "calories_asc" | "protein_desc" | undefined;
}

function normalizeFilters(filterParam?: string | MenuFilters): MenuFilters {
  if (!filterParam) return {};
  if (typeof filterParam === "string") {
    return { categorySlug: filterParam };
  }
  return filterParam;
}

function filterAndSortMockItems(items: MenuItem[], filters: MenuFilters): MenuItem[] {
  let result = [...items].filter((i) => i.is_available);

  if (filters.categorySlug && filters.categorySlug !== "all") {
    result = result.filter((i) => i.category_slug === filters.categorySlug);
  }

  if (filters.categoryId) {
    result = result.filter((i) => i.category_id === filters.categoryId);
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)) ||
        i.ingredients.some((ing) => ing.toLowerCase().includes(q)),
    );
  }

  if (filters.isVegan) {
    result = result.filter((i) => i.is_vegan);
  }

  if (filters.isGlutenFree) {
    result = result.filter((i) => i.is_gluten_free);
  }

  if (filters.minProtein && filters.minProtein > 0) {
    result = result.filter((i) => i.protein_g >= filters.minProtein!);
  }

  if (filters.maxCalories && filters.maxCalories > 0) {
    result = result.filter((i) => i.calories <= filters.maxCalories!);
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "calories_asc":
        result.sort((a, b) => a.calories - b.calories);
        break;
      case "protein_desc":
        result.sort((a, b) => b.protein_g - a.protein_g);
        break;
      case "recommended":
      default:
        result.sort((a, b) => a.sort_order - b.sort_order);
        break;
    }
  } else {
    result.sort((a, b) => a.sort_order - b.sort_order);
  }

  return result;
}

export function menuItemsQueryOptions(filterParam?: string | MenuFilters) {
  const filters = normalizeFilters(filterParam);
  return queryOptions({
    queryKey: ["menu-items", filters],
    queryFn: async (): Promise<MenuItem[]> => {
      const enrichedMocks = MOCK_MENU_ITEMS.map((m) => enrichMenuItem(m));

      try {
        let query = (getSupabaseBrowserClient().from("menu_items") as any)
          .select("*, categories!inner(slug, name)")
          .eq("is_available", true);

        if (filters.categorySlug && filters.categorySlug !== "all") {
          query = query.eq("categories.slug", filters.categorySlug);
        }

        if (filters.categoryId) {
          query = query.eq("category_id", filters.categoryId);
        }

        if (filters.isVegan) {
          query = query.eq("is_vegan", true);
        }

        if (filters.isGlutenFree) {
          query = query.eq("is_gluten_free", true);
        }

        if (filters.minProtein && filters.minProtein > 0) {
          query = query.gte("protein_g", filters.minProtein);
        }

        if (filters.maxCalories && filters.maxCalories > 0) {
          query = query.lte("calories", filters.maxCalories);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          return filterAndSortMockItems(enrichedMocks, filters);
        }

        let items: MenuItem[] = data.map((d: any) => {
          const catSlug =
            typeof d.categories === "object" && d.categories && "slug" in d.categories
              ? (d.categories as { slug: string }).slug
              : "salads";

          const rawItem: any = {
            id: d.id,
            category_id: d.category_id,
            category_slug: catSlug,
            name: d.name,
            slug: d.slug,
            description: d.description ?? "",
            price: Number(d.price),
            image_url: d.image_url ?? MOCK_MENU_ITEMS[0]!.image_url,
            calories: d.calories ?? 0,
            protein_g: Number(d.protein_g ?? 0),
            carbs_g: Number(d.carbs_g ?? 0),
            fat_g: Number(d.fat_g ?? 0),
            fiber_g: Number(d.fiber_g ?? 0),
            is_vegan: Boolean(d.is_vegan),
            is_gluten_free: Boolean(d.is_gluten_free),
            is_available: Boolean(d.is_available),
            tags: d.tags ?? [],
            sort_order: d.sort_order,
          };
          if (Array.isArray(d.ingredients)) {
            rawItem.ingredients = d.ingredients;
          }
          if (d.prep_time_minutes != null) {
            rawItem.prep_time_minutes = Number(d.prep_time_minutes);
          }
          if (Array.isArray(d.customization_options)) {
            rawItem.customization_options = d.customization_options;
          }

          return enrichMenuItem(rawItem);
        });

        // Client search filter
        if (filters.searchQuery && filters.searchQuery.trim()) {
          const q = filters.searchQuery.trim().toLowerCase();
          items = items.filter(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.description.toLowerCase().includes(q) ||
              i.tags.some((t) => t.toLowerCase().includes(q)) ||
              i.ingredients.some((ing) => ing.toLowerCase().includes(q)),
          );
        }

        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case "price_asc":
              items.sort((a, b) => a.price - b.price);
              break;
            case "price_desc":
              items.sort((a, b) => b.price - a.price);
              break;
            case "calories_asc":
              items.sort((a, b) => a.calories - b.calories);
              break;
            case "protein_desc":
              items.sort((a, b) => b.protein_g - a.protein_g);
              break;
            case "recommended":
            default:
              items.sort((a, b) => a.sort_order - b.sort_order);
              break;
          }
        } else {
          items.sort((a, b) => a.sort_order - b.sort_order);
        }

        return items;
      } catch {
        return filterAndSortMockItems(enrichedMocks, filters);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenuItems(filterParam?: string | MenuFilters) {
  return useQuery(menuItemsQueryOptions(filterParam));
}
