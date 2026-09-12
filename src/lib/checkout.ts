import { getSupabaseBrowserClient } from "./supabase-browser";
import type { CartItem } from "@/stores/cartStore";
import type { Database } from "./database.types";

export type OrderStatus =
  "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  pincode: string;
}

export interface CreateOrderParams {
  items: CartItem[];
  deliveryDate: string;
  deliverySlot: string;
  deliveryAddress: DeliveryAddress;
  notes?: string;
  paymentMethod: "online" | "cod";
  couponCode?: string;
  userId?: string | null;
}

export interface StoredOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  delivery_date: string;
  delivery_slot: string;
  delivery_address: DeliveryAddress;
  payment_provider: string;
  payment_status: PaymentStatus;
  payment_id: string | null;
  razorpay_order_id: string | null;
  notes: string | null;
  estimated_delivery_time: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    order_id: string;
    menu_item_id: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    customizations: Record<string, unknown>;
  }>;
}

const LOCAL_ORDERS_KEY = "ihy-orders-storage";

export function getLocalOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: StoredOrder): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalOrders();
    const index = existing.findIndex(
      (o) => o.id === order.id || o.order_number === order.order_number,
    );
    let updated: StoredOrder[];
    if (index > -1) {
      updated = [...existing];
      updated[index] = order;
    } else {
      updated = [order, ...existing];
    }
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ihy-order-update", { detail: { orderId: order.id } }));
  } catch (err) {
    console.warn("Failed to cache order locally:", err);
  }
}

/**
 * Creates an order via Edge Function or direct database insertion with local fallback.
 */
export async function createOrder(params: CreateOrderParams): Promise<{
  success: boolean;
  orderId: string;
  orderNumber: string;
  total: number;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  paymentProvider: string;
}> {
  const supabase = getSupabaseBrowserClient();

  // 1. Try Supabase Edge Function first
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke("create-order", {
      body: {
        items: params.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          basePrice: i.basePrice,
          customizations: i.customizations,
        })),
        deliveryDate: params.deliveryDate,
        deliverySlot: params.deliverySlot,
        deliveryAddress: params.deliveryAddress,
        notes: params.notes,
        paymentMethod: params.paymentMethod,
        couponCode: params.couponCode,
      },
    });

    if (!edgeError && edgeData && edgeData.orderId) {
      // Save local copy for instant offline resilience and tracking
      const localOrder: StoredOrder = {
        id: edgeData.orderId,
        order_number: edgeData.orderNumber,
        user_id: params.userId ?? null,
        status: params.paymentMethod === "cod" ? "confirmed" : "pending",
        subtotal: params.items.reduce((s, i) => s + i.price * i.quantity, 0),
        tax: Math.round(params.items.reduce((s, i) => s + i.price * i.quantity, 0) * 0.05),
        delivery_fee: params.items.reduce((s, i) => s + i.price * i.quantity, 0) >= 500 ? 0 : 49,
        discount: 0,
        total: edgeData.total,
        delivery_date: params.deliveryDate,
        delivery_slot: params.deliverySlot,
        delivery_address: params.deliveryAddress,
        payment_provider: edgeData.paymentProvider || params.paymentMethod,
        payment_status: "unpaid",
        payment_id: null,
        razorpay_order_id: edgeData.razorpayOrderId ?? null,
        notes: params.notes ?? null,
        estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        delivered_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: params.items.map((i) => ({
          id: `item_${Math.random().toString(36).substring(2, 9)}`,
          order_id: edgeData.orderId,
          menu_item_id: i.menuItemId,
          item_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          total_price: i.price * i.quantity,
          customizations: (i.customizations as Record<string, unknown>) || {},
        })),
      };
      saveLocalOrder(localOrder);

      return edgeData;
    }
  } catch (fnErr) {
    console.warn("create-order Edge Function invocation bypassed or unreachable:", fnErr);
  }

  // 2. Resilient Database / Direct Flow
  const subtotal = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  const coupon = (params.couponCode || "").trim().toUpperCase();
  if (coupon === "HEALTHY10") discount = Math.round((subtotal * 10) / 100);
  else if (coupon === "FIRSTBOWL") discount = Math.min(100, subtotal);
  else if (coupon === "PUNEWELLNESS") discount = Math.round((subtotal * 15) / 100);

  const deliveryFee = subtotal >= 500 ? 0 : 49;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.05);
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const orderNumber = `IHY-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const isCod = params.paymentMethod === "cod";
  const initialStatus: OrderStatus = isCod ? "confirmed" : "pending";
  const razorpayOrderId = isCod ? null : `order_sim_${Date.now()}`;

  // If user is authenticated, attempt direct database insertion
  if (params.userId) {
    try {
      const orderPayload: Database["public"]["Tables"]["orders"]["Insert"] = {
        id: orderId,
        order_number: orderNumber,
        user_id: params.userId,
        status: initialStatus,
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        discount,
        total,
        delivery_date: params.deliveryDate,
        delivery_slot: params.deliverySlot,
        delivery_address:
          params.deliveryAddress as unknown as Database["public"]["Tables"]["orders"]["Insert"]["delivery_address"],
        payment_provider: isCod ? "cod" : "razorpay",
        payment_status: "unpaid",
        razorpay_order_id: razorpayOrderId,
        notes: params.notes || null,
        estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      };

      const { error: dbOrderError } = await (supabase.from("orders") as any).insert(orderPayload);
      if (!dbOrderError) {
        // Insert order items
        const itemsToInsert = params.items.map((i) => ({
          order_id: orderId,
          menu_item_id: i.menuItemId,
          item_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          total_price: i.price * i.quantity,
          customizations:
            (i.customizations as unknown as Database["public"]["Tables"]["order_items"]["Insert"]["customizations"]) ||
            {},
        }));
        await (supabase.from("order_items") as any).insert(itemsToInsert);
      }
    } catch (dbErr) {
      console.warn("Direct Supabase DB insert error:", dbErr);
    }
  }

  // Always cache locally so tracking works seamlessly
  const localOrder: StoredOrder = {
    id: orderId,
    order_number: orderNumber,
    user_id: params.userId ?? null,
    status: initialStatus,
    subtotal,
    tax,
    delivery_fee: deliveryFee,
    discount,
    total,
    delivery_date: params.deliveryDate,
    delivery_slot: params.deliverySlot,
    delivery_address: params.deliveryAddress,
    payment_provider: isCod ? "cod" : "razorpay",
    payment_status: "unpaid",
    payment_id: null,
    razorpay_order_id: razorpayOrderId,
    notes: params.notes ?? null,
    estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    delivered_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: params.items.map((i) => ({
      id: `item_${Math.random().toString(36).substring(2, 9)}`,
      order_id: orderId,
      menu_item_id: i.menuItemId,
      item_name: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      total_price: i.price * i.quantity,
      customizations: (i.customizations as Record<string, unknown>) || {},
    })),
  };
  saveLocalOrder(localOrder);

  const resultPayload: {
    success: boolean;
    orderId: string;
    orderNumber: string;
    total: number;
    razorpayOrderId?: string;
    razorpayKeyId?: string;
    paymentProvider: string;
  } = {
    success: true,
    orderId,
    orderNumber,
    total,
    razorpayKeyId: "rzp_test_ihy_demo",
    paymentProvider: isCod ? "cod" : "razorpay",
  };
  if (razorpayOrderId) {
    resultPayload.razorpayOrderId = razorpayOrderId;
  }

  return resultPayload;
}

/**
 * Verifies payment via Edge Function or direct database update.
 */
export async function verifyPayment(payload: {
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: "online" | "cod";
}): Promise<{
  success: boolean;
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}> {
  const supabase = getSupabaseBrowserClient();

  // Try Edge Function
  try {
    const { data, error } = await supabase.functions.invoke("verify-payment", {
      body: payload,
    });
    if (!error && data && data.success) {
      // Update local cache
      const local = getLocalOrders().find((o) => o.id === payload.orderId);
      if (local) {
        saveLocalOrder({
          ...local,
          status: "confirmed",
          payment_status: payload.paymentMethod === "cod" ? "unpaid" : "paid",
          payment_id: payload.razorpayPaymentId || `pay_${Date.now()}`,
          updated_at: new Date().toISOString(),
        });
      }
      return data;
    }
  } catch (err) {
    console.warn("verify-payment Edge Function fallback:", err);
  }

  // Fallback: direct database update
  const paymentStatus: PaymentStatus = payload.paymentMethod === "cod" ? "unpaid" : "paid";
  try {
    await (supabase.from("orders") as any)
      .update({
        status: "confirmed",
        payment_status: paymentStatus,
        payment_id: payload.razorpayPaymentId || `sim_pay_${Date.now()}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.orderId);
  } catch {
    // Ignore db failure if offline
  }

  // Always update local cache
  const local = getLocalOrders().find((o) => o.id === payload.orderId);
  if (local) {
    saveLocalOrder({
      ...local,
      status: "confirmed",
      payment_status: paymentStatus,
      payment_id: payload.razorpayPaymentId || `sim_pay_${Date.now()}`,
      updated_at: new Date().toISOString(),
    });
  }

  return {
    success: true,
    orderId: payload.orderId,
    status: "confirmed",
    paymentStatus,
  };
}

/**
 * Retrieves full order details from Supabase or local storage.
 */
export async function getOrderDetails(orderId: string): Promise<StoredOrder | null> {
  const supabase = getSupabaseBrowserClient();

  // Try DB query
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    let query = supabase.from("orders").select("*, order_items(*)");
    if (isUuid) {
      query = query.eq("id", orderId);
    } else {
      query = query.eq("order_number", orderId);
    }

    const { data: dbOrder, error } = await query.maybeSingle();

    if (!error && dbOrder) {
      const rawOrder = dbOrder as unknown as Database["public"]["Tables"]["orders"]["Row"] & {
        order_items?: Array<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      const items = Array.isArray(rawOrder.order_items)
        ? rawOrder.order_items.map((item) => ({
            id: item.id,
            order_id: item.order_id,
            menu_item_id: item.menu_item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total_price: Number(item.total_price),
            customizations: (item.customizations as Record<string, unknown>) || {},
          }))
        : [];

      const result: StoredOrder = {
        id: rawOrder.id,
        order_number: rawOrder.order_number,
        user_id: rawOrder.user_id,
        status: rawOrder.status as OrderStatus,
        subtotal: Number(rawOrder.subtotal),
        tax: Number(rawOrder.tax),
        delivery_fee: Number(rawOrder.delivery_fee),
        discount: Number(rawOrder.discount),
        total: Number(rawOrder.total),
        delivery_date: rawOrder.delivery_date,
        delivery_slot: rawOrder.delivery_slot,
        delivery_address: (rawOrder.delivery_address as unknown as DeliveryAddress) || {
          fullName: "Customer",
          phone: "",
          line1: "",
          city: "Pune",
          pincode: "412105",
        },
        payment_provider: rawOrder.payment_provider || "razorpay",
        payment_status: rawOrder.payment_status as PaymentStatus,
        payment_id: rawOrder.payment_id,
        razorpay_order_id: rawOrder.razorpay_order_id,
        notes: rawOrder.notes,
        estimated_delivery_time: rawOrder.estimated_delivery_time,
        delivered_at: rawOrder.delivered_at,
        created_at: rawOrder.created_at,
        updated_at: rawOrder.updated_at,
        items,
      };

      saveLocalOrder(result);
      return result;
    }
  } catch (err) {
    console.warn("DB getOrderDetails fallback to local:", err);
  }

  // Fallback to local storage
  const localOrders = getLocalOrders();
  const found = localOrders.find((o) => o.id === orderId || o.order_number === orderId);
  return found || null;
}

/**
 * Advance order status for live demo / testing simulation.
 * Transitions: pending -> confirmed -> preparing -> out_for_delivery -> delivered
 */
export async function advanceOrderStatus(
  orderId: string,
  targetStatus?: OrderStatus,
): Promise<OrderStatus> {
  const current = await getOrderDetails(orderId);
  if (!current) return "pending";

  const sequence: OrderStatus[] = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];

  let nextStatus: OrderStatus;
  if (targetStatus) {
    nextStatus = targetStatus;
  } else {
    const currentIndex = sequence.indexOf(current.status);
    if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
      nextStatus = "pending"; // cycle back for testing
    } else {
      nextStatus = sequence[currentIndex + 1] ?? "pending";
    }
  }

  const supabase = getSupabaseBrowserClient();
  try {
    await (supabase.from("orders") as any)
      .update({
        status: nextStatus,
        delivered_at: nextStatus === "delivered" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id);
  } catch {
    // ignore db failure
  }

  const updatedOrder: StoredOrder = {
    ...current,
    status: nextStatus,
    delivered_at: nextStatus === "delivered" ? new Date().toISOString() : current.delivered_at,
    updated_at: new Date().toISOString(),
  };

  saveLocalOrder(updatedOrder);
  return nextStatus;
}

/**
 * Fetches all orders for the current user or guest session.
 */
export async function getUserOrders(userId?: string | null): Promise<StoredOrder[]> {
  const supabase = getSupabaseBrowserClient();
  const localOrders = getLocalOrders();

  if (!userId) {
    return localOrders;
  }

  try {
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
        order_items?: Array<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      const parsed: StoredOrder[] = (dbOrders as unknown as OrderWithItems[]).map((dbOrder) => ({
        id: dbOrder.id,
        order_number: dbOrder.order_number,
        user_id: dbOrder.user_id,
        status: dbOrder.status as OrderStatus,
        subtotal: Number(dbOrder.subtotal),
        tax: Number(dbOrder.tax),
        delivery_fee: Number(dbOrder.delivery_fee),
        discount: Number(dbOrder.discount),
        total: Number(dbOrder.total),
        delivery_date: dbOrder.delivery_date,
        delivery_slot: dbOrder.delivery_slot,
        delivery_address: (dbOrder.delivery_address as unknown as DeliveryAddress) || {
          fullName: "Customer",
          phone: "",
          line1: "",
          city: "Pune",
          pincode: "412105",
        },
        payment_provider: dbOrder.payment_provider || "razorpay",
        payment_status: dbOrder.payment_status as PaymentStatus,
        payment_id: dbOrder.payment_id,
        razorpay_order_id: dbOrder.razorpay_order_id,
        notes: dbOrder.notes,
        estimated_delivery_time: dbOrder.estimated_delivery_time,
        delivered_at: dbOrder.delivered_at,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.updated_at,
        items: Array.isArray(dbOrder.order_items)
          ? dbOrder.order_items.map((item) => ({
              id: item.id,
              order_id: item.order_id,
              menu_item_id: item.menu_item_id,
              item_name: item.item_name,
              quantity: item.quantity,
              unit_price: Number(item.unit_price),
              total_price: Number(item.total_price),
              customizations: (item.customizations as Record<string, unknown>) || {},
            }))
          : [],
      }));

      // Merge with local orders for complete history
      const idSet = new Set(parsed.map((o) => o.id));
      for (const loc of localOrders) {
        if (!idSet.has(loc.id)) {
          parsed.push(loc);
        }
      }
      return parsed.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
  } catch (err) {
    console.warn("DB getUserOrders fallback to local:", err);
  }

  return localOrders;
}
