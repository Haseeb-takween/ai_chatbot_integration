import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  // Vercel always sets VERCEL=1 on every deployment (production or preview),
  // regardless of whether NODE_ENV is configured as "production".
  IS_VERCEL: process.env.VERCEL === "1",
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? "",
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
