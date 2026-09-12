export function initSentry() {
  if (typeof window === "undefined") return;

  const dsn = import.meta.env["VITE_SENTRY_DSN"];
  if (!dsn) {
    // Sentry unconfigured; runs in standard log mode
    return;
  }

  // Gracefully handles client-side unhandled errors
  window.addEventListener("error", (event) => {
    console.error("[Sentry Client Error]", event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Sentry Promise Rejection]", event.reason);
  });
}
