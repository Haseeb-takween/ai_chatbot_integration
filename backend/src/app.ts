import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDB } from "./lib/db";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import apiRouter from "./routes";

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.length > 0 ? env.CORS_ORIGIN : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Hello! Welcome to the Al-Noor Institute chatbot API.",
  });
});

if (env.MONGODB_URI) {
  app.use("/api", async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });
}

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
