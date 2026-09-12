import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { MOCK_SUBSCRIPTION_PLANS, type MockSubscriptionPlan } from "@/lib/mockData";

export const subscriptionPlansQueryOptions = queryOptions({
  queryKey: ["subscription-plans"],
  queryFn: async (): Promise<MockSubscriptionPlan[]> => {
    try {
      const { data, error } = await (getSupabaseBrowserClient().from("subscription_plans") as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error || !data || data.length === 0) {
        return MOCK_SUBSCRIPTION_PLANS;
      }

      return data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description ?? "",
        price_monthly: Number(plan.price_monthly),
        price_quarterly: plan.price_quarterly
          ? Number(plan.price_quarterly)
          : Number(plan.price_monthly) * 3 * 0.9,
        meals_per_week: plan.meals_per_week,
        features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
        is_popular: plan.is_popular,
        is_active: plan.is_active,
        sort_order: plan.sort_order,
      }));
    } catch {
      return MOCK_SUBSCRIPTION_PLANS;
    }
  },
});

export function useSubscriptionPlans() {
  return useQuery(subscriptionPlansQueryOptions);
}
