import express from "express";
import { createDoubleTeam, getDoubleTeams } from "../controllers/DoubleTeamController.js";

const router = express.Router();

router.post("/double-teams", createDoubleTeam);
router.get('/double-teams', getDoubleTeams); 

export default router;