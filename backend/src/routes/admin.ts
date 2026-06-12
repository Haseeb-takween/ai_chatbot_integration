import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import {
  adminGetConversation,
  adminListConversations,
  adminLogin,
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

adminRouter.use(requireAdmin);
adminRouter.get("/stats", adminStats);
adminRouter.get("/conversations", adminListConversations);
adminRouter.get("/conversations/:id", adminGetConversation);

export default adminRouter;
