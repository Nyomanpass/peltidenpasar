import 'dotenv/config';
import { sequelize } from "./config/Database.js";
import { KelompokUmur } from "./models/KelompokUmurModel.js";

const seedKelompokUmur = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi DB berhasil");

    const dataKelompokUmur = [
      { nama: "KU 10 PA", umur: 10 },
      { nama: "KU 10 PI", umur: 10 },

      { nama: "KU 12 PA", umur: 12 },
      { nama: "KU 12 PI", umur: 12 },

      { nama: "KU 14 PA", umur: 14 },
      { nama: "KU 14 PI", umur: 14 },

      { nama: "KU 16 PA", umur: 16 },
      { nama: "KU 16 PI", umur: 16 },

      { nama: "KU Open PA", umur: 40 },
      { nama: "KU Open PI", umur: 40 },
    ];

    console.log("⏳ Insert data kelompok umur...");
    await KelompokUmur.bulkCreate(dataKelompokUmur);

    console.log("🚀 Sukses! 10 data kelompok umur berhasil ditambahkan.");
  } catch (error) {
    console.error("❌ Gagal seed kelompok umur:", error.message);
  } finally {
    process.exit();
  }
};

seedKelompokUmur();
