import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize } from "./config/Database.js";
import "./models/UserModel.js";
import './models/KelompokUmurModel.js';
import './models/PesertaModel.js';
import './models/JadwalModel.js'

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



app.get("/", (req, res) => res.send("API OK"));

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(5000, () => console.log("server up and running on :5000"));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

start();
