import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye } from "lucide-react";
import api from "../api"; 

export default function BaganPage() {
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [baganList, setBaganList] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");

  const navigate = useNavigate();


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


  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmurList(res.data);
    } catch (err) {
      console.error("Gagal fetch kelompok umur:", err);
    }
  };

  useEffect(() => {
      const reloadBagan = () => {
        console.log("Tournament berubah → reload bagan");
        fetchBagan();
        fetchKelompokUmur();
      };

      window.addEventListener("tournament-changed", reloadBagan);

      return () => {
        window.removeEventListener("tournament-changed", reloadBagan);
      };
    }, []);


  useEffect(() => {
    fetchKelompokUmur();
    fetchBagan();
  }, []);

  // --- CREATE BAGAN ---
const handleCreateBagan = async () => {
  if (!selectedKelompok) {
    alert("Pilih kelompok umur terlebih dahulu.");
    return;
  }

  const tournamentId = localStorage.getItem("selectedTournament");

  try {
    await api.post("/bagan", { 
      kelompokUmurId: selectedKelompok,
      tournamentId
    });

    alert("Bagan berhasil dibuat!");
    fetchBagan();
  } catch (err) {
    console.error("Gagal membuat bagan:", err);
    alert("Gagal membuat bagan. Pastikan data peserta sudah ada.");
  }
};


  // --- DELETE BAGAN ---
  const handleDeleteBagan = async (baganId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus bagan ini?")) {
      try {
        await api.delete(`/bagan/${baganId}`);
        alert("Bagan berhasil dihapus!");
        fetchBagan();
      } catch (err) {
        console.error("Gagal menghapus bagan:", err);
        alert("Gagal menghapus bagan.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-yellow-600 text-center">
        🎾 Daftar Bagan Turnamen {selectedTournamentName}
      </h1>

      {/* Filter dan Aksi */}
      {role === "admin" && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-400"
            value={selectedKelompok}
            onChange={(e) => setSelectedKelompok(e.target.value)}
          >
            <option value="">Pilih Kelompok Umur</option>
            {kelompokUmurList
            .filter(k => !baganList.some(b => b.kelompokUmurId === k.id)) // hanya tampilkan yang belum ada bagan
            .map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>


          <button
            onClick={handleCreateBagan}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition transform hover:scale-105 disabled:opacity-50"
            disabled={!selectedKelompok}
          >
            ➕ Buat Bagan Baru
          </button>
        </div>
      )}

      {/* List Bagan */}
      <div className="space-y-4">
        {baganList.length === 0 && (
          <p className="text-center text-gray-600">
            Tidak ada bagan untuk kelompok umur ini.
          </p>
        )}

        {baganList.map((bagan) => (
          <div
            key={bagan.id}
            className="flex justify-between items-center bg-white border border-gray-200 p-5 rounded-xl shadow hover:shadow-md transition transform hover:scale-[1]"
           
          >
            <div>
              <h2 className="font-bold text-lg text-gray-900">{bagan.nama}</h2>
              <p className="text-sm text-gray-500">
                Jumlah Peserta: {bagan.jumlahPeserta}
              </p>
            </div>

            <div className="flex gap-2">
              {role === "admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBagan(bagan.id);
                  }}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center gap-1"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${role}/bagan-view/${bagan.id}`);
                }}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow hover:bg-yellow-600 transition flex items-center gap-1"
              >
                <Eye size={16} /> Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
