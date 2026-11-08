import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowRight } from "lucide-react";
import api from "../api";

const pad = (n) => String(n).padStart(2, "0");

const SLIDE_HIGHLIGHTS = [
  ["olahraga tenis lapangan"], // slide 1
  ["Turnamen Tenis Wali Kota Cup"], // slide 2
  ["Porprov Bali"], // slide 3
];

// Frasa yang di-highlight pada judul besar tiap slide
const SLIDE_TITLE_HIGHLIGHTS = [
  ["PELTI Denpasar"], // slide 1
  ["PELTI Denpasar"], // slide 2
  ["Prestasi"], // slide 3
];

// Sorot kemunculan pertama dari frasa yang ditemukan
// nowrap = true dipakai di judul agar "PELTI Denpasar" tidak terpisah baris
function highlightText(text, phrases = [], nowrap = false) {
  if (!text) return null;

  for (const phrase of phrases) {
    if (!phrase) continue;
    const index = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (index === -1) continue;

    return (
      <>
        {text.slice(0, index)}
        <span className={`text-amber-300 ${nowrap ? "sm:whitespace-nowrap" : ""}`}>
          {text.slice(index, index + phrase.length)}
        </span>
        {text.slice(index + phrase.length)}
      </>
    );
  }

  return text;
}

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

  // Auto-slide setiap 7 detik
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="relative w-full h-[100svh] min-h-[640px] bg-[#0b0b0b] overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-8 lg:px-10">
          <div className="max-w-3xl w-full space-y-6 pt-20">
            <div className="h-4 w-40 bg-white/10 rounded-full animate-pulse" />
            <div className="h-14 sm:h-20 w-full bg-white/10 rounded-md animate-pulse" />
            <div className="h-14 sm:h-20 w-4/5 bg-white/10 rounded-md animate-pulse" />
            <div className="h-4 w-2/3 bg-white/5 rounded-full animate-pulse" />
            <div className="h-12 w-48 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[current];
  const goTo = (index) => setCurrent((index + slides.length) % slides.length);

  // Tombol tiap slide punya tujuan berbeda
  const slideCta = [
    { to: "/visi-misi", label: "Visi & Misi Kita" },
    { to: "/tournament", label: "Lihat Turnamen" },
    { to: "/atlet", label: "Kenali Atlet" },
  ];

  const cta = slideCta[current] || {
    to: "/tournament",
    label: "Lihat Turnamen",
  };

  const getImageUrl = (image) => {
    if (!image) return "/hero.jpg";
    if (image.startsWith("http")) return image;
    return `${BASE_URL}${image}`;
  };

  // Slide 3: paksa "Menuju Prestasi" turun ke baris kedua
  const renderTitle = () => {
    const phrases = SLIDE_TITLE_HIGHLIGHTS[current] || [];
    const title = slide.title;

    if (current === 2) {
      const match = title.match(/^(.*?)\s+(Menuju\b.*)$/i);
      if (match) {
        return (
          <>
            {highlightText(match[1], phrases, true)}
            <br />
            {highlightText(match[2], phrases, true)}
          </>
        );
      }
    }

    return highlightText(title, phrases, true);
  };

  return (
    <section className="relative w-full h-[100svh] min-h-[640px] max-h-[920px] overflow-hidden bg-[#0b0b0b]">
      {/* ---------- SLIDE BACKGROUND ---------- */}
      {slides.map((item, idx) => (
        <div
          key={item.idSlider || idx}
          className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
            idx === current ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
          aria-hidden={idx !== current}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center saturate-[1.12] brightness-[1.04] transition-transform duration-[7000ms] ease-out ${
              idx === current ? "scale-100" : "scale-105"
            }`}
            style={{ backgroundImage: `url(${getImageUrl(item.image)})` }}
          />
        </div>
      ))}

      {/* ---------- OVERLAY ---------- */}
      <div className="absolute inset-0 z-10 bg-black/[0.08]" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

      {/* ---------- CONTENT ---------- */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col justify-center pt-24 pb-24">
        <div
          key={current}
          className="max-w-4xl animate-[heroFadeUp_0.8s_ease-out_both]"
        >
          {/* Headline */}
          <h1 className="text-[2.25rem] leading-[1.12] sm:text-[2.75rem] lg:text-[3.5rem] xl:text-[4rem] font-semibold tracking-[-0.03em] text-white [text-shadow:0_2px_22px_rgba(0,0,0,0.55)]">
            {renderTitle()}
          </h1>

          {/* Subtext */}
          {slide.description && (
            <p className="mt-5 sm:mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-white/85 line-clamp-3 [text-shadow:0_1px_14px_rgba(0,0,0,0.7)]">
              {highlightText(slide.description, SLIDE_HIGHLIGHTS[current] || [])}
            </p>
          )}

          {/* CTA */}
          <div className="mt-8">
            <Link
              to={cta.to}
              className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/10 hover:bg-white/20 backdrop-blur-md px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300"
            >
              {cta.label}
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM BAR ---------- */}
      <div className="absolute bottom-0 inset-x-0 z-30 border-t border-white/20 bg-gradient-to-t from-black/40 to-transparent">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-4 flex items-center justify-between gap-4">
          {/* Scroll down */}
          <button
            onClick={() =>
              window.scrollTo({ top: window.innerHeight - 60, behavior: "smooth" })
            }
            className="group inline-flex items-center gap-3 text-sm font-medium text-white/90 hover:text-white transition-colors [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]"
          >
            <span>Scroll Down</span>
            <span className="w-9 h-9 rounded-full border border-white/40 group-hover:border-white flex items-center justify-center transition-colors">
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
          </button>

          {/* Slide controls */}
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="font-mono text-sm text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
              {pad(current + 1)}
              <span className="text-white/50"> / {pad(slides.length)}</span>
            </span>

            {slides.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goTo(current - 1)}
                  aria-label="Slide sebelumnya"
                  className="w-9 h-9 rounded-full border border-white/30 text-white/80 hover:border-white hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goTo(current + 1)}
                  aria-label="Slide berikutnya"
                  className="w-9 h-9 rounded-full border border-white/30 text-white/80 hover:border-white hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
