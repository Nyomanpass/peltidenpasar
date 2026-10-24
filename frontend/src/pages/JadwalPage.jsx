import React, { useState, useEffect } from 'react';
import api from '../api';
import WinnerModal from "../components/modalbox/WinnerModal";
import { 
  Edit, 
  Scale, 
  Calendar, 
  Clock, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Layout, 
  Filter, 
  ChevronUp,
  Plus,
  X,
  Trash2,
  Trophy,
  MoreVertical,
  Play,
  RotateCcw,
  FileDown
} from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import JadwalPDF from './JadwalPDF';
import RefereeForm from './RefereeForm';
import AlertMessage from '../components/AlertMessage';


const getHasilMatch = (m) => {
  if (!m) return null;
  const isDouble = !!(m.doubleTeam1Id || m.doubleTeam2Id);
  const winnerId = isDouble ? m.winnerDoubleId : m.winnerId;
  const side1Id = isDouble ? m.doubleTeam1Id : m.peserta1Id;
  const side2Id = isDouble ? m.doubleTeam2Id : m.peserta2Id;
  const p1Won = winnerId != null && winnerId === side1Id;
  const p2Won = winnerId != null && winnerId === side2Id;
  const nama1 = m.doubleTeam1?.namaTim || m.peserta1?.namaLengkap;
  const nama2 = m.doubleTeam2?.namaTim || m.peserta2?.namaLengkap;
  return { p1Won, p2Won, winnerName: p1Won ? nama1 : p2Won ? nama2 : null };
};

const JadwalPage = ({ tournamentId: propTournamentId }) => {
  const [jadwal, setJadwal] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lapangan, setLapangan] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");
  const activeTournamentId = propTournamentId || localStorage.getItem("selectedTournament");
  const [isRefereeMode, setIsRefereeMode] = useState(false);
  const [activeMatchData, setActiveMatchData] = useState(null);
  
  // --- STATE BARU UNTUK PILIH BAGAN ---
  const [baganList, setBaganList] = useState([]);
  const [selectedBaganId, setSelectedBaganId] = useState('');

  // Form state
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedLapangan, setSelectedLapangan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State untuk mode edit
  const [editingJadwalId, setEditingJadwalId] = useState(null);

  // filter jadwal dengan tanggal
  const [selectedTanggalFilter, setSelectedTanggalFilter] = useState('');
  const [readyToDownload, setReadyToDownload] = useState(false);

  const [filterBaganKategori, setFilterBaganKategori] = useState("all");

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [scoreRules, setScoreRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [pendingJadwal, setPendingJadwal] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  // Modal Form Controller
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); 

  const [manualWinnerMatch, setManualWinnerMatch] = useState(null);

  const [ruleMode, setRuleMode] = useState(null); 

  const uniqueTanggal = [...new Set(jadwal.map(j => j.tanggal))].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    jadwalId: null,
  });



// --- GANTI DENGAN KODE INI ---
useEffect(() => {
  if (uniqueTanggal.length > 0 && !selectedTanggalFilter) {
    // 1. Dapatkan tanggal hari ini (Format YYYY-MM-DD)
    const today = new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    // 2. Cek apakah hari ini ada di daftar jadwal
    const isTodayAvailable = uniqueTanggal.includes(today);

    if (isTodayAvailable) {
      // JIKA ADA HARI INI: Aktifkan hari ini
      setSelectedTanggalFilter(today);
    } else {
      // JIKA TIDAK ADA: Ambil tanggal paling besar/terakhir
      // Karena uniqueTanggal sudah di-sort (a - b), maka index terakhir adalah yang terbesar
      const tanggalTerakhir = uniqueTanggal[uniqueTanggal.length - 1];
      setSelectedTanggalFilter(tanggalTerakhir);
    }
  }
}, [uniqueTanggal, selectedTanggalFilter]);


  useEffect(() => {
    fetchJadwal();
    fetchBagan();
    fetchLapangan();
  }, []);



  // --- Gunakan useEffect ini untuk memuat matches saat bagan dipilih ---
  useEffect(() => {
    // Hanya memuat matches jika ada bagan yang dipilih
    if (selectedBaganId) {
      fetchMatches(selectedBaganId);
    } else {
      // Kosongkan matches jika tidak ada bagan yang dipilih
      setMatches([]);
    }
  }, [selectedBaganId]);

  useEffect(() => {
    api.get("/score-rules").then(res => setScoreRules(res.data));
  }, []);


  useEffect(() => {
    const reloadAll = () => {
      fetchBagan();          // ← ambil bagan baru sesuai tournament baru
      setSelectedBaganId(""); // ← reset bagan yg dipilih
      setMatches([]);         // ← kosongkan match dulu
      fetchJadwal();
    };

    window.addEventListener("tournament-changed", reloadAll);

    return () => window.removeEventListener("tournament-changed", reloadAll);
  }, []);



  const fetchJadwal = async () => {
    try {
      const response = await api.get('/jadwal', {
        params: { tournamentId: activeTournamentId }
      });
      setJadwal(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal mengambil jadwal.');
    }
  };

  // --- FUNGSI BARU UNTUK MENGAMBIL DAFTAR BAGAN ---
  const fetchBagan = async () => {
    try {
      const res = await api.get("/bagan", {
        params: { tournamentId: activeTournamentId }
      });

      setBaganList(res.data);
    } catch (err) {
      console.error("Gagal fetch bagan:", err);
    }
  };


  const fetchMatches = async (baganId, currentEditingId = null) => {
    try {
      const response = await api.get('/matches', {
        params: { baganId: baganId, tournamentId: activeTournamentId }
      });
      
      let data = response.data;

      let matchesBelumSelesai = data.filter(
        m => m.status === 'belum' || m.status === 'aktif'
      );

      // Gunakan currentEditingId dari parameter, bukan dari state global
      matchesBelumSelesai = matchesBelumSelesai.filter(
        m => !jadwal.some(j => j.matchId === m.id && j.id !== (currentEditingId || editingJadwalId))
      );

      setMatches(matchesBelumSelesai);
      return matchesBelumSelesai; 
    } catch (err) {
      console.error('Error:', err);
    }
  };


  const fetchLapangan = async () => {
    try {
      const response = await api.get('/lapangan');
      setLapangan(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJadwalId(null);
    setSelectedBaganId('');
    setMatches([]);
    setSelectedMatch('');
    setSelectedLapangan('');
    setTanggal(selectedTanggalFilter || '');
    setWaktuMulai('');
    setError('');
    setIsFormModalOpen(true);
  };

  const handleEditClick = async (jadwalData) => { 
    setEditingJadwalId(jadwalData.id);
    
    const baganId = jadwalData.match?.baganId;
    setSelectedBaganId(baganId);
    
    if (baganId) {
      await fetchMatches(baganId, jadwalData.id); 
    }

    setSelectedMatch(jadwalData.matchId);
    setSelectedLapangan(jadwalData.lapanganId);
    setTanggal(jadwalData.tanggal);

    const waktuMulaiFormatted = jadwalData.waktuMulai ? jadwalData.waktuMulai.slice(11, 16) : '';
    setWaktuMulai(waktuMulaiFormatted);
    
    setSuccess('');
    setError('');
    setIsFormModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingJadwalId(null);
    setSelectedBaganId('');
    setMatches([]);
    setSelectedMatch('');
    setSelectedLapangan('');
    setTanggal('');
    setWaktuMulai('');
    setIsFormModalOpen(false);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMatch || !selectedLapangan || !tanggal || !waktuMulai) {
      setError('Semua kolom harus diisi.');
      return;
    }

    const waktuMulaiFull = `${tanggal}T${waktuMulai}:00.000Z`;

    const jadwalData = {
      matchId: selectedMatch,
      lapanganId: selectedLapangan,
      tanggal,
      waktuMulai: waktuMulaiFull,
      tournamentId: activeTournamentId
    };

    try {
      if (editingJadwalId) {
        await api.put(`/jadwal/${editingJadwalId}`, jadwalData);
        setSuccess('Jadwal berhasil diperbarui!');
      } else {
        await api.post('/jadwal', jadwalData);
        setSuccess('Jadwal berhasil dibuat!');
      }
      
      handleCancelEdit();
      fetchJadwal();

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Gagal menyimpan jadwal.');
    }
  };
    
  const handleUpdateStatus = async (jadwalId, newStatus) => {
    try {
      await api.put(`/jadwal/${jadwalId}/status`, { status: newStatus });
      setSuccess('Status jadwal berhasil diubah.');
      fetchJadwal();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Gagal mengubah status jadwal.');
    }
  };

  const handleDeleteJadwal = (jadwalId) => {
    setConfirmDelete({
      show: true,
      jadwalId: jadwalId,
    });
  };

  const confirmDeleteJadwal = async () => {
    try {
      await api.delete(`/jadwal/${confirmDelete.jadwalId}`);
      setSuccess("Jadwal berhasil dihapus.");
      fetchJadwal();
    } catch (err) {
      setError("Gagal menghapus jadwal.");
    } finally {
      setConfirmDelete({ show: false, jadwalId: null });
    }
  };

  const filteredMatches = matches.filter((m) => {
    const isAlreadyScheduled = jadwal.some(
      (j) => Number(j.matchId) === Number(m.id)
    );

    if (editingJadwalId && Number(selectedMatch) === Number(m.id)) {
      return true;
    }
    return !isAlreadyScheduled;
  });
  
const groupedJadwal = [...jadwal]
  .sort((a, b) => {
    // 1. Urutkan berdasarkan lapangan
    if (a.lapanganId !== b.lapanganId) {
      return a.lapanganId - b.lapanganId;
    }
    // 2. Jika lapangan sama, urutkan berdasarkan waktu
    return new Date(a.waktuMulai) - new Date(b.waktuMulai);
  })
  .reduce((acc, currentJadwal) => {
    const lapanganName = currentJadwal.lapangan?.nama || "Lapangan Tidak Dikenal";
    if (!acc[lapanganName]) {
      acc[lapanganName] = [];
    }
    acc[lapanganName].push(currentJadwal);
    return acc;
  }, {});


  const lapanganList = Object.keys(groupedJadwal);

  const openRefereePanel = (jadwal) => {
    setActiveMatchData(jadwal); // Menyimpan data match yang dipilih
    setIsRefereeMode(true);     // Pindah ke tampilan wasit
  };


  if (isRefereeMode) {
    return (
      <RefereeForm 
        match={activeMatchData.match} 
        onFinish={async (finalData) => {
          try {
            // 1. Update status JADWAL menjadi selesai
            await api.put(`/jadwal/${activeMatchData.id}/status`, { 
              status: 'selesai' 
            });

            // 2. Keluar dari mode wasit
            setIsRefereeMode(false);

            // 3. Refresh data agar kartu langsung jadi hijau dan skor muncul
            fetchJadwal();
            setSuccess("Pertandingan selesai & skor otomatis tersimpan!");
          } catch (err) {
            console.error("Gagal menutup jadwal:", err);
            setIsRefereeMode(false);
          }
        }}
        onBack={() => setIsRefereeMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Notifikasi */}
      <AlertMessage
        type="success"
        message={success}
        onClose={() => setSuccess("")}
      />

<AlertMessage
  type="error"
  message={error}
  onClose={() => setError("")}
/>

{/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
              <Trophy size={13} className="text-amber-600" />
              {selectedTournamentName || "PELTI Denpasar"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Jadwal Pertandingan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Kelola alur pertandingan, lapangan, dan jadwal turnamen resmi
          </p>
        </div>

        {/* Action Buttons */}
        {(role === "admin" || role === "panitia") && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
            >
              <Plus size={16} /> Buat Jadwal Baru
            </button>

            {!readyToDownload ? (
              <button
                onClick={() => setReadyToDownload(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
              >
                <FileDown size={16} /> Export PDF
              </button>
            ) : (
              <PDFDownloadLink
                document={
                  <JadwalPDF 
                    jadwal={selectedTanggalFilter 
                      ? jadwal.filter(j => j.tanggal === selectedTanggalFilter) 
                      : jadwal
                    } 
                    lapanganList={[...new Set(jadwal.map(j => j.lapangan?.nama))].filter(Boolean)} 
                    selectedTanggal={selectedTanggalFilter}
                    tournamentName={selectedTournamentName}
                  />
                }
                fileName={`Jadwal_${selectedTournamentName || 'Turnamen'}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
              >
                {({ loading }) => (
                  loading ? (
                    <span className="flex items-center gap-2 animate-pulse">Memproses...</span>
                  ) : (
                    <span className="flex items-center gap-2" onClick={() => setTimeout(() => setReadyToDownload(false), 2000)}>
                      <FileDown size={16} /> Unduh PDF
                    </span>
                  )
                )}
              </PDFDownloadLink>
            )}
          </div>
        )}
      </div>

      {/* ===== FILTER TANGGAL ===== */}
      {uniqueTanggal.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
                <Calendar size={15} />
              </div>
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Filter Tanggal
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {uniqueTanggal.map(tgl => {
                const isSelected = selectedTanggalFilter === tgl;
                return (
                  <button
                    key={tgl}
                    onClick={() => setSelectedTanggalFilter(tgl)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/50'
                    }`}
                  >
                    {new Date(tgl).toLocaleDateString('id-ID', { 
                      weekday: 'short',
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </button>
                );
              })}
              
              {selectedTanggalFilter && (
                <button
                  onClick={() => setSelectedTanggalFilter('')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Tampilkan Semua
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAMPILAN JADWAL (TABLE GRID) ===== */}
      {lapanganList.length > 0 ? (
        <div className="w-full overflow-hidden rounded-2xl shadow-xs border border-slate-200/80 bg-white mb-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] md:min-w-full table-fixed border-separate border-spacing-x-1 md:border-spacing-x-2 border-spacing-y-2 p-2">
              
              <colgroup>
                <col className="w-[70px] md:w-[90px]" />
                {lapanganList.map((_, i) => (
                  <col key={i} className="w-[240px] md:w-auto" />
                ))}
              </colgroup>

              <thead>
                <tr>
                  <th className="py-3 sticky left-0 z-40 bg-white/95 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Clock size={15} className="text-slate-500 mb-1" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">JAM</span>
                    </div>
                  </th>
                  {lapanganList.map((lap) => (
                    <th key={lap} className="py-3 px-1">
                      <div className="bg-slate-50 border border-slate-200/80 py-2.5 px-3 rounded-xl text-xs font-extrabold text-slate-800 uppercase tracking-wider shadow-xs flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-xs"></span>
                        <span className="truncate">{lap}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-transparent">
                {[...new Set(
                  jadwal
                    .filter(j => !selectedTanggalFilter || j.tanggal === selectedTanggalFilter)
                    .map(j => j.waktuMulai.slice(11, 16))
                )]
                  .sort()
                  .map((jam) => (
                    <tr key={jam} className="group">
                      {/* Sticky Kolom JAM */}
                      <td className="py-3 sticky left-0 z-40 bg-white/95 backdrop-blur-sm group-hover:bg-amber-50/30 transition-colors rounded-xl border border-slate-100 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.05)]">
                        <div className="text-center">
                          <span className="block text-sm font-extrabold text-slate-900 leading-none">
                            {jam}
                          </span>
                        </div>
                      </td>

                      {lapanganList.map((lap) => {
                        const match = jadwal.find(j =>
                          j.waktuMulai.slice(11, 16) === jam &&
                          j.lapangan?.nama === lap &&
                          (!selectedTanggalFilter || j.tanggal === selectedTanggalFilter)
                        );
                        const hasil = match?.status === "selesai" ? getHasilMatch(match.match) : null;

                        return (
                          <td key={lap} className="py-2 align-top">
                            {match ? (
                              <div className="h-full bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-md rounded-2xl p-4 transition-all relative group/card flex flex-col justify-between">
                                
                                {/* Menu Admin (⋮) */}
                                {["admin", "panitia", "wasit"].includes(role) && (
                                  <div className="absolute top-3 right-3 z-30">
                                    <button
                                      onClick={() => setOpenMenuId(openMenuId === match.id ? null : match.id)}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition-all shadow-xs"
                                    >
                                      <MoreVertical size={15} />
                                    </button>
                                    
                                    {openMenuId === match.id && (
                                      <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden border border-slate-100 py-1">
                                        {(role === "admin" || role === "panitia") && (
                                          <button 
                                            onClick={() => { handleEditClick(match); setOpenMenuId(null); }} 
                                            className="block w-full text-left px-3.5 py-2 hover:bg-amber-50 hover:text-amber-700 text-xs font-bold text-slate-700 border-b border-slate-50 transition-colors"
                                          >
                                            Edit Jadwal
                                          </button>
                                        )}
                                        {match.status !== "selesai" && ["admin", "panitia", "wasit"].includes(role) && (
                                          <button 
                                            onClick={() => {
                                              setPendingJadwal(match);
                                              setRuleMode("manual");

                                              if (!match.match.scoreRuleId) {
                                                setShowRuleModal(true);
                                              } else {
                                                setManualWinnerMatch(match.match);
                                              }

                                              setOpenMenuId(null);
                                            }}
                                            className="block w-full text-left px-3.5 py-2 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold text-slate-700 border-b border-slate-50 transition-colors"
                                          >
                                            Input Pemenang
                                          </button>
                                        )}
                                        {(role === "admin" || role === "panitia") && (
                                          <button 
                                            onClick={() => { handleDeleteJadwal(match.id); setOpenMenuId(null); }} 
                                            className="block w-full text-left px-3.5 py-2 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-rose-600 transition-colors"
                                          >
                                            Hapus Jadwal
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-col h-full">
                                  {/* Bagan Name */}
                                  <div className="inline-block self-start mb-2 pr-7">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 truncate block max-w-[150px]">
                                      {match.match?.bagan?.nama || 'Tournament'}
                                    </span>
                                  </div>
                                  
                                  {/* Nama Tim / Peserta */}
                                  <div className="space-y-1.5 mb-3">
                                    <p className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">
                                      {match.match?.doubleTeam1?.namaTim || match.match?.peserta1?.namaLengkap || 'TBD'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <div className="h-[1px] flex-1 bg-slate-100"></div>
                                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">VS</span>
                                      <div className="h-[1px] flex-1 bg-slate-100"></div>
                                    </div>
                                    <p className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">
                                      {match.match?.doubleTeam2?.namaTim || match.match?.peserta2?.namaLengkap || 'TBD'}
                                    </p>
                                  </div>

                                  {/* Skor & Pemenang */}
                                  {hasil && (
                                    <div className="mt-1 mb-2 p-2 bg-slate-50/80 rounded-xl border border-slate-200/60">
                                      <div className="flex items-center justify-center gap-2 text-xs font-extrabold">
                                        <span className={hasil.p1Won ? "text-emerald-600 font-black" : "text-slate-400"}>
                                          {match.match.score1 ?? 0}
                                        </span>
                                        <span className="text-[9px] text-slate-300 font-bold uppercase">SET</span>
                                        <span className={hasil.p2Won ? "text-emerald-600 font-black" : "text-slate-400"}>
                                          {match.match.score2 ?? 0}
                                        </span>
                                      </div>
                                      {hasil.winnerName && (
                                        <p className="text-center text-[10px] font-black text-amber-700 bg-amber-50/80 border border-amber-200/50 rounded-lg py-0.5 px-1.5 mt-1 truncate">
                                          🏆 {hasil.winnerName}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Card Footer: Status & Action Button */}
                                  <div className="mt-auto pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                                        ${match.status === "selesai" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : 
                                          match.status === "berlangsung" ? "bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse" : 
                                          "bg-slate-100 text-slate-600 border border-slate-200/60"}`}
                                      >
                                        {match.status}
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    {["admin", "panitia", "wasit"].includes(role) && (
                                      <div>
                                        {(match.status === "terjadwal" || match.status === "belum" || match.status === "aktif") && (
                                          <button
                                            onClick={() => handleUpdateStatus(match.id, "berlangsung")}
                                            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-bold rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                          >
                                            <Play size={12} className="fill-white" />
                                            <span>MULAI</span>
                                          </button>
                                        )}

                                        {match.status === "berlangsung" && (
                                          <button
                                            onClick={() => {
                                              setPendingJadwal(match);
                                              setRuleMode("wasit");

                                              if (!match.match.scoreRuleId) {
                                                setShowRuleModal(true);
                                              } else {
                                                openRefereePanel(match);
                                              }
                                            }}
                                            className="w-full bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-[10px] font-bold rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                          >
                                            <span>PANEL WASIT</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Slot Kosong */
                              <div className="h-full flex items-center justify-center py-8 opacity-20">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mb-8">
          <Calendar size={36} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Belum Ada Jadwal</h3>
          <p className="text-xs text-slate-400 mt-1">
            Pilih tanggal lain atau buat jadwal baru untuk mengisi jadwal lapangan.
          </p>
        </div>
      )}

      {/* ===== MODAL FORM BUAT / EDIT JADWAL ===== */}
      {isFormModalOpen && (role === "admin" || role === "panitia") && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
                  {editingJadwalId ? <Edit size={20} /> : <Calendar size={20} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                    {editingJadwalId ? "Update Jadwal Pertandingan" : "Buat Jadwal Baru"}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Atur alur pertandingan, lapangan, tanggal, dan waktu pertandingan
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCancelEdit} 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Seleksi Bagan / Kelompok Umur */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                  1. Pilih Kelompok Umur / Bagan
                </label>
                
                {/* Filter Kategori: Semua, Tunggal, Ganda */}
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/50 mb-3">
                  {["all", "single", "double"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterBaganKategori(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        filterBaganKategori === cat 
                          ? "bg-white text-slate-900 shadow-xs" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {cat === "all" ? "Semua" : cat === "single" ? "Tunggal" : "Ganda"}
                    </button>
                  ))}
                </div>

                {/* List Tombol Bagan */}
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {baganList
                    .filter(b => filterBaganKategori === "all" ? true : b.kategori === filterBaganKategori)
                    .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId)
                    .map((bagan) => {
                      const ringkasNama = bagan.nama
                        .replace(/Bagan/gi, '')
                        .replace(/\(Tunggal\)/gi, '')
                        .replace(/\(Ganda\)/gi, '')
                        .trim();
                      const isSelected = selectedBaganId === Number(bagan.id);

                      return (
                        <button
                          key={bagan.id}
                          type="button"
                          onClick={() => setSelectedBaganId(Number(bagan.id))}
                          className={`py-2 px-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs font-bold'
                              : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 font-semibold'
                          }`}
                        >
                          <div className="text-xs">{ringkasNama}</div>
                          <div className={`text-[9px] uppercase tracking-wider font-extrabold ${isSelected ? "text-amber-100" : "text-slate-400"}`}>
                            {bagan.kategori}
                          </div>
                        </button>
                      );
                    })
                  }
                </div>
              </div>

              {/* Match Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  2. Pilih Pertandingan
                </label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
                  disabled={!selectedBaganId}
                >
                  <option value="">-- Pilih Pertandingan --</option>
                  {filteredMatches.map((m) => {
                    const p1 = m.doubleTeam1?.namaTim || m.peserta1?.namaLengkap || 'TBD';
                    const p2 = m.doubleTeam2?.namaTim || m.peserta2?.namaLengkap || 'TBD';
                    return (
                      <option key={m.id} value={m.id}>{p1} vs {p2}</option>
                    );
                  })}
                </select>
                {!selectedBaganId && (
                  <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
                    * Pilih kelompok umur / bagan di atas terlebih dahulu.
                  </p>
                )}
              </div>

              {/* Grid: Lapangan, Tanggal, Jam */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  3. Atur Lokasi &amp; Waktu
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                      Lapangan
                    </label>
                    <select
                      value={selectedLapangan}
                      onChange={(e) => setSelectedLapangan(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    >
                      <option value="">-- Lapangan --</option>
                      {lapangan.map((l) => (
                        <option key={l.id} value={l.id}>{l.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                      Waktu Mulai
                    </label>
                    <select
                      value={waktuMulai}
                      onChange={(e) => setWaktuMulai(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    >
                      <option value="">-- Jam --</option>
                      {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((jam) => (
                        <option key={jam} value={`${jam.toString().padStart(2, '0')}:00`}>
                          Pukul {jam}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 font-medium">
                  Pastikan data sudah benar sebelum menyimpan.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all flex items-center gap-2"
                  >
                    {editingJadwalId ? <Edit size={15} /> : <Plus size={15} />}
                    {editingJadwalId ? "Simpan Perubahan" : "Terbitkan Jadwal"}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL PILIH ATURAN SKOR */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 animate-in fade-in duration-200">

            {/* HEADER */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
                <Scale size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Pilih Aturan Skor
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan sistem perhitungan skor sebelum pertandingan dimulai
              </p>
            </div>

            {/* SELECT */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Aturan Skor
              </label>
              <select
                value={selectedRule}
                onChange={(e) => setSelectedRule(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="">-- Pilih Rule --</option>
                {scoreRules.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ACTION */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setSelectedRule("");
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Batal
              </button>

              <button
                disabled={!selectedRule}
                onClick={async () => {
                  await api.patch(`/matches/${pendingJadwal.match.id}/set-rule`, {
                    scoreRuleId: selectedRule
                  });

                  const updatedMatch = {
                    ...pendingJadwal.match,
                    scoreRuleId: selectedRule
                  };

                  const updatedJadwal = {
                    ...pendingJadwal,
                    match: updatedMatch
                  };

                  setPendingJadwal(updatedJadwal);
                  setShowRuleModal(false);

                  if (ruleMode === "wasit") {
                    openRefereePanel(updatedJadwal);
                  }

                  if (ruleMode === "manual") {
                    setManualWinnerMatch(updatedMatch);
                  }

                  setRuleMode(null);
                  setSelectedRule("");
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-xs
                  ${selectedRule
                    ? "bg-amber-500 hover:bg-amber-600 active:scale-95"
                    : "bg-slate-300 cursor-not-allowed"
                  }
                `}
              >
                Lanjutkan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS JADWAL */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Hapus Jadwal?</h2>
                <p className="text-xs text-slate-500">Pertandingan akan kembali ke daftar belum terjadwal.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete({ show: false, jadwalId: null })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteJadwal}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {manualWinnerMatch && (
  <WinnerModal
    match={manualWinnerMatch}
    onClose={() => setManualWinnerMatch(null)}
    onSaved={() => {
      setManualWinnerMatch(null);
      fetchJadwal(); // refresh tabel
    }}
  />
)}


</div>



  );
};

export default JadwalPage;