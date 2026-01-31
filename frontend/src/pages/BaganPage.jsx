import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye, PlusCircle, Layout, Filter, Users } from "lucide-react";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";

import api from "../api"; 


export default function BaganPage({onSelectBagan}) {
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("single"); 
  const [baganList, setBaganList] = useState([]);
  const role = localStorage.getItem('role');
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");
  const [filterKategori, setFilterKategori] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [baganToDelete, setBaganToDelete] = useState(null);

  

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


  const handleCreateBagan = async () => {
  if (!selectedKelompok) {
     setError("Pilih kelompok umur terlebih dahulu.");
    return;
  }

  const tournamentId = localStorage.getItem("selectedTournament");

  try {
    await api.post("/bagan", { 
      kelompokUmurId: selectedKelompok,
      tournamentId,
      kategori: selectedKategori // Kirim kategori ke backend
    });

    setSuccess("Bagan berhasil dibuat!");
    setSelectedKelompok(""); // Reset pilihan
    fetchBagan();
  } catch (err) {
    console.error("Gagal membuat bagan:", err);
    setError("Gagal membuat bagan. Pastikan data peserta sudah ada.");
  }
};


  // --- DELETE BAGAN ---
const handleDeleteBagan = (baganId) => {
  setBaganToDelete(baganId);
  setShowConfirm(true);
};

const confirmDeleteBagan = async () => {
  try {
    await api.delete(`/bagan/${baganToDelete}`);
    setSuccess("Bagan berhasil dihapus!");
    fetchBagan();
  } catch (err) {
    console.error("Gagal menghapus bagan:", err);
    setError("Gagal menghapus bagan.");
  } finally {
    setShowConfirm(false);
    setBaganToDelete(null);
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
            Bagan Pertandingan
        </h1>
        <p className="text-md text-yellow-600 font-semibold mt-1">
            Tournament: {selectedTournamentName || "Semua Tournament"}
        </p>
    </div>

    {/* --- TAB FILTER KATEGORI --- */}
    <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200">
        <button
            onClick={() => setFilterKategori("all")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filterKategori === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
        >
            Semua
        </button>
        <button
            onClick={() => setFilterKategori("single")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filterKategori === "single" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            }`}
        >
            Single
        </button>
        <button
            onClick={() => setFilterKategori("double")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filterKategori === "double" ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
            }`}
        >
            Double
        </button>
    </div>


   {/* --- FILTER DAN AKSI (ADMIN SECTION) --- */}
{role === "admin" && (
    <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex flex-col md:flex-row md:items-center gap-4 border border-gray-100">
        
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Filter size={20} />
            <span>Buat Bagan:</span>
        </div>

        {/* 1. Select Kategori */}
          <select
              className="border border-gray-300 p-3 rounded-xl focus:ring-3 focus:ring-yellow-500/50 bg-white"
              value={selectedKategori}
              onChange={(e) => {
                  setSelectedKategori(e.target.value);
                  setSelectedKelompok(""); // Tambahkan ini agar tidak terjadi bentrok pilihan lama
              }}
          >
              <option value="single">Single (Perseorangan)</option>
              <option value="double">Double (Ganda)</option>
          </select>

        {/* 2. Select Kelompok Umur */}
       <select
              className="border border-gray-300 p-3 rounded-xl focus:ring-3 focus:ring-yellow-500/50 md:flex-1 bg-white"
              value={selectedKelompok}
              onChange={(e) => setSelectedKelompok(e.target.value)}
          >
              <option value="">Pilih Kelompok Umur</option>
              {kelompokUmurList
                  .filter((k) => {
                      // Kita cek: Apakah sudah ada bagan dengan kelompok umur 'k.id' 
                      // DAN kategori 'selectedKategori' di list bagan yang sudah jadi?
                      const sudahAda = baganList.some(
                          (b) => b.kelompokUmurId === k.id && b.kategori === selectedKategori
                      );
                      // Jika sudah ada, kita sembunyikan (return false)
                      return !sudahAda;
                  })
                  .map((k) => (
                      <option key={k.id} value={k.id}>
                          {k.nama}
                      </option>
                  ))}
          </select>

        {/* Tombol Buat Bagan */}
        <button
            onClick={handleCreateBagan}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition font-semibold"
            disabled={!selectedKelompok}
        >
            <PlusCircle size={20} /> Buat Bagan
        </button>
    </div>
)}

    {/* --- LIST BAGAN --- */}
  <div className="space-y-4">
      {(() => {
          // Logika filter data sebelum di-map
          const filteredData = baganList
            .filter((b) =>
                filterKategori === "all" ? true : b.kategori === filterKategori
            )
            .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId);


          if (filteredData.length === 0) {
              return (
                  <div className="p-10 text-center bg-gray-50 rounded-xl shadow-inner border border-gray-200">
                      <Layout size={32} className="text-gray-400 mx-auto mb-3" />
                      <p className="text-lg text-gray-600">
                          Tidak ada bagan {filterKategori !== "all" ? filterKategori : ""} yang tersedia.
                      </p>
                  </div>
              );
          }

          return filteredData.map((bagan) => (
              <div
                  key={bagan.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center 
                            bg-white border border-gray-200 p-5 rounded-xl shadow-md 
                            hover:shadow-xl transition transform hover:translate-y-[-2px] duration-200 cursor-pointer"
                  onClick={() => handleViewDetail(bagan.id)}
              >
                  {/* Info Bagan */}
                  <div className="mb-3 md:mb-0 md:flex-1">
                      <div className="flex items-center gap-2">
                          <h2 className="font-extrabold text-xl text-gray-900">{bagan.nama}</h2>
                          {/* Badge Kategori */}
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                              bagan.kategori === 'double' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                              {bagan.kategori}
                          </span>
                      </div>
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
                            setBaganToDelete(bagan.id); // simpan ID bagan
                            setShowConfirm(true);       // tampilkan popup konfirmasi
                        }}
                        className="flex items-center justify-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
                        title="Hapus Bagan"
                        >
                        <Trash2 size={16} /> Hapus
                        </button>

                      )}
                      <button
                          onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(bagan.id);
                          }}
                          className="flex items-center justify-center gap-1 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md font-semibold hover:bg-yellow-600 transition"
                          title="Lihat Detail Bagan"
                      >
                          <Eye className="text-white" size={16} /> Lihat Bagan
                      </button>
                  </div>
              </div>
          ));
      })()}
  </div>
  
  <ConfirmModal
    show={showConfirm}
    title="Hapus Bagan"
    message="Apakah Anda yakin ingin menghapus bagan ini?"
    onConfirm={confirmDeleteBagan}
    onCancel={() => setShowConfirm(false)}
    />

</div>
  );
}
