import React, { useEffect, useState } from "react";
import api from "../api";

function TournamentSection() {
  const [tournaments, setTournaments] = useState([]);

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
    <section
      id="tournaments"
      className="py-24 relative overflow-hidden"
    >
      {/* Dekorasi background */}
     

      <div className="relative container mx-auto px-4 md:px-20">
        {/* Header */}
         <div className="mb-20 relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Judul di kiri */}
            <div className="lg:w-1/2">
                <p className="text-[#D4A949] font-bold text-lg uppercase tracking-widest mb-2">
                TURNAMEN KAMI
                </p>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-secondary">
                Daftar Turnamen
                </h2>
                 <p className="mt-6">
                Berikut daftar turnamen tenis terbaru yang diadakan oleh PELTI Denpasar. 
                Lihat informasi lengkap mengenai tanggal, lokasi, dan detail setiap turnamen.
                </p>
            </div>

            {/* Deskripsi di kanan */}
          
           
        </div>


        {/* Grid Kartu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
  {tournaments.length > 0 ? (
    tournaments.map((t) => (
      <div
        key={t.id}
        className="flex flex-col h-full rounded-3xl overflow-hidden shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl bg-white"
      >
        {/* Poster */}
        <div className="relative h-72 w-full">
          {t.poster ? (
            <img
              src={`http://localhost:5004/${t.poster}`}
              alt={t.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
              Tidak ada poster
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {/* Info di overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-lg font-bold">{t.name}</h3>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                t.status === "aktif" ? "bg-green-600/80" : "bg-red-600/80"
              }`}
            >
              {t.status}
            </span>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="flex-1 p-4 bg-white/30 backdrop-blur-md text-gray-800">
          <p className="text-sm mb-1">
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
          <p className="text-sm font-medium mb-2">{t.location || "-"}</p>
          <p className="text-gray-700 text-sm line-clamp-3">{t.description || "-"}</p>
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
    </section>
  );
}

export default TournamentSection;
