import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize cart counter from localStorage (Zustand persistent storage)
  useEffect(() => {
    function updateCartCount() {
      try {
        const stored = localStorage.getItem("ihy-cart-storage");
        if (stored) {
          const parsed = JSON.parse(stored) as { state?: { items?: Array<{ quantity?: number }> } };
          const items = parsed?.state?.items;
          if (Array.isArray(items)) {
            const count = items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
            setCartCount(count);
            return;
          }
        }
        setCartCount(0);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-change", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-change", updateCartCount);
    };
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
      }
    }

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userDropdownOpen]);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    navigate({ to: "/" });
  };

  // Derive user display name & initials
  const metadataName = user?.user_metadata
    ? (user.user_metadata["full_name"] as string | undefined)
    : undefined;
  const displayName = profile?.full_name || metadataName || user?.email || "";
  const firstName = displayName.split(" ")[0] || "Account";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <span className="text-xl">🥗</span>
          <span className="text-lg font-black tracking-tight text-primary">
            Infinite Healthy Yumm
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary"
          >
            Home
          </Link>
          <Link
            to="/menu"
            className="text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary"
          >
            Menu
          </Link>
          <Link
            to="/subscriptions"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary"
          >
            <span>Meal Plans</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-black text-primary">
              Pune
            </span>
          </Link>
          <Link
            to="/about"
            className="text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary"
          >
            About
          </Link>
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Icon with Dynamic Badge */}
          <Link
            to="/cart"
            aria-label={`View cart (${cartCount} items)`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/80 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-black text-primary-foreground shadow-md">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* User Auth: Avatar & Dropdown or Sign In */}
          {isAuthenticated ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 rounded-full border border-border/80 bg-surface/80 py-1.5 pl-2 pr-3 text-xs font-bold text-foreground transition-all hover:border-primary/60 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">
                  {initials}
                </div>
                <span className="max-w-[100px] truncate text-left">{firstName}</span>
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-border/80 bg-surface/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95">
                  <div className="border-b border-border/60 px-3 py-2.5">
                    <p className="text-xs font-black text-foreground truncate">
                      {displayName || "Infinite Healthy Yumm Member"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background hover:text-primary"
                    >
                      <UserIcon size={14} className="text-muted-foreground" />
                      <span>My Profile & Address</span>
                    </Link>
                    <Link
                      to="/subscriptions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background hover:text-primary"
                    >
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>Meal Subscriptions</span>
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background hover:text-primary"
                    >
                      <Package size={14} className="text-muted-foreground" />
                      <span>Orders & Deliveries</span>
                    </Link>
                  </div>

                  <div className="border-t border-border/60 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 text-foreground md:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface/95 px-5 py-6 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-4 text-base font-bold">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground transition-colors hover:text-primary"
            >
              Menu
            </Link>
            <Link
              to="/subscriptions"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-foreground transition-colors hover:text-primary"
            >
              <span>Meal Plans</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
                Pune
              </span>
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground transition-colors hover:text-primary"
            >
              About & Sourcing
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-foreground transition-colors hover:text-primary"
            >
              <span>Cart & Checkout</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-black text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="border-t border-border/60 pt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-background/60 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                      {initials}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-black text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/20"
                  >
                    My Account & Delivery Address
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-full border border-border py-3 text-sm font-bold text-foreground hover:bg-background"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-full bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
