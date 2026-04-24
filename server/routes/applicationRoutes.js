import express from "express";
import { applyJob, getJobApplications, shortlistCandidates, getCandidateApplications, getCompanyApplications, aiShortlistCandidates, updateApplicationStatus } from "../controllers/applicationController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/apply", authMiddleware, applyJob);
router.get("/job/:jobId", authMiddleware, getJobApplications);
router.post("/shortlist", authMiddleware, shortlistCandidates);
router.get("/candidate", authMiddleware, getCandidateApplications);
router.get("/company", authMiddleware, getCompanyApplications);
router.post("/ai-shortlist", authMiddleware, aiShortlistCandidates);
router.put("/status", authMiddleware, updateApplicationStatus);

export default router;
