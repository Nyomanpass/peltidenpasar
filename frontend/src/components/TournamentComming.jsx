import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Zap, Info, AlertCircle, Loader2 } from "lucide-react";
import api from "../api";

const TournamentComming = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:5004";

  // Format tanggal ke Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ CEK APAKAH TURNAMEN MASIH DIBUKA
  const isTournamentOpen = (t) => {
    const deadline = new Date(t.start_date);
    deadline.setDate(deadline.getDate() - 3); // H-3
    deadline.setHours(23, 59, 59, 999); // ✅ akhir hari

    return t.status === "aktif" && new Date() <= deadline;
  };

  useEffect(() => {
    const fetchOpenTournaments = async () => {
      try {
        const res = await api.get("/tournaments");

        // ambil hanya turnamen yang masih dibuka
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
      <div className="py-20 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="font-medium">Mencari Turnamen...</p>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        Tidak ada turnamen yang sedang dibuka.
      </div>
    );
  }

  return (
    <section id="tournament-highlight" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* JUDUL */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-2 text-gray-900">
            Turnamen Mendatang
          </h2>
          <p className="text-lg text-gray-600 italic">
            "Siapkan fisik dan mental, raih prestasi tertinggi."
          </p>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
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
              className="bg-white rounded-[2.5rem] shadow-2xl mb-10 overflow-hidden flex flex-col lg:flex-row border border-gray-100"
            >
              {/* POSTER */}
              <div className="relative lg:w-2/5 min-h-[400px]">
                <img
                  src={
                    t.poster
                      ? `${BASE_URL}/${t.poster}`
                      : "/default-tournament.jpg"
                  }
                  alt={t.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-6 left-6">
                  <span
                    className={`font-black px-5 py-2 rounded-xl text-xs ${
                      isClosed
                        ? "bg-red-500 text-white"
                        : "bg-yellow-400 text-gray-900"
                    }`}
                  >
                    {isClosed
                      ? "PENDAFTARAN DITUTUP"
                      : "PENDAFTARAN DIBUKA"}
                  </span>
                </div>
              </div>

              {/* DETAIL */}
              <div className="lg:w-3/5 p-8">
                <h3 className="text-3xl font-black text-gray-900 mb-3">
                  {t.name}
                </h3>

                <p className="text-gray-600 mb-6">{t.description}</p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <InfoItem
                    icon={<Calendar className="text-blue-600" />}
                    label="Tanggal"
                    value={`${formatDate(t.start_date)} - ${formatDate(
                      t.end_date
                    )}`}
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
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <Info className="text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Pembayaran: <b>{t.bank_info}</b>
                    </p>
                  </div>
                )}

                {/* BUTTON */}
                {isClosed ? (
                  <div className="bg-gray-300 text-gray-600 px-6 py-3 rounded-xl inline-block">
                    Pendaftaran Berakhir
                  </div>
                ) : (
                 <a
                    href={`/daftar-peserta?tournament=${encodeURIComponent(t.name)}`}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl inline-block hover:bg-blue-700"
                    >
                    Daftar Sekarang →
                </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// SUB KOMPONEN
const InfoItem = ({ icon, label, value, isDeadline }) => (
  <div className="flex items-start">
    <div className="p-3 bg-gray-50 rounded-xl mr-4">{icon}</div>
    <div>
      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
        {label}
      </span>
      <span
        className={`font-bold ${
          isDeadline ? "text-red-600" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  </div>
);

export default TournamentComming;
