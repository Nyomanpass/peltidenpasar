// File: src/components/TournamentDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Trophy, Users, GitBranch, CalendarDays, BarChart } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// 💡 Import komponen yang dibutuhkan
import PesertaView from './admin/Peserta'; // Asumsi PesertaView sudah ada
import BaganSelectorParent from './BaganSelectorParent'; // WAJIB: Komponen wrapper untuk tab Bagan
import JadwalPage from '../pages/JadwalPage'; 
import JuaraPage from '../pages/JuaraPage'; 

const TABS = {
    PESERTA: 'peserta',
    BAGAN: 'bagan',
    JADWAL: 'jadwal',
    HASIL: 'hasil',
};

const TournamentDetailPage = () => {
    // Ambil ID dan Nama Turnamen dari localStorage
    const selectedTournamentId = localStorage.getItem("selectedTournament");
    const selectedTournamentName = localStorage.getItem("selectedTournamentName");
    const [activeTab, setActiveTab] = useState(TABS.PESERTA);
    
    const renderContent = () => {
        // 🚨 Error handling jika ID turnamen tidak ada
        if (!selectedTournamentId) {
            return (
                <div className="p-8 text-center bg-yellow-50 rounded-xl border border-yellow-300">
                    <Trophy size={32} className="text-yellow-600 mx-auto mb-3" />
                    <p className="text-lg text-gray-700 font-semibold">
                        Turnamen belum dipilih. Silakan kembali ke halaman utama.
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case TABS.PESERTA:
                return <PesertaView tournamentId={selectedTournamentId} />;
                
            case TABS.BAGAN:
                // 💡 PENTING: Menggunakan BaganSelectorParent untuk mengelola state Daftar vs Detail
                return <BaganSelectorParent tournamentId={selectedTournamentId} />;
                
            case TABS.JADWAL:
                return <JadwalPage tournamentId={selectedTournamentId} />;
                
            case TABS.HASIL:
                return <JuaraPage tournamentId={selectedTournamentId} />;
                
            default:
                return null;
        }
    };

    return (
        <>
        <Navbar/>
        <div className="font-sans bg-gray-50 min-h-screen pt-42 pb-24">
             <div className="relative container mx-auto px-4 md:px-20">
                
                {/* --- JUDUL UTAMA --- */}
                <header className="mb-10 p-6 bg-white rounded-xl shadow-lg border-t-4 border-yellow-500">
                    <div className="flex items-center gap-4">
                        <Trophy size={48} className="text-yellow-600"/>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">Detail Turnamen</p>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                {selectedTournamentName || "Memuat Detail Turnamen..."}
                            </h1>
                        </div>
                    </div>
                </header>
                
                {/* --- TAB NAVIGASI --- */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {[
                            { id: TABS.PESERTA, name: 'Peserta', icon: Users },
                            { id: TABS.BAGAN, name: 'Bagan', icon: GitBranch },
                            { id: TABS.JADWAL, name: 'Jadwal', icon: CalendarDays },
                            { id: TABS.HASIL, name: 'Hasil Pertandingan', icon: BarChart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    ${tab.id === activeTab
                                        ? 'border-yellow-500 text-yellow-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                    group inline-flex items-center px-1 py-4 border-b-2 font-medium text-lg transition duration-150 ease-in-out
                                `}
                            >
                                <tab.icon 
                                    className={`-ml-0.5 mr-2 h-5 w-5 ${tab.id === activeTab ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-500'}`} 
                                    aria-hidden="true" 
                                />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* --- KONTEN AKTIF --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    {renderContent()}
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
};

export default TournamentDetailPage;