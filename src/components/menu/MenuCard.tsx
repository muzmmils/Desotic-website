import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Check, Flame, Dumbbell, Sparkles } from "lucide-react";
import type { MenuItem } from "@/components/menu/menuData";
import { addToCart } from "@/components/menu/cartUtils";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      menuItemId: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      basePrice: item.price,
      quantity: 1,
      imageUrl: item.image_url,
      categorySlug: item.category_slug,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Product Image and Badges */}
      <Link
        to="/menu/$itemId"
        params={{ itemId: item.slug }}
        className="relative block aspect-4/3 w-full overflow-hidden bg-muted/40"
      >
        <img
          src={item.image_url}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dietary Tag Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.is_vegan && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
              🌱 Vegan
            </span>
          )}
          {item.is_gluten_free && (
            <span className="inline-flex items-center rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
              🌾 Gluten-Free
            </span>
          )}
          {item.protein_g >= 20 && (
            <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm backdrop-blur-md">
              💪 {item.protein_g}g Protein
            </span>
          )}
        </div>

        {/* Highlight Tag */}
        {item.tags && item.tags.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-background/80 px-2.5 py-0.5 text-[11px] font-bold text-accent shadow-sm backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              {item.tags[0]}
            </span>
          </div>
        )}

        {/* Macro quick bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background/90 via-background/60 to-transparent px-3.5 py-2 pt-6 text-xs text-foreground/90">
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <strong className="text-foreground">{item.calories}</strong> kcal
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
            <Dumbbell className="h-3.5 w-3.5 text-primary" />
            <strong className="text-foreground">{item.protein_g}g</strong> protein
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4.5">
        <div className="mb-1 text-xs font-medium tracking-wide uppercase text-primary/80">
          {item.category_slug.replace("-", " ")}
        </div>

        <Link
          to="/menu/$itemId"
          params={{ itemId: item.slug }}
          className="group-hover:text-primary transition-colors"
        >
          <h3 className="line-clamp-1 text-base font-bold tracking-tight text-foreground">
            {item.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        {/* Footer: Price & Add to Cart */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/30">
          <div>
            <span className="text-xs text-muted-foreground">Price</span>
            <div className="text-lg font-black text-foreground">₹{item.price}</div>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Add ${item.name} to cart`}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
              added
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-95"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-95"
            }`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
