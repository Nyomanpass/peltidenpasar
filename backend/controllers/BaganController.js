import { Bagan } from "../models/BaganModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";
import { Match } from "../models/MatchModel.js";
import { Peserta } from "../models/PesertaModel.js";

export const createBagan = async (req, res) => {
  try {
    const { kelompokUmurId, tournamentId } = req.body;

    const kelompokumur = await KelompokUmur.findByPk(kelompokUmurId);
    if (!kelompokumur) {
      return res.status(404).json({ msg: "Kelompok umur tidak ditemukan." });
    }

    // Ambil peserta berdasarkan tournament
    const peserta = await Peserta.findAll({
      where: { 
        kelompokUmurId, 
        tournamentId,
        status: "verified"
      }
    });

    const jumlah = peserta.length;

    let tipe = "roundrobin";
    if (jumlah > 4) tipe = "knockout";

    const bagan = await Bagan.create({
      nama: `Bagan ${kelompokumur.nama}`,
      tipe,
      jumlahPeserta: jumlah,
      kelompokUmurId,
      tournamentId,
      status: "draft",
    });

    // --- Round Robin ---
    if (tipe === "roundrobin") {
      for (let i = 0; i < jumlah; i++) {
        for (let j = i + 1; j < jumlah; j++) {
          await Match.create({
            baganId: bagan.id,
            round: 1,
            slot: i + 1,
            peserta1Id: peserta[i].id,
            peserta2Id: peserta[j].id,
            tournamentId
          });
        }
      }
    }

    // --- Knockout ---
    else {
      let size = 2;
      while (size < jumlah) size *= 2;

      const totalRounds = Math.log2(size);
      const allMatches = [];

      for (let round = 1; round <= totalRounds; round++) {
        const numMatches = size / Math.pow(2, round);
        for (let slot = 1; slot <= numMatches; slot++) {
          const match = await Match.create({
            baganId: bagan.id,
            round,
            slot,
            peserta1Id: null,
            peserta2Id: null,
            tournamentId
          });
          allMatches.push(match);
        }
      }

      for (let m of allMatches) {
        if (m.round < totalRounds) {
          const nextSlot = Math.ceil(m.slot / 2);
          const next = allMatches.find(
            (nm) => nm.round === m.round + 1 && nm.slot === nextSlot
          );
          if (next) {
            m.nextMatchId = next.id;
            await m.save();
          }
        }
      }
    }

    res.status(201).json({ msg: "Bagan berhasil dibuat", bagan });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};



export const getBaganWithMatches = async (req, res) => {
  try {
    const { id } = req.params;

    const bagan = await Bagan.findByPk(id, {
      include: [
        {
          model: Match,
          include: [
            { model: Peserta, as: "peserta1" },
            { model: Peserta, as: "peserta2" },
            { model: Peserta, as: "winner" }, 
          ],
        },
      ],
    });

    if (!bagan) return res.status(404).json({ msg: "Bagan tidak ditemukan" });

    res.json(bagan);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getAllBagan = async (req, res) => {
  try {
    const { tournamentId } = req.query; 

    let filter = {};

    // Jika ada tournamenId → tambahkan filter
    if (tournamentId) {
      filter.tournamentId = tournamentId;
    }

    const bagans = await Bagan.findAll({
      where: filter
    });

    res.json(bagans);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};




export const deleteBagan = async (req, res) => {
  try {
    const { id } = req.params;

    // cek apakah bagan ada
    const bagan = await Bagan.findByPk(id);
    if (!bagan) {
      return res.status(404).json({ msg: "Bagan tidak ditemukan" });
    }

    // hapus dulu semua match yang terkait
    await Match.destroy({ where: { baganId: id } });

    // hapus bagan
    await bagan.destroy();

    res.json({ msg: "Bagan dan semua match terkait berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

