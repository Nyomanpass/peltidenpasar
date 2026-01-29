import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  Trophy, Calendar, Search, 
  ChevronRight, Clock, Users, User, Tag, Layers
} from "lucide-react";

function SkorPage() {
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Filter (Kategori Dihapus)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKU, setFilterKU] = useState("Semua");
  const [filterType, setFilterType] = useState("Semua");
  const [filterDate, setFilterDate] = useState("Semua");

  // State Modal
  const [selectedLog, setSelectedLog] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMatchInfo, setActiveMatchInfo] = useState(null);

// Fungsi fetch dipisah agar bisa dipanggil berulang kali


 // Fungsi fetch dipisah agar bisa dipanggil berulang kali
  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const tournamentId = localStorage.getItem("selectedTournament");
      if (!tournamentId) {
        setMatchHistory([]); // Kosongkan data jika turnamen tidak ada
        setIsLoading(false);
        return;
      }
      const response = await api.get("/matches", {
        params: { tournamentId: tournamentId, status: 'selesai' }
      });
      setMatchHistory(response.data);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Jalankan pertama kali saat halaman dibuka
    fetchHistory();

    // 2. Buat fungsi listener untuk mendeteksi perubahan turnamen
    const handleTournamentChange = () => {
      console.log("Turnamen berubah, memuat ulang skor...");
      fetchHistory();
    };

    // 3. Pasang pendengar (listener) event
    window.addEventListener("tournament-changed", handleTournamentChange);

    // 4. Bersihkan pendengar saat pindah halaman (cleanup)
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, []); // Kosongkan dependency agar tidak loop

  // --- PREPARASI OPSI FILTER ---
  const listKU = ["Semua", ...new Set(matchHistory.map(m => m.bagan?.KelompokUmur?.nama).filter(Boolean))];

 // --- AMBIL TANGGAL UNIK DARI DATA YANG ADA ---
  const listDates = ["Semua", ...new Set(matchHistory
    .map(m => {
      // Kita ambil dari updatedAt karena itu tanggal skor diselesaikan
      if (!m.updatedAt) return null;
      const d = new Date(m.updatedAt);
      return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })
    .filter(Boolean) // Membuang nilai null atau Invalid
  )].sort((a, b) => {
    if (a === "Semua") return -1;
    if (b === "Semua") return 1;
    return new Date(b) - new Date(a); // Urutkan: Tanggal terbaru muncul paling atas
  });

  // --- LOGIKA FILTER UTAMA ---
  const filteredMatches = matchHistory.filter((m) => {

    const p1Exists = m.peserta1Id || m.doubleTeam1Id;
    const p2Exists = m.peserta2Id || m.doubleTeam2Id;

    if (!p1Exists || !p2Exists) return false;

    const isDouble = !!m.doubleTeam1Id;

    // 1. Filter Nama
    const p1Names = isDouble 
      ? `${m.doubleTeam1?.namaTim} ${m.doubleTeam1?.Player1?.namaLengkap} ${m.doubleTeam1?.Player2?.namaLengkap}`
      : `${m.peserta1?.namaLengkap}`;
    const p2Names = isDouble 
      ? `${m.doubleTeam2?.namaTim} ${m.doubleTeam2?.Player1?.namaLengkap} ${m.doubleTeam2?.Player2?.namaLengkap}`
      : `${m.peserta2?.namaLengkap}`;
    const isNameMatch = (p1Names + p2Names).toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filter Kelompok Umur
    const matchKU = m.bagan?.KelompokUmur?.nama || "Umum";
    const isKUMatch = filterKU === "Semua" || matchKU === filterKU;

    // 3. Filter Format (Tunggal / Ganda)
    const isTypeMatch = filterType === "Semua" || 
      (filterType === "Ganda" && isDouble) || 
      (filterType === "Tunggal" && !isDouble);

    // 4. Filter Tanggal
    const matchDate = new Date(m.updatedAt).toISOString().split('T')[0];
    const isDateMatch = filterDate === "Semua" || matchDate === filterDate;

    return isNameMatch && isKUMatch && isTypeMatch && isDateMatch;
  });

  const handleLihatLog = async (match) => {
    try {
      const response = await api.get(`/match-logs/${match.id}`);
      if (response.data?.length > 0) {
        setSelectedLog(response.data);
        setActiveMatchInfo(match);
        setIsModalOpen(true);
      } else {
        alert("Log poin belum tersedia.");
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen">
      
      <div className="mx-auto mb-10">
      {/* --- HEADER UTAMA --- */}
<div className="mb-8 border-b pb-4">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        Skor Pertandingan
      </h1>
      <p className="text-md text-yellow-600 font-semibold mt-1">
        Tournament: {localStorage.getItem("selectedTournamentName") || "Belum Memilih"}
      </p>
    </div>

    {/* TOOLBAR KANAN (optional, kalau mau taruh search cepat) */}
    <div className="flex items-center gap-3">
      {/* bisa kosong atau isi nanti */}
    </div>
  </div>
</div>


        {/* Panel Filter Grid - Sekarang 4 Kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="relative">
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Cari Pemain / Tim</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Nama..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Kelompok Umur</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none cursor-pointer" 
              value={filterKU} 
              onChange={(e) => setFilterKU(e.target.value)}
            >
              {listKU.map(ku => <option key={ku} value={ku}>{ku}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Format</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none cursor-pointer" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Semua">Semua Format</option>
              <option value="Tunggal">Tunggal</option>
              <option value="Ganda">Ganda</option>
            </select>
          </div>

         <div>
  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1">Tanggal</label>
  <select 
    className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none cursor-pointer" 
    value={filterDate} 
    onChange={(e) => setFilterDate(e.target.value)}
  >
    {listDates.map((dateString) => (
      <option key={dateString} value={dateString}>
        {dateString === "Semua" 
          ? "Semua Tanggal" 
          : new Date(dateString).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })
        }
      </option>
    ))}
  </select>
</div>
        </div>
      </div>

      <div className="mx-auto space-y-6">
        {isLoading ? (
          <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Memuat Riwayat...</div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white py-20 rounded-[2rem] text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-xs">Data tidak ditemukan</div>
        ) : (
          filteredMatches.map((match) => {
            const isDouble = !!match.doubleTeam1Id;
            const p1Name = isDouble ? match.doubleTeam1?.namaTim : match.peserta1?.namaLengkap;
            const p2Name = isDouble ? match.doubleTeam2?.namaTim : match.peserta2?.namaLengkap;
            
            const isP1Winner = isDouble ? (match.winnerDoubleId === match.doubleTeam1Id) : (match.winnerId === match.peserta1Id);
            const isP2Winner = isDouble ? (match.winnerDoubleId === match.doubleTeam2Id) : (match.winnerId === match.peserta2Id);

            return (
              <div key={match.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6 md:p-8">
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={10} /> {match.bagan?.nama || "Match"}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={10} /> KU: {match.bagan?.KelompokUmur?.nama || "Umum"}
                      </span>
                      <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 ${isDouble ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                        {isDouble ? <Users size={12}/> : <User size={12}/>} {isDouble ? 'Ganda' : 'Tunggal'}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                      Match {match.slot} • Round {match.round}
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-8">
                    <div className={`md:col-span-2 text-center md:text-right ${isP1Winner ? 'text-slate-900' : 'text-slate-400 opacity-40'}`}>
                      <h4 className="text-lg font-black leading-tight uppercase tracking-tight">{p1Name}</h4>
                      {isDouble && (
                        <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase italic">
                          {match.doubleTeam1?.Player1?.namaLengkap} / {match.doubleTeam1?.Player2?.namaLengkap}
                        </p>
                      )}
                      {isP1Winner && <span className="inline-block mt-2 bg-yellow-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Winner</span>}
                    </div>

                    <div className="md:col-span-3 flex flex-col items-center">
                      <div className="flex items-center gap-6 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl shadow-slate-200">
                        <span className="text-5xl font-black">{match.score1}</span>
                        <div className="h-10 w-[2px] bg-slate-700"></div>
                        <span className="text-5xl font-black">{match.score2}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-6">
                        {[1, 2, 3].map(sNum => {
                          const s1 = match[`set${sNum}P1`];
                          const s2 = match[`set${sNum}P2`];
                          if (s1 === 0 && s2 === 0) return null;
                          return (
                            <div key={sNum} className="flex flex-col items-center bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-2xl min-w-[55px]">
                              <span className="text-[7px] text-slate-400 font-black uppercase">Set {sNum}</span>
                              <span className="text-xs font-black">{s1}-{s2}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`md:col-span-2 text-center md:text-left ${isP2Winner ? 'text-slate-900' : 'text-slate-400 opacity-40'}`}>
                      <h4 className="text-lg font-black leading-tight uppercase tracking-tight">{p2Name}</h4>
                      {isDouble && (
                        <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase italic">
                          {match.doubleTeam2?.Player1?.namaLengkap} / {match.doubleTeam2?.Player2?.namaLengkap}
                        </p>
                      )}
                      {isP2Winner && <span className="inline-block mt-2 bg-yellow-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Winner</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={14} className="text-blue-500" />
                      {new Date(match.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Clock size={14} className="text-blue-500" />
                      {new Date(match.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>
                  <button 
                    onClick={() => handleLihatLog(match)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
                  >
                    Detail Poin <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL LOG (Tanpa Perubahan) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Detailed Match Logs</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                   {activeMatchInfo?.bagan?.nama} • Slot {activeMatchInfo?.slot}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all font-black text-xs uppercase">Tutup</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {Object.values(
                selectedLog.reduce((acc, log) => {
                  if (!acc[log.setKe]) acc[log.setKe] = { set: log.setKe, data: [] };
                  acc[log.setKe].data.push(log);
                  return acc;
                }, {})
              ).map((group) => (
                <div key={group.set}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-4 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg">SET {group.set}</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </div>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase">
                        <tr>
                          <th className="px-4 py-3 text-center w-12">#</th>
                          <th className="px-4 py-3">Poin</th>
                          <th className="px-4 py-3 text-center">Rekap Game</th>
                          <th className="px-4 py-3">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {group.data.map((log, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/30">
                            <td className="px-4 py-4 text-center font-bold text-slate-300">{idx + 1}</td>
                            <td className="px-4 py-4 italic text-slate-500 font-medium">
                               <div className="flex items-center gap-2">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono font-black ${log.skorP1 > log.skorP2 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{log.skorP1}</span>
                                <span className="text-slate-200">:</span>
                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono font-black ${log.skorP2 > log.skorP1 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>{log.skorP2}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center font-black text-slate-800 bg-slate-50/50">{log.gameP1} - {log.gameP2}</td>
                            <td className="px-4 py-4 italic text-slate-500 font-medium">{log.keterangan || "Point Exchange"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkorPage;