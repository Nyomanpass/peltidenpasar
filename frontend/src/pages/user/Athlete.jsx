import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { X, FileDown, ChevronDown, ChevronUp } from "lucide-react";

export default function Athlete() {
  const [athletes, setAthletes] = useState([]);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const role = localStorage.getItem("role");
  const [kelompokUmur, setKelompokUmur] = useState([]);

  const fetchAthletes = async () => {
    try {
      const res = await api.get("/athlete/get");
      setAthletes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleGroup = (id) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmur(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAthletes();
    fetchKelompokUmur();
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

  const totalAthletes = athletes.length;

  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF (Selaras dengan Halaman Publik Lainnya) */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Atlet PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Atlet PELTI Kota Denpasar
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-lg mt-1.5 opacity-90 hidden sm:block">
            Atlet binaan yang dipersiapkan melalui latihan terstruktur untuk meraih prestasi di tingkat daerah dan nasional.
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="relative px-4 sm:px-6 md:px-10 lg:px-20 py-12 sm:py-16 bg-gray-50 space-y-12 sm:space-y-16">
        {/* RANKING NASIONAL */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Ranking Nasional Atlet
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Untuk mengetahui peringkat resmi atlet secara nasional, silakan mengunjungi situs resmi Persatuan Lawn Tenis Indonesia (PELTI).
            </p>
          </div>

          <a
            href="https://pelti.org"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition text-xs sm:text-sm"
          >
            Kunjungi pelti.org →
          </a>
        </div>

        {/* DAFTAR ATLET */}
        <div>
          <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
            Daftar Atlet Binaan
          </h3>

          {totalAthletes === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <h3 className="text-base font-bold text-gray-500">
                Belum ada data atlet terdaftar.
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              {kelompokUmur.map((ku) => {
                const athletesByGroup = athletes.filter(
                  (a) => a.kelompokUmurId === ku.id
                );

                if (athletesByGroup.length === 0) return null;

                const isCollapsed = collapsedGroups[ku.id];

                return (
                  <div
                    key={ku.id}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                  >
                    {/* HEADER KELOMPOK UMUR */}
                    <button
                      onClick={() => toggleGroup(ku.id)}
                      className="w-full flex items-center justify-between px-6 py-5 bg-gray-50/70 hover:bg-gray-100/80 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-sm">
                          {ku.nama.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="text-left">
                          <h2 className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                            {ku.nama}
                          </h2>
                          <span className="text-[11px] text-yellow-800 font-bold uppercase tracking-wider">
                            {athletesByGroup.length} Atlet
                          </span>
                        </div>
                      </div>

                      <div className="text-gray-400">
                        {isCollapsed ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronUp size={20} />
                        )}
                      </div>
                    </button>

                    {/* GRID ATLET */}
                    {!isCollapsed && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 border-t border-gray-100">
                        {athletesByGroup.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => setSelectedAthlete(a)}
                            className="bg-gray-50/70 hover:bg-white rounded-2xl border border-gray-100 hover:border-yellow-300 p-4 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center"
                          >
                            <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl bg-gray-100 border border-white shadow-sm">
                              {a.photo ? (
                                <img
                                  src={a.photo}
                                  alt={a.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] text-center p-2">
                                  Tidak ada foto
                                </div>
                              )}
                            </div>

                            <div className="text-center w-full">
                              <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug min-h-[2.2rem] flex items-center justify-center">
                                {a.name}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MODAL ATLET */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl relative border border-gray-100">
            {/* CLOSE */}
            <button
              onClick={() => setSelectedAthlete(null)}
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm transition"
            >
              ✕
            </button>

            {/* MODAL CONTENT */}
            <div>
              <div className="relative h-[280px] w-full overflow-hidden bg-gray-100">
                {selectedAthlete.photo ? (
                  <img
                    src={selectedAthlete.photo}
                    alt={selectedAthlete.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Tidak ada foto
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-block text-xs px-4 py-1.5 bg-yellow-400 text-black rounded-full font-bold shadow-md">
                    {selectedAthlete.kelompokUmur?.nama}
                  </span>
                </div>
              </div>

              <div className="p-5 text-center space-y-3">
                <h3 className="font-extrabold text-lg text-gray-900">
                  {selectedAthlete.name}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-2xl p-2.5 border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-semibold uppercase">Gender</p>
                    <p className="font-bold text-gray-900 capitalize text-xs mt-0.5">
                      {selectedAthlete.gender}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-2.5 border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-semibold uppercase">Club</p>
                    <p className="font-bold text-gray-900 text-xs mt-0.5 truncate">
                      {selectedAthlete.club || "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-2.5 border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-semibold uppercase">No Telp</p>
                    <p className="font-bold text-gray-900 text-xs mt-0.5 truncate">
                      {selectedAthlete.phoneNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HIDDEN PRINT CARD */}
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
                    {selectedAthlete.kelompokUmur?.nama}
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
                  <div
                    style={{
                      fontSize: "10px",
                      marginTop: "10px",
                      color: "#888",
                    }}
                  >
                    PELTI DENPASAR
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setSelectedAthlete(null)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition text-xs"
              >
                <X size={16} /> Tutup
              </button>

              {role === "admin" && (
                <button
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 text-white font-bold shadow-md hover:bg-green-700 transition text-xs"
                >
                  <FileDown size={16} /> Cetak PDF
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