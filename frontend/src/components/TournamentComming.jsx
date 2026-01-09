import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Zap, Info, AlertCircle, Loader2 } from 'lucide-react'; 
import api from '../api'; // Pastikan ini mengarah ke konfigurasi axios Anda

const TournamentComming = () => {
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = "http://localhost:5004"; // Sesuaikan dengan URL Backend Anda

    useEffect(() => {
        const fetchLatestTournament = async () => {
            try {
                const res = await api.get('/tournaments');
                // Filter hanya yang statusnya "aktif"
                // Kemudian ambil yang ID-nya paling besar (terbaru)
                const activeOnes = res.data
                    .filter(t => t.status === "aktif")
                    .sort((a, b) => b.id - a.id);

                if (activeOnes.length > 0) {
                    setTournament(activeOnes[0]);
                }
            } catch (err) {
                console.error("Gagal mengambil data turnamen:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestTournament();
    }, []);

    // Helper: Format Tanggal ke Bahasa Indonesia
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper: Hitung Deadline (H-7 sebelum start_date)
    const getDeadline = (startDate) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() - 3);
        return date;
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-2" size={40} />
                <p className="font-medium">Mencari Turnamen Terbaru...</p>
            </div>
        );
    }

    // Jika tidak ada turnamen aktif di database
    if (!tournament) return null;

    const deadline = getDeadline(tournament.start_date);
    const isRegistrationClosed = new Date() > deadline;

    return (
        <section id="tournament-highlight" className="py-20 bg-gray-50"> 
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Judul Seksi */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">
                        Turnamen Mendatang
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto italic">
                        "Siapkan fisik dan mental, raih prestasi tertinggi di Denpasar."
                    </p>
                    <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div> 
                </div>
                
                {/* Kartu Turnamen Utama */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
                    
                    {/* KOLOM KIRI: POSTER */}
                    <div className="relative lg:w-2/5 min-h-[400px]">
                        <img 
                            src={tournament.poster ? `${BASE_URL}/${tournament.poster}` : "/default-tournament.jpg"} 
                            alt={tournament.name} 
                            className="w-full h-full object-cover transform hover:scale-105 transition duration-700" 
                        />
                        {/* Status Label */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <span className={`font-black px-5 py-2 rounded-xl text-xs shadow-lg ${
                                isRegistrationClosed ? 'bg-red-500 text-white' : 'bg-yellow-400 text-gray-900'
                            }`}>
                                {isRegistrationClosed ? "PENDAFTARAN DITUTUP" : "PENDAFTARAN DIBUKA"}
                            </span>
                            <span className="bg-blue-600 text-white font-bold px-4 py-1.5 rounded-lg text-[10px] shadow-lg w-fit">
                                {tournament.type.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* KOLOM KANAN: DETAIL DATA */}
                    <div className="lg:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                        <h3 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                            {tournament.name}
                        </h3>
                        
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed border-l-4 border-blue-100 pl-4">
                            {tournament.description}
                        </p>

                        {/* Grid Informasi Database */}
                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            
                            <InfoItem 
                                icon={<Calendar className="text-blue-600" />} 
                                label="Tanggal Pelaksanaan" 
                                value={`${formatDate(tournament.start_date)} - ${formatDate(tournament.end_date)}`} 
                            />

                            <InfoItem 
                                icon={<MapPin className="text-red-600" />} 
                                label="Lokasi Pertandingan" 
                                value={tournament.location} 
                            />
                            
                            <InfoItem 
                                icon={<Zap className="text-emerald-600" />} 
                                label="Biaya Pendaftaran" 
                                value={tournament.type === 'berbayar' 
                                    ? `Rp ${Number(tournament.nominal).toLocaleString('id-ID')}` 
                                    : "GRATIS"
                                } 
                            />
                            
                            <InfoItem 
                                icon={<AlertCircle className="text-orange-600" />} 
                                label="Batas Pendaftaran (H-3)" 
                                value={formatDate(deadline)} 
                                isDeadline={true}
                            />
                        </div>

                        {/* Info Bank jika Berbayar */}
                        {tournament.type === 'berbayar' && tournament.bank_info && (
                            <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                                <Info className="text-blue-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">
                                    Pembayaran melalui: <span className="font-bold">{tournament.bank_info}</span>
                                </p>
                            </div>
                        )}
                        
                        {/* Tombol Aksi */}
                       <div className="flex flex-col sm:flex-row gap-4">
                        {isRegistrationClosed ? (
                                    // Tampilan saat TUTUP: Menggunakan <div> agar tidak bisa diklik sama sekali
                            <div className="inline-flex items-center justify-center py-4 px-10 rounded-2xl font-black text-lg bg-gray-300 text-gray-500 cursor-not-allowed shadow-none">
                                        Pendaftaran Berakhir
                                    </div>
                                ) : (
                                    // Tampilan saat BUKA: Menggunakan <a> untuk link pendaftaran
                                    <a
                                        href="/daftar-peserta"
                                        className="inline-flex items-center justify-center py-4 px-10 rounded-2xl font-black text-lg transition duration-300 shadow-xl bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200"
                                    >
                                        Daftar Sekarang →
                                    </a>
                                )}
                            </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Sub-komponen agar kode rapi
const InfoItem = ({ icon, label, value, isDeadline }) => (
    <div className="flex items-start">
        <div className="p-3 bg-gray-50 rounded-xl mr-4">{icon}</div>
        <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{label}</span>
            <span className={`font-bold text-gray-800 ${isDeadline ? 'text-red-600' : ''}`}>{value}</span>
        </div>
    </div>
);

export default TournamentComming;