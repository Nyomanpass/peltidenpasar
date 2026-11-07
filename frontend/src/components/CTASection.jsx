import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative w-full overflow-hidden select-none">
      {/* ================= FOTO LAPANGAN ASLI (OTOMATIS SESUAI PROPORSI GAMBAR) ================= */}
      <img
        src="/lap.jpg"
        alt="Lapangan Tenis PELTI Denpasar"
        className="block h-[340px] w-full object-cover object-center sm:h-auto"
        loading="lazy"
      />

      {/* Overlay tipis agar teks dan tombol semakin kontras & tajam */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      {/* Overlay tambahan khusus mobile agar teks tetap terbaca di atas foto */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/40 sm:hidden" />

      {/* ================= KONTEN TEKS & TOMBOL AJAKAN ================= */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        {/* JUDUL DIBAGI MENJADI 2 BARIS */}
        <div className="flex flex-col items-center justify-center">
          {/* BARIS 1: "Siap turun" */}
          <div className="flex items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4">
            <span className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.03em] text-amber-300 leading-[0.95] [text-shadow:0_3px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.9)]">
              Siap
            </span>
            <span className="font-script text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.8] px-1 sm:px-2 -rotate-6 select-none [text-shadow:0_3px_18px_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.9)]">
              turun
            </span>
          </div>

          {/* BARIS 2: "ke Lapangan?" */}
          <div className="flex items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 -mt-1 sm:-mt-2 md:-mt-3">
            <span className="font-script text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.8] px-1 sm:px-2 -rotate-6 select-none [text-shadow:0_3px_18px_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.9)]">
              ke
            </span>
            <span className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-[-0.03em] text-amber-300 leading-[0.95] [text-shadow:0_3px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.9)]">
              Lapangan?
            </span>
          </div>
        </div>

        {/* TOMBOL AKSI (SESUAI GAYA TOMBOL PIL REFERENSI) */}
        <div className="mt-4 sm:mt-4 md:mt-6 lg:mt-7">
          <Link
            to="/tournament"
            className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 sm:px-7 py-2.5 sm:py-2.5 text-[13px] sm:text-sm font-semibold text-white transition-colors duration-300"
          >
            <span>Ikuti Turnamen</span>
            <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Subteks / Alternatif Kontak */}
        <p className="mt-3 sm:mt-3 text-[11px] sm:text-xs font-medium tracking-wide text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
          Atau ingin bergabung dengan klub & pembinaan?{" "}
          <Link
            to="/contact"
            className="block sm:inline text-amber-300 underline underline-offset-4 hover:text-white transition-colors font-bold"
          >
            Hubungi Kami
          </Link>
        </p>
      </div>
    </section>
  );
}
