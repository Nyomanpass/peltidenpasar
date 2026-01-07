import React, { useState, useEffect } from "react";
import api from "../api"; // Pastikan path api benar
import { Trophy, Medal, Calendar, Search, Filter, ChevronRight, Clock, Hash } from "lucide-react";

function SkorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMatchInfo, setActiveMatchInfo] = useState(null); // Untuk judul modal

  // 1. Ambil data dari backend
useEffect(() => {
  const fetchHistory = async () => {
    try {
      // Ambil ID dari localStorage sesuai data yang kamu kirim tadi
      const tournamentId = localStorage.getItem("selectedTournament");
      
      if (!tournamentId) {
        console.error("Tournament ID tidak ditemukan di localStorage");
        setIsLoading(false);
        return;
      }

     

      // Pastikan endpoint ini sesuai dengan yang ada di backend
      const response = await api.get("/matches", {
        params: { 
          tournamentId: tournamentId,
          status: 'selesai' // Kita minta yang statusnya selesai saja
        }
      });
      
    
      setMatchHistory(response.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchHistory();
}, []);

  // 2. Filter pencarian berdasarkan nama pemain
// 2. Filter pencarian DAN pastikan bukan pertandingan "BYE"
const filteredMatches = matchHistory.filter((m) => {
    // Pertandingan dianggap BYE jika salah satu sisi kosong sama sekali
    const p1Exists = m.peserta1Id || m.doubleTeam1Id;
    const p2Exists = m.peserta2Id || m.doubleTeam2Id;
    
    if (!p1Exists || !p2Exists) return false;

    const p1Name = m.doubleTeam1?.namaTim || m.peserta1?.namaLengkap || "";
    const p2Name = m.doubleTeam2?.namaTim || m.peserta2?.namaLengkap || "";
    
    return (
      p1Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p2Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });



// Ganti fungsi handleLihatLog kamu dengan ini untuk Debugging
const handleLihatLog = async (match) => {
    try {
      if (!match?.id) return;

      const response = await api.get(`/match-logs/${match.id}`);
      
      if (response.data && response.data.length > 0) {
        setSelectedLog(response.data);
        setActiveMatchInfo(match); // DISINKRONKAN: Menggunakan setActiveMatchInfo
        setIsModalOpen(true);
      } else {
        alert("Database kosong untuk pertandingan ini.");
      }
    } catch (err) {
      console.error("Gagal mengambil log:", err);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold">Memuat Riwayat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* --- HEADER --- */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Hasil Pertandingan
            </h1>
            <p className="text-slate-500 font-medium mt-1">Rekapitulasi skor set dan pemenang resmi</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama pemain/tim..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- MATCH LIST --- */}
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Filter size={16} /> Riwayat Pertandingan Selesai
        </h2>

        {filteredMatches.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-slate-300 text-slate-400 font-bold">
                Tidak ada riwayat pertandingan ditemukan.
            </div>
        ) : (
       filteredMatches.map((match) => {
            // LOGIKA PEMENANG YANG AKURAT
            const isP1Winner = 
              (match.winnerId && match.winnerId === match.peserta1Id) || 
              (match.winnerDoubleId && match.winnerDoubleId === match.doubleTeam1Id);
            
            const isP2Winner = 
              (match.winnerId && match.winnerId === match.peserta2Id) || 
              (match.winnerDoubleId && match.winnerDoubleId === match.doubleTeam2Id);

            const p1Name = match.doubleTeam1?.namaTim || match.peserta1?.namaLengkap || "TBA";
            const p2Name = match.doubleTeam2?.namaTim || match.peserta2?.namaLengkap || "TBA";

            return (
              <div key={match.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-6">
                  {/* Info Kategori & Ronde */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            {match.bagan?.nama || "Turnamen"}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                            <Hash size={12} /> Match Slot {match.slot}
                        </span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase">
                        <Clock size={12}/> Selesai
                    </div>
                  </div>

                  {/* Skor Visual Utama */}
                  <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                    
                    {/* Player 1 (Sisi Kiri) */}
                    <div className={`md:col-span-2 text-center md:text-right transition-all ${isP1Winner ? 'text-slate-900 scale-105' : 'text-slate-400 opacity-60'}`}>
                      <h4 className="text-lg font-black leading-tight mb-1">{p1Name}</h4>
                      {isP1Winner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                          <Medal size={12} /> WINNER
                        </span>
                      )}
                    </div>

                    {/* Skor Utama (Tengah) */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-6 bg-slate-900 text-white px-8 py-3 rounded-2xl shadow-xl shadow-slate-200">
                            <span className="text-4xl font-black">{match.score1}</span>
                            <div className="h-10 w-[1px] bg-slate-700"></div>
                            <span className="text-4xl font-black">{match.score2}</span>
                        </div>
                        
                        {/* Detail Per Set (Hanya muncul jika ada poin) */}
                        <div className="flex gap-3 mt-4">
                            {/* Set 1 */}
                            {(match.set1P1 > 0 || match.set1P2 > 0) && (
                                <div className="flex flex-col items-center bg-gray-50 px-3 py-1 rounded-xl border border-slate-200">
                                    <span className="text-[8px] text-gray-400 font-bold uppercase">Set 1</span>
                                    <span className="text-xs font-black text-slate-700">{match.set1P1} - {match.set1P2}</span>
                                </div>
                            )}
                            {/* Set 2 */}
                            {(match.set2P1 > 0 || match.set2P2 > 0) && (
                                <div className="flex flex-col items-center bg-gray-50 px-3 py-1 rounded-xl border border-slate-200">
                                    <span className="text-[8px] text-gray-400 font-bold uppercase">Set 2</span>
                                    <span className="text-xs font-black text-slate-700">{match.set2P1} - {match.set2P2}</span>
                                </div>
                            )}
                            {/* Set 3 */}
                            {(match.set3P1 > 0 || match.set3P2 > 0) && (
                                <div className="flex flex-col items-center bg-gray-50 px-3 py-1 rounded-xl border border-slate-200">
                                    <span className="text-[8px] text-gray-400 font-bold uppercase">Set 3</span>
                                    <span className="text-xs font-black text-slate-700">{match.set3P1} - {match.set3P2}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Player 2 (Sisi Kanan) */}
                    <div className={`md:col-span-2 text-center md:text-left transition-all ${isP2Winner ? 'text-slate-900 scale-105' : 'text-slate-400 opacity-60'}`}>
                      <h4 className="text-lg font-black leading-tight mb-1">{p2Name}</h4>
                      {isP2Winner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                          <Medal size={12} /> WINNER
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer Informasi Tambahan */}
                <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                        <Calendar size={12} /> {new Date(match.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button 
                        type="button" // Tambahkan type button agar tidak dianggap submit
                        onClick={() => handleLihatLog(match)} // Mengirim seluruh objek match
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all uppercase tracking-tighter"
                    >
                        Lihat Log Poin <ChevronRight size={14} />
                    </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL LOG POIN */}
{/* MODAL LOG POIN - UKURAN XL */}
{isModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
    <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
      
      {/* Header Modal - Lebih Elegan */}
      <div className="p-8 border-b bg-slate-50/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h3 className="font-black text-slate-900 uppercase text-base tracking-tighter">Detailed Match Statistics</h3>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            {activeMatchInfo?.doubleTeam1?.namaTim || activeMatchInfo?.peserta1?.namaLengkap} 
            <span className="mx-2 text-slate-300">VS</span> 
            {activeMatchInfo?.doubleTeam2?.namaTim || activeMatchInfo?.peserta2?.namaLengkap}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all text-slate-400"
        >
          <ChevronRight className="rotate-90" size={24} />
        </button>
      </div>

      {/* Body Modal - Tabel Detail */}
      <div className="overflow-y-auto p-6 bg-white flex-1">
        {selectedLog.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-black uppercase tracking-widest">Data log tidak ditemukan</p>
          </div>
        ) : (
          // Mengelompokkan log berdasarkan Set
          Object.values(
            selectedLog.reduce((acc, log) => {
              if (!acc[log.setKe]) acc[log.setKe] = { set: log.setKe, data: [] };
              acc[log.setKe].data.push(log);
              return acc;
            }, {})
          ).map((group) => (
            <div key={group.set} className="mb-10 last:mb-0">
              {/* Header Per Set */}
              <div className="flex items-center gap-4 mb-4">
                <span className="px-5 py-1.5 bg-blue-600 text-white text-xs font-black rounded-full shadow-lg shadow-blue-100">
                  SET {group.set}
                </span>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>

              {/* Tabel Detail Poin dalam Set */}
              <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">No</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score Point</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-blue-50/50 text-blue-600">Game Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {group.data.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-300 text-center">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-bold text-slate-600 italic">
                            {log.keterangan || "Point Exchange"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono text-xs font-black ${log.skorP1 > log.skorP2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                              {log.skorP1}
                            </span>
                            <span className="text-slate-300 font-bold text-xs">-</span>
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono text-xs font-black ${log.skorP2 > log.skorP1 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-400'}`}>
                              {log.skorP2}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 bg-blue-50/30">
                          <div className="flex items-center justify-center font-black text-xs text-slate-900 gap-2">
                            <span>{log.gameP1}</span>
                            <span className="text-slate-300">:</span>
                            <span>{log.gameP2}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Modal */}
      <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
        <p className="text-[10px] font-bold text-slate-400 italic">* Log ini mencatat setiap perpindahan poin secara real-time.</p>
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="px-8 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          Close Statistics
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default SkorPage;