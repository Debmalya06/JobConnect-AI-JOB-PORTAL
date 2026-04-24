import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { updateProfile } from "../controllers/candidateController.js";

const router = express.Router();

router.put("/profile", authMiddleware, updateProfile);

export default router;
