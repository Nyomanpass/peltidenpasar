import React from 'react';
import { Calendar, MapPin, Download, Zap, Users } from 'lucide-react'; 

const TournamentComming = () => {

    // Data Turnamen yang Akan Datang (Hanya 1 data yang disorot)
    const nextTournament = {
        id: 1,
        name: "Wali Kota Cup 2025",
        start_date: "2025-11-12",
        end_date: "2025-12-17",
        location: "GOR Ngurah Rai",
        description: "Wali kota cup 2025 akan hadir sebagai ajang seleksi utama, merupakan kesempatan emas bagi atlet junior dan senior Denpasar untuk meraih poin ranking tertinggi.",
        status: "PENDAFTARAN DIBUKA",
        poster: "/tournament.jpg", // Gambar Poster
        categories: "Tunggal (U14, U18, Senior)",
        deadline: "05 Desember 2025", // Tambahkan deadline
        rulesLink: "/turnamen/aturan-wali-kota-2025",
        registerLink: "/pendaftaran/wali-kota-cup-2025" 
    };

    // Fungsi helper untuk format tanggal (sederhana)
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        // Latar Belakang Section: bg-gray-50
        <section id="tournament-highlight" className="py-20 bg-gray-50"> 
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold mb-2 text-secondary">
                        Turnamen Mendatang
                    </h2>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                        Jangan lewatkan ajang kompetisi resmi utama di kota Denpasar.
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded"></div> 
                </div>
                
                {/* Kartu Turnamen Highlight (2 Kolom: Poster + Detail) */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border-b-8 border-primary">
                    
                    {/* KOLOM KIRI: POSTER VISUAL */}
                    <div className="relative lg:w-1/3 min-h-[350px] overflow-hidden">
                        <img 
                            src={nextTournament.poster} 
                            alt={`Poster ${nextTournament.name}`} 
                            className="w-full h-full object-cover" 
                        />
                        {/* Tag Status di Atas Gambar */}
                        <span className="absolute top-4 left-4 bg-primary text-secondary font-bold px-4 py-1 rounded-full text-sm tracking-wider shadow-md">
                            {nextTournament.status}
                        </span>
                    </div>

                    {/* KOLOM KANAN: DETAIL & CTA */}
                    <div className="lg:w-2/3 p-8">
                        <h3 className="text-4xl font-extrabold text-secondary mb-3">{nextTournament.name}</h3>
                        
                        <p className="text-gray-600 mb-6 border-b pb-4">{nextTournament.description}</p>

                        {/* Info Detail Cepat dalam Grid */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            
                            {/* Detail Tanggal */}
                            <div className="flex items-start text-gray-700">
                                <Calendar className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-sm text-gray-500 block">Tanggal Acara</span>
                                    <span className="font-bold">{formatDate(nextTournament.start_date)} - {formatDate(nextTournament.end_date)}</span>
                                </div>
                            </div>

                            {/* Detail Lokasi */}
                            <div className="flex items-start text-gray-700">
                                <MapPin className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-sm text-gray-500 block">Lokasi Pertandingan</span>
                                    <span className="font-bold">{nextTournament.location}</span>
                                </div>
                            </div>
                            
                            {/* Detail Kategori */}
                             <div className="flex items-start text-gray-700">
                                <Users className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-sm text-gray-500 block">Kategori Dibuka</span>
                                    <span className="font-bold">{nextTournament.categories}</span>
                                </div>
                            </div>
                            
                            {/* Detail Deadline (Merah) */}
                            <div className="flex items-start text-red-600">
                                <Zap className="w-6 h-6 mr-3 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-sm block">Batas Pendaftaran</span>
                                    <span className="font-bold">{nextTournament.deadline}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tombol Aksi dan Peraturan */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            
                            {/* Tombol Daftar (Primary) */}
                            <a
                                href={nextTournament.registerLink}
                                className="inline-flex items-center bg-primary text-secondary font-bold py-3 px-8 rounded-full hover:opacity-90 transition duration-300 shadow-lg text-lg justify-center"
                            >
                                Daftar Sekarang →
                            </a>
                            
                            {/* Tombol Peraturan (Sekunder) */}
                            <a
                                href={nextTournament.rulesLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-indigo-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-200 border border-gray-300 justify-center"
                            >
                                <Download className="w-5 h-5 mr-2" /> Unduh Peraturan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TournamentComming;