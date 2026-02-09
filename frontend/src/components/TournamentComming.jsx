import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Zap, AlertCircle } from "lucide-react";
import api from "../api";

const TournamentComming = () => {
  const [tournaments, setTournaments] = useState([]);
  const BASE_URL = "http://localhost:5004";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isTournamentOpen = (t) => {
    const deadline = new Date(t.start_date);
    deadline.setDate(deadline.getDate() - 3);
    deadline.setHours(23, 59, 59, 999);
    return t.status === "aktif" && new Date() <= deadline;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/tournaments");
        setTournaments(res.data.filter(isTournamentOpen));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const gridClass =
    tournaments.length <= 1
      ? "grid grid-cols-1 max-w-2xl mx-auto"
      : "grid grid-cols-1 lg:grid-cols-2";

  return (
    <section className="py-10 sm:py-16 bg-gray-50">
      <div className="mx-auto px-4 sm:px-10 lg:px-20">
        
        {/* HEADER - Menggunakan text-balance agar baris teks lebih rapi */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-balance">
            Turnamen Mendatang
          </h2>
          <p className="text-sm sm:text-base text-gray-500 italic mt-2 max-w-2xl mx-auto">
            Siapkan fisik dan mental, raih prestasi tertinggi di arena pertandingan.
          </p>
          <div className="w-12 h-1 bg-yellow-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* GRID */}
        <div className={`${gridClass} gap-6 sm:gap-8`}>
          {tournaments.map((t) => {
            const deadline = new Date(t.start_date);
            deadline.setDate(deadline.getDate() - 3);
            deadline.setHours(23, 59, 59, 999);
            const isClosed = new Date() > deadline;

            return (
              <div
                key={t.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* IMAGE SECTION */}
                <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-2xl">
                  <img
                    src={t.poster ? `${BASE_URL}/${t.poster}` : "/default-tournament.jpg"}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  <span
                    className={`absolute top-4 left-4 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md ${
                      isClosed ? "bg-red-500/90 text-white" : "bg-yellow-400 text-gray-900"
                    }`}
                  >
                    {isClosed ? "Pendaftaran Ditutup" : "Pendaftaran Dibuka"}
                  </span>
                </div>

                {/* CONTENT SECTION */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                      {t.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    {/* INFO GRID - Menggunakan grid-cols-2 sejak mobile jika memungkinkan */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                      <InfoItem
                        icon={<Calendar size={16} className="text-blue-600" />}
                        label="Tanggal"
                        value={`${formatDate(t.start_date)} - ${formatDate(t.end_date)}`}
                      />
                      <InfoItem
                        icon={<MapPin size={16} className="text-red-500" />}
                        label="Lokasi"
                        value={t.location}
                      />
                      <InfoItem
                        icon={<Zap size={16} className="text-emerald-600" />}
                        label="Biaya"
                        value={
                          t.type === "berbayar"
                            ? `Rp ${Number(t.nominal).toLocaleString("id-ID")}`
                            : "GRATIS"
                        }
                      />
                      <InfoItem
                        icon={<AlertCircle size={16} className="text-orange-500" />}
                        label="Batas Daftar"
                        value={formatDate(deadline)}
                        isDeadline
                      />
                    </div>

                    {t.type === "berbayar" && t.bank_info && (
                      <div className="mt-5 p-3 bg-blue-50/50 rounded-xl text-[11px] sm:text-xs border border-blue-100 text-blue-800">
                        <span className="font-semibold">Info Pembayaran:</span> {t.bank_info}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="mt-6 pt-5 border-t border-gray-50">
                    {isClosed ? (
                      <button disabled className="w-full sm:w-auto bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed">
                        PENDAFTARAN BERAKHIR
                      </button>
                    ) : (
                      <a
                        href={`/daftar-peserta?tournament=${encodeURIComponent(t.name)}`}
                        className="inline-flex items-center justify-center w-full sm:w-auto bg-yellow-500 text-white px-6 py-2.5 rounded-xl hover:bg-yellow-700 transition-all duration-200 text-xs sm:text-sm font-bold shadow-lg shadow-blue-200"
                      >
                        Daftar Sekarang
                        <span className="ml-2">→</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Komponen InfoItem yang sudah dioptimasi tulisannya
const InfoItem = ({ icon, label, value, isDeadline }) => (
  <div className="flex items-start gap-3 min-w-0">
    <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
        {label}
      </p>
      <p
        className={`text-xs sm:text-[15px] font-semibold truncate leading-tight ${
          isDeadline ? "text-red-600" : "text-gray-800"
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  </div>
);

export default TournamentComming;