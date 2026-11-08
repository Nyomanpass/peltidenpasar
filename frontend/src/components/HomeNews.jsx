import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import api from "../api";

export default function HomeNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5004";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get("/news/get");
        setNews(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil data berita:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || news.length === 0) return null;

  const [featured, ...rest] = news;
  const sideNews = rest.slice(0, 3);
  const moreNews = rest.slice(3, 6);

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  };

  const getImageUrl = (rawImage) => {
    const fallback =
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200";

    if (!rawImage || rawImage.trim() === "") return fallback;
    if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
      return rawImage;
    }
    const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
    return `${BASE_URL}${cleanPath}`;
  };

  const formatDate = (value, withYear = true) => {
    if (!value) return "Terbaru";
    const date = new Date(value);
    if (isNaN(date)) return "Terbaru";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      ...(withYear ? { year: "numeric" } : {}),
    });
  };

  const articlePath = (item) => `/berita/${item.slug || item.idNews}`;

  return (
    <section className="pt-2 sm:pt-4 pb-12 sm:pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MASTHEAD */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-yellow-600 mb-1.5 sm:mb-2">
            PELTI DENPASAR
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Berita Terbaru
          </h2>
        </div>

        {/* UTAMA: BERITA PILIHAN + DAFTAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* BERITA UTAMA */}
          <article className="lg:col-span-7">
            <Link to={articlePath(featured)} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={getImageUrl(featured.image)}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  loading="eager"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
              </div>

              <div className="pt-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  <time>{formatDate(featured.tanggalUpload || featured.createdAt)}</time>
                </div>

                <h3 className="mt-3 text-2xl sm:text-3xl lg:text-[2.15rem] font-black leading-[1.12] tracking-tight text-gray-900 transition-colors group-hover:text-yellow-600">
                  {featured.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600 line-clamp-3">
                  {stripHtml(featured.desc || featured.content)}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-900 transition-colors group-hover:text-yellow-600">
                  Baca Artikel
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </article>

          {/* DAFTAR BERITA */}
          {sideNews.length > 0 && (
            <aside className="lg:col-span-5 lg:pl-6 xl:lg:pl-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gray-400 mb-2">
                Berita Lainnya
              </p>

              <div className="divide-y divide-gray-200">
                {sideNews.map((item, index) => (
                  <Link
                    key={item.idNews || item.slug || index}
                    to={articlePath(item)}
                    className="group flex items-center gap-4 py-5 first:pt-4"
                  >
                    <div className="w-24 sm:w-28 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                        <time>{formatDate(item.tanggalUpload || item.createdAt, false)}</time>
                      </div>

                      <h4 className="mt-1.5 text-[15px] sm:text-base font-bold leading-snug text-gray-900 line-clamp-3 transition-colors group-hover:text-yellow-600">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to="/berita"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-900 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-gray-900 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-all duration-300 group"
              >
                Semua Berita
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </aside>
          )}
        </div>

        {/* BERITA TAMBAHAN */}
        {moreNews.length > 0 && (
          <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {moreNews.map((item, index) => (
                <Link
                  key={item.idNews || item.slug || index}
                  to={articlePath(item)}
                  className="group flex items-start gap-4"
                >
                  <div className="w-20 sm:w-24 shrink-0 aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=400";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <time className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {formatDate(item.tanggalUpload || item.createdAt, false)}
                    </time>
                    <h4 className="mt-1 text-sm font-bold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-yellow-600">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
