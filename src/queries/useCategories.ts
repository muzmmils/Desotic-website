import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_CATEGORIES, type MockCategory } from "@/lib/mockData";

export const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<MockCategory[]> => {
    try {
      const { data, error } = await (getSupabaseBrowserClient().from("categories") as any)
        .select("*")
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_CATEGORIES;
      }
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        emoji: d.emoji ?? "🥗",
        description: d.description ?? "",
        sort_order: d.sort_order,
      }));
    } catch {
      return MOCK_CATEGORIES;
    }
  },
  staleTime: 10 * 60 * 1000,
});

export function useCategories() {
  return useQuery(categoriesQueryOptions);
}
