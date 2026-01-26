import 'dotenv/config';
import { sequelize } from "./config/Database.js";
import { Lapangan } from "./models/LapanganModel.js";

const seedLapangan = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi DB berhasil");

    const dataLapangan = [
      { nama: "Lapangan 1", lokasi: "Outdoor sebelah kiri" },
      { nama: "Lapangan 2", lokasi: "Outdoor sebelah kanan" },
      { nama: "Lapangan 3", lokasi: "Indoor gedung A" },
      { nama: "Lapangan 4", lokasi: "Indoor gedung B" },
    ];

    console.log("⏳ Insert data lapangan...");
    await Lapangan.bulkCreate(dataLapangan);

    console.log("🚀 Sukses! Data lapangan berhasil ditambahkan.");
  } catch (error) {
    console.error("❌ Gagal seed lapangan:", error.message);
  } finally {
    process.exit();
  }
};

seedLapangan();
