import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  MapPin,
  LogOut,
  Calendar,
  Package,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/schemas/profile";
import { useMySubscription } from "@/queries/useMySubscription";
import { BASE_URL } from "@/lib/constants";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Infinite Healthy Yumm" },
      {
        name: "description",
        content: "Manage your Infinite Healthy Yumm profile, deliveries, and meal subscriptions.",
      },
      { property: "og:title", content: "My Account — Infinite Healthy Yumm" },
      { property: "og:url", content: `${BASE_URL}/account` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/account` }],
  }),
  component: () => (
    <AuthGuard>
      <AccountPage />
    </AuthGuard>
  ),
});

function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const supabase = getSupabaseBrowserClient();

  const [activeTab, setActiveTab] = useState<"profile" | "subscriptions" | "orders">("profile");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(
    null,
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [subActionLoading, setSubActionLoading] = useState(false);

  const { data: mySub, refetch: refetchSub } = useMySubscription(user?.id);

  const handlePauseSubscription = async () => {
    if (!mySub) return;
    setSubActionLoading(true);
    try {
      const pauseDate = new Date();
      await (supabase.from("subscriptions") as any)
        .update({
          status: "paused",
          pause_started_at: pauseDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", mySub.id);
      await refetchSub();
      setFeedback({
        text: "Subscription paused for up to 30 days. You can resume anytime.",
        type: "success",
      });
    } catch {
      setFeedback({ text: "Could not pause subscription. Please try again.", type: "error" });
    } finally {
      setSubActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!mySub) return;
    setSubActionLoading(true);
    try {
      await (supabase.from("subscriptions") as any)
        .update({
          status: "active",
          pause_started_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mySub.id);
      await refetchSub();
      setFeedback({
        text: "Subscription resumed successfully! Your meal deliveries will continue.",
        type: "success",
      });
    } catch {
      setFeedback({ text: "Could not resume subscription. Please try again.", type: "error" });
    } finally {
      setSubActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!mySub) return;
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your healthy meal subscription? You can also pause instead.",
    );
    if (!confirmCancel) return;

    setSubActionLoading(true);
    try {
      await (supabase.from("subscriptions") as any)
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", mySub.id);
      await refetchSub();
      setFeedback({
        text: "Subscription has been cancelled. No further renewals will be billed.",
        type: "success",
      });
    } catch {
      setFeedback({ text: "Could not cancel subscription. Please try again.", type: "error" });
    } finally {
      setSubActionLoading(false);
    }
  };

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: {
        line1: "",
        line2: "",
        landmark: "",
        city: "Pune",
        pincode: "",
      },
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      const rawAddr =
        profile.address && typeof profile.address === "object"
          ? (profile.address as Record<string, unknown>)
          : {};

      const profileName = profile ? (profile["full_name"] as string | undefined) : undefined;
      const profilePhone = profile ? (profile["phone"] as string | undefined) : undefined;
      const metaName = user?.user_metadata
        ? (user.user_metadata["full_name"] as string | undefined)
        : undefined;
      const metaPhone = user?.user_metadata
        ? (user.user_metadata["phone"] as string | undefined)
        : undefined;

      reset({
        fullName: profileName ?? metaName ?? "",
        phone: profilePhone ?? metaPhone ?? "",
        address: {
          line1: typeof rawAddr["line1"] === "string" ? rawAddr["line1"] : "",
          line2: typeof rawAddr["line2"] === "string" ? rawAddr["line2"] : "",
          landmark: typeof rawAddr["landmark"] === "string" ? rawAddr["landmark"] : "",
          city: typeof rawAddr["city"] === "string" ? rawAddr["city"] : "Pune",
          pincode: typeof rawAddr["pincode"] === "string" ? rawAddr["pincode"] : "",
        },
      });
    }
  }, [profile, user, reset]);

  const onSaveProfile = async (values: ProfileUpdateInput) => {
    if (!user) return;
    setFeedback(null);

    try {
      const { error } = await (supabase.from("profiles") as any)
        .update({
          full_name: values.fullName,
          phone: values.phone,
          address: {
            line1: values.address.line1,
            ...(values.address.line2 ? { line2: values.address.line2 } : {}),
            ...(values.address.landmark ? { landmark: values.address.landmark } : {}),
            city: values.address.city,
            pincode: values.address.pincode,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setFeedback({
        text: "Your profile and Pune delivery address have been updated successfully!",
        type: "success",
      });
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate({ to: "/" });
    } catch (err) {
      console.error("Error signing out:", err);
      setIsSigningOut(false);
    }
  };

  // Get user initials
  const profileName = profile ? (profile["full_name"] as string | undefined) : undefined;
  const metaName = user?.user_metadata
    ? (user.user_metadata["full_name"] as string | undefined)
    : undefined;
  const displayName = profileName || metaName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((s: string) => s.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      {/* Account Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-black text-primary-foreground shadow-lg shadow-primary/20">
              {initials || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Sparkles className="h-3 w-3" /> Pune Member
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 sm:self-center"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-border/60 pb-px">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Profile & Address
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === "subscriptions"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Meal Plans
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === "orders"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            Orders
          </button>
        </div>
      </div>

      {/* Tab 1: Profile & Delivery Address */}
      {activeTab === "profile" && (
        <div className="mt-8 rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-black text-foreground">Delivery Address & Contact Info</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your default delivery details for one-off orders and recurring daily meal deliveries
              across Pune.
            </p>

            {feedback && (
              <div
                className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm ${
                  feedback.type === "success"
                    ? "border border-primary/40 bg-primary/10 text-primary"
                    : "border border-destructive/40 bg-destructive/10 text-destructive"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>{feedback.text}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSaveProfile)} className="mt-7 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Full Name
                  </label>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      {...register("fullName")}
                      placeholder="Aarav Sharma"
                      className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Phone Number
                  </label>
                  <div className="relative mt-2">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                  Flat, Society & Street Address
                </label>
                <div className="relative mt-2">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    {...register("address.line1")}
                    placeholder="e.g. Flat 402, High Street Towers, Moshi-Alandi Road"
                    className="w-full rounded-xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.address?.line1 && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {errors.address.line1.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Area / Sector (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("address.line2")}
                    placeholder="e.g. Near Spine Road"
                    className="mt-2 w-full rounded-xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("address.landmark")}
                    placeholder="e.g. Opp. Moshi Toll Plaza"
                    className="mt-2 w-full rounded-xl border border-border bg-background/80 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    City
                  </label>
                  <input
                    type="text"
                    {...register("address.city")}
                    readOnly
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-border bg-background/50 px-4 py-3 text-sm font-semibold text-muted-foreground focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Currently serving all areas across Pune metropolitan
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                    Pune Pincode
                  </label>
                  <input
                    type="text"
                    {...register("address.pincode")}
                    maxLength={6}
                    placeholder="412105"
                    className="mt-2 w-full rounded-xl border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.address?.pincode ? (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {errors.address.pincode.message}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Must start with 41 (e.g. 412105 Moshi, 411014 Viman Nagar)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving changes...
                    </>
                  ) : (
                    "Save Address & Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Subscriptions Dashboard */}
      {activeTab === "subscriptions" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground">Active Meal Subscriptions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your automated healthy bowls and juices scheduled for weekly Pune delivery
                </p>
              </div>
              <Link
                to="/subscriptions"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Explore All Plans
              </Link>
            </div>

            {mySub ? (
              <div className="mt-6 rounded-2xl border border-border/80 bg-background/60 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-foreground">
                        {mySub.plan?.name || "Healthy Meal Routine"}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                          mySub.status === "active"
                            ? "border border-primary/40 bg-primary/20 text-primary"
                            : mySub.status === "paused"
                              ? "border border-amber-500/40 bg-amber-500/20 text-amber-400"
                              : "border border-destructive/40 bg-destructive/20 text-destructive"
                        }`}
                      >
                        {mySub.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mySub.plan?.meals_per_week || 5} meals per week • Insulated delivery to Pune
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Current Billing Period</p>
                    <p className="text-xs font-bold text-foreground">
                      {new Date(mySub.current_period_start).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      –{" "}
                      {new Date(mySub.current_period_end).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Subscription Actions */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-border/60 pt-4">
                  {mySub.status === "active" && (
                    <button
                      onClick={handlePauseSubscription}
                      disabled={subActionLoading}
                      className="rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      {subActionLoading ? "Processing..." : "Pause Plan (Up to 30 Days)"}
                    </button>
                  )}

                  {mySub.status === "paused" && (
                    <button
                      onClick={handleResumeSubscription}
                      disabled={subActionLoading}
                      className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {subActionLoading ? "Processing..." : "Resume Delivery"}
                    </button>
                  )}

                  <Link
                    to="/subscriptions"
                    className="rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground hover:border-primary"
                  >
                    Change / Upgrade Plan
                  </Link>

                  {mySub.status !== "cancelled" && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={subActionLoading}
                      className="ml-auto text-xs font-semibold text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-border/80 bg-background/50 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                  🥗
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  No active meal subscription
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  Get chef-crafted healthy salads, cold-pressed juices, and protein bowls delivered
                  every weekday at your chosen time slot.
                </p>
                <Link
                  to="/subscriptions"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  Choose a Meal Plan →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Order History */}
      {activeTab === "orders" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground">
                  Order History & Live Deliveries
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track real-time status and view invoices of your past healthy meals
                </p>
              </div>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Order Food Now
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-border/80 bg-background/50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                📦
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">No orders yet</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Ready for fresh, healthy eating? Browse our nutrient-packed salads, cold-pressed
                juices, and high-protein meals.
              </p>
              <Link
                to="/menu"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Explore Menu →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cafe Sourcing Notice */}
      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-xs text-muted-foreground">
        <Clock className="h-5 w-5 shrink-0 text-primary" />
        <div>
          <span className="font-bold text-foreground">Moshi Cafe Kitchen:</span> Fresh ingredients
          are prepped every morning at 6:00 AM at our Moshi-Alandi Road kitchen. Deliveries are
          dispatched hot & cold in eco-friendly packaging across Pune.
        </div>
      </div>
    </div>
  );
}
