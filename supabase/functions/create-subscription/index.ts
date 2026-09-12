// Follows Deno edge function runtime
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

    const { planId, userId, billingCycle } = await req.json();

    if (!planId || !userId) {
      return new Response(JSON.stringify({ error: "planId and userId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const start = new Date();
    const end = new Date();
    if (billingCycle === "quarterly") {
      end.setDate(end.getDate() + 90);
    } else {
      end.setDate(end.getDate() + 30);
    }

    const { data: subscription, error } = await supabaseClient
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        payment_provider: "razorpay_mandate",
        payment_provider_sub_id: `sub_${Date.now()}`,
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, subscription }), {
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
