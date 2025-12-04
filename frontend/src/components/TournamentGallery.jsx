import React from 'react';
import { Camera } from 'lucide-react'; 

const TournamentGallery = () => {
    
    // Data Contoh URL Foto (Ganti dengan URL gambar Anda yang sebenarnya)
    const galleryPhotos = [
        { id: 1, url: "/images/gallery/match_action.jpg", alt: "Aksi pertandingan final" },
        { id: 2, url: "/images/gallery/trophy_ceremony.jpg", alt: "Upacara penyerahan trofi" },
        { id: 3, url: "/images/gallery/crowd_view.jpg", alt: "Pemandangan penonton yang ramai" },
        { id: 4, url: "/images/gallery/junior_winners.jpg", alt: "Pemenang kategori junior" },
        { id: 5, url: "/images/gallery/referee_shot.jpg", alt: "Wasit sedang bertugas" },
        { id: 6, url: "/images/gallery/stadium_exterior.jpg", alt: "Eksterior lapangan pertandingan" },
    ];

    return (
        <section id="photo-gallery" className="py-20 bg-gray-100"> 
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold mb-2 text-secondary">
                        Momen Terbaik Turnamen Lalu
                    </h2>
                    <p className="text-xl text-gray-700">
                        Saksikan keseruan dan semangat kompetisi dari acara-acara yang telah kami selenggarakan.
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded"></div>
                </div>
                
                {/* Grid Galeri Foto */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {galleryPhotos.map((photo) => (
                        <div 
                            key={photo.id} 
                            className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer aspect-video" // Menggunakan aspect-video untuk rasio gambar
                        >
                            <img 
                                src={photo.url} 
                                alt={photo.alt} 
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            {/* Overlay dan Text Hover */}
                            <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                                <p className="text-white text-sm font-semibold text-center p-4">
                                    <Camera className="w-5 h-5 mx-auto mb-1" />
                                    {photo.alt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                
              
            </div>
        </section>
    );
};

export default TournamentGallery;