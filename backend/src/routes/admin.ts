import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import {
  adminGetConversation,
  adminListConversations,
  adminLogin,
  adminLogout,
  adminSession,
  adminStats,
} from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/requireAdmin";

const adminRouter: IRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

adminRouter.post("/login", loginLimiter, adminLogin);
adminRouter.post("/logout", adminLogout);
adminRouter.get("/session", requireAdmin, adminSession);

adminRouter.use(requireAdmin);
adminRouter.get("/stats", adminStats);
adminRouter.get("/conversations", adminListConversations);
adminRouter.get("/conversations/:id", adminGetConversation);

export default adminRouter;
