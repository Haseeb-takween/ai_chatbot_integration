import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Separate Vercel projects are always cross-site in production and need
// SameSite=None + Secure. Localhost dev must stay Lax without Secure.
// NODE_ENV alone isn't reliable on Vercel's serverless runtime, so also
// treat any Vercel deployment (VERCEL=1) as production.
const isProduction = env.NODE_ENV === "production" || env.IS_VERCEL;

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge: ADMIN_SESSION_MAX_AGE_MS,
};

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ADMIN_SESSION_COOKIE];

  if (!token) {
    next(new AppError(401, "Admin authentication required"));
    return;
  }

  try {
    jwt.verify(token, env.ADMIN_SESSION_SECRET);
    next();
  } catch {
    next(new AppError(401, "Admin session expired. Please log in again."));
  }
}
