import express from "express";
import { updateWinner, setMatchPeserta, generateUndian, getMatches, getJuara } from "../controllers/MatchController.js";

const router = express.Router();

// PATCH /api/matches/:matchId/winner → update pemenang
router.patch("/:matchId/winner", updateWinner);

// PATCH /api/matches/:matchId/peserta → set peserta manual
router.patch("/:matchId/peserta", setMatchPeserta);
router.post("/bagan/:id/undian", generateUndian);
router.get("/matches", getMatches);
router.get("/juara/:baganId", getJuara)

export default router;