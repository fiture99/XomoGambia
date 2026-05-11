import { Router, type IRouter } from "express";
import healthRouter from "./health";
import providersRouter from "./providers";
import companiesRouter from "./companies";
import usersRouter from "./users";
import quotesRouter from "./quotes";
import jobsRouter from "./jobs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(providersRouter);
router.use(companiesRouter);
router.use(usersRouter);
router.use(quotesRouter);
router.use(jobsRouter);

export default router;
