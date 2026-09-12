import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

export interface SelectedCustomizations {
  dressing?: string | undefined;
  spiceLevel?: string | undefined;
  milkBase?: string | undefined;
  grainBase?: string | undefined;
  options?: Record<string, string> | undefined;
  addons?: Array<{ id: string; name: string; price: number }> | undefined;
  notes?: string | undefined;
}

export interface CartItem {
  id: string; // composite key: generateCartItemKey(menuItemId, customizations)
  menuItemId: string;
  name: string;
  slug: string;
  price: number; // basePrice + addons
  basePrice: number;
  quantity: number;
  imageUrl?: string | undefined;
  categorySlug?: string | undefined;
  customizations?: SelectedCustomizations | undefined;
}

export type DeliverySlot = "morning" | "lunch" | "dinner" | "afternoon" | "evening";

export interface CartState {
  items: CartItem[];
  deliverySlot: DeliverySlot;
  deliveryDate: string; // YYYY-MM-DD
  appliedCoupon: {
    code: string;
    discountPercent?: number;
    discountAmount?: number;
  } | null;

  // Actions
  addItem: (
    item: Omit<CartItem, "id"> | CartItem,
    qty?: number,
    customizations?: SelectedCustomizations,
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  setDeliverySlot: (slot: DeliverySlot) => void;
  setDeliveryDate: (date: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Computeds
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getDeliveryFee: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const STORAGE_KEY = "ihy-cart-storage";

export function generateCartItemKey(
  menuItemId: string,
  customizations?: SelectedCustomizations,
): string {
  if (!customizations) {
    return `${menuItemId}-default`;
  }

  const parts: Record<string, unknown> = {};

  if (customizations["dressing"]) parts["dressing"] = customizations["dressing"];
  if (customizations["spiceLevel"]) parts["spiceLevel"] = customizations["spiceLevel"];
  if (customizations["milkBase"]) parts["milkBase"] = customizations["milkBase"];
  if (customizations["grainBase"]) parts["grainBase"] = customizations["grainBase"];

  if (customizations["options"] && Object.keys(customizations["options"]).length > 0) {
    const sortedOptions: Record<string, string> = {};
    for (const key of Object.keys(customizations["options"]).sort()) {
      const val = customizations["options"][key];
      if (val) sortedOptions[key] = val;
    }
    if (Object.keys(sortedOptions).length > 0) {
      parts["options"] = sortedOptions;
    }
  }

  if (customizations["addons"] && customizations["addons"].length > 0) {
    parts["addons"] = [...customizations["addons"]].map((a) => a.id).sort();
  }

  if (customizations["notes"] && customizations["notes"].trim()) {
    parts["notes"] = customizations["notes"].trim();
  }

  const customKey = Object.keys(parts).length > 0 ? JSON.stringify(parts) : "default";
  return `${menuItemId}-${customKey}`;
}

function notifyCartChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-change"));
    window.dispatchEvent(new Event("storage"));
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliverySlot: "morning",
      deliveryDate: new Date().toISOString().split("T")[0] ?? "2026-09-12",
      appliedCoupon: null,

      addItem: (itemOrCartItem, maybeQty, maybeCustomizations) => {
        // Support both: addItem(item, qty, customizations) and addItem({ ...cartItem })
        let finalItem: Omit<CartItem, "id">;

        if (maybeQty !== undefined || maybeCustomizations !== undefined) {
          const raw = itemOrCartItem as Partial<CartItem>;
          finalItem = {
            menuItemId: raw.menuItemId || (raw as unknown as { id?: string }).id || "",
            name: raw.name || "Item",
            slug: raw.slug || "dish",
            price: Number(raw.price) || 0,
            basePrice: Number(raw.basePrice ?? raw.price) || 0,
            quantity: Math.max(1, maybeQty || 1),
            imageUrl: raw.imageUrl,
            categorySlug: raw.categorySlug,
            customizations: maybeCustomizations || raw.customizations,
          };
        } else {
          const raw = itemOrCartItem as Omit<CartItem, "id">;
          finalItem = {
            ...raw,
            quantity: Math.max(1, Number(raw.quantity) || 1),
          };
        }

        const compositeId = generateCartItemKey(finalItem.menuItemId, finalItem.customizations);
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === compositeId);

        let updatedItems: CartItem[];
        if (existingIndex > -1 && currentItems[existingIndex]) {
          const existingItem = currentItems[existingIndex]!;
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: Math.min(20, existingItem.quantity + finalItem.quantity),
          };
        } else {
          updatedItems = [...currentItems, { ...finalItem, id: compositeId }];
        }

        set({ items: updatedItems });
        notifyCartChange();
      },

      removeItem: (cartItemId: string) => {
        set({ items: get().items.filter((i) => i.id !== cartItemId) });
        notifyCartChange();
      },

      updateQuantity: (cartItemId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        const clampedQty = Math.min(20, Math.max(1, qty));
        set({
          items: get().items.map((i) => (i.id === cartItemId ? { ...i, quantity: clampedQty } : i)),
        });
        notifyCartChange();
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
        notifyCartChange();
      },

      setDeliverySlot: (slot: DeliverySlot) => {
        set({ deliverySlot: slot });
        notifyCartChange();
      },

      setDeliveryDate: (date: string) => {
        set({ deliveryDate: date });
        notifyCartChange();
      },

      applyCoupon: (code: string) => {
        const normalized = code.trim().toUpperCase();
        if (normalized === "HEALTHY10") {
          set({ appliedCoupon: { code: "HEALTHY10", discountPercent: 10 } });
          notifyCartChange();
          return { success: true, message: "10% discount applied to your order!" };
        }
        if (normalized === "FIRSTBOWL") {
          set({ appliedCoupon: { code: "FIRSTBOWL", discountAmount: 100 } });
          notifyCartChange();
          return { success: true, message: "₹100 discount applied to your order!" };
        }
        if (normalized === "PUNEWELLNESS") {
          set({ appliedCoupon: { code: "PUNEWELLNESS", discountPercent: 15 } });
          notifyCartChange();
          return { success: true, message: "15% Pune Wellness discount applied!" };
        }
        return {
          success: false,
          message: "Invalid or expired coupon code. Try HEALTHY10 or FIRSTBOWL.",
        };
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
        notifyCartChange();
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
          0,
        );
      },

      getDiscount: () => {
        const sub = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon || sub <= 0) return 0;
        if (coupon.discountAmount) return Math.min(coupon.discountAmount, sub);
        if (coupon.discountPercent) return Math.round((sub * coupon.discountPercent) / 100);
        return 0;
      },

      getDeliveryFee: () => {
        const sub = get().getSubtotal();
        if (sub === 0) return 0;
        return sub >= 500 ? 0 : 49; // Free over ₹500, else ₹49
      },

      getTax: () => {
        const taxable = Math.max(0, get().getSubtotal() - get().getDiscount());
        return Math.round(taxable * 0.05); // 5% GST tax on healthy prepared food
      },

      getTotal: () => {
        const sub = get().getSubtotal();
        if (sub === 0) return 0;
        const discount = get().getDiscount();
        const deliveryFee = get().getDeliveryFee();
        const tax = get().getTax();
        return Math.max(0, sub - discount + deliveryFee + tax);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);

// Bidirectional synchronization with external storage / cart-change events
if (typeof window !== "undefined") {
  const syncWithExternal = (e?: StorageEvent | Event) => {
    if (e && "key" in e && (e as StorageEvent).key !== STORAGE_KEY) {
      return;
    }
    useCartStore.persist?.rehydrate?.();
  };

  window.addEventListener("storage", syncWithExternal);
  window.addEventListener("cart-change", syncWithExternal);
}

/**
 * React 19 Hydration-Safe Hook for Cart State
 * Prevents SSR mismatch when reading localStorage-backed Zustand store.
 */
export function useCartClient<T>(selector: (state: CartState) => T, fallback: T): T {
  const [isHydrated, setIsHydrated] = useState(false);
  const selected = useCartStore(selector);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? selected : fallback;
}

/**
 * Hook to check if the cart store has completed client-side hydration.
 */
export function useCartHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  return isHydrated;
}
