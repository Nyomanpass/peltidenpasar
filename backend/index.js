import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize } from "./config/Database.js";
import "./models/UserModel.js";

import authRoutes from "./routes/AuthRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";
import pesertaRoutes from "./routes/PesertaRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: false
}));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", pesertaRoutes);

app.get("/", (req, res) => res.send("API OK"));

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(5000, () => console.log("server up and running on :5000"));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

start();
