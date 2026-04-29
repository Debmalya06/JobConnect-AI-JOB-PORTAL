import express from "express";
import { getJobAlertSettings, runJobAlertsNow, saveJobAlertSettings } from "../controllers/jobAlertController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/settings", authMiddleware, getJobAlertSettings);
router.put("/settings", authMiddleware, saveJobAlertSettings);
router.post("/run-now", authMiddleware, runJobAlertsNow);

export default router;
