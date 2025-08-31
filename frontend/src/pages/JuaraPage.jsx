import React, { useState, useEffect } from 'react';
import api from '../api';

const JuaraPage = () => {
  const [baganList, setBaganList] = useState([]);
  const [winnersData, setWinnersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const baganResponse = await api.get('/bagan');
        setBaganList(baganResponse.data);

        const winnersPromises = baganResponse.data.map(async (bagan) => {
          try {
            const winnersResponse = await api.get(`/juara/${bagan.id}`);
            const winners = winnersResponse.data || {};
            return {
              baganId: bagan.id,
              baganNama: bagan.nama,
              winners: winners,
            };
          } catch (err) {
            console.error(`Gagal mengambil data juara untuk bagan ${bagan.id}:`, err);
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
        setError("Gagal memuat data juara. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-900">
        Daftar Juara per Kelompok Umur
      </h1>

      <div className="space-y-12">
        {winnersData.map((data) => {
          const winners = data.winners;

          return (
            <div
              key={data.baganId}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
            >
              <h2 className="text-3xl font-bold mb-6 text-blue-800 border-b pb-4">
                {data.baganNama}
              </h2>

              {!winners ? (
                <p className="text-gray-500 italic">
                  Data juara belum tersedia untuk bagan ini.
                </p>
              ) : (
                <>
                  {/* Knockout: juara3 array */}
                  {Array.isArray(winners.juara3) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-yellow-50 p-6 rounded-lg text-center shadow-sm">
                        <h3 className="text-xl font-bold text-yellow-700 mb-2">🏆 Juara 1</h3>
                        <p className="text-2xl font-semibold text-gray-800">
                          {winners.juara1?.namaLengkap}
                        </p>
                      </div>

                      <div className="bg-gray-100 p-6 rounded-lg text-center shadow-sm">
                        <h3 className="text-xl font-bold text-gray-600 mb-2">🥈 Juara 2</h3>
                        <p className="text-2xl font-semibold text-gray-800">
                          {winners.juara2?.namaLengkap}
                        </p>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg text-center shadow-sm">
                        <h3 className="text-xl font-bold text-green-700 mb-2">🥉 Juara 3</h3>
                        <div className="space-y-2">
                          {winners.juara3
                            ?.filter((p) => p)
                            .map((peserta, index) => (
                              <p key={index} className="text-xl font-semibold text-gray-800">
                                {peserta.namaLengkap}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Round Robin: juara3 object + klasemen
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="bg-yellow-50 p-6 rounded-lg text-center shadow-sm">
                          <h3 className="text-xl font-bold text-yellow-700 mb-2">🏆 Juara 1</h3>
                          <p className="text-2xl font-semibold text-gray-800">
                            {winners.juara1?.namaLengkap}
                          </p>
                        </div>

                        <div className="bg-gray-100 p-6 rounded-lg text-center shadow-sm">
                          <h3 className="text-xl font-bold text-gray-600 mb-2">🥈 Juara 2</h3>
                          <p className="text-2xl font-semibold text-gray-800">
                            {winners.juara2?.namaLengkap}
                          </p>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg text-center shadow-sm">
                          <h3 className="text-xl font-bold text-green-700 mb-2">🥉 Juara 3</h3>
                          <p className="text-2xl font-semibold text-gray-800">
                            {winners.juara3?.namaLengkap}
                          </p>
                        </div>
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
