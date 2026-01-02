// controllers/DoubleTeamController.js
import { DoubleTeam } from "../models/DoubleTeamModel.js";
import { Peserta } from "../models/PesertaModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js"; // Asumsi kamu punya model ini

// controllers/DoubleTeamController.js
export const createDoubleTeam = async (req, res) => {
  const { player1Id, player2Id, tournamentId, kelompokUmurTargetId } = req.body;

  try {
    const p1 = await Peserta.findByPk(player1Id);
    const p2 = await Peserta.findByPk(player2Id);
    const targetKU = await KelompokUmur.findByPk(kelompokUmurTargetId);

    // Ambil data kelompok umur asli masing-masing pemain
    const kuP1 = await KelompokUmur.findByPk(p1.kelompokUmurId);
    const kuP2 = await KelompokUmur.findByPk(p2.kelompokUmurId);

    // Validasi umur: Pemain tidak boleh lebih tua dari kategori target
    if (kuP1.umur > targetKU.umur || kuP2.umur > targetKU.umur) {
      return res.status(400).json({ 
        msg: "Gagal! Salah satu pemain melebihi batas umur kategori ini." 
      });
    }

    // Buat Tim Ganda
    const newTeam = await DoubleTeam.create({
      player1Id,
      player2Id,
      tournamentId,
      kelompokUmurTargetId,
      namaTim: `${p1.namaLengkap} / ${p2.namaLengkap}`,
      status: "verified"
    });

    res.status(201).json({ msg: "Tim Ganda Berhasil Dibuat", data: newTeam });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getDoubleTeams = async (req, res) => {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ msg: "Tournament ID diperlukan" });

    const response = await DoubleTeam.findAll({
      where: { tournamentId },
      include: [
        { model: Peserta, as: 'Player1', attributes: ['id', 'namaLengkap'] },
        { model: Peserta, as: 'Player2', attributes: ['id', 'namaLengkap'] },
        { model: KelompokUmur, as: 'KelompokUmur', attributes: ['id', 'nama'] }
      ]
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("🔥 ERROR BACKEND:", error.message);
    res.status(500).json({ msg: error.message });
  }
};