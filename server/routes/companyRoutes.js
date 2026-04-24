import express from "express";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { updateCompanyProfile } from "../controllers/companyController.js";

const router = express.Router();

router.put("/profile", authMiddleware, updateCompanyProfile);

export default router;
