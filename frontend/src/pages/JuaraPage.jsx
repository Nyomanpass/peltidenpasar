import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Trophy, Award, Crown, 
  FileText, FileSpreadsheet, Users, User, Medal,
  Clock, Download, ChevronDown, Loader2
} from "lucide-react"; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import JuaraPDF from './JuaraPDF'; 
import { exportJuaraToExcel } from '../utils/exportJuaraExcel';
import { hitungSelisih } from "../utils/hitungSelisih";

/* ───────────────────────── Konstanta badge podium ───────────────────────── */
const PODIUM = [
  {
    key: "juara1",
    rank: "Juara 1",
    Icon: Trophy,
    card: "bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-white ring-2 ring-amber-300/40",
    iconColor: "text-white/90",
    nameColor: "text-white",
    rankBadge: "bg-white/20 text-white/90 border-white/20",
    glow: "shadow-[0_8px_32px_rgba(245,158,11,0.25)]",
  },
  {
    key: "juara2",
    rank: "Juara 2",
    Icon: Crown,
    card: "bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-800 ring-1 ring-slate-200/80",
    iconColor: "text-slate-400",
    nameColor: "text-slate-800",
    rankBadge: "bg-slate-200/70 text-slate-500 border-slate-300/60",
    glow: "shadow-xs",
  },
  {
    key: "juara3",
    rank: "Juara 3",
    Icon: Award,
    card: "bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-50 text-amber-900 ring-1 ring-amber-200/60",
    iconColor: "text-amber-400/70",
    nameColor: "text-amber-900",
    rankBadge: "bg-amber-100/80 text-amber-600/80 border-amber-200/60",
    glow: "shadow-xs",
  },
];

/* ───────────────────────── Filter tabs config ───────────────────────── */
const FILTERS = [
  { value: "all",    label: "Semua",   Icon: null },
  { value: "single", label: "Tunggal", Icon: User },
  { value: "double", label: "Ganda",   Icon: Users },
];

/* ═══════════════════════════════════════════════════════════════════════ */

const JuaraPage = () => {
  const [winnersData, setWinnersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterKategori, setFilterKategori] = useState("all");

  const [readyPDF, setReadyPDF] = useState(false);

  const [tName, setTName] = useState(localStorage.getItem("selectedTournamentName") || "TURNAMEN"); 
  const role = localStorage.getItem('role');

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const selectedTournament = localStorage.getItem("selectedTournament");
      setTName(localStorage.getItem("selectedTournamentName") || "TURNAMEN");

      if (!selectedTournament) {
        setError("Silakan pilih turnamen terlebih dahulu.");
        setIsLoading(false);
        return;
      }

      const baganResponse = await api.get("/bagan", {
        params: { tournamentId: selectedTournament }
      });

      const winnersPromises = baganResponse.data.map(async (bagan) => {
        try {
          const winnersResponse = await api.get(`/juara/${bagan.id}`);
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            kategori: bagan.kategori ? bagan.kategori.toLowerCase().trim() : "single", 
            kelompokUmurId: bagan.kelompokUmurId, 
            winners: winnersResponse.data || {},
          };
        } catch (err) {
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            kategori: bagan.kategori ? bagan.kategori.toLowerCase().trim() : "single",
            kelompokUmurId: bagan.kelompokUmurId, 
            winners: null,
          };
        }
      });

      const allWinners = await Promise.all(winnersPromises);
      setWinnersData(allWinners);
      setError(null);
    } catch (err) {
      console.error("Error fetch data:", err);
      setError("Gagal memuat data juara.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleTournamentChange = () => {
      fetchAllData();
    };

    fetchAllData();

    window.addEventListener("tournament-changed", handleTournamentChange);

    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, []);

  useEffect(() => {
    setReadyPDF(false);
  }, [filterKategori]);

  const renderWinnerName = (winner) => {
    if (!winner) return "Belum Ditetapkan";
    if (winner.Player1 && winner.Player2) {
      return `${winner.Player1.namaLengkap} / ${winner.Player2.namaLengkap}`;
    }
    if (winner.namaTim) return winner.namaTim;
    return winner.namaLengkap || "N/A";
  };

  const filteredWinners = winnersData.filter((data) => {
    if (filterKategori === "all") return true;
    return data.kategori === filterKategori;
  });

  /* ───────── Loading ───────── */
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-500 flex items-center justify-center mb-4 shadow-xs">
          <Loader2 size={26} className="animate-spin" />
        </div>
        <h3 className="font-extrabold text-slate-800 text-base">Memuat Data Hasil Pertandingan...</h3>
        <p className="text-slate-400 text-xs mt-1">Mengambil perolehan podium juara dan klasemen akhir</p>
      </div>
    );
  }

  /* ───────── Error ───────── */
  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center max-w-sm shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-500">
            <Trophy size={22} />
          </div>
          <p className="text-slate-800 font-bold text-sm mb-1">{error}</p>
          <p className="text-slate-400 text-xs mb-4">Pastikan turnamen sudah dipilih dan koneksi stabil.</p>
          <button
            onClick={fetchAllData}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  /* ───────── Main content ───────── */
  return (
    <div className="min-h-screen pb-16">
      
      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hasil Pertandingan
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
          Daftar peraih podium juara dan klasemen akhir per kategori
        </p>
      </div>

      {/* ===== TOOLBAR: FILTER & ACTIONS ===== */}
      <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Filter Kategori Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-full sm:w-fit">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterKategori(f.value)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 ${
                  filterKategori === f.value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                {f.Icon && <f.Icon size={13} />}
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons (Export PDF & Excel) */}
          {(role === "admin" || role === "panitia") && filteredWinners.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Tombol PDF */}
              {!readyPDF ? (
                <button 
                  key="btn-siapkan"
                  onClick={() => setReadyPDF(true)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95"
                >
                  <FileText size={15} className="text-rose-500" /> 
                  <span>Export PDF</span>
                </button>
              ) : (
                <PDFDownloadLink
                  key="btn-download"
                  document={<JuaraPDF winnersData={filteredWinners} tournamentName={tName} />}
                  fileName={`Juara_${tName}_${filterKategori}.pdf`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  onClick={() => {
                    setTimeout(() => {
                      setReadyPDF(false);
                    }, 2500);
                  }}
                >
                  {({ loading }) => (
                    <>
                      <Download size={15} />
                      <span>{loading ? "Menyusun PDF..." : "Unduh PDF Sekarang"}</span>
                    </>
                  )}
                </PDFDownloadLink>
              )}

              {/* Tombol Excel */}
              <button
                onClick={() => exportJuaraToExcel(filteredWinners, tName, filterKategori)}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95"
              >
                <FileSpreadsheet size={15} className="text-emerald-500" /> 
                <span>Export Excel</span>
              </button>
            </div>
          )}
        </div>

        {/* Ringkasan Counter */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Trophy size={13} className="text-amber-500" />
            <span className="font-bold text-slate-600">{filteredWinners.length}</span>
            <span>kategori ditemukan</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Medal size={13} className="text-amber-500" />
            <span className="font-bold text-slate-600">
              {filteredWinners.filter(d => d.winners && (d.winners.juara1 || d.winners.juara2 || d.winners.juara3)).length}
            </span>
            <span>sudah ada pemenang</span>
          </div>
        </div>
      </div>

      {/* ===== LIST KARTU PODIUM JUARA ===== */}
      {filteredWinners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-xs">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-400 mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Data Juara</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            Belum ada bagan yang cocok untuk kategori {filterKategori === "all" ? "yang dipilih" : filterKategori}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWinners
            .sort((a, b) => (a.kelompokUmurId || 0) - (b.kelompokUmurId || 0))
            .map((data) => {
              const winners = data.winners;
              const hasJuara = winners && (winners.juara1 || winners.juara2 || winners.juara3);

              return (
                <div 
                  key={data.baganId} 
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  {/* Header Bagan Card */}
                  <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-500 shrink-0">
                        <Trophy size={18} />
                      </div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight truncate">
                        {data.baganNama}
                      </h2>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                      data.kategori === 'double' 
                        ? 'bg-violet-50 text-violet-600 border-violet-200/60' 
                        : 'bg-sky-50 text-sky-600 border-sky-200/60'
                    }`}>
                      {data.kategori === 'double' ? <Users size={11} /> : <User size={11} />}
                      {data.kategori === 'double' ? 'Ganda' : 'Tunggal'}
                    </span>
                  </div>

                  {/* Body: Podium 1 - 2 - 3 */}
                  <div className="p-5 sm:p-6">
                    {!hasJuara ? (
                      <div className="py-10 px-6 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200/80">
                        <Clock size={28} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-600 font-bold text-xs">
                          Pertandingan Sedang Berlangsung
                        </p>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Data pemenang podium belum ditetapkan untuk bagan ini.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Grid Podium Juara */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                          
                          {PODIUM.map((p) => {
                            const winnerData = p.key === "juara3" ? winners.juara3 : winners[p.key];
                            const name = p.key === "juara3"
                              ? (Array.isArray(winnerData) 
                                  ? winnerData.filter(Boolean).map(renderWinnerName).join(" & ") 
                                  : renderWinnerName(winnerData))
                              : renderWinnerName(winnerData);
                            const isEmpty = !winnerData || name === "Belum Ditetapkan";

                            return (
                              <div 
                                key={p.key} 
                                className={`relative p-5 md:p-6 rounded-2xl text-center flex flex-col justify-center items-center min-h-[140px] transition-all duration-200 ${p.card} ${p.glow}`}
                              >
                                {/* Rank Badge */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border mb-3 ${p.rankBadge}`}>
                                  {p.rank}
                                </span>

                                <p.Icon className={`mx-auto mb-2.5 w-7 h-7 md:w-8 md:h-8 ${p.iconColor}`} />
                                
                                <p className={`text-xs md:text-sm font-extrabold break-words leading-snug uppercase ${p.nameColor} ${isEmpty ? "opacity-50 italic" : ""}`}>
                                  {name}
                                </p>
                              </div>
                            );
                          })}

                        </div>

                        {/* Tabel Klasemen Akhir (Round Robin) */}
                        {winners.klasemen && winners.klasemen.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                              <Medal size={15} className="text-amber-500" />
                              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                Klasemen Akhir Babak
                              </h3>
                            </div>
                            
                            <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
                              <table className="min-w-full text-xs bg-white">
                                <thead className="bg-slate-50/90 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                  <tr>
                                    <th className="px-3.5 py-3 text-center w-12">#</th>
                                    <th className="px-4 py-3 text-left">Peserta / Tim</th>
                                    <th className="px-3.5 py-3 text-center font-black text-amber-700 bg-amber-50/40">PTS</th>
                                    <th className="px-3 py-3 text-center">Menang</th>
                                    <th className="px-3 py-3 text-center">Kalah</th>
                                    <th className="px-3.5 py-3 text-center font-bold">+/- Game</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {winners.klasemen.map((p, index) => {
                                    const isTop = index === 0;
                                    return (
                                      <tr key={index} className={`transition-colors ${isTop ? "bg-amber-50/30" : "hover:bg-slate-50/60"}`}>
                                        <td className="px-3.5 py-3 text-center">
                                          {isTop ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black border border-amber-200/60">
                                              {index + 1}
                                            </span>
                                          ) : (
                                            <span className="font-bold text-slate-400">{index + 1}</span>
                                          )}
                                        </td>
                                        <td className={`px-4 py-3 font-bold uppercase ${isTop ? "text-amber-800" : "text-slate-800"}`}>
                                          {renderWinnerName(p.peserta)}
                                        </td>
                                        <td className={`px-3.5 py-3 text-center font-black ${isTop ? "text-amber-700 bg-amber-50/40" : "text-amber-600 bg-amber-50/20"}`}>
                                          {p.poin || '0'}
                                        </td>
                                        <td className="px-3 py-3 text-center font-bold text-emerald-600">
                                          {p.menang || '0'}
                                        </td>
                                        <td className="px-3 py-3 text-center font-medium text-rose-500">
                                          {p.kalah || '0'}
                                        </td>
                                        <td className="px-3.5 py-3 text-center font-bold text-slate-600">
                                          {hitungSelisih(p)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

    </div>
  );
};

export default JuaraPage;