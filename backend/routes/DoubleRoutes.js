import express from "express";
import { requireAuth, requireRole } from "../middleware/Auth.js";
import {
  createDoubleTeam,
  getDoubleTeams,
  getDoubleTeamsAdmin,
  deleteDoubleTeam,
} from "../controllers/DoubleTeamController.js";

const router = express.Router();

// Publik/dashboard umum (BaganView, PesertaGanda - tanpa NIK & nomor WA)
router.get("/double-teams", getDoubleTeams);

// Terproteksi admin & panitia (Export Excel & data lengkap - dengan NIK & nomor WA)
router.get(
  "/admin/double-teams",
  requireAuth,
  requireRole("admin", "panitia"),
  getDoubleTeamsAdmin
);

// Pembuatan & penghapusan tim ganda hanya untuk admin & panitia
router.post(
  "/double-teams",
  requireAuth,
  requireRole("admin", "panitia"),
  createDoubleTeam
);

router.delete(
  "/double-teams/:id",
  requireAuth,
  requireRole("admin", "panitia"),
  deleteDoubleTeam
);

export default router;