import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
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
