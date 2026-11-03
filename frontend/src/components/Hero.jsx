import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import api from "../api";

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5004";

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await api.get("/slider/get");
        setSlides(res.data || []);
      } catch (error) {
        console.error("Gagal fetch slider:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlider();
  }, []);

  // Auto-slide setiap 6 detik
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="w-full mt-[65px] sm:mt-[75px] h-[500px] md:h-[600px] bg-gray-900 animate-pulse relative overflow-hidden flex items-center px-6 lg:px-20">
        <div className="max-w-2xl w-full space-y-6">
          <div className="h-6 bg-gray-800 rounded-full w-32"></div>
          <div className="h-12 bg-gray-800 rounded-xl w-full"></div>
          <div className="h-6 bg-gray-800 rounded-lg w-3/4"></div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full h-[520px] sm:h-[580px] md:h-[640px] mt-[65px] sm:mt-[75px] overflow-hidden bg-black group">
      {slides.map((slide, idx) => {
        const imageUrl = slide.image 
          ? (slide.image.startsWith('http') ? slide.image : `${BASE_URL}${slide.image}`)
          : '/placeholder-hero.jpg';

        return (
          <div
            key={slide.idSlider || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image dengan efek zoom halus */}
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-1000"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            
            {/* Overlay Gradient Modern */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-5xl z-20 space-y-3">
              
              {/* Badge dengan Titik Bundar & Posisi Lebih Naik */}
              <div className="mb-1">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold tracking-widest uppercase backdrop-blur-md w-fit">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse"></span>
                  PELTI Kota Denpasar
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                {slide.title}
              </h1>

              {slide.description && (
                <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl line-clamp-2 font-normal leading-relaxed">
                  {slide.description}
                </p>
              )}

              {slide.ctaLink && (
                <div className="pt-2">
                  <a
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-2xl text-sm uppercase tracking-wider transition-all shadow-xl hover:scale-105 group/btn"
                  >
                    <span>{slide.ctaText || "Jelajahi Sekarang"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Tombol Navigasi Kiri & Kanan */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all hidden md:flex items-center justify-center border border-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all hidden md:flex items-center justify-center border border-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                idx === current ? "w-8 bg-yellow-400" : "w-2 bg-white/40 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}