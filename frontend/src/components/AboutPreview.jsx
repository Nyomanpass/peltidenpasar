import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Quote } from "lucide-react";

const visi =
  "Menjadi organisasi PELTI yang terkemuka di Indonesia, khususnya dalam pengembangan dan pembinaan tenis lapangan di Kota Denpasar.";

const misi = [
  "Membentuk manusia yang sehat dalam rangka mendukung pembangunan bangsa dan Negara Indonesia serta memupuk persahabatan antar PELTI melalui olahraga tenis lapangan.",
  "Membentuk anggota agar memiliki rasa kepemilikan dan kecintaan terhadap PELTI Pengurus Kota Denpasar demi kemajuan bersama.",
];

export default function AboutPreview() {
  return (
    <section className="mt-6 sm:mt-10 py-10 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* KOLOM KIRI — TEKS */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Tentang{" "}
              <span className="relative inline-block">
                <span className="relative z-10">PELTI Denpasar</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-yellow-400/40 -z-0 rounded" />
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-base text-gray-600 leading-relaxed">
              Persatuan Lawn Tenis Indonesia (PELTI) Kota Denpasar berdedikasi
              memajukan olahraga tenis lapangan melalui pembinaan atlet, klub,
              dan komunitas. Kami menjadi rumah bagi para pecinta tenis di ibu
              kota Bali untuk tumbuh, berprestasi, dan menjunjung sportivitas.
            </p>

            {/* Kotak Visi */}
            <div className="mt-7 relative rounded-2xl sm:rounded-3xl bg-gray-900 p-5 sm:p-7 shadow-lg overflow-hidden">
              <Quote className="absolute -top-2 -right-2 w-20 h-20 text-yellow-500/10" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-yellow-400">
                  Visi Kami
                </h3>
              </div>
              <p className="relative text-sm sm:text-base text-gray-100 leading-relaxed italic">
                "{visi}"
              </p>
            </div>

            {/* Misi */}
            <div className="mt-7">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-900 mb-3">
                Misi Kami
              </h3>
              <ul className="space-y-3">
                {misi.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-[13px] sm:text-sm text-gray-600 leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/visi-misi"
              className="mt-7 sm:mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-gray-900 px-6 py-3 sm:py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-gray-900 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-all duration-300 group"
            >
              Selengkapnya
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* KOLOM KANAN — GAMBAR (desktop only) */}
          <div className="relative hidden lg:block">
            {/* Aksen kuning di belakang gambar */}
            <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-full h-full rounded-3xl border-4 border-yellow-500/60" />
            <div className="absolute -bottom-5 -right-5 w-32 h-32 rounded-full bg-yellow-500/20 blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <img
                src="/hero.jpg"
                alt="Atlet tenis PELTI Denpasar"
                className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/about.webp";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
