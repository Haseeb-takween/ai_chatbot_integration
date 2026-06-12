import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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
