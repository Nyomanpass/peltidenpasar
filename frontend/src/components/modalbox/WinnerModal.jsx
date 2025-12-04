import { useState } from "react";
import api from "../../api"; // Mengimpor instans axios dari file api.js

function WinnerModal({ match, onClose, onSaved }) {
  const [winnerId, setWinnerId] = useState(match.winnerId || "");
  const [score1, setScore1] = useState(match.score1 || "");
  const [score2, setScore2] = useState(match.score2 || "");

  const save = async () => {
    try {
      // Menggunakan api.patch() untuk mengirim data
      const res = await api.patch(`/${match.id}/winner`, {
        winnerId,
        score1,
        score2,
      });

      // Axios secara otomatis melempar error untuk status non-2xx
      if (res.status === 200) {
        onSaved(); // Panggil fungsi onSaved dari parent
      } else {
        throw new Error("Gagal menyimpan data pemenang.");
      }
    } catch (error) {
      console.error("Error:", error);
      // Menampilkan pesan error kepada pengguna
      alert("Gagal menyimpan data pemenang: " + error.message);
    } finally {
      onClose(); // Selalu tutup modal, baik berhasil atau gagal
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60 p-4 sm:p-0">
  <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100 opacity-100">
    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
      Input Skor Match
    </h3>

    {/* Layout Skor Dibuat Sejajar */}
    <div className="flex items-center justify-between space-x-4 mb-6">
      <div className="flex flex-col items-center flex-1">
        <p className="text-sm font-semibold text-gray-600 mb-2 truncate max-w-full">
          {match.peserta1?.namaLengkap}
        </p>
        <input 
          type="number" 
          className="border border-gray-300 p-3 rounded-lg w-full text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" 
          value={score1} 
          onChange={(e) => setScore1(Number(e.target.value))} 
        />
      </div>

      <span className="text-3xl font-extrabold text-gray-500">VS</span>
      
      <div className="flex flex-col items-center flex-1">
        <p className="text-sm font-semibold text-gray-600 mb-2 truncate max-w-full">
          {match.peserta2?.namaLengkap}
        </p>
        <input 
          type="number" 
          className="border border-gray-300 p-3 rounded-lg w-full text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" 
          value={score2} 
          onChange={(e) => setScore2(Number(e.target.value))} 
        />
      </div>
    </div>

    {/* Dropdown Pemenang */}
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Pilih Pemenang
      </label>
      <select 
        className="border border-gray-300 p-3 w-full rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" 
        value={winnerId} 
        onChange={(e) => setWinnerId(Number(e.target.value))}
      >
        <option value="">-- Pilih Pemenang --</option>
        <option value={match.peserta1Id}>{match.peserta1?.namaLengkap}</option>
        <option value={match.peserta2Id}>{match.peserta2?.namaLengkap}</option>
      </select>
    </div>

    {/* Tombol Aksi */}
    <div className="flex justify-end space-x-3">
      <button 
        onClick={onClose} 
        className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-300"
      >
        Batal
      </button>
      <button 
        onClick={save} 
        className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Simpan
      </button>
    </div>
  </div>
</div>
  );
}

export default WinnerModal;
