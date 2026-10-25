import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Trophy, Award, Crown, CheckCircle, Layout, 
  FileText, FileSpreadsheet, Users, User, Medal,
  Clock, Filter, Sparkles, Download
} from "lucide-react"; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import JuaraPDF from './JuaraPDF'; 
import { exportJuaraToExcel } from '../utils/exportJuaraExcel';
import { hitungSelisih } from "../utils/hitungSelisih";

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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 animate-spin shadow-xs">
          <Trophy size={26} />
        </div>
        <h3 className="font-extrabold text-slate-800 text-base">Memuat Data Hasil Pertandingan...</h3>
        <p className="text-slate-400 text-xs mt-1">Mengambil perolehan podium juara dan klasemen akhir</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-md shadow-xs">
          <p className="text-rose-600 font-bold text-sm mb-3">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      
      {/* ===== HEADER AREA ===== */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hasil Pertandingan
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
          Daftar peraih podium juara turnamen resmi dan klasemen akhir per kategori
        </p>
      </div>

      {/* ===== TOOLBAR: FILTER & ACTIONS ===== */}
      <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Filter Kategori Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-full sm:w-fit overflow-x-auto">
          {/* Semua */}
          <button
            onClick={() => setFilterKategori("all")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              filterKategori === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua
          </button>

          {/* Tunggal / Single */}
          <button
            onClick={() => setFilterKategori("single")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              filterKategori === "single"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User size={13} />
            <span>Tunggal</span>
          </button>

          {/* Ganda / Double */}
          <button
            onClick={() => setFilterKategori("double")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              filterKategori === "double"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={13} />
            <span>Ganda</span>
          </button>
        </div>

        {/* Action Buttons (Export PDF & Excel) */}
        {(role === "admin" || role === "panitia") && filteredWinners.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Tombol PDF (Merah) */}
            {!readyPDF ? (
              <button 
                key="btn-siapkan"
                onClick={() => setReadyPDF(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-sm transition-all"
              >
                <FileText size={15} /> 
                <span>Export PDF</span>
              </button>
            ) : (
              <PDFDownloadLink
                key="btn-download"
                document={<JuaraPDF winnersData={filteredWinners} tournamentName={tName} />}
                fileName={`Juara_${tName}_${filterKategori}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all"
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

            {/* Tombol Excel (Hijau) */}
            <button
              onClick={() => exportJuaraToExcel(filteredWinners, tName, filterKategori)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-sm transition-all"
            >
              <FileSpreadsheet size={15} className="text-white" /> 
              <span>Export Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* ===== LIST KARTU PODIUM JUARA ===== */}
      {filteredWinners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <Trophy size={22} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Data Juara</h3>
          <p className="text-slate-400 text-xs mt-1">
            Belum ada bagan yang cocok untuk kategori {filterKategori === "all" ? "yang dipilih" : filterKategori}.
          </p>
        </div>
      ) : (
        filteredWinners
          .sort((a, b) => (a.kelompokUmurId || 0) - (b.kelompokUmurId || 0))
          .map((data) => {
            const winners = data.winners;
            const hasJuara = winners && (winners.juara1 || winners.juara2 || winners.juara3);

            return (
              <div 
                key={data.baganId} 
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden mb-6"
              >
                {/* Header Bagan Card */}
                <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-600 shadow-2xs">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                        {data.baganNama}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      data.kategori === 'double' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200/70' 
                        : 'bg-blue-50 text-blue-700 border-blue-200/70'
                    }`}>
                      {data.kategori === 'double' ? <Users size={11} /> : <User size={11} />}
                      {data.kategori === 'double' ? 'Ganda' : 'Tunggal'}
                    </span>
                  </div>
                </div>

                {/* Body: Podium 1 - 2 - 3 */}
                <div className="p-5 sm:p-7">
                  {!hasJuara ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
                      <Clock size={24} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        Pertandingan Sedang Berlangsung
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Data pemenang podium belum ditetapkan untuk bagan ini.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Grid Podium Juara */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        
                        {/* Juara 1 */}
                        <div className="bg-yellow-500 p-4 md:p-6 rounded-xl text-center text-white flex flex-col justify-center items-center min-h-[130px]">
                          <Trophy className="mx-auto mb-2 w-7 h-7 md:w-8 md:h-8 text-white" />
                          <h3 className="font-bold uppercase text-[8px] md:text-[10px] mb-1 text-white opacity-90 tracking-wider">
                            JUARA 1
                          </h3>
                          <p className="text-xs md:text-lg font-black break-words leading-snug uppercase text-white">
                            {renderWinnerName(winners.juara1)}
                          </p>
                        </div>
                        
                        {/* Juara 2 */}
                        <div className="bg-orange-50 p-4 md:p-6 rounded-xl text-center text-orange-800 border border-orange-200 flex flex-col justify-center items-center min-h-[130px]">
                          <Crown className="mx-auto mb-2 text-orange-400 md:w-8 md:h-8 w-7 h-7" />
                          <h3 className="font-bold uppercase text-[8px] md:text-[10px] mb-1 text-orange-800 opacity-70 tracking-wider">
                            JUARA 2
                          </h3>
                          <p className="text-xs md:text-lg font-black break-words leading-snug uppercase text-orange-950">
                            {renderWinnerName(winners.juara2)}
                          </p>
                        </div>

                        {/* Juara 3 */}
                        <div className="bg-gray-100 p-4 md:p-6 rounded-xl text-center text-gray-700 border border-gray-200 flex flex-col justify-center items-center min-h-[130px]">
                          <Award className="mx-auto mb-2 text-gray-400 md:w-8 md:h-8 w-7 h-7" />
                          <h3 className="font-bold uppercase text-[8px] md:text-[10px] mb-1 text-gray-700 opacity-70 tracking-wider">
                            JUARA 3
                          </h3>
                          <p className="text-xs md:text-lg font-black break-words leading-snug uppercase text-gray-800">
                            {Array.isArray(winners.juara3) 
                              ? winners.juara3.filter(Boolean).map(renderWinnerName).join(" & ") 
                              : renderWinnerName(winners.juara3)}
                          </p>
                        </div>

                      </div>

                      {/* Tabel Klasemen Akhir (Round Robin) */}
                      {winners.klasemen && winners.klasemen.length > 0 && (
                        <div className="mt-7 pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Medal size={16} className="text-amber-500" />
                            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                              Klasemen Akhir Babak
                            </h3>
                          </div>
                          
                          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                            <table className="min-w-full text-xs bg-white">
                              <thead className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                <tr>
                                  <th className="px-3.5 py-3 text-center w-12">#</th>
                                  <th className="px-4 py-3 text-left">Peserta / Tim</th>
                                  <th className="px-3.5 py-3 text-center font-black text-amber-700 bg-amber-50/50">PTS</th>
                                  <th className="px-3 py-3 text-center">Menang</th>
                                  <th className="px-3 py-3 text-center">Kalah</th>
                                  <th className="px-3.5 py-3 text-center font-bold">+/- Game</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {winners.klasemen.map((p, index) => (
                                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-3.5 py-3 text-center font-bold text-slate-400">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-800 uppercase">
                                      {renderWinnerName(p.peserta)}
                                    </td>
                                    <td className="px-3.5 py-3 text-center text-amber-700 font-black bg-amber-50/30">
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
                                ))}
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
          })
      )}

    </div>
  );
};

export default JuaraPage;