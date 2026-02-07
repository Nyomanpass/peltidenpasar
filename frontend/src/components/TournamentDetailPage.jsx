// File: src/components/TournamentDetailPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, GitBranch, CalendarDays, BarChart, Medal, User, Users2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// 💡 Import komponen yang dibutuhkan
import PesertaView from './admin/Peserta';
import BaganSelectorParent from './BaganSelectorParent';
import JadwalPage from '../pages/JadwalPage';
import JuaraPage from '../pages/JuaraPage';
import SkorPage from '../pages/SkorPage';
import PesertaGanda from './admin/PesertaGanda';

const TABS = {
    PESERTA: 'peserta',
    BAGAN: 'bagan',
    JADWAL: 'jadwal',
    SKOR: 'skor',
    HASIL: 'hasil',
};

const TournamentDetailPage = () => {
    const selectedTournamentId = localStorage.getItem("selectedTournament");
    const selectedTournamentName = localStorage.getItem("selectedTournamentName");
    const [activeTab, setActiveTab] = useState(TABS.PESERTA);
    const [subTabPeserta, setSubTabPeserta] = useState('single');

    const renderContent = () => {
        if (!selectedTournamentId) {
            return (
                <div className="p-6 sm:p-8 text-center bg-yellow-50 rounded-xl border border-yellow-300">
                    <Trophy size={32} className="text-yellow-600 mx-auto mb-3" />
                    <p className="text-lg text-gray-700 font-semibold">
                        Turnamen belum dipilih. Silakan kembali ke halaman utama.
                    </p>
                </div>
            );
        }

        switch (activeTab) {
            case TABS.PESERTA:
                return (
                    <div className="space-y-6 ">
                        {/* Sub-Navigasi internal untuk Single/Double */}
                        <div className="flex justify-center overflow-x-auto">
                            <div className="inline-flex bg-gray-100 p-1 rounded-xl border border-gray-200 min-w-max">
                                <button
                                    onClick={() => setSubTabPeserta('single')}
                                    className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${subTabPeserta === 'single' ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    <User size={14} className="inline mr-1 sm:mr-2"/> Single
                                </button>
                                <button
                                    onClick={() => setSubTabPeserta('ganda')}
                                    className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${subTabPeserta === 'ganda' ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    <Users2 size={14} className="inline mr-1 sm:mr-2"/> Double
                                </button>
                            </div>
                        </div>

                        {subTabPeserta === 'single' ? (
                            <PesertaView tournamentId={selectedTournamentId} />
                        ) : (
                            <PesertaGanda tournamentId={selectedTournamentId} />
                        )}
                    </div>
                );

            case TABS.BAGAN:
                return <BaganSelectorParent tournamentId={selectedTournamentId} />;

            case TABS.JADWAL:
                return <JadwalPage tournamentId={selectedTournamentId} />;

            case TABS.SKOR:
                return <SkorPage tournamentId={selectedTournamentId} />;

            case TABS.HASIL:
                return <JuaraPage tournamentId={selectedTournamentId} />;

            default:
                return null;
        }
    };

    return (
        <>
            <Navbar />
            <div className="font-sans bg-gray-50 min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    {/* --- JUDUL UTAMA --- */}
                  <header className="mb-4 sm:mb-10 px-4 py-2 sm:px-6 sm:py-6 bg-white rounded-xl shadow-lg border-t-4 border-yellow-500">
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
    <Trophy size={36} className="text-yellow-600 flex-shrink-0" />
    <div className="text-center sm:text-left">
      <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase mb-1 sm:mb-2">
        Detail Turnamen
      </p>
      <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
        {selectedTournamentName || "Memuat Detail Turnamen..."}
      </h1>
    </div>
  </div>
</header>


                    {/* --- TAB NAVIGASI --- */}
                    <div className="mb-4 sm:mb-6 overflow-x-auto">
                        <nav className="flex space-x-4 sm:space-x-8" aria-label="Tabs">
                            {[
                                { id: TABS.PESERTA, name: 'Peserta', icon: Users },
                                { id: TABS.BAGAN, name: 'Bagan', icon: GitBranch },
                                { id: TABS.JADWAL, name: 'Jadwal', icon: CalendarDays },
                                { id: TABS.SKOR, name: 'Skor', icon: Medal },
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
                                        group inline-flex items-center px-3 sm:px-4 py-2 border-b-2 font-medium text-sm sm:text-base transition duration-150 ease-in-out whitespace-nowrap
                                    `}
                                >
                                    <tab.icon
                                        className={`-ml-0.5 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${tab.id === activeTab ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-500'}`}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* --- KONTEN AKTIF --- */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default TournamentDetailPage;
