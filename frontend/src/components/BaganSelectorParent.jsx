// File: src/components/BaganSelectorParent.jsx

import React, { useState } from 'react';
import { ChevronsRight } from 'lucide-react';
// 💡 PASTIKAN path ini benar:
import BaganPage from '../pages/BaganPage';
import BaganView from '../pages/BaganView';

// Komponen ini menerima tournamentId dari TournamentDetailPage
export default function BaganSelectorParent({ tournamentId }) {
    // State untuk menyimpan ID bagan yang dipilih
    const [selectedBaganId, setSelectedBaganId] = useState(null);
    
    // Jika ID bagan sudah terpilih, tampilkan BaganView
    if (selectedBaganId) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedBaganId(null)} // Tombol kembali ke daftar
                    className="flex items-center text-yellow-600 hover:text-yellow-800 font-semibold mb-4 text-lg"
                >
                    <ChevronsRight size={18} className="rotate-180 mr-1" /> Kembali ke Daftar Bagan
                </button>
                
                {/* 💡 RENDER BAGANVIEW dengan ID yang dipilih */}
                <BaganView baganId={selectedBaganId} />
            </div>
        );
    }

    // Jika belum ada ID bagan yang terpilih, tampilkan daftar BaganPage
    return (
        <BaganPage 
            // Kirim fungsi untuk mengubah state sebagai prop
            onSelectBagan={setSelectedBaganId} 
            tournamentId={tournamentId} // Kirim ID turnamen ke BaganPage
        />
    );
}