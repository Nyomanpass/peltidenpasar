import { Bagan } from "../models/BaganModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";
import { Match } from "../models/MatchModel.js";
import { Peserta } from "../models/PesertaModel.js";

export const createBagan = async (req, res) => {
  try {
    const { kelompokUmurId } = req.body;

    const kelompokumur = await KelompokUmur.findByPk(kelompokUmurId)

    if (!kelompokumur) {
      return res.status(404).json({ msg: "Kelompok umur tidak ditemukan." });
    }

    // Ambil peserta
    const peserta = await Peserta.findAll({ where: { kelompokUmurId } });
    const jumlah = peserta.length;

    let tipe = "roundrobin";
    if (jumlah > 4) tipe = "knockout"; // >4 → knockout

    const namaBaganBaru = `Bagan ${kelompokumur.nama}`;
    // Buat bagan
    const bagan = await Bagan.create({
      nama: namaBaganBaru,
      tipe,
      jumlahPeserta: jumlah,
      kelompokUmurId,
      status: "draft",
    });

    if (tipe === "roundrobin") {
      // round robin langsung generate semua
      for (let i = 0; i < jumlah; i++) {
        for (let j = i + 1; j < jumlah; j++) {
          await Match.create({
            baganId: bagan.id,
            round: 1,
            slot: i + 1,
            peserta1Id: peserta[i].id,
            peserta2Id: peserta[j].id,
          });
        }
      }
    } else {
      // knockout → HANYA generate struktur kosong, peserta bisa diinput manual
      let size = 2;
      while (size < jumlah) size *= 2; // contoh 6 → 8

      const totalRounds = Math.log2(size);
      const allMatches = [];

      // bikin semua match kosong
      for (let round = 1; round <= totalRounds; round++) {
        const numMatches = size / Math.pow(2, round);
        for (let slot = 1; slot <= numMatches; slot++) {
          const match = await Match.create({
            baganId: bagan.id,
            round,
            slot,
            peserta1Id: null,
            peserta2Id: null,
          });
          allMatches.push(match);
        }
      }

      // link nextMatchId (biar otomatis winner naik babak)
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
    // Ambil semua bagan tanpa filter
    const bagans = await Bagan.findAll();
    
    // Kirim data bagan ke frontend
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

