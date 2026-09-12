import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payload = await req.json();
    const event = payload.event;
    const subscriptionEntity = payload.payload?.subscription?.entity;

    if (!subscriptionEntity) {
      return new Response(JSON.stringify({ message: "No subscription entity found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subId = subscriptionEntity.id;

    if (event === "subscription.paused") {
      await supabaseClient
        .from("subscriptions")
        .update({ status: "paused", pause_started_at: new Date().toISOString() })
        .eq("payment_provider_sub_id", subId);
    } else if (event === "subscription.resumed" || event === "subscription.charged") {
      await supabaseClient
        .from("subscriptions")
        .update({ status: "active", pause_started_at: null })
        .eq("payment_provider_sub_id", subId);
    } else if (event === "subscription.cancelled") {
      await supabaseClient
        .from("subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("payment_provider_sub_id", subId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
