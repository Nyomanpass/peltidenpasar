import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Award, Crown, CheckCircle, Layout, FileText } from "lucide-react"; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import JuaraPDF from './JuaraPDF'; 

const JuaraPage = () => {
  const [winnersData, setWinnersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterKategori, setFilterKategori] = useState("all");
  // State untuk mencegah PDF crash (Eo is not a function)
  const [readyPDF, setReadyPDF] = useState(false);

  const tName = localStorage.getItem("selectedTournamentName") || "TURNAMEN PELTI";

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const selectedTournament = localStorage.getItem("selectedTournament");

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
            winners: winnersResponse.data || {}, // Di sini data klasemen disimpan
          };
        } catch (err) {
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            kategori: bagan.kategori ? bagan.kategori.toLowerCase().trim() : "single",
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
    fetchAllData();
  }, []);

  // Reset tombol PDF setiap kali filter berubah agar tidak crash
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

  if (isLoading) return <div className="flex justify-center items-center h-screen font-bold text-gray-500">Memuat Data Juara...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">{error}</div>;

  return (
    <div className="font-sans bg-white min-h-screen">
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">

        {/* --- HEADER: FILTER & PDF --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
            {["all", "single", "double"].map((kat) => (
              <button
                key={kat}
                onClick={() => setFilterKategori(kat)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  filterKategori === kat 
                    ? "bg-gray-800 text-white shadow-md" 
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {kat === "all" ? "Semua" : kat}
              </button>
            ))}
          </div>

            {/* --- CARI BAGIAN INI DAN GANTI --- */}
          {filteredWinners.length > 0 && (
            <div className="flex items-center">
              {!readyPDF ? (
                /* TOMBOL PERTAMA: SIAPKAN */
                <button 
                  key="btn-siapkan"
                  onClick={() => setReadyPDF(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                  <FileText size={20} /> Siapkan PDF {filterKategori !== 'all' ? filterKategori : ''}
                </button>
              ) : (
                /* TOMBOL KEDUA: DOWNLOAD (MUNCUL SETELAH DIKLIK SIAPKAN) */
                <PDFDownloadLink
                  key="btn-download"
                  document={<JuaraPDF winnersData={filteredWinners} tournamentName={tName} />}
                  fileName={`Juara_${tName}_${filterKategori}.pdf`}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
                  // INI BAGIAN UNTUK REFRESH BALIK KE TOMBOL MERAH
                  onClick={() => {
                    setTimeout(() => {
                      setReadyPDF(false); // Balik ke "Siapkan PDF" setelah 3 detik
                    }, 3000);
                  }}
                >
                  {({ loading }) => (
                    <>
                      <Trophy size={20} />
                      {loading ? "Menyusun..." : "Download Sekarang (Klik)"}
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          )}
        </div>

        {/* --- LIST DATA JUARA --- */}
        {filteredWinners.length === 0 ? (
          <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-lg text-gray-600">Tidak ada data juara untuk kategori {filterKategori}.</p>
          </div>
        ) : (
          filteredWinners.map((data) => {
            const winners = data.winners;
            return (
              <div key={data.baganId} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-10">
                <div className="flex items-center justify-between border-b-2 border-yellow-500/50 pb-4 mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                    <Crown size={28} className="text-blue-600" /> {data.baganNama}
                  </h2>
                  <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 border">
                    {data.kategori}
                  </span>
                </div>

                {!winners || (!winners.juara1 && !winners.juara2) ? (
                  <div className="p-6 text-center bg-gray-50 rounded-xl">
                    <p className="text-gray-500 italic">Perhitungan juara belum tersedia.</p>
                  </div>
                ) : (
                  <>
                    {/* KARTU JUARA 1, 2, 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-8 rounded-2xl text-center text-white shadow-lg">
                        <Trophy size={40} className="mx-auto mb-3" />
                        <h3 className="font-bold uppercase text-sm mb-1">Juara 1</h3>
                        <p className="text-xl font-black">{renderWinnerName(winners.juara1)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-8 rounded-2xl text-center text-gray-800 shadow-md">
                        <Award size={40} className="mx-auto mb-3" />
                        <h3 className="font-bold uppercase text-sm mb-1">Juara 2</h3>
                        <p className="text-xl font-black">{renderWinnerName(winners.juara2)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-300 to-orange-400 p-8 rounded-2xl text-center text-orange-900 shadow-md">
                        <Crown size={40} className="mx-auto mb-3" />
                        <h3 className="font-bold uppercase text-sm mb-1">Juara 3</h3>
                        <p className="text-xl font-black">
                          {Array.isArray(winners.juara3) 
                            ? winners.juara3.filter(x => x).map(renderWinnerName).join(" & ") 
                            : renderWinnerName(winners.juara3)}
                        </p>
                      </div>
                    </div>

                    {/* --- KLASEMEN ROUND ROBIN --- */}
                    {winners.klasemen && winners.klasemen.length > 0 && (
                      <div className="mt-10">
                        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <Layout size={20} className="text-blue-500" /> Detail Klasemen Akhir:
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="min-w-full text-sm bg-gray-50">
                            <thead className="bg-gray-100 text-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold border-b">Peringkat</th>
                                <th className="px-4 py-3 text-left font-bold border-b">Nama Peserta / Tim</th>
                                <th className="px-4 py-3 text-center font-bold border-b">Poin</th>
                                <th className="px-4 py-3 text-center font-bold border-b">M</th>
                                <th className="px-4 py-3 text-center font-bold border-b">K</th>
                              </tr>
                            </thead>
                            <tbody>
                              {winners.klasemen.map((p, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-white transition">
                                  <td className="px-4 py-3 font-bold text-center">{index + 1}</td>
                                  <td className="px-4 py-3 font-semibold">{renderWinnerName(p.peserta)}</td>
                                  <td className="px-4 py-3 text-center text-blue-600 font-bold">{p.poin || '0'}</td>
                                  <td className="px-4 py-3 text-center">{p.menang || '0'}</td>
                                  <td className="px-4 py-3 text-center">{p.kalah || '0'}</td>
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default JuaraPage;