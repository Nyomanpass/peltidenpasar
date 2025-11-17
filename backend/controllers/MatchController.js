import { Match } from "../models/MatchModel.js";
import { Peserta } from "../models/PesertaModel.js";
import { Bagan } from "../models/BaganModel.js";
import { Jadwal } from "../models/JadwalModel.js";

const _processMatchPeserta = async (matchId, peserta1Id, peserta2Id) => {
  const match = await Match.findByPk(matchId);
  if (!match) return null;

  let newStatus = match.status;
  let newWinnerId = match.winnerId;

  if (peserta1Id !== null && peserta2Id === null) {
    newStatus = "selesai";
    newWinnerId = peserta1Id;
  } else if (peserta1Id === null && peserta2Id !== null) {
    newStatus = "selesai";
    newWinnerId = peserta2Id;
  } else {
    newStatus = "belum";
    newWinnerId = null;
  }

  const isNowRegularMatch = peserta1Id !== null && peserta2Id !== null;
  const wasByeMatch = match.peserta1Id === null || match.peserta2Id === null;
  
  if (match.status === "selesai" && wasByeMatch && isNowRegularMatch) {
    const winnerToUndo = match.winnerId;
    if (match.nextMatchId) {
      const nextMatch = await Match.findByPk(match.nextMatchId);
      if (nextMatch) {
        if (nextMatch.peserta1Id === winnerToUndo) {
          nextMatch.peserta1Id = null;
        } else if (nextMatch.peserta2Id === winnerToUndo) {
          nextMatch.peserta2Id = null;
        }
        await nextMatch.save();
      }
    }
  }

  match.peserta1Id = peserta1Id;
  match.peserta2Id = peserta2Id;
  match.status = newStatus;
  match.winnerId = newWinnerId;
  await match.save();

  if (newStatus === "selesai" && match.nextMatchId) {
    const nextMatch = await Match.findByPk(match.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.peserta1Id) {
        nextMatch.peserta1Id = newWinnerId;
      } else {
        nextMatch.peserta2Id = newWinnerId;
      }
      await nextMatch.save();
    }
  }

  return await Match.findByPk(matchId, {
    include: [{ model: Peserta, as: "peserta1" }, { model: Peserta, as: "peserta2" }],
  });
};


export const updateWinner = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { winnerId, score1, score2 } = req.body;

    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ msg: "Match tidak ditemukan" });

    // 1. Perbarui data match
    match.winnerId = winnerId;
    match.score1 = score1;
    match.score2 = score2;
    match.status = "selesai";
    await match.save();

    // 2. Tambahkan logika untuk memperbarui jadwal
    const jadwal = await Jadwal.findOne({
      where: { matchId: matchId }
    });

    if (jadwal) {
      jadwal.status = "selesai";
      await jadwal.save();
    }

    // 3. Promosikan pemenang ke match berikutnya di bagan
    if (match.nextMatchId) {
      const next = await Match.findByPk(match.nextMatchId);
      if (next) {
        if (!next.peserta1Id) next.peserta1Id = winnerId;
        else next.peserta2Id = winnerId;
        await next.save();
      }
    }

    res.json({ msg: "Match diupdate", match });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const setMatchPeserta = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { peserta1Id, peserta2Id } = req.body;

    const updatedMatch = await _processMatchPeserta(matchId, peserta1Id, peserta2Id);
    if (!updatedMatch) return res.status(404).json({ msg: "Match tidak ditemukan" });

    res.json(updatedMatch);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🔹 Helper untuk menempatkan BYE
function placeByes(initialSlots, assignedSlots, byeSlotsCount, seededPeserta) {
  const totalMatches = initialSlots.length / 2;
  // atur minimal gap berdasarkan ukuran bagan
  const gapMin = totalMatches <= 4 ? 2 : 1;  

  // 1. Utamakan BYE melawan peserta seeded
  for (const seed of seededPeserta) {
    if (byeSlotsCount <= 0) break;
    const slotIndex = seed.slot - 1;
    const opponentIndex = slotIndex % 2 === 0 ? slotIndex + 1 : slotIndex - 1;
    if (!assignedSlots.has(opponentIndex)) {
      initialSlots[opponentIndex] = null;
      assignedSlots.add(opponentIndex);
      byeSlotsCount--;
    }
  }

  if (byeSlotsCount <= 0) return;

  // 2. Buat daftar pasangan (pertandingan)
  let pairs = [];
  for (let i = 0; i < initialSlots.length; i += 2) {
    if (!assignedSlots.has(i) || !assignedSlots.has(i + 1)) {
      pairs.push([i, i + 1]);
    }
  }

  // 3. Acak pasangan
  pairs = shuffle(pairs);

  let lastUsedIndex = -gapMin - 1;

  // 4. Taruh BYE tersebar dengan jarak minimal
  for (let idx = 0; idx < pairs.length && byeSlotsCount > 0; idx++) {
    const [a, b] = pairs[idx];

    if (idx - lastUsedIndex < gapMin) continue;

    if (!assignedSlots.has(a) && !assignedSlots.has(b)) {
      const slotPilihan = Math.random() < 0.5 ? a : b;
      initialSlots[slotPilihan] = null;
      assignedSlots.add(slotPilihan);
      byeSlotsCount--;
      lastUsedIndex = idx;
    }
  }

  // 5. Kalau masih ada sisa BYE, isi pasangan tersisa
  for (let idx = 0; idx < pairs.length && byeSlotsCount > 0; idx++) {
    const [a, b] = pairs[idx];
    if (!assignedSlots.has(a) && !assignedSlots.has(b)) {
      const slotPilihan = Math.random() < 0.5 ? a : b;
      initialSlots[slotPilihan] = null;
      assignedSlots.add(slotPilihan);
      byeSlotsCount--;
    }
  }
}


export const generateUndian = async (req, res) => {
  try {
    const { id } = req.params;
    const { seededPeserta = [] } = req.body;

    const bagan = await Bagan.findByPk(id);
    if (!bagan) return res.status(404).json({ msg: "Bagan tidak ditemukan" });
    const tournamentId = bagan.tournamentId;
    const allPeserta = await Peserta.findAll({
      where: { 
        kelompokUmurId: bagan.kelompokUmurId,
        tournamentId: bagan.tournamentId,      // ← TAMBAHKAN INI
        status: "verified"
      },
    });


    const seededIds = new Set(seededPeserta.map((p) => p.id));
    const nonSeededPeserta = allPeserta.filter((p) => !seededIds.has(p.id));
    const totalPeserta = allPeserta.length;
    let bracketSize = 2;
    while (bracketSize < totalPeserta) {
      bracketSize *= 2;
    }
    

    const initialSlots = new Array(bracketSize).fill(null);
    const assignedSlots = new Set();


    for (const seed of seededPeserta) {
      const slotIndex = seed.slot - 1;
      if (slotIndex >= 0 && slotIndex < bracketSize) {
        initialSlots[slotIndex] = seed.id;
        assignedSlots.add(slotIndex);
      }
    }


    let byeSlotsCount = bracketSize - totalPeserta;


    placeByes(initialSlots, assignedSlots, byeSlotsCount, seededPeserta);


    const shuffledNonSeeded = shuffle(nonSeededPeserta.map(p => p.id));
    let poolIndex = 0;

   
    for (let i = 0; i < bracketSize; i++) {
      if (!assignedSlots.has(i)) {
        if (poolIndex < shuffledNonSeeded.length) {
          initialSlots[i] = shuffledNonSeeded[poolIndex];
          poolIndex++;
        }
      }
    }

    await Match.destroy({ where: { baganId: id } });

    let matchCount = bracketSize / 2;
    let round = 1;
    let matchesToCreate = [];

    while (matchCount >= 1) {
      for (let i = 0; i < matchCount; i++) {
        let peserta1Id = null;
        let peserta2Id = null;
        
        if (round === 1) {
          peserta1Id = initialSlots[i * 2];
          peserta2Id = initialSlots[i * 2 + 1];
        }

        matchesToCreate.push({
          baganId: id,
          round: round,
          slot: i + 1,
          peserta1Id: peserta1Id,
          peserta2Id: peserta2Id,
          nextMatchId: null,
          tournamentId: tournamentId
        });
      }
      matchCount /= 2;
      round++;
    }

    const createdMatches = await Match.bulkCreate(matchesToCreate);
    
    const finalMatches = await Match.findAll({
      where: { baganId: id },
      order: [['round', 'ASC'], ['slot', 'ASC']]
    });


    for (const match of finalMatches) {
      if (match.round === (round - 1)) {
        continue; 
      }

      const nextRoundSlot = Math.ceil(match.slot / 2);
      const nextRoundMatch = finalMatches.find(
        (m) => m.round === match.round + 1 && m.slot === nextRoundSlot
      );

      if (nextRoundMatch) {
        await Match.update(
          { nextMatchId: nextRoundMatch.id },
          { where: { id: match.id } }
        );
      }
    }


    for (const match of finalMatches.filter(m => m.round === 1)) {
      if (match.peserta1Id === null || match.peserta2Id === null) {
        await _processMatchPeserta(match.id, match.peserta1Id, match.peserta2Id);
      }
    }

    res.status(200).json({ msg: "Pengundian dan pembuatan bagan berhasil" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getUnscheduledMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: { status: "belum" }, 
      include: [
        { model: Jadwal, required: false }, 
        { model: Peserta, as: "peserta1" },
        { model: Peserta, as: "peserta2" },
      ],
    });

    const filtered = matches.filter(m => !m.Jadwal); 
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getMatches = async (req, res) => {
  try {
    const { baganId, tournamentId } = req.query;

    const whereCondition = {
      status: "belum",
    };

    if (baganId) {
      whereCondition.baganId = baganId;
    }

    if (tournamentId) {
      whereCondition.tournamentId = tournamentId;
    }

    const matches = await Match.findAll({
      where: whereCondition,
      include: [
        { model: Peserta, as: "peserta1", attributes: ["id", "namaLengkap"] },
        { model: Peserta, as: "peserta2", attributes: ["id", "namaLengkap"] },
        { model: Bagan, as: "bagan" },
      ],
    });

    res.status(200).json(matches);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getJuara = async (req, res) => {
  try {
    const { baganId } = req.params;
    if (!baganId) return res.status(400).json({ error: "ID Bagan tidak diberikan." });

    const bagan = await Bagan.findByPk(baganId);
    if (!bagan) return res.status(404).json({ error: "Bagan tidak ditemukan." });

    if (bagan.tipe === "knockout") {
      // 🔹 Logika knockout (punyamu yang sekarang)
      const finalMatch = await Match.findOne({
        where: { baganId, status: "selesai" },
        order: [["round", "DESC"]],
        include: [
          { model: Peserta, as: "peserta1", attributes: ["id", "namaLengkap"] },
          { model: Peserta, as: "peserta2", attributes: ["id", "namaLengkap"] },
        ],
      });

      if (!finalMatch) {
        return res.status(404).json({ message: "Belum ada match selesai." });
      }

      const juara1 = finalMatch.winnerId === finalMatch.peserta1Id ? finalMatch.peserta1 : finalMatch.peserta2;
      const juara2 = finalMatch.winnerId === finalMatch.peserta1Id ? finalMatch.peserta2 : finalMatch.peserta1;

      const semiFinalMatches = await Match.findAll({
        where: { baganId, round: finalMatch.round - 1, status: "selesai" },
        include: [
          { model: Peserta, as: "peserta1", attributes: ["id", "namaLengkap"] },
          { model: Peserta, as: "peserta2", attributes: ["id", "namaLengkap"] },
        ],
      });

      const juara3 = semiFinalMatches.map(m =>
        m.winnerId === m.peserta1Id ? m.peserta2 : m.peserta1
      );

      return res.json({ juara1, juara2, juara3 });
    } 
    
    // 🔹 Logika round robin
    else if (bagan.tipe === "roundrobin") {
      const matches = await Match.findAll({
        where: { baganId, status: "selesai" },
        include: [
          { model: Peserta, as: "peserta1", attributes: ["id", "namaLengkap"] },
          { model: Peserta, as: "peserta2", attributes: ["id", "namaLengkap"] },
        ],
      });

      if (!matches.length) {
        return res.status(404).json({ message: "Belum ada match selesai." });
      }

      // Tabel klasemen
      const klasemen = {};

      for (const match of matches) {
        const { peserta1, peserta2, winnerId, score1, score2 } = match;

        // Pastikan peserta masuk di klasemen
        [peserta1, peserta2].forEach(p => {
          if (!klasemen[p.id]) {
            klasemen[p.id] = {
              peserta: p,
              poin: 0,
              menang: 0,
              kalah: 0,
              seri: 0,
              selisih: 0,
            };
          }
        });

        if (winnerId === peserta1.id) {
          klasemen[peserta1.id].poin += 3;
          klasemen[peserta1.id].menang++;
          klasemen[peserta2.id].kalah++;
        } else if (winnerId === peserta2.id) {
          klasemen[peserta2.id].poin += 3;
          klasemen[peserta2.id].menang++;
          klasemen[peserta1.id].kalah++;
        } else {
          // Kalau ada hasil seri
          klasemen[peserta1.id].poin += 1;
          klasemen[peserta2.id].poin += 1;
          klasemen[peserta1.id].seri++;
          klasemen[peserta2.id].seri++;
        }

        // Update selisih skor (kalau ada score)
        if (score1 != null && score2 != null) {
          klasemen[peserta1.id].selisih += score1 - score2;
          klasemen[peserta2.id].selisih += score2 - score1;
        }
      }

      // Urutkan klasemen
      const ranking = Object.values(klasemen).sort((a, b) => {
        if (b.poin !== a.poin) return b.poin - a.poin;
        if (b.selisih !== a.selisih) return b.selisih - a.selisih;
        return b.menang - a.menang; // fallback
      });

      const juara1 = ranking[0]?.peserta || null;
      const juara2 = ranking[1]?.peserta || null;
      const juara3 = ranking[2]?.peserta || null;

      return res.json({ juara1, juara2, juara3, klasemen: ranking });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data juara." });
  }
};


