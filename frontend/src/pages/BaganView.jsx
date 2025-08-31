import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../api"; // Mengimpor instans axios dari file api.js

// Modal
import PesertaModal from "../components/modalbox/PesertaModal";
import WinnerModal from "../components/modalbox/WinnerModal";
import SeedingModal from "../components/modalbox/SeedingModal";

export default function BaganView() {
  const { id } = useParams();
  const [bagan, setBagan] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [allPeserta, setAllPeserta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingLoading, setIsSeedingLoading] = useState(false); // State baru untuk loading pengundian
  const [byeSlotsCount, setByeSlotsCount] = useState(0);
  const role = localStorage.getItem('role')

  // Load data bagan menggunakan axios
  const loadBagan = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bagan/${id}`);
      const data = res.data; // Mengakses data dari properti .data
      setBagan(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load peserta menggunakan axios
  const loadAllPeserta = async (kelompokUmurId) => {
    try {
      const res = await api.get('/pesertafilter', {
        params: {
          kelompokUmurId: kelompokUmurId,
          status: 'verified'
        }
      });
      const data = res.data; // Mengakses data dari properti .data
      setAllPeserta(data);
      const totalPeserta = data.length;
      let bracketSize = 2;
      while (bracketSize < totalPeserta) {
        bracketSize *= 2;
      }
      setByeSlotsCount(bracketSize - totalPeserta);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  useEffect(() => {
    loadBagan();
  }, [id]);

  useEffect(() => {
    if (bagan && bagan.kelompokUmurId) {
      loadAllPeserta(bagan.kelompokUmurId);
    }
  }, [bagan]);

  // Export PDF yang diperbaiki
  const handleExportPDF = async () => {
    const element = document.getElementById("bracket-container");
    if (!element || !bagan || !bagan.nama) {
      alert("Elemen bagan atau nama bagan tidak ditemukan.");
      return;
    }

    try {
      // Dapatkan dimensi lengkap elemen, termasuk yang tersembunyi
      const elementWidth = element.scrollWidth;
      const elementHeight = element.scrollHeight;

      // Ambil screenshot dari seluruh elemen
      const canvas = await html2canvas(element, {
        scale: 2, // Kualitas tinggi
        width: elementWidth, // Atur lebar kanvas
        height: elementHeight, // Atur tinggi kanvas
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Buat PDF dengan dimensi yang pas untuk gambar
      const pdf = new jsPDF("landscape", "pt", [elementWidth * 0.75, elementHeight * 0.75 + 50]); // 0.75 factor to convert px to pt, add margin for title
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Tambahkan judul di tengah atas
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(bagan.nama, pdfWidth / 2, 40, { align: 'center' }); // Posisi y 40pt

      // Tambahkan gambar bagan
      pdf.addImage(imgData, 'JPEG', 0, 50, pdfWidth, pdfHeight - 50); // Posisi y 50pt

      // Simpan PDF
      pdf.save(`${bagan.nama || "bagan"}.pdf`);

    } catch (error) {
      console.error("Gagal export PDF:", error);
      alert("Gagal export PDF: " + error.message);
    }
  };

  // Lakukan pengundian menggunakan axios
  const handleUndian = async (seededPeserta, byeSlots) => {
    setIsSeedingLoading(true); // Atur state loading pengundian menjadi true
    setModalType(null);
    try {
      const res = await api.post(`/bagan/${id}/undian`, { seededPeserta, byeSlots });
      if (res.status !== 200) throw new Error("Gagal melakukan pengundian.");

      // Menambahkan delay 6 detik (6000 ms) untuk simulasi loading
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      await loadBagan();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSeedingLoading(false); // Atur state loading pengundian menjadi false setelah selesai
    }
  };

  if (!bagan) {
    return <div className="p-6 text-center text-gray-500">⏳ Loading...</div>;
  }
  
  // Konversi Matches ke format react-brackets
  const roundsMap = {};
  bagan.Matches.forEach((m) => {
    if (!roundsMap[m.round]) roundsMap[m.round] = [];
    roundsMap[m.round].push({
      id: m.id,
      teams: [
        { name: m.peserta1?.namaLengkap || (m.peserta1Id ? "TBD" : "BYE") },
        { name: m.peserta2?.namaLengkap || (m.peserta2Id ? "TBD" : "BYE") },
      ],
      raw: m,
    });
  });

  const rounds = Object.keys(roundsMap)
    .sort((a, b) => a - b)
    .map((round) => ({
      title: `Babak ${round}`,
      seeds: roundsMap[round],
    }));

  const finalRound = Math.max(...bagan.Matches.map((m) => m.round));
  const finalMatch = bagan.Matches.find((m) => m.round === finalRound);

  let juara = null;
  if (finalMatch && finalMatch.winnerId) {
    if (finalMatch.winnerId === finalMatch.peserta1Id) {
      juara = finalMatch.peserta1?.namaLengkap;
    } else if (finalMatch.winnerId === finalMatch.peserta2Id) {
      juara = finalMatch.peserta2?.namaLengkap;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 w-full">
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-9 text-center text-gray-800">
          {bagan.nama}
        </h1>
      
      {role === "admin" && (
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setModalType("seeding")}
            className="px-8 py-3 bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:bg-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSeedingLoading}
          >
            Lakukan Pengundian
          </button>
          <button
            onClick={handleExportPDF}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300"
          >
            Export PDF
          </button>
        </div>
      )}

        {/* Bracket */}
        <div 
          id="bracket-container" 
          className="w-full bg-white shadow-lg rounded-xl p-4 overflow-x-auto" 
        >
          <Bracket
            rounds={rounds}
            renderSeedComponent={(props) => {
              const match = props.seed.raw;
              return (
                <Seed
                  {...props}
                  className="!bg-white !rounded-xl !shadow-md hover:!shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedMatch(match);
                    if (match.peserta1Id !== null && match.peserta2Id !== null) {
                      setModalType("winner");
                    } else {
                      setModalType("peserta");
                    }
                  }}
                >
                  <SeedItem>
                    <div className="px-3 py-2">
                      <SeedTeam
                        className={`rounded-lg px-3 py-2 text-start font-medium border-2 
                          ${
                            match.winnerId === match.peserta1Id
                              ? "bg-[#fef3c7] text-[#78350f] border-[#fcd34d]"
                              : "bg-[#f3f4f6] text-[#1f2937] border-[#e5e7eb]"
                          }
                        `}
                      >
                        {match.peserta1?.namaLengkap ||
                          (match.peserta1Id ? "TBD" : "BYE")}
                        {match.score1 !== null && (
                          <span className="float-right font-bold">{match.score1}</span>
                        )}
                      </SeedTeam>

                      <SeedTeam
                        className={`rounded-lg px-3 py-2 mt-2 text-start font-medium border-2 
                          ${
                            match.winnerId === match.peserta2Id
                              ? "bg-[#fef3c7] text-[#78350f] border-[#fcd34d]"
                              : "bg-[#f3f4f6] text-[#1f2937] border-[#e5e7eb]"
                          }
                        `}
                      >
                        {match.peserta2?.namaLengkap ||
                          (match.peserta2Id ? "TBD" : "BYE")}
                        {match.score2 !== null && (
                          <span className="float-right font-bold">{match.score2}</span>
                        )}
                      </SeedTeam>
                    </div>
                  </SeedItem>
                </Seed>
              );
            }}
          />
        </div>

        {/* 🏆 Juara */}
        {juara && (
          <div className="mt-12 text-center bg-white p-6 rounded-xl shadow-lg border-2 border-yellow-400">
            <h2 className="text-3xl font-bold text-yellow-600 animate-bounce">
              🏆 Juara
            </h2>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{juara}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalType === "peserta" && (
        <PesertaModal
          match={selectedMatch}
          kelompokUmurId={bagan.kelompokUmurId}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "winner" && (
        <WinnerModal
          match={selectedMatch}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "seeding" && (
        <SeedingModal
          pesertaList={allPeserta}
          byeSlotsCount={byeSlotsCount}
          onClose={() => setModalType(null)}
          onSaved={handleUndian}
        />
      )}

      {/* Loading Modal Pop-up */}
      {isSeedingLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <svg 
                className="animate-spin h-16 w-16 text-purple-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-xl font-semibold text-gray-700">Sedang melakukan pengundian...</p>
            <p className="mt-2 text-sm text-gray-500">Mohon tunggu sebentar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
