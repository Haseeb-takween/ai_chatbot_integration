import { Router, type IRouter } from "express";
import healthRouter from "./health";

const apiRouter: IRouter = Router();

apiRouter.use("/health", healthRouter);

export default apiRouter;
