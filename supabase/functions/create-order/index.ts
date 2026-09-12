import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItemPayload {
  menuItemId: string;
  name?: string;
  quantity: number;
  price?: number;
  basePrice?: number;
  customizations?: Record<string, unknown>;
}

interface CreateOrderPayload {
  items: OrderItemPayload[];
  deliveryDate: string;
  deliverySlot: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  notes?: string;
  paymentMethod?: "online" | "cod";
  couponCode?: string;
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

    // Optional user authentication via Authorization header
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const {
          data: { user },
        } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
        }
      } catch {
        // Continue as guest if token is missing or invalid
      }
    }

    const payload = (await req.json()) as CreateOrderPayload;
    const { items, deliveryDate, deliverySlot, deliveryAddress, notes, paymentMethod, couponCode } =
      payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone) {
      return new Response(JSON.stringify({ error: "Invalid delivery address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and fetch menu items from database to verify authoritative prices
    const itemIds = items.map((i) => i.menuItemId).filter(Boolean);
    const { data: dbItems } = await supabase
      .from("menu_items")
      .select("id, name, price")
      .in("id", itemIds);

    const dbItemMap = new Map((dbItems || []).map((i) => [i.id, i]));

    // Calculate subtotal
    let subtotal = 0;
    const validatedItems = items.map((item) => {
      const dbItem = dbItemMap.get(item.menuItemId);
      // Fallback to client price only if database row is not found
      const unitPrice = dbItem ? Number(dbItem.price) : Number(item.price || item.basePrice || 0);
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      return {
        menu_item_id: item.menuItemId,
        item_name: dbItem ? dbItem.name : item.name || "Healthy Dish",
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        customizations: item.customizations || {},
      };
    });

    // Calculate discount
    let discount = 0;
    const cleanCoupon = (couponCode || "").trim().toUpperCase();
    if (cleanCoupon === "HEALTHY10") {
      discount = Math.round((subtotal * 10) / 100);
    } else if (cleanCoupon === "FIRSTBOWL") {
      discount = Math.min(100, subtotal);
    } else if (cleanCoupon === "PUNEWELLNESS") {
      discount = Math.round((subtotal * 15) / 100);
    }

    // Free delivery above ₹500, else ₹49
    const deliveryFee = subtotal >= 500 ? 0 : 49;

    // 5% GST tax on food
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.05);

    const total = Math.max(0, subtotal - discount + deliveryFee + tax);

    // Generate readable order number: IHY-XXXXXX
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `IHY-${randomSuffix}`;

    const isCod = paymentMethod === "cod";
    const paymentProvider = isCod ? "cod" : "razorpay";
    const paymentStatus = "unpaid";

    // Insert order into public.orders
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: isCod ? "confirmed" : "pending",
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        discount,
        total,
        delivery_date: deliveryDate || new Date().toISOString().split("T")[0],
        delivery_slot: deliverySlot || "morning",
        delivery_address: deliveryAddress,
        payment_provider: paymentProvider,
        payment_status: paymentStatus,
        notes: notes || null,
        estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insertion error:", orderError);
      return new Response(
        JSON.stringify({ error: orderError?.message || "Failed to create order" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Insert items into public.order_items
    const orderItemsToInsert = validatedItems.map((v) => ({
      order_id: order.id,
      menu_item_id: v.menu_item_id,
      item_name: v.item_name,
      quantity: v.quantity,
      unit_price: v.unit_price,
      total_price: v.total_price,
      customizations: v.customizations,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
    }

    // Razorpay Integration or simulation token
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_ihy_demo";
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    let razorpayOrderId: string | null = null;
    if (razorpaySecret && !isCod) {
      try {
        const auth = btoa(`${razorpayKeyId}:${razorpaySecret}`);
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total * 100, // in paise
            currency: "INR",
            receipt: orderNumber,
            notes: {
              order_id: order.id,
              customer_phone: deliveryAddress.phone,
            },
          }),
        });
        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          razorpayOrderId = rzpData.id;
          await supabase
            .from("orders")
            .update({ razorpay_order_id: razorpayOrderId })
            .eq("id", order.id);
        }
      } catch (rzpErr) {
        console.error("Razorpay order creation fallback:", rzpErr);
      }
    }

    if (!razorpayOrderId && !isCod) {
      razorpayOrderId = `order_sim_${Date.now()}`;
      await supabase
        .from("orders")
        .update({ razorpay_order_id: razorpayOrderId })
        .eq("id", order.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        total,
        razorpayOrderId,
        razorpayKeyId,
        paymentProvider,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("Unexpected error in create-order:", err);
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
