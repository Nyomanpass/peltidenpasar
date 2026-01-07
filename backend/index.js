import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize } from "./config/Database.js";
import "./models/UserModel.js";
import './models/KelompokUmurModel.js';
import './models/PesertaModel.js';
import './models/JadwalModel.js'
import "./models/index.js";
import "./models/MatchScoreLog.js";


// autentication
import authRoutes from "./routes/AuthRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";

//kelompok umur
import kelompokUmur from "./routes/KelompokUmurRoutes.js";

//peserta
import pesertaRoutes from "./routes/PesertaRoutes.js";

//bagan
import baganRoutes from './routes/BaganRoutes.js';
import matchRoutes from './routes/MatchRoutes.js';

//jadwal
import jadwalRoutes from './routes/JadwalRoutes.js'
//lapangan
import lapanganRoutes from './routes/LapanganRoutes.js'
//tournament
import tournamentRoutes from './routes/TournamentRoutes.js'
//double team
import doubleRoutes from "./routes/DoubleRoutes.js"; 



const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: false
}));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

//authentication
app.use("/api", authRoutes);
app.use("/api", adminRoutes);


//settings
app.use("/api", kelompokUmur);


//peserta
app.use('/api', pesertaRoutes);
app.use('/api', baganRoutes);
app.use('/api', matchRoutes);

//jadwal
app.use('/api', jadwalRoutes);

//lapangan
app.use('/api', lapanganRoutes);

//tournament
app.use('/api', tournamentRoutes);

//double team
app.use("/api", doubleRoutes);




app.get("/", (req, res) => res.send("API OK"));

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync();
    // await sequelize.sync({ alter: true });
    app.listen(5004, () => console.log("Server berjalan di port 5004"));
  } catch (error) {
    console.error("❌ Error saat menjalankan server:", error);
  }
};

start();
