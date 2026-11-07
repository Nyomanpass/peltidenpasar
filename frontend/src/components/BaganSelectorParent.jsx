// File: src/components/BaganSelectorParent.jsx

import React, { useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import BaganPage from '../pages/BaganPage';
import BaganView from '../pages/BaganView';

export default function BaganSelectorParent({ tournamentId, readOnly = false }) {
    const [selectedBaganId, setSelectedBaganId] = useState(null);

    // Jika ID bagan sudah terpilih, tampilkan BaganView
    if (selectedBaganId) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedBaganId(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs sm:text-sm border border-amber-200/80 shadow-xs transition-all mb-4 active:scale-95"
                >
                    <ChevronsRight size={16} className="rotate-180 flex-shrink-0 text-amber-600" />
                    <span>Kembali ke Daftar Bagan</span>
                </button>

                {/* Konten bagan scrollable horizontal jika perlu */}
             
                    <BaganView baganId={selectedBaganId} readOnly={readOnly} />
               
            </div>
        );
    }

    // Jika belum ada ID bagan yang terpilih, tampilkan daftar BaganPage
    return (
        <div className="overflow-x-auto">
            <BaganPage
                onSelectBagan={setSelectedBaganId}
                tournamentId={tournamentId}
                readOnly={readOnly}
            />
        </div>
    );
}
