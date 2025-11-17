import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function TournamentUser() {
  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get("/tournaments");
      setTournaments(res.data);
    } catch (err) {
      console.error("Gagal ambil turnamen:", err);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6e3] to-[#f4e1c1] py-20 px-4 md:px-20">
      
      {/* Header */}
      <div className="mb-16 text-center">
        <p className="text-[#D4A949] font-bold text-lg uppercase tracking-widest mb-2">
          TURNAMEN KAMI
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary">
          Daftar Turnamen Terbaru
        </h1>
      </div>

      {/* Grid Turnamen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.length > 0 ? (
          tournaments.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-transform duration-300"
              onClick={() => navigate(`/tournaments/${t.id}`)}
            >
              {/* Poster */}
              <div className="h-64 w-full overflow-hidden relative">
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
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-3 text-white font-bold">
                  {t.name}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="text-gray-600 mb-1">
                  {t.start_date && t.end_date
                    ? `${new Date(t.start_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} - ${new Date(t.end_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                    : "-"}
                </p>
                <p className="text-gray-600 mb-3 font-medium">{t.location || "-"}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    t.status === "aktif"
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                      : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 italic">
            Belum ada turnamen saat ini
          </p>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default TournamentUser;
