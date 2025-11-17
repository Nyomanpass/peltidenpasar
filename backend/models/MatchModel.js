import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { Bagan } from "./BaganModel.js";
import { Peserta } from "./PesertaModel.js";
import { Tournament } from "./TournamentModel.js";

export const Match = sequelize.define("Match", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  round: { type: DataTypes.INTEGER, allowNull: false },
  slot: { type: DataTypes.INTEGER, allowNull: false }, // posisi di round
  peserta1Id: { type: DataTypes.INTEGER, allowNull: true },
  peserta2Id: { type: DataTypes.INTEGER, allowNull: true },
  score1: { type: DataTypes.INTEGER, allowNull: true },
  score2: { type: DataTypes.INTEGER, allowNull: true },
  winnerId: { type: DataTypes.INTEGER, allowNull: true },
  nextMatchId: { type: DataTypes.INTEGER, allowNull: true }, // link ke match babak selanjutnya
  status: { type: DataTypes.ENUM("belum", "selesai"), defaultValue: "belum" },
});

Bagan.hasMany(Match, { foreignKey: "baganId" });
Match.belongsTo(Bagan, { foreignKey: "baganId", as: "bagan" }); 

// Peserta.hasMany(Match, { foreignKey: "peserta1Id" });
// Peserta.hasMany(Match, { foreignKey: "peserta2Id" });
// Peserta.hasMany(Match, { foreignKey: "winnerId" });


Match.belongsTo(Peserta, { as: "peserta1", foreignKey: "peserta1Id" });
Match.belongsTo(Peserta, { as: "peserta2", foreignKey: "peserta2Id" });
Match.belongsTo(Peserta, { as: "winner", foreignKey: "winnerId" });

Tournament.hasMany(Match, { foreignKey: "tournamentId", onDelete: "CASCADE" });
Match.belongsTo(Tournament, { foreignKey: "tournamentId" });