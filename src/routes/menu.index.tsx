import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, X, SlidersHorizontal, ArrowUpDown, RotateCcw, Sparkles } from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { useCategories } from "@/queries/useCategories";
import { useMenuItems, type MenuFilters } from "@/queries/useMenuItems";
import { MenuCard } from "@/components/menu/MenuCard";

const TITLE = "Curated Clean Menu — Infinite Healthy Yumm | Moshi, Pune";
const DESCRIPTION =
  "Explore fresh, calorie-counted, macro-balanced nutrition: salads, cold-pressed juices, high-protein shakes, wholesome meals, and guilt-free desserts crafted daily in Moshi, Pune.";

export const Route = createFileRoute("/menu/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${BASE_URL}/menu` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/menu` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Menu",
          name: "Infinite Healthy Yumm Menu",
          description: DESCRIPTION,
          url: `${BASE_URL}/menu`,
          hasMenuSection: [
            { "@type": "MenuSection", name: "Salads" },
            { "@type": "MenuSection", name: "Cold-Pressed Juices" },
            { "@type": "MenuSection", name: "Protein Shakes" },
            { "@type": "MenuSection", name: "Protein Meals" },
            { "@type": "MenuSection", name: "Healthy Snacks" },
            { "@type": "MenuSection", name: "Desserts" },
          ],
        }),
      },
    ],
  }),

  component: MenuCatalogPage,
});

function MenuCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isVegan, setIsVegan] = useState<boolean>(false);
  const [isGlutenFree, setIsGlutenFree] = useState<boolean>(false);
  const [isHighProtein, setIsHighProtein] = useState<boolean>(false);
  const [isLowCalorie, setIsLowCalorie] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<MenuFilters["sortBy"]>("recommended");

  // Fetch categories
  const { data: categories = [] } = useCategories();

  // Prepare query filter parameters
  const queryFilters: MenuFilters = useMemo(
    () => ({
      categorySlug: selectedCategory,
      searchQuery: searchQuery.trim(),
      isVegan: isVegan ? true : undefined,
      isGlutenFree: isGlutenFree ? true : undefined,
      minProtein: isHighProtein ? 20 : undefined,
      maxCalories: isLowCalorie ? 300 : undefined,
      sortBy,
    }),
    [selectedCategory, searchQuery, isVegan, isGlutenFree, isHighProtein, isLowCalorie, sortBy],
  );

  // Fetch menu items with reactive filters
  const { data: menuItems = [], isLoading, isError } = useMenuItems(queryFilters);

  // Total count of active items for "All" and per category
  const { data: allMenuItems = [] } = useMenuItems();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allMenuItems.length };
    for (const item of allMenuItems) {
      counts[item.category_slug] = (counts[item.category_slug] || 0) + 1;
    }
    return counts;
  }, [allMenuItems]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    isVegan ||
    isGlutenFree ||
    isHighProtein ||
    isLowCalorie ||
    sortBy !== "recommended";

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setIsVegan(false);
    setIsGlutenFree(false);
    setIsHighProtein(false);
    setIsLowCalorie(false);
    setSortBy("recommended");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-radial-[at_50%_0%] from-surface to-background px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Clean • Calorie Counted • Made to Order</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Our Fresh & Healthy Menu
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Every dish is handcrafted in Moshi, Pune using whole organic ingredients, zero refined
            sugars, and measured macronutrients to fuel your wellness goals.
          </p>

          {/* Search Input */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search salads, cold-pressed juices, protein bowls..."
                className="w-full rounded-2xl border border-border bg-card/80 py-3.5 pr-10 pl-11 text-sm text-foreground shadow-lg shadow-black/10 placeholder:text-muted-foreground/70 backdrop-blur-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filter & Sort Controls */}
      <section className="sticky top-16 z-30 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-8">
          {/* Category Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-surface/80 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/50"
              }`}
            >
              <span>🍽️</span>
              <span>All Dishes</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  selectedCategory === "all"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {categoryCounts["all"] || 0}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = categoryCounts[cat.slug] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-surface/80 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/50"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Dietary Pills & Sort Dropdown */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-3">
            {/* Dietary Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden text-xs font-semibold text-muted-foreground sm:inline-flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" /> Filter:
              </span>

              <button
                type="button"
                onClick={() => setIsVegan(!isVegan)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isVegan
                    ? "border border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                🌱 Vegan
              </button>

              <button
                type="button"
                onClick={() => setIsGlutenFree(!isGlutenFree)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isGlutenFree
                    ? "border border-amber-500 bg-amber-500/20 text-amber-400"
                    : "border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                🌾 Gluten-Free
              </button>

              <button
                type="button"
                onClick={() => setIsHighProtein(!isHighProtein)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isHighProtein
                    ? "border border-primary bg-primary/20 text-primary"
                    : "border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                💪 High-Protein (20g+)
              </button>

              <button
                type="button"
                onClick={() => setIsLowCalorie(!isLowCalorie)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isLowCalorie
                    ? "border border-sky-500 bg-sky-500/20 text-sky-400"
                    : "border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                🔥 Under 300 kcal
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as MenuFilters["sortBy"])}
                className="rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                aria-label="Sort dishes"
              >
                <option value="recommended">Featured & Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="calories_asc">Calories: Low to High</option>
                <option value="protein_desc">Protein: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <main className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-surface/40 px-4 py-2.5 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">
                Showing {menuItems.length} {menuItems.length === 1 ? "dish" : "dishes"}
              </span>

              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                  Query: "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              )}

              {isVegan && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[11px] font-medium">
                  Vegan
                  <button
                    type="button"
                    onClick={() => setIsVegan(false)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              )}

              {isGlutenFree && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[11px] font-medium">
                  Gluten-Free
                  <button
                    type="button"
                    onClick={() => setIsGlutenFree(false)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              )}

              {isHighProtein && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 text-primary px-2 py-0.5 text-[11px] font-medium">
                  20g+ Protein
                  <button
                    type="button"
                    onClick={() => setIsHighProtein(false)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              )}

              {isLowCalorie && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/20 text-sky-400 px-2 py-0.5 text-[11px] font-medium">
                  &lt;300 kcal
                  <button
                    type="button"
                    onClick={() => setIsLowCalorie(false)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-border/40 bg-card/40 p-4 space-y-4"
              >
                <div className="aspect-4/3 w-full rounded-xl bg-muted/60" />
                <div className="h-4 w-1/3 rounded bg-muted/60" />
                <div className="h-5 w-3/4 rounded bg-muted/60" />
                <div className="h-12 w-full rounded bg-muted/40" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-16 rounded bg-muted/60" />
                  <div className="h-8 w-24 rounded-xl bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center">
            <h3 className="text-base font-bold text-destructive">
              Unable to load menu catalog right now.
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Please check your connection or refresh the page.
            </p>
          </div>
        )}

        {/* Empty Filter State */}
        {!isLoading && !isError && menuItems.length === 0 && (
          <div className="my-12 rounded-3xl border border-border/60 bg-card/40 p-12 text-center backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-3xl">
              🥗
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">
              No matching healthy dishes found
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              We couldn't find any dishes matching your current search or filter combination. Try
              clearing filters or searching for ingredients like quinoa, avocado, or cocoa.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && menuItems.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menuItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
