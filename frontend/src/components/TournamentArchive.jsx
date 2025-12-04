import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ScrollText, ChevronRight } from 'lucide-react'; // Menghilangkan Tag
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
            // Mengurutkan turnamen berdasarkan tanggal mulai terbaru
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

    // Fungsi helper untuk format tanggal
    const formatDateRange = (start, end) => {
        if (!start || !end) return "-";
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (isNaN(startDate) || isNaN(endDate)) return "Tanggal tidak valid";

        const startOptions = { day: "2-digit", month: "short" };
        const endOptions = { day: "2-digit", month: "short", year: "numeric" };

        const startStr = startDate.toLocaleDateString("id-ID", startOptions);
        const endStr = endDate.toLocaleDateString("id-ID", endOptions);

        return `${startStr} - ${endStr}`;
    };

    const handleViewDetail = (tournament) => {
        
        localStorage.setItem("selectedTournament", tournament.id);
        localStorage.setItem("selectedTournamentName", tournament.name);
        
       
        navigate("/tournament-detail"); 

    
        window.dispatchEvent(new Event("tournament-changed"));
    };

    // --- TAMPILAN BERDASARKAN STATUS LOADING/ERROR ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl font-semibold text-secondary">Memuat data turnamen...</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700">
                <p className="text-xl font-semibold">ERROR: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4 md:px-10 lg:px-20">
            
            {/* Header */}
            <div className="mb-16 text-center">
                <p className="text-primary font-bold text-lg uppercase tracking-widest mb-2">
                    REKAM JEJAK & JADWAL
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-secondary">
                    Semua Turnamen PelTI Denpasar
                </h1>
                <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded"></div>
            </div>

            {/* Grid Turnamen (Grid 3 Kolom) */}
            {tournaments.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 italic py-10">
                    Belum ada data turnamen yang ditemukan.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tournaments.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden 
                                        hover:shadow-2xl hover:border-b-4 hover:border-primary 
                                        transform hover:-translate-y-1 transition-transform duration-300 flex flex-col" // Menambahkan flex-col untuk layout footer
                        >
                            {/* Poster */}
                            <div className="h-full w-full overflow-hidden relative">
                                {t.poster ? (
                                    <img
                                        src={`http://localhost:5004/${t.poster}`}
                                        alt={t.name}
                                        className="w-full h-full object-cover"
                                        // Menghapus Tag Status di sini
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        Tidak ada poster
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-5 flex-grow">
                                <h3 className="text-xl font-extrabold text-secondary mb-3">{t.name}</h3>

                                <div className="space-y-2 text-gray-700">
                                    <p className="flex items-center text-sm">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                                        <span className="font-medium">{formatDateRange(t.start_date, t.end_date)}</span>
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                                        <span className="font-medium">{t.location || "Lokasi Belum Ditentukan"}</span>
                                    </p>
                                    <p className="flex items-center text-sm italic text-gray-500 line-clamp-2 pt-2 border-t mt-2">
                                        <ScrollText className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                        {t.description || "Tidak ada deskripsi singkat."}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Footer / Tombol Detail */}
                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => handleViewDetail(t)}
                                    className="w-full inline-flex items-center justify-center bg-primary text-secondary font-bold py-2.5 rounded-full hover:bg-yellow-500 transition duration-300 text-sm shadow-md"
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