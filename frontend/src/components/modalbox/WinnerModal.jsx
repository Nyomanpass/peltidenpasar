import { useState, useEffect } from "react";
import api from "../../api";

function WinnerModal({ match, onClose, onSaved }) {
  const [winnerId, setWinnerId] = useState(match.winnerId || "");
  const [score1, setScore1] = useState(match.score1 || 0);
  const [score2, setScore2] = useState(match.score2 || 0);

  // LOGIKA OTOMATIS: Pilih pemenang berdasarkan skor tertinggi
  useEffect(() => {
    if (score1 > score2) {
      setWinnerId(match.peserta1Id);
    } else if (score2 > score1) {
      setWinnerId(match.peserta2Id);
    } else {
      setWinnerId(""); // Reset jika skor seri (draw)
    }
  }, [score1, score2, match.peserta1Id, match.peserta2Id]);

  const save = async () => {
    if (!winnerId && (score1 !== 0 || score2 !== 0)) {
      alert("Skor masih seri, tentukan pemenang dengan benar!");
      return;
    }

    try {
      const res = await api.patch(`/${match.id}/winner`, {
        winnerId,
        score1,
        score2,
      });

      if (res.status === 200) {
        onSaved();
      } else {
        throw new Error("Gagal menyimpan data pemenang.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menyimpan data pemenang: " + error.message);
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Input Skor Pertandingan
        </h3>

        <div className="flex items-center justify-between space-x-4 mb-8">
          {/* Peserta 1 */}
          <div className="flex flex-col items-center flex-1">
            <p className={`text-xs font-bold mb-2 text-center uppercase ${winnerId === match.peserta1Id ? 'text-green-600' : 'text-gray-500'}`}>
              {match.peserta1?.namaLengkap}
            </p>
            <input 
              type="number" 
              className={`border p-4 rounded-xl w-full text-center text-2xl font-black focus:outline-none transition-all duration-200 
                ${winnerId === match.peserta1Id ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-gray-50'}`} 
              value={score1} 
              onChange={(e) => setScore1(Number(e.target.value))} 
            />
          </div>

          <span className="text-xl font-black text-gray-400">VS</span>
          
          {/* Peserta 2 */}
          <div className="flex flex-col items-center flex-1">
            <p className={`text-xs font-bold mb-2 text-center uppercase ${winnerId === match.peserta2Id ? 'text-green-600' : 'text-gray-500'}`}>
              {match.peserta2?.namaLengkap}
            </p>
            <input 
              type="number" 
              className={`border p-4 rounded-xl w-full text-center text-2xl font-black focus:outline-none transition-all duration-200 
                ${winnerId === match.peserta2Id ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-gray-50'}`} 
              value={score2} 
              onChange={(e) => setScore2(Number(e.target.value))} 
            />
          </div>
        </div>

        {/* Dropdown Pemenang (Sudah Otomatis Terpilih) */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2 italic">
            Pemenang (Terdeteksi Otomatis):
          </label>
          <select 
            className="border border-gray-300 p-3 w-full rounded-xl bg-gray-100 font-bold text-blue-600 pointer-events-none" 
            value={winnerId} 
            disabled // Dimatikan agar admin tidak salah pilih manual
          >
            <option value="">-- Menunggu Skor --</option>
            <option value={match.peserta1Id}>{match.peserta1?.namaLengkap}</option>
            <option value={match.peserta2Id}>{match.peserta2?.namaLengkap}</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
          >
            Batal
          </button>
          <button 
            onClick={save} 
            disabled={!winnerId}
            className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition transform active:scale-95 ${
              winnerId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Simpan Hasil
          </button>
        </div>
      </div>
    </div>
  );
}

export default WinnerModal;