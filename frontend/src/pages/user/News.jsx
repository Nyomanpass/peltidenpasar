import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5004";

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data || []);
    } catch (err) {
      console.error("Gagal fetch news:", err);
    }
  };

  const totalPages = Math.ceil(newsList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = newsList.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[250px] sm:min-h-[280px] max-h-[450px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Berita PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-12 sm:pt-14 px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Berita Terbaru
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-md mt-1.5 opacity-90 hidden sm:block">
            Ikuti perkembangan dan informasi resmi PELTI Denpasar melalui warta pilihan kami.
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-white py-16 sm:py-24 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Penjelas Kecil */}
          <div className="flex items-center gap-2 mb-8">
            <span className="p-2 bg-yellow-500/10 text-yellow-600 rounded-xl">
              <Newspaper className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Arsip Warta & Kegiatan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Menampilkan seluruh informasi terkini seputar dunia tenis Denpasar.
              </p>
            </div>
          </div>

          {currentItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-sm sm:text-base">
                Belum ada berita terbaru yang dipublikasikan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((item) => {
                const imageUrl = item.image 
                  ? (item.image.startsWith('http') ? item.image : `${BASE_URL}/${item.image}`)
                  : '/placeholder.png';

                return (
                  <article
                    key={item.idNews}
                    className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col overflow-hidden justify-between"
                  >
                    <div>
                      {/* GAMBAR BERITA DENGAN ZOOM EFFECT */}
                      <div className="relative w-full overflow-hidden aspect-[16/10] bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>

                      {/* KONTEN BERITA */}
                      <div className="p-6 sm:p-7 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-yellow-700 font-bold mb-3">
                          <Calendar className="w-4 h-4 text-yellow-600" />
                          <time>
                            {item.tanggalUpload
                              ? new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </time>
                        </div>

                        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 mt-3 line-clamp-3 leading-relaxed">
                          {stripHtml(item.desc)}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-7 pt-0">
                      <Link
                        to={`/berita/${item.slug}`}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-black group-hover:text-yellow-600 transition-colors bg-yellow-400/20 hover:bg-yellow-400/40 px-4 py-2.5 rounded-xl w-full justify-between"
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-4 mt-16 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-400 text-black shadow-md hover:scale-105"
                }`}
              >
                ← Sebelumnya
              </button>

              <span className="text-xs sm:text-sm text-gray-600 font-bold">
                Hal {currentPage} / {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-400 text-black shadow-md hover:scale-105"
                }`}
              >
                Berikutnya →
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}