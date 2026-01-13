import { Users, Calendar, Trophy, List, Monitor, ClipboardList, CheckSquare, Settings, Award, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(
    localStorage.getItem("selectedTournament") || ""
  );
  
  // STATE BARU untuk mengontrol tampilan list tournament (Accordion)
  const [isTournamentListOpen, setIsTournamentListOpen] = useState(false);

  // Ambil daftar tournament aktif
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await api.get('/tournaments');
        const active = res.data.filter((t) => t.status === "aktif");
        setTournaments(active);
      } catch (err) {
        console.error("Fetch tournament error:", err);
      }
    };

    fetchTournament();
  }, []);

  // Listener event
  useEffect(() => {
    const handleTournamentChangeLocal = () => {
      console.log("Tournament berubah (Sidebar menerima event)");
    };

    window.addEventListener("tournament-changed", handleTournamentChangeLocal);
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChangeLocal);
    };
  }, []);
  
  // FUNGSI BARU: Menggantikan handleTournamentChange (untuk Menu Accordion)
  const handleTournamentSelect = (t) => {
    const id = t.id;              
    const name = t.name; 

    setSelectedTournament(id);
    localStorage.setItem("selectedTournament", id);
    localStorage.setItem("selectedTournamentName", name);

    // Broadcast event
    window.dispatchEvent(new Event("tournament-changed"));
  };


  // Catatan: Saya mengubah ukuran icon menjadi 18px agar seragam dan lebih proporsional di sidebar
  const adminMenu = [
    // { label: "Verifikasi Admin", path: "/admin/verify", icon: <CheckSquare size={20} /> },
    { label: "Peserta", path: "/admin/peserta", icon: <Users size={20} /> },
    { label: "Bagan", path: "/admin/bagan-peserta", icon: <List size={20} /> },
    { label: "Jadwal Pertandingan", path: "/admin/jadwal-pertandingan", icon: <Calendar size={20} /> },
    { label: "Hasil Pertandingan", path: "/admin/hasil-pertandingan", icon: <Trophy size={20} /> },
    { label: "Skor", path: "/admin/skor", icon: <ClipboardList size={20} /> },
    { label: "Tournament", path: "/admin/tournament", icon: <Award size={20} />},
    { label: "Game Settings", path: "/admin/settings", icon: <Settings size={20} /> },
    { label: "UI Settings", path: "/admin/uisettings", icon: <Monitor size={20} /> },
  ];

  const wasitMenu = [
    { label: "Peserta", path: "/wasit/peserta", icon: <Users size={20} /> },
    { label: "Jadwal Pertandingan", path: "/wasit/jadwal-pertandingan", icon: <Calendar size={20} /> },
    { label: "Bagan", path: "/wasit/bagan-peserta", icon: <List size={20} /> },
    { label: "Skor", path: "/wasit/skor", icon: <ClipboardList size={20} /> },
  ];

  const menuItems = role === "admin" ? adminMenu : wasitMenu;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-secondary shadow-xl z-50
        border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
    >
      <nav className="px-4 mt-3">
        {/* --- BLOK PEMILIHAN TOURNAMENT (GAYA MENU ACCORDION) --- */}
        <div className="mb-6">
          <button
            onClick={() => setIsTournamentListOpen(!isTournamentListOpen)}
            className="flex items-center justify-between w-full p-3 rounded-lg text-white font-bold hover:bg-primary/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <List size={20} className="text-white" />
              <span className="text-md">Pilih Tournament</span>
            </div>
            {isTournamentListOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {isTournamentListOpen && (
            <ul className="mt-1 space-y-1 bg-white/20 rounded-lg p-2"> 


              {/* Daftar Tournament Aktif */}
              {tournaments.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => handleTournamentSelect(t)}
                    className={`
                      w-full text-left p-3 rounded-md text-sm transition-colors 
                      ${selectedTournament === t.id 
                        ? "bg-primary/80 text-white" 
                        : "text-gray-200 hover:bg-primary/80"}
                    `}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* --- END BLOK PEMILIHAN TOURNAMENT BARU --- */}
       {/* Menu List Utama */}
      <ul className="space-y-1 mt-6 border-t border-white pt-4">
        {menuItems.map((item) => {
          // LOGIKA PENGECEKAN AKTIF
          const currentPath = location.pathname;
          
          // 1. Cek apakah path sama persis
          const isExact = currentPath === item.path;
          
          // 2. Cek untuk sub-halaman Peserta
          const isPesertaDetail = item.label === "Peserta" && (
            currentPath.includes("detail-peserta") || 
            currentPath.includes("peserta-ganda") // <--- Tambahkan ini agar menu Peserta aktif saat di Peserta Ganda
          );
          
          // 3. Cek untuk sub-halaman Bagan
          const isBaganView = item.label === "Bagan" && currentPath.includes("bagan-view");

          // Gabungkan semua kondisi
          const isActive = isExact || isPesertaDetail || isBaganView;

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-4 mb-5 p-3 rounded-lg text-md font-medium
                  transition-all duration-150
                  ${isActive
                    ? "bg-primary/80 text-white shadow-md" 
                    : "text-white hover:bg-white/30 hover:text-white"}
                `}
              >
                <span className="text-white">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      </nav>
    </aside>
  );
}

export default Sidebar;