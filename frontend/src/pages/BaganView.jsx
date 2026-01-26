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
  const [isSeedingLoading, setIsSeedingLoading] = useState(false); 
  const [byeSlotsCount, setByeSlotsCount] = useState(0);
  const role = localStorage.getItem('role')
  const tournamentId = localStorage.getItem("selectedTournament");
  const finalId = baganId || id;
  const isRoundRobin = bagan?.tipe === "roundrobin";
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
      const isDouble = bagan?.kategori === "double";
      // Jika double, ambil dari tabel double-teams. Jika single, tetap pesertafilter.
      const endpoint = isDouble ? '/double-teams' : '/pesertafilter';
      
      const res = await api.get(endpoint, {
        params: {
          kelompokUmurId: kelompokUmurId,
          status: 'verified',
          tournamentId
        }
      });
      
      const data = res.data;
      setAllPeserta(data);
      
      // Hitung Bye
      const totalPeserta = data.length;
      let bracketSize = 2;
      while (bracketSize < totalPeserta) {
        bracketSize *= 2;
      }
      setByeSlotsCount(bracketSize - totalPeserta);
    } catch (error) {
      console.error(error);
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
  const bracketEl = document.getElementById("bracket-container");
  const ketPdfEl = document.getElementById("keterangan-pdf");

  if (!bracketEl || !bagan) return;

  try {
    /* =========================
       1️⃣ CAPTURE BRACKET (HALAMAN 1)
    ========================= */
    const bracketCanvas = await html2canvas(bracketEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const bracketImg = bracketCanvas.toDataURL("image/jpeg", 1.0);
    const bw = bracketCanvas.width * 0.75;
    const bh = bracketCanvas.height * 0.75;

    const paddingTop = 120;
    const pdfWidth = bw + 60;
    const pdfHeight = bh + paddingTop + 60;

    const pdf = new jsPDF({
      orientation: bw > bh ? "l" : "p",
      unit: "pt",
      format: [pdfWidth, pdfHeight]
    });

    /* =========================
       2️⃣ HEADER
    ========================= */
    const namaTurnamen =
      bagan.Tournament?.name || bagan.tournament_name || "PELTI DENPASAR";
    const namaKategori = bagan.nama || "Kategori Umum";

    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(20, 50, 100);
    pdf.text(namaTurnamen.toUpperCase(), pdfWidth / 2, 50, { align: "center" });

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text(namaKategori, pdfWidth / 2, 80, { align: "center" });

    pdf.setDrawColor(200);
    pdf.line(50, 95, pdfWidth - 50, 95);

    pdf.addImage(bracketImg, "JPEG", 30, paddingTop, bw, bh);

    /* =========================
       3️⃣ HALAMAN 2 – KETERANGAN (AMAN)
    ========================= */
    if (ketPdfEl) {
        ketPdfEl.style.display = "block";

        const canvas = await html2canvas(ketPdfEl, {
          scale: 2,
          backgroundColor: "#ffffff"
        });

        const w = canvas.width * 0.75;
        const h = canvas.height * 0.75;

        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 30, 40, w, h);

        ketPdfEl.style.display = "none";
      }

    pdf.save(`Bagan-${namaKategori.replace(/\s+/g, "-")}.pdf`);
  } catch (err) {
    console.error("Export PDF Error:", err);
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
 // --- MULAI GANTI DARI SINI ---
  const roundsMap = {};
  const isDouble = bagan.kategori === "double"; 

  bagan.Matches.forEach((m) => {
    if (!roundsMap[m.round]) roundsMap[m.round] = [];

    // Fungsi pembantu untuk menentukan nama (Ganda atau Tunggal)
    const getTeamName = (peserta, doubleTeam, id, doubleId) => {
      if (isDouble) {
        if (doubleTeam) return `${doubleTeam.Player1?.namaLengkap} / ${doubleTeam.Player2?.namaLengkap}`;
        return doubleId ? "TBD" : "BYE";
      }
      if (peserta) return peserta.namaLengkap;
      return id ? "TBD" : "BYE";
    };

    roundsMap[m.round].push({
      id: m.id,
      teams: [
        { name: getTeamName(m.peserta1, m.doubleTeam1, m.peserta1Id, m.doubleTeam1Id) },
        { name: getTeamName(m.peserta2, m.doubleTeam2, m.peserta2Id, m.doubleTeam2Id) },
      ],
      raw: m,
    });
  });
  // --- SAMPAI DI SINI ---

  const rounds = Object.keys(roundsMap)
    .sort((a, b) => a - b)
    .map((round) => ({
      title: `Babak ${round}`,
      seeds: roundsMap[round],
    }));
// --- GANTI BAGIAN JUARA INI ---
  const finalRound = Math.max(...bagan.Matches.map((m) => m.round));
  const finalMatch = bagan.Matches.find((m) => m.round === finalRound);

  let juara = null;
  if (finalMatch) {
    if (isDouble && finalMatch.winnerDoubleId) {
      const winner = finalMatch.winnerDoubleId === finalMatch.doubleTeam1Id ? finalMatch.doubleTeam1 : finalMatch.doubleTeam2;
      juara = winner ? `${winner.Player1?.namaLengkap} / ${winner.Player2?.namaLengkap}` : "TBD";
    } else if (!isDouble && finalMatch.winnerId) {
      juara = finalMatch.winnerId === finalMatch.peserta1Id ? finalMatch.peserta1?.namaLengkap : finalMatch.peserta2?.namaLengkap;
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
                        
                        {/* PESERTA 1 (Kiri) */}
                        <td className={`p-4 border-b font-semibold ${
                          (isDouble ? m.winnerDoubleId === m.doubleTeam1Id : m.winnerId === m.peserta1Id) ? "text-blue-600" : ""
                        }`}>
                          {isDouble 
                            ? (m.doubleTeam1?.namaTim || (m.doubleTeam1Id ? "TBD" : "BYE")) 
                            : (m.peserta1?.namaLengkap || (m.peserta1Id ? "TBD" : "BYE"))}
                        </td>

                        <td className="p-4 border-b text-center text-gray-400 font-bold">VS</td>

                        {/* PESERTA 2 (Kanan) */}
                        <td className={`p-4 border-b font-semibold ${
                          (isDouble ? m.winnerDoubleId === m.doubleTeam2Id : m.winnerId === m.peserta2Id) ? "text-blue-600" : ""
                        }`}>
                          {isDouble 
                            ? (m.doubleTeam2?.namaTim || (m.doubleTeam2Id ? "TBD" : "BYE")) 
                            : (m.peserta2?.namaLengkap || (m.peserta2Id ? "TBD" : "BYE"))}
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
                const isDouble = bagan.kategori === "double";

                return (
                  <Seed
                    {...props}
                    onClick={() => {
                      setSelectedMatch(match);
                      // Cek apakah kedua sisi ada isinya (baik Single maupun Double)
                      const hasS1 = isDouble ? match.doubleTeam1Id : match.peserta1Id;
                      const hasS2 = isDouble ? match.doubleTeam2Id : match.peserta2Id;
                      
                      if (hasS1 !== null && hasS2 !== null) {
                        setModalType("winner");
                      }
                    }}
                  >
                    <SeedItem>
                      <div className="bg-white rounded-lg">
                        {/* --- TEAM 1 --- */}
                        <SeedTeam
                          className={`rounded-lg min-w-[220px] px-3 py-2 text-start text-lg font-medium border-2 
                            ${
                              (isDouble ? (match.winnerDoubleId === match.doubleTeam1Id && match.doubleTeam1Id !== null) : (match.winnerId === match.peserta1Id && match.peserta1Id !== null))
                                ? "bg-[#fef3c7] text-[#78350f] border-[#fcd34d]"
                                : "bg-[#f3f4f6] text-[#1f2937] border-[#e5e7eb]"
                            }
                          `}
                        >
                          {isDouble 
                            ? (match.doubleTeam1?.namaTim || (match.doubleTeam1Id ? "TBD" : "BYE"))
                            : (match.peserta1?.namaLengkap || (match.peserta1Id ? "TBD" : "BYE"))}
                          
                          {match.score1 !== null && (
                            <span className="float-right font-bold">{match.score1}</span>
                          )}
                        </SeedTeam>

                        {/* --- TEAM 2 --- */}
                        <SeedTeam
                          className={`rounded-lg min-w-[220px] px-3 py-2 mt-2 text-start text-lg font-medium border-2 
                            ${
                              (isDouble ? (match.winnerDoubleId === match.doubleTeam2Id && match.doubleTeam2Id !== null) : (match.winnerId === match.peserta2Id && match.peserta2Id !== null))
                                ? "bg-[#fef3c7] text-[#78350f] border-[#fcd34d]"
                                : "bg-[#f3f4f6] text-[#1f2937] border-[#e5e7eb]"
                            }
                          `}
                        >
                          {isDouble 
                            ? (match.doubleTeam2?.namaTim || (match.doubleTeam2Id ? "TBD" : "BYE"))
                            : (match.peserta2?.namaLengkap || (match.peserta2Id ? "TBD" : "BYE"))}
                          
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

        {/* ===== KETERANGAN KHUSUS PDF (TANPA TAILWIND) ===== */}
        <div
          id="keterangan-pdf"
          style={{
            background: "#ffffff",
            padding: "32px",
            fontFamily: "Arial, Helvetica, sans-serif",
            display: "none",
            width: "100%"
          }}
        >

          {/* JUDUL */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, marginBottom: 6, color: "#1f2937" }}>
              Keterangan Penempatan
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Seeding & Plotting Peserta
            </p>
          </div>

          {/* GRID 2 KOLOM */}
          <div style={{ display: "flex", gap: 32 }}>
            
            {/* KOLOM SEED */}
            <div
              style={{
                flex: 1,
                border: "1px solid #fde68a",
                background: "#fffbeb",
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#92400e" }}>Peserta Unggulan (Seeded)</strong>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bagan.Matches.filter(m => m.round === 1)
                  .flatMap(m => {
                    const arr = [];
                    if (m.peserta1?.isSeeded) arr.push(m.peserta1.namaLengkap);
                    if (m.peserta2?.isSeeded) arr.push(m.peserta2.namaLengkap);
                    return arr;
                  })
                  .map((n, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",          // 🔥 WAJIB
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 44px 8px 12px",   // kanan diperbesar
                      background: "#ffffff",
                      border: "1px solid #fde68a",
                      borderRadius: 8,
                      minHeight: 36
                    }}
                  >

                     <span style={{ fontSize: 13, color: "#1f2937" }}>
                      {n}
                    </span>

                    <span
                      style={{
                        position: "absolute",   // 🔥 LEPAS DARI BASELINE
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)", // 🔥 CENTER VERTIKAL FIX
                        fontSize: 10,
                        color: "#92400e",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: "bold",
                        lineHeight: 1,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      SEED
                    </span>



                    </div>
                  ))}
              </div>
            </div>

            {/* KOLOM PLOTTING */}
            <div
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                borderRadius: 12,
                padding: 16
              }}
            >
              <strong style={{ color: "#1f2937" }}>Penempatan Khusus</strong>
              <p style={{ fontSize: 13, color: "#4b5563", marginTop: 10, lineHeight: 1.5 }}>
                Beberapa peserta ditempatkan secara manual untuk menghindari
                pertemuan dini antar rekan satu tim atau instansi yang sama.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 12,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#6b7280"
            }}
          >
            <span>PELTI DENPASAR OFFICIAL SYSTEM</span>
            <span>{new Date().toLocaleString("id-ID")}</span>
          </div>

          {juara && (
            <div
              style={{
                marginTop: 32,
                padding: "24px",
                borderRadius: 14,
                border: "2px solid #facc15",
                background: "#fffbeb",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#ca8a04",
                  marginBottom: 6
                }}
              >
                🏆 Juara
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 10
                }}
              >
                {juara}
              </div>
            </div>
          )}

        </div>


        {/* Hanya tampil jika BUKAN Round Robin */}
        {!isRoundRobin && (
           <div
                id="keterangan-container"
                className="mt-16 border-t-2 border-gray-100 pt-8 px-6 bg-white"
              >

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
                  {(() => {
                    const seededFinal = [];
                    const seenIds = new Set();

                    // HANYA ambil dari Babak 1 (Round 1) bagan yang sedang tampil
                    bagan.Matches.filter(m => m.round === 1).forEach((m) => {
                      const p1 = isDouble ? m.doubleTeam1 : m.peserta1;
                      const p2 = isDouble ? m.doubleTeam2 : m.peserta2;
                      const id1 = isDouble ? m.doubleTeam1Id : m.peserta1Id;
                      const id2 = isDouble ? m.doubleTeam2Id : m.peserta2Id;

                      // Validasi: Harus ada ID-nya DAN status isSeeded-nya TRUE
                      if (id1 && p1?.isSeeded && !seenIds.has(id1)) {
                        seededFinal.push(p1);
                        seenIds.add(id1);
                      }
                      if (id2 && p2?.isSeeded && !seenIds.has(id2)) {
                        seededFinal.push(p2);
                        seenIds.add(id2);
                      }
                    });

                    if (seededFinal.length === 0) {
                      return <p className="text-sm text-gray-400 italic">Tidak ada peserta unggulan.</p>;
                    }

                    return seededFinal.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white border border-yellow-200 rounded-xl shadow-sm">
                        <span className="text-sm font-bold text-gray-800">
                          {isDouble ? (p.namaTim || p.Player1?.namaLengkap) : p.namaLengkap}
                        </span>
                        <span className="text-[10px] bg-yellow-400 text-white px-2 py-0.5 rounded font-black">SEED</span>
                      </div>
                    ));
                  })()}
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
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
    
    <div className="relative bg-white rounded-[2.5rem] px-20 py-16 shadow-[0_30px_80px_rgba(0,0,0,0.45)] flex flex-col items-center w-[900px] h-[680px]">

      {/* LOADER BESAR */}
      <div className="relative w-36 h-36 mb-12">
        <div className="absolute inset-0 rounded-full border-[8px] border-yellow-400/30"></div>
        <div className="absolute inset-0 rounded-full border-[8px] border-yellow-500 border-t-transparent animate-spin"></div>

        <div className="absolute inset-6 rounded-full bg-yellow-50 flex items-center justify-center shadow-inner">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>

      {/* JUDUL */}
      <h2 className="text-4xl font-extrabold text-gray-800 tracking-wide text-center">
        Sedang Melakukan Pengundian
      </h2>

      {/* SUBTITLE */}
      <p className="mt-5 text-lg text-gray-500 text-center leading-relaxed max-w-xl">
        Sistem sedang menyusun bagan pertandingan secara otomatis dan adil
      </p>

      {/* DOT PROGRESS */}
      <div className="flex gap-3 mt-10">
        <span className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" />
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-sm text-gray-400 tracking-[0.3em] uppercase">
        PELTI DENPASAR OFFICIAL SYSTEM
      </div>
    </div>
  </div>
)}


    </div>
  );
}
