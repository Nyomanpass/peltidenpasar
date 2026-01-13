import { DataTypes } from "sequelize";
import { sequelize } from "../config/Database.js";

export const News = sequelize.define("Berita", {
    idNews: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    desc : { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    link : { type: DataTypes.STRING, allowNull: true },
    tanggalUpload: { type: DataTypes.DATE, allowNull: false },
    

},{
    tableName: "News",
}
);