import type { CorsOptions } from "cors";
import { env } from "./env";

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const VERCEL_ORIGIN = /^https:\/\/[\w.-]+\.vercel\.app$/;

// NODE_ENV alone isn't reliable on Vercel's serverless runtime, so also
// treat any Vercel deployment (VERCEL=1) as production.
const isProduction = env.NODE_ENV === "production" || env.IS_VERCEL;

function isAllowedOrigin(origin: string): boolean {
  if (env.CORS_ORIGIN.includes(origin)) {
    return true;
  }

  if (isProduction && VERCEL_ORIGIN.test(origin)) {
    return true;
  }

  if (!isProduction && LOCALHOST_ORIGIN.test(origin)) {
    return true;
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    if (env.CORS_ORIGIN.length === 0 && !isProduction) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
