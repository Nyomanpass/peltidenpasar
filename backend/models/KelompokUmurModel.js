// models/KelompokUmurModel.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const KelompokUmur = sequelize.define("KelompokUmur", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: { type: DataTypes.STRING(50), allowNull: false }
}, {
  tableName: "kelompok_umur",
  timestamps: false,
});
