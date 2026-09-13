"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";

export function CinematicFooter() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="bg-[var(--footer)] py-12 sm:py-16">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Brand Row */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <h2 className="font-serif text-2xl font-bold text-foreground tracking-wide m-0">
            DESOTIQ
          </h2>
          <p className="text-muted-foreground text-sm italic m-0">Eat Clean. Live Bold.</p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-border/30 mb-8" />

        {/* Social Links Row */}
        <div className="flex justify-center gap-4 mb-8">
          <a
            href="https://www.instagram.com/infinitehealthyyumm"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 w-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://wa.me/917058055157"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 w-11 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Message us on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-border/30 mb-8" />

        {/* Legal Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-muted-foreground text-xs gap-4 sm:gap-0">
          <span>© 2026 Desotiq. All rights reserved.</span>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              Terms
            </a>
          </div>
          <span>Made with 💚 in Pune</span>
        </div>
      </motion.div>
    </footer>
  );
}
