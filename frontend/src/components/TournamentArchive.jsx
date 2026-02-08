import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ScrollText, ChevronRight } from 'lucide-react';
import api from "../api";

function TournamentArchive() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/tournaments");
            const sortedData = res.data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            setTournaments(sortedData);
            setError(null);
        } catch (err) {
            console.error("Gagal ambil turnamen:", err);
            setError("Gagal memuat data turnamen dari server.");
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = (start, end) => {
        if (!start || !end) return "-";
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate) || isNaN(endDate)) return "Tanggal tidak valid";

        const startOptions = { day: "2-digit", month: "short" };
        const endOptions = { day: "2-digit", month: "short", year: "numeric" };

        return `${startDate.toLocaleDateString("id-ID", startOptions)} - ${endDate.toLocaleDateString("id-ID", endOptions)}`;
    };

    const handleViewDetail = (tournament) => {
        localStorage.setItem("selectedTournament", tournament.id);
        localStorage.setItem("selectedTournamentName", tournament.name);
        navigate("/tournament-detail"); 
        window.dispatchEvent(new Event("tournament-changed"));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg sm:text-xl font-semibold text-secondary">Memuat data turnamen...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 px-4 text-center">
                <p className="text-lg sm:text-xl font-semibold">ERROR: {error}</p>
            </div>
        );
    }

  return (
  <div className="min-h-screen bg-gray-50 py-16 sm:py-20 px-4 sm:px-6 md:px-10 lg:px-20">

    {/* HEADER */}
    <div className="mb-12 sm:mb-16 text-center">
      <p className="text-primary font-bold text-base sm:text-lg uppercase tracking-widest mb-2">
        Rekam Jejak & Jadwal
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
        Semua Turnamen Pelti Denpasar
      </h1>
      <div className="w-20 sm:w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
    </div>

    {/* GRID TURNAMEN */}
    {tournaments.length === 0 ? (
      <p className="text-center text-gray-500 italic py-10">
        Belum ada data turnamen yang ditemukan.
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl shadow-xl overflow-hidden
                       hover:shadow-2xl transform hover:-translate-y-1
                       transition duration-300 flex flex-col"
          >
            {/* POSTER */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              {t.poster ? (
                <img
                  src={`http://localhost:5004/${t.poster}`}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  Tidak ada poster
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2">
                {t.name}
              </h3>

              <div className="space-y-3 text-gray-700 text-sm">
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="font-semibold">
                    {formatDateRange(t.start_date, t.end_date)}
                  </span>
                </p>

                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-600" />
                  <span className="font-semibold">
                    {t.location || "Lokasi Belum Ditentukan"}
                  </span>
                </p>

                <p className="flex items-start pt-3 border-t text-gray-500 italic line-clamp-3">
                  <ScrollText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {t.description || "Tidak ada deskripsi singkat."}
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 pt-0">
              <button
                onClick={() => handleViewDetail(t)}
                className="w-full flex items-center justify-center
                           bg-primary text-secondary font-bold
                           py-3 rounded-xl text-sm
                           hover:bg-yellow-500 transition shadow-md"
              >
                Info Detail
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


}

export default TournamentArchive;
