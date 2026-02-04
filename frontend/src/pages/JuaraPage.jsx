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
      console.log("Turnamen berubah, memuat ulang data juara...");
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

  if (isLoading) return <div className="flex justify-center items-center h-screen font-bold text-gray-500">Memuat Data Juara...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen">
      

        {/* --- HEA{/* --- HEADER UTAMA --- */}
      <div className="mb-8 border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Hasil Pertandingan
            </h1>
            <p className="text-md text-yellow-600 font-semibold mt-1">
              Tournament: {localStorage.getItem("selectedTournamentName") || "Belum Memilih"}
            </p>
          </div>
        </div>
      </div>
        
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  
  {/* FILTER KATEGORI */}
  <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-2xl w-fit">
    <button
      onClick={() => setFilterKategori("all")}
      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
        filterKategori === "all"
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Semua
    </button>

    <button
      onClick={() => setFilterKategori("single")}
      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
        filterKategori === "single"
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Single
    </button>

    <button
      onClick={() => setFilterKategori("double")}
      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
        filterKategori === "double"
          ? "bg-purple-600 text-white shadow-md"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Double
    </button>
  </div>

  {/* TOMBOL PDF */}
  
{role === "admin" && filteredWinners.length > 0 && (
  <div className="flex items-center">
    {!readyPDF ? (
      <button 
        key="btn-siapkan"
        onClick={() => setReadyPDF(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
      >
        <FileText size={20} /> 
        Siapkan PDF {filterKategori !== 'all' ? filterKategori : ''}
      </button>
    ) : (
      <PDFDownloadLink
        key="btn-download"
        document={<JuaraPDF winnersData={filteredWinners} tournamentName={tName} />}
        fileName={`Juara_${tName}_${filterKategori}.pdf`}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
        onClick={() => {
          setTimeout(() => {
            setReadyPDF(false);
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
         filteredWinners
            .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId)
            .map((data) => {
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
                                <th className="px-4 py-3">GM</th>
                                <th className="px-4 py-3">GK</th>
                                <th className="px-4 py-3">Selisih</th>

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
                                  <td className="px-4 py-3 text-center">{p.gameMenang}</td>
                                    <td className="px-4 py-3 text-center">{p.gameKalah}</td>
                                    <td className="px-4 py-3 text-center font-bold">
                                      {p.selisih}
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
            );
          })
        )}

    </div>
  );
};

export default JuaraPage;