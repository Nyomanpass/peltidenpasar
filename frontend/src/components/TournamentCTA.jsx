import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import api from "../api"; // Path ke file api.js di src/api.js

const TournamentCTA = () => {
  const [hasActiveTournament, setHasActiveTournament] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tautan pendaftaran utama
  const mainRegistrationLink = "/pendaftaran/turnamen-aktif";

  // Rumus pengecekan persis seperti di TournamentComming.jsx
  const isTournamentOpen = (t) => {
    if (!t.start_date) return false;
    const deadline = new Date(t.start_date);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(23, 59, 59, 999);
    return t.status === "aktif" && new Date() <= deadline;
  };

  useEffect(() => {
    const checkActiveTournaments = async () => {
      try {
        const res = await api.get("/tournaments");

        if (Array.isArray(res.data) && res.data.length > 0) {
          // Hanya anggap ADA jika minimal ada 1 turnamen yang benar-benar masanya belum lewat
          const activeTournaments = res.data.filter(isTournamentOpen);
          setHasActiveTournament(activeTournaments.length > 0);
        } else {
          setHasActiveTournament(false);
        }
      } catch (err) {
        console.error("Gagal mengecek turnamen aktif:", err);
        setHasActiveTournament(false);
      } finally {
        setLoading(false);
      }
    };

    checkActiveTournaments();
  }, []);

  // Jika masih memuat data atau TIDAK ADA turnamen yang terbuka, sembunyikan secara total
  if (loading || !hasActiveTournament) {
    return null;
  }

  return (
    <section id="emotional-cta" className="py-10 sm:py-20 bg-gray-50 text-black border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        {/* Ikon Aksen */}
        <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-3 sm:mb-4 animate-bounce-slow" />

        {/* Headline Persuasif */}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 leading-snug sm:leading-tight text-gray-900">
          Jangan Hanya Menjadi Penonton!
        </h2>

        {/* Sub-headline */}
        <p className="text-[12px] sm:text-sm md:text-base text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
          Momen Anda adalah Sekarang. Buktikan kemampuan Anda, raih poin ranking tertinggi, dan ukir sejarah sebagai juara tenis Denpasar berikutnya.
        </p>

        {/* Tombol CTA Utama */}
        <a
          href={mainRegistrationLink}
          className="inline-flex flex-wrap justify-center items-center bg-yellow-500 text-black font-extrabold 
                     py-3 sm:py-4 px-6 sm:px-10 rounded-full text-xs sm:text-base uppercase tracking-wider 
                     hover:bg-yellow-600 transition duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto"
        >
          Daftar Turnamen Aktif Sekarang
        </a>

        {/* Catatan Kaki */}
        <p className="mt-4 sm:mt-6 text-xs sm:text-sm italic text-gray-400">
          Batas waktu pendaftaran semakin dekat. Amankan tempat Anda sebelum kuota penuh!
        </p>
      </div>
    </section>
  );
};

export default TournamentCTA;