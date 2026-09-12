import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/hooks/useAuth";
import { signupSchema, type SignupInput } from "@/lib/schemas/auth";
import { BASE_URL } from "@/lib/constants";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search["redirect"] === "string" ? search["redirect"] : undefined;
    return redirect ? { redirect } : {};
  },
  head: () => ({
    meta: [
      { title: "Create Account — Infinite Healthy Yumm" },
      {
        name: "description",
        content:
          "Join Infinite Healthy Yumm for daily meal subscriptions, healthy salads, and fresh deliveries across Pune.",
      },
      { property: "og:title", content: "Create Account — Infinite Healthy Yumm" },
      { property: "og:url", content: `${BASE_URL}/signup` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/signup` }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupInput) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            phone: values.phone && values.phone.length > 0 ? values.phone : null,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.session) {
        navigate({ to: destination });
      } else {
        setRegisteredEmail(values.email);
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "An unexpected error occurred during registration.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border/80 bg-surface/95 p-8 text-center shadow-2xl backdrop-blur-md sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            Verify Your Email
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-semibold text-foreground">{registeredEmail}</span>. Please click
            the link in your email to activate your account and start ordering.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              search={search.redirect ? { redirect: search.redirect } : {}}
              className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
            >
              Go to Sign In
            </Link>
            <Link
              to="/"
              className="flex w-full items-center justify-center rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-surface/95 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-primary hover:opacity-90"
          >
            <span>🥗</span>
            <span>Infinite Healthy Yumm</span>
          </Link>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Pune&apos;s cleanest healthy food and meal subscription community
          </p>
        </div>

        {authError && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="leading-snug">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
              Full Name
            </label>
            <div className="relative mt-2">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Aarav Sharma"
                autoComplete="name"
                {...register("fullName")}
                className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1.5 text-xs font-medium text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

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
                Mobile Number
              </label>
              <span className="text-[11px] text-muted-foreground">(Optional)</span>
            </div>
            <div className="relative mt-2">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                placeholder="9876543210"
                autoComplete="tel"
                {...register("phone")}
                className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs font-medium text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars"
                  autoComplete="new-password"
                  {...register("password")}
                  className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            search={search.redirect ? { redirect: search.redirect } : {}}
            className="font-bold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
