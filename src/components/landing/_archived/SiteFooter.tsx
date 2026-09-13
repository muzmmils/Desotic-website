import { Instagram, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-footer px-6 py-14 text-center md:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5">
        <div>
          <p className="text-xl font-extrabold text-primary">Infinite Healthy Yumm</p>
          <p className="mt-1 text-sm text-muted-foreground italic">Healthy bhi! Tasty bhi!</p>
        </div>

        <div className="flex gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://wa.me/910000000000"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MessageCircle size={18} />
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 Infinite Healthy Yumm. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">Made with 💚 in Pune</p>
      </div>
    </footer>
  );
}
