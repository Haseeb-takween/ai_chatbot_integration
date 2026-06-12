import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
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

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
