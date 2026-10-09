import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [newsLain, setNewsLain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNewsDetail = useCallback(async () => {
    try {
      const res = await api.get(`/news/slug/${slug}`);
      setNews(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Berita tidak ditemukan"
          : "Gagal mengambil data berita"
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchNewsLain = useCallback(async () => {
    try {
      const res = await api.get(`/news/get`);
      const others = res.data.filter((n) => n.slug !== slug);
      setNewsLain(others.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setError("Slug berita tidak ditemukan di URL");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchNewsDetail();
    fetchNewsLain();
  }, [slug, fetchNewsDetail, fetchNewsLain]);

  if (loading) {
    return (
      <div className="py-32 text-center text-gray-500 font-medium">
        Memuat berita...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-32 text-center text-red-500 font-medium">
        {error}
        <br />
        <button
          onClick={() => navigate("/berita")}
          className="mt-4 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl shadow-sm transition"
        >
          Kembali ke Berita
        </button>
      </div>
    );
  }

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
            Detail Berita
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-md mt-1.5 opacity-90 hidden sm:block">
            Informasi dan publikasi resmi seputar kejuaraan dan kegiatan PELTI Denpasar.
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* CONTENT */}
      <section className="bg-gray-50 py-10 sm:py-16 min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-xs sm:text-sm mb-6 text-gray-500 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-yellow-600 transition">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/berita" className="hover:text-yellow-600 transition">
              Berita
            </Link>{" "}
            /{" "}
            <span className="text-gray-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {news?.title}
            </span>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* MAIN ARTICLE */}
            <article className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {news?.title}
              </h1>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 border-b border-gray-100 pb-4">
                <span>
                  {news?.tanggalUpload
                    ? new Date(news.tanggalUpload).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </span>
                <span>•</span>
                <span>Oleh: {news?.penulis || "Admin PELTI Denpasar"}</span>
              </div>

              {news?.image && (
                <div className="mt-6 w-full h-60 sm:h-80 md:h-[400px] rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mt-6 text-gray-800 leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: news?.desc || "" }}
              />
            </article>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Berita Lainnya
              </h3>

              {newsLain.map((item) => (
                <Link
                  key={item.idNews}
                  to={`/berita/${item.slug}`}
                  className="flex gap-3 bg-white p-3.5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 hover:border-yellow-300 transition-all duration-200"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <p className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">
                      {item.tanggalUpload
                        ? new Date(item.tanggalUpload).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 mt-1 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}

              {newsLain.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  Tidak ada berita lainnya.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}