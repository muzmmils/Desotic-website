"use client";

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";
import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";

export function CinematicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [pointerEvents, setPointerEvents] = useState<"none" | "auto">("none");

  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Show header after scrolling past 600px, fully visible at 800px
  const headerOpacity = useTransform(scrollY, [600, 800], [0, 1]);
  const headerY = useTransform(scrollY, [600, 800], [-20, 0]);

  // Handle pointer events state to prevent interaction when invisible
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest >= 600 && pointerEvents !== "auto") {
      setPointerEvents("auto");
    } else if (latest < 600 && pointerEvents !== "none") {
      setPointerEvents("none");
    }
  });

  // Sync cart item count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const storedCart = localStorage.getItem("ihy-cart-storage");
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          // Adjust parsing logic based on your cart storage structure
          const items = parsed?.state?.items || [];
          setCartItemCount(items.length);
        } else {
          setCartItemCount(0);
        }
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    // Custom event listener for updates within the same window
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 h-16 glass"
        style={{
          opacity: shouldReduceMotion ? 1 : headerOpacity,
          y: shouldReduceMotion ? 0 : headerY,
          pointerEvents: shouldReduceMotion ? "auto" : pointerEvents,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          {/* Left: Brand */}
          <Link to="/" className="font-serif text-lg font-bold tracking-wide text-foreground">
            DESOTIQ
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Desktop Navigation">
            <Link
              to="/menu"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Menu
            </Link>
            <Link
              to="/subscriptions"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Plans
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/cart"
              className="relative h-10 w-10 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-foreground"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[60] flex flex-col md:hidden">
          <div className="flex items-center justify-between p-4 h-16 max-w-6xl mx-auto w-full">
            <Link
              to="/"
              className="font-serif text-lg font-bold tracking-wide text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              DESOTIQ
            </Link>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close Mobile Menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav
            className="flex flex-col items-center justify-center flex-1 gap-8"
            aria-label="Mobile Navigation"
          >
            <Link
              to="/"
              className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/subscriptions"
              className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Plans
            </Link>
            <Link
              to="/about"
              className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="h-px w-24 bg-border my-4" />
            <Link
              to="/login"
              className="text-xl font-semibold text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-xl font-semibold text-[var(--coral)] hover:opacity-80 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
