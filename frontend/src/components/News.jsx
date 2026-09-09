import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [maxNews, setMaxNews] = useState(3);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ===== Fetch News ===== */
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data || []);
    } catch (err) {
      console.error("Gagal fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===== Handle Resize ===== */
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width >= 1536) {
        setMaxNews(8);
      } else {
        setMaxNews(3);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayedNews = newsList.slice(0, maxNews);

  const getGridCols = () => {
    if (maxNews === 8) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  // Helper untuk membersihkan HTML & menangani spasi menggantung
  const stripHtml = (html) => {
    if (!html) return "";
    const cleanText = html.replace(/&nbsp;/g, " ");
    const div = document.createElement("div");
    div.innerHTML = cleanText;
    return div.textContent || div.innerText || "";
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 font-medium">
        Memuat berita...
      </div>
    );
  }

  if (newsList.length === 0) return null;

  return (
    <section className="w-full py-12 bg-white">
      {/* ===== Header ===== */}
      <header className="text-center mb-10">
        <p className="text-xs sm:text-sm font-bold text-yellow-600 tracking-widest uppercase">
          PELTI DENPASAR
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-2 tracking-tight">
          Berita Terbaru
        </h2>
        <div className="w-12 h-1 bg-yellow-600 mx-auto mt-4 rounded-full"></div>
      </header>

      {/* ===== Grid Berita ===== */}
      <div className="px-4 sm:px-10 lg:px-20 max-w-7xl mx-auto">
        <div className={`grid gap-6 md:gap-8 ${getGridCols()}`}>
          {displayedNews.map((b) => (
            <article
              key={b.idNews || b.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Gambar */}
              <div className="relative w-full overflow-hidden aspect-[16/10] bg-gray-100">
                <img
                  src={b.image || "/placeholder.png"}
                  alt={b.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Konten */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <time className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                    {b.tanggalUpload
                      ? new Date(b.tanggalUpload).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </time>

                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mt-2 line-clamp-2 leading-snug group-hover:text-yellow-600 transition-colors">
                    {b.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-3 leading-relaxed">
                    {stripHtml(b.desc)}
                  </p>
                </div>

                {/* Tombol Baca */}
                <button
                  onClick={() => navigate(`/berita/${b.slug}`)}
                  className="mt-6 inline-flex items-center text-sm font-bold text-yellow-600 hover:text-yellow-700 transition-colors group/btn"
                >
                  Baca Selengkapnya
                  <span className="ml-1.5 transform group-hover/btn:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ===== Lihat Semua Berita CTA ===== */}
      <div className="mt-12 text-center">
        <button
          onClick={() => navigate("/berita")}
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:border-yellow-600 rounded-full text-sm font-bold text-gray-700 hover:text-yellow-600 bg-white hover:bg-yellow-50 transition-all duration-300 shadow-sm"
        >
          Lihat Selengkapnya
        </button>
      </div>
    </section>
  );
}