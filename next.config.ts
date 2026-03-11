import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Expose SENTRY_DSN to client-side so users only need to set one env var
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN || "",
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload (not needed for GlitchTip self-hosted)
  silent: true,

  // Opt out of Sentry telemetry
  telemetry: false,
});
