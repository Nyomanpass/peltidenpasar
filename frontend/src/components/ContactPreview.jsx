import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.413230801631!2d115.1920860746113!3d-8.652190341394816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd240aa3d7071f3%3A0xc8dc2db3234d6bb5!2sStadion%20Kompyang%20Sujana!5e0!3m2!1sid!2sid!4v1769075076344!5m2!1sid!2sid";

export default function ContactPreview() {
  return (
    <section className="py-10 sm:py-16 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-yellow-600 mb-1.5 sm:mb-2">
            PELTI DENPASAR
          </p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Temukan Kami
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base text-gray-500 max-w-xl mx-auto">
            Kunjungi sekretariat kami atau hubungi melalui kontak resmi pengurus
            PELTI Kota Denpasar.
          </p>
        </div>

        {/* Bento Grid Informasi Kontak & Peta */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {/* KIRI — INFORMASI KONTAK (Modern Bento Card) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-3 sm:gap-5">
            {/* CARD 1: ALAMAT LENGKAP */}
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-7 shadow-xs hover:shadow-md hover:border-yellow-400/80 transition-all duration-300">
              <div className="flex items-start gap-3.5 sm:gap-5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Sekretariat & Lapangan
                  </span>
                  <h3 className="mt-1 text-sm sm:text-lg font-bold text-gray-900 leading-snug">
                    Jl. Gunung Agung No. 12, Denpasar, Bali
                  </h3>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                    Stadion Kompyang Sujana, Kota Denpasar
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2 & 3: TELEPON & EMAIL (2 Kolom Berdampingan di Tablet/Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              {/* Telepon */}
              <a
                href="tel:+62361777888"
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-yellow-400/80 transition-all duration-300 flex flex-row sm:flex-col items-center sm:items-start justify-between gap-3"
              >
                <div className="flex items-center sm:block gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 sm:mt-4">
                      Telepon
                    </span>
                    <p className="mt-0.5 sm:mt-1 text-sm sm:text-base font-bold text-gray-900 group-hover:text-yellow-600 transition-colors truncate">
                      (0361) 777-888
                    </p>
                  </div>
                </div>
                <div className="mt-0 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-yellow-600 transition-colors shrink-0">
                  <span className="hidden sm:inline">Hubungi</span>
                  <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:sekretariat@peltidenpasar.org"
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs hover:shadow-md hover:border-yellow-400/80 transition-all duration-300 flex flex-row sm:flex-col items-center sm:items-start justify-between gap-3"
              >
                <div className="flex items-center sm:block gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 sm:mt-4">
                      Email Resmi
                    </span>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-bold text-gray-900 break-all sm:break-words group-hover:text-yellow-600 transition-colors truncate sm:whitespace-normal">
                      sekretariat@peltidenpasar.org
                    </p>
                  </div>
                </div>
                <div className="mt-0 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-yellow-600 transition-colors shrink-0">
                  <span className="hidden sm:inline">Kirim email</span>
                  <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            </div>

            {/* CARD 4: JAM OPERASIONAL & CTA */}
            <div className="rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Jam Operasional
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    Senin – Jumat, 09.00 – 17.00 WITA
                  </p>
                </div>
              </div>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gray-900 px-6 py-3 sm:py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-gray-900 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-all duration-300 group shrink-0"
              >
                <span>Hubungi Kami</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* KANAN — PETA INTERAKTIF */}
          <div className="lg:col-span-6 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm h-[260px] sm:h-auto sm:min-h-[440px] bg-gray-100">
            <iframe
              src={MAP_SRC}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Stadion Kompyang Sujana - PELTI Denpasar"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
