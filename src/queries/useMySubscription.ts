import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Database, SubscriptionStatus } from "@/lib/database.types";

export interface UserSubscriptionDetails {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  payment_provider: string | null;
  payment_provider_sub_id: string | null;
  current_period_start: string;
  current_period_end: string;
  pause_started_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  plan?: Database["public"]["Tables"]["subscription_plans"]["Row"] | null;
}

export function mySubscriptionQueryOptions(userId?: string | null) {
  return queryOptions({
    queryKey: ["my-subscription", userId ?? "anonymous"],
    queryFn: async (): Promise<UserSubscriptionDetails | null> => {
      if (!userId) return null;
      try {
        const { data, error } = await getSupabaseBrowserClient()
          .from("subscriptions")
          .select("*, plan:subscription_plans(*)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) return null;
        return data as unknown as UserSubscriptionDetails;
      } catch {
        return null;
      }
    },
    enabled: Boolean(userId),
  });
}

export function useMySubscription(userId?: string | null) {
  return useQuery(mySubscriptionQueryOptions(userId));
}
