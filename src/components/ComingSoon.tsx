import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function ComingSoon({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-3xl font-extrabold text-primary md:text-4xl">{title}</h1>
      <p className="max-w-md text-muted-foreground">{children ?? "Coming soon."}</p>
      <Link
        to="/"
        className="rounded-full border border-primary px-6 py-3 text-sm font-bold text-primary transition-shadow hover:shadow-[0_0_30px_var(--primary-glow)]"
      >
        Back to home
      </Link>
    </main>
  );
}
