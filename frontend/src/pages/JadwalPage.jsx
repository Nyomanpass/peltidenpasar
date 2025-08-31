import React, { useState, useEffect } from 'react';
import api from '../api';
import WinnerModal from "../components/modalbox/WinnerModal";

const JadwalPage = () => {
  const [jadwal, setJadwal] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lapangan, setLapangan] = useState([]);
  const role = localStorage.getItem('role');
  
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

  const fetchJadwal = async () => {
    try {
      const response = await api.get('/jadwal');
      setJadwal(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Gagal mengambil jadwal.');
    }
  };

  // --- FUNGSI BARU UNTUK MENGAMBIL DAFTAR BAGAN ---
  const fetchBagan = async () => {
    try {
      const response = await api.get('/bagan');
      setBaganList(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // --- MODIFIKASI FUNGSI FETCH MATCHES UNTUK MENERIMA BAGAN ID ---
  const fetchMatches = async (baganId) => {
    try {
      // Mengirim baganId sebagai query parameter
      const response = await api.get('/matches', {
        params: { baganId: baganId }
      });
      const belumSelesai = response.data.filter(m => m.status === 'belum' || m.status === 'aktif');
      setMatches(belumSelesai);
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

  const handleEditClick = (jadwal) => {
    setEditingJadwalId(jadwal.id);
    setSelectedMatch(jadwal.matchId);
    setSelectedLapangan(jadwal.lapanganId);
    setTanggal(jadwal.tanggal);
    
    const waktuMulaiFormatted = jadwal.waktuMulai.slice(11, 16);
    setWaktuMulai(waktuMulaiFormatted);
    
    setSuccess('');
    setError('');
    window.scrollTo({
    top: 0,
    behavior: 'smooth' // Membuat efek gulir lebih halus
  });
  };

  const handleCancelEdit = () => {
    setEditingJadwalId(null);
    setSelectedMatch('');
    setSelectedLapangan('');
    setTanggal('');
    setWaktuMulai('');
    setSuccess('');
    setError('');
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

    const jadwalData = {
      matchId: selectedMatch,
      lapanganId: selectedLapangan,
      tanggal,
      waktuMulai: waktuMulaiFull,
    };

    try {
      if (editingJadwalId) {
        await api.put(`/jadwal/${editingJadwalId}`, jadwalData);
        setSuccess('Jadwal berhasil diperbarui!');
        handleCancelEdit();
      } else {
        await api.post('/jadwal', jadwalData);
        setSuccess('Jadwal berhasil dibuat!');
        setSelectedMatch('');
        setSelectedLapangan('');
        setTanggal('');
        setWaktuMulai('');
      }
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
  
  const groupedJadwal = jadwal.reduce((acc, currentJadwal) => {
    const lapanganName = currentJadwal.lapangan?.nama || 'Lapangan Tidak Dikenal';
    if (!acc[lapanganName]) {
      acc[lapanganName] = [];
    }
    acc[lapanganName].push(currentJadwal);
    return acc;
  }, {});

  const lapanganList = Object.keys(groupedJadwal);

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen">
  <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900">
    Manajemen Jadwal Pertandingan
  </h1>

  {error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
      {error}
    </div>
  )}
  {success && (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
      {success}
    </div>
  )}

  {/* BAGIAN FORM: Menggunakan padding lebih besar, sudut lebih bulat, dan shadow lebih kuat */}
   {role === "admin" && (
  <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">
      {editingJadwalId ? 'Update Jadwal' : 'Buat Jadwal Baru'}
    </h2>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input diatur dalam layout grid agar lebih ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Pilih Bagan:</label>
          <div className="flex flex-wrap gap-2">
            {baganList.map((bagan) => (
              <span
                key={bagan.id}
                onClick={() => setSelectedBaganId(bagan.id)}
                className={`py-2 px-4 rounded-full transition-all duration-200 text-sm font-semibold cursor-pointer select-none
                  ${selectedBaganId === bagan.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {bagan.nama}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Match:</label>
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={!selectedBaganId}
          >
            <option value="">-- Pilih Match --</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.peserta1?.namaLengkap || 'Peserta Belum Ditentukan'} vs {m.peserta2?.namaLengkap || 'Peserta Belum Ditentukan'}
              </option>
            ))}
          </select>
          {!selectedBaganId && (
            <p className="text-sm text-gray-500 mt-1">Pilih bagan terlebih dahulu.</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Lapangan:</label>
          <select
            value={selectedLapangan}
            onChange={(e) => setSelectedLapangan(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">-- Pilih Lapangan --</option>
            {lapangan.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Tanggal:</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Waktu Mulai:</label>
          <input
            type="time"
            value={waktuMulai}
            onChange={(e) => setWaktuMulai(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      
      <div className="flex space-x-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
        >
          {editingJadwalId ? 'Update Jadwal' : 'Buat Jadwal'}
        </button>
        {editingJadwalId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition duration-300 font-semibold"
          >
            Batal Edit
          </button>
        )}
      </div>
    </form>
  </div>
   )}

  {/* GARIS PEMISAH */}
  <hr className="my-10 border-gray-300" />

  {/* BAGIAN JADWAL PERTANDINGAN: Tampilan kartu diubah */}
  <h2 className="text-3xl font-bold mb-6 text-gray-800">Jadwal Pertandingan</h2>
  {lapanganList.length > 0 ? (
    lapanganList.map((lapanganName) => (
      <div key={lapanganName} className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{lapanganName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedJadwal[lapanganName].map((j) => (
            <div key={j.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between relative">
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => handleEditClick(j)}
                  className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition duration-300"
                  aria-label="Edit Jadwal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteJadwal(j.id)}
                  className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition duration-300"
                  aria-label="Hapus Jadwal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div>
                {j.match?.bagan?.nama && (
                  <p className="text-sm font-bold text-gray-500 mb-2">
                    {j.match.bagan.nama}
                  </p>
                )}

                <h4 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                  {j.match?.peserta1?.namaLengkap || 'Peserta Belum Ditentukan'} vs{' '}
                  {j.match?.peserta2?.namaLengkap || 'Peserta Belum Ditentukan'}
                </h4>

                {j.status === 'selesai' ? (
                  <div className="border-t border-b border-gray-200 py-3 my-3">
                    <p className="text-sm font-bold text-gray-700">Skor: {j.match.score1} - {j.match.score2}</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      <span role="img" aria-label="trophy">🏆</span> Pemenang:
                      {j.match.winnerId === j.match.peserta1Id ? ` ${j.match.peserta1?.namaLengkap}` : ` ${j.match.peserta2?.namaLengkap}`}
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-b border-gray-200 py-3 my-3">
                    <p className="text-sm text-gray-500 italic">Pertandingan belum selesai</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">
                    <strong>Tanggal:</strong> {j.tanggal}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Waktu:</strong>{' '}
                    {new Date(j.waktuMulai.slice(0, -1)).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(j.waktuSelesai.slice(0, -1)).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Status:{' '}
                  <span
                    className={`font-bold ${j.status === 'selesai' ? 'text-green-600' : j.status === 'berlangsung' ? 'text-yellow-500' : 'text-blue-600'}`}
                  >
                    {j.status}
                  </span>
                </p>

                <div className="mt-4 flex space-x-2">
                  {j.status !== 'berlangsung' && j.status !== 'selesai' && (
                    <button
                      onClick={() => handleUpdateStatus(j.id, 'berlangsung')}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 font-semibold text-sm"
                    >
                      Tandai Berlangsung
                    </button>
                  )}
                  {j.status !== 'selesai' && (
                    <button
                      onClick={() => handleCompleteJadwal(j)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 font-semibold text-sm"
                    >
                      Tandai Selesai
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
    <p className="text-center text-gray-500">Tidak ada jadwal yang tersedia.</p>
  )}

  {showWinnerModal && selectedMatchToScore && (
    <WinnerModal
      match={selectedMatchToScore}
      onClose={() => setShowWinnerModal(false)}
      onSaved={handleWinnerSaved}
    />
  )}
</div>
  );
};

export default JadwalPage;