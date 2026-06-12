import { Router, type IRouter } from "express";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
} from "../controllers/conversations.controller";

const conversationsRouter: IRouter = Router();

conversationsRouter.get("/", listConversations);
conversationsRouter.get("/:id", getConversation);
conversationsRouter.post("/", createConversation);
conversationsRouter.delete("/:id", deleteConversation);

export default conversationsRouter;
