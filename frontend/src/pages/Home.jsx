// import LandingPageLayout from "../layouts/LandingPageLayout";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Bg1 from "../assets/background1.jpg";

import { Pagination, Autoplay } from "swiper/modules";

export default function Home() {
    const newsData = [
    {
      title: 'Pelantikan Kepengurusan Pelti',
      date: '9 Juni 2025',
      image: Bg1,
      desc: "Pelantikan kepengurusan baru Pelti Denpasar periode 2025 berlangsung khidmat dengan semangat sportivitas."
    },
    {
      title: 'Turnamen Walikota Cup',
      date: '15 Juni 2025',
      image: Bg1,
      desc: "Ajang bergengsi Walikota Cup resmi dibuka, diikuti oleh puluhan klub dari berbagai kategori usia."
    },
    {
      title: 'Pelatihan Wasit & Pelatih',
      date: '20 Juni 2025',
      image: Bg1,
      desc: "Kegiatan pelatihan untuk meningkatkan kualitas wasit dan pelatih tenis di Denpasar."
    },
  ];

  const pengumuman = [
    {
      id: 1,
      title: "Juara Walikota Cup",
      kategori: "KU Putra 8 - 16",
      desc: "Berikut adalah daftar juara walikota cup KU Putra 8 - 16",
      link: "https://drive.google.com",
      contact: "081234567890"
    },
    {
      id: 2,
      title: "Juara Walikota Cup",
      kategori: "KU Putra 17 - 20",
      desc: "Berikut adalah daftar juara walikota cup KU Putra 17 - 20",
      link: "https://drive.google.com",
      contact: "081987654321"
    },
    {
      id: 3,
      title: "Juara Walikota Cup",
      kategori: "KU Putri 8 - 16",
      desc: "Berikut adalah daftar juara walikota cup KU Putri 8 - 16",
      link: "https://drive.google.com",
      contact: "085678912345"
    },
    {
      id: 4,
      title: "Juara Walikota Cup",
      kategori: "KU Putri 17 - 20",
      desc: "Berikut adalah daftar juara walikota cup KU Putri 17 - 20",
      link: "https://drive.google.com",
      contact: "089876543210"
    },
  ];


  const struktur = [
    { nama: "Nyoman Pastika", jabatan: "Ketua" },
    { nama: "Kadek Dwi", jabatan: "Wakil Ketua I" },
    { nama: "Agus Dwiyana", jabatan: "Wakil Ketua II" },
  ];

  const lainnya = [
    "Divisi Pembinaan",
    "Divisi Humas dan Media",
    "Divisi Sarana dan Prasarana",
    "Divisi Keuangan dan Kegiatan",
    "dll",
  ];

  const slides = [
    {
      img: Bg1,
      title: "Walikota Cup 2025",
      desc: "Discover an unparalleled journey filled with adventure",
    },
    {
      img: Bg1,
      title: "Turnamen Sepak Bola",
      desc: "Spirit sportivitas & persahabatan",
    },
    {
      img: Bg1,
      title: "Denpasar Sport Event",
      desc: "Ayo dukung tim favoritmu!",
    },
  ];

  return (
    <div className="w-full">
      {/* ===== Slider Section ===== */}
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-[400px]"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full h-[400px]">
              {/* Background Image */}
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60"></div>

              {/* Text */}
              <div className="absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-10 md:px-20 lg:px-40 text-white">
                <p className="text-xs sm:text-sm md:text-base mb-2 md:mb-4">
                  {slide.desc}
                </p>
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">
                  {slide.title}
                </h2>
                <button className="mt-4 md:mt-6 px-3 md:px-4 py-1.5 md:py-2 bg-yellow-500 text-black rounded-lg text-xs sm:text-sm md:text-base">
                  Explore →
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* ===== Struktur Organisasi Section ===== */}
      <section className="py-12 h-[500px] bg-white flex flex-col justify-center">
        {/* Judul */}
        <div className="text-center mb-10">
          <h3 className="text-sm text-gray-500 tracking-wide">PELTI DENPASAR</h3>
          <h2 className="text-xl md:text-3xl font-semibold">Struktur Organisasi</h2>
        </div>

        {/* Flex Container */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-4 sm:px-10 md:px-20">
          {/* Kartu Ketua & Wakil */}
          {struktur.map((item, i) => (
            <div
              key={i}
              className="shadow-sm bg-gradient-to-b from-yellow-400 to-white flex items-end aspect-[2/3] w-[120px] sm:w-[140px] md:w-[160px]"
            >
              <div className="p-3 text-center w-full">
                <p className="font-medium text-xs sm:text-sm">{item.nama}</p>
                <p className="text-[10px] sm:text-xs text-gray-700">{item.jabatan}</p>
              </div>
            </div>
          ))}

          {/* Kartu Lainnya */}
          <div className="shadow-sm bg-white flex flex-col aspect-[2/3] w-[120px] sm:w-[200px] md:w-[160px]">
            <h4 className="bg-yellow-400 px-3 py-2 text-[10px] sm:text-[11px] md:text-sm font-medium">
              Kepengurusan Lainnya
            </h4>
            <ul className="text-[9px] sm:text-[10px] md:text-xs list-disc list-inside space-y-1 text-gray-700 p-3">
              {lainnya.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Link Selengkapnya */}
        <div className="text-center mt-8">
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-yellow-600 underline transition"
          >
            Lihat Selengkapnya
          </a>
        </div>
      </section>

      {/* Pengumuman Section */}
      <section className="relative py-16 h-[400]">
        {/* Background dengan overlay */}
        <img
          src={Bg1}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-yellow-500 opacity-95"></div>

        {/* Konten */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
          <h3 className="text-sm text-black tracking-wide">PELTI DENPASAR</h3>
          <h2 className="text-2xl text-black md:text-3xl font-semibold mb-10">Pengumuman</h2>

          {/* Flex Cards */}
          <div className="flex flex-wrap justify-center gap-6">
            {pengumuman.map((item) => (
              <div
                key={item.id}
                className="bg-white text-black shadow-md w-[220px] h-65 space-y-2 overflow-hidden flex flex-col"
              >
                <div className="bg-black text-white px-4 py-2 text-sm font-semibold">
                  {item.title} <br /> {item.kategori}
                </div>
                <div className="p-4 text-left text-sm flex-1">
                  <p className="mb-2">{item.desc}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-xs hover:underline block mb-2"
                  >
                    {item.link}
                  </a>
                  <div className="text-xs text-gray-600">📞 Contact Person</div>
                  <p className="text-[11px] font-mono">{item.contact}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Link Selengkapnya */}
          <div className="text-center mt-8">
            <a
              href="#"
              className="text-sm text-black hover:text-yellow-400 underline transition"
            >
              Lihat Selengkapnya
            </a>
          </div>
        </div>
      </section>
      
            {/* ===== News Section ===== */}
      <section className="py-16 bg-white">
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-sm text-black tracking-wide">PELTI DENPASAR</h3>
          <h2 className="text-2xl text-black md:text-3xl font-semibold mb-10">Berita Terbaru</h2>
        </div>

        <div className="flex justify-center flex-wrap gap-6">
          {newsData.map((card, index) => (
            <div
              key={index}
              className="w-64 bg-white shadow-md rounded-md overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Header Card */}
              <div className="bg-yellow-400 p-3 text-black font-semibold text-sm">
                {card.title}
              </div>

              {/* Gambar */}
              <div className="relative w-full h-40">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                  {card.date}
                </div>
              </div>

              {/* Deskripsi */}
              <div className="p-4 text-left text-xs text-gray-700 flex-1">
                <p>{card.desc}</p>
              </div>

              {/* Link Selengkapnya */}
              <div className="p-3 text-left">
                <a
                  href="#"
                  className="text-blue-500 text-sm font-semibold hover:underline"
                >
                  View More →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Link Selengkapnya */}
        <div className="mt-10 pb-5 text-center">
          <a href="#" className="text-sm text-black hover:text-yellow-400 underline transition">
            Lihat Selengkapnya
          </a>
        </div>
      </section>

    </div>
  );
}