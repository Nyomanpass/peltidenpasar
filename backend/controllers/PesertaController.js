import multer from "multer";
import path from "path";
import fs from "fs";
import { Peserta, KelompokUmur } from "../models/index.js";

// ====== Konfigurasi upload file ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/fotokartu";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

// ====== Controller ======

// Get semua peserta by status
export const getPesertaByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const data = await Peserta.findAll({
      where: { status },
      include: { model: KelompokUmur, as: "kelompokUmur", attributes: ["id", "nama"] },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get peserta by ID
export const getPesertaById = async (req, res) => {
  try {
    const data = await Peserta.findByPk(req.params.id, {
      include: { model: KelompokUmur, as: "kelompokUmur", attributes: ["id", "nama"] },
    });
    if (!data) return res.status(404).json({ message: "Peserta tidak ditemukan" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create peserta
export const createPeserta = async (req, res) => {
  try {
    const { namaLengkap, nomorWhatsapp, tanggalLahir, kelompokUmurId,tournamentId } = req.body;
    const fotoKartu = req.file ? req.file.path : null;

    const newData = await Peserta.create({
      namaLengkap,
      nomorWhatsapp,
      tanggalLahir,
      kelompokUmurId,
      tournamentId,
      fotoKartu,
    });

    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update peserta
export const updatePeserta = async (req, res) => {
  try {
    const peserta = await Peserta.findByPk(req.params.id);
    if (!peserta) return res.status(404).json({ message: "Peserta tidak ditemukan" });

    const { namaLengkap, nomorWhatsapp, tanggalLahir, kelompokUmurId, tournamentId } = req.body;

    if (req.file) {
      if (peserta.fotoKartu && fs.existsSync(peserta.fotoKartu)) {
        fs.unlinkSync(peserta.fotoKartu);
      }
      peserta.fotoKartu = req.file.path;
    }

    peserta.namaLengkap = namaLengkap || peserta.namaLengkap;
    peserta.nomorWhatsapp = nomorWhatsapp || peserta.nomorWhatsapp;
    peserta.tanggalLahir = tanggalLahir || peserta.tanggalLahir;
    peserta.kelompokUmurId = kelompokUmurId || peserta.kelompokUmurId;
    peserta.tournamentId = tournamentId || peserta.tournamentId; 

    await peserta.save();

    res.json({ message: "Peserta berhasil diupdate", data: peserta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete peserta
export const deletePeserta = async (req, res) => {
  try {
    const peserta = await Peserta.findByPk(req.params.id);
    if (!peserta) return res.status(404).json({ message: "Peserta tidak ditemukan" });

    if (peserta.fotoKartu && fs.existsSync(peserta.fotoKartu)) {
      fs.unlinkSync(peserta.fotoKartu);
    }

    await peserta.destroy();
    res.json({ message: "Peserta berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify peserta
export const verifyPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const peserta = await Peserta.findByPk(id);

    if (!peserta) return res.status(404).json({ msg: "Peserta tidak ditemukan" });

    peserta.status = "verified";
    await peserta.save();

    res.status(200).json({ msg: "Peserta berhasil diverifikasi", data: peserta });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get peserta per kelompok umur
export const getPesertaByKelompokUmur = async (req, res) => {
  try {
    const { tournamentId } = req.query;

    const pesertaFilter = { status: "verified" };

    // Kalau tournamentId dikirim dari frontend → tambahkan filter
    if (tournamentId) {
      pesertaFilter.tournamentId = tournamentId;
    }

    const result = await KelompokUmur.findAll({
      attributes: ["id", "nama"],
      include: [
        {
          model: Peserta,
          as: "peserta",
          attributes: ["id", "namaLengkap", "status", "kelompokUmurId", "tournamentId"],
          where: pesertaFilter,
          required: false, // supaya kelompok umur tetap muncul meskipun tidak ada peserta
        },
      ],
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};


export const getPesertaFiltered = async (req, res) => {
  try {
    const { kelompokUmurId, status, tournamentId } = req.query; // tambahkan tournamentId
    let whereClause = {};

    if (kelompokUmurId) {
      whereClause.kelompokUmurId = kelompokUmurId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (tournamentId) {
      whereClause.tournamentId = tournamentId; // filter berdasarkan tournament
    }

    const peserta = await Peserta.findAll({
      where: whereClause,
      include: [
        { 
          model: KelompokUmur,
          as: "kelompokUmur"
        } 
      ]
    });

    res.json(peserta);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};




