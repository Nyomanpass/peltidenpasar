import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Users, Search, ChevronDown, ChevronUp, UserPlus, CheckCircle2, Trash2, Users2 } from "lucide-react";

function PesertaGanda() {
  const [kelompokUmur, setKelompokUmur] = useState([]); 
  const [masterKU, setMasterKU] = useState([]); 
  const [doubleTeams, setDoubleTeams] = useState([]); // State untuk tim yang sudah jadi
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentTournamentId, setCurrentTournamentId] = useState(localStorage.getItem("selectedTournament") || "");
  const [currentTournamentName, setCurrentTournamentName] = useState(localStorage.getItem("selectedTournamentName") || "");
  const [selectedTargetKU, setSelectedTargetKU] = useState(""); 
  const [selectedPlayers, setSelectedPlayers] = useState([]); 

  // --- 1. AMBIL DATA (PESERTA, MASTER KU, DAN TIM GANDA) ---
const fetchData = useCallback(async (idOverride) => {
  const tournamentId = idOverride || localStorage.getItem("selectedTournament");
  if (!tournamentId) return;

  setLoading(true);
  try {
    // LANGKAH 1: Ambil data utama (Peserta & Kategori)
    // Kita tidak pakai Promise.all agar jika satu gagal, yang lain tetap jalan
    const resPeserta = await api.get(`/peserta/kelompok-umur?tournamentId=${tournamentId}`);
    setKelompokUmur(resPeserta.data || []);

    const resKU = await api.get("/kelompok-umur");
    setMasterKU(resKU.data || []);

    // LANGKAH 2: Ambil data tim ganda (Berisiko Error 500)
    try {
      const resTeams = await api.get(`/double-teams?tournamentId=${tournamentId}`);
      setDoubleTeams(resTeams.data || []);
    } catch (teamErr) {
      // Jika error 500, kita tangkap di sini agar tidak merusak list peserta
      console.warn("⚠️ Backend Ganda Error 500, tapi list peserta tetap aman.");
      setDoubleTeams([]); 
    }

  } catch (err) {
    console.error("❌ Error fetch data utama:", err);
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

  // --- 2. LOGIKA FILTER: PLAYER YANG SUDAH BERPASANGAN ---
  // Kumpulkan semua ID pemain yang sudah masuk di tabel doubleTeams
  const pairedPlayerIds = doubleTeams.reduce((acc, team) => {
    acc.push(team.player1Id, team.player2Id);
    return acc;
  }, []);

  const handleSelectPlayer = (id) => {
    const playerId = Number(id);
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(pid => pid !== playerId));
    } else {
      if (selectedPlayers.length < 2) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        alert("Maksimal 2 pemain!");
      }
    }
  };

  const handlePasangkan = async () => {
    if (selectedPlayers.length !== 2) return alert("Pilih 2 pemain!");
    if (!selectedTargetKU) return alert("Pilih Kategori Ganda target!");

    try {
      const payload = {
        player1Id: selectedPlayers[0],
        player2Id: selectedPlayers[1],
        tournamentId: parseInt(currentTournamentId),
        kelompokUmurTargetId: parseInt(selectedTargetKU)
      };

      const res = await api.post("/double-teams", payload);
      alert(res.data.msg);
      setSelectedPlayers([]);
      fetchData(); // Refresh data agar list terupdate
    } catch (err) {
      alert(err.response?.data?.msg || "Terjadi kesalahan");
    }
  };

  const hitungUmur = (tanggalLahir) => {
    if (!tanggalLahir) return 0;
    const lahir = new Date(tanggalLahir);
    const hariIni = new Date();
    let umur = hariIni.getFullYear() - lahir.getFullYear();
    const m = hariIni.getMonth() - lahir.getMonth();
    if (m < 0 || (m === 0 && hariIni.getDate() < lahir.getDate())) {
      umur--;
    }
    return umur;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      {/* HEADER & SELECTOR */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Ganda</h1>
          <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">{currentTournamentName}</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <select 
            className="p-2.5 bg-gray-50 border rounded-xl text-sm font-bold outline-none min-w-[200px]"
            value={selectedTargetKU}
            onChange={(e) => {
              setSelectedTargetKU(e.target.value);
              setSelectedPlayers([]);
            }}
          >
            <option value="">-- Pilih Kategori Target --</option>
            {masterKU.map(ku => (
              <option key={ku.id} value={ku.id}>Ganda {ku.nama}</option>
            ))}
          </select>

          <button 
            onClick={handlePasangkan}
            disabled={selectedPlayers.length !== 2 || !selectedTargetKU}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg
              ${selectedPlayers.length === 2 && selectedTargetKU 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            <UserPlus size={18} /> PASANGKAN ({selectedPlayers.length}/2)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: DAFTAR PEMAIN TERSEDIA */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
            <Users size={20} className="text-blue-600"/> Pemain Tersedia
          </h3>
          
          {kelompokUmur.map((ku) => {
            // 1. Ambil Kategori Ganda Target dari Dropdown
            const targetKUObj = masterKU.find(m => m.id === parseInt(selectedTargetKU));
            const maxUmurTarget = parseInt(targetKUObj?.umur || 99); // Default 99 jika belum pilih

            // 2. Filter Peserta: 
            // - Belum punya pasangan (pairedPlayerIds)
            // - Sesuai dengan pencarian (searchTerm)
            const listPeserta = (ku.peserta || ku.Peserta || []).filter(p => !pairedPlayerIds.includes(p.id));

            if (listPeserta.length === 0) return null;

            return (
              <div key={ku.id} className="bg-white border rounded-2xl overflow-hidden mb-6 shadow-sm">
                <div className="p-4 bg-gray-50 flex justify-between items-center border-b">
                  <h2 className="text-sm font-black text-gray-700 uppercase">{ku.nama}</h2>
                  <span className="text-[10px] font-bold text-gray-400 italic">Batas Kategori: {maxUmurTarget} Tahun</span>
                </div>
                
                <table className="w-full text-left bg-white">
                  <tbody className="divide-y divide-gray-50">
                    {listPeserta.map((p) => {
                      // HITUNG UMUR ASLI PEMAIN DARI TANGGAL LAHIR
                      const umurPemain = hitungUmur(p.tanggalLahir);
                      
                      // VALIDASI: Apakah umur pemain <= Batas Kategori Target?
                      const isAllowed = !selectedTargetKU || (umurPemain <= maxUmurTarget);

                      return (
                        <tr 
                          key={p.id} 
                          onClick={() => isAllowed && handleSelectPlayer(p.id)}
                          className={`transition-all ${isAllowed 
                            ? 'cursor-pointer hover:bg-blue-50/50' 
                            : 'bg-gray-50 opacity-50 cursor-not-allowed'}`}
                        >
                          <td className="px-6 py-3 w-12 text-center">
                            {isAllowed ? (
                              <div className={`w-5 h-5 rounded border flex items-center justify-center
                                ${selectedPlayers.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {selectedPlayers.includes(p.id) && <CheckCircle2 size={14} className="text-white" />}
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                                <span className="text-[8px] text-red-500 font-bold">X</span>
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-col">
                              <span className={`font-bold text-sm ${isAllowed ? 'text-gray-800' : 'text-gray-400'}`}>
                                {p.namaLengkap}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                Lahir: {p.tanggalLahir} ({umurPemain} thn)
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!isAllowed && (
                              <span className="text-[9px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                                OVERAGE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* KOLOM KANAN: DAFTAR TIM GANDA YANG SUDAH JADI */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
            <Users2 size={20} className="text-green-600"/> Tim Ganda Terdaftar
          </h3>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Pasangan Tim</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doubleTeams.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-10 text-center text-gray-400 text-sm">Belum ada tim ganda.</td>
                  </tr>
                ) : (
                  doubleTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-gray-800">{team.Player1?.namaLengkap || 'Pemain 1'}</span>
                          <div className="w-px h-2 bg-gray-300 ml-2"></div>
                          <span className="text-sm font-black text-gray-800">{team.Player2?.namaLengkap || 'Pemain 2'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">
                          Ganda {team.KelompokUmur?.nama || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PesertaGanda;