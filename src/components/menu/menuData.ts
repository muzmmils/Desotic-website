import type { MockMenuItem } from "@/lib/mockData";

export interface CustomizationOptionChoice {
  id: string;
  label: string;
  price: number;
}

export interface MenuItemCustomizationOption {
  id: string;
  name: string;
  type: "single_choice" | "multi_choice" | "text";
  required?: boolean;
  options?: CustomizationOptionChoice[];
  placeholder?: string;
}

export interface MenuItem extends MockMenuItem {
  ingredients: string[];
  prep_time_minutes: number;
  customization_options: MenuItemCustomizationOption[];
  allergens: string[];
}

export const CATEGORY_DEFAULTS: Record<
  string,
  {
    prep_time_minutes: number;
    allergens: string[];
    customization_options: MenuItemCustomizationOption[];
  }
> = {
  salads: {
    prep_time_minutes: 15,
    allergens: ["Sesame seeds (in house tahini)", "Tree nuts (processed in shared facility)"],
    customization_options: [
      {
        id: "dressing",
        name: "Choice of House Dressing",
        type: "single_choice",
        required: true,
        options: [
          { id: "lemon_tahini", label: "Lemon Herb Tahini (House)", price: 0 },
          { id: "tamari_ginger", label: "Tamari Ginger Vinaigrette", price: 0 },
          { id: "balsamic_herb", label: "Cold-Pressed Balsamic Herb", price: 0 },
          { id: "avocado_lime", label: "Avocado Lime Crema", price: 20 },
        ],
      },
      {
        id: "addons",
        name: "Protein & Superfood Add-ons",
        type: "multi_choice",
        required: false,
        options: [
          { id: "extra_tofu", label: "Extra Smoked Tofu (60g)", price: 50 },
          { id: "extra_paneer", label: "Grilled Artisanal Paneer (70g)", price: 60 },
          { id: "extra_avocado", label: "Half Sliced Hass Avocado", price: 45 },
          { id: "superseed_mix", label: "Roasted Pumpkin & Chia Seeds", price: 25 },
        ],
      },
      {
        id: "spice_level",
        name: "Spice Level",
        type: "single_choice",
        required: false,
        options: [
          { id: "mild", label: "Mild", price: 0 },
          { id: "medium", label: "Medium", price: 0 },
          { id: "spicy", label: "Spicy", price: 0 },
        ],
      },
      {
        id: "notes",
        name: "Special Instructions",
        type: "text",
        required: false,
        placeholder: "e.g. dressing on the side, no raw onions",
      },
    ],
  },
  juices: {
    prep_time_minutes: 8,
    allergens: ["None (100% natural, allergen-free cold-press facility)"],
    customization_options: [
      {
        id: "temperature",
        name: "Serving Temperature",
        type: "single_choice",
        required: true,
        options: [
          { id: "chilled", label: "Chilled (No added ice)", price: 0 },
          { id: "light_ice", label: "Light Ice", price: 0 },
          { id: "room_temp", label: "Room Temperature", price: 0 },
        ],
      },
      {
        id: "boosters",
        name: "Immunity & Superfood Boosters",
        type: "multi_choice",
        required: false,
        options: [
          { id: "chia_seeds", label: "Organic Chia Seeds", price: 20 },
          { id: "wheatgrass", label: "Cold-Pressed Wheatgrass Shot", price: 35 },
          { id: "extra_ginger", label: "Extra Himalayan Ginger Shot", price: 20 },
        ],
      },
    ],
  },
  "protein-shakes": {
    prep_time_minutes: 8,
    allergens: ["Tree nuts (Almonds)"],
    customization_options: [
      {
        id: "milk_base",
        name: "Choice of Milk Base",
        type: "single_choice",
        required: true,
        options: [
          { id: "almond_milk", label: "Unsweetened Almond Milk", price: 0 },
          { id: "oat_milk", label: "Creamy Oat Milk", price: 25 },
          { id: "coconut_water", label: "Tender Coconut Water", price: 0 },
          { id: "soy_milk", label: "Organic Soy Milk", price: 0 },
        ],
      },
      {
        id: "protein_boost",
        name: "Protein Booster",
        type: "single_choice",
        required: false,
        options: [
          { id: "standard", label: "Standard Scoop (26–28g)", price: 0 },
          { id: "double", label: "Double Scoop (+15g Protein)", price: 65 },
        ],
      },
      {
        id: "boosters",
        name: "Nutrient Add-ons",
        type: "multi_choice",
        required: false,
        options: [
          { id: "peanut_butter", label: "Pure Roasted Peanut Butter", price: 30 },
          { id: "chia_flax", label: "Chia & Flax Seed Blend", price: 20 },
        ],
      },
    ],
  },
  "protein-meals": {
    prep_time_minutes: 18,
    allergens: ["Dairy (in Paneer dishes)", "Tree nuts (Walnuts in Oatmeal)"],
    customization_options: [
      {
        id: "grain_base",
        name: "Choice of Grain Base",
        type: "single_choice",
        required: true,
        options: [
          { id: "brown_rice", label: "Spiced Brown Basmati Rice", price: 0 },
          { id: "quinoa", label: "Tri-Color Organic Quinoa", price: 40 },
          { id: "cauliflower_rice", label: "Keto Cauliflower Rice", price: 35 },
        ],
      },
      {
        id: "extra_protein",
        name: "Extra Protein Options",
        type: "multi_choice",
        required: false,
        options: [
          { id: "extra_paneer", label: "Extra Grilled Paneer (60g)", price: 60 },
          { id: "extra_tofu", label: "Steamed Organic Tofu (60g)", price: 50 },
          { id: "extra_avocado", label: "Half Hass Avocado", price: 45 },
        ],
      },
      {
        id: "spice_level",
        name: "Spice Level",
        type: "single_choice",
        required: false,
        options: [
          { id: "mild", label: "Mild", price: 0 },
          { id: "medium", label: "Medium", price: 0 },
          { id: "spicy", label: "Spicy", price: 0 },
        ],
      },
    ],
  },
  "healthy-snacks": {
    prep_time_minutes: 5,
    allergens: ["Tree nuts (Almonds, Cashews)", "Sesame"],
    customization_options: [
      {
        id: "packaging",
        name: "Packaging Style",
        type: "single_choice",
        required: false,
        options: [
          { id: "standard", label: "Eco Kraft Pouch", price: 0 },
          { id: "gift_box", label: "Premium Glass Jar Gift Box", price: 30 },
        ],
      },
    ],
  },
  desserts: {
    prep_time_minutes: 5,
    allergens: ["Tree nuts (Pistachios, Almonds)"],
    customization_options: [
      {
        id: "toppings",
        name: "Gourmet Topping Selection",
        type: "multi_choice",
        required: false,
        options: [
          { id: "pistachio_crumb", label: "Roasted Pistachio Crumb", price: 0 },
          { id: "cacao_nibs", label: "Ecuadorian Cacao Nibs", price: 20 },
        ],
      },
    ],
  },
};

export const ITEM_INGREDIENTS_MAP: Record<string, string[]> = {
  "mediterranean-power-bowl": [
    "Organic Tricolor Quinoa",
    "Spiced Roasted Chickpeas",
    "Hydroponic Baby Cucumber",
    "Vine Cherry Tomatoes",
    "Kalamata Olives",
    "Organic Baby Spinach",
    "Pickled Red Onions",
    "House Lemon Herb Tahini",
  ],
  "smoked-tofu-edamame-crunch": [
    "Artisanal Smoked Tofu (60g)",
    "Organic Shelled Edamame",
    "Shredded Purple Cabbage",
    "Toasted White & Black Sesame Seeds",
    "Crisp Romaine Lettuce",
    "Tamari Ginger Vinaigrette",
  ],
  "avocado-quinoa-garden-feast": [
    "Fresh Hass Avocado (Half)",
    "Fluffy Tri-Color Quinoa",
    "Tender Baby Spinach Leaves",
    "Roasted Sunflower Seeds",
    "Pomegranate Pearls",
    "Cold-Pressed Olive Lemon Dressing",
  ],
  "ruby-glow-cold-pressed": [
    "Fresh Nagpur Beetroot",
    "Crisp Himachal Apples",
    "Mountain Carrots",
    "Valencia Orange",
    "Cold-Pressed Himalayan Ginger",
  ],
  "emerald-detox-elixir": [
    "Hydroponic Baby Spinach",
    "Crisp Celery Ribs",
    "Green Himachal Apples",
    "Local Cucumber",
    "Fresh Garden Mint",
    "Cold-Pressed Lime",
  ],
  "golden-immunity-booster": [
    "Fresh Raw Turmeric Root",
    "Pure Ginger Extract",
    "Sweet Pineapple",
    "Black Pepper Bio-Enhancer",
    "Valencia Orange",
  ],
  "golden-immunity-juice": [
    "Fresh Raw Turmeric Root",
    "Pure Ginger Extract",
    "Sweet Pineapple",
    "Black Pepper Bio-Enhancer",
    "Valencia Orange",
  ],
  "dark-chocolate-fuel-shake": [
    "Raw Ecuadorian Cacao Nibs",
    "Plant Pea Protein Isolate (28g)",
    "Unsweetened Almond Milk",
    "Organic Chia Seeds",
    "Medjool Dates",
    "Natural Vanilla Bean",
  ],
  "berry-nitro-recovery": [
    "Wild Blueberries",
    "Organic Raspberries",
    "Plant Protein Isolate (26g)",
    "Tender Coconut Water",
    "Roasted Flax Seeds",
    "Pure Agave Nectar",
  ],
  "herb-roasted-paneer-power-bowl": [
    "Artisanal Grilled Paneer (80g)",
    "Spiced Brown Basmati Rice",
    "Steamed Broccoli Florets",
    "Charred Sweet Corn",
    "Creamy Sesame Tahini Sauce",
    "Fresh Microgreens",
  ],
  "berry-nut-seed-power-oatmeal": [
    "Slow-Cooked Rolled Oats",
    "Crushed Kashmiri Walnuts",
    "Roasted Pumpkin Seeds",
    "Organic Chia Seeds",
    "Wild Blueberries",
    "Raw Forest Honey",
  ],
  "lentil-sweet-potato-protein-hash": [
    "Beluga Lentils",
    "Roasted Sweet Potatoes",
    "Sauteed Baby Kale",
    "Garlic Turmeric Hummus",
    "Toasted Pumpkin Seeds",
  ],
  "raw-superseed-energy-truffles": [
    "Roasted Pumpkin Seeds",
    "Organic Chia Seeds",
    "Rolled Oats",
    "Cold-Pressed Coconut Oil",
    "Raw Agave Nectar",
    "70% Dark Chocolate Drizzle",
  ],
  "raw-superseed-energy-bites": [
    "Roasted Pumpkin Seeds",
    "Organic Chia Seeds",
    "Rolled Oats",
    "Cold-Pressed Coconut Oil",
    "Raw Agave Nectar",
    "70% Dark Chocolate Drizzle",
  ],
  "avocado-cacao-silk-mousse": [
    "Whipped Ripe Hass Avocado",
    "Pure Organic Raw Cacao",
    "100% Grade-A Maple Syrup",
    "Crushed Roasted Pistachios",
    "Sea Salt Flakes",
  ],
  "avocado-cacao-mousse-cup": [
    "Whipped Ripe Hass Avocado",
    "Pure Organic Raw Cacao",
    "100% Grade-A Maple Syrup",
    "Crushed Roasted Pistachios",
    "Sea Salt Flakes",
  ],
};

export function enrichMenuItem(raw: MockMenuItem & Partial<MenuItem>): MenuItem {
  const defaultCategory = CATEGORY_DEFAULTS["salads"] ?? {
    prep_time_minutes: 15,
    allergens: [],
    customization_options: [],
  };
  const catDefaults =
    (raw.category_slug ? CATEGORY_DEFAULTS[raw.category_slug] : undefined) ?? defaultCategory;
  const ingredients =
    raw.ingredients && raw.ingredients.length > 0
      ? raw.ingredients
      : ((raw.slug ? ITEM_INGREDIENTS_MAP[raw.slug] : undefined) ?? [
          "Fresh organic ingredients",
          "Cold-pressed oils",
          "Chef curated seasonings",
        ]);

  const customizationOptions =
    raw.customization_options && raw.customization_options.length > 0
      ? raw.customization_options
      : catDefaults.customization_options;

  const allergens =
    raw.allergens && raw.allergens.length > 0 ? raw.allergens : catDefaults.allergens;

  const prepTime = raw.prep_time_minutes ?? catDefaults.prep_time_minutes;

  return {
    ...raw,
    ingredients,
    customization_options: customizationOptions,
    allergens,
    prep_time_minutes: prepTime,
  };
}
