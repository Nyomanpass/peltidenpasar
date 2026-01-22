import React from 'react';
import { Zap, TrendingUp } from 'lucide-react'; 

const TournamentCTA = () => {
    
    // Asumsi tautan pendaftaran utama mengarah ke turnamen yang paling aktif
    const mainRegistrationLink = "/pendaftaran/turnamen-aktif"; 

    return (
        // Menggunakan warna sekunder (gelap) untuk kontras yang kuat
        <section id="emotional-cta" className="py-20 bg-gray-50 text-white"> 
            <div className="container mx-auto px-4 max-w-4xl text-center">
                
                {/* Ikon Aksen */}
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce-slow" /> 
                
                {/* Headline Persuasif */}
                <h2 className="text-4xl md:text-5xl text-black font-extrabold mb-4 leading-tight">
                    Jangan Hanya Menjadi Penonton!
                </h2>
                
                {/* Sub-headline yang Mendorong Tindakan */}
                <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
                    Momen Anda adalah Sekarang. Buktikan kemampuan Anda, raih poin ranking tertinggi, dan ukir sejarah sebagai juara tenis Denpasar berikutnya.
                </p>
                
                {/* Tombol CTA Utama (Menggunakan warna primary yang menonjol) */}
                <a
                    href={mainRegistrationLink}
                    className="inline-flex items-center bg-primary text-white font-extrabold 
                                py-4 px-10 rounded-full text-xl uppercase tracking-wider 
                                hover:bg-yellow-500 transition duration-300 shadow-xl 
                                transform hover:scale-105"
                >
                    Daftar Turnamen Aktif Sekarang
                </a>
                
                {/* Catatan Kaki (Sense of Urgency) */}
                <p className="mt-6 text-sm italic text-gray-400">
                    Batas waktu pendaftaran semakin dekat. Amankan tempat Anda sebelum kuota penuh!
                </p>

            </div>
        </section>
    );
};

export default TournamentCTA;