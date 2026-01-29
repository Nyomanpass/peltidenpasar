import React, { useState, useEffect } from 'react';
import api from '../api';
import WinnerModal from "../components/modalbox/WinnerModal";
import { Edit, Trash2, Calendar, Clock, PlusCircle, CheckCircle, XCircle, Layout, Filter } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import JadwalPDF from './JadwalPDF';
import RefereeForm from './RefereeForm';
import AlertMessage from '../components/AlertMessage';

const JadwalPage = () => {
  const [jadwal, setJadwal] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lapangan, setLapangan] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");

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

  // State untuk modal pemenang
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedMatchToScore, setSelectedMatchToScore] = useState(null);
  const [selectedJadwalIdToUpdate, setSelectedJadwalIdToUpdate] = useState(null);

  //filter jadwal dnegna tanggal
  const [selectedTanggalFilter, setSelectedTanggalFilter] = useState('');
  const [readyToDownload, setReadyToDownload] = useState(false);

  const [filterBaganKategori, setFilterBaganKategori] = useState("all");

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [scoreRules, setScoreRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState("");
  const [pendingJadwal, setPendingJadwal] = useState(null);


  const uniqueTanggal = [...new Set(jadwal.map(j => j.tanggal))].sort(
  (a, b) => new Date(a) - new Date(b)
  );

  // Set tanggal filter otomatis hanya jika belum ada yang dipilih
// --- GANTI DENGAN KODE INI ---
useEffect(() => {
  if (uniqueTanggal.length > 0 && !selectedTanggalFilter) {
    // 1. Ambil tanggal hari ini dalam format YYYY-MM-DD
    // Kita gunakan Intl.DateTimeFormat agar zona waktu sesuai dengan lokal (Indonesia)
    const today = new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    // 2. Cek apakah ada jadwal untuk tanggal hari ini
    const isTodayAvailable = uniqueTanggal.includes(today);

    if (isTodayAvailable) {
      // Jika hari ini ada jadwal, otomatis pilih hari ini
      setSelectedTanggalFilter(today);
    } else {
      // Jika tidak ada jadwal hari ini, pilih tanggal paling awal/kecil
      setSelectedTanggalFilter(uniqueTanggal[0]);
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
      const tournamentId = localStorage.getItem("selectedTournament");
      const response = await api.get('/jadwal', {
        params: { tournamentId }
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
    const newTournamentId = localStorage.getItem("selectedTournament"); // ← ambil ulang setiap kali fetch
    const res = await api.get("/bagan", {
      params: { tournamentId: newTournamentId }
    });

    setBaganList(res.data);
  } catch (err) {
    console.error("Gagal fetch bagan:", err);
  }
};


  const fetchMatches = async (baganId, currentEditingId = null) => {
    try {
      const newTournamentId = localStorage.getItem("selectedTournament");
      const response = await api.get('/matches', {
        params: { baganId: baganId, tournamentId: newTournamentId }
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

  const handleEditClick = async (jadwalData) => { 
    // 1. Set ID yang sedang diedit ke state
    setEditingJadwalId(jadwalData.id);
    
    const baganId = jadwalData.match.baganId;
    setSelectedBaganId(baganId);
    
    // 2. Oper jadwalData.id secara langsung sebagai argumen kedua
    // Ini memastikan filter di fetchMatches tahu bahwa match ini BOLEH muncul
    await fetchMatches(baganId, jadwalData.id); 

    // 3. Baru set matchId-nya
    setSelectedMatch(jadwalData.matchId);
    setSelectedLapangan(jadwalData.lapanganId);
    setTanggal(jadwalData.tanggal);

    const waktuMulaiFormatted = jadwalData.waktuMulai.slice(11, 16);
    setWaktuMulai(waktuMulaiFormatted);
    
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingJadwalId(null);
    setSelectedBaganId(''); // Tambahkan ini
    setMatches([]);
    setSelectedMatch('');
    setSelectedLapangan('');
    setTanggal('');
    setWaktuMulai('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMatch || !selectedLapangan || !tanggal || !waktuMulai) {
      setError('Semua kolom harus diisi.');
      return;
    }

    const waktuMulaiFull = `${tanggal}T${waktuMulai}:00.000Z`;
    const tournamentId = localStorage.getItem("selectedTournament");

    const jadwalData = {
      matchId: selectedMatch,
      lapanganId: selectedLapangan,
      tanggal,
      waktuMulai: waktuMulaiFull,
      tournamentId
    };

    try {
      if (editingJadwalId) {
        await api.put(`/jadwal/${editingJadwalId}`, jadwalData);
        setSuccess('Jadwal berhasil diperbarui!');
        handleCancelEdit(); // Ini biasanya sudah mereset form
         // --- RESET FORM SECARA TOTAL ---
        setSelectedBaganId(null); // Reset pilihan bagan
        setSelectedMatch('');
        setSelectedLapangan('');
        setTanggal('');
        setWaktuMulai('');
      } else {
        await api.post('/jadwal', jadwalData);
        setSuccess('Jadwal berhasil dibuat!');
        
        // --- RESET FORM SECARA TOTAL ---
        setSelectedBaganId(null); // Reset pilihan bagan
        setSelectedMatch('');
        setSelectedLapangan('');
        setTanggal('');
        setWaktuMulai('');
      }
      
      // Refresh data dari database
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

  const handleCompleteJadwal = (jadwal) => {
    setSelectedMatchToScore(jadwal.match);
    setSelectedJadwalIdToUpdate(jadwal.id);
    setShowWinnerModal(true);
  };

  const handleWinnerSaved = async () => {
    try {
      await api.put(`/jadwal/${selectedJadwalIdToUpdate}/status`, { status: 'selesai' });
      setSuccess('Skor dan pemenang berhasil disimpan. Jadwal berhasil diselesaikan.');
      
      fetchJadwal();
      fetchMatches(selectedBaganId); 
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Gagal memperbarui status jadwal.');
    } finally {
      setShowWinnerModal(false);
      setSelectedMatchToScore(null);
      setSelectedJadwalIdToUpdate(null);
    }
  };

  const handleDeleteJadwal = async (jadwalId) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?");
    if (!isConfirmed) {
      return;
    }

    try {
      await api.delete(`/jadwal/${jadwalId}`);
      setSuccess('Jadwal berhasil dihapus.');
      fetchJadwal();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Gagal menghapus jadwal.');
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
<div className="h-screen">

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

{/* --- HEADER UTAMA --- */}
<div className="mb-8 border-b pb-4">
  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
    Jadwal Pertandingan
  </h1>
  <p className="text-md text-yellow-600 font-semibold mt-1">
    Tournament: {selectedTournamentName || "Belum Memilih"}
  </p>
</div>

  
  {/* --- BAGIAN FORM: ADMIN --- */}
   {role === "admin" && (
    
  <div className="bg-white p-8 rounded-2xl shadow-2xl mb-10 border border-gray-100">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 pb-3">
      {editingJadwalId ? 'Update Jadwal Pertandingan' : 'Buat Jadwal Baru'}
    </h2>
    
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Pilihan Bagan (Custom Chip/Tag Selection) */}
     {/* --- FILTER KATEGORI BAGAN --- */}
<div>
 
  {/* Tab Filter (Semua / Single / Double) */}
  <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
    <button
      type="button"
      onClick={() => setFilterBaganKategori("all")}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
        filterBaganKategori === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Semua
    </button>
    <button
      type="button"
      onClick={() => setFilterBaganKategori("single")}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
        filterBaganKategori === "single" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Single
    </button>
    <button
      type="button"
      onClick={() => setFilterBaganKategori("double")}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
        filterBaganKategori === "double" ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Double
    </button>
  </div>

  {/* Daftar Chip Bagan yang sudah terfilter */}
  <div className="flex flex-wrap gap-3">
    {baganList.length === 0 ? (
      <p className="text-sm text-gray-500 italic">Tidak ada bagan yang tersedia.</p>
    ) : (
      baganList
        .filter(b => filterBaganKategori === "all" ? true : b.kategori === filterBaganKategori)
        .map((bagan) => (
          <span
            key={bagan.id}
            onClick={() => setSelectedBaganId(Number(bagan.id))}
            className={`py-2 px-4 rounded-full transition-all duration-200 text-sm font-semibold cursor-pointer select-none border shadow-sm flex items-center gap-1
              ${selectedBaganId === Number(bagan.id)
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
              }
            `}
          >
            <Layout size={14} /> 
            {bagan.nama}
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full border ${
              selectedBaganId === Number(bagan.id) 
              ? 'bg-blue-800 border-blue-400' 
              : 'bg-gray-200 border-gray-400 text-gray-500'
            }`}>
              {bagan.kategori}
            </span>
          </span>
        ))
    )}
    
    {/* Pesan jika hasil filter kosong */}
    {baganList.length > 0 && baganList.filter(b => filterBaganKategori === "all" ? true : b.kategori === filterBaganKategori).length === 0 && (
      <p className="text-sm text-orange-600 italic">Tidak ada bagan kategori {filterBaganKategori}.</p>
    )}
  </div>
</div>
      
      {/* Grid Input Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Match Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Match:</label>
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
           className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 transition-all duration-200 bg-white"
          disabled={!selectedBaganId}
        >
          <option value="">-- Pilih Match --</option>
          {filteredMatches.map((m) => {
            const p1 = m.doubleTeam1?.namaTim || m.peserta1?.namaLengkap || 'TBD';
            const p2 = m.doubleTeam2?.namaTim || m.peserta2?.namaLengkap || 'TBD';
            return (
              <option key={m.id} value={m.id}>
                {p1} vs {p2}
              </option>
            );
          })}
        </select>

        {/* Pesan Kondisional */}
        {!selectedBaganId ? (
          <p className="text-xs text-red-500 mt-1">Pilih bagan terlebih dahulu.</p>
        ) : filteredMatches.length === 0 ? (
          <p className="text-xs text-orange-600 mt-1 italic font-medium">
            ⚠️ Semua pertandingan pada bagan ini sudah dijadwalkan.
          </p>
        ) : null}
      </div>

        {/* Lapangan Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Lapangan:</label>
          <select
            value={selectedLapangan}
            onChange={(e) => setSelectedLapangan(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 transition-all duration-200 bg-white"
          >
            <option value="">-- Pilih Lapangan --</option>
            {lapangan.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal:</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 transition-all duration-200"
          />
        </div>
        
        {/* Waktu Mulai Input */}
       <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Mulai:</label>
          <select
            value={waktuMulai}
            onChange={(e) => setWaktuMulai(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 transition-all duration-200 bg-white"
          >
            <option value="">Pilih Jam</option>
            {/* Membuat pilihan jam dari jam 7 sampai 23 */}
            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((jam) => (
              <option key={jam} value={`${jam.toString().padStart(2, '0')}:00`}>
                Jam {jam}:00
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tombol Aksi Form */}
      <div className="flex space-x-3 pt-4 justify-end">
        {editingJadwalId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex items-center gap-2 bg-gray-500 text-white py-3 px-6 rounded-xl shadow-md hover:bg-gray-600 transition duration-300 font-semibold"
          >
            <XCircle size={20}/> Batal Edit
          </button>
        )}
        <button
          type="submit"

          className="flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 font-bold transform hover:scale-[1.01]"
        >
          {editingJadwalId ? <Edit size={20}/> : <PlusCircle size={20}/>}
          {editingJadwalId ? 'Update Jadwal' : 'Buat Jadwal'}
        </button>
      </div>

    </form>
  </div>
   )}

  {/* --- BAGIAN FILTER TANGGAL --- */}

  
  {/* --- BAGIAN FILTER DAN DOWNLOAD PDF --- */}
<div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    
    {/* Filter Sisi Kiri */}
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={20} className="text-yellow-500" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filter Tanggal:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueTanggal.map(tgl => (
          <button
            key={tgl}
            onClick={() => setSelectedTanggalFilter(tgl)}
            className={`py-2 px-5 rounded-lg font-bold text-sm transition-all duration-200 
              ${selectedTanggalFilter === tgl 
                ? 'bg-yellow-500 text-gray-900 shadow-md' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-200 border border-gray-200'}
            `}
          >
            {tgl}
          </button>
        ))}
        {selectedTanggalFilter && (
          <button
            onClick={() => setSelectedTanggalFilter('')}
            className="py-2 px-4 rounded-lg font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            Reset
          </button>
        )}
      </div>
    </div>

    {/* --- BAGIAN TOMBOL EXPORT PDF --- */}
<div className="flex items-center md:border-l border-gray-100 md:pl-6">
  {!readyToDownload ? (
    // Tampilan awal: Tombol biasa (Sangat Ringan, tidak bikin filter macet)
    <button
      onClick={() => setReadyToDownload(true)}
      className="flex items-center gap-2 py-2 px-6 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition shadow-lg"
    >
      <Layout size={18}/> SIAPKAN PDF
    </button>
  ) : (
    // Tampilan setelah diklik: Baru memanggil PDFDownloadLink
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
      className="flex items-center gap-2 py-2 px-6 rounded-xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition shadow-lg"
    >
      {({ loading }) => (
        loading ? 'Sedang Memproses...' : (
          <span onClick={() => setTimeout(() => setReadyToDownload(false), 2000)}>
            ✅ KLIK UNTUK DOWNLOAD
          </span>
        )
      )}
    </PDFDownloadLink>
  )}
</div>
  </div>
</div>

  {/* --- BAGIAN LIST JADWAL PER LAPANGAN --- */}
  {lapanganList.length > 0 ? (
    lapanganList.map((lapanganName) => (
      <div key={lapanganName} className="mb-10">
        <h3 className="text-2xl font-bold mb-5 text-gray-900 border-l-4 border-yellow-500 pl-3 bg-white p-3 rounded-lg shadow-sm">
          📍 {lapanganName}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedJadwal[lapanganName]
          .filter(j => !selectedTanggalFilter || j.tanggal === selectedTanggalFilter)
          .map((j) => (
            <div 
              key={j.id} 
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between relative transform hover:scale-[1.01] transition duration-300"
            >
              {/* Tombol Aksi Edit/Hapus */}
              {role === "admin" && (
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(j)}
                    className="p-2 rounded-full bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 transition duration-300"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteJadwal(j.id)}
                    className="p-2 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition duration-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="pr-10">
                {j.match?.bagan?.nama && (
                  <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                    {j.match.bagan.nama}
                  </p>
                )}

                {/* --- PERUBAHAN 1: LOGIKA NAMA MATCH --- */}
                <h4 className="text-lg font-extrabold text-gray-900 leading-snug mb-3">
                  {j.match?.doubleTeam1?.namaTim || j.match?.peserta1?.namaLengkap || 'TBA'} 
                  <span className="text-gray-400 mx-1"> vs </span> 
                  {j.match?.doubleTeam2?.namaTim || j.match?.peserta2?.namaLengkap || 'TBA'}
                </h4>

                {j.status === 'selesai' ? (
                  /* Tampilan Skor dan Pemenang */
                  <div className="border-y border-gray-200 py-3 my-3 bg-green-50/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-700">Skor: {j.match.score1} - {j.match.score2}</p>
                    
                    {/* --- PERUBAHAN 2: LOGIKA NAMA PEMENANG --- */}
                    <p className="text-sm font-bold text-green-700 mt-1 flex items-center gap-1">
                      <CheckCircle size={16}/> Pemenang:
                      {j.match.winnerDoubleId 
                        ? ` ${j.match.doubleTeam1?.id === j.match.winnerDoubleId ? j.match.doubleTeam1?.namaTim : j.match.doubleTeam2?.namaTim}` 
                        : ` ${j.match.winnerId === j.match.peserta1Id ? j.match.peserta1?.namaLengkap : j.match.peserta2?.namaLengkap}`}
                    </p>
                  </div>
                ) : (
                  /* Tampilan Belum Selesai */
                  <div className="border-y border-gray-200 py-3 my-3">
                    <p className="text-sm text-gray-500 italic flex items-center gap-1">
                      <XCircle size={16} className="text-red-500"/> Pertandingan belum selesai
                    </p>
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <p className="text-gray-700 text-sm font-medium flex items-center gap-2">
                    <Calendar size={16} className="text-yellow-600"/> 
                    <strong>Tanggal:</strong> {j.tanggal}
                  </p>
                  <p className="text-gray-700 text-sm font-medium flex items-center gap-2">
                    <Clock size={16} className="text-yellow-600"/> 
                    <strong>Waktu:</strong>{' '}
                    {new Date(j.waktuMulai.slice(0, -1)).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* Footer Status dan Aksi */}
             {/* Footer Status dan Aksi */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold uppercase tracking-wide flex justify-between items-center">
                  Status Pertandingan:
                  <span
                    className={`font-bold inline-block px-3 py-1 rounded-full text-xs shadow-sm ${
                        j.status === 'selesai' ? 'bg-green-500 text-white' : 
                        j.status === 'berlangsung' ? 'bg-yellow-500 text-gray-900' : 
                        'bg-blue-500 text-white'
                    }`}
                  >
                    {j.status.toUpperCase()}
                  </span>
                </p>

                <div className="mt-4 flex flex-col gap-2"> {/* Gunakan flex-col agar tombol rapi */}
                  
                  {/* JIKA STATUS TERJADWAL: Munculkan tombol Mulai */}
                 {(j.status === 'terjadwal' || j.status === 'belum' || j.status === 'aktif') && (
                    <button
                      onClick={() => handleUpdateStatus(j.id, 'berlangsung')}
                      className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition duration-300 font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16}/> Mulai Sekarang
                    </button>
                  )}

                  {/* JIKA STATUS BERLANGSUNG: Munculkan tombol Buka Wasit */}
                  {j.status === 'berlangsung' && (
                    <button
                      onClick={() => {
                        // ✅ JIKA SUDAH ADA RULE → LANGSUNG BUKA WASIT
                        if (j.match.scoreRuleId) {
                          openRefereePanel(j);
                        } else {
                          // ❗ JIKA BELUM ADA RULE → BARU PILIH RULE
                          setPendingJadwal(j);
                          setShowRuleModal(true);
                        }
                      }}
                      className="
                        px-3 py-1.5 
                        bg-indigo-600 hover:bg-indigo-700 
                        text-white text-xs font-semibold 
                        rounded-md 
                        transition
                      "
                    >
                      BUKA PANEL WASIT
                    </button>
                  )}


                  {/* JIKA ADMIN: Masih bisa akses modal manual jika diperlukan */}
                  {role === 'admin' && j.status !== 'selesai' && (
                    <button
                      onClick={() => handleCompleteJadwal(j)}
                      className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300 font-medium text-xs border border-gray-200"
                    >
                      Input Manual (Admin)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  ) : (
    <div className="p-10 text-center bg-gray-100 rounded-xl shadow-inner border border-gray-200">
        <Calendar size={32} className="text-gray-400 mx-auto mb-3"/>
        <p className="text-lg text-gray-600">Tidak ada jadwal pertandingan yang tersedia.</p>
    </div>
  )}
  
  {showWinnerModal && selectedMatchToScore && (
    <WinnerModal
      match={selectedMatchToScore}
      onClose={() => setShowWinnerModal(false)}
      onSaved={handleWinnerSaved}
    />
  )}



{showRuleModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 p-6 animate-in zoom-in duration-200">
      
      {/* HEADER */}
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        Pilih Aturan Skor
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Tentukan sistem perhitungan skor sebelum pertandingan dimulai.
      </p>

      {/* SELECT */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Aturan Skor
        </label>
        <select
          value={selectedRule}
          onChange={(e) => setSelectedRule(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowRuleModal(false)}
          className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl font-semibold transition"
        >
          Batal
        </button>

        <button
          disabled={!selectedRule}
          onClick={async () => {
            await api.patch(`/matches/${pendingJadwal.match.id}/set-rule`, {
              scoreRuleId: selectedRule
            });

            setShowRuleModal(false);
            openRefereePanel(pendingJadwal);
          }}
          className={`w-1/2 py-2 rounded-xl font-semibold transition text-white
            ${selectedRule 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-blue-300 cursor-not-allowed"
            }`}
        >
          Mulai Match
        </button>
      </div>

    </div>
  </div>
)}


</div>



  );
};

export default JadwalPage;