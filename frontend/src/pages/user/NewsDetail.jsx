import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function NewsDetail() {
  const { idNews } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [newsLain, setNewsLain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idNews) {
      setError("ID news tidak ditemukan di URL");
      setLoading(false);
      return;
    }

    fetchNewsDetail();
    fetchNewsLain();
  }, [idNews]);

  const fetchNewsDetail = async () => {
    try {
      const res = await api.get(`/news/find/${idNews}`);
      setNews(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "News tidak ditemukan"
          : "Gagal mengambil data news"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsLain = async () => {
    try {
      const res = await api.get(`/news/get`);
      const others = res.data.filter(
        (n) => n.idNews !== parseInt(idNews)
      );
      setNewsLain(others.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="py-32 text-center text-gray-500">Memuat news...</div>;
  }

  if (error) {
    return (
      <div className="py-32 text-center text-red-500">
        {error}
        <br />
        <button
          onClick={() => navigate("/berita")}
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Kembali ke News
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
       <div className="relative mt-30 w-full h-[500px] sm:h-[300px] md:h-[300px] lg:h-[300px]">
          <img
            src="/hero.jpg"
            alt="Profil Pelti Denpasar"
            className="relative w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-10 md:px-20 lg:px-40 text-center text-white">
            <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-snug">
              Berita Terbaru
            </h2>
            <p className="max-w-md sm:max-w-2xl lg:max-w-4xl text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
              Ikuti perkembangan PELTI Denpasar terbaru melalui news yang telah kami pilih untuk Anda
            </p>
          </div>
        </div>


      <section className="bg-gray-50 pt-20 pb-16 px-15">
      
      
        {/* FULL WIDTH CONTAINER */}
        <div className="w-full h-full px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24">

          {/* Breadcrumb */}
          <div className="text-sm mb-6 text-gray-500">
            <Link to="/" className="hover:text-yellow-600">Home</Link> /{" "}
            <Link to="/berita" className="hover:text-yellow-600">Berita</Link> /{" "}
            <span className="text-gray-700 font-medium">Detail</span>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ===== MAIN CONTENT ===== */}
            <article className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6 sm:p-8">

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {news.title}
              </h1>

              <div className="mt-3 text-sm text-gray-500">
                <span className="mr-4">
                  {new Date(news.tanggalUpload).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>Oleh: {news.penulis || "Admin PELTI Denpasar"}</span>
              </div>

              {/* Image */}
              <div className="mt-6 w-full h-64 sm:h-80 md:h-[420px] rounded-xl overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: news.desc }}
              />
            </article>

            {/* ===== SIDEBAR ===== */}
            <aside className="lg:col-span-4 space-y-4">

              <h3 className="text-lg font-semibold text-gray-900">
                News Lainnya
              </h3>

              {newsLain.map((item) => (
                <Link
                  key={item.idNews}
                  to={`/news/${item.idNews}`}
                  className="flex gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-yellow-600 font-semibold">
                      {new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </aside>
          </div>
        </div>

        
      </section>

      <Footer />
    </>
  );
}
