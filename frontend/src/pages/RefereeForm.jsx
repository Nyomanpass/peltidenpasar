import React, { useState, useEffect } from 'react';
import api from '../api';
import { ChevronLeft, History, Trophy } from 'lucide-react';

const RefereeForm = ({ match, onFinish, onBack }) => {
  // State Skor Utama
  const [p1Point, setP1Point] = useState("0");
  const [p2Point, setP2Point] = useState("0");
  const [p1Game, setP1Game] = useState(0);
  const [p2Game, setP2Game] = useState(0);
  
  // State Set (Best of Three)
  const [currentSet, setCurrentSet] = useState(1);
  const [setMenangP1, setSetMenangP1] = useState(0);
  const [setMenangP2, setSetMenangP2] = useState(0);
  

  const [showResultConfirm, setShowResultConfirm] = useState(false);
  const [finalWinnerData, setFinalWinnerData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const points = ["0", "15", "30", "40", "Ad"];

  const [scoreRule, setScoreRule] = useState(null);
  const targetSetWin = scoreRule ? Math.ceil(scoreRule.jumlahSet / 2) : null;


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
    // pakai deuce (tenis)
    if (player === 1) {
      if (nP1 === "40" && nP2 < "40") isGameEnd = true;
      else if (nP1 === "Ad") isGameEnd = true;
      else if (nP1 === "40" && nP2 === "Ad") nP2 = "40";
      else nP1 = points[points.indexOf(nP1) + 1];
    } else {
      if (nP2 === "40" && nP1 < "40") isGameEnd = true;
      else if (nP2 === "Ad") isGameEnd = true;
      else if (nP2 === "40" && nP1 === "Ad") nP1 = "40";
      else nP2 = points[points.indexOf(nP2) + 1];
    }
  } else {
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
        alert(`Set ${nSetKe} Selesai! Skor: ${nG1}-${nG2}`);
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
    if (window.confirm("Undo poin terakhir?")) {
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
      } catch (err) { alert("Tidak bisa undo."); }
    }
  };

  if (isLoading) return <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    
    <div className="fixed inset-0 bg-slate-950 z-[1000] text-white overflow-y-auto">
        {/* Indikator Status Game */}
        <div className="text-center mb-4 h-4">
            {scoreRule && p1Game === scoreRule.gamePerSet - 1 && p2Game === scoreRule.gamePerSet - 1 && (
              <span className="text-yellow-500 font-bold text-[10px] uppercase tracking-widest">
                Deuce Games
              </span>
            )}

            {scoreRule && p1Game === scoreRule.gamePerSet && p2Game === scoreRule.gamePerSet && (
                <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                  Tie Break Round
                </span>
              )}

        </div>
      <div className="max-w-xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-6"><ChevronLeft/> Kembali</button>
        {scoreRule && (
          <div className="mb-4 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Aturan Skor
            </p>
            <p className="text-sm font-bold text-yellow-400">
              {scoreRule.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {scoreRule.jumlahSet} Set · {scoreRule.gamePerSet} Game/Set · 
              {scoreRule.useDeuce ? " Deuce" : " No Deuce"} · 
              TB {scoreRule.tieBreakPoint}
              {scoreRule.finalTieBreakPoint && ` / Final TB ${scoreRule.finalTieBreakPoint}`}
            </p>
          </div>
        )}

        {/* Scoreboard Set */}
        <div className="flex justify-between mb-4 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Set Score</span>
            <div className="flex gap-4 font-black text-orange-500">
                <span>P1: {setMenangP1}</span>
                <span>P2: {setMenangP2}</span>
            </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest">Set {currentSet}</div>
          
              {scoreRule && p1Game === scoreRule.gamePerSet && p2Game === scoreRule.gamePerSet && (
              <div className="bg-orange-600 text-[10px] font-bold py-1 px-3 rounded-full w-fit mx-auto mb-4 tracking-widest uppercase">
                Tie Break
              </div>
            )}


          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-4 h-8 leading-tight">{match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim}</p>
              <div className="text-8xl font-black mb-4">{p1Point}</div>
              <div className="text-xl font-bold text-blue-500">Games: {p1Game}</div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-4 h-8 leading-tight">{match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim}</p>
              <div className="text-8xl font-black mb-4">{p2Point}</div>
              <div className="text-xl font-bold text-red-500">Games: {p2Game}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handlePoint(1)} className="h-40 bg-blue-600 rounded-3xl text-3xl font-black shadow-lg active:scale-95 transition">+ P1</button>
          <button onClick={() => handlePoint(2)} className="h-40 bg-red-600 rounded-3xl text-3xl font-black shadow-lg active:scale-95 transition">+ P2</button>
        </div>

        <button onClick={handleUndo} className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-800 text-slate-400 py-4 rounded-2xl text-sm font-bold border border-slate-700 active:scale-95 transition">
          <History size={18}/> UNDO POIN TERAKHIR
        </button>
      </div>

      {/* OVERLAY KONFIRMASI HASIL AKHIR */}
      {showResultConfirm && (
        <div className="fixed inset-0 bg-slate-950/95 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-yellow-500" size={40} />
            </div>
            
            <h2 className="text-2xl font-black mb-2">Match Finished!</h2>
            <p className="text-slate-400 text-sm mb-6">Silakan periksa hasil akhir sebelum menyimpan ke sistem.</p>
            
            <div className="bg-slate-950 rounded-2xl p-4 mb-8 border border-slate-800">
              <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Final Result</span>
                <span>Sets Score</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm truncate max-w-[150px]">
                   {finalWinnerData?.winnerId === (match.doubleTeam1Id || match.peserta1Id) 
                    ? (match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim)
                    : (match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim)}
                </span>
                <span className="text-2xl font-black text-orange-500">
                  {finalWinnerData?.score1} - {finalWinnerData?.score2}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-green-500 font-bold uppercase">
                Status: Pemenang Terdeteksi
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onFinish(finalWinnerData)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                SIMPAN & SELESAIKAN
              </button>
              <button 
                onClick={() => {
                    setShowResultConfirm(false);
                    handleUndo(); // Otomatis tawarkan undo jika salah
                }}
                className="w-full bg-slate-800 text-slate-400 py-3 rounded-2xl font-bold text-sm"
              >
                KOREKSI SKOR (UNDO)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefereeForm;