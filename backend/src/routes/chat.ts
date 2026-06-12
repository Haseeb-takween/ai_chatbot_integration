import { Router, type IRouter } from "express";
import { postChat } from "../controllers/chat.controller";

const chatRouter: IRouter = Router();

chatRouter.post("/", postChat);

export default chatRouter;
