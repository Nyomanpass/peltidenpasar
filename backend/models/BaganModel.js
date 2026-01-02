import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";
import { KelompokUmur } from "./KelompokUmurModel.js";
import { Tournament } from "./TournamentModel.js";


export const Bagan = sequelize.define("Bagan", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING, allowNull: false },  // contoh: "Bagan KU 10 PA"
  tipe: { type: DataTypes.ENUM("roundrobin", "knockout"), allowNull: false },
  jumlahPeserta: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("draft", "aktif", "selesai"), defaultValue: "draft" },
  isLocked: {type: DataTypes.BOOLEAN,defaultValue: false
}
});

KelompokUmur.hasOne(Bagan, { foreignKey: "kelompokUmurId" });
Bagan.belongsTo(KelompokUmur, { foreignKey: "kelompokUmurId" });

Tournament.hasMany(Bagan, { foreignKey: "tournamentId", onDelete: "CASCADE" });
Bagan.belongsTo(Tournament, { foreignKey: "tournamentId" });