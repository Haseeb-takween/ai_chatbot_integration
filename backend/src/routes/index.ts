import { Router, type IRouter } from "express";
import adminRouter from "./admin";
import chatRouter from "./chat";
import conversationsRouter from "./conversations";
import healthRouter from "./health";

const apiRouter: IRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/conversations", conversationsRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
