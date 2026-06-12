import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

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
