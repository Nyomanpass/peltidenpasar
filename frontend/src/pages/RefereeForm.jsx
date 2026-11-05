import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { ChevronLeft, Trophy, RotateCcw, RefreshCw, Play, Pause, Sun, Moon, MoreVertical, Flame, Clock, Zap, Lock } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const RefereeForm = ({ match, onFinish, onBack }) => {
  // State Skor Utama
  const [p1Point, setP1Point] = useState("0");
  const [p2Point, setP2Point] = useState("0");
  const [p1Game, setP1Game] = useState(0);
  const [p2Game, setP2Game] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isServeEnabled, setIsServeEnabled] = useState(false);
  
  const [currentSet, setCurrentSet] = useState(1);
  const [setMenangP1, setSetMenangP1] = useState(0);
  const [setMenangP2, setSetMenangP2] = useState(0);
  

  const [showResultConfirm, setShowResultConfirm] = useState(false);
  const [finalWinnerData, setFinalWinnerData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const points = ["0", "15", "30", "40", "Ad"];

  const [scoreRule, setScoreRule] = useState(null);
  const targetSetWin = scoreRule ? Math.ceil(scoreRule.jumlahSet / 2) : null;

  const [server, setServer] = useState(1); 
  const [serveCount, setServeCount] = useState(2); 

  const [setScores, setSetScores] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isProcessingPoint, setIsProcessingPoint] = useState(false);
  const lastClickRef = useRef(0);

  const [matchDuration, setMatchDuration] = useState(0); // dalam detik
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [confirmPause, setConfirmPause] = useState(false);
  const [, forceRender] = useState(0);


useEffect(() => {
  let interval;

  if (isTimerRunning) {
    interval = setInterval(() => {
      forceRender(prev => prev + 1); // 🔥 paksa render tiap detik
    }, 1000);
  }

  return () => clearInterval(interval);
}, [isTimerRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0")
    ].join(":");
  };


const handleStartResume = async () => {
  if (isTimerRunning) return; 

  const now = new Date();

  setIsTimerRunning(true);
  setTimerStartedAt(now);

  await api.patch(`/matches/${match.id}/duration`, {
    durasi: matchDuration,
    isTimerRunning: true,
    timerStartedAt: now
  });
};


  const handlePause = async () => {
    const now = new Date();
    const started = new Date(timerStartedAt);

    const diff = Math.floor((now - started) / 1000);
    const finalDuration = matchDuration + diff;

    setIsTimerRunning(false);
    setMatchDuration(finalDuration);
    setTimerStartedAt(null);

    await api.patch(`/matches/${match.id}/duration`, {
      durasi: finalDuration,
      isTimerRunning: false,
      timerStartedAt: null
    });
  };

  const handleResetTimer = async () => {
    setIsTimerRunning(false);
    setMatchDuration(0);
    setTimerStartedAt(null);

    await api.patch(`/matches/${match.id}/duration`, {
      durasi: 0,
      isTimerRunning: false,
      timerStartedAt: null
    });
  };


  const formatName = (name = "") => {
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchSetHistory = async () => {
    try {
      const res = await api.get(`/matches/${match.id}`);
      const data = res.data;
      const history = [];
      if (data.set1P1 !== null) history.push({ set: 1, p1: data.set1P1, p2: data.set1P2 });
      if (data.set2P1 !== null) history.push({ set: 2, p1: data.set2P1, p2: data.set2P2 });
      if (data.set3P1 !== null) history.push({ set: 3, p1: data.set3P1, p2: data.set3P2 });
      setSetScores(history);
    } catch (err) {
      console.error("Gagal ambil history set", err);
    }
  };


useEffect(() => {
  const fetchLastScore = async () => {
    try {
      // 1. Ambil data MATCH dulu untuk tahu SET berapa sekarang
      const resMatch = await api.get(`/matches/${match.id}`);
      const matchData = resMatch.data;

      // 2. Ambil LOG terakhir untuk tahu POINT (0, 15, 30, 40)
      const resLog = await api.get(`/match-log/${match.id}`);
      
      if (resLog.data) {
        const log = resLog.data;
        
        // JIKA SET DI LOG BERBEDA DENGAN SET DI MATCH (KARENA BARU PINDAH SET)
        // MAKA RESET POINT KE 0-0
        if (log.setKe !== matchData.currentSet) {
          setP1Point("0");
          setP2Point("0");
          setP1Game(0); 
          setP2Game(0);
        } else {
          setP1Point(log.skorP1.toString());
          setP2Point(log.skorP2.toString());
          setP1Game(log.gameP1);
          setP2Game(log.gameP2);
        }
        
        setCurrentSet(matchData.currentSet); // Ambil dari MatchModel
        setSetMenangP1(matchData.score1 || 0);
        setSetMenangP2(matchData.score2 || 0);
      }
      
      // Susun histori set untuk tampilan atas
      const history = [];
      if (matchData.set1P1 !== null) history.push({ set: 1, p1: matchData.set1P1, p2: matchData.set1P2 });
      if (matchData.set2P1 !== null) history.push({ set: 2, p1: matchData.set2P1, p2: matchData.set2P2 });
      if (matchData.set3P1 !== null) history.push({ set: 3, p1: matchData.set3P1, p2: matchData.set3P2 });
      setSetScores(history);

    } catch (err) {
      console.error("Gagal sinkronisasi:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchLastScore();
}, [match.id]);


useEffect(() => {
  api.get(`/matches/${match.id}`).then(res => {
    setScoreRule(res.data.scoreRule);
    const data = res.data;

    setMatchDuration(data.durasi || 0);

    if (data.isTimerRunning && data.timerStartedAt) {
      setIsTimerRunning(true);
      setTimerStartedAt(new Date(data.timerStartedAt));
    } else {
      setIsTimerRunning(false);
      setTimerStartedAt(null);
    }
  });
}, [match.id]);


const handleResetMatch = async () => {
  try {
    await api.delete(`/reset-match/${match.id}`);

    setP1Point("0");
    setP2Point("0");
    setP1Game(0);
    setP2Game(0);
    setCurrentSet(1);
    setSetMenangP1(0);
    setSetMenangP2(0);
    setSetScores([]);

   setSuccess("Match berhasil di-reset");
  } catch (err) {
    setError("Gagal reset match");
    console.error(err);
  } finally{
    setConfirmReset(false);
  }

};


const handlePoint = async (player) => {
  // 🔒 Lapis 0: Proteksi - Hanya boleh tambah poin saat pertandingan aktif berjalan
  if (!isTimerRunning) return;

  // 🔒 Lapis 2: Debounce 300ms
  const now = Date.now();
  if (now - lastClickRef.current < 300) return;
  lastClickRef.current = now;

  // 🔒 Lapis 1: Cegah klik ganda selama proses berjalan
  if (!scoreRule || isProcessingPoint) return;
  setIsProcessingPoint(true);

  // 🔒 Lapis 3: Generate requestId unik untuk idempotency backend
  const requestId = crypto.randomUUID();

  // 1. variable untuk kalkulasi
  let nP1 = p1Point, nP2 = p2Point;
  let nG1 = parseInt(p1Game) || 0, nG2 = parseInt(p2Game) || 0;
  let nSetW1 = parseInt(setMenangP1) || 0, nSetW2 = parseInt(setMenangP2) || 0;
  let nSetKe = parseInt(currentSet) || 1;

  let isGameEnd = false;
  let isSetFinished = false;
  let isMatchFinished = false;
  let logDesc = "";

  const { jumlahSet, gamePerSet, tieBreakPoint, finalTieBreakPoint, useDeuce } = scoreRule;
  const isProset = jumlahSet === 1;
  const isBO3 = jumlahSet > 1;

 
  let isTieBreakMode = false;
  if (isProset) {
    isTieBreakMode = (nG1 === gamePerSet - 1 && nG2 === gamePerSet - 1);
  } else if (isBO3) {
     if (nSetKe === 3) {
      isTieBreakMode = true;
    } 
    // Set 1 & 2 → tiebreak kalau 6-6
    else {
      isTieBreakMode = (nG1 === gamePerSet && nG2 === gamePerSet);
    }
  }

  /* ================================
     A. LOGIKA POINT
  ================================== */
  if (isTieBreakMode) {
    let tP1 = parseInt(nP1) || 0;
    let tP2 = parseInt(nP2) || 0;
    player === 1 ? tP1++ : tP2++;

    nP1 = tP1.toString();
    nP2 = tP2.toString();

    // Khusus BO3 Set 3 pakai Final Tiebreak (misal 10 poin)
    let tbTarget = (isBO3 && nSetKe === 3) ? finalTieBreakPoint : tieBreakPoint;

    if ((tP1 >= tbTarget && tP1 - tP2 >= 2) || (tP2 >= tbTarget && tP2 - tP1 >= 2)) {
      isGameEnd = true; 
    }
    logDesc = `Tiebreak: ${nP1}-${nP2}`;
  } else {
    // Logika Skor Tenis (0, 15, 30, 40, Ad)
    const points = ["0", "15", "30", "40", "Ad"];
    if (useDeuce) {
      if (player === 1) {
        if (nP1 === "40" && nP2 !== "40" && nP2 !== "Ad") isGameEnd = true;
        else if (nP1 === "40" && nP2 === "40") nP1 = "Ad";
        else if (nP1 === "Ad") isGameEnd = true;
        else if (nP2 === "Ad") nP2 = "40";
        else nP1 = points[points.indexOf(nP1) + 1];
      } else {
        if (nP2 === "40" && nP1 !== "40" && nP1 !== "Ad") isGameEnd = true;
        else if (nP1 === "40" && nP2 === "40") nP2 = "Ad";
        else if (nP2 === "Ad") isGameEnd = true;
        else if (nP1 === "Ad") nP1 = "40";
        else nP2 = points[points.indexOf(nP2) + 1];
      }
    } else {
      if (player === 1) {
        if (nP1 === "40") isGameEnd = true;
        else nP1 = points[points.indexOf(nP1) + 1];
      } else {
        if (nP2 === "40") isGameEnd = true;
        else nP2 = points[points.indexOf(nP2) + 1];
      }
    }
    logDesc = `Point: ${nP1}-${nP2}`;
  }

  /* ================================
     B. LOGIKA GAME & SET (KHUSUS BO3 & PROSET)
  ================================== */
if (isGameEnd) {
  // 🔥 KHUSUS SET 3 (SUPER TIEBREAK)
  if (isBO3 && nSetKe === 3) {

    isSetFinished = true;

    const tP1 = parseInt(nP1);
    const tP2 = parseInt(nP2);

    // Tentukan pemenang dari poin tiebreak
    if (tP1 > tP2) {
      nG1 = 1;   // hanya untuk penentu winner
      nG2 = 0;
    } else {
      nG1 = 0;
      nG2 = 1;
    }

  } else {
    player === 1 ? nG1++ : nG2++;
    nP1 = "0";
    nP2 = "0";
    logDesc = `Game: ${nG1}-${nG2}`;

    if (isProset) {
      if (nG1 >= gamePerSet || nG2 >= gamePerSet) isSetFinished = true;
    } else if (isBO3) {
      const winNormal =
        (nG1 === gamePerSet && Math.abs(nG1 - nG2) >= 2) ||
        (nG2 === gamePerSet && Math.abs(nG1 - nG2) >= 2);

      const winDeuceGame =
        (nG1 === gamePerSet + 1 && nG2 === gamePerSet - 1) ||
        (nG2 === gamePerSet + 1 && nG1 === gamePerSet - 1);

      const winTiebreak = (nG1 > gamePerSet || nG2 > gamePerSet);

      if (winNormal || winDeuceGame || winTiebreak)
        isSetFinished = true;
    }
  }
}

  /* ================================
     C. LOGIKA MATCH
  ================================== */

  const finalGameP1InSet = nG1;
  const finalGameP2InSet = nG2;
  const setSelesaiTadi = nSetKe;

 if (isSetFinished) {

  const finishedSetNumber = nSetKe;
  const finalGameP1 = nG1;
  const finalGameP2 = nG2;

  setSetScores(prev => [
    ...prev,
    { set: finishedSetNumber, p1: finalGameP1, p2: finalGameP2 }
  ]);

  finalGameP1 > finalGameP2 ? nSetW1++ : nSetW2++;

  const targetWin = isProset ? 1 : Math.ceil(jumlahSet / 2);

  if (nSetW1 >= targetWin || nSetW2 >= targetWin) {
    isMatchFinished = true;
    logDesc = `Match Ended (${finalGameP1}-${finalGameP2})`;
    setSuccess(`Match Selesai! Skor Akhir: ${nSetW1}-${nSetW2}`);
  } else {
    logDesc = `Set ${finishedSetNumber} Ended (${finalGameP1}-${finalGameP2})`;
    setSuccess(`Set ${finishedSetNumber} Selesai! Skor: ${finalGameP1InSet}-${finalGameP2InSet}. Memasuki Set ${finishedSetNumber + 1}.`);

    // 🔥 RESET SET BARU SETELAH SIMPAN NILAI
    nSetKe++;
    nG1 = 0;
    nG2 = 0;
    nP1 = "0";
    nP2 = "0";
  }
}

  // 4. Update UI State
  setP1Point(nP1); setP2Point(nP2);
  setP1Game(nG1); setP2Game(nG2);
  setCurrentSet(nSetKe);
  setSetMenangP1(nSetW1); setSetMenangP2(nSetW2);

  // 5. Backend Update
  try {
    await api.post('/update-point', {
     matchId: match.id,
      requestId,
      // Jika set baru saja selesai, kirim log ke nomor set yang lama (misal Set 1)
      // Dan gunakan skor game terakhir (misal 3-6), bukan 0-0
      setKe: isSetFinished && !isMatchFinished ? setSelesaiTadi : nSetKe, 
      skorP1: nP1, 
      skorP2: nP2,
      gameP1: isSetFinished && !isMatchFinished ? finalGameP1InSet : nG1, 
      gameP2: isSetFinished && !isMatchFinished ? finalGameP2InSet : nG2,
      setMenangP1: nSetW1,
      setMenangP2: nSetW2,
      statusMatch: isMatchFinished ? 'selesai' : 'berlangsung',
      keterangan: logDesc
    });

    if (isSetFinished && !isMatchFinished) {
      await api.post('/update-point', {
        matchId: match.id,
        setKe: nSetKe, // Ini sudah angka set baru (misal: 2)
        skorP1: "0",
        skorP2: "0",
        gameP1: 0,
        gameP2: 0,
        setMenangP1: nSetW1,
        setMenangP2: nSetW2,
        statusMatch: 'berlangsung',
        keterangan: `Starting Set ${nSetKe}`
      });
    }

    if (isMatchFinished) {
        const finalDuration =
          isTimerRunning && timerStartedAt
            ? matchDuration +
              Math.floor((Date.now() - new Date(timerStartedAt)) / 1000)
            : matchDuration;

        setIsTimerRunning(false);
        setTimerStartedAt(null);
        setMatchDuration(finalDuration);

        await api.patch(`/matches/${match.id}/duration`, {
          durasi: finalDuration,
          isTimerRunning: false,
          timerStartedAt: null
        });


      const isDouble = !!match.doubleTeam1Id;
      const winnerId = nSetW1 > nSetW2 ? (isDouble ? match.doubleTeam1Id : match.peserta1Id) : (isDouble ? match.doubleTeam2Id : match.peserta2Id);

      await api.patch(`/${match.id}/winner`, {
        winnerId: isDouble ? null : winnerId,
        winnerDoubleId: isDouble ? winnerId : null,
        score1: nSetW1, score2: nSetW2, isDouble
      });

      setFinalWinnerData({ winnerId, score1: nSetW1, score2: nSetW2 });
      setShowResultConfirm(true);
    }
  } catch (err) { console.error("Gagal update server:", err); } finally {
    setIsProcessingPoint(false);
  }
};


  const handleUndo = async () => {
   
      try {
        await api.delete(`/undo-point/${match.id}`);
        const response = await api.get(`/match-log/${match.id}`);
        if (response.data) {
          setP1Point(response.data.skorP1); setP2Point(response.data.skorP2);
          setP1Game(response.data.gameP1); setP2Game(response.data.gameP2);
          setCurrentSet(response.data.setKe);
          setSetMenangP1(response.data.setMenangP1);
          setSetMenangP2(response.data.setMenangP2);
        } else {
          setP1Point("0"); setP2Point("0"); setP1Game(0); setP2Game(0);
          setCurrentSet(1); setSetMenangP1(0); setSetMenangP2(0);
        }
         setSuccess("Undo berhasil. Poin terakhir dibatalkan.");
      } catch (err) { 
        setError("Tidak bisa undo poin.");
      } finally {
        setConfirmUndo(false);
      }
    
  };

  const displayedDuration =
  isTimerRunning && timerStartedAt
    ? matchDuration +
      Math.floor((Date.now() - new Date(timerStartedAt)) / 1000)
    : matchDuration;

  if (isLoading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div
      className={`fixed inset-0 z-[1000] font-sans flex flex-col transition-colors duration-300 select-none overflow-hidden ${
        isDarkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* ===== TOP NAVIGATION / HEADER BAR ===== */}
      <header
        className={`w-full px-3 sm:px-6 py-2.5 sm:py-3 border-b flex items-center justify-between gap-2 shrink-0 transition-colors backdrop-blur-md z-40 ${
          isDarkMode
            ? "bg-slate-900/90 border-slate-800"
            : "bg-white/95 border-slate-200/80 shadow-xs"
        }`}
      >
        {/* Kiri: Tombol Kembali & Info Pertandingan */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs"
              }`}
              title="Kembali ke Jadwal"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}

          <div className="flex flex-col">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-widest ${
                isDarkMode ? "text-amber-400" : "text-amber-600"
              }`}
            >
              PANEL WASIT
            </span>
            <span
              className={`text-xs sm:text-sm font-extrabold truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs ${
                isDarkMode ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {match.bagan?.nama || "Turnamen Tenis"}
            </span>
          </div>
        </div>

        {/* Tengah: Timer Pertandingan */}
        <div className="flex items-center">
          <div
            className={`px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full font-mono text-sm sm:text-base font-black tracking-widest flex items-center gap-2 border transition-all ${
              isTimerRunning
                ? isDarkMode
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                : isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-400"
                  : "bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isTimerRunning
                  ? "bg-emerald-500 animate-ping"
                  : "bg-slate-400"
              }`}
            />
            <span>{formatTime(displayedDuration)}</span>
            {!isTimerRunning && (
              <span className="text-[10px] font-sans font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                {displayedDuration > 0 ? "JEDA" : "READY"}
              </span>
            )}
          </div>
        </div>

        {/* Kanan: Quick Actions (Undo, DarkMode, Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Undo Button */}
          <button
            onClick={() => setConfirmUndo(true)}
            title="Undo Poin Terakhir"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs"
            }`}
          >
            <RotateCcw size={15} />
            <span className="hidden md:inline">Undo</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
            className={`p-2 rounded-xl transition-all border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 shadow-xs"
            }`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Dropdown Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-xl transition-all border ${
                showMenu
                  ? isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-slate-200 border-slate-300 text-slate-900"
                  : isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs"
              }`}
              title="Menu Pengaturan"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown Popover */}
            {showMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-800 text-slate-200"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                {/* Reset Timer */}
                <button
                  onClick={() => {
                    handleResetTimer();
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
                  }`}
                >
                  <Clock size={16} className="text-amber-500" />
                  <span>Reset Timer Pertandingan</span>
                </button>

                {/* Toggle Serve Controls */}
                <button
                  onClick={() => {
                    setIsServeEnabled(!isServeEnabled);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
                  }`}
                >
                  <Zap size={16} className="text-sky-500" />
                  <span>{isServeEnabled ? "Sembunyikan Kontrol Serve" : "Tampilkan Kontrol Serve"}</span>
                </button>

                {/* Reset Match */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setConfirmReset(true);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-rose-500 transition-colors ${
                    isDarkMode ? "hover:bg-rose-950/40" : "hover:bg-rose-50"
                  }`}
                >
                  <RefreshCw size={16} className="text-rose-500" />
                  <span>Reset Seluruh Match</span>
                </button>

                {/* Info Aturan Turnamen */}
                {scoreRule && (
                  <div
                    className={`mt-2 pt-2 border-t px-3 py-2 rounded-xl text-[10px] ${
                      isDarkMode
                        ? "border-slate-800 bg-slate-950/60 text-slate-400"
                        : "border-slate-100 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="font-extrabold text-amber-600 uppercase tracking-wider mb-1">
                      Aturan: {scoreRule.name}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-semibold">
                      <span>• {scoreRule.jumlahSet} Sets</span>
                      <span>• {scoreRule.gamePerSet} Games</span>
                      <span>• {scoreRule.useDeuce ? "Deuce" : "No Deuce"}</span>
                      <span>• TB: {scoreRule.tieBreakPoint}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN BODY (RESPONSIVE SCORING VIEW) ===== */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col justify-between max-w-4xl w-full mx-auto gap-3 sm:gap-4">
        
        {/* SECTION 1: SET HISTORY & SPECIAL STATE BANNER */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* History Sets */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Set Selesai:
              </span>
              {setScores.length === 0 ? (
                <span
                  className={`text-xs font-medium italic ${
                    isDarkMode ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  Belum ada set yang selesai
                </span>
              ) : (
                setScores.map((s, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-white border-slate-200/90 text-slate-800 shadow-xs"
                    }`}
                  >
                    <span className="text-[10px] uppercase text-amber-600 font-extrabold">
                      S{s.set}:
                    </span>
                    <span className="font-black">
                      {s.p1} - {s.p2}
                    </span>
                  </span>
                ))
              )}
            </div>

            {/* Info Aturan Ringkas */}
            {scoreRule && (
              <span
                className={`hidden md:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800 text-slate-400"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {scoreRule.name}
              </span>
            )}
          </div>

          {/* Banner Status Khusus: Deuce / Tiebreak */}
          {scoreRule && (() => {
            const isProset = scoreRule.jumlahSet === 1;
            const isBO3 = scoreRule.jumlahSet > 1;
            const tbTrigger = isBO3 ? scoreRule.gamePerSet : scoreRule.gamePerSet - 1;
            const isDeuceGame = p1Game === tbTrigger - 1 && p2Game === tbTrigger - 1;
            const isTieBreak = p1Game === tbTrigger && p2Game === tbTrigger;

            if (!isDeuceGame && !isTieBreak) return null;

            return (
              <div className="flex justify-center">
                {isDeuceGame && (
                  <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-xs animate-in fade-in duration-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    DEUCE GAMES
                  </span>
                )}
                {isTieBreak && (
                  <span className="inline-flex items-center gap-2 px-5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md animate-pulse">
                    <Flame size={14} className="fill-white" />
                    TIE BREAK ROUND
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        {/* SECTION 2: THE MAIN SCOREBOARD (CARD) */}
        <div
          className={`rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
            isDarkMode
              ? "bg-slate-900/80 border-slate-800 shadow-slate-950/50"
              : "bg-white border-slate-200/80 shadow-slate-200/60"
          }`}
        >
          {/* Top Badge: SET AKTIF */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1 rounded-b-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-[0.25em] shadow-sm z-20">
            SET {currentSet}
          </div>

          <div className="pt-8 sm:pt-9 pb-6 sm:pb-8 px-3 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
              
              {/* Divider Tengah */}
              <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-[1px] ${
                  isDarkMode
                    ? "bg-gradient-to-b from-transparent via-slate-800 to-transparent"
                    : "bg-gradient-to-b from-transparent via-slate-200 to-transparent"
                }`}
              />

              {/* ===== PLAYER 1 COLUMN ===== */}
              <div className="flex flex-col items-center text-center">
                
                {/* Serve Ball Indicator */}
                {isServeEnabled ? (
                  <div className="h-5 mb-1.5 flex items-center justify-center">
                    {server === 1 ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-500">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>SERVE {serveCount === 2 ? "1" : "2"}</span>
                      </div>
                    ) : (
                      <div className="h-5" />
                    )}
                  </div>
                ) : (
                  <div className="h-2" />
                )}

                {/* Nama Pemain / Tim 1 */}
                <div className="min-h-[52px] sm:min-h-[60px] flex flex-col items-center justify-center mb-2 px-1">
                  {match.doubleTeam1?.namaTim ? (
                    <div className="flex flex-col items-center">
                      {match.doubleTeam1.namaTim.split(" / ").map((name, i) => (
                        <div key={i} className="text-xs sm:text-base font-extrabold leading-tight">
                          {formatName(name)}
                          {i === 0 && (
                            <span className="text-[10px] text-amber-500 font-black block my-0.5">&amp;</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <h2 className="text-sm sm:text-lg md:text-xl font-extrabold leading-tight line-clamp-2">
                      {formatName(match.peserta1?.namaLengkap || "Pemain 1")}
                    </h2>
                  )}
                </div>

                {/* POIN UTAMA P1 (GIANT DISPLAY) */}
                <div
                  className={`w-full max-w-[160px] sm:max-w-[200px] py-3 sm:py-5 rounded-2xl border transition-all flex items-center justify-center ${
                    isDarkMode
                      ? "bg-slate-950/80 border-slate-800 text-white shadow-inner"
                      : "bg-slate-50 border-slate-200/90 text-slate-900 shadow-inner"
                  }`}
                >
                  <span className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums tracking-tighter leading-none">
                    {p1Point}
                  </span>
                </div>

                {/* GAMES & SETS WON */}
                <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
                  {/* Games Box */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest mb-1 ${
                        isDarkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Games
                    </span>
                    <div
                      className={`px-3 sm:px-4 py-1 rounded-xl border text-lg sm:text-xl font-black ${
                        isDarkMode
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}
                    >
                      {p1Game}
                    </div>
                  </div>

                  {/* Sets Won */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest mb-1 ${
                        isDarkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Set
                    </span>
                    <div
                      className={`px-3 sm:px-4 py-1 rounded-xl border text-lg sm:text-xl font-black ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {setMenangP1}
                    </div>
                  </div>
                </div>

              </div>

              {/* ===== PLAYER 2 COLUMN ===== */}
              <div className="flex flex-col items-center text-center">
                
                {/* Serve Ball Indicator */}
                {isServeEnabled ? (
                  <div className="h-5 mb-1.5 flex items-center justify-center">
                    {server === 2 ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-500">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>SERVE {serveCount === 2 ? "1" : "2"}</span>
                      </div>
                    ) : (
                      <div className="h-5" />
                    )}
                  </div>
                ) : (
                  <div className="h-2" />
                )}

                {/* Nama Pemain / Tim 2 */}
                <div className="min-h-[52px] sm:min-h-[60px] flex flex-col items-center justify-center mb-2 px-1">
                  {match.doubleTeam2?.namaTim ? (
                    <div className="flex flex-col items-center">
                      {match.doubleTeam2.namaTim.split(" / ").map((name, i) => (
                        <div key={i} className="text-xs sm:text-base font-extrabold leading-tight">
                          {formatName(name)}
                          {i === 0 && (
                            <span className="text-[10px] text-amber-500 font-black block my-0.5">&amp;</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <h2 className="text-sm sm:text-lg md:text-xl font-extrabold leading-tight line-clamp-2">
                      {formatName(match.peserta2?.namaLengkap || "Pemain 2")}
                    </h2>
                  )}
                </div>

                {/* POIN UTAMA P2 (GIANT DISPLAY) */}
                <div
                  className={`w-full max-w-[160px] sm:max-w-[200px] py-3 sm:py-5 rounded-2xl border transition-all flex items-center justify-center ${
                    isDarkMode
                      ? "bg-slate-950/80 border-slate-800 text-white shadow-inner"
                      : "bg-slate-50 border-slate-200/90 text-slate-900 shadow-inner"
                  }`}
                >
                  <span className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums tracking-tighter leading-none">
                    {p2Point}
                  </span>
                </div>

                {/* GAMES & SETS WON */}
                <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
                  {/* Games Box */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest mb-1 ${
                        isDarkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Games
                    </span>
                    <div
                      className={`px-3 sm:px-4 py-1 rounded-xl border text-lg sm:text-xl font-black ${
                        isDarkMode
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                          : "bg-rose-50 border-rose-200 text-rose-700"
                      }`}
                    >
                      {p2Game}
                    </div>
                  </div>

                  {/* Sets Won */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-widest mb-1 ${
                        isDarkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Set
                    </span>
                    <div
                      className={`px-3 sm:px-4 py-1 rounded-xl border text-lg sm:text-xl font-black ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 text-slate-300"
                          : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {setMenangP2}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* SECTION 3: TACTILE SCORING BUTTONS (P1 vs P2) */}
        <div className="flex flex-col gap-2.5 sm:gap-3 shrink-0">
          
          {/* BANNER STATUS KUNCI SKOR KETIKA MATCH BELUM MULAI ATAU DIJEDA */}
          {!isTimerRunning && (
            <div className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border text-center transition-all animate-in fade-in duration-200 ${
              isDarkMode 
                ? "bg-amber-950/30 border-amber-800/40 text-amber-300" 
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              <Lock size={14} className="shrink-0 text-amber-500" />
              <span className="text-[11px] sm:text-xs font-bold">
                {matchDuration === 0
                  ? "Poin Terkunci: Tekan 'Mulai Pertandingan' di bawah untuk mulai input skor"
                  : "Poin Terkunci: Pertandingan dijeda. Tekan 'Lanjutkan Pertandingan' untuk input skor"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            
            {/* BUTTON ADD POINT P1 */}
            <button
              onClick={() => handlePoint(1)}
              disabled={isProcessingPoint || !isTimerRunning}
              className={`group relative h-24 sm:h-28 md:h-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white transition-all flex flex-col items-center justify-center p-2 border-t border-white/25 ${
                !isTimerRunning
                  ? "opacity-40 grayscale-[25%] cursor-not-allowed pointer-events-none shadow-none"
                  : isProcessingPoint
                    ? "opacity-60 pointer-events-none shadow-md"
                    : "shadow-xl shadow-blue-900/30 active:scale-[0.97] hover:brightness-105"
              }`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
              <span className="relative text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-blue-200 truncate max-w-[90%] mb-1 flex items-center gap-1">
                {!isTimerRunning && <Lock size={11} className="text-blue-200/90 inline shrink-0" />}
                + POIN {formatName(match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim || "P1").split(" ")[0]}
              </span>
              <div className="relative flex items-center gap-1.5 sm:gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">
                  +1
                </span>
              </div>
            </button>

            {/* BUTTON ADD POINT P2 */}
            <button
              onClick={() => handlePoint(2)}
              disabled={isProcessingPoint || !isTimerRunning}
              className={`group relative h-24 sm:h-28 md:h-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white transition-all flex flex-col items-center justify-center p-2 border-t border-white/25 ${
                !isTimerRunning
                  ? "opacity-40 grayscale-[25%] cursor-not-allowed pointer-events-none shadow-none"
                  : isProcessingPoint
                    ? "opacity-60 pointer-events-none shadow-md"
                    : "shadow-xl shadow-rose-900/30 active:scale-[0.97] hover:brightness-105"
              }`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
              <span className="relative text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-rose-200 truncate max-w-[90%] mb-1 flex items-center gap-1">
                {!isTimerRunning && <Lock size={11} className="text-rose-200/90 inline shrink-0" />}
                + POIN {formatName(match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim || "P2").split(" ")[0]}
              </span>
              <div className="relative flex items-center gap-1.5 sm:gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">
                  +1
                </span>
              </div>
            </button>

          </div>

          {/* MATCH TIMER ACTION (START / RESUME / PAUSE) */}
          <div>
            {!isTimerRunning ? (
              <button
                onClick={handleStartResume}
                className="w-full h-12 sm:h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <Play size={16} className="fill-white" />
                <span>{matchDuration === 0 ? "Mulai Pertandingan" : "Lanjutkan Pertandingan"}</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmPause(true)}
                className="w-full h-12 sm:h-13 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-900/20 flex items-center justify-center gap-2"
              >
                <Pause size={16} className="fill-slate-950" />
                <span>Jeda Pertandingan (Pause)</span>
              </button>
            )}
          </div>

          {/* SERVE AUXILIARY CONTROLS (JIKA DIAKTIFKAN) */}
          {isServeEnabled && (
            <div className="grid grid-cols-2 gap-2.5 animate-in fade-in duration-200">
              <button
                disabled={!isTimerRunning}
                onClick={() => {
                  if (serveCount === 2) {
                    setServeCount(1);
                  } else {
                    setServeCount(2);
                    setServer(server === 1 ? 2 : 1);
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  !isTimerRunning
                    ? "opacity-40 cursor-not-allowed pointer-events-none " + (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400")
                    : isDarkMode
                      ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                      : "bg-white border-slate-200 text-amber-700 hover:bg-slate-50 shadow-xs"
                }`}
              >
                Fault (Serve)
              </button>

              <button
                disabled={!isTimerRunning}
                onClick={() => {
                  setServer(server === 1 ? 2 : 1);
                  setServeCount(2);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  !isTimerRunning
                    ? "opacity-40 cursor-not-allowed pointer-events-none " + (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400")
                    : isDarkMode
                      ? "bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800"
                      : "bg-white border-slate-200 text-sky-700 hover:bg-slate-50 shadow-xs"
                }`}
              >
                Ganti Server
              </button>
            </div>
          )}

        </div>

      </main>

      {/* ===== MODAL: MATCH FINISHED (FINAL REVIEW) ===== */}
      {showResultConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl border ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Ambient Trophy Light */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg text-amber-500">
              <Trophy size={32} />
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-1">
              PERTANDINGAN SELESAI
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
              Review Hasil Skor Akhir
            </p>

            {/* Winner Card */}
            <div
              className={`rounded-2xl p-5 mb-6 border ${
                isDarkMode
                  ? "bg-slate-950/60 border-slate-800"
                  : "bg-slate-50 border-slate-200/80"
              }`}
            >
              <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.25em] mb-1.5">
                🏆 PEMENANG
              </div>
              <div className="font-extrabold text-lg uppercase leading-snug truncate">
                {finalWinnerData?.winnerId === (match.doubleTeam1Id || match.peserta1Id)
                  ? (match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim)
                  : (match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim)}
              </div>

              {/* Set Scores Summary */}
              <div className="flex justify-center items-center gap-6 mt-4 pt-3 border-t border-slate-200/40">
                <div className="text-3xl font-black">
                  {finalWinnerData?.score1}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  SET
                </div>
                <div className="text-3xl font-black">
                  {finalWinnerData?.score2}
                </div>
              </div>

              {/* Sets Detail */}
              {setScores.length > 0 && (
                <div className="mt-3 pt-2 text-[11px] font-bold text-slate-500 border-t border-slate-200/40 flex justify-center gap-2">
                  {setScores.map((s, i) => (
                    <span key={i} className="bg-slate-200/50 px-2 py-0.5 rounded-md">
                      S{s.set}: {s.p1}-{s.p2}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onFinish(finalWinnerData)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-900/20"
              >
                Kirim &amp; Simpan Hasil
              </button>

              <button
                onClick={() => {
                  setShowResultConfirm(false);
                  handleUndo();
                }}
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Koreksi Skor (Undo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM DIALOGS ===== */}
      {confirmUndo && (
        <AlertMessage
          type="warning"
          message="Yakin ingin meng-undo poin terakhir?"
          onClose={() => setConfirmUndo(false)}
        >
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setConfirmUndo(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleUndo}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Ya, Undo
            </button>
          </div>
        </AlertMessage>
      )}

      {confirmReset && (
        <AlertMessage
          type="warning"
          message="Yakin ingin mereset seluruh pertandingan? Data skor akan kembali ke 0-0."
          onClose={() => setConfirmReset(false)}
        >
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleResetMatch}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Ya, Reset
            </button>
          </div>
        </AlertMessage>
      )}

      {confirmPause && (
        <AlertMessage
          type="warning"
          message="Jeda pertandingan dan hentikan timer sementara?"
          onClose={() => setConfirmPause(false)}
        >
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setConfirmPause(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button
              onClick={() => {
                handlePause();
                setConfirmPause(false);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Ya, Jeda
            </button>
          </div>
        </AlertMessage>
      )}

    </div>
  );
};

export default RefereeForm;
