import React, { useState, useEffect } from 'react';
import api from '../api';
import { ChevronLeft, Trophy, History } from 'lucide-react';

const RefereeForm = ({ match, jadwalId, onFinish, onBack }) => {
  const [p1Point, setP1Point] = useState("0");
  const [p2Point, setP2Point] = useState("0");
  const [p1Game, setP1Game] = useState(0);
  const [p2Game, setP2Game] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // State baru agar tidak kaget saat loading
  
  const points = ["0", "15", "30", "40", "Ad"];

  useEffect(() => {
    const fetchLastScore = async () => {
      try {
        // Ganti endpoint ini sesuai dengan route backend kamu untuk mengambil LOG TERAKHIR
        const response = await api.get(`/match-log/${match.id}`);
        
        if (response.data) {
          // Jika ada data di database, pasang ke layar
          setP1Point(response.data.skorP1.toString());
          setP2Point(response.data.skorP2.toString());
          setP1Game(response.data.gameP1);
          setP2Game(response.data.gameP2);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi skor:", err);
      } finally {
        setIsLoading(false); // Selesai loading
      }
    };

    fetchLastScore();
  }, [match.id]);

   const handlePoint = async (player) => {
    let nP1 = p1Point, nP2 = p2Point, nG1 = p1Game, nG2 = p2Game;
    let isGameEnd = false;
    
    // Cek apakah saat ini sedang dalam kondisi Tie-Break (6-6)
    const isTieBreakMode = nG1 === 6 && nG2 === 6;

    if (isTieBreakMode) {
        // --- LOGIKA TIE-BREAK (Poin: 1, 2, 3, dst) ---
        let tP1 = parseInt(nP1) || 0;
        let tP2 = parseInt(nP2) || 0;

        if (player === 1) tP1++; else tP2++;
        
        nP1 = tP1.toString();
        nP2 = tP2.toString();

        // Tie-break selesai jika salah satu mencapai minimal 7 poin DAN selisih 2
        if ((tP1 >= 7 && tP1 - tP2 >= 2) || (tP2 >= 7 && tP2 - tP1 >= 2)) {
            if (player === 1) nG1++; else nG2++;
            isGameEnd = true; // Untuk mentrigger status selesai
        }
    } else {
        // --- LOGIKA TENIS STANDAR (0, 15, 30, 40, Ad) ---
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

        if (isGameEnd) {
            if (player === 1) nG1++; else nG2++;
            // Poin direset ke "0" setelah game berakhir
            nP1 = "0"; nP2 = "0";
        }
    }

    // --- LOGIKA PENENTU SELESAI (MATCH END) ---
    // 1. Menang jika mencapai 6 game DAN selisih minimal 2 (6-0 s/d 6-4, atau 7-5)
    // 2. ATAU Menang jika memenangkan tie-break (7-6)
    const isFinished = 
        (nG1 >= 6 && nG1 - nG2 >= 2) || 
        (nG2 >= 6 && nG2 - nG1 >= 2) || 
        (nG1 === 7 || nG2 === 7);

    let winnerId = null;
    if (isFinished) {
        winnerId = nG1 > nG2 ? (match.doubleTeam1Id || match.peserta1Id) : (match.doubleTeam2Id || match.peserta2Id);
    }

    // Update State Lokal
    setP1Point(nP1); setP2Point(nP2); setP1Game(nG1); setP2Game(nG2);

    // KIRIM KE BACKEND
    try {
        await api.post('/update-point', {
            matchId: match.id,
            setKe: 1,
            skorP1: nP1,
            skorP2: nP2,
            gameP1: nG1,
            gameP2: nG2,
            keterangan: isFinished ? "Pertandingan Selesai" : (isTieBreakMode ? `Tie Break: ${nP1}-${nP2}` : `Point for P${player}`),
            statusMatch: isFinished ? 'selesai' : 'berlangsung',
            winnerId: winnerId,
            isDouble: !!match.doubleTeam1Id
        });
        
        if (isFinished) {
            alert(`Pertandingan Selesai! Skor Akhir: ${nG1}-${nG2}`);
            onFinish();
        }
    } catch (err) { 
        console.error("Gagal update poin:", err); 
        alert("Terjadi kesalahan koneksi!");
    }



    
};

    if (isLoading) {
        return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">
            <p className="animate-pulse">Menyinkronkan Skor Terakhir...</p>
        </div>
        );
    }

    const handleUndo = async () => {
    // 1. Cek dulu apakah skor sudah 0-0
    if (p1Point === "0" && p2Point === "0" && p1Game === 0 && p2Game === 0) {
        alert("Skor sudah 0-0, tidak ada poin yang bisa dibatalkan.");
        return;
    }

    // 2. Tampilkan Konfirmasi (Yakin?)
    const yakin = window.confirm("Apakah Anda yakin ingin membatalkan poin terakhir?");
    
    if (yakin) {
        try {
            // 3. Proses hapus di backend
            await api.delete(`/undo-point/${match.id}`);
            
            // 4. Ambil data terbaru setelah dihapus
            const response = await api.get(`/match-log/${match.id}`);
            
            if (response.data) {
                setP1Point(response.data.skorP1.toString());
                setP2Point(response.data.skorP2.toString());
                setP1Game(response.data.gameP1);
                setP2Game(response.data.gameP2);
            } else {
                // Jika log benar-benar habis
                setP1Point("0");
                setP2Point("0");
                setP1Game(0);
                setP2Game(0);
            }

            // 5. Notifikasi Berhasil
            alert("Undo Berhasil! Skor telah dikembalikan.");

        } catch (err) {
            console.error("Gagal undo:", err);
            alert("Gagal melakukan undo. Data mungkin sudah kosong.");
        }
    }
};

  return (
    <div className="fixed inset-0 bg-slate-950 z-[1000] text-white overflow-y-auto">
      <div className="max-w-xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-8"><ChevronLeft/> Kembali ke Jadwal</button>
        
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl mb-6">
           {/* Menampilkan indikator jika Tie Break */}
           {p1Game === 6 && p2Game === 6 && (
            <div className="bg-orange-600 text-[10px] font-bold py-1 px-3 rounded-full w-fit mx-auto mb-4 tracking-widest uppercase">Mode Tie Break</div>
          )}

          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-4">{match.peserta1?.namaLengkap || match.doubleTeam1?.namaTim}</p>
              <div className="text-8xl font-black mb-4">{p1Point}</div>
              <div className="text-xl font-bold text-blue-500">Games: {p1Game}</div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-4">{match.peserta2?.namaLengkap || match.doubleTeam2?.namaTim}</p>
              <div className="text-8xl font-black mb-4">{p2Point}</div>
              <div className="text-xl font-bold text-red-500">Games: {p2Game}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handlePoint(1)} className="h-40 bg-blue-600 rounded-3xl text-3xl font-black shadow-lg active:scale-95 transition">+ P1</button>
          <button onClick={() => handlePoint(2)} className="h-40 bg-red-600 rounded-3xl text-3xl font-black shadow-lg active:scale-95 transition">+ P2</button>
        </div>
        {/* Taruh ini di bawah grid tombol +P1 dan +P2 */}
        <div className="mt-8 flex flex-col gap-3 items-center">
            <button 
                onClick={handleUndo}
                className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 text-slate-400 px-8 py-4 rounded-2xl text-sm font-bold transition-all border border-slate-700 active:scale-95 shadow-lg"
            >
                <History size={20} /> UNDO (BATALKAN POIN)
            </button>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                Klik undo jika salah input skor
            </p>
        </div>
      </div>
    </div>
  );
};

export default RefereeForm