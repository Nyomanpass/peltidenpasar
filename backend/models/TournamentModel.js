import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const Tournament = sequelize.define("Tournament", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  location: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },

  // ✅ status turnamen: aktif / nonaktif
  status: {
    type: DataTypes.ENUM("aktif", "nonaktif"),
    defaultValue: "nonaktif",
  },

  // ✅ poster turnamen (menyimpan URL atau path gambar)
  poster: {type: DataTypes.STRING, allowNull: true},
});
