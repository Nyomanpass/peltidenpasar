import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, Search, UserPlus, CheckCircle2, Users2, 
  User, ChevronDown, ChevronUp, X, Eye, Trash2 
} from "lucide-react";

function PesertaGanda() {
  const location = useLocation();
  const [kelompokUmur, setKelompokUmur] = useState([]); 
  const [masterKU, setMasterKU] = useState([]); 
  const [doubleTeams, setDoubleTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentTournamentId, setCurrentTournamentId] = useState(localStorage.getItem("selectedTournament") || "");
  const [currentTournamentName, setCurrentTournamentName] = useState(localStorage.getItem("selectedTournamentName") || "");
  const [selectedTargetKU, setSelectedTargetKU] = useState(""); 
  const [selectedPlayers, setSelectedPlayers] = useState([]); 

  const [collapsedPlayers, setCollapsedPlayers] = useState({});

  const [modalSearchTerm, setModalSearchTerm] = useState("");



  const toggleModalGroup = (id) => {
    setCollapsedPlayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin"; // Pastikan ini true jika admin
  const isActive = (path) => location.pathname === path;

  const fetchData = useCallback(async (idOverride) => {
    const tournamentId = idOverride || localStorage.getItem("selectedTournament");
    if (!tournamentId) return;
    setLoading(true);
    try {
      const [resPeserta, resKU, resTeams] = await Promise.all([
        api.get(`/peserta/kelompok-umur?tournamentId=${tournamentId}`),
        api.get("/kelompok-umur"),
        api.get(`/double-teams?tournamentId=${tournamentId}`)
      ]);
      setKelompokUmur(resPeserta.data || []);
      setMasterKU(resKU.data || []);
      setDoubleTeams(resTeams.data || []);
    } catch (err) {
      console.error("Error fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleTournamentChange = () => {
      const newId = localStorage.getItem("selectedTournament") || "";
      const newName = localStorage.getItem("selectedTournamentName") || "";
      setCurrentTournamentId(newId);
      setCurrentTournamentName(newName);
      fetchData(newId);
    };
    window.addEventListener("tournament-changed", handleTournamentChange);
    fetchData();
    return () => window.removeEventListener("tournament-changed", handleTournamentChange);
  }, [fetchData]);

  const toggleGroup = (id) => {
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pairedMap = doubleTeams.reduce((acc, team) => {
    if (!acc[team.kelompokUmurId]) {
      acc[team.kelompokUmurId] = new Set();
    }
    acc[team.kelompokUmurId].add(team.player1Id);
    acc[team.kelompokUmurId].add(team.player2Id);
    return acc;
  }, {});


  const handlePasangkan = async () => {
    try {
      const payload = {
        player1Id: selectedPlayers[0],
        player2Id: selectedPlayers[1],
        tournamentId: parseInt(currentTournamentId),
        kelompokUmurId: parseInt(selectedTargetKU) 
      };
      await api.post("/double-teams", payload);
      alert("Tim ganda berhasil dibuat!");
      setSelectedPlayers([]);
      setIsModalOpen(false);
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.msg || "Gagal menyimpan tim");
    }
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setModalSearchTerm(""); 
    setSelectedPlayers([]);  
    setCollapsedPlayers({}); 
  };


  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Yakin mau hapus tim ganda ini?")) return;
    try {
      await api.delete(`/double-teams/${id}`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus tim");
    }
  };

  const hitungUmur = (tanggalLahir) => {
  if (!tanggalLahir) return 0;

  const tahunLahir = new Date(tanggalLahir).getFullYear();
  const tahunSekarang = new Date().getFullYear();

  return tahunSekarang - tahunLahir;
};


  if (loading) return <div className="p-20 text-center font-bold">Memuat data...</div>;

  return (
    <div className="min-h-screen">
      {/* --- HEADER --- */}
     
     <div className="mb-8 border-b pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Manajement Peserta
              </h1>
              <p className="text-md text-yellow-600 font-semibold mt-1">
                  Tournament: {currentTournamentName || "Belum Memilih"}
              </p>
            </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Navigasi Button Kategori */}
               {role === "admin" && (
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <Link 
                    to={"/admin/peserta"} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isActive("/admin/peserta") || isActive("/tournament/peserta") ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <User size={16} /> Single
                  </Link>
                  <Link 
                    to={"/admin/peserta-ganda"} 
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isActive("/admin/peserta-ganda") || isActive("/tournament/peserta-ganda") ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
   
{(() => {
  // 1. Hitung total tim yang cocok dengan pencarian di SEMUA kelompok umur
  const allFilteredTeams = doubleTeams.filter((team) => {
    const search = searchTerm.toLowerCase();
    const namaP1 = team.Player1?.namaLengkap?.toLowerCase() || "";
    const namaP2 = team.Player2?.namaLengkap?.toLowerCase() || "";
    return namaP1.includes(search) || namaP2.includes(search);
  });



  // 3. JIKA sedang mencari tapi tidak ada satu pun tim yang cocok (Global Search Result)
  if (searchTerm !== "" && allFilteredTeams.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
        <Search size={48} className="text-blue-100 mx-auto mb-4" />
        <p className="text-gray-800 font-bold text-lg">Tim Ganda tidak ditemukan</p>
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

  // 4. Render List jika data ditemukan
  return (
    <div className="space-y-6">
      
        {/* TOOLBAR DI ATAS TABEL */}
    {isAdmin && (
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-yellow-500 transition-all"
        >
          <UserPlus size={18} /> Buat Tim Ganda
        </button>
      </div>
    )}

      {doubleTeams.length === 0 && (
      <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Users2 size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">
          Belum ada data tim ganda untuk tournament ini.
        </p>
      </div>
    )}


      {doubleTeams.length > 0 && masterKU.map((ku) => {

        // Ambil tim asli di ktegori ini
        const rawTeamsInCategory = doubleTeams.filter(team => 
          (team.kelompokUmurId === ku.id || team.KelompokUmur?.id === ku.id)
        );

        // Filter berdasarkan pencarian
        const teamsInCategory = rawTeamsInCategory.filter((team) => {
          const search = searchTerm.toLowerCase();
          const namaP1 = team.Player1?.namaLengkap?.toLowerCase() || "";
          const namaP2 = team.Player2?.namaLengkap?.toLowerCase() || "";
          return namaP1.includes(search) || namaP2.includes(search);
        });

        // Sembunyikan grup jika tidak ada hasil saat searching
        if (searchTerm !== "" && teamsInCategory.length === 0) return null;
        // Sembunyikan jika grup ini memang kosong dari awal
        if (rawTeamsInCategory.length === 0) return null;

        const isCollapsed = collapsedGroups[ku.id];

        return (
          <div key={ku.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Header Kelompok Umur */}
            <button 
              onClick={() => toggleGroup(ku.id)}
              className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">GANDA {ku.nama}</h2>
                <span className="px-3 py-1 bg-white text-gray-600 text-[10px] font-bold rounded-full border border-gray-200">
                  {teamsInCategory.length} Tim {searchTerm !== "" && "Ditemukan"}
                </span>
              </div>
              {isCollapsed ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
            </button>

            {/* Tabel Tim Ganda */}
            {!isCollapsed && (
              <div className="overflow-x-auto border-t border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">No</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pasangan Tim</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teamsInCategory.map((team, index) => (
                      <tr key={team.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-400">{index + 1}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col gap-1">
                            
                            {/* Player 1 */}
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              <span className="text-sm font-bold text-gray-800 tracking-tight">
                                {team.Player1?.namaLengkap}
                              </span>
                            </div>

                            {/* Player 2 */}
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              <span className="text-sm font-bold text-gray-800 tracking-tight">
                                {team.Player2?.namaLengkap}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td className="px-6 py-3">
                          <div className="flex justify-center gap-2">
                            {isAdmin ? (
                              <button 
                                onClick={() => handleDeleteTeam(team.id)} 
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[10px] font-bold uppercase italic tracking-wider">
                              View Only</span>
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


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
         
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
             {/* Header Modal */}
             <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-black text-gray-900">Pasangkan Pemain</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <X size={24} className="text-gray-500" />
                </button>
             </div>
             
             {/* Body Modal */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                
                {/* 1. KATEGORI TARGET */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Kategori Target</label>
                  <div className="flex flex-col gap-2">
                    {masterKU.map(ku => (
                      <button
                        key={ku.id}
                        onClick={() => { setSelectedTargetKU(ku.id); setSelectedPlayers([]); }}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border
                        ${selectedTargetKU === ku.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
                      >
                        Ganda {ku.nama}
                        <p className={`text-[10px] ${selectedTargetKU === ku.id ? 'text-blue-100' : 'text-gray-400'}`}>Maks: {ku.umur} Thn</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. PILIH 2 PEMAIN */}
              {/* 2. PILIH 2 PEMAIN (SISTEM CARD COLLAPSIBLE DI DALAM MODAL) */}
               {/* 2. PILIH 2 PEMAIN (DENGAN FITUR SEARCH) */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      2. Pilih 2 Pemain (Tersedia)
                    </label>
                    
                    {/* INPUT SEARCH DALAM MODAL */}
                    {selectedTargetKU && (
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Cari nama pemain..."
                          className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs transition-all"
                          value={modalSearchTerm}
                          onChange={(e) => setModalSearchTerm(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {!selectedTargetKU ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <Users size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-400 font-medium">Pilih kategori ganda terlebih dahulu</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {kelompokUmur.map((group) => {
                        const pairedInSelectedKU = pairedMap[selectedTargetKU] || new Set();

                        // LOGIKA FILTER: Filter yang belum berpasangan DAN filter berdasarkan Nama
                        const availableInGroup = (group.peserta || []).filter(p => {
                          const matchesSearch = p.namaLengkap.toLowerCase().includes(modalSearchTerm.toLowerCase());
                          const isNotPaired = !pairedInSelectedKU.has(p.id);
                          return matchesSearch && isNotPaired;
                        });

                        // Jangan tampilkan kategori jika tidak ada pemain yang cocok dengan pencarian
                        if (availableInGroup.length === 0) return null;

                        const isCollapsed = collapsedPlayers[group.id];

                        return (
                          <div key={group.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                            <button 
                              type="button"
                              onClick={() => toggleModalGroup(group.id)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight">{group.nama}</h2>
                                <span className="px-2 py-0.5 bg-white text-gray-500 text-[10px] font-bold rounded-full border border-gray-200">
                                  {availableInGroup.length} Peserta
                                </span>
                              </div>
                              {isCollapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
                            </button>

                            {!isCollapsed && (
                              <div className="p-4 bg-white border-t border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {availableInGroup.map((p) => {
                                    const targetKU = masterKU.find(m => m.id === selectedTargetKU);
                                    const umurPemain = hitungUmur(p.tanggalLahir);
                                    const isTooOld = targetKU && umurPemain > targetKU.umur;
                                    const isDisabled = isTooOld;

                                    return (
                                      <button 
                                        key={p.id}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => {
                                          if(selectedPlayers.includes(p.id)) {
                                            setSelectedPlayers(selectedPlayers.filter(i => i !== p.id));
                                          } else if(selectedPlayers.length < 2) {
                                            setSelectedPlayers([...selectedPlayers, p.id]);
                                          }
                                        }}
                                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all
                                        ${selectedPlayers.includes(p.id) 
                                          ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-500/10' 
                                          : isDisabled 
                                            ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed' 
                                            : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/20'}`}
                                      >
                                        <div className="flex flex-col">
                                          <span className={`text-[11px] font-bold ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
                                            {p.namaLengkap}
                                          </span>
                                          <span className={`text-[10px] mt-0.5 ${isTooOld ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                            {umurPemain} Thn {isTooOld && "(Over Age)"}
                                          </span>
                                        </div>
                                        {selectedPlayers.includes(p.id) && <CheckCircle2 size={14} className="text-blue-600"/>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Pesan jika benar-benar tidak ada hasil dari search di semua kategori */}
                      {modalSearchTerm && kelompokUmur.every(group => 
                        !(group.peserta || []).some(p => 
                          p.namaLengkap.toLowerCase().includes(modalSearchTerm.toLowerCase()) && 
                          !(pairedMap[selectedTargetKU] || new Set()).has(p.id)
                        )
                      ) && (
                        <div className="text-center py-10">
                          <p className="text-gray-400 text-sm italic">Pemain "{modalSearchTerm}" tidak ditemukan atau sudah memiliki tim.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

             {/* Footer Modal */}
             <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500">Batal</button>
                <button 
                  onClick={handlePasangkan}
                  disabled={selectedPlayers.length !== 2 || !selectedTargetKU}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedPlayers.length === 2 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  SIMPAN TIM
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default PesertaGanda;