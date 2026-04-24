import express from "express";
import { postJob, getJobs, getCompanyJobs, getJobById, updateJob } from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/", authMiddleware, postJob);
router.get("/", authMiddleware, getJobs);
router.get("/company", authMiddleware, getCompanyJobs);
router.get("/:id", getJobById);
router.put("/:id", authMiddleware, updateJob);

export default router;
