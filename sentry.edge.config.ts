import * as Sentry from "@sentry/nextjs";

// Only initialize if DSN is provided (opt-in for GlitchTip / Sentry)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    tracesSampleRate: 0.5,

    environment: process.env.NODE_ENV,

    enabled: process.env.NODE_ENV === "production",
  });
}
