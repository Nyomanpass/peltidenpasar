// src/pages/News.jsx
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

  return (
    <>
      <Navbar />

      <section className="relative pb-16 bg-gray-50">
        {/* Header */}
        
        <div className="relative w-full h-[300px] mt-30 mb-16">
        <img
          src="/hero.jpg"
          alt="Visi dan Misi Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
             Berita Terbaru
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
        Ikuti perkembangan PELTI Denpasar terbaru melalui news yang telah
              kami pilih untuk Anda
          </p>
        </div>
      </div>

        {/* Grid Berita */}
        <div className="px-4 sm:px-6 lg:px-24 xl:px-40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {currentItems.map((item) => (
              <div
                key={item.idNews}
                className="bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Gambar */}
                <div className="relative w-full overflow-hidden aspect-[16/10]">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Konten */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-yellow-600 font-semibold">
                    {item.tanggalUpload
                      ? new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </p>

                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-1 hover:text-yellow-600 transition">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3 flex-1">
                    {item.desc.length > 100
                      ? item.desc.slice(0, 100) + "..."
                      : item.desc}
                  </p>

                  <Link
                    to={`/berita/${item.idNews}`}
                    className="mt-4 inline-block text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition"
                  >
                    Baca Selengkapnya →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-12 px-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            Prev
          </button>

          <span className="text-sm font-medium text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}
