// JadwalController.js

import { Jadwal } from '../models/JadwalModel.js';
import { Match } from '../models/MatchModel.js';
import { Peserta } from '../models/PesertaModel.js';
import { Lapangan } from '../models/LapanganModel.js';
import { Bagan } from '../models/BaganModel.js';
import { Op } from 'sequelize'; // Import operator Sequelize

export const getJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.findAll({
      include: [
        { 
          model: Match, 
          as: 'match',
          // Perlu include model Bagan di dalam model Match
          include: [
            { model: Peserta, as: 'peserta1', attributes: ['id', 'namaLengkap'] },
            { model: Peserta, as: 'peserta2', attributes: ['id', 'namaLengkap'] },
            { 
              model: Bagan, // Tambahkan include ini
              as: 'bagan',
              attributes: ['id', 'nama'] 
            }
          ]
        },
        { 
          model: Lapangan, 
          as: 'lapangan',
          attributes: ['id', 'nama'] 
        },
      ],
      order: [
        ['tanggal', 'ASC'],
        ['waktuMulai', 'ASC']
      ]
    });

    res.status(200).json(jadwal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getJadwalByTanggal = async (req, res) => {
  try {
    const { tanggal } = req.params;
    const jadwal = await Jadwal.findAll({
      where: { tanggal },
      include: [
        {
          model: Match,
          as: "match",
          include: [
            { model: Peserta, as: "peserta1" },
            { model: Peserta, as: "peserta2" }
          ]
        },
        {
          model: Lapangan,
          as: "lapangan"
        }
      ],
      order: [["waktuMulai", "ASC"]],
    });
    res.json(jadwal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil jadwal per tanggal." });
  }
};

// --- Fungsi createJadwal yang Ditingkatkan ---
export const createJadwal = async (req, res) => {
  try {
    const { matchId, lapanganId, waktuMulai, tanggal } = req.body;

    // Hitung waktuSelesai secara otomatis (durasi 1 jam)
    const waktuMulaiDate = new Date(waktuMulai);
    const waktuSelesaiDate = new Date(waktuMulaiDate.getTime() + 60 * 60 * 1000); // Tambah 1 jam (60 menit * 60 detik * 1000 milidetik)

    // 1. Validasi Match: Cek apakah matchId valid dan statusnya bisa dijadwalkan
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match tidak ditemukan" });
    }
    // Hanya izinkan match dengan status "belum"
    if (match.status !== "belum") {
      return res.status(400).json({ error: "Match ini sudah memiliki jadwal atau tidak valid untuk dijadwalkan." });
    }

    // 2. Validasi Duplikasi Match: Pastikan match belum punya jadwal lain
    const existingJadwalForMatch = await Jadwal.findOne({
      where: {
        matchId: matchId,
        status: { [Op.ne]: 'selesai' } // status bukan 'selesai'
      }
    });
    if (existingJadwalForMatch) {
      return res.status(400).json({ error: "Match ini sudah dijadwalkan." });
    }

    // 3. Validasi Ketersediaan Lapangan (Logika yang diperbarui)
    const overlappingJadwal = await Jadwal.findOne({
      where: {
        lapanganId: lapanganId,
        tanggal: tanggal,
        [Op.and]: [
          // Periksa apakah jadwal baru dimulai sebelum jadwal yang sudah ada selesai
          { waktuMulai: { [Op.lt]: waktuSelesaiDate.toISOString() } },
          // DAN apakah jadwal baru selesai setelah jadwal yang sudah ada dimulai
          { waktuSelesai: { [Op.gt]: waktuMulaiDate.toISOString() } },
        ]
      }
    });

    if (overlappingJadwal) {
      return res.status(400).json({ error: "Lapangan sudah terpakai pada waktu yang Anda pilih." });
    }

    // 4. Buat dan simpan jadwal baru
    const newJadwal = await Jadwal.create({
      matchId,
      lapanganId,
      waktuMulai: waktuMulaiDate,
      waktuSelesai: waktuSelesaiDate,
      tanggal,
      status: "aktif"
    });

    res.status(201).json(newJadwal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const updateStatusJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const jadwal = await Jadwal.findByPk(id);
    if (!jadwal) return res.status(404).json({ error: "Jadwal tidak ditemukan" });

    // Update status jadwal
    jadwal.status = status;
    await jadwal.save();

    // Kalau jadwal selesai, update juga status match
    if (status === "selesai") {
      const match = await Match.findByPk(jadwal.matchId);
      if (match) {
        match.status = "selesai";
        await match.save();
      }
    }

    res.json(jadwal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Jadwal.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan." });
    }

    res.status(200).json({ message: "Jadwal berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus jadwal." });
  }
};

export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { matchId, lapanganId, waktuMulai, tanggal } = req.body;

    // 1. Cari jadwal yang akan di-update
    const jadwal = await Jadwal.findByPk(id);
    if (!jadwal) {
      return res.status(404).json({ error: "Jadwal tidak ditemukan." });
    }

    // Tentukan nilai baru untuk waktuMulai, waktuSelesai, dan tanggal
    const updatedTanggal = tanggal || jadwal.tanggal;
    const updatedWaktuMulai = waktuMulai ? new Date(waktuMulai) : jadwal.waktuMulai;
    
    // Hitung waktuSelesai secara otomatis HANYA JIKA waktuMulai diupdate
    const updatedWaktuSelesai = waktuMulai
      ? new Date(updatedWaktuMulai.getTime() + 60 * 60 * 1000) // Tambah 1 jam
      : jadwal.waktuSelesai; // Gunakan waktuSelesai yang lama

    // 2. Validasi Ketersediaan Match
    if (matchId && matchId !== jadwal.matchId) {
        const existingJadwalForMatch = await Jadwal.findOne({
          where: {
            matchId: matchId,
            id: { [Op.ne]: id },
            status: { [Op.ne]: 'selesai' }
          }
        });
        if (existingJadwalForMatch) {
          return res.status(400).json({ error: "Match ini sudah dijadwalkan di jadwal lain." });
        }
  
        const newMatch = await Match.findByPk(matchId);
        if (!newMatch || newMatch.status !== "belum") {
          return res.status(400).json({ error: "Match baru tidak valid untuk dijadwalkan." });
        }
    }
  
    // 3. Validasi Bentrok Lapangan dengan logika yang lebih sederhana
    const overlappingJadwal = await Jadwal.findOne({
        where: {
          id: { [Op.ne]: id }, // Jangan bandingkan dengan jadwal yang sedang di-update
          lapanganId: lapanganId || jadwal.lapanganId,
          tanggal: updatedTanggal,
          [Op.and]: [
            // Cek apakah ada jadwal lain yang dimulai sebelum jadwal baru selesai
            { waktuMulai: { [Op.lt]: updatedWaktuSelesai } },
            // DAN apakah ada jadwal lain yang selesai setelah jadwal baru dimulai
            { waktuSelesai: { [Op.gt]: updatedWaktuMulai } },
          ]
        }
    });

    if (overlappingJadwal) {
      return res.status(400).json({ error: "Lapangan sudah terpakai pada waktu yang Anda pilih." });
    }

    // 4. Update dan simpan jadwal baru
    await jadwal.update({
      matchId: matchId || jadwal.matchId,
      lapanganId: lapanganId || jadwal.lapanganId,
      tanggal: updatedTanggal,
      waktuMulai: updatedWaktuMulai,
      waktuSelesai: updatedWaktuSelesai,
      status: "aktif"
    });

    res.status(200).json({ message: "Jadwal berhasil diperbarui.", jadwal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};