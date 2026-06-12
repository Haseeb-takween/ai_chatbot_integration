import { Router, type IRouter } from "express";
import { getDBHealth } from "../lib/db";

const healthRouter: IRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const db = await getDBHealth();
  const dbConnected = db.status === "ok";

  res.status(dbConnected || db.status === "not_configured" ? 200 : 503).json({
    status: dbConnected || db.status === "not_configured" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db,
  });
});

export default healthRouter;
