import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { X, FileDown } from "lucide-react";

export default function Athlete() {
  const [athletes, setAthletes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const role = localStorage.getItem("role");

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

  const handleExportPDF = async () => {
    const element = document.getElementById("athlete-card-pdf");

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    pdf.save(`kartu-atlet-${selectedAthlete.name}.pdf`);
  };

  const filteredAthletes = athletes.filter((a) => {
    const categoryMatch = categoryFilter === "all" || a.category === categoryFilter;
    const genderMatch = genderFilter === "all" || a.gender === genderFilter;
    return categoryMatch && genderMatch;
  });

  return (
    <>
      <Navbar />

      {/* HERO */}
       <div className="relative w-full h-[400px] mt-18">
        <img
          src="/hero.jpg"
          alt="Kepengurusan Pelti Denpasar"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            px-4 sm:px-6 md:px-10 lg:px-20
            text-center text-white
          "
        >
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 leading-tight">
              Atlet PELTI Kota Denpasar
          </h2>

          <p
            className="
              max-w-md sm:max-w-xl md:max-w-2xl
              text-xs sm:text-sm md:text-base
              opacity-90 leading-relaxed
            "
          >
            Atlet binaan yang dipersiapkan melalui latihan terstruktur untuk meraih prestasi di tingkat daerah dan nasional.

          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="relative px-3 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-12 md:py-16 bg-gray-50 space-y-12 sm:space-y-16">

        {/* RANKING NASIONAL */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              Ranking Nasional Atlet
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-xs sm:max-w-xl md:max-w-2xl leading-relaxed">
              Untuk mengetahui peringkat resmi atlet secara nasional,
              silakan mengunjungi situs resmi Persatuan Lawn Tenis
              Indonesia (PELTI).
            </p>
          </div>

          <a
            href="https://pelti.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg transition text-sm sm:text-base"
          >
            Kunjungi pelti.org
          </a>
        </div>

        {/* DAFTAR ATLET */}
        <div>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
            Daftar Atlet
          </h3>

          {/* FILTER */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-6">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 bg-white shadow-sm text-sm sm:text-base w-full sm:w-auto"
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
              className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 bg-white shadow-sm text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="all">Semua Gender</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          {/* GRID ATLET */}
          {filteredAthletes.length === 0 ? (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              Tidak ada data atlet sesuai filter.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredAthletes.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAthlete(a)}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                >
                  <div className="h-24 sm:h-28 md:h-32 bg-gray-100">
                    {a.photo ? (
                      <img
                        src={a.photo}
                        alt={a.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                        Tidak ada foto
                      </div>
                    )}
                  </div>

                  <div className="p-2 sm:p-3 text-center">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-2 leading-snug">
                      {a.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      {a.category}
                    </p>
                    <span className="inline-block mt-1 text-[9px] sm:text-[11px] px-2 py-1 bg-gray-100 rounded-full capitalize text-gray-600">
                      {a.gender}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md px-2 sm:px-4">
          <div className="bg-white rounded-xl w-full max-w-[95vw] sm:max-w-[400px] overflow-hidden shadow-xl relative">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedAthlete(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>

            {/* MODAL CARD */}
            <div>
              <div className="relative h-[40vh] sm:h-72 md:h-[350px] w-full overflow-hidden rounded-t-3xl">
                {selectedAthlete.photo ? (
                  <img
                    src={selectedAthlete.photo}
                    alt={selectedAthlete.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm sm:text-base">
                    Tidak ada foto
                  </div>
                )}
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
                  <span className="inline-block text-xs sm:text-sm px-3 sm:px-5 py-1 sm:py-2 bg-yellow-400/95 text-black rounded-full font-extrabold shadow-lg">
                    {selectedAthlete.category}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-5 text-center space-y-2 sm:space-y-3">
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-800 tracking-wide">
                  {selectedAthlete.name}
                </h3>

                <div className="bg-gray-50 rounded-xl py-2 sm:py-3 shadow-sm">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Gender</p>
                  <p className="font-semibold text-gray-800 capitalize text-sm">
                    {selectedAthlete.gender}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl py-2 sm:py-3 shadow-sm">
                  <p className="text-gray-400 text-[10px] sm:text-xs">Club</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedAthlete.club || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl py-2 sm:py-3 shadow-sm">
                  <p className="text-gray-400 text-[10px] sm:text-xs">No Telp</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedAthlete.phoneNumber || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD PDF */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
              <div
                id="athlete-card-pdf"
                style={{
                  width: "300px",
                  padding: "16px",
                  background: "#ffffff",
                  color: "#000000",
                  fontFamily: "Arial, sans-serif",
                  border: "2px solid #000",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    height: "250px",
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "10px",
                  }}
                >
                  {selectedAthlete.photo ? (
                    <img
                      src={selectedAthlete.photo}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {selectedAthlete.name}
                  </div>

                  <div style={{ fontSize: "12px", marginBottom: "6px" }}>
                    {selectedAthlete.category}
                  </div>

                  <div style={{ fontSize: "12px" }}>
                    Gender: {selectedAthlete.gender}
                  </div>
                  <div style={{ fontSize: "12px" }}>
                    Club: {selectedAthlete.club || "-"}
                  </div>
                  <div style={{ fontSize: "12px" }}>
                    No Telp: {selectedAthlete.phoneNumber || "-"}
                  </div>

                  <div style={{ fontSize: "10px", marginTop: "10px", color: "#888" }}>
                    PELTI DENPASAR
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 border-t bg-gray-50">
              <button
                onClick={() => setSelectedAthlete(null)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl
                  bg-white border border-gray-300 text-gray-700 font-semibold
                  hover:bg-gray-100 hover:shadow transition text-sm"
              >
                <X size={18} /> Tutup
              </button>

              {role === "admin" && (
                <button
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl
                    bg-green-600 text-white font-semibold shadow-md
                    hover:bg-green-700 hover:shadow-lg transition text-sm"
                >
                  <FileDown size={18} /> Cetak PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
