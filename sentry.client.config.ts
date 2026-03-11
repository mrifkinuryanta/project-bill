import * as Sentry from "@sentry/nextjs";

// Only initialize if DSN is provided (auto-forwarded from SENTRY_DSN via next.config.ts)
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust sampling rate for production (lower = less noise, lower cost)
    tracesSampleRate: 0.5,

    // Capture unhandled promise rejections
    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    // Set environment tag
    environment: process.env.NODE_ENV,

    // Only send errors in production
    enabled: process.env.NODE_ENV === "production",
  });
}
