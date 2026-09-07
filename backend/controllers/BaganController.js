import { Bagan } from "../models/BaganModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";
import { Match } from "../models/MatchModel.js";
import { Peserta } from "../models/PesertaModel.js";
import { Tournament } from "../models/TournamentModel.js"; // Import model tournament
import { DoubleTeam } from "../models/DoubleTeamModel.js"; // Pastikan diimport

export const createBagan = async (req, res) => {
  try {
    const { kelompokUmurId, tournamentId, kategori } = req.body;
    const isDouble = kategori === "double";

    const kelompokumur = await KelompokUmur.findByPk(kelompokUmurId);
    if (!kelompokumur) return res.status(404).json({ msg: "Kelompok umur tidak ditemukan." });

    // 1. Ambil data peserta/tim berdasarkan kategori
    let listPeserta = [];
    if (isDouble) {
      listPeserta = await DoubleTeam.findAll({
        where: { kelompokUmurId: kelompokUmurId, tournamentId, status: "verified" }
      });
    } else {
      listPeserta = await Peserta.findAll({
        where: { kelompokUmurId, tournamentId, status: "verified" }
      });
    }

    const jumlah = listPeserta.length;
    if (jumlah === 0) return res.status(400).json({ msg: "Tidak ada peserta terverifikasi." });

    // 2. Tentukan tipe (Contoh: <= 4 orang maka Round Robin)
    let tipe = "roundrobin";
    if (jumlah > 4) tipe = "knockout";

    // 3. Hitung struktur bracket (sub-bagan / preliminary)
    const { bracketSize, preliminaryCount } = calculateBracketStructure(jumlah);
    const hasPreliminary = tipe === "knockout" && preliminaryCount > 0;

    const bagan = await Bagan.create({
      nama: `${isDouble ? '(Ganda)' : '(Tunggal)'} ${kelompokumur.nama}`,
      tipe,
      jumlahPeserta: jumlah,
      kelompokUmurId,
      tournamentId,
      kategori: kategori || "single",
      status: "draft",
      hasPreliminary,
    });

    // --- LOGIKA ROUND ROBIN ---
    if (tipe === "roundrobin") {
      for (let i = 0; i < jumlah; i++) {
        for (let j = i + 1; j < jumlah; j++) {
          const matchObj = {
            baganId: bagan.id,
            round: 1,
            slot: i + 1,
            tournamentId,
            status: "belum"
          };

          // Masukkan ID ke kolom yang sesuai
          if (isDouble) {
            matchObj.doubleTeam1Id = listPeserta[i].id;
            matchObj.doubleTeam2Id = listPeserta[j].id;
          } else {
            matchObj.peserta1Id = listPeserta[i].id;
            matchObj.peserta2Id = listPeserta[j].id;
          }

          await Match.create(matchObj);
        }
      }
    }

    // --- LOGIKA KNOCKOUT DENGAN SUB-BAGAN (PRELIMINARY) ---
    else {
      const allMatches = [];
      const totalRounds = Math.log2(bracketSize);

      // Buat match babak kualifikasi (round 0) jika ada
      if (preliminaryCount > 0) {
        for (let slot = 1; slot <= preliminaryCount; slot++) {
          const match = await Match.create({
            baganId: bagan.id,
            round: 0,  // Round 0 = babak kualifikasi
            slot,
            tournamentId,
            status: "belum"
          });
          allMatches.push(match);
        }
      }

      // Buat match bagan utama (round 1 sampai final)
      for (let round = 1; round <= totalRounds; round++) {
        const numMatches = bracketSize / Math.pow(2, round);
        for (let slot = 1; slot <= numMatches; slot++) {
          const match = await Match.create({
            baganId: bagan.id,
            round,
            slot,
            tournamentId,
            status: "belum"
          });
          allMatches.push(match);
        }
      }

      // Hubungkan nextMatchId untuk bagan utama (round 1+ ke round berikutnya)
      for (let m of allMatches) {
        if (m.round >= 1 && m.round < totalRounds) {
          const nextSlot = Math.ceil(m.slot / 2);
          const next = allMatches.find(nm => nm.round === m.round + 1 && nm.slot === nextSlot);
          if (next) {
            m.nextMatchId = next.id;
            await m.save();
          }
        }
      }

      // Hubungkan nextMatchId untuk match kualifikasi (round 0 → round 1)
      // Match kualifikasi slot N → masuk ke match round 1 slot terakhir yang tersedia
      if (preliminaryCount > 0) {
        const round1Matches = allMatches
          .filter(m => m.round === 1)
          .sort((a, b) => a.slot - b.slot);

        // Pemenang kualifikasi masuk ke slot round 1 dari belakang
        // (peserta seed rendah di bagian bawah bracket)
        for (let i = 0; i < preliminaryCount; i++) {
          const prelimMatch = allMatches.find(m => m.round === 0 && m.slot === i + 1);
          // Target: match round 1 terakhir, mundur sesuai jumlah kualifikasi
          const targetR1Index = round1Matches.length - 1 - i;
          if (prelimMatch && targetR1Index >= 0) {
            prelimMatch.nextMatchId = round1Matches[targetR1Index].id;
            await prelimMatch.save();
          }
        }
      }
    }

    res.status(201).json({ msg: "Bagan berhasil dibuat", bagan });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};


export const getBaganWithMatches = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Ambil data dasar bagan dulu untuk cek kategori
    const checkBagan = await Bagan.findByPk(id);
    if (!checkBagan) return res.status(404).json({ msg: "Bagan tidak ditemukan" });

    const isDouble = checkBagan.kategori === "double";

    // 2. Tentukan relasi Match yang akan di-include
    const matchInclude = isDouble ? [
      { 
        model: DoubleTeam, as: "doubleTeam1", 
        attributes: ['id', 'namaTim', 'isSeeded'], // Ambil isSeeded dari tabel DoubleTeam
        include: [
          { model: Peserta, as: "Player1", attributes: ['namaLengkap'] },
          { model: Peserta, as: "Player2", attributes: ['namaLengkap'] }
        ] 
      },
      { 
        model: DoubleTeam, as: "doubleTeam2", 
        attributes: ['id', 'namaTim', 'isSeeded'], // Ambil isSeeded dari tabel DoubleTeam
        include: [
          { model: Peserta, as: "Player1", attributes: ['namaLengkap'] },
          { model: Peserta, as: "Player2", attributes: ['namaLengkap'] }
        ] 
      },
      { model: DoubleTeam, as: "winnerDouble" }
    ] : [
      { 
        model: Peserta, as: "peserta1", 
        attributes: ['id', 'namaLengkap', 'isSeeded'] // Ambil isSeeded dari tabel Peserta
      },
      { 
        model: Peserta, as: "peserta2", 
        attributes: ['id', 'namaLengkap', 'isSeeded'] // Ambil isSeeded dari tabel Peserta
      },
      { model: Peserta, as: "winner" }
    ];

    // 3. Eksekusi Query Utama
    const bagan = await Bagan.findByPk(id, {
      include: [
        { model: Tournament, attributes: ['name'] },
        { 
          model: Match, 
          include: matchInclude 
        },
      ],
      order: [[Match, 'round', 'ASC'], [Match, 'slot', 'ASC']]
    });

    res.json(bagan);
  } catch (err) {
    console.error("Error getBaganWithMatches:", err);
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

export const lockBagan = async (req, res) => {
  try {
    const { id } = req.params;
    const bagan = await Bagan.findByPk(id);

    if (!bagan) {
      return res.status(404).json({ message: "Bagan tidak ditemukan" });
    }

    // Update isLocked menjadi true (1)
    await bagan.update({ isLocked: true });

    res.status(200).json({ message: "Bagan berhasil dikunci!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================
// Helper: Hitung struktur bracket sub-bagan
// =============================================
// Bulatkan ke BAWAH ke pangkat 2 terdekat, selisihnya jadi babak kualifikasi.
// Contoh: 9 peserta → P=8, extra=1 → 1 match kualifikasi + bracket 8
// Contoh: 13 peserta → P=8, extra=5 → 5 match kualifikasi + bracket 8
// Kalau n sudah pangkat 2 → extra=0, tidak ada kualifikasi
export function calculateBracketStructure(n) {
  if (n <= 1) return { bracketSize: 2, preliminaryCount: 0 };
  const P = Math.pow(2, Math.floor(Math.log2(n)));
  const extra = n - P;
  return {
    bracketSize: P,           // ukuran bagan utama (bersih, tanpa BYE)
    preliminaryCount: extra,  // jumlah match kualifikasi (round 0)
  };
}