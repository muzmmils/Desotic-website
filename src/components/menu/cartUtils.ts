/**
 * Shared Cart utilities for Infinite Healthy Yumm
 * Provides persistent local storage matching Zustand persist schema ('ihy-cart-storage')
 * and reactive window events ('cart-change') for immediate SiteHeader synchronization.
 */

export interface SelectedCustomizations {
  dressing?: string | undefined;
  spiceLevel?: string | undefined;
  milkBase?: string | undefined;
  grainBase?: string | undefined;
  options?: Record<string, string> | undefined; // Dynamic single-choice options (e.g. protein_boost, packaging, temperature)
  addons?: Array<{ id: string; name: string; price: number }> | undefined;
  notes?: string | undefined;
}

export type CartItemCustomizations = SelectedCustomizations;

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

export interface CartStorageState {
  state: {
    items: CartItem[];
    deliverySlot: "morning" | "afternoon" | "evening";
    deliveryDate: string;
    appliedCoupon: {
      code: string;
      discountPercent?: number | undefined;
      discountAmount?: number | undefined;
    } | null;
  };
  version: number;
}

const STORAGE_KEY = "ihy-cart-storage";

function getEmptyCartState(): CartStorageState {
  return {
    state: {
      items: [],
      deliverySlot: "morning",
      deliveryDate: new Date().toISOString().split("T")[0] ?? "2026-09-12",
      appliedCoupon: null,
    },
    version: 0,
  };
}

export function getCartState(): CartStorageState {
  if (typeof window === "undefined") {
    return getEmptyCartState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyCartState();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.state && Array.isArray(parsed.state.items)) {
      return parsed as CartStorageState;
    }
    return getEmptyCartState();
  } catch {
    return getEmptyCartState();
  }
}

export function getCartCount(): number {
  const cart = getCartState();
  return cart.state.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

/**
 * Generates a unique line-item key based on menuItemId and chosen customizations.
 * Deterministically incorporates dynamic options (e.g. protein scoops, packaging, etc.),
 * specific add-ons, and kitchen notes so distinct customer preferences never collide.
 */
export function generateCartItemKey(
  menuItemId: string,
  customizations?: SelectedCustomizations | CartItemCustomizations,
): string {
  if (!customizations) {
    return `${menuItemId}-default`;
  }

  const parts: Record<string, unknown> = {};

  if (customizations.dressing) parts["dressing"] = customizations.dressing;
  if (customizations.spiceLevel) parts["spiceLevel"] = customizations.spiceLevel;
  if (customizations.milkBase) parts["milkBase"] = customizations.milkBase;
  if (customizations.grainBase) parts["grainBase"] = customizations.grainBase;

  if (customizations.options && Object.keys(customizations.options).length > 0) {
    const sortedOptions: Record<string, string> = {};
    for (const key of Object.keys(customizations.options).sort()) {
      const val = customizations.options[key];
      if (val) sortedOptions[key] = val;
    }
    if (Object.keys(sortedOptions).length > 0) {
      parts["options"] = sortedOptions;
    }
  }

  if (customizations.addons && customizations.addons.length > 0) {
    parts["addons"] = [...customizations.addons].map((a) => a.id).sort();
  }

  if (customizations.notes && customizations.notes.trim()) {
    parts["notes"] = customizations.notes.trim();
  }

  const customKey = Object.keys(parts).length > 0 ? JSON.stringify(parts) : "default";
  return `${menuItemId}-${customKey}`;
}

export function addToCart(item: Omit<CartItem, "id">): { success: boolean; itemCount: number } {
  if (typeof window === "undefined") {
    return { success: false, itemCount: 0 };
  }

  try {
    const cart = getCartState();
    const compositeId = generateCartItemKey(item.menuItemId, item.customizations);

    const existingIndex = cart.state.items.findIndex((i) => i.id === compositeId);

    const existingItem = existingIndex > -1 ? cart.state.items[existingIndex] : undefined;
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.state.items.push({
        ...item,
        id: compositeId,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

    // Dispatch events for SiteHeader and other listeners
    window.dispatchEvent(new Event("cart-change"));
    window.dispatchEvent(new Event("storage"));

    const count = cart.state.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

    return { success: true, itemCount: count };
  } catch (err) {
    console.error("Failed to add item to cart:", err);
    return { success: false, itemCount: 0 };
  }
}
