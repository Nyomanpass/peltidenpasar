import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data);
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
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Berita PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Berita Terbaru
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-md mt-1.5 opacity-90 hidden sm:block">
            Ikuti perkembangan PELTI Denpasar terbaru melalui berita pilihan kami.
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <section className="bg-gray-50 py-12 sm:py-16 min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentItems.length === 0 ? (
            <p className="text-center text-gray-500 text-sm sm:text-base py-10">
              Belum ada berita terbaru.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {currentItems.map((item) => (
                <article
                  key={item.idNews}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition duration-300 flex flex-col overflow-hidden"
                >
                  {/* GAMBAR BERITA */}
                  <div className="relative w-full overflow-hidden aspect-[16/10]">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* KONTEN BERITA */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <time className="text-[10px] sm:text-xs text-yellow-700 font-bold uppercase tracking-wider">
                      {item.tanggalUpload
                        ? new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </time>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-2 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 mt-2.5 flex-1 line-clamp-3 leading-relaxed">
                      {stripHtml(item.desc).length > 120
                        ? stripHtml(item.desc).slice(0, 120) + "..."
                        : stripHtml(item.desc)}
                    </p>

                    <Link
                      to={`/berita/${item.slug}`}
                      className="mt-4 inline-flex items-center text-xs sm:text-sm font-bold text-yellow-700 hover:text-yellow-800 transition group"
                    >
                      Baca Selengkapnya
                      <span className="ml-1 transform group-hover:translate-x-1 transition">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-3 mt-12">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-black shadow-sm"
                }`}
              >
                Prev
              </button>

              <span className="text-xs sm:text-sm text-gray-600 font-medium px-2">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-black shadow-sm"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}