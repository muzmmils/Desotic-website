import { SALAD_IMAGE, JUICE_IMAGE, OATMEAL_IMAGE } from "./placeholders";

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  sort_order: number;
}

export interface MockMenuItem {
  id: string;
  category_id: string;
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_available: boolean;
  tags: string[];
  sort_order: number;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: "cat-1",
    name: "Salads",
    slug: "salads",
    emoji: "🥗",
    description: "Farm fresh greens and power bowls",
    sort_order: 1,
  },
  {
    id: "cat-2",
    name: "Juices",
    slug: "juices",
    emoji: "🧃",
    description: "Pure cold-pressed elixirs with no added sugar",
    sort_order: 2,
  },
  {
    id: "cat-3",
    name: "Protein Shakes",
    slug: "protein-shakes",
    emoji: "💪",
    description: "Post-workout recovery & 25g+ protein fuel",
    sort_order: 3,
  },
  {
    id: "cat-4",
    name: "Protein Meals",
    slug: "protein-meals",
    emoji: "🍽️",
    description: "Warm balanced macro meals made to order",
    sort_order: 4,
  },
  {
    id: "cat-5",
    name: "Healthy Snacks",
    slug: "healthy-snacks",
    emoji: "🍪",
    description: "Nutritious roasted bites & seed snacks",
    sort_order: 5,
  },
  {
    id: "cat-6",
    name: "Desserts",
    slug: "desserts",
    emoji: "🍫",
    description: "Guilt-free raw cacao and chia puddings",
    sort_order: 6,
  },
];

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  {
    id: "item-1",
    category_id: "cat-1",
    category_slug: "salads",
    name: "Mediterranean Power Bowl",
    slug: "mediterranean-power-bowl",
    description:
      "Organic tricolor quinoa, spiced chickpeas, baby cucumber, cherry tomatoes, kalamata olives, and fresh lemon-herb dressing.",
    price: 299,
    image_url: SALAD_IMAGE,
    calories: 380,
    protein_g: 18.5,
    carbs_g: 42.0,
    fat_g: 14.0,
    fiber_g: 9.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["High Protein", "Gluten Free", "Chef Special"],
    sort_order: 1,
  },
  {
    id: "item-2",
    category_id: "cat-1",
    category_slug: "salads",
    name: "Smoked Tofu & Edamame Crunch",
    slug: "smoked-tofu-edamame-crunch",
    description:
      "Crispy house-smoked tofu, organic edamame, shredded purple cabbage, sesame seed crust, and tamari ginger vinaigrette.",
    price: 329,
    image_url: SALAD_IMAGE,
    calories: 410,
    protein_g: 24.0,
    carbs_g: 31.0,
    fat_g: 16.0,
    fiber_g: 8.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["24g Protein", "Bestseller"],
    sort_order: 2,
  },
  {
    id: "item-3",
    category_id: "cat-1",
    category_slug: "salads",
    name: "Avocado Quinoa Garden Feast",
    slug: "avocado-quinoa-garden-feast",
    description:
      "Creamy Hass avocado slices, tri-color quinoa, crisp baby spinach, toasted sunflower seeds, and zesty lemon emulsion.",
    price: 349,
    image_url: SALAD_IMAGE,
    calories: 440,
    protein_g: 15.0,
    carbs_g: 38.0,
    fat_g: 22.0,
    fiber_g: 11.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["Heart Healthy", "Keto Friendly"],
    sort_order: 3,
  },
  {
    id: "item-4",
    category_id: "cat-2",
    category_slug: "juices",
    name: "Ruby Glow Cold-Pressed",
    slug: "ruby-glow-cold-pressed",
    description:
      "Raw beetroot, organic crisp apples, fresh mountain carrot, valencia orange, and cold-pressed ginger root.",
    price: 189,
    image_url: JUICE_IMAGE,
    calories: 140,
    protein_g: 3.0,
    carbs_g: 32.0,
    fat_g: 0.5,
    fiber_g: 4.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["Detox", "Cold-Pressed", "Zero Sugar"],
    sort_order: 1,
  },
  {
    id: "item-5",
    category_id: "cat-2",
    category_slug: "juices",
    name: "Emerald Detox Elixir",
    slug: "emerald-detox-elixir",
    description:
      "Hydroponic baby spinach, crisp celery, green apple, local cucumber, fresh mint, and lime spritz.",
    price: 199,
    image_url: JUICE_IMAGE,
    calories: 110,
    protein_g: 2.5,
    carbs_g: 24.0,
    fat_g: 0.5,
    fiber_g: 3.5,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["Low Calorie", "Alkaline"],
    sort_order: 2,
  },
  {
    id: "item-6",
    category_id: "cat-2",
    category_slug: "juices",
    name: "Golden Immunity Booster",
    slug: "golden-immunity-booster",
    description:
      "Fresh raw turmeric, ginger juice, sweet pineapple, black pepper bio-enhancer, and valencia orange.",
    price: 179,
    image_url: JUICE_IMAGE,
    calories: 130,
    protein_g: 2.0,
    carbs_g: 29.0,
    fat_g: 0.5,
    fiber_g: 2.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["Immunity", "Anti-inflammatory"],
    sort_order: 3,
  },
  {
    id: "item-7",
    category_id: "cat-3",
    category_slug: "protein-shakes",
    name: "Dark Chocolate Fuel Shake",
    slug: "dark-chocolate-fuel-shake",
    description:
      "Raw Ecuadorian cacao nibs, plant protein isolate, unsweetened almond milk, chia seeds, and whole medjool dates.",
    price: 259,
    image_url: JUICE_IMAGE,
    calories: 310,
    protein_g: 28.0,
    carbs_g: 26.0,
    fat_g: 8.0,
    fiber_g: 6.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["28g Protein", "Post-Workout"],
    sort_order: 1,
  },
  {
    id: "item-8",
    category_id: "cat-4",
    category_slug: "protein-meals",
    name: "Herb-Roasted Paneer Power Bowl",
    slug: "herb-roasted-paneer-power-bowl",
    description:
      "Artisanal grilled paneer cubes, spiced brown basmati rice, steamed broccoli florets, and creamy sesame tahini dressing.",
    price: 349,
    image_url: OATMEAL_IMAGE,
    calories: 480,
    protein_g: 27.0,
    carbs_g: 45.0,
    fat_g: 19.0,
    fiber_g: 7.5,
    is_vegan: false,
    is_gluten_free: true,
    is_available: true,
    tags: ["High Protein", "Vegetarian", "Hearty"],
    sort_order: 1,
  },
  {
    id: "item-9",
    category_id: "cat-4",
    category_slug: "protein-meals",
    name: "Berry Nut & Seed Power Oatmeal",
    slug: "berry-nut-seed-power-oatmeal",
    description:
      "Slow-cooked rolled oats, crushed walnuts, chia and pumpkin seeds, wild blueberries, and raw honey drizzle.",
    price: 239,
    image_url: OATMEAL_IMAGE,
    calories: 360,
    protein_g: 14.0,
    carbs_g: 54.0,
    fat_g: 11.0,
    fiber_g: 8.5,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["All-Day Breakfast", "Fiber Rich"],
    sort_order: 2,
  },
  {
    id: "item-10",
    category_id: "cat-5",
    category_slug: "healthy-snacks",
    name: "Raw Superseed Energy Truffles",
    slug: "raw-superseed-energy-truffles",
    description:
      "Pumpkin seeds, organic chia, rolled oats, agave nectar, and raw dark chocolate drizzle (3 pieces).",
    price: 149,
    image_url: OATMEAL_IMAGE,
    calories: 210,
    protein_g: 8.0,
    carbs_g: 22.0,
    fat_g: 9.0,
    fiber_g: 5.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["Grab & Go", "Clean Energy"],
    sort_order: 1,
  },
  {
    id: "item-11",
    category_id: "cat-6",
    category_slug: "desserts",
    name: "Avocado Cacao Silk Mousse",
    slug: "avocado-cacao-silk-mousse",
    description:
      "Whipped ripe Hass avocado, pure organic cacao, Canadian maple syrup, and crushed roasted pistachios.",
    price: 189,
    image_url: OATMEAL_IMAGE,
    calories: 230,
    protein_g: 5.0,
    carbs_g: 18.0,
    fat_g: 14.0,
    fiber_g: 6.0,
    is_vegan: true,
    is_gluten_free: true,
    is_available: true,
    tags: ["Sugar Free", "Vegan", "Guilt Free"],
    sort_order: 1,
  },
];

export interface MockSubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_quarterly: number;
  meals_per_week: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export const MOCK_SUBSCRIPTION_PLANS: MockSubscriptionPlan[] = [
  {
    id: "plan-starter",
    name: "Starter Health Routine",
    slug: "starter-plan",
    description: "Ideal for light weeks, office lunches, or easing into mindful clean eating.",
    price_monthly: 2499,
    price_quarterly: 6749, // 10% discount
    meals_per_week: 3,
    features: [
      "3 chef-crafted power meals / salads per week",
      "Free temperature-controlled insulated delivery",
      "Full menu freedom — swap items anytime",
      "Weekly rotating seasonal greens",
      "Pause or skip delivery with 1 tap",
    ],
    is_popular: false,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "plan-power",
    name: "Weekday Power Plan",
    slug: "power-plan",
    description:
      "Our signature plan: complete Monday-to-Friday high-protein lunch & macro nutrition.",
    price_monthly: 3999,
    price_quarterly: 10799, // 10% discount
    meals_per_week: 5,
    features: [
      "5 fresh meals every weekday (Mon – Fri)",
      "Priority 12:00 PM – 1:00 PM lunch delivery slot",
      "Complimentary cold-pressed wellness juice weekly",
      "Complete macro tracking & calorie breakdowns",
      "Flexible pause up to 30 days anytime",
      "Direct WhatsApp meal customization manager",
    ],
    is_popular: true,
    is_active: true,
    sort_order: 2,
  },
  {
    id: "plan-ultimate",
    name: "Ultimate Wellness 360°",
    slug: "ultimate-lifestyle",
    description:
      "Full daily nutrition for athletes, founders, and health enthusiasts who want zero kitchen hassle.",
    price_monthly: 5999,
    price_quarterly: 15999, // ~12% discount
    meals_per_week: 7,
    features: [
      "7 days comprehensive meal coverage",
      "2 cold-pressed juices & snack packs weekly",
      "VIP express courier delivery to home or office",
      "Quarterly one-on-one nutrition consultation",
      "Exclusive seasonal secret menu item unlocks",
      "Dedicated concierge support 7 days/week",
    ],
    is_popular: false,
    is_active: true,
    sort_order: 3,
  },
];
