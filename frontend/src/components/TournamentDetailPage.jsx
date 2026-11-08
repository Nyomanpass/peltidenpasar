// File: src/components/TournamentDetailPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Trophy, Users, GitBranch, CalendarDays, BarChart, Medal, User, Users2, Search, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// 💡 Import komponen yang dibutuhkan
import PesertaView from './admin/Peserta';
import BaganSelectorParent from './BaganSelectorParent';
import JadwalPage from '../pages/JadwalPage';
import JuaraPage from '../pages/JuaraPage';
import SkorPage from '../pages/SkorPage';
import PesertaGanda from './admin/PesertaGanda';
import SertifikatPage from '../pages/SertifikatPage';

const TABS = {
    PESERTA: 'peserta',
    BAGAN: 'bagan',
    JADWAL: 'jadwal',
    SKOR: 'skor',
    HASIL: 'hasil',
    SERTIFIKAT: 'sertifikat'
};

const TournamentDetailPage = () => {
    const selectedTournamentId = localStorage.getItem("selectedTournament");
    const selectedTournamentName = localStorage.getItem("selectedTournamentName");
    
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState(TABS.PESERTA);
    const [subTabPeserta, setSubTabPeserta] = useState('single');
    
    // 💡 Definisikan searchTerm agar tidak error ReferenceError
    const [searchTerm, setSearchTerm] = useState("");

    // State untuk kontrol scroll tab navigasi di mobile
    const tabNavRef = useRef(null);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkTabScroll = () => {
        if (tabNavRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabNavRef.current;
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
        }
    };

    useEffect(() => {
        // Cek scroll awal setelah render
        const timer = setTimeout(checkTabScroll, 100);
        window.addEventListener('resize', checkTabScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkTabScroll);
        };
    }, []);

    const scrollTabs = (direction) => {
        if (tabNavRef.current) {
            const amount = direction === 'left' ? -150 : 150;
            tabNavRef.current.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(checkTabScroll, 200);
        }
    };

    const handleSelectTab = (tabId, e) => {
        setActiveTab(tabId);
        if (e?.currentTarget) {
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        setTimeout(checkTabScroll, 200);
    };

    // Nama tournament diambil dari data state atau localStorage
    const currentTournamentName = selectedTournamentName || "Tournament";

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
                    <div className="space-y-6">
                        {/* --- HEADER MANAJEMEN PESERTA --- */}
                        <div className="mb-6 md:mb-8 border-b border-gray-100 pb-5 md:pb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                
                                {/* Judul & Nama Tournament */}
                                <div className="text-center md:text-left">
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                        Manajemen Peserta
                                    </h1>
                                    <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100 md:bg-transparent md:border-none md:px-0">
                                        <p className="text-[10px] md:text-sm text-yellow-700 md:text-yellow-600 font-bold uppercase tracking-widest">
                                            Tournament: {currentTournamentName}
                                        </p>
                                    </div>
                                </div>

                                {/* Filter Single/Double & Search Bar */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    
                                    {/* Sub-Navigasi Single/Double */}
                                    <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">

                                        <button
                                            onClick={() => setSubTabPeserta('single')}
                                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 
                                                        px-5 md:px-6 
                                                        py-2.5 md:py-2 
                                                        rounded-xl 
                                                        font-black 
                                                        text-[10px] md:text-xs 
                                                        uppercase tracking-widest 
                                                        transition-all duration-300 ${
                                            subTabPeserta === 'single'
                                                ? "bg-white text-yellow-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            <span className="hidden md:inline">
                                            <User size={16} />
                                            </span>
                                            Single
                                        </button>

                                        <button
                                            onClick={() => setSubTabPeserta('ganda')}
                                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 
                                                        px-5 md:px-6 
                                                        py-2.5 md:py-2 
                                                        rounded-xl 
                                                        font-black 
                                                        text-[10px] md:text-xs 
                                                        uppercase tracking-widest 
                                                        transition-all duration-300 ${
                                            subTabPeserta === 'ganda'
                                                ? "bg-white text-yellow-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            <span className="hidden md:inline">
                                            <Users2 size={16} />
                                            </span>
                                            Double
                                        </button>

                                    </div>


                                    {/* Input Pencarian */}
                                    <div className="relative w-full md:w-64 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-600 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Cari nama peserta..."
                                            className="w-full pl-10 pr-4 py-3 md:py-2 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-500 outline-none text-sm transition-all font-medium"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- ISI KONTEN (Tabel Peserta) --- */}
                        {subTabPeserta === 'single' ? (
                            <PesertaView tournamentId={selectedTournamentId} searchTerm={searchTerm} readOnly />
                        ) : (
                            <PesertaGanda tournamentId={selectedTournamentId} searchTerm={searchTerm} readOnly />
                        )}
                    </div>
                );
               
            case TABS.BAGAN:
                return <BaganSelectorParent tournamentId={selectedTournamentId} readOnly />;

            case TABS.JADWAL:
                return <JadwalPage tournamentId={selectedTournamentId} readOnly />;

            case TABS.SKOR:
                return <SkorPage tournamentId={selectedTournamentId} readOnly />;

            case TABS.HASIL:
                return <JuaraPage tournamentId={selectedTournamentId} readOnly />;
            case TABS.SERTIFIKAT:
                return <SertifikatPage tournamentId={selectedTournamentId} readOnly />;

            default:
                return null;
        }
    };

    return (
        <>
            <Navbar variant="solid" />
            <div className="font-sans bg-gray-50 min-h-screen pt-20 sm:pt-24 pb-20 sm:pb-24 px-3 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
                <div className="max-w-7xl mx-auto w-full min-w-0">
                    {/* --- JUDUL UTAMA --- */}
                    <header className="mb-4 mt-4 sm:mt-6 md:mt-16 sm:mb-8 px-4 py-4 sm:px-6 sm:py-6 bg-white rounded-2xl shadow-sm sm:shadow-lg border-t-4 border-yellow-500">
                        <div className="flex items-center gap-3 sm:gap-5">
                            <div className="bg-yellow-100 p-2 sm:p-3 rounded-xl shrink-0">
                                <Trophy className="text-yellow-600 w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Detail Turnamen
                                </p>
                                <h1 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight truncate">
                                    {selectedTournamentName || "Memuat Detail Turnamen..."}
                                </h1>
                            </div>
                        </div>
                    </header>

                    {/* --- TAB NAVIGASI --- */}
                    <div className="relative w-full max-w-full mb-4 sm:mb-6 overflow-hidden">
                        {/* Icon Panah Fixed di Kanan Tab Navigasi Khusus Mobile */}
                        <div
                            className={`sm:hidden absolute right-0 top-0 bottom-1 flex items-center pr-1 pl-6 bg-gradient-to-l from-gray-50 via-gray-50/95 to-transparent z-20 transition-opacity duration-200 pointer-events-none ${
                                canScrollRight ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => scrollTabs('right')}
                                className="w-7 h-7 rounded-full bg-white shadow-md border border-gray-200/90 flex items-center justify-center text-yellow-600 pointer-events-auto active:scale-90 transition-transform"
                                aria-label="Geser tab ke kanan"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>

                        <nav
                            ref={tabNavRef}
                            onScroll={checkTabScroll}
                            className="w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex sm:flex-wrap sm:justify-center items-center gap-1.5 sm:gap-4 pb-1 pr-10 sm:pr-0"
                            aria-label="Tabs"
                        >
                            {[
                                { id: TABS.PESERTA, name: "Peserta", icon: Users },
                                { id: TABS.BAGAN, name: "Bagan", icon: GitBranch },
                                { id: TABS.JADWAL, name: "Jadwal", icon: CalendarDays },
                                { id: TABS.SKOR, name: "Skor", icon: Medal },
                                { id: TABS.HASIL, name: "Hasil", icon: BarChart },
                                { id: TABS.SERTIFIKAT, name: "Sertifikat", icon: User },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={(e) => handleSelectTab(tab.id, e)}
                                    className={`
                                        ${tab.id === activeTab
                                            ? "border-yellow-500 text-yellow-600 bg-yellow-50 shadow-xs font-black"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-bold"
                                        }
                                        shrink-0 sm:shrink sm:w-auto
                                        min-w-[85px] sm:min-w-[120px] lg:min-w-[150px]
                                        flex items-center justify-center gap-1.5 sm:gap-2
                                        px-3.5 sm:px-6 py-2.5 sm:py-3
                                        border-b-2
                                        text-xs sm:text-sm lg:text-base
                                        rounded-t-xl transition-all duration-200 whitespace-nowrap
                                    `}
                                >
                                    <tab.icon
                                        className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                                            tab.id === activeTab ? "text-yellow-500" : "text-gray-400"
                                        }`}
                                    />
                                    <span className="truncate">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* --- KONTEN AKTIF --- */}
                    <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-sm sm:shadow-lg border border-gray-100">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default TournamentDetailPage;