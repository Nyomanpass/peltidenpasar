// routes/pesertaRoutes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/Auth.js";

const router = Router();

router.get("/peserta/profile", requireAuth, requireRole("peserta"), (req, res) => {
  res.json({ message: "Peserta profile data", who: req.user });
});

export default router;
