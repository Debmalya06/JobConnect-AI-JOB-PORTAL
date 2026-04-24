import express from "express";
import { registerCandidate, registerCompany, login, getMe } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/register/candidate", registerCandidate);
router.post("/register/company", registerCompany);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router;
