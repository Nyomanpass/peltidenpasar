import { Router } from "express";
import { register, login, me } from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/Auth.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, me);

export default router;
