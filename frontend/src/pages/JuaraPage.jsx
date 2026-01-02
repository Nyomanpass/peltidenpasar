import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Award, Crown, CheckCircle } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import JuaraPDF from './JuaraPDF'; // Sesuaikan path-nya

const JuaraPage = () => {
  const [baganList, setBaganList] = useState([]);
  const [winnersData, setWinnersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const tName = localStorage.getItem("selectedTournamentName") || "TURNAMEN PELTI";
  const formattedFileName = `Daftar_Juara_${tName.replace(/\s+/g, '_')}.pdf`;

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      const selectedTournament = localStorage.getItem("selectedTournament");

      if (!selectedTournament) {
        setError("Silakan pilih turnamen terlebih dahulu di sidebar.");
        setIsLoading(false);
        return;
      }

      const baganResponse = await api.get("/bagan", {
        params: { tournamentId: selectedTournament }
      });

      setBaganList(baganResponse.data);

      const winnersPromises = baganResponse.data.map(async (bagan) => {
        try {
          const winnersResponse = await api.get(`/juara/${bagan.id}`);
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            winners: winnersResponse.data || {},
          };
        } catch (err) {
          console.error(`Gagal ambil juara bagan ${bagan.id}:`, err);
          return {
            baganId: bagan.id,
            baganNama: bagan.nama,
            winners: null,
          };
        }
      });

      const allWinners = await Promise.all(winnersPromises);
      setWinnersData(allWinners);

    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal memuat data juara.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const handleTournamentChange = () => {
      fetchAllData();
    };

    window.addEventListener("tournament-changed", handleTournamentChange);
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, []);

  // --- UI START ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );
  }


  return (
    <div className="font-sans bg-white min-h-screen">
      <div className="space-y-12 max-w-7xl mx-auto">

        {winnersData.length === 0 && (
          <div className="p-10 text-center bg-gray-50 rounded-xl shadow-inner border border-gray-200">
            <Award size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-lg text-gray-600">
              Hasil juara belum tersedia untuk turnamen ini.
            </p>
          </div>
        )}

        {winnersData.length > 0 && (
    <PDFDownloadLink
      document={
        <JuaraPDF 
          winnersData={winnersData} 
          tournamentName={tName}
        />
      }
      fileName={formattedFileName}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"
    >
      {({ loading }) => (
        <>
          <Trophy size={20} />
          {loading ? "Menyiapkan PDF..." : "Download PDF Juara"}
        </>
      )}
    </PDFDownloadLink>
  )}

        {winnersData.map((data) => {
          const winners = data.winners;

          return (
            <div
              key={data.baganId}
              className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100"
            >
              <h2 className="text-3xl font-extrabold mb-8 text-gray-800 border-b-2 border-yellow-500/50 pb-4 flex items-center gap-3">
                <Crown size={28} className="text-blue-600" /> {data.baganNama}
              </h2>

              {/* Jika belum ada juara */}
              {!winners || (!winners.juara1 && !winners.juara2 && !winners.juara3) ? (
                <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-200">
                  <CheckCircle size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-lg text-gray-600 italic">
                    Perhitungan juara belum selesai atau data juara belum tersedia.
                  </p>
                </div>
              ) : (
                <>
                  {/* JUARA 1, 2, 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Juara 1 */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-8 rounded-2xl text-center shadow-2xl text-white">
                      <Trophy size={40} className="mx-auto mb-3 text-white" />
                      <h3 className="text-xl font-extrabold mb-2 uppercase">🏆 Juara 1</h3>
                      <p className="text-2xl font-black">
                        {winners.juara1?.namaLengkap || "Belum Ditetapkan"}
                      </p>
                    </div>

                    {/* Juara 2 */}
                    <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-8 rounded-2xl text-center shadow-xl text-gray-800">
                      <Award size={40} className="mx-auto mb-3 text-gray-700" />
                      <h3 className="text-xl font-extrabold mb-2 uppercase">🥈 Juara 2</h3>
                      <p className="text-2xl font-black">
                        {winners.juara2?.namaLengkap || "Belum Ditetapkan"}
                      </p>
                    </div>

                    {/* Juara 3 */}
    
                    {Array.isArray(winners.juara3) ? (
                      // Shared (Knockout)
                      <div className="bg-gradient-to-br from-green-300 to-green-400 p-8 rounded-2xl text-center shadow-xl text-green-900">
                        <Crown size={40} className="mx-auto mb-3 text-white" />
                        <h3 className="text-xl font-extrabold mb-2 uppercase">🥉 Juara 3 (Shared)</h3>
                        <div className="space-y-2">
                          {/* FILTER NULL DITAMBAHKAN DI SINI */}
                          {winners.juara3
                            .filter(p => p != null) // Hapus elemen null/undefined
                            .map((p, i) => (
                              // Key yang aman
                              // Nama Lengkap yang aman (meskipun sudah difilter, ini adalah praktik baik)
                              <p key={p.id || i} className="text-2xl font-black">{p.namaLengkap || 'N/A'}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                    // ... (Sisa kode Juara 3 Single/Round Robin)
                                          // Single (Round Robin)
                      <div className="bg-gradient-to-br from-green-300 to-green-400 p-8 rounded-2xl text-center shadow-xl text-green-900">
                        <Crown size={40} className="mx-auto mb-3 text-white" />
                        <h3 className="text-xl font-extrabold mb-2 uppercase">🥉 Juara 3</h3>
                        <p className="text-2xl font-black">
                          {winners.juara3?.namaLengkap || "Belum Ditetapkan"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Klasemen */}
                  {/* PERBAIKAN KONDISI: Hanya cek ketersediaan klasemen (lebih robust) */}
                  {winners.klasemen && winners.klasemen.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-700 mb-4">Detail Klasemen Round Robin:</h3>
                      <div className="overflow-x-auto shadow-inner rounded-xl">
                        <table className="min-w-full text-sm bg-gray-50">
                          <thead className="bg-gray-200 text-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left">Peringkat</th>
                              <th className="px-4 py-3 text-left">Nama Peserta</th>
                              <th className="px-4 py-3 text-center">Poin</th>
                              <th className="px-4 py-3 text-center">Menang</th>
                              <th className="px-4 py-3 text-center">Kalah</th>
                            </tr>
                          </thead>
                          <tbody>
                            {winners.klasemen.map((p, index) => (
                              // PERBAIKAN KEY: Menggunakan p.peserta.id atau index sebagai fallback
                              // PERBAIKAN ERROR: Menggunakan p.peserta?.id (optional chaining)
                              <tr key={p.peserta?.id || index} className="border-b border-gray-100">
                                <td className="px-4 py-3 font-bold text-center">
                                  {index + 1}
                                </td>
                                {/* PERBAIKAN ERROR: Menggunakan p.peserta?.namaLengkap (optional chaining) */}
                                <td className="px-4 py-3">{p.peserta?.namaLengkap || '-'}</td>
                                {/* PERBAIKAN NAMA PROPERTI: Menggunakan p.poin (sesuai backend) */}
                                <td className="px-4 py-3 text-center text-blue-600 font-bold">{p.poin || '0'}</td>
                                {/* PERBAIKAN NAMA PROPERTI: Menggunakan p.menang (sesuai backend) */}
                                <td className="px-4 py-3 text-center">{p.menang || '0'}</td>
                                {/* PERBAIKAN NAMA PROPERTI: Menggunakan p.kalah (sesuai backend) */}
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
        })}
      </div>
    </div>
  );
};

export default JuaraPage;