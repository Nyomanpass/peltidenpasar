import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";

export default function Club() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  // FETCH CLUB
  const fetchClubs = async () => {
    try {
      const res = await api.get("/club/get");
      setClubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Club PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Kolektif Club
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-md mt-1.5 opacity-90 hidden sm:block">
            Berikut adalah daftar Club tenis yang tergabung secara resmi bersama PELTI Denpasar.
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <section className="bg-gray-50 py-12 sm:py-16 min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {clubs.length === 0 ? (
            <p className="text-center text-gray-500 text-sm sm:text-base py-10">
              Belum ada data club.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
              {clubs.map((c) => (
                <div
                  key={c.idClub}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 flex flex-col items-center text-center p-5"
                >
                  {/* LOGO */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 overflow-hidden mb-3 border border-gray-100 shrink-0">
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-gray-400 font-medium">
                        No Logo
                      </div>
                    )}
                  </div>

                  {/* NAME */}
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug">
                    {c.name}
                  </h4>

                  {/* BUTTON */}
                  <button
                    onClick={() => setSelectedClub(c)}
                    className="mt-3 text-[11px] sm:text-xs text-yellow-700 hover:text-yellow-800 font-semibold underline underline-offset-2"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL DETAIL */}
      {selectedClub && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedClub(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedClub(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition"
            >
              ✕
            </button>

            {/* LOGO */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 overflow-hidden border-2 border-yellow-400 shadow-sm">
                {selectedClub.photo ? (
                  <img
                    src={selectedClub.photo}
                    alt={selectedClub.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                    No Logo
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-4">
              {selectedClub.name}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p>
                <span className="font-semibold text-gray-900">Alamat:</span>{" "}
                {selectedClub.address || "-"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Telepon:</span>{" "}
                {selectedClub.phone || "-"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Ketua Club:</span>{" "}
                {selectedClub.leaderName || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}