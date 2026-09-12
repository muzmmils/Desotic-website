import { useState, useCallback, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Leaf,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowRight,
  Utensils,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { useMenuItem } from "@/queries/useMenuItem";
import { useMenuItems } from "@/queries/useMenuItems";
import { NutritionVisualizer } from "@/components/menu/NutritionVisualizer";
import { CustomizationSelector } from "@/components/menu/CustomizationSelector";
import { MenuCard } from "@/components/menu/MenuCard";
import { addToCart, type SelectedCustomizations } from "@/components/menu/cartUtils";

function titleize(slug: string) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/menu/$itemId")({
  head: ({ params }) => {
    const name = titleize(params.itemId);
    const title = `${name} — Fresh & Healthy Nutrition | Infinite Healthy Yumm`;
    const description = `Freshly handcrafted ${name} at Infinite Healthy Yumm in Moshi, Pune. Explore verified nutrition facts, calories, clean organic ingredients, dietary certifications, and customizations.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `${BASE_URL}/menu/${params.itemId}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: `${BASE_URL}/menu/${params.itemId}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MenuItem",
            name,
            description,
            url: `${BASE_URL}/menu/${params.itemId}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { itemId } = Route.useParams();
  const { data: item, isLoading, isError } = useMenuItem(itemId);

  // Customization state
  const [customizations, setCustomizations] = useState<SelectedCustomizations>({});
  const [extraPrice, setExtraPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  const handleCustomizationChange = useCallback(
    (newCustomizations: SelectedCustomizations, calculatedExtra: number) => {
      setCustomizations(newCustomizations);
      setExtraPrice(calculatedExtra);
    },
    [],
  );

  // Fetch complementary paired dishes
  const { data: relatedItems = [] } = useMenuItems(item?.category_slug || "all");

  const pairedDishes = useMemo(() => {
    if (!item) return [];
    return relatedItems.filter((i) => i.id !== item.id && i.slug !== item.slug).slice(0, 3);
  }, [relatedItems, item]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-8">
          <div className="h-6 w-48 rounded bg-muted/60" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="aspect-square w-full rounded-3xl bg-muted/60" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 rounded bg-muted/60" />
              <div className="h-6 w-1/4 rounded bg-muted/60" />
              <div className="h-24 w-full rounded bg-muted/40" />
              <div className="h-40 w-full rounded bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen bg-background px-4 py-20 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card/40 p-10 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-3xl">
            🥣
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Dish Not Found</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            The dish you are looking for ({itemId}) is not available on our current seasonal menu.
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Utensils className="h-4 w-4" />
            Browse Full Menu
          </Link>
        </div>
      </div>
    );
  }

  const unitPrice = item.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      menuItemId: item.id,
      name: item.name,
      slug: item.slug,
      price: unitPrice,
      basePrice: item.price,
      quantity,
      imageUrl: item.image_url,
      categorySlug: item.category_slug,
      customizations,
    });

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2000);
  };

  const categoryDisplayName = item.category_slug.replace("-", " ");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-border/40 bg-surface/30 px-4 py-3 md:px-8"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link to="/menu" className="hover:text-foreground transition-colors">
            Menu
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="capitalize text-muted-foreground">{categoryDisplayName}</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {item.name}
          </span>
        </div>
      </nav>

      {/* Main Product Showcase Section */}
      <main className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Product Imagery and Nutritional Breakdown (7 cols) */}
          <div className="space-y-8 lg:col-span-7">
            {/* Hero Image Showcase */}
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-xl shadow-black/10">
              <img
                src={item.image_url}
                alt={item.name}
                className="aspect-4/3 w-full object-cover transition-transform duration-700 hover:scale-102"
              />

              {/* Overlay Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-foreground shadow-md backdrop-blur-md">
                  <span className="capitalize">{categoryDisplayName}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Made Fresh to Order
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-background/85 px-4 py-2.5 backdrop-blur-md border border-border/50">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Prep time:{" "}
                  <strong className="text-foreground">{item.prep_time_minutes} mins</strong>
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Leaf className="h-4 w-4 text-emerald-400" />
                  100% Clean Ingredients
                </span>
              </div>
            </div>

            {/* Interactive Nutritional Facts Visualizer */}
            <NutritionVisualizer
              calories={item.calories}
              proteinG={item.protein_g}
              carbsG={item.carbs_g}
              fatG={item.fat_g}
              fiberG={item.fiber_g}
            />

            {/* Full List of Ingredients */}
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span>Fresh Farm Ingredients</span>
                </h3>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.ingredients.length} wholesome ingredients
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Sourced fresh daily from local regenerative farmers in Pune and Maharashtra.
                Handpicked, washed with ozone filtration, and prepared preservative-free.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Dietary Certifications & Allergen Disclosures */}
            <div className="space-y-3">
              {/* Dietary Tags Row */}
              <div className="flex flex-wrap gap-2">
                {item.is_vegan && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                    🌱 100% Plant-Based / Vegan
                  </div>
                )}
                {item.is_gluten_free && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400">
                    🌾 Certified Gluten-Free
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  🛡️ Zero Refined Sugar
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400">
                  ⚡ Micro-Filtered Ozone Wash
                </div>
              </div>

              {/* Allergen Disclosure Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
                <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">
                    Allergen Information & Kitchen Notice
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    Contains:{" "}
                    <strong className="text-foreground">
                      {item.allergens && item.allergens.length > 0
                        ? item.allergens.join(", ")
                        : "No major allergens declared"}
                    </strong>
                    . Prepared in an artisanal health kitchen that handles tree nuts, sesame, and
                    seeds. If you have severe anaphylactic allergies, please inform our kitchen team
                    via WhatsApp prior to ordering.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Customizations & Sticky Checkout Box (5 cols) */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
            {/* Header Details */}
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary capitalize">
                  {categoryDisplayName}
                </span>
                <span className="text-xs text-muted-foreground">SKU: {item.slug}</span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {item.name}
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              {/* Price Row */}
              <div className="mt-5 flex items-baseline gap-3 border-t border-border/30 pt-4">
                <div className="text-3xl font-black text-foreground">₹{unitPrice}</div>
                {extraPrice > 0 && (
                  <span className="text-xs text-muted-foreground">
                    (Base: ₹{item.price} + Add-ons: ₹{extraPrice})
                  </span>
                )}
              </div>
            </div>

            {/* Customization Selector Engine */}
            {item.customization_options && item.customization_options.length > 0 && (
              <div className="rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>Personalize Your Dish</span>
                </h3>
                <CustomizationSelector
                  options={item.customization_options}
                  onChange={handleCustomizationChange}
                />
              </div>
            )}

            {/* Quantity Stepper & Add to Cart Action */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card to-surface p-6 shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-foreground">Quantity</span>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="flex items-baseline justify-between border-t border-border/40 py-3 text-sm">
                <span className="text-xs text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-black text-foreground">₹{totalPrice}</span>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition-all duration-300 shadow-lg cursor-pointer ${
                  addedFeedback
                    ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-98"
                    : "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 active:scale-98"
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart • ₹{totalPrice}
                  </>
                )}
              </button>

              {/* Feedback Alert with Link to Cart */}
              {addedFeedback && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/15 px-4 py-2 text-xs text-emerald-400 border border-emerald-500/30 animate-fade-in">
                  <span>✓ Added {quantity} item(s) to cart</span>
                  <Link
                    to="/cart"
                    className="font-bold underline hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    View Cart <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              <p className="mt-4 text-[11px] text-center text-muted-foreground">
                🚀 Delivering across Moshi, PCMC & Pune with insulated temperature packaging.
              </p>
            </div>
          </div>
        </div>

        {/* Frequently Paired Dishes Section */}
        {pairedDishes.length > 0 && (
          <section className="mt-20 border-t border-border/40 pt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Frequently Paired With
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customers who enjoyed {item.name} also loved these healthy selections
                </p>
              </div>
              <Link
                to="/menu"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                View all dishes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pairedDishes.map((paired) => (
                <MenuCard key={paired.id} item={paired} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
