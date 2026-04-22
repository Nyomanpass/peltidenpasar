import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const TemplateSertifikat = sequelize.define(
  "TemplateSertifikat",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "TemplateSertifikat",
    timestamps: true,
  }
);