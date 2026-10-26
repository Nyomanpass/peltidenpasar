import React, { useState, useEffect } from "react";
import api from "../api";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import { 
  Trophy, Calendar, Search, 
  ChevronRight, Clock, Users, User, Tag, Layers,
  Filter, RotateCcw, X, FileText, Award
} from "lucide-react";

function SkorPage() {
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tiebreakSummary, setTiebreakSummary] = useState({});
  const location = useLocation();
  const highlightMatchId = location.state?.matchId;
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKU, setFilterKU] = useState("Semua");
  const [filterType, setFilterType] = useState("Semua");
  const [filterDate, setFilterDate] = useState("Semua");

  // State Modal
  const [selectedLog, setSelectedLog] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMatchInfo, setActiveMatchInfo] = useState(null);

  // Fungsi fetch dipisah agar bisa dipanggil berulang kali
  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const tournamentId = localStorage.getItem("selectedTournament");
      if (!tournamentId) {
        setMatchHistory([]);
        setIsLoading(false);
        return;
      }

      const response = await api.get("/matches", {
        params: { tournamentId: tournamentId, status: "selesai" }
      });

      const matches = response.data;
      setMatchHistory(matches);

      const newTiebreakSummary = {};

      for (const match of matches) {
        const gameLimit = match.scoreRule?.gamePerSet || 6;
        const totalSetPlayed = match.score1 + match.score2;

        const needsTiebreak =
          [1, 2].some((sNum) => {
            const s1 = parseInt(match[`set${sNum}P1`]);
            const s2 = parseInt(match[`set${sNum}P2`]);

            return (
              !isNaN(s1) &&
              !isNaN(s2) &&
              Math.abs(s1 - s2) === 1 &&
              (s1 >= gameLimit || s2 >= gameLimit)
            );
          }) || totalSetPlayed === 3;

        if (needsTiebreak) {
          try {
            const logRes = await api.get(`/match-logs/${match.id}`);
            if (logRes.data?.length > 0) {
              const sortedLogs = [...logRes.data].sort((a, b) => a.id - b.id);
              const tbData = {};

              [1, 2, 3].forEach((sNum) => {
                const s1 = parseInt(match[`set${sNum}P1`]);
                const s2 = parseInt(match[`set${sNum}P2`]);
                const result = getTiebreakFromLogs(sortedLogs, sNum, s1, s2);
                if (result) tbData[`set${sNum}`] = result;
              });
              newTiebreakSummary[match.id] = tbData;
            }
          } catch (err) {
            console.error(`Gagal ambil tiebreak:`, err);
          }
        }
      }
      setTiebreakSummary(newTiebreakSummary);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDFLog = () => {
    if (!activeMatchInfo) return;
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4"
    });

    const match = activeMatchInfo;
    const isDouble = !!match.doubleTeam1Id;
    const p1Name = isDouble ? match.doubleTeam1?.namaTim : match.peserta1?.namaLengkap;
    const p2Name = isDouble ? match.doubleTeam2?.namaTim : match.peserta2?.namaLengkap;
    const tournamentName = localStorage.getItem("selectedTournamentName") || "PELTI DENPASAR";

    // --- 1. HEADER UTAMA ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(20, 50, 100);
    doc.text(tournamentName.toUpperCase(), 297, 50, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("LAPORAN RESMI HASIL PERTANDINGAN", 297, 68, { align: "center" });

    doc.setDrawColor(220, 220, 220);
    doc.line(40, 80, 555, 80);

    // --- 2. INFO PERTANDINGAN ---
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Bagan: ${match.bagan?.nama || "-"}`, 40, 100);
    doc.text(`Kategori: ${isDouble ? "Ganda" : "Tunggal"} (${match.bagan?.KelompokUmur?.nama || "Umum"})`, 40, 115);
    doc.text(`Waktu: ${new Date(match.updatedAt).toLocaleString("id-ID")}`, 40, 130);

    // --- 3. BOX SKOR UTAMA DENGAN DYNAMIC WRAPPING ---
    const boxWidth = 515;
    const boxX = 40;
    const boxY = 145;
    const centerX = 297;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    const fullMatchTitle = `${p1Name} VS ${p2Name}`;
    const splitTitle = doc.splitTextToSize(fullMatchTitle, 480);
    
    const lineSpacing = 15;
    const titleHeight = splitTitle.length * lineSpacing;
    const dynamicBoxHeight = 55 + titleHeight;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(230, 235, 240);
    doc.roundedRect(boxX, boxY, boxWidth, dynamicBoxHeight, 10, 10, "FD");

    doc.text(splitTitle, centerX, boxY + 20, { align: "center" });

    const scoreY = boxY + 20 + titleHeight + 5;
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text(`${match.score1} - ${match.score2}`, centerX, scoreY, { align: "center" });

    const rekapSet = [];
    [1, 2, 3].forEach(sNum => {
      const s1 = match[`set${sNum}P1`];
      const s2 = match[`set${sNum}P2`];
      if (s1 !== null && s2 !== null && (s1 > 0 || s2 > 0)) {
        rekapSet.push(`${s1}-${s2}`);
      }
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(`(${rekapSet.join(", ")})`, centerX, scoreY + 18, { align: "center" });

    // --- 4. DETAIL POIN PER SET ---
    let yPos = boxY + dynamicBoxHeight + 30;

    const sets = selectedLog.reduce((acc, log) => {
      if (!acc[log.setKe]) acc[log.setKe] = [];
      acc[log.setKe].push(log);
      return acc;
    }, {});

    Object.keys(sets).forEach((setKe) => {
      if (yPos > 700) { doc.addPage(); yPos = 50; }

      doc.setFillColor(30, 41, 59);
      doc.rect(40, yPos, 515, 20, "F");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`DETAIL POIN - SET ${setKe}`, centerX, yPos + 14, { align: "center" });
      
      yPos += 20;

      doc.setFillColor(241, 245, 249);
      doc.rect(40, yPos, 515, 18, "F");
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.text("#", 55, yPos + 12);
      doc.text("SKOR POIN", 100, yPos + 12);
      doc.text("GAME", 200, yPos + 12);
      doc.text("KETERANGAN", 300, yPos + 12);
      
      yPos += 18;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      sets[setKe].forEach((log, index) => {
        if (yPos > 780) { doc.addPage(); yPos = 50; }

        doc.text(`${index + 1}`, 55, yPos + 14);
        doc.setFont("helvetica", "bold");
        doc.text(`${log.skorP1} - ${log.skorP2}`, 100, yPos + 14);
        doc.setFont("helvetica", "normal");
        doc.text(`${log.gameP1} - ${log.gameP2}`, 200, yPos + 14);
        
        doc.setFontSize(7);
        doc.text(log.keterangan || "Point Exchange", 300, yPos + 14);
        doc.setFontSize(8);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(40, yPos + 18, 555, yPos + 18);
        yPos += 18;
      });

      yPos += 25;
    });

    doc.setFontSize(7);
    doc.setTextColor(180);
    doc.text("Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi PELTI Kota Denpasar.", 297, 820, { align: "center" });

    doc.save(`Skor_${(p1Name || "Peserta1").replace(/\s+/g, '_')}_vs_${(p2Name || "Peserta2").replace(/\s+/g, '_')}.pdf`);
  };

  useEffect(() => {
    fetchHistory();

    const handleTournamentChange = () => {
      fetchHistory();
    };

    window.addEventListener("tournament-changed", handleTournamentChange);

    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, []);

  // --- PREPARASI OPSI FILTER ---
  const listKU = ["Semua", ...new Set(matchHistory.map(m => m.bagan?.KelompokUmur?.nama).filter(Boolean))];

  const listDates = ["Semua", ...new Set(matchHistory
    .map(m => {
      if (!m.updatedAt) return null;
      const d = new Date(m.updatedAt);
      return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })
    .filter(Boolean)
  )].sort((a, b) => {
    if (a === "Semua") return -1;
    if (b === "Semua") return 1;
    return new Date(b) - new Date(a);
  });

  // --- LOGIKA FILTER UTAMA ---
  const filteredMatches = matchHistory.filter((m) => {
    const p1Exists = m.peserta1Id || m.doubleTeam1Id;
    const p2Exists = m.peserta2Id || m.doubleTeam2Id;

    if (!p1Exists || !p2Exists) return false;

    const isDouble = !!m.doubleTeam1Id;

    // 1. Filter Nama
    const p1Names = isDouble 
      ? `${m.doubleTeam1?.namaTim} ${m.doubleTeam1?.Player1?.namaLengkap} ${m.doubleTeam1?.Player2?.namaLengkap}`
      : `${m.peserta1?.namaLengkap}`;
    const p2Names = isDouble 
      ? `${m.doubleTeam2?.namaTim} ${m.doubleTeam2?.Player1?.namaLengkap} ${m.doubleTeam2?.Player2?.namaLengkap}`
      : `${m.peserta2?.namaLengkap}`;
    const isNameMatch = (p1Names + p2Names).toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filter Kelompok Umur
    const matchKU = m.bagan?.KelompokUmur?.nama || "Umum";
    const isKUMatch = filterKU === "Semua" || matchKU === filterKU;

    // 3. Filter Format (Tunggal / Ganda)
    const isTypeMatch = filterType === "Semua" || 
      (filterType === "Ganda" && isDouble) || 
      (filterType === "Tunggal" && !isDouble);

    // 4. Filter Tanggal
    const matchDate = new Date(m.updatedAt).toISOString().split('T')[0];
    const isDateMatch = filterDate === "Semua" || matchDate === filterDate;

    return isNameMatch && isKUMatch && isTypeMatch && isDateMatch;
  });

  const handleLihatLog = async (match) => {
    try {
      const response = await api.get(`/match-logs/${match.id}`);

      if (response.data?.length > 0) {
        const sortedLogs = response.data.sort((a, b) => {
          if (a.setKe !== b.setKe) {
            return a.setKe - b.setKe;
          }
          return a.id - b.id;
        });

        const tbData = {};
        [1, 2, 3].forEach(sNum => {
          const s1 = parseInt(match[`set${sNum}P1`]);
          const s2 = parseInt(match[`set${sNum}P2`]);
          const result = getTiebreakFromLogs(sortedLogs, sNum, s1, s2);
          if (result) tbData[`set${sNum}`] = result;
        });

        setTiebreakSummary(prev => ({ ...prev, [match.id]: tbData }));
        setSelectedLog(sortedLogs);
        setActiveMatchInfo(match);
        setIsModalOpen(true);
      } else {
        alert("Log poin belum tersedia.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (seconds = 0) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const getTiebreakFromLogs = (allLogs, setNum, finalS1, finalS2) => {
    const setLogs = allLogs
      .filter(log => log.setKe === setNum)
      .sort((a, b) => a.id - b.id);

    if (setLogs.length === 0) return null;

    const isSuperTiebreak =
      setNum === 3 &&
      setLogs.every(
        log => Number(log.gameP1) === 0 && Number(log.gameP2) === 0
      );

    if (isSuperTiebreak) {
      const lastLog = setLogs[setLogs.length - 1];
      return {
        p1: Number(lastLog.skorP1),
        p2: Number(lastLog.skorP2),
      };
    }

    let tbEndIndex = -1;

    for (let i = 0; i < setLogs.length - 1; i++) {
      const current = setLogs[i];
      const next = setLogs[i + 1];

      if (
        current.gameP1 !== next.gameP1 ||
        current.gameP2 !== next.gameP2
      ) {
        tbEndIndex = i;
      }
    }

    if (tbEndIndex === -1) return null;

    const lastTbLog = setLogs[tbEndIndex];
    let p1 = Number(lastTbLog.skorP1);
    let p2 = Number(lastTbLog.skorP2);

    if (finalS1 > finalS2) {
      p1 += 1;
    } else {
      p2 += 1;
    }

    return { p1, p2 };
  };

  const isAnyFilterActive = searchTerm !== "" || filterKU !== "Semua" || filterType !== "Semua" || filterDate !== "Semua";

  return (
    <div className="min-h-screen pb-16">
      
      {/* ===== HEADER AREA ===== */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Skor Pertandingan
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
          Riwayat skor resmi, rekap per set, dan rincian alur poin pertandingan
        </p>
      </div>

      {/* ===== PANEL FILTER ===== */}
      <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            <Filter size={14} className="text-amber-500" />
            <span>Filter Pertandingan</span>
          </div>
          {isAnyFilterActive && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterKU("Semua");
                setFilterType("Semua");
                setFilterDate("Semua");
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              <RotateCcw size={12} /> Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter Cari */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Cari Pemain / Tim
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 placeholder:font-normal" 
                placeholder="Ketik nama peserta / tim..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Kelompok Umur */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Kelompok Umur
            </label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer" 
              value={filterKU} 
              onChange={(e) => setFilterKU(e.target.value)}
            >
              {listKU.map(ku => (
                <option key={ku} value={ku}>
                  {ku === "Semua" ? "Semua Kelompok Umur" : ku}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Format */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Format Kategori
            </label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Semua">Semua Format</option>
              <option value="Tunggal">Tunggal (Single)</option>
              <option value="Ganda">Ganda (Double)</option>
            </select>
          </div>

          {/* Filter Tanggal */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Tanggal Pertandingan
            </label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
            >
              {listDates.map((dateString) => (
                <option key={dateString} value={dateString}>
                  {dateString === "Semua" 
                    ? "Semua Tanggal" 
                    : new Date(dateString).toLocaleDateString('id-ID', { 
                        weekday: 'short',
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })
                  }
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== LIST HASIL PERTANDINGAN ===== */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mb-3 animate-spin">
              <Trophy size={22} />
            </div>
            <p className="font-extrabold text-slate-700 text-sm">Memuat Riwayat Skor...</p>
            <p className="text-slate-400 text-xs mt-1">Mengambil data pertandingan selesai dan rekap poin tiebreak</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white py-16 px-4 rounded-2xl text-center border-2 border-dashed border-slate-200 shadow-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Search size={22} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">Tidak Ada Pertandingan Ditemukan</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              {isAnyFilterActive 
                ? "Tidak ada data skor yang cocok dengan filter yang Anda tentukan. Coba ubah atau reset filter."
                : "Belum ada pertandingan yang selesai pada turnamen yang dipilih."}
            </p>
            {isAnyFilterActive && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterKU("Semua");
                  setFilterType("Semua");
                  setFilterDate("Semua");
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <RotateCcw size={12} /> Reset Filter
              </button>
            )}
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isDouble = !!match.doubleTeam1Id;
            const p1Name = isDouble ? match.doubleTeam1?.namaTim : match.peserta1?.namaLengkap;
            const p2Name = isDouble ? match.doubleTeam2?.namaTim : match.peserta2?.namaLengkap;
            
            const isP1Winner = isDouble ? (match.winnerDoubleId === match.doubleTeam1Id) : (match.winnerId === match.peserta1Id);
            const isP2Winner = isDouble ? (match.winnerDoubleId === match.doubleTeam2Id) : (match.winnerId === match.peserta2Id);

            return (
              <div 
                key={match.id} 
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  highlightMatchId === match.id 
                    ? 'border-amber-400 ring-2 ring-amber-400/30' 
                    : 'border-slate-200/90'
                }`}
              >
                {/* Header Kartu */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge Bagan */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      <Tag size={11} className="text-amber-600" />
                      {match.bagan?.nama || "Match"}
                    </span>

                    {/* Badge Kategori */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      isDouble 
                        ? 'bg-purple-50 text-purple-700 border-purple-200/70' 
                        : 'bg-blue-50 text-blue-700 border-blue-200/70'
                    }`}>
                      {isDouble ? <Users size={11}/> : <User size={11}/>}
                      {isDouble ? 'Ganda' : 'Tunggal'}
                    </span>

                    {/* Kelompok Umur */}
                    {match.bagan?.KelompokUmur?.nama && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 text-[10px] font-bold">
                        {match.bagan.KelompokUmur.nama}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Match {match.slot} • Round {match.round}
                  </div>
                </div>

                {/* Main Card: Matchup & Scoreboard */}
                <div className="p-5 sm:p-7">
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-5 sm:gap-6">

                    {/* Sisi Peserta 1 */}
                    <div className={`md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left ${
                      isP1Winner ? "text-slate-900" : "text-slate-500 opacity-80"
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                        <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                          {p1Name || "Peserta 1"}
                        </h4>
                        {isP1Winner && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            <Award size={11} className="text-amber-600" /> Winner
                          </span>
                        )}
                      </div>

                      {/* Detail Anggota Tim Ganda */}
                      {isDouble && match.doubleTeam1 && (
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {match.doubleTeam1.Player1?.namaLengkap} &amp; {match.doubleTeam1.Player2?.namaLengkap}
                        </p>
                      )}
                    </div>

                    {/* Scoreboard Tengah */}
                    <div className="md:col-span-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                      {[1, 2, 3].map((sNum) => {
                        const s1 = parseInt(match[`set${sNum}P1`]);
                        const s2 = parseInt(match[`set${sNum}P2`]);

                        if (isNaN(s1) || isNaN(s2)) return null;

                        if (sNum === 3) {
                          const totalSetPlayed = match.score1 + match.score2;
                          if (totalSetPlayed < 3) return null;
                        }

                        if (s1 === 0 && s2 === 0 && sNum === 2) return null;

                        const gameLimit = match.scoreRule?.gamePerSet || 6;
                        const isTiebreakGame = Math.abs(s1 - s2) === 1 && (s1 >= gameLimit || s2 >= gameLimit);
                        const tbPoint = tiebreakSummary[match.id]?.[`set${sNum}`];

                        return (
                          <div
                            key={sNum}
                            className="flex flex-col items-center bg-slate-900 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl min-w-[88px] sm:min-w-[92px] border border-slate-800 shadow-sm"
                          >
                            <span className="text-[8px] text-amber-400 font-extrabold uppercase tracking-widest mb-0.5 sm:mb-1">
                              {sNum === 3 ? "SUPER TB" : `SET ${sNum}`}
                            </span>

                            <div className="flex items-center justify-center gap-1.5 font-mono font-black text-white text-xl sm:text-2xl">
                              {/* Skor P1 */}
                              <div className="relative inline-flex items-center">
                                <span className={s1 > s2 ? "text-amber-300" : "text-white"}>
                                  {sNum === 3 && tbPoint ? tbPoint.p1 : s1}
                                </span>
                                {sNum !== 3 && isTiebreakGame && tbPoint && (
                                  <span className="absolute -top-1 -right-3 text-[10px] text-amber-400 font-bold">
                                    ({tbPoint.p1})
                                  </span>
                                )}
                              </div>

                              <span className="text-slate-600 font-normal px-0.5">-</span>

                              {/* Skor P2 */}
                              <div className="relative inline-flex items-center">
                                <span className={s2 > s1 ? "text-amber-300" : "text-white"}>
                                  {sNum === 3 && tbPoint ? tbPoint.p2 : s2}
                                </span>
                                {sNum !== 3 && isTiebreakGame && tbPoint && (
                                  <span className="absolute -top-1 -right-3 text-[10px] text-amber-400 font-bold">
                                    ({tbPoint.p2})
                                  </span>
                                )}
                              </div>
                            </div>

                            {isTiebreakGame && !tbPoint && (
                              <div className="mt-1 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Sisi Peserta 2 */}
                    <div className={`md:col-span-4 flex flex-col items-center md:items-end text-center md:text-right ${
                      isP2Winner ? "text-slate-900" : "text-slate-500 opacity-80"
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
                        {isP2Winner && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            <Award size={11} className="text-amber-600" /> Winner
                          </span>
                        )}
                        <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                          {p2Name || "Peserta 2"}
                        </h4>
                      </div>

                      {/* Detail Anggota Tim Ganda */}
                      {isDouble && match.doubleTeam2 && (
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {match.doubleTeam2.Player1?.namaLengkap} &amp; {match.doubleTeam2.Player2?.namaLengkap}
                        </p>
                      )}
                    </div>

                  </div>
                </div>

                {/* Footer Kartu */}
                <div className="bg-slate-50/70 px-5 py-3 sm:px-7 sm:py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600">
                    {/* Tanggal */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                      <Calendar size={13} className="text-blue-500" />
                      <span>
                        {new Date(match.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Jam / Durasi */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                      <Clock size={13} className="text-indigo-500" />
                      <span>{formatDuration(match.durasi)}</span>
                    </div>

                    {/* Wasit */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                      <User size={13} className={match.referee ? "text-emerald-500" : "text-slate-400"} />
                      <span>Wasit: {match.referee?.name || "Belum ada"}</span>
                    </div>

                    {/* Rules Skor */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                      <Layers size={13} className="text-amber-500" />
                      <span>Rules: {match.scoreRule?.name || "Default"}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleLihatLog(match)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    <span>Detail Poin</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== MODAL DETAIL POIN LOG ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            {/* Header Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-600 shadow-2xs">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    Rincian Alur Poin
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {activeMatchInfo?.bagan?.nama} • Match #{activeMatchInfo?.slot} (Round {activeMatchInfo?.round})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tombol Export PDF */}
                <button 
                  onClick={handleExportPDFLog}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95"
                  title="Unduh laporan skor PDF"
                >
                  <FileText size={14} className="text-rose-500" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>

                {/* Tombol Tutup */}
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-all"
                  aria-label="Tutup modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Match Summary Box di dalam Modal */}
            {activeMatchInfo && (
              <div className="px-5 sm:px-6 pt-4 pb-2 bg-white">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                      Pertandingan Resmi
                    </div>
                    <div className="text-sm sm:text-base font-black truncate mt-0.5">
                      {activeMatchInfo.doubleTeam1Id 
                        ? activeMatchInfo.doubleTeam1?.namaTim 
                        : activeMatchInfo.peserta1?.namaLengkap} 
                      <span className="text-amber-400 font-normal mx-2">vs</span>
                      {activeMatchInfo.doubleTeam1Id 
                        ? activeMatchInfo.doubleTeam2?.namaTim 
                        : activeMatchInfo.peserta2?.namaLengkap}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-slate-800 text-amber-300 font-mono font-black text-sm sm:text-base border border-slate-700">
                      {activeMatchInfo.score1} - {activeMatchInfo.score2}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Body Modal: Point Logs */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {Object.values(
                [...selectedLog].reduce((acc, log) => {
                  if (!acc[log.setKe]) acc[log.setKe] = { set: log.setKe, data: [] };
                  acc[log.setKe].data.push(log);
                  return acc;
                }, {})
              ).map((group) => (
                <div key={group.set}>
                  {/* Set Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-slate-900 text-amber-300 text-xs font-black rounded-lg">
                      SET {group.set}
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-center w-12">#</th>
                          <th className="px-4 py-3">Skor Poin</th>
                          <th className="px-4 py-3 text-center">Rekap Game</th>
                          <th className="px-4 py-3">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.data.map((log, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-4 py-3 text-center font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-md font-mono font-black text-xs ${
                                  log.skorP1 > log.skorP2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {log.skorP1}
                                </span>
                                <span className="text-slate-300 font-bold">:</span>
                                <span className={`px-2 py-1 rounded-md font-mono font-black text-xs ${
                                  log.skorP2 > log.skorP1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {log.skorP2}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-black text-slate-800 bg-slate-50/40">
                              {log.gameP1} - {log.gameP2}
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-medium text-xs">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                {log.keterangan || "Point Exchange"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-2">
                    {group.data.map((log, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-black text-slate-400 w-4">#{idx + 1}</span>
                          <div className="flex items-center gap-1.5 font-mono font-black text-xs">
                            <span className={log.skorP1 > log.skorP2 ? 'text-amber-700 font-black' : 'text-slate-600'}>
                              {log.skorP1}
                            </span>
                            <span className="text-slate-300">:</span>
                            <span className={log.skorP2 > log.skorP1 ? 'text-amber-700 font-black' : 'text-slate-600'}>
                              {log.skorP2}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 text-[11px] text-slate-600 font-medium truncate ml-1">
                          {log.keterangan || "Point Exchange"}
                        </div>
                        <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-black text-[11px] text-slate-800 shadow-2xs">
                          {log.gameP1} - {log.gameP2}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkorPage;