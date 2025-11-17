import React, { useState, useEffect } from 'react';

// Data untuk setiap slide, dengan penambahan field 'description'
const slides = [
  {
    title: "Walikota Cup 2025",
    subtitle: "Ajang Pembuktian Bakat Tenis Bali",
    // Deskripsi yang lebih jelas tentang turnamen
    description: "Ikuti turnamen tenis bergengsi tahunan. Ajang sempurna bagi atlet junior hingga senior untuk menguji kemampuan, meraih gelar, dan mengukir sejarah di kancah Denpasar.",
    ctaText: "Daftar Sekarang",
    ctaLink: "/tournament/walikotacup",
    image: "hero.jpg"
  },
  {
    title: "Mencetak Generasi Unggul",
    subtitle: "Pembinaan Atlet Muda (SD-SMA) Berbakat",
    // Deskripsi yang lebih jelas tentang pembinaan
    description: "Kami fokus pada pengembangan bibit muda melalui kurikulum latihan tenis terbaik. Menyiapkan atlet Denpasar dari tingkat SD hingga SMA untuk kompetisi nasional dan internasional.",
    ctaText: "Program Pembinaan",
    ctaLink: "/program/pembinaan",
     image: "hero.jpg"
  },
  {
    title: "Tenis Untuk Semua",
    subtitle: "Komunitas & Pertandingan Umum Mingguan",
    // Deskripsi yang lebih jelas untuk komunitas umum
    description: "Gabung dengan komunitas kami! Selain turnamen, kami menyediakan Fun Match dan program 'Ayo Tenis' untuk masyarakat umum. Sehatkan raga, jalin silaturahmi.",
    ctaText: "Gabung Komunitas",
    ctaLink: "/komunitas",
     image: "hero.jpg"
  },
];

const AUTO_SLIDE_INTERVAL = 8000; // 5 detik

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fungsi untuk pindah slide secara otomatis
  useEffect(() => {
    // Set interval untuk perpindahan slide
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevIndex) => 
        (prevIndex + 1) % slides.length
      );
    }, AUTO_SLIDE_INTERVAL);

    // Membersihkan interval saat komponen di-unmount atau dependensi berubah
    return () => clearInterval(slideInterval);
  }, [slides.length]); // Dependensi: slides.length

  // Fungsi untuk navigasi manual
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section id="home" className="relative w-full h-screen max-h-[900px] overflow-hidden">
      
      {/* Container Slide */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          // Ganti 'bg-opacity' dengan transform/opacity pada elemen background
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          {/* Overlay Gelap dengan Gradien Emas di bawah */}
          <div className="absolute inset-0 bg-black/40"></div> {/* Sedikit lebih gelap */}
          {/* Gradien Emas untuk Aksen Keren di bawah */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>

          {/* Konten Teks */}
          <div className="absolute inset-0 flex items-center justify-start px-4 md:px-8 lg:px-20">
            <div className="max-w-5xl text-left transform translate-y-10 md:translate-y-0">
              
              {/* Subtitle (Sekarang Lebih Kontras) */}
              <p className="text-md md:text-md text-white font-medium mb-3 tracking-widest uppercase bg-primary text-black inline-block py-2 px-5 rounded-full shadow-xl">
                {slide.subtitle}
              </p>
              
              {/* Judul Utama (Ukuran Dikurangi untuk Kejelasan) */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F0E68C] leading-tight drop-shadow-lg">
                {slide.title}
              </h1>

              {/* Deskripsi Tambahan (Teks Penjelas Baru) */}
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
                {slide.description}
              </p>

              {/* Tombol CTA yang Kuat */}
              <a
                href={slide.ctaLink}
                onClick={() => console.log("CTA Clicked:", slide.ctaLink)}
                className="mt-8 inline-block bg-primary text-white font-black text-md px-8 py-4 rounded-xl hover:bg-[#c29841] transition duration-300 transform hover:scale-[1.03] uppercase tracking-wide"
              >
                {slide.ctaText} →
              </a>
            </div>
          </div>
        </div>
      ))}
      
      {/* Kontrol Navigasi (Dots di bawah) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${
              index === currentSlide ? 'bg-primary w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;