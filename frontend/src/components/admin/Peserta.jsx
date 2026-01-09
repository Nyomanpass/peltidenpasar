import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import { Eye, Trash2, Users, Search, ChevronDown, ChevronUp, User, Users2 } from "lucide-react";

function Peserta() {
  // --- 1. STATE MANAGEMENT ---
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

  

  // State untuk melacak tournament yang dipilih (agar memicu re-render)
  const [currentTournamentId, setCurrentTournamentId] = useState(
    localStorage.getItem("selectedTournament") || ""
  );
  const [currentTournamentName, setCurrentTournamentName] = useState(
    localStorage.getItem("selectedTournamentName") || ""
  );

  const role = localStorage.getItem("role");
  const isActive = (path) => location.pathname === path;

  // --- 2. FUNGSI FETCH DATA ---
  // Menggunakan useCallback agar fungsi stabil dan bisa dipanggil di dalam useEffect
  const fetchPeserta = useCallback(async (idOverride) => {
    const tournamentId = idOverride || localStorage.getItem("selectedTournament");
    
    if (!tournamentId) {
      setKelompokUmur([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/peserta/kelompok-umur?tournamentId=${tournamentId}`);
      setKelompokUmur(res.data);
    } catch (err) {
      console.error("Error fetch peserta:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 3. EVENT LISTENER (SINKRONISASI SIDEBAR) ---
  useEffect(() => {
    const handleTournamentChange = () => {
      const newId = localStorage.getItem("selectedTournament") || "";
      const newName = localStorage.getItem("selectedTournamentName") || "";
      
      // Update state lokal
      setCurrentTournamentId(newId);
      setCurrentTournamentName(newName);
      
      // Ambil data baru berdasarkan ID baru
      fetchPeserta(newId);
    };

    // Dengarkan event custom dari Sidebar
    window.addEventListener("tournament-changed", handleTournamentChange);

    // Fetch data pertama kali saat mount
    fetchPeserta();

    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, [fetchPeserta]);

  // --- 4. HANDLER INTERAKSI ---
  const toggleGroup = (id) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin mau hapus peserta ini?")) return;
    try {
      await api.delete(`/peserta/${id}`);
      fetchPeserta(); // Ambil data ulang setelah hapus
    } catch (err) {
      console.error("Error delete:", err);
      alert("Gagal menghapus peserta");
    }
  };

  // --- 5. RENDER LOGIC ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">Memuat data peserta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">

      {/* --- HEADER --- */}
      <div className="mb-8 border-b pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Peserta</h1>
            <p className="text-sm text-blue-600 font-bold uppercase tracking-widest mt-1">
              Tournament: <span className="text-gray-700">{currentTournamentName || "Belum Memilih"}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Navigasi Button Kategori */}
               {role === "admin" && (
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <Link 
                    to={"/admin/peserta"} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isActive("/admin/peserta") || isActive("/tournament/peserta") ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <User size={16} /> Single
                  </Link>
                  <Link 
                    to={"/admin/peserta-ganda"} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isActive("/admin/peserta-ganda") || isActive("/tournament/peserta-ganda") ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Users2 size={16} /> Double
                  </Link>
                </div>
                )}
            {/* Input Pencarian */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- KONTEN UTAMA --- */}
    {(() => {
      const allPesertaRaw = kelompokUmur.flatMap(ku => ku.peserta || []);
      // 1. Hitung total peserta yang cocok dengan pencarian di SEMUA kelompok umur
      const allFilteredPeserta = kelompokUmur.flatMap(ku => 
        ku.peserta.filter(p => p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Jika database benar-benar kosong
      if (allPesertaRaw.length === 0) {
        return (
          <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <User size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada data peserta untuk tournament ini.</p>
          </div>
        );
      }

      // Jika sedang mencari tapi tidak ada satu pun nama yang cocok
      if (searchTerm !== "" && allFilteredPeserta.length === 0) {
        return (
          <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Search size={48} className="text-blue-100 mx-auto mb-4" />
            <p className="text-gray-800 font-bold text-lg">Peserta tidak ditemukan</p>
            <p className="text-gray-500 text-sm mt-1">
              Tidak ada hasil untuk "<span className="font-semibold">{searchTerm}</span>"
            </p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-blue-600 text-sm font-bold hover:underline"
            >
              Bersihkan Pencarian
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {kelompokUmur.map((ku) => {
            // Filter peserta per kelompok umur
            const filteredPeserta = ku.peserta.filter((p) =>
              p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Jangan tampilkan kotak kelompok umur jika hasil pencarian di dalamnya kosong
            if (searchTerm !== "" && filteredPeserta.length === 0) return null;
            // Jangan tampilkan jika dari awal memang tidak ada peserta (raw)
            if (ku.peserta.length === 0) return null;

            const isCollapsed = collapsedGroups[ku.id];

            return (
              <div key={ku.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Header Kelompok Umur */}
                <button 
                  onClick={() => toggleGroup(ku.id)}
                  className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">{ku.nama}</h2>
                    <span className="px-3 py-1 bg-white text-gray-600 text-[10px] font-bold rounded-full border border-gray-200">
                      {filteredPeserta.length} Peserta {searchTerm !== "" && "Ditemukan"}
                    </span>
                  </div>
                  {isCollapsed ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
                </button>

                {/* Tabel Peserta */}
                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-gray-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-200">
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">No</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peserta</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredPeserta.map((p, index) => (
                          <tr key={p.id} className="hover:bg-blue-50/30">
                            <td className="px-6 py-3 text-sm text-gray-400">{index + 1}</td>
                            <td className="px-6 py-3">
                              <span className="text-sm font-bold text-gray-800 block">{p.namaLengkap}</span>
                              <span className="text-[12px] text-gray-400 uppercase">{p.tanggalLahir || "-"}</span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600 font-medium">
                                {p.nomorWhatsapp || "-"}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                  ${p.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                                    p.status === "verified" ? "bg-green-100 text-green-700" : 
                                    "bg-red-100 text-red-700"}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex justify-center gap-2">
                                {role === "admin" ? (
                                  <>
                                    <Link 
                                      to={`/admin/detail-peserta/${p.id}`} 
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      <Eye size={16} />
                                    </Link>
                                    <button 
                                      onClick={() => handleDelete(p.id)} 
                                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : (
                                  /* --- TAMPILAN UNTUK USER BIASA (BUKAN ADMIN) --- */
                                  <span className="text-gray-400 text-[10px] font-bold uppercase italic tracking-wider">
                                    View Only
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    })()}
    </div>
  );
}

export default Peserta;