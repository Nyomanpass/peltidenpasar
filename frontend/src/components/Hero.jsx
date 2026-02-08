import React, { useState, useEffect } from "react";
import api from "../api"; // pakai instance api-mu
const AUTO_SLIDE_INTERVAL = 8000;

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
        const res = await api.get("/slider/get"); // pakai api
        setSlides(res.data || []);
      } catch (err) {
        console.error("Gagal fetch slider:", err);
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

  if (loading) {
    return (
      <section className="h-[450px] md:h-[500px] flex items-center justify-center">
        <p className="text-gray-400">Loading slider...</p>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="w-full  mt-18 h-[450px] md:h-[500px] lg:h-[550px] relative overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.idSlider}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>

          <div className="absolute inset-0 flex items-center justify-start px-6 sm:px-12 lg:px-20">
            <div className="max-w-3xl text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-semibold text-white leading-snug drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 font-light leading-relaxed drop-shadow-md max-w-2xl">
                {slide.description}
              </p>
              <a
                href={slide.ctaLink}
                className="mt-4 sm:mt-5 inline-block bg-primary text-white font-black text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-[#c29841] transition duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide"
              >
                {slide.ctaText} →
              </a>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 shadow-md ${
              index === currentSlide
                ? "bg-primary w-6 sm:w-5"
                : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;
