import React, { useState, useEffect } from "react";

const newsItems = [
  { id: 1, title: "Berita 1", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: 2, title: "Berita 2", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 2" },
  { id: 3, title: "Berita 3", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 3" },
  { id: 4, title: "Berita 4", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 4" },
  { id: 5, title: "Berita 5", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 5" },
  { id: 6, title: "Berita 6", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 6" },
  { id: 7, title: "Berita 7", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 7" },
  { id: 8, title: "Berita 8", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 8" },
  { id: 9, title: "Berita 9", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 9" },
  { id: 10, title: "Berita 10", image: "hero.jpg", dateUploaded: "2024-05-10", desc: "Deskripsi 10" },
];

export default function News() {
  const [maxNews, setMaxNews] = useState(3);

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

  const displayedNews = newsItems.slice(0, maxNews);

  const getGridCols = () => {
    if (maxNews === 8) return "grid-cols-1 sm:grid-cols-1 xl:grid-cols-4";
    if (maxNews === 3) return "grid-cols-1 sm:grid-cols-1 lg:grid-cols-3";
    return "grid-cols-1";
  };

  return (
    <section className="w-full py-8 sm:py-12 bg-gray-50">
      {/* Header - dengan padding */}
      <header className="text-center mb-8 sm:mb-12 px-4 sm:px-6 md:px-8 lg:px-12">
        <p className="text-sm md:text-base text-yellow-600 font-medium tracking-wide uppercase">
          PELTI DENPASAR
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2">
          Berita Terbaru
        </h2>
      </header>

      {/* Grid Berita - NO padding di mobile */}
      <div className="sm:px-6 md:px-8 lg:px-12">
        <div className={`grid gap-0 sm:gap-8 md:gap-10 ${getGridCols()}`}>
          {displayedNews.map((b) => (
            <article
              key={b.id}
              className="bg-white shadow-sm sm:shadow-md sm:rounded-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 mb-3 sm:mb-0"
              tabIndex={0}
            >
                {/* Gambar */}
                <div className="relative w-full overflow-hidden aspect-[16/10]">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Konten */}
                <div className="p-6 flex flex-col flex-1">
                  <time className="text-xs md:text-sm text-yellow-600 font-semibold uppercase tracking-wide">
                    {b.dateUploaded
                      ? new Date(b.dateUploaded).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </time>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mt-2 line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 mt-3 flex-1 line-clamp-3">
                    {b.desc}
                  </p>
                  <button
                    onClick={() => alert(`Navigasi ke berita ID: ${b.id}`)}
                    className="mt-5 inline-flex items-center justify-start text-sm md:text-base font-semibold text-yellow-600 hover:text-yellow-700 transition-colors group"
                  >
                    Baca Selengkapnya
                    <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

      {/* Lihat Selengkapnya */}
      <div className="mt-8 sm:mt-12 text-center px-4 sm:px-6 md:px-8 lg:px-12">
        <button
          onClick={() => alert("Navigasi ke halaman berita")}
          className="text-sm md:text-base text-gray-600 hover:text-yellow-600 underline underline-offset-4 transition-colors"
        >
          Lihat Selengkapnya
        </button>
      </div>
    </section>
  );
}