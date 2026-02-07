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

            {/* Header */}
            <div className="mb-12 sm:mb-16 text-center">
                <p className="text-primary font-bold text-base sm:text-lg uppercase tracking-widest mb-2">
                    REKAM JEJAK & JADWAL
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
                    Semua Turnamen Pelti Denpasar
                </h1>
                <div className="w-20 sm:w-24 h-1 bg-primary mx-auto mt-3 sm:mt-4 rounded"></div>
            </div>

            {/* Grid Turnamen */}
            {tournaments.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 italic py-10 text-sm sm:text-base">
                    Belum ada data turnamen yang ditemukan.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                    {tournaments.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden 
                                       hover:shadow-2xl hover:border-b-4 hover:border-primary 
                                       transform hover:-translate-y-1 transition-transform duration-300 flex flex-col"
                        >
                            {/* Poster */}
                            <div className="relative w-full min-h-[180px] sm:min-h-[220px] lg:min-h-[250px] overflow-hidden">
                                {t.poster ? (
                                    <img
                                        src={`http://localhost:5004/${t.poster}`}
                                        alt={t.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                        Tidak ada poster
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 sm:p-5 flex-grow">
                                <h3 className="text-lg sm:text-xl font-extrabold text-secondary mb-2 sm:mb-3">{t.name}</h3>
                                <div className="space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                                    <p className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                                        <span className="font-medium">{formatDateRange(t.start_date, t.end_date)}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                                        <span className="font-medium">{t.location || "Lokasi Belum Ditentukan"}</span>
                                    </p>
                                    <p className="flex items-center italic text-gray-500 line-clamp-3 pt-1 sm:pt-2 border-t mt-2">
                                        <ScrollText className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                        {t.description || "Tidak ada deskripsi singkat."}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Tombol Detail */}
                            <div className="p-3 sm:p-5 pt-0">
                                <button
                                    onClick={() => handleViewDetail(t)}
                                    className="w-full inline-flex items-center justify-center bg-primary text-secondary font-bold py-2 sm:py-2.5 rounded-full hover:bg-yellow-500 transition duration-300 text-sm sm:text-base shadow"
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
