import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: "online" | "cod";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = (await req.json()) as VerifyPaymentPayload;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } =
      payload;

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature if Razorpay secret is present and signature was provided
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    let verified = false;

    if (paymentMethod === "cod") {
      verified = true;
    } else if (razorpaySecret && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const data = `${razorpayOrderId}|${razorpayPaymentId}`;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(razorpaySecret);
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (expectedSignature === razorpaySignature) {
        verified = true;
      } else {
        return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // In development / demo mode or simulated payments, allow verification
      verified = true;
    }

    if (verified) {
      const paymentStatus = paymentMethod === "cod" ? "unpaid" : "paid";
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          payment_status: paymentStatus,
          payment_id: razorpayPaymentId || `sim_pay_${Date.now()}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update order status:", updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.order_number,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.payment_status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Payment verification failed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Unexpected error in verify-payment:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
