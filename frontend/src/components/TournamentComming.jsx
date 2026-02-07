import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Zap, Info, AlertCircle, Loader2 } from "lucide-react";
import api from "../api";

const TournamentComming = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:5004";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
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
    const fetchOpenTournaments = async () => {
      try {
        const res = await api.get("/tournaments");
        const openTournaments = res.data.filter(isTournamentOpen);
        setTournaments(openTournaments);
      } catch (err) {
        console.error("Gagal mengambil data turnamen:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenTournaments();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-2" size={36} />
        <p className="font-medium text-sm sm:text-base">Mencari Turnamen...</p>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="py- text-center text-gray-500 text-sm sm:text-base">
        Tidak ada turnamen yang sedang dibuka.
      </div>
    );
  }

  return (
    <section id="tournament-highlight" className="py-10 sm:py-14 bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* JUDUL */}
        <div className="text-center mb-8 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">
            Turnamen Mendatang
          </h2>
          <p className="text-sm sm:text-base text-gray-600 italic">
            "Siapkan fisik dan mental, raih prestasi tertinggi."
          </p>
          <div className="w-16 sm:w-20 h-1.5 bg-blue-600 mx-auto mt-3 sm:mt-4 rounded-full"></div>
        </div>

        {/* LOOP TURNAMEN */}
        {tournaments.map((t) => {
          const deadline = new Date(t.start_date);
          deadline.setDate(deadline.getDate() - 3);
          deadline.setHours(23, 59, 59, 999);
          const isClosed = new Date() > deadline;

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-xl mb-6 sm:mb-8 overflow-hidden flex flex-col lg:flex-row border border-gray-100"
            >
              {/* POSTER */}
              <div className="relative w-full lg:w-2/5 min-h-[180px] sm:min-h-[220px] lg:min-h-[400px]">
                <img
                  src={t.poster ? `${BASE_URL}/${t.poster}` : "/default-tournament.jpg"}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span
                    className={`font-black px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm ${
                      isClosed ? "bg-red-500 text-white" : "bg-yellow-400 text-gray-900"
                    }`}
                  >
                    {isClosed ? "PENDAFTARAN DITUTUP" : "PENDAFTARAN DIBUKA"}
                  </span>
                </div>
              </div>

              {/* DETAIL */}
              <div className="w-full lg:w-3/5 p-3 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-2 sm:mb-3">
                    {t.name}
                  </h3>

                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                    {t.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <InfoItem
                      icon={<Calendar className="text-blue-600" />}
                      label="Tanggal"
                      value={`${formatDate(t.start_date)} - ${formatDate(t.end_date)}`}
                    />

                    <InfoItem
                      icon={<MapPin className="text-red-600" />}
                      label="Lokasi"
                      value={t.location}
                    />

                    <InfoItem
                      icon={<Zap className="text-emerald-600" />}
                      label="Biaya"
                      value={
                        t.type === "berbayar"
                          ? `Rp ${Number(t.nominal).toLocaleString("id-ID")}`
                          : "GRATIS"
                      }
                    />

                    <InfoItem
                      icon={<AlertCircle className="text-orange-600" />}
                      label="Batas Daftar (H-3)"
                      value={formatDate(deadline)}
                      isDeadline
                    />
                  </div>

                  {/* BANK */}
                  {t.type === "berbayar" && t.bank_info && (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2 sm:gap-3 text-sm sm:text-base">
                      <Info className="text-blue-600" />
                      <p className="text-blue-800">
                        Pembayaran: <b>{t.bank_info}</b>
                      </p>
                    </div>
                  )}
                </div>

                {/* BUTTON */}
                <div className="mt-2 sm:mt-3">
                  {isClosed ? (
                    <div className="bg-gray-300 text-gray-600 px-3 py-2 sm:px-5 sm:py-2 rounded-xl inline-block text-sm sm:text-base">
                      Pendaftaran Berakhir
                    </div>
                  ) : (
                    <a
                      href={`/daftar-peserta?tournament=${encodeURIComponent(t.name)}`}
                      className="bg-blue-600 text-white px-3 py-2 sm:px-5 sm:py-2 rounded-xl inline-block hover:bg-blue-700 text-sm sm:text-base"
                    >
                      Daftar Sekarang →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const InfoItem = ({ icon, label, value, isDeadline }) => (
  <div className="flex items-start gap-2 sm:gap-3">
    <div className="p-1.5 sm:p-2.5 bg-gray-50 rounded-xl flex-shrink-0">{icon}</div>
    <div>
      <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase block mb-1">
        {label}
      </span>
      <span className={`font-bold text-sm sm:text-base ${isDeadline ? "text-red-600" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  </div>
);

export default TournamentComming;
