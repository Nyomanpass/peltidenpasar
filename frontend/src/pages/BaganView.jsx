import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bracket, Seed, SeedItem, SeedTeam } from "react-brackets";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../api"; // Mengimpor instans axios dari file api.js
import { CheckCircle, Info, Star, Users } from "lucide-react";

// Modal
import PesertaModal from "../components/modalbox/PesertaModal";
import WinnerModal from "../components/modalbox/WinnerModal";
import SeedingModal from "../components/modalbox/SeedingModal";

export default function BaganView({baganId}) {
  const { id } = useParams();
  const [bagan, setBagan] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [allPeserta, setAllPeserta] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingLoading, setIsSeedingLoading] = useState(false); // State baru untuk loading pengundian
  const [byeSlotsCount, setByeSlotsCount] = useState(0);
  const role = localStorage.getItem('role')
  const tournamentId = localStorage.getItem("selectedTournament");
  const finalId = baganId || id;
  const isRoundRobin = bagan?.Matches?.length === 6;
  const [isLocked, setIsLocked] = useState(false);



  // Load data bagan menggunakan axios
  const loadBagan = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/bagan/${finalId}`);
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
          status: 'verified',
          tournamentId
        }
      });
      const data = res.data; // Mengakses data dari properti .data
      console.log("Peserta setelah filter:", res.data);
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
  console.log("Cek data bagan:", bagan); // LIHAT DI CONSOLE BROWSER
  const element = document.getElementById("bracket-container");
  
  if (!element || !bagan) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const imgWidthPt = element.scrollWidth * 0.75;
    const imgHeightPt = element.scrollHeight * 0.75;
    
    const paddingTop = 120; 
    const pdfWidth = imgWidthPt + 60; 
    const pdfHeight = imgHeightPt + paddingTop + 60;

    const pdf = new jsPDF({
      orientation: imgWidthPt > imgHeightPt ? "l" : "p",
      unit: "pt",
      format: [pdfWidth, pdfHeight]
    });

    // --- LOGIKA PENGECEKAN DATA ---
    // Coba ambil dari Tournament.name, jika tidak ada cek properti lain, 
    // jika tetap tidak ada baru pakai fallback "PELTI DENPASAR"
    const namaTurnamen = bagan.Tournament?.name || bagan.tournament_name || "PELTI DENPASAR";
    const namaKategori = bagan.nama || "Kategori Umum";

    // 1. Nama Turnamen (Header Utama)
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 50, 100); // Warna Biru Tua
    pdf.text(namaTurnamen.toUpperCase(), pdfWidth / 2, 50, { align: 'center' });

    // 2. Kategori (Sub-header)
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(namaKategori, pdfWidth / 2, 80, { align: 'center' });

    // Garis Pemisah
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.line(50, 95, pdfWidth - 50, 95);

    // 3. Masukkan Bagan
    pdf.addImage(imgData, 'JPEG', 30, paddingTop, imgWidthPt, imgHeightPt);

    pdf.save(`Bagan-${namaKategori.replace(/\s+/g, '-')}.pdf`);

  } catch (error) {
    console.error("Export Error:", error);
  }
};

const handleLockBagan = async () => {
  const confirmLock = window.confirm(
    "⚠️ PERINGATAN: Setelah dikunci, pengundian tidak dapat diulang kembali. Pastikan bagan sudah benar!"
  );
  
  if (!confirmLock) return;

  try {
    setIsLoading(true);
    // Mengirim perintah ke backend
    await api.patch(`/bagan/${finalId}/lock`); 
    
    // Refresh data bagan agar bagan.isLocked terupdate di UI
    await loadBagan(); 
    alert("✅ Bagan telah resmi dikunci!");
  } catch (error) {
    console.error(error);
    alert("Gagal mengunci bagan: " + error.message);
  } finally {
    setIsLoading(false);
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
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="max-full mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-9 text-center text-gray-800">
          {bagan.nama}
        </h1>
      
      {role === "admin" && (
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="flex justify-center gap-4">
            {/* Tombol Undian: HANYA tampil jika BELUM dikunci DAN BUKAN Round Robin */}
            {!bagan.isLocked && !isRoundRobin && (
              <button
                onClick={() => setModalType("seeding")}
                className="px-8 py-3 bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:bg-purple-800 transition-all"
                disabled={isSeedingLoading}
              >
                Lakukan Pengundian
              </button>
            )}

            {/* Tombol Kunci: HANYA tampil jika BELUM dikunci */}
            {!bagan.isLocked && (
              <button
                onClick={handleLockBagan}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all flex items-center gap-2"
              >
                Kunci Bagan 🔒
              </button>
            )}

            {/* Tombol Export PDF: Selalu Tampil */}
            <button
              onClick={handleExportPDF}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all"
            >
              Export PDF
            </button>
          </div>

          {/* Label Status: Tampil jika SUDAH dikunci */}
          {bagan.isLocked && (
            <div className="mt-4 px-6 py-2 bg-amber-100 text-amber-700 font-bold rounded-full border border-amber-200 flex items-center gap-2">
              🔒 Bagan Telah Disepakati & Dikunci (Permanen)
            </div>
          )}
        </div>
      )}

        {/* Bracket */}
        <div 
          id="bracket-container" 
          className="w-full bg-white shadow-lg rounded-xl p-4 overflow-x-auto" 
        >
          {isRoundRobin ? (
            /* TAMPILAN ROUND ROBIN (TABEL) */
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Badan Pertandingan Round Robin</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="p-4 border-b text-left">Match</th>
                    <th className="p-4 border-b text-left">Peserta 1</th>
                    <th className="p-4 border-b text-center">VS</th>
                    <th className="p-4 border-b text-left">Peserta 2</th>
                    <th className="p-4 border-b text-center">Skor</th>
                    {role === "admin" && <th className="p-4 border-b text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {bagan.Matches.map((m, index) => (
                    <tr key={m.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 border-b font-medium text-gray-500">#{index + 1}</td>
                      <td className={`p-4 border-b font-semibold ${m.winnerId === m.peserta1Id ? "text-blue-600" : ""}`}>
                        {m.peserta1?.namaLengkap || "TBD"}
                      </td>
                      <td className="p-4 border-b text-center text-gray-400 font-bold">VS</td>
                      <td className={`p-4 border-b font-semibold ${m.winnerId === m.peserta2Id ? "text-blue-600" : ""}`}>
                        {m.peserta2?.namaLengkap || "TBD"}
                      </td>
                      <td className="p-4 border-b text-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-md font-mono font-bold">
                          {m.score1 ?? 0} - {m.score2 ?? 0}
                        </span>
                      </td>
                      {role === "admin" && (
                        <td className="p-4 border-b text-center">
                          <button 
                            onClick={() => {
                              setSelectedMatch(m);
                              setModalType("winner");
                            }}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                          >
                            Input Skor
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
          <Bracket
            rounds={rounds}
            renderSeedComponent={(props) => {
              const match = props.seed.raw;
              return (
                <Seed
                  {...props}
                 
                  onClick={() => {
                    setSelectedMatch(match);
                    if (match.peserta1Id !== null && match.peserta2Id !== null) {
                      setModalType("winner");
                    }
                    // } else {
                    //   setModalType("peserta");
                    // }
                  }}
                >
                  <SeedItem>
                    <div className="bg-white rounded-lg">
                      <SeedTeam
                        className={`rounded-lg min-w-[220px] px-3 py-2 text-start text-lg font-medium border-2 
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
                        className={`rounded-lg min-w-[220px] px-3 py-2 mt-2 text-start text-lg font-medium border-2 
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
          )}
        </div>

        {/* Hanya tampil jika BUKAN Round Robin */}
        {!isRoundRobin && (
          <div className="mt-16 border-t-2 border-gray-100 pt-8 px-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Info size={22} className="text-blue-500" /> 
              Keterangan Penempatan (Seeding & Plotting)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Kolom Unggulan (Seed) */}
              <div className="space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" /> 
                  Peserta Unggulan (Seeded)
                </p>
                <div className="space-y-2">
                  {bagan.Matches.filter(m => m.round === 1).map((m) => (
                    <div key={m.id}>
                      {/* Cek Peserta 1 */}
                      {m.peserta1?.isSeeded && (
                        <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <span className="text-sm font-bold text-gray-800">{m.peserta1.namaLengkap}</span>
                          <span className="text-[10px] bg-yellow-400 text-white px-2 py-0.5 rounded font-black">SEED</span>
                        </div>
                      )}
                      {/* Cek Peserta 2 */}
                      {m.peserta2?.isSeeded && (
                        <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                          <span className="text-sm font-bold text-gray-800">{m.peserta2.namaLengkap}</span>
                          <span className="text-[10px] bg-yellow-400 text-white px-2 py-0.5 rounded font-black">SEED</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Jika tidak ada yang di-seed, tampilkan placeholder */}
                  {bagan.Matches.every(m => !m.peserta1?.isSeeded && !m.peserta2?.isSeeded) && (
                    <p className="text-sm text-gray-400 italic">Tidak ada peserta unggulan yang ditetapkan.</p>
                  )}
                </div>
              </div>

              {/* Kolom Plotting Manual (Non-Seed) */}
              <div className="space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} className="text-blue-500" /> 
                  Penempatan Khusus (Non-Seed)
                </p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    Beberapa peserta telah dipisahkan posisinya secara manual (Plotting) guna menghindari pertemuan dini antar rekan satu tim atau instansi yang sama.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              <span>PELTI DENPASAR OFFICIAL SYSTEM</span>
              <span>{new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}

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
      {modalType === "peserta" && role === "admin" && (
        <PesertaModal
          match={selectedMatch}
          kelompokUmurId={bagan.kelompokUmurId}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "winner" && role === "admin" && (
        <WinnerModal
          match={selectedMatch}
          onClose={() => setModalType(null)}
          onSaved={loadBagan}
        />
      )}
      {modalType === "seeding" && role === "admin" && (
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
