import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";

export default function Athlete() {
  const [athletes, setAthletes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const fetchAthletes = async () => {
    try {
      const res = await api.get("/athlete/get");
      setAthletes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  // ======================
  // FILTER LOGIC
  // ======================
  const filteredAthletes = athletes.filter((a) => {
    const categoryMatch =
      categoryFilter === "all" || a.category === categoryFilter;
    const genderMatch =
      genderFilter === "all" || a.gender === genderFilter;
    return categoryMatch && genderMatch;
  });

  return (
    <>
      <Navbar />

      {/* ================= HERO ================= */}
      <div className="relative w-full h-[300px] mt-30">
        <img
          src="/hero.jpg"
          alt="Atlet Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Atlet
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
            Atlet merupakan individu binaan yang dibentuk melalui latihan
            terstruktur, disiplin tinggi, dan semangat kompetitif untuk
            berprestasi di tingkat daerah maupun nasional.
          </p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <section className="relative px-6 md:px-20 lg:px-32 py-16 bg-gray-50 space-y-20">

        {/* ================= RANKING NASIONAL ================= */}
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Ranking Nasional Atlet
            </h3>
            <p className="text-gray-600 max-w-xl leading-relaxed">
              Untuk mengetahui peringkat resmi atlet secara nasional,
              silakan mengunjungi situs resmi Persatuan Lawn Tenis
              Indonesia (PELTI).
            </p>
          </div>

          <a
            href="https://pelti.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition"
          >
            Kunjungi pelti.org
          </a>
        </div>

        {/* ================= DAFTAR ATLET ================= */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            Daftar Atlet
          </h3>

          {/* FILTER */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm"
            >
              <option value="all">Semua Kategori</option>
              {["U-10", "U-12", "U-14", "U-16", "Open"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm"
            >
              <option value="all">Semua Gender</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          {/* GRID ATLET */}
          {filteredAthletes.length === 0 ? (
            <p className="text-center text-gray-500">
              Tidak ada data atlet sesuai filter.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredAthletes.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  {/* FOTO */}
                  <div className="h-40 bg-gray-100">
                    {a.photo ? (
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Tidak ada foto
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-4 text-center">
                   <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">
                    {a.name}
                    </h4>


                    <p className="text-xs text-gray-500 mt-1">
                      {a.category}
                    </p>

                    <span className="inline-block mt-2 text-[11px] px-3 py-1 bg-gray-100 rounded-full capitalize text-gray-600">
                      {a.gender}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
