import React, { useState, useEffect } from "react";
import api from "../api"; // axios instance

const AUTO_SLIDE_INTERVAL = 5000;

function Hero() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH SLIDER
  // ===============================
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

  // ===============================
  // AUTO SLIDE
  // ===============================
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [slides]);

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <section className="h-[450px] md:h-[500px] flex items-center justify-center">
        <p className="text-gray-400">Loading slider...</p>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="w-full mt-16 md:mt-28 h-[450px] md:h-[500px] lg:h-[550px] relative overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.idSlider}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
          }}
        >
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-start px-4 sm:px-10 lg:px-20">
            <div className="max-w-3xl text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-snug drop-shadow-lg">
                {slide.title}
              </h1>

              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 font-light leading-relaxed drop-shadow-md max-w-2xl">
                {slide.description}
              </p>

              {slide.ctaLink && (
              <a
                href={slide.ctaLink}
                className="group mt-5 inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs sm:text-sm md:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>{slide.ctaText || "Lihat Selengkapnya"}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            )}
            </div>
          </div>
        </div>
      ))}

      {/* DOT NAVIGATION */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-3 z-20 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
      {slides.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentSlide(index)}
          aria-label={`Go to slide ${index + 1}`}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentSlide
              ? "bg-white w-7 sm:w-8"
              : "bg-white/40 w-2 hover:bg-white/70"
          }`}
        />
      ))}
      </div>
    </section>
  );
}

export default Hero;