// File: src/components/admin/PesertaGanda.jsx

import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Link, useLocation } from "react-router-dom";
import { 
  Search, UserPlus, Users2, User, 
  ChevronDown, ChevronUp, X, Trash2, Users 
} from "lucide-react";
import AlertMessage from "../AlertMessage";

function PesertaGanda({ tournamentId, searchTerm: searchTermFromProps }) {
  const location = useLocation();
  const [kelompokUmur, setKelompokUmur] = useState([]); 
  const [masterKU, setMasterKU] = useState([]); 
  const [doubleTeams, setDoubleTeams] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(""); // State pencarian lokal
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentTournamentId, setCurrentTournamentId] = useState(tournamentId || localStorage.getItem("selectedTournament") || "");
  const [currentTournamentName, setCurrentTournamentName] = useState(localStorage.getItem("selectedTournamentName") || "");
  const [selectedTargetKU, setSelectedTargetKU] = useState(""); 
  const [selectedPlayers, setSelectedPlayers] = useState([]); 
  const [collapsedPlayers, setCollapsedPlayers] = useState({});
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, teamId: null });

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isActive = (path) => location.pathname === path;

  // Logika pencarian gabungan (Props vs Lokal)
  const finalSearch = searchTermFromProps !== undefined ? searchTermFromProps : localSearch;

  const fetchData = useCallback(async (idOverride) => {
    const idToUse = idOverride || tournamentId || localStorage.getItem("selectedTournament");
    if (!idToUse) return;
    setLoading(true);
    try {
      const [resPeserta, resKU, resTeams] = await Promise.all([
        api.get(`/peserta/kelompok-umur?tournamentId=${idToUse}`),
        api.get("/kelompok-umur"),
        api.get(`/double-teams?tournamentId=${idToUse}`)
      ]);
      setKelompokUmur(resPeserta.data || []);
      setMasterKU(resKU.data || []);
      setDoubleTeams(resTeams.data || []);
    } catch (err) {
      console.error("Error fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler interaksi
  const toggleGroup = (id) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleModalGroup = (id) => setCollapsedPlayers(prev => ({ ...prev, [id]: !prev[id] }));

  // Map untuk mengecek siapa saja yang sudah punya pasangan di kategori tertentu
  const pairedMap = doubleTeams.reduce((acc, team) => {
    if (!acc[team.kelompokUmurId]) acc[team.kelompokUmurId] = new Set();
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
      setAlert({ show: true, type: "success", message: "Tim ganda berhasil dibuat" });
      setSelectedPlayers([]);
      setIsModalOpen(false);
      fetchData(); 
    } catch (err) {
      setAlert({ show: true, type: "error", message: err.response?.data?.msg || "Gagal" });
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/double-teams/${confirmDelete.teamId}`);
      setAlert({ show: true, type: "success", message: "Tim berhasil dihapus" });
      setConfirmDelete({ show: false, teamId: null });
      fetchData();
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menghapus" });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
      <p className="text-gray-500 font-medium">Memuat data ganda...</p>
    </div>
  );

  return (
    <div className="w-full">
      {/* --- HEADER ADMIN (Sama dengan Peserta Single) --- */}
      {searchTermFromProps === undefined && (
        <div className="mb-8 border-b pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajement Peserta</h1>
              <p className="text-sm text-yellow-600 font-bold uppercase tracking-widest mt-2">
                Tournament: {currentTournamentName || "Belum Memilih"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {isAdmin && (
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-sm">
                  <Link 
                    to={"/admin/peserta"} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all ${isActive("/admin/peserta") ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <User size={14} /> Single
                  </Link>
                  <Link 
                    to={"/admin/peserta-ganda"} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all ${isActive("/admin/peserta-ganda") ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Users2 size={14} /> Double
                  </Link>
                </div>
              )}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari nama tim..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-sm font-medium transition-all"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MESSAGES */}
      <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

      {/* TOOLBAR BUAT TIM */}
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-yellow-100 hover:bg-yellow-500 transition-all"
          >
            <UserPlus size={16} /> Buat Tim Ganda
          </button>
        </div>
      )}

      {/* CONTENT LIST */}
      <div className="space-y-6">
        {doubleTeams.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Users2 size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Belum ada tim ganda terdaftar.</p>
          </div>
        ) : (
          masterKU.map((ku) => {
            const teamsInCategory = doubleTeams.filter(team => 
              (team.kelompokUmurId === ku.id || team.KelompokUmur?.id === ku.id) &&
              (team.Player1?.namaLengkap?.toLowerCase().includes(finalSearch.toLowerCase()) || 
               team.Player2?.namaLengkap?.toLowerCase().includes(finalSearch.toLowerCase()))
            );

            if (teamsInCategory.length === 0) return null;
            const isCollapsed = collapsedGroups[ku.id];

            return (
              <div key={ku.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <button 
                  onClick={() => toggleGroup(ku.id)}
                  className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-100/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                      {ku.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">GANDA {ku.nama}</h2>
                      <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mt-1 block">
                        {teamsInCategory.length} Pasangan
                      </span>
                    </div>
                  </div>
                  {isCollapsed ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
                </button>

                {!isCollapsed && (
                <div className="overflow-x-auto border-t border-gray-50">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-gray-50/30">
        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16 text-center">No</th>
        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pasangan Pemain</th>
        
        {/* Sembunyikan header Aksi di Mobile */}
        <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-50">
      {teamsInCategory.map((team, index) => (
        <tr key={team.id} className="hover:bg-yellow-50/20 transition-colors group">
          <td className="px-6 py-4 text-xs font-bold text-gray-300 text-center">{index + 1}</td>
          <td className="px-6 py-4">
            <div className="space-y-1">
              {/* Player 1 */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-black text-gray-800 group-hover:text-yellow-600 transition-colors">
                  {team.Player1?.namaLengkap}
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-black text-gray-800 group-hover:text-yellow-600 transition-colors">
                  {team.Player2?.namaLengkap}
                </span>
              </div>
            </div>
          </td>

          {/* Sembunyikan kolom Aksi di Mobile */}
          <td className="hidden md:table-cell px-6 py-4">
            <div className="flex justify-center">
              {isAdmin ? (
                <button 
                  onClick={() => setConfirmDelete({ show: true, teamId: team.id })} 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <span className="text-[10px] font-bold text-gray-300 uppercase italic">Limited</span>
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
          })
        )}
      </div>

      {/* --- MODAL BUAT TIM (Tampilan Baru) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Pasangkan Pemain</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Step 1: Kategori */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">1. Pilih Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {masterKU.map(ku => (
                    <button
                      key={ku.id}
                      onClick={() => { setSelectedTargetKU(ku.id); setSelectedPlayers([]); }}
                      className={`px-4 py-3 rounded-xl text-left border transition-all ${selectedTargetKU === ku.id ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500/20' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <p className={`font-black text-xs uppercase ${selectedTargetKU === ku.id ? 'text-yellow-700' : 'text-gray-700'}`}>Ganda {ku.nama}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Maks {ku.umur} Thn</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: List Pemain dengan Search */}
              {selectedTargetKU && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Pilih 2 Pemain</label>
                    <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">{selectedPlayers.length}/2 Terpilih</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Cari nama pemain..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-yellow-500"
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {kelompokUmur.map(group => {
                      const pairedInKU = pairedMap[selectedTargetKU] || new Set();
                      const available = (group.peserta || []).filter(p => 
                        !pairedInKU.has(p.id) && p.namaLengkap.toLowerCase().includes(modalSearchTerm.toLowerCase())
                      );
                      if (available.length === 0) return null;
                      return (
                        <div key={group.id} className="border border-gray-100 rounded-xl p-3">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2">{group.nama}</p>
                          <div className="grid grid-cols-1 gap-1">
                            {available.map(p => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  if (selectedPlayers.includes(p.id)) {
                                    setSelectedPlayers(selectedPlayers.filter(id => id !== p.id));
                                  } else if (selectedPlayers.length < 2) {
                                    setSelectedPlayers([...selectedPlayers, p.id]);
                                  }
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all ${selectedPlayers.includes(p.id) ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                              >
                                <span>{p.namaLengkap}</span>
                                {selectedPlayers.includes(p.id) && <User size={12} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all">Batal</button>
              <button 
                disabled={selectedPlayers.length !== 2}
                onClick={handlePasangkan}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedPlayers.length === 2 ? 'bg-yellow-600 text-white shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Simpan Tim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {confirmDelete.show && (
        <AlertMessage type="warning" message="Hapus tim ganda ini?" onClose={() => setConfirmDelete({ show: false, teamId: null })}>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setConfirmDelete({ show: false, teamId: null })} className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase">Batal</button>
            <button onClick={handleDeleteTeam} className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase shadow-lg shadow-red-200">Hapus</button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}

export default PesertaGanda;