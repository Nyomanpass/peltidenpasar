import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";


export const Athlete = sequelize.define(
  "Athlete",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING, // contoh: U-10, U-12, U-14, U-16, Open
      allowNull: false,
    },
     phoneNumber: {
      type: DataTypes.STRING, // pakai STRING karena bisa ada +62
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    club: {
      type: DataTypes.STRING, // pelatih / club
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "athletes",
    timestamps: true,
  }
);
