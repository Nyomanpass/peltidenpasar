import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye, PlusCircle, Layout, Filter, Users } from "lucide-react";
import api from "../api"; 

export default function BaganPage({onSelectBagan}) {
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [baganList, setBaganList] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");

  const navigate = useNavigate();
  const isSelectorMode = !!onSelectBagan;


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


  const handleViewDetail = (baganId) => {
    if (isSelectorMode) {
        // 1. MODE USER/SELECTOR: Panggil prop yang akan mengubah konten di parent (TournamentDetailPage)
        onSelectBagan(baganId); 
    } else {
        // 2. MODE ADMIN/HALAMAN TERPISAH: Gunakan navigate
        navigate(`/${role}/bagan-view/${baganId}`);
    }
}

  return (
    <div className="min-h-screen"> 
    
    {/* --- HEADER UTAMA --- */}
     <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Bagan Pertandingan
        </h1>
        <p className="text-md text-yellow-600 font-semibold mt-1">
            Tournament: {selectedTournamentName || "Semua Tournament"}
        </p>
    </div>

    {/* --- FILTER DAN AKSI (ADMIN SECTION) --- */}
    {role === "admin" && (
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100">
            
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Filter size={20} />
                <span>Buat Bagan untuk:</span>
            </div>

            {/* Select Kelompok Umur */}
            <select
                className="border border-gray-300 p-3 rounded-xl focus:ring-3 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200 shadow-sm bg-white md:flex-1"
                value={selectedKelompok}
                onChange={(e) => setSelectedKelompok(e.target.value)}
            >
                <option value="">Pilih Kelompok Umur yang belum ada Bagan</option>
                {kelompokUmurList
                .filter(k => !baganList.some(b => b.kelompokUmurId === k.id)) 
                .map((k) => (
                    <option key={k.id} value={k.id}>
                        {k.nama}
                    </option>
                ))}
            </select>


            {/* Tombol Buat Bagan */}
            <button
                onClick={handleCreateBagan}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-[1.01] disabled:opacity-50 font-semibold"
                disabled={!selectedKelompok}
            >
                <PlusCircle size={20} /> Buat Bagan Baru
            </button>
        </div>
    )}

    {/* --- LIST BAGAN --- */}
    <div className="space-y-4">
        {baganList.length === 0 && (
            <div className="p-10 text-center bg-gray-50 rounded-xl shadow-inner border border-gray-200">
                <Layout size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-lg text-gray-600">
                    Tidak ada bagan yang dibuat untuk turnamen ini.
                </p>
            </div>
        )}

        {baganList.map((bagan) => (
            <div
                key={bagan.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center 
                           bg-white border border-gray-200 p-5 rounded-xl shadow-md 
                           hover:shadow-xl transition transform hover:translate-y-[-2px] duration-200 cursor-pointer"
              
            >
                {/* Info Bagan */}
                <div className="mb-3 md:mb-0 md:flex-1">
                    <h2 className="font-extrabold text-xl text-gray-900">{bagan.nama}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                         <p className="text-gray-500 font-medium">
                            <Users size={16} className="inline mr-1 text-blue-500"/> 
                            Peserta: {bagan.jumlahPeserta}
                        </p>

                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-3">
                    {role === "admin" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBagan(bagan.id);
                            }}
                            className="flex items-center justify-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
                            title="Hapus Bagan"
                        >
                            <Trash2 size={16} /> Hapus
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Mencegah klik ganda
                            handleViewDetail(bagan.id); // 💡 Panggil fungsi yang menangani logika mode
                        }}
                        className="flex items-center justify-center gap-1 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md font-semibold hover:bg-yellow-600 transition"
                        title="Lihat Detail Bagan"
                    >
                        <Eye className="text-white" size={16} /> Lihat Bagan
                    </button>
                </div>
            </div>
        ))}
    </div>
</div>
  );
}
