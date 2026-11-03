import React, { useEffect, useState } from "react";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import api from "../api";

export default function HomeNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5004";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get("/news/get");
        console.log("Data berita dari backend:", res.data); // Cek data di Console browser (F12)
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

  const displayedNews = news.slice(0, 3);

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 text-xs font-bold uppercase tracking-widest mb-3">
              <Newspaper className="w-4 h-4 text-yellow-600" />
              Warta & Informasi Resmi
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Berita Terbaru
            </h2>
          </div>
          <a
            href="/berita"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-yellow-600 transition-colors group"
          >
            <span>Lihat Semua Berita</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Grid 3 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((item, index) => {
            const rawImage = item.image;
            
            // Log untuk melihat path gambar per item berita di Console
            console.log(`Berita "${item.title}" - image field:`, rawImage);

            let imageUrl = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600';
            if (rawImage && rawImage.trim() !== "") {
              if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
                imageUrl = rawImage;
              } else {
                const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
                imageUrl = `${BASE_URL}${cleanPath}`;
              }
            }

            return (
              <article
                key={item.idNews || index}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 flex flex-col overflow-hidden justify-between"
              >
                <div>
                  {/* Gambar Berita */}
                  <div className="relative w-full overflow-hidden aspect-[16/10] bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        console.error(`Gagal memuat gambar dari URL: ${imageUrl}`);
                        e.target.src = 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600';
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Konten Berita */}
                  <div className="p-6 sm:p-7 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-yellow-700 font-bold mb-3 bg-yellow-50 px-3 py-1 rounded-full w-fit border border-yellow-200/60">
                      <Calendar className="w-3.5 h-3.5 text-yellow-600" />
                      <time>
                        {item.tanggalUpload || item.createdAt
                          ? new Date(item.tanggalUpload || item.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Terbaru"}
                      </time>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-500 mt-3 line-clamp-3 leading-relaxed">
                      {stripHtml(item.desc || item.content)}
                    </p>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="px-6 pb-7 pt-0">
                  <a
                    href={`/berita/${item.slug || item.idNews}`}
                    className="inline-flex items-center justify-between text-xs sm:text-sm font-extrabold text-black group-hover:text-yellow-600 transition-colors bg-yellow-400/20 hover:bg-yellow-400/40 px-4 py-3 rounded-2xl w-full"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}