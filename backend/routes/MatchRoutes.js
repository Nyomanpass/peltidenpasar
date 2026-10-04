import express from "express";
import rateLimit from "express-rate-limit";
import { updateWinner, setMatchPeserta, generateUndian, getMatches, 
    getJuara, updateMatchPoint, getMatchDetailHistory, getMatchLog,
    undoLastPoint, getMatchLogs, setScoreRuleToMatch, getMatchById, 
    resetMatchScore, manualWOPoint, updateMatchDuration } from "../controllers/MatchController.js";
import { requireAuth } from "../middleware/Auth.js";

const router = express.Router();

// 🔒 Rate limiter untuk endpoint scoring (anti spam-click)
const scoringLimiter = rateLimit({
  windowMs: 1000, // 1 detik
  max: 5, // maksimal 5 request per detik per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Terlalu banyak permintaan, coba lagi sebentar." }
});

// PATCH /api/matches/:matchId/winner → update pemenang
router.patch("/:matchId/winner", requireAuth, updateWinner);

// PATCH /api/matches/:matchId/peserta → set peserta manual
router.patch("/:matchId/peserta", setMatchPeserta);
router.post("/bagan/:id/undian", generateUndian);
router.get("/matches", getMatches);
router.get("/juara/:baganId", getJuara);
router.post('/update-point', requireAuth, scoringLimiter, updateMatchPoint);
router.get('/history/:matchId', getMatchDetailHistory);
router.get('/match-log/:id', getMatchLog);
router.delete('/undo-point/:id', undoLastPoint);
router.get("/match-logs/:matchId", getMatchLogs); // Untuk SkorPage
router.patch("/matches/:id/set-rule", setScoreRuleToMatch);
router.get("/matches/:id", getMatchById);
router.delete("/reset-match/:id", resetMatchScore);
router.post("/matches/manual-wo-point", manualWOPoint);
router.patch("/matches/:id/duration", updateMatchDuration);



export default router;