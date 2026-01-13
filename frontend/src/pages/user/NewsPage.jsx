
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api"; 
import Bg1 from "../assets/background1.jpg";

export default function NewsPage() {
  const [beritaList, setBeritaList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    try {
      const res = await api.get("/berita/get");
      setBeritaList(res.data);
    } catch (err) {
      console.error("Gagal fetch berita:", err);
    }
  };

  const totalPages = Math.ceil(beritaList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = beritaList.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section className="relative pb-16 bg-gray-50">
      {/* ===== Header ===== */}
       <div className="relative w-full h-[500px] sm:h-[300] md:h-[300px] lg:h-[300px] mb-20">
                   {/* Background */}
                   <img
                     src={Bg1}
                     alt="Profil Pelti Denpasar"
                     className="relative w-full h-full object-cover"
                   />
           
                   {/* Overlay */}
                   <div className="absolute inset-0 bg-black/60"></div>
           
                   {/* Text Content */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-10 md:px-20 lg:px-40 text-center text-white">
                     <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-snug">
                       Berita Terbaru
                     </h2>
                     <p className="max-w-md sm:max-w-2xl lg:max-w-4xl text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
                          Ikuti perkembangan PELTI Denpasar terbaru melalui berita yang telah kami pilih untuk Anda
                     </p>
                   </div>
                 </div>

      {/* ===== Grid Berita ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((item) => (
          <div
            key={item.idBerita}
            className="bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden transition-all duration-300 flex flex-col"
          >
            <div className="relative w-full h-48">
              <img
                src={item.image || "/placeholder.png"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex flex-col flex-1">
              <p className="text-xs sm:text-sm text-yellow-600 font-semibold">
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
                {item.desc.length > 100 ? item.desc.slice(0, 100) + "..." : item.desc}
              </p>

              <Link
                to={`/berita/${item.idBerita}`}
                className="mt-4 inline-block text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition"
              >
                Baca Selengkapnya →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Pagination ===== */}
      <div className="flex justify-center items-center gap-4 mt-12">
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
  );
}
