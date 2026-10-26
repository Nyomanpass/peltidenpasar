import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";
import { exportBaganPdf } from "../utils/exportBaganPdf";
import api from "../api"; // Mengimpor instans axios dari file api.js
import { Info, Star, Users, FileText, Loader2 } from "lucide-react";
import AlertMessage from "../components/AlertMessage";

// Modal
import PesertaModal from "../components/modalbox/PesertaModal";
import WinnerModal from "../components/modalbox/WinnerModal";
import SeedingModal from "../components/modalbox/SeedingModal";

export default function BaganView({baganId}) {
  const { id } = useParams();
  const [bagan, setBagan] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [allPeserta, setAllPeserta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingLoading, setIsSeedingLoading] = useState(false); 
  const [byeSlotsCount, setByeSlotsCount] = useState(0);
  const role = localStorage.getItem('role')
  const tournamentId = localStorage.getItem("selectedTournament");
  const finalId = baganId || id;
  const isRoundRobin = bagan?.tipe === "roundrobin";
  const [isLocked, setIsLocked] = useState(false);
  const [tiebreakSummary, setTiebreakSummary] = useState({});
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  const [drawStage, setDrawStage] = useState("rolling"); 
  const [rollingName, setRollingName] = useState("");
  const [currentSlotInfo, setCurrentSlotInfo] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);





  // Load data bagan menggunakan axios
  const loadBagan = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bagan/${finalId}`);
      const data = res.data; // Mengakses data dari properti .data
      setBagan(data);
      await fetchTiebreakForBagan(data.Matches);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

const getTiebreakFromLogs = (allLogs, setNum, finalS1, finalS2, gameLimit = 6) => {
  // Ambil semua log untuk set ini saja
  const setLogs = allLogs
    .filter(log => log.setKe === setNum)
    .sort((a, b) => a.id - b.id);

  if (setLogs.length === 0) return null;

  // --- LOGIKA KHUSUS SET 3 (SUPER TIEBREAK) ---
  // Kita cek jika ini set 3, ambil log paling terakhir untuk poinnya
  if (setNum === 3) {
    const lastLog = setLogs[setLogs.length - 1];
    return {
      p1: parseInt(lastLog.skorP1) || 0,
      p2: parseInt(lastLog.skorP2) || 0,
    };
  }

  // --- LOGIKA TIEBREAK NORMAL (SET 1 & 2) ---
  const isRealTiebreak =
    Math.abs(finalS1 - finalS2) === 1 &&
    (finalS1 >= gameLimit || finalS2 >= gameLimit);

  if (!isRealTiebreak) return null;

  let tbEndIndex = -1;
  for (let i = 0; i < setLogs.length - 1; i++) {
    if (setLogs[i].gameP1 !== setLogs[i + 1].gameP1 || 
        setLogs[i].gameP2 !== setLogs[i + 1].gameP2) {
      tbEndIndex = i;
    }
  }

  if (tbEndIndex === -1) return null;

  const lastTbLog = setLogs[tbEndIndex];
  let p1 = parseInt(lastTbLog.skorP1) || 0;
  let p2 = parseInt(lastTbLog.skorP2) || 0;

  // Tambah 1 ke pemenang set karena log poin terakhir biasanya terputus saat game berganti
  if (finalS1 > finalS2) p1 += 1; else p2 += 1;

  return { p1, p2 };
};

const fetchTiebreakForBagan = async (matches) => {
  const newTb = {};

  for (const match of matches) {
    try {
      const logRes = await api.get(`/match-logs/${match.id}`);
      if (!logRes.data?.length) continue;

      const sortedLogs = [...logRes.data].sort((a, b) => a.id - b.id);
      const tbData = {};

      [1, 2, 3].forEach((sNum) => {
        const s1 = parseInt(match[`set${sNum}P1`]);
        const s2 = parseInt(match[`set${sNum}P2`]);

        const gameLimit = match.scoreRule?.gamePerSet || 6;

        const result = getTiebreakFromLogs(
          sortedLogs,
          sNum,
          s1,
          s2,
          gameLimit
        );
        if (result) {
          tbData[`set${sNum}`] = result;
        }
      });

      if (Object.keys(tbData).length > 0) {
        newTb[match.id] = tbData;
      }

    } catch (err) {
      console.error(err);
    }
  }

  setTiebreakSummary(newTb);
};

const formatSetScore = (m) => {
  const sets = [];

  for (let i = 1; i <= 3; i++) {
    const s1 = parseInt(m[`set${i}P1`]);
    const s2 = parseInt(m[`set${i}P2`]);
    const tbPoint = tiebreakSummary[m.id]?.[`set${i}`];

    if (isNaN(s1) || isNaN(s2)) continue;

    // ❌ Skip set kosong
    if (s1 === 0 && s2 === 0 && !tbPoint) continue;

    // 🔥 SET 3 = SUPER TIEBREAK (hanya tampil point)
    if (i === 3 && tbPoint) {
      sets.push(`${tbPoint.p1}-${tbPoint.p2}`);
      continue;
    }

    // 🔥 NORMAL TIEBREAK (kalau ada tbPoint berarti memang tiebreak)
    if (tbPoint) {
      sets.push(`${s1}-${s2}(${tbPoint.p1}-${tbPoint.p2})`);
    } else {
      sets.push(`${s1}-${s2}`);
    }
  }

  return sets.join(" ");
};

  const loadAllPeserta = async (kelompokUmurId) => {
    try {
      const isDouble = bagan?.kategori === "double";
      const endpoint = isDouble ? '/double-teams' : '/pesertafilter';
      
      const res = await api.get(endpoint, {
        params: {
          kelompokUmurId: kelompokUmurId,
          status: 'verified',
          tournamentId
        }
      });
      
      const data = res.data;
      setAllPeserta(data);
      
      const totalPeserta = data.length;
      // Sub-bagan: bulatkan ke BAWAH ke pangkat 2
      const P = Math.pow(2, Math.floor(Math.log2(totalPeserta)));
      const extra = totalPeserta - P;
      // Kalau ada sub-bagan, tidak ada BYE. Kalau tidak, hitung BYE biasa.
      if (extra > 0) {
        setByeSlotsCount(0); // Sub-bagan menghilangkan BYE
      } else {
        setByeSlotsCount(0); // Pas pangkat 2, tidak ada BYE
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBagan();
  }, [id]);

  useEffect(() => {
    if (bagan && bagan.kelompokUmurId) {
      loadAllPeserta(bagan.kelompokUmurId);
    }
  }, [bagan]);

  
const handleLockBagan = async () => {
  try {
    setIsLoading(true);
    await api.patch(`/bagan/${finalId}/lock`);
    await loadBagan();

    setAlertType("success");
    setAlertMessage("Bagan berhasil dikunci dan tidak bisa diubah lagi.");
  } catch (error) {
    setAlertType("error");
    setAlertMessage("Gagal mengunci bagan.");
  } finally {
    setIsLoading(false);
    setShowLockConfirm(false);
  }
};


  // Lakukan pengundian menggunakan axios
const handleUndian = async (seededPeserta, byeSlots) => {
  setIsSeedingLoading(true);
  setDrawStage("rolling");
  setModalType(null);

  try {
    await api.post(`/bagan/${id}/undian`, { seededPeserta, byeSlots });

    const res = await api.get(`/bagan/${finalId}`);
    const newBagan = res.data;

    startVisualDraw(newBagan);

  } catch (error) {
    console.error(error);
  }
};

const startVisualDraw = (newBagan) => {

  const matches = newBagan.Matches
    .filter(m => m.round === 1);

  if (!matches.length) return;

  const isDouble = newBagan.kategori === "double";

  const getName = (match, index) => {
    if (isDouble) {
      const team = index === 1 ? match.doubleTeam1 : match.doubleTeam2;
      if (!team) return "BYE";
      return `${team.Player1?.namaLengkap} / ${team.Player2?.namaLengkap}`;
    } else {
      const peserta = index === 1 ? match.peserta1 : match.peserta2;
      return peserta?.namaLengkap || "BYE";
    }
  };

  setDrawStage("rolling");

  let speed = 80;
  let totalTime = 0;
  let rollingInterval;

  const startRolling = () => {
    rollingInterval = setInterval(() => {
      const randomMatch =
        matches[Math.floor(Math.random() * matches.length)];

      const p1 = getName(randomMatch, 1);
      const p2 = getName(randomMatch, 2);

      setRollingName(`${p1} VS ${p2}`);
    }, speed);
  };

  startRolling();

  const slowdownTimer = setInterval(() => {
    totalTime += 1000;

    if (totalTime >= 3000) {
      speed += 40;
      clearInterval(rollingInterval);
      startRolling();
    }

    if (totalTime >= 10000) {
      clearInterval(rollingInterval);
      clearInterval(slowdownTimer);

      setDrawStage("slots");
      revealSlots([...matches], newBagan);
    }
  }, 1000);
};



const revealSlots = (matches, newBagan) => {

  const isDouble = newBagan.kategori === "double";

  const getName = (match, index) => {
    if (isDouble) {
      const team = index === 1 ? match.doubleTeam1 : match.doubleTeam2;
      if (!team) return "BYE";
      return `${team.Player1?.namaLengkap} / ${team.Player2?.namaLengkap}`;
    } else {
      const peserta = index === 1 ? match.peserta1 : match.peserta2;
      return peserta?.namaLengkap || "BYE";
    }
  };

  let index = 0;

  if (matches.length > 0) {
    const firstMatch = matches[0];

    setCurrentSlotInfo({
      slot: 1,
      p1: getName(firstMatch, 1),
      p2: getName(firstMatch, 2)
    });

    index = 1;
  }

  const slotInterval = setInterval(() => {

    if (index >= matches.length) {
      clearInterval(slotInterval);

      setTimeout(() => {
        setBagan(newBagan);
        setIsSeedingLoading(false);
        setDrawStage("done");
      }, 1500);

      return;
    }

    const match = matches[index];

    setCurrentSlotInfo({
      slot: index + 1,
      p1: getName(match, 1),
      p2: getName(match, 2)
    });

    index++;

  }, 2000);
};





  if (!bagan) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Memuat Bagan...</p>
        </div>
      </div>
    );
  }
  
  // Konversi Matches ke format react-brackets
  const roundsMap = {};
  const isDouble = bagan.kategori === "double"; 

  // Urutkan matches per round dan slot
  const sortedMatches = [...bagan.Matches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.slot - b.slot;
  });

  const prelimMatches = sortedMatches.filter((m) => m.round === 0);
  const round1Matches = sortedMatches.filter((m) => m.round === 1);
  const otherMatches = sortedMatches.filter((m) => m.round > 1);

  // 1. Babak Kualifikasi (Round 0) jika ada
  // Sejajarkan posisi seed kualifikasi dengan match babak 1 yang dituju
  if (prelimMatches.length > 0 && round1Matches.length > 0) {
    roundsMap[0] = [];

    round1Matches.forEach((r1, r1Idx) => {
      // Cari match kualifikasi yang terhubung ke match round 1 ini
      let pMatch = prelimMatches.find((pm) => pm.nextMatchId === r1.id);

      // Fallback jika nextMatchId belum tersimpan: pasangkan dari slot paling bawah
      if (!pMatch) {
        const prelimIndex = r1Idx - (round1Matches.length - prelimMatches.length);
        if (prelimIndex >= 0 && prelimIndex < prelimMatches.length) {
          pMatch = prelimMatches[prelimIndex];
        }
      }

      if (pMatch) {
        roundsMap[0].push({
          id: pMatch.id,
          teams: [
            { name: isDouble ? (pMatch.doubleTeam1?.namaTim || "BYE") : (pMatch.peserta1?.namaLengkap || "BYE") },
            { name: isDouble ? (pMatch.doubleTeam2?.namaTim || "BYE") : (pMatch.peserta2?.namaLengkap || "BYE") },
          ],
          raw: pMatch,
          isPrelim: true,
          targetMatchId: r1.id,
        });
      } else {
        roundsMap[0].push({
          id: `placeholder-r1-${r1.id || r1Idx}`,
          isPlaceholder: true,
          raw: null,
        });
      }
    });
  }

  // 2. Babak Utama (Round 1)
  roundsMap[1] = round1Matches.map((m) => ({
    id: m.id,
    teams: [
      { name: isDouble ? (m.doubleTeam1?.namaTim || "BYE") : (m.peserta1?.namaLengkap || "BYE") },
      { name: isDouble ? (m.doubleTeam2?.namaTim || "BYE") : (m.peserta2?.namaLengkap || "BYE") },
    ],
    raw: m,
  }));

  // 3. Babak Selanjutnya (Round 2+)
  otherMatches.forEach((m) => {
    if (!roundsMap[m.round]) roundsMap[m.round] = [];
    roundsMap[m.round].push({
      id: m.id,
      teams: [
        { name: isDouble ? (m.doubleTeam1?.namaTim || "BYE") : (m.peserta1?.namaLengkap || "BYE") },
        { name: isDouble ? (m.doubleTeam2?.namaTim || "BYE") : (m.peserta2?.namaLengkap || "BYE") },
      ],
      raw: m,
    });
  });

  // Buat label babak (tanpa icon)
  const getRoundTitle = (roundNum, totalMainRounds) => {
    const r = Number(roundNum);
    if (r === 0) return "Kualifikasi";
    if (r === totalMainRounds) return "Final";
    if (r === totalMainRounds - 1) return "Semi Final";
    if (r === totalMainRounds - 2) return "Perempat Final";
    return `Babak ${r}`;
  };

  const mainRounds = Object.keys(roundsMap).filter(r => Number(r) >= 1);
  const totalMainRounds = mainRounds.length > 0 ? Math.max(...mainRounds.map(Number)) : 1;

  const rounds = Object.keys(roundsMap)
    .sort((a, b) => a - b)
    .map((round) => ({
      title: getRoundTitle(round, totalMainRounds),
      seeds: roundsMap[round],
    }));

// --- GANTI BAGIAN JUARA INI ---
  const finalRound = Math.max(...bagan.Matches.map((m) => m.round));
  const finalMatch = bagan.Matches.find((m) => m.round === finalRound);

  let juara = null;

  let juaraRR = null;

if (isRoundRobin) {
  const klasemen = {};
  let semuaSelesai = true;

  bagan.Matches.forEach(m => {
    const p1 = isDouble ? m.doubleTeam1 : m.peserta1;
    const p2 = isDouble ? m.doubleTeam2 : m.peserta2;
    const wId = isDouble ? m.winnerDoubleId : m.winnerId;

    // ⛔ kalau ada match belum ada pemenang
    if (!wId) semuaSelesai = false;

    if (!p1 || !p2) return;

    [p1, p2].forEach(p => {
      if (!klasemen[p.id]) {
        klasemen[p.id] = { peserta: p, poin: 0 };
      }
    });

    if (wId === p1.id) klasemen[p1.id].poin += 3;
    if (wId === p2.id) klasemen[p2.id].poin += 3;
  });

  if (semuaSelesai) {
    const ranking = Object.values(klasemen).sort((a,b)=>b.poin-a.poin);
    juaraRR = ranking[0]?.peserta || null;
  } else {
    juaraRR = null; // ❗ BELUM ADA JUARA
  }
}

  
  if (finalMatch) {
    if (isDouble && finalMatch.winnerDoubleId) {
      const winner = finalMatch.winnerDoubleId === finalMatch.doubleTeam1Id ? finalMatch.doubleTeam1 : finalMatch.doubleTeam2;
      juara = winner ? `${winner.Player1?.namaLengkap} / ${winner.Player2?.namaLengkap}` : "TBD";
    } else if (!isDouble && finalMatch.winnerId) {
      juara = finalMatch.winnerId === finalMatch.peserta1Id ? finalMatch.peserta1?.namaLengkap : finalMatch.peserta2?.namaLengkap;
    }
  }

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportBaganPdf({
        bagan,
        rounds,
        isRoundRobin,
        isDouble,
        finalRound,
        juara,
        juaraRR,
        formatSetScore,
      });
    } catch (err) {
      console.error(err);
      alert("Export gagal. Coba reload halaman.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-full mx-auto mb-10">

        {/* ===== PAGE HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          {/* Kiri: Info & Judul */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {isRoundRobin ? "Round Robin" : "Eliminasi"}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isDouble
                  ? "bg-sky-50 text-sky-700 border border-sky-200/60"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}>
                {isDouble ? "Ganda" : "Tunggal"}
              </span>
              {bagan.isLocked && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                  🔒 Dikunci
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {bagan.nama}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {bagan.Tournament?.name || "PELTI Denpasar"} · {bagan.KelompokUmur?.nama || ""}
            </p>
          </div>

          {/* Kanan: Tombol Aksi */}
          {(role === "admin" || role === "panitia") && (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* Tombol Undian */}
              {!bagan.isLocked && !isRoundRobin && (
                <button
                  onClick={() => setModalType("seeding")}
                  disabled={isSeedingLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-600 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pengundian
                </button>
              )}

              {/* Tombol Kunci */}
              {!bagan.isLocked && (
                <button
                  onClick={() => setShowLockConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
                >
                   Kunci Bagan
                </button>
              )}

              {/* Tombol Export PDF */}
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
              >
                {isExportingPDF ? (
                  <Loader2 size={15} className="text-rose-500 animate-spin" />
                ) : (
                  <FileText size={15} className="text-rose-500" />
                )}
                <span>{isExportingPDF ? "Menyusun PDF..." : "Export PDF"}</span>
              </button>
            </div>
          )}
        </div>

        {/* ===== BRACKET / ROUND ROBIN CONTAINER ===== */}
        <div
          id="bracket-container"
          className="w-full rounded-2xl"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
          {isRoundRobin ? (
            /* TAMPILAN ROUND ROBIN (TABEL) */
            <div className="p-0">
              {juaraRR && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                    borderBottom: "1px solid #d97706",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>🏆</span>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: "800", color: "#78350f", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Juara Round Robin
                      </p>
                      <p style={{ fontSize: "16px", fontWeight: "900", color: "#451a03" }}>
                        {isDouble
                          ? (juaraRR.namaTim || `${juaraRR?.Player1?.namaLengkap} / ${juaraRR?.Player2?.namaLengkap}`)
                          : juaraRR?.namaLengkap}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: "900",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    🏆 JUARA 1
                  </span>
                </div>
              )}
              <div className="w-full overflow-x-auto">
                <table className="min-w-[680px] w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80">
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Peserta 1</th>
                      <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-12">VS</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Peserta 2</th>
                      <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Skor</th>
                      {(role === "admin" || role === "panitia") && (
                        <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bagan.Matches.map((m, index) => {
                      const isP1Juara = isDouble ? (juaraRR && m.doubleTeam1Id === juaraRR.id) : (juaraRR && m.peserta1Id === juaraRR.id);
                      const isP2Juara = isDouble ? (juaraRR && m.doubleTeam2Id === juaraRR.id) : (juaraRR && m.peserta2Id === juaraRR.id);
                      const isWinnerP1 = isDouble ? (m.winnerDoubleId === m.doubleTeam1Id) : (m.winnerId === m.peserta1Id);
                      const isWinnerP2 = isDouble ? (m.winnerDoubleId === m.doubleTeam2Id) : (m.winnerId === m.peserta2Id);

                      return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-4 text-xs font-bold text-slate-400">#{index + 1}</td>

                        <td className={`px-4 py-4 font-semibold text-sm ${
                          isWinnerP1 ? "text-amber-600" : "text-slate-800"
                        }`}>
                          <div className="flex items-center gap-2">
                            <span>
                              {isDouble
                                ? (m.doubleTeam1?.namaTim || (m.doubleTeam1Id ? "TBD" : "BYE"))
                                : (m.peserta1?.namaLengkap || (m.peserta1Id ? "TBD" : "BYE"))}
                            </span>
                            {isP1Juara && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                                🏆 Juara
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center text-[10px] font-extrabold text-slate-400 tracking-widest">VS</td>

                        <td className={`px-4 py-4 font-semibold text-sm ${
                          isWinnerP2 ? "text-amber-600" : "text-slate-800"
                        }`}>
                          <div className="flex items-center gap-2">
                            <span>
                              {isDouble
                                ? (m.doubleTeam2?.namaTim || (m.doubleTeam2Id ? "TBD" : "BYE"))
                                : (m.peserta2?.namaLengkap || (m.peserta2Id ? "TBD" : "BYE"))}
                            </span>
                            {isP2Juara && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                                🏆 Juara
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          {formatSetScore(m) ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                              {formatSetScore(m)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {(role === "admin" || role === "panitia") && (
                          <td className="px-4 py-4 text-center">
                            {((!isDouble && !m.winnerId) || (isDouble && !m.winnerDoubleId)) ? (
                              <button
                                onClick={() => { setSelectedMatch(m); setModalType("winner"); }}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                              >
                                Input Skor
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-200/60">
                                Selesai
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>

          ) : (
           

          <div
                className="w-full overflow-hidden rounded-3xl"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                }}
              >

            {/* Wrapper scroll manual */}
            <div 
              className="overflow-x-auto" 
              style={{ 
                display: 'block', 
                width: '100%',
                WebkitOverflowScrolling: 'touch',
                backgroundColor: '#ffffff' // HEX supaya PDF aman
              }}
            >
              
              {/* Gunakan max-content agar div ini selebar total semua babak pertandingan */}
            <div style={{ display: 'inline-block', minWidth: '100%' }} className="p-4 md:p-10">
                
                <Bracket
                  rounds={rounds}
                  /* Tambahkan properti mobileBreakpoint jika library mendukung untuk mematikannya */
                  mobileBreakpoint={0} 
                  renderSeedComponent={(props) => {
                    const seed = props.seed;
                    const isKualifikasiRound = rounds[props.roundIndex]?.title === "Kualifikasi" || !!seed.isPrelim;

                    // 1. Placeholder transparan di Kualifikasi (supaya posisi match kualifikasi sejajar presisi dengan babak 1)
                    if (seed.isPlaceholder) {
                      return (
                        <div
                          key={seed.id}
                          className="invisible pointer-events-none select-none"
                          style={{
                            padding: "1em 1.5em",
                            minWidth: "225px",
                            width: "100%",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            justifyContent: "center",
                            fontSize: "14px",
                          }}
                        >
                          <div className="w-full">
                            <div className="rounded-lg min-w-[220px] px-3 py-2 text-lg border-2 border-transparent">
                              &nbsp;
                            </div>
                            <div className="h-2" />
                            <div className="rounded-lg min-w-[220px] px-3 py-2 text-lg border-2 border-transparent">
                              &nbsp;
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const match = seed.raw;
                    if (!match) return null;
                    const isDouble = bagan.kategori === "double";

                    const isFinalRound = props.roundIndex === rounds.length - 1 || match.round === finalRound;

                    const isWinner1 = isDouble
                      ? (!!match.winnerDoubleId && match.winnerDoubleId === match.doubleTeam1Id)
                      : (!!match.winnerId && match.winnerId === match.peserta1Id);

                    const isWinner2 = isDouble
                      ? (!!match.winnerDoubleId && match.winnerDoubleId === match.doubleTeam2Id)
                      : (!!match.winnerId && match.winnerId === match.peserta2Id);

                    const isFinished = isWinner1 || isWinner2;

                    const isJuara1 = isFinalRound && isWinner1;
                    const isJuara2 = isFinalRound && isWinner2;
                    const hasJuaraInThisMatch = isJuara1 || isJuara2;

                    const isRunnerUp1 = isFinalRound && isWinner2;
                    const isRunnerUp2 = isFinalRound && isWinner1;

                    const name1 = isDouble 
                      ? (match.doubleTeam1?.namaTim || (match.doubleTeam1Id ? "TBD" : "BYE"))
                      : (match.peserta1?.namaLengkap || (match.peserta1Id ? "TBD" : "BYE"));

                    const name2 = isDouble 
                      ? (match.doubleTeam2?.namaTim || (match.doubleTeam2Id ? "TBD" : "BYE"))
                      : (match.peserta2?.namaLengkap || (match.peserta2Id ? "TBD" : "BYE"));

                    const getSlotInfo = (isJuara, isRunnerUp, isWinner) => {
                      if (isJuara) {
                        return {
                          style: {
                            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                            color: "#451a03",
                            border: "2px solid #b45309",
                            boxShadow: "0 4px 12px rgba(217, 119, 6, 0.35)",
                            fontWeight: "800",
                          },
                          badge: (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                background: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
                                color: "#ffffff",
                                padding: "2px 8px",
                                borderRadius: "9999px",
                                fontSize: "10px",
                                fontWeight: "900",
                                letterSpacing: "0.06em",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                textTransform: "uppercase",
                                flexShrink: 0,
                              }}
                            >
                              <span>🏆</span>
                              <span>JUARA</span>
                            </span>
                          ),
                          icon: null,
                          isJuara: true,
                        };
                      }

                      if (isRunnerUp) {
                        return {
                          style: {
                            background: "#f1f5f9",
                            color: "#475569",
                            border: "1.5px solid #cbd5e1",
                            fontWeight: "600",
                          },
                          badge: null,
                          icon: null,
                          isJuara: false,
                        };
                      }

                      if (isWinner) {
                        return {
                          style: {
                            background: "#fef9c3",
                            color: "#78350f",
                            border: "2px solid #f59e0b",
                            fontWeight: "700",
                          },
                          badge: null,
                          icon: null,
                          isJuara: false,
                        };
                      }

                      if (isFinished) {
                        return {
                          style: {
                            background: "#f8fafc",
                            color: "#94a3b8",
                            border: "1px solid #e2e8f0",
                            fontWeight: "500",
                          },
                          badge: null,
                          icon: null,
                          isJuara: false,
                        };
                      }

                      return {
                        style: {
                          background: "#ffffff",
                          color: "#1e293b",
                          border: "1px solid #e2e8f0",
                          fontWeight: "600",
                        },
                        badge: null,
                        icon: null,
                        isJuara: false,
                      };
                    };

                    const slot1 = getSlotInfo(isJuara1, isRunnerUp1, isWinner1);
                    const slot2 = getSlotInfo(isJuara2, isRunnerUp2, isWinner2);

                    const cardContent = (
                      <SeedItem>
                        <div
                          className="relative"
                          style={{
                            backgroundColor: hasJuaraInThisMatch ? "#fffbeb" : "#ffffff",
                            padding: hasJuaraInThisMatch ? "3px" : "0px",
                            borderRadius: "12px",
                            border: hasJuaraInThisMatch ? "2px solid #f59e0b" : "none",
                            boxShadow: hasJuaraInThisMatch ? "0 0 16px rgba(245, 158, 11, 0.35)" : "none",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {/* Skor Pertandingan */}
                          {formatSetScore(match) && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-10px",
                                right: "6px",
                                zIndex: 10,
                              }}
                            >
                              <span
                                style={{
                                  background: "#0f172a",
                                  color: "#ffffff",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  letterSpacing: "0.03em",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                  display: "inline-block",
                                }}
                              >
                                {formatSetScore(match)}
                              </span>
                            </div>
                          )}

                          {/* Slot Peserta 1 */}
                          <SeedTeam
                            style={{
                              ...slot1.style,
                              minWidth: "220px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontSize: slot1.isJuara ? "14px" : "13px",
                                  display: "block",
                                }}
                                title={name1}
                              >
                                {name1}
                              </span>
                            </div>
                            {slot1.badge}
                          </SeedTeam>

                          {/* Pembatas tengah persis antara kedua peserta/tim */}
                          <div className="relative" style={{ height: "6px" }}>
                            {/* GARIS ALUR PENGHUBUNG DARI KUALIFIKASI KE BABAK UTAMA */}
                            {isKualifikasiRound && (
                              <div
                                className="pointer-events-none"
                                style={{
                                  position: "absolute",
                                  right: "-3em",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: "3em",
                                  height: 0,
                                  borderTop: "1px solid #707070",
                                  zIndex: 5,
                                }}
                              />
                            )}
                          </div>

                          {/* Slot Peserta 2 */}
                          <SeedTeam
                            style={{
                              ...slot2.style,
                              minWidth: "220px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontSize: slot2.isJuara ? "14px" : "13px",
                                  display: "block",
                                }}
                                title={name2}
                              >
                                {name2}
                              </span>
                            </div>
                            {slot2.badge}
                          </SeedTeam>
                        </div>
                      </SeedItem>
                    );

                    const handleClick = () => {
                      setSelectedMatch(match);
                      const hasS1 = isDouble ? match.doubleTeam1Id : match.peserta1Id;
                      const hasS2 = isDouble ? match.doubleTeam2Id : match.peserta2Id;
                      const isFinished = isDouble ? !!match.winnerDoubleId : !!match.winnerId;

                      if (hasS1 !== null && hasS2 !== null && !isFinished) {
                        setModalType("winner");
                      }
                    };

                    // Untuk Babak Kualifikasi: gunakan container bersih tanpa garis cabang pohon bawaan
                    if (isKualifikasiRound) {
                      return (
                        <div
                          key={seed.id}
                          style={{
                            padding: "1em 1.5em",
                            minWidth: "225px",
                            width: "100%",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            justifyContent: "center",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                          onClick={handleClick}
                        >
                          {cardContent}
                        </div>
                      );
                    }

                    // Untuk Babak Utama (Round 1 sampai Final): gunakan Seed bawaan react-brackets
                    return (
                      <Seed
                        {...props}
                        onClick={handleClick}
                      >
                        {cardContent}
                      </Seed>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          )}
        </div>

        {/* ===== KETERANGAN PENEMPATAN (hanya non-RR) ===== */}
        {!isRoundRobin && (
          <div
            id="keterangan-container"
            className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6"
          >
            {/* Title */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Info size={16} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Keterangan Penempatan (Seeding &amp; Plotting)
              </h3>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Kolom Seed */}
              <div className="space-y-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  Peserta Unggulan (Seeded)
                </p>
                <div className="space-y-2">
                  {(() => {
                    const seededFinal = [];
                    const seenIds = new Set();
                    bagan.Matches.filter(m => m.round === 1).forEach((m) => {
                      const p1 = isDouble ? m.doubleTeam1 : m.peserta1;
                      const p2 = isDouble ? m.doubleTeam2 : m.peserta2;
                      const id1 = isDouble ? m.doubleTeam1Id : m.peserta1Id;
                      const id2 = isDouble ? m.doubleTeam2Id : m.peserta2Id;
                      if (id1 && p1?.isSeeded && !seenIds.has(id1)) { seededFinal.push(p1); seenIds.add(id1); }
                      if (id2 && p2?.isSeeded && !seenIds.has(id2)) { seededFinal.push(p2); seenIds.add(id2); }
                    });
                    if (seededFinal.length === 0) {
                      return <p className="text-xs text-slate-400 italic">Tidak ada peserta unggulan.</p>;
                    }
                    return seededFinal.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white border border-amber-200/60 rounded-xl shadow-xs">
                        <span className="text-sm font-semibold text-slate-800 break-words">
                          {isDouble ? (p.namaTim || p.Player1?.namaLengkap) : p.namaLengkap}
                        </span>
                        <span className="text-[10px] bg-amber-400 text-white px-2.5 py-1 rounded-full font-bold tracking-wider">
                          SEED
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Kolom Plotting */}
              <div className="space-y-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />
                  Penempatan Khusus (Non-Seed)
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Beberapa peserta telah dipisahkan posisinya secara manual (Plotting)
                    guna menghindari pertemuan dini antar rekan satu tim atau instansi yang sama.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              <span>PELTI DENPASAR OFFICIAL SYSTEM</span>
              <span>{new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalType === "peserta" && (role === "admin" || role === "panitia") && (
        <PesertaModal
          match={selectedMatch}
          kelompokUmurId={bagan.kelompokUmurId}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "winner" && (role === "admin" || role === "panitia") && (
        <WinnerModal
          match={selectedMatch}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "seeding" && (role === "admin" || role === "panitia") && (
        <SeedingModal
          pesertaList={allPeserta}
          byeSlotsCount={byeSlotsCount}
          onClose={() => setModalType(null)}
          onSaved={handleUndian}
        />
      )}

      {/* Loading Modal Pop-up (Live Draw Ceremony) */}
      {isSeedingLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 w-full max-w-xl text-center shadow-2xl border border-amber-200/60 overflow-hidden">
            
            {/* Glow Ambient Light */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

            {/* HEADER */}
            <div className="mb-6 relative z-10">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[11px] font-extrabold uppercase tracking-widest mb-2 shadow-xs">
                LIVE DRAW CEREMONY
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pengundian Bagan Resmi
              </h2>
              <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
                Sistem Pengundian Acak Resmi &amp; Transparan
              </p>
            </div>

            {/* 🔄 ROLLING MODE */}
            {drawStage === "rolling" && (
              <div className="relative z-10">
                {/* Logo + Spinner */}
                <div className="relative w-28 h-28 mx-auto my-6">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-200/40"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>

                {/* MATCH DISPLAY CARD */}
                <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 shadow-xs transition-all">
                  {/* Peserta 1 */}
                  <div className="text-lg sm:text-xl font-extrabold text-slate-800 truncate">
                    {rollingName?.split(" VS ")[0] || "..."}
                  </div>

                  {/* VS */}
                  <div className="my-2.5 flex items-center justify-center">
                    <span className="px-5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-xs tracking-widest uppercase">
                      VS
                    </span>
                  </div>

                  {/* Peserta 2 */}
                  <div className="text-lg sm:text-xl font-extrabold text-slate-800 truncate">
                    {rollingName?.split(" VS ")[1] || "..."}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-extrabold text-amber-600 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Mengacak Posisi Peserta...</span>
                </div>
              </div>
            )}

            {/* 🎯 SLOT MODE */}
            {drawStage === "slots" && currentSlotInfo && (
              <div className="relative z-10">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-xs mb-5">
                  SLOT {currentSlotInfo.slot}
                </div>

                <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 shadow-xs transition-all">
                  {/* Peserta 1 */}
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                    {currentSlotInfo.p1}
                  </div>

                  {/* VS */}
                  <div className="my-2.5 flex items-center justify-center">
                    <span className="px-5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-xs tracking-widest uppercase">
                      VS
                    </span>
                  </div>

                  {/* Peserta 2 */}
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                    {currentSlotInfo.p2}
                  </div>
                </div>

                <p className="mt-6 text-xs font-extrabold text-amber-600 uppercase tracking-widest">
                  Slot Telah Ditentukan
                </p>
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 tracking-[0.3em] uppercase font-bold relative z-10">
              PELTI DENPASAR OFFICIAL SYSTEM
            </div>

          </div>
        </div>
      )}




{showLockConfirm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200/60 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60 text-lg">
          🔒
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Kunci Bagan?</h2>
          <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Setelah dikunci, bagan tidak bisa diundi ulang atau diubah. Pastikan pengundian sudah benar.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setShowLockConfirm(false)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleLockBagan}
          className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all"
        >
          Ya, Kunci
        </button>
      </div>
    </div>
  </div>
)}

<AlertMessage
  type={alertType}
  message={alertMessage}
  onClose={() => setAlertMessage("")}
/>


    </div>
  );
}
