import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { BASE_URL } from "@/lib/constants";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search["redirect"] === "string" ? search["redirect"] : undefined;
    return redirect ? { redirect } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign In — Infinite Healthy Yumm" },
      {
        name: "description",
        content:
          "Sign in to manage your meal subscriptions, tracked orders, and healthy food deliveries in Pune.",
      },
      { property: "og:title", content: "Sign In — Infinite Healthy Yumm" },
      { property: "og:url", content: `${BASE_URL}/login` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/login` }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination =
    search.redirect && search.redirect.startsWith("/") ? search.redirect : "/account";

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate({ to: destination });
    }
  }, [isAuthenticated, isAuthLoading, navigate, destination]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setAuthError("Incorrect email or password. Please check your credentials and try again.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setAuthError(
            "Please verify your email address before signing in. Check your inbox for the confirmation link.",
          );
        } else {
          setAuthError(error.message);
        }
        return;
      }

      navigate({ to: destination });
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "An unexpected error occurred during sign-in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-surface/95 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-primary hover:opacity-90"
          >
            <span>🥗</span>
            <span>Infinite Healthy Yumm</span>
          </Link>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your meal subscriptions and live order tracking
          </p>
        </div>

        {authError && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="leading-snug">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email")}
                className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Password
              </label>
            </div>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          {search.redirect ? (
            <Link
              to="/signup"
              search={{ redirect: search.redirect }}
              className="font-bold text-primary hover:underline"
            >
              Create free account
            </Link>
          ) : (
            <Link to="/signup" className="font-bold text-primary hover:underline">
              Create free account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
