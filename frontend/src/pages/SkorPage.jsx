import React, { useState } from "react";
import { Trophy, Medal, Calendar, Search, Filter, ChevronRight, Circle } from "lucide-react";

function SkorPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Data dummy untuk contoh tampilan
  const matchHistory = [
    {
      id: 1,
      kategori: "Single Putra - U12",
      player1: "Budi Santoso",
      player2: "Andi Wijaya",
      skor1: 21,
      skor2: 15,
      status: "Selesai",
      round: "Final",
      tgl: "03 Jan 2026",
    },
    {
      id: 2,
      kategori: "Double Campuran - Umum",
      player1: "Rian / Arbi",
      player2: "Fajar / Kevin",
      skor1: 19,
      skor2: 21,
      status: "Selesai",
      round: "Semi Final",
      tgl: "02 Jan 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Hasil Pertandingan
            </h1>
            <p className="text-gray-500 font-medium mt-1">Rekapitulasi skor dan pemenang turnamen</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama pemain..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- STATS SUMMARY --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-200 text-white">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Match</p>
          <h3 className="text-3xl font-black mt-1">124</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Match Hari Ini</p>
          <h3 className="text-3xl font-black mt-1 text-gray-800">12</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Turnamen Aktif</p>
          <h3 className="text-3xl font-black mt-1 text-gray-800">2</h3>
        </div>
      </div>

      {/* --- MATCH LIST --- */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Filter size={16} /> Riwayat Skor Terbaru
        </h2>

        {matchHistory.map((match) => (
          <div key={match.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase">
                    {match.kategori}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase">
                    <Calendar size={12} /> {match.tgl}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black px-3 py-1 bg-green-100 text-green-600 rounded-full uppercase tracking-tighter">
                    {match.round}
                   </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Player 1 */}
                <div className={`flex-1 text-center md:text-right ${match.skor1 > match.skor2 ? 'text-gray-900' : 'text-gray-400'}`}>
                  <h4 className="text-lg md:text-xl font-black tracking-tight">{match.player1}</h4>
                  {match.skor1 > match.skor2 && (
                    <span className="text-[10px] font-bold text-yellow-600 flex items-center justify-center md:justify-end gap-1">
                      <Medal size={12} /> WINNER
                    </span>
                  )}
                </div>

                {/* Skor Center */}
                <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                  <span className={`text-3xl font-black ${match.skor1 > match.skor2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {match.skor1}
                  </span>
                  <div className="h-8 w-[2px] bg-gray-200 rotate-12"></div>
                  <span className={`text-3xl font-black ${match.skor2 > match.skor1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {match.skor2}
                  </span>
                </div>

                {/* Player 2 */}
                <div className={`flex-1 text-center md:text-left ${match.skor2 > match.skor1 ? 'text-gray-900' : 'text-gray-400'}`}>
                  <h4 className="text-lg md:text-xl font-black tracking-tight">{match.player2}</h4>
                  {match.skor2 > match.skor1 && (
                    <span className="text-[10px] font-bold text-yellow-600 flex items-center justify-center md:justify-start gap-1">
                      <Medal size={12} /> WINNER
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer Card */}
            <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-50 flex justify-center md:justify-end">
                <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                    Lihat Detail Statistik <ChevronRight size={14} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkorPage;