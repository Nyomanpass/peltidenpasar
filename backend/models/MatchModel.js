import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { Bagan } from "./BaganModel.js";
import { Peserta } from "./PesertaModel.js";
import { Tournament } from "./TournamentModel.js";
import { DoubleTeam } from "./DoubleTeamModel.js"; // <--- Import DoubleTeam

export const Match = sequelize.define("Match", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  round: { type: DataTypes.INTEGER, allowNull: false },
  slot: { type: DataTypes.INTEGER, allowNull: false },
  
  // --- UNTUK SINGLE ---
  peserta1Id: { type: DataTypes.INTEGER, allowNull: true },
  peserta2Id: { type: DataTypes.INTEGER, allowNull: true },
  winnerId: { type: DataTypes.INTEGER, allowNull: true },

  // --- UNTUK DOUBLE (Tambahkan Kolom Baru Ini) ---
  doubleTeam1Id: { type: DataTypes.INTEGER, allowNull: true },
  doubleTeam2Id: { type: DataTypes.INTEGER, allowNull: true },
  winnerDoubleId: { type: DataTypes.INTEGER, allowNull: true },

  score1: { type: DataTypes.INTEGER, allowNull: true },
  score2: { type: DataTypes.INTEGER, allowNull: true },
  nextMatchId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM("belum","berlangsung","selesai"), defaultValue: "belum" },
  tournamentId: { type: DataTypes.INTEGER, allowNull: false },
  baganId: { type: DataTypes.INTEGER, allowNull: false },
});

// --- DEFINISI RELASI ---

// Relasi ke Bagan & Tournament
Bagan.hasMany(Match, { foreignKey: "baganId" });
Match.belongsTo(Bagan, { foreignKey: "baganId", as: "bagan" }); 
Match.belongsTo(Tournament, { foreignKey: "tournamentId" });

// Relasi ke Peserta (Sistem Single)
Match.belongsTo(Peserta, { as: "peserta1", foreignKey: "peserta1Id" });
Match.belongsTo(Peserta, { as: "peserta2", foreignKey: "peserta2Id" });
Match.belongsTo(Peserta, { as: "winner", foreignKey: "winnerId" });

// Relasi ke DoubleTeam (Sistem Ganda)
Match.belongsTo(DoubleTeam, { as: "doubleTeam1", foreignKey: "doubleTeam1Id" });
Match.belongsTo(DoubleTeam, { as: "doubleTeam2", foreignKey: "doubleTeam2Id" });
Match.belongsTo(DoubleTeam, { as: "winnerDouble", foreignKey: "winnerDoubleId" });