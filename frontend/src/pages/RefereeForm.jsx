import React, { useState, useEffect } from 'react';
import api from '../api';
import { ChevronLeft, History, Trophy, RotateCcw, RefreshCw} from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const RefereeForm = ({ match, onFinish, onBack }) => {
  // State Skor Utama
  const [p1Point, setP1Point] = useState("0");
  const [p2Point, setP2Point] = useState("0");
  const [p1Game, setP1Game] = useState(0);
  const [p2Game, setP2Game] = useState(0);
  
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




  useEffect(() => {
    const fetchLastScore = async () => {
      try {
        const response = await api.get(`/match-log/${match.id}`);
        if (response.data) {
          setP1Point(response.data.skorP1.toString());
          setP2Point(response.data.skorP2.toString());
          setP1Game(response.data.gameP1);
          setP2Game(response.data.gameP2);
          setCurrentSet(response.data.setKe || 1);
          setSetMenangP1(response.data.setMenangP1 || 0);
          setSetMenangP2(response.data.setMenangP2 || 0);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi skor:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLastScore();
  }, [match.id]);

  useEffect(() => {
    api.get(`/matches/${match.id}`).then(res => {
      setScoreRule(res.data.scoreRule);
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
  let nP1 = p1Point, nP2 = p2Point, nG1 = p1Game, nG2 = p2Game;
  let nSetW1 = setMenangP1, nSetW2 = setMenangP2, nSetKe = currentSet;
  let isGameEnd = false;
  let isMatchFinished = false;
  let logKeterangan = `Point: ${nP1}-${nP2}`; // Default keterangan
  
  if (!scoreRule) return;

  const {
    jumlahSet,
    gamePerSet,
    tieBreakPoint,
    finalTieBreakPoint,
    useDeuce
  } = scoreRule;

  const isTieBreakMode = nG1 === gamePerSet && nG2 === gamePerSet;


  // --- 1. LOGIKA POIN ---
 if (isTieBreakMode) {
  let tP1 = parseInt(nP1) || 0; 
  let tP2 = parseInt(nP2) || 0;

  if (player === 1) tP1++; 
  else tP2++;

  nP1 = tP1.toString(); 
  nP2 = tP2.toString();

  logKeterangan = `Tiebreak: ${nP1}-${nP2}`;

  // ⬇️ INI YANG BARU (ambil dari scoreRule)
  const tbTarget = (nSetKe === jumlahSet && finalTieBreakPoint)
    ? finalTieBreakPoint
    : tieBreakPoint;

  if (
    (tP1 >= tbTarget && tP1 - tP2 >= 2) ||
    (tP2 >= tbTarget && tP2 - tP1 >= 2)
  ) {
    isGameEnd = true;
  }
} else {
if (useDeuce) {

  const p1Index = points.indexOf(nP1);
  const p2Index = points.indexOf(nP2);

  if (player === 1) {

    if (nP1 === "40" && nP2 !== "40" && nP2 !== "Ad") {
      isGameEnd = true;
    }
    else if (nP1 === "40" && nP2 === "40") {
      nP1 = "Ad";
    }
    else if (nP1 === "Ad") {
      isGameEnd = true;
    }
    else if (nP2 === "Ad") {
      nP2 = "40";
    }
    else {
      nP1 = points[p1Index + 1];
    }

  } else {

    if (nP2 === "40" && nP1 !== "40" && nP1 !== "Ad") {
      isGameEnd = true;
    }
    else if (nP1 === "40" && nP2 === "40") {
      nP2 = "Ad";
    }
    else if (nP2 === "Ad") {
      isGameEnd = true;
    }
    else if (nP1 === "Ad") {
      nP1 = "40";
    }
    else {
      nP2 = points[p2Index + 1];
    }

  }
}else {
    // tanpa deuce (40 langsung menang)
    if (player === 1) {
      if (nP1 === "40") isGameEnd = true;
      else nP1 = points[points.indexOf(nP1) + 1];
    } else {
      if (nP2 === "40") isGameEnd = true;
      else nP2 = points[points.indexOf(nP2) + 1];
    }
  }

  logKeterangan = `Point: ${nP1}-${nP2}`;
}

  // --- 2. LOGIKA GAME & SET ---
  if (isGameEnd) {
    if (player === 1) nG1++; else nG2++;
    nP1 = "0"; nP2 = "0"; // Reset Point untuk log berikutnya
    logKeterangan = `Game: ${nG1}-${nG2}`;

   let isSetFinished = false;

    // Menang normal (misal 6–0 s/d 6–4, atau sesuai gamePerSet)
    if (
      (nG1 === gamePerSet && nG2 <= gamePerSet - 2) ||
      (nG2 === gamePerSet && nG1 <= gamePerSet - 2)
    ) {
      isSetFinished = true;
    }

    // Menang lewat tiebreak (misal 7–6 jika gamePerSet = 6)
    else if (
      nG1 === gamePerSet + 1 ||
      nG2 === gamePerSet + 1
    ) {
      isSetFinished = true;
    }


    if (isSetFinished) {
      setSetScores(prev => [
        ...prev,
        { set: nSetKe, p1: nG1, p2: nG2 }
      ]);

      if (nG1 > nG2) nSetW1++; else nSetW2++;
      
      if (nSetW1 === targetSetWin || nSetW2 === targetSetWin) {
        isMatchFinished = true;
        logKeterangan = "Match Ended";
      } else {
        logKeterangan = `Set ${nSetKe} Ended`; // Penanda akhir set
        
        // KIRIM LOG PENUTUP SET TERLEBIH DAHULU SEBELUM RESET
        try {
          await api.post('/update-point', {
            matchId: match.id,
            setKe: nSetKe,
            skorP1: "0", skorP2: "0",
            gameP1: nG1, gameP2: nG2,
            setMenangP1: nSetW1, setMenangP2: nSetW2,
            statusMatch: 'berlangsung',
            keterangan: logKeterangan
          });
        } catch (e) { console.error(e); }

        // Setelah kirim log penutup, baru persiapkan untuk set baru
        setSuccess(`Set ${nSetKe} selesai! Skor ${nG1}-${nG2}`);
        nSetKe++;
        nG1 = 0; nG2 = 0; 
        logKeterangan = "Start New Set";
      }
    }
  }




  // Tentukan WinnerId jika selesai
  const isDouble = !!match.doubleTeam1Id; // Cek kategori
  let winnerId = null;
    if (isMatchFinished) {
      // Samakan logika penentuan ID dengan WinnerModal
      winnerId = nSetW1 > nSetW2 
        ? (isDouble ? match.doubleTeam1Id : match.peserta1Id) 
        : (isDouble ? match.doubleTeam2Id : match.peserta2Id);
    }

  // Update State UI
  setP1Point(nP1); setP2Point(nP2); setP1Game(nG1); setP2Game(nG2);
  setCurrentSet(nSetKe); setSetMenangP1(nSetW1); setSetMenangP2(nSetW2);

  // 3. Kirim ke Backend (Log Reguler atau Match Ended)
 try {
    // 1. Tetap kirim log reguler untuk statistik (api.post)
    await api.post('/update-point', {
      matchId: match.id,
      setKe: nSetKe,
      skorP1: nP1, skorP2: nP2,
      gameP1: nG1, gameP2: nG2,
      setMenangP1: nSetW1, setMenangP2: nSetW2,
      statusMatch: isMatchFinished ? 'selesai' : 'berlangsung',
      keterangan: logKeterangan
    });

    // 2. JIKA SELESAI, KIRIM KE ENDPOINT WINNER (Seperti WinnerModal)
    // Ini agar bagan terupdate benar dan tidak menimpa BYE
    if (isMatchFinished) {
      await api.patch(`/${match.id}/winner`, {
        winnerId: isDouble ? null : winnerId,
        winnerDoubleId: isDouble ? winnerId : null,
        score1: nSetW1, // Total set menang
        score2: nSetW2,
        isDouble: isDouble
      });

      setFinalWinnerData({ winnerId, score1: nSetW1, score2: nSetW2 });
      setShowResultConfirm(true);
    }
  } catch (err) {
    console.error("Gagal update data:", err);
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

  if (isLoading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
 <div className="fixed inset-0 bg-[#0a0f1e] z-[1000] text-white font-sans flex items-center justify-center p-4 overflow-hidden">
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



  {/* Header Indikator Status - Dibuat lebih melayang */}

  <div className="max-w-xl mx-auto p-4 relative">

    {/* MENU ⋮ - Dibuat lebih modern */}
    <div className="absolute top-0 right-4 z-[60]">
  <div className="flex flex-col items-end">
    {/* Tombol Titik Tiga */}
    <button
      onClick={() => setShowMenu(!showMenu)}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border ${
        showMenu 
          ? "bg-slate-700 border-slate-500 shadow-lg" 
          : "bg-slate-800/50 border-slate-700 hover:bg-slate-700"
      }`}
    >
      <span className="text-xl font-black text-white">{showMenu ? "✕" : "⋮"}</span>
    </button>

    {showMenu && (
      <div className="mt-3 flex flex-col gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-200">
        
        {/* Dropdown Menu Utama */}
      <div className="bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl w-52 overflow-hidden backdrop-blur-xl">
  {/* Tombol Undo */}
  <button
    onClick={() => {
      setShowMenu(false);
      setConfirmUndo(true)
    }}
    className="w-full text-left px-5 py-4 hover:bg-slate-800 text-sm flex items-center gap-3 transition-colors border-b border-slate-800 group"
  >
    <RotateCcw size={18} className="text-blue-400 group-hover:rotate-[-45deg] transition-transform" />
    <span className="font-semibold text-slate-200">Undo Last Point</span>
  </button>

  {/* Tombol Reset */}
  <button
    onClick={() => {
      setShowMenu(false);
      setConfirmReset(true);
    }}
    className="w-full text-left px-5 py-4 hover:bg-red-950/40 text-sm flex items-center gap-3 transition-colors group"
  >
    <RefreshCw size={18} className="text-red-400 group-hover:rotate-180 transition-transform duration-500" />
    <span className="font-semibold text-red-400">Reset Match</span>
  </button>
</div>

        {/* Info Aturan - Sekarang berada di bawah menu saat showMenu aktif */}
        {scoreRule && (
          <div className="p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl w-64">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tournament Rule</p>
              <p className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded italic leading-none">
                {scoreRule.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 text-center">
                {scoreRule.jumlahSet} Sets
              </span>
              <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 text-center">
                {scoreRule.gamePerSet} Games
              </span>
              <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 text-center">
                {scoreRule.useDeuce ? "Deuce" : "No Deuce"}
              </span>
              <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 text-center">
                TB: {scoreRule.tieBreakPoint}
              </span>
            </div>
          </div>
        )}

      </div>
    )}
  </div>
</div>



    {/* Scoreboard Set Sejarah - Horizontal Scroller Style */}
    <div className="mb-6 flex items-center gap-4">
      <div className="flex-shrink-0 bg-orange-600 px-3 py-1.5 rounded-lg shadow-lg shadow-orange-900/20">
        <span className="text-[10px] font-black uppercase tracking-tighter">Set Score</span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {setScores.length === 0 ? (
          <span className="text-xs text-slate-600 font-medium italic">First set in progress...</span>
        ) : (
          setScores.map(s => (
            <div key={s.set} className="flex items-center bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg gap-2 min-w-fit">
              <span className="text-[10px] font-bold text-slate-500 uppercase">S{s.set}</span>
              <span className="text-sm font-black text-white">{s.p1} - {s.p2}</span>
            </div>
          ))
        )}
      </div>
    </div>

    {/* MAIN SCOREBOARD - The Heroes Section */}
<div className="bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 rounded-[2.5rem] p-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden">
  
  {/* Badge Set Aktif */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-b-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg z-10">
    SET {currentSet}
  </div>

    <div className="text-center mt-10 h-6">
    {scoreRule && p1Game === scoreRule.gamePerSet - 1 && p2Game === scoreRule.gamePerSet - 1 && (
      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
        Deuce Games
      </span>
    )}

    {scoreRule && p1Game === scoreRule.gamePerSet && p2Game === scoreRule.gamePerSet && (
      <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse shadow-lg shadow-orange-500/20">
        Tie Break Round
      </span>
    )}
  </div>

  <div className="pt-5 pb-8 px-4">
    <div className="grid grid-cols-2 gap-6 relative">
      
      {/* Divider Tengah */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4 w-[1px] bg-gradient-to-b from-transparent via-slate-700/50 to-transparent"></div>

      {/* PLAYER 1 */}
      <div className="flex flex-col items-center">
        {/* Serve Indicator - Menjadi penanda utama wasit */}
        <div className="h-6 mb-3 flex items-center justify-center">
          {server === 1 ? (
            <div className="flex gap-1.5 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              {Array.from({ length: serveCount }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="h-6" /> // Placeholder agar posisi nama tidak naik turun
          )}
        </div>

        {/* NAMA PEMAIN */}
        <div className="h-16 flex items-center justify-center mb-2">
          <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-center leading-tight text-white break-words max-w-[140px]">
            {match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim}
          </h2>
        </div>

        {/* POIN UTAMA */}
        <div className="text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
          {p1Point}
        </div>

        {/* GAMES SCORE */}
        <div className="mt-6 flex flex-col items-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Games</span>
          <div className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <span className="text-2xl font-black text-blue-500 italic">{p1Game}</span>
          </div>
        </div>
      </div>

      {/* PLAYER 2 */}
      <div className="flex flex-col items-center">
        {/* Serve Indicator */}
        <div className="h-6 mb-3 flex items-center justify-center">
          {server === 2 ? (
            <div className="flex gap-1.5 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              {Array.from({ length: serveCount }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="h-6" /> // Placeholder agar posisi nama tidak naik turun
          )}
        </div>

        {/* NAMA PEMAIN */}
        <div className="h-16 flex items-center justify-center mb-2">
          <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-center leading-tight text-white break-words max-w-[140px]">
            {match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim}
          </h2>
        </div>

        {/* POIN UTAMA */}
        <div className="text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
          {p2Point}
        </div>

        {/* GAMES SCORE */}
        <div className="mt-6 flex flex-col items-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Games</span>
          <div className="px-4 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="text-2xl font-black text-red-500 italic">{p2Game}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

  {/* Tie Break Label */}
  {scoreRule && p1Game === scoreRule.gamePerSet && p2Game === scoreRule.gamePerSet && (
    <div className="bg-orange-600 py-1.5 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
        <p className="relative text-[10px] font-black text-center text-white tracking-[0.4em] uppercase">Tie Break Active</p>
    </div>
  )}
</div>

    {/* BUTTONS SECTION - Tactile Experience */}
<div className="grid grid-cols-2 gap-3 px-1">
  {/* BUTTON PLAYER 1 - SLIM VERSION */}
  <button 
    onClick={() => handlePoint(1)} 
    className="group relative h-28 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[1.5rem] overflow-hidden shadow-lg shadow-blue-900/30 active:scale-95 transition-all flex flex-col items-center justify-center border-t border-white/20"
  >
    {/* Overlay kilatan saat ditekan */}
    <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
    
    <span className="relative text-[10px] font-black text-blue-100/60 uppercase tracking-[0.2em] mb-1">
      Add Point P1
    </span>
    <div className="flex items-center gap-2">
      <span className="relative text-3xl font-black text-white">+</span>
      
    </div>
  </button>

  {/* BUTTON PLAYER 2 - SLIM VERSION */}
  <button 
    onClick={() => handlePoint(2)} 
    className="group relative h-28 bg-gradient-to-br from-red-600 to-red-700 rounded-[1.5rem] overflow-hidden shadow-lg shadow-red-900/30 active:scale-95 transition-all flex flex-col items-center justify-center border-t border-white/20"
  >
    <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
    
    <span className="relative text-[10px] font-black text-red-100/60 uppercase tracking-[0.2em] mb-1">
      Add Point P2
    </span>
    <div className="flex items-center gap-2">
      <span className="relative text-3xl font-black text-white">+</span>
     
    </div>
  </button>
</div>

    {/* SERVE CONTROLS */}
    <div className="grid grid-cols-2 gap-4 mt-6">
      <button
        onClick={() => {
          if (serveCount === 2) { setServeCount(1); } 
          else { setServeCount(2); setServer(server === 1 ? 2 : 1); }
        }}
        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-yellow-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
      >
        Fault (Serve)
      </button>

      <button
        onClick={() => { setServer(server === 1 ? 2 : 1); setServeCount(2); }}
        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95"
      >
        Change Service
      </button>
    </div>

    {/* UNDO BUTTON - Minimalist */}
   
  </div>

  {/* MODAL FINISH - Premium Centered Modal */}
  {showResultConfirm && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-6 transition-all">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]"></div>
        
        <div className="w-20 h-20 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/20">
          <Trophy className="text-slate-900" size={36} />
        </div>
        
        <h2 className="text-3xl font-black mb-2 tracking-tighter italic">MATCH OVER</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Review Final Results</p>
        
        <div className="bg-black/40 rounded-3xl p-6 mb-8 border border-white/5 shadow-inner">
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Winner</div>
          <div className="font-black text-xl mb-4 text-white uppercase leading-tight">
             {finalWinnerData?.winnerId === (match.doubleTeam1Id || match.peserta1Id) 
              ? (match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim)
              : (match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim)}
          </div>
          <div className="flex justify-center items-center gap-6 mt-4">
            <div className="text-4xl font-black text-white">{finalWinnerData?.score1}</div>
            <div className="h-8 w-[2px] bg-slate-800"></div>
            <div className="text-4xl font-black text-white">{finalWinnerData?.score2}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onFinish(finalWinnerData)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-600/30"
          >
            Submit Score
          </button>
          <button 
            onClick={() => { setShowResultConfirm(false); handleUndo(); }}
            className="w-full bg-transparent text-slate-500 hover:text-white py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors"
          >
            Correction (Undo)
          </button>
        </div>
      </div>
    </div>
  )}


  {confirmUndo && (
  <AlertMessage
    type="warning"
    message="Yakin ingin meng-undo poin terakhir?"
    onClose={() => setConfirmUndo(false)}
  >
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => setConfirmUndo(false)}
        className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
      >
        Batal
      </button>

      <button
        onClick={handleUndo}
        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-blue-500 transition"
      >
        Ya, Undo
      </button>
    </div>
  </AlertMessage>
)}

{confirmReset && (
  <AlertMessage
    type="warning"
    message="Yakin ingin mereset semua skor? Data pertandingan akan kembali ke awal."
    onClose={() => setConfirmReset(false)}
  >
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => setConfirmReset(false)}
        className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
      >
        Batal
      </button>

      <button
        onClick={handleResetMatch}
        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition"
      >
        Ya, Reset
      </button>
    </div>
  </AlertMessage>
)}


</div>
  );
};

export default RefereeForm;