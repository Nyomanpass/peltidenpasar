import { Users, Calendar, Trophy, List, ClipboardList, CheckSquare, Settings, Award } from "lucide-react";
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

  // Listener event (TIDAK ADA fetchPeserta di sini!)
  useEffect(() => {
    const handleTournamentChangeLocal = () => {
      console.log("Tournament berubah (Sidebar menerima event)");
      // Sidebar TIDAK fetch data apapun!
    };

    window.addEventListener("tournament-changed", handleTournamentChangeLocal);
    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChangeLocal);
    };
  }, []);

  // Ketika dropdown dipilih
const handleTournamentChange = (e) => {
  const id = e.target.value;              // ID tournament
  const name = e.target.selectedOptions[0].text; // NAMA tournament

  setSelectedTournament(id);

  // Simpan dua-duanya
  localStorage.setItem("selectedTournament", id);
  localStorage.setItem("selectedTournamentName", name);

  // Broadcast event
  window.dispatchEvent(new Event("tournament-changed"));
};

  const adminMenu = [
    { label: "Verifikasi Admin", path: "/admin/verify", icon: <CheckSquare size={18} /> },
    { label: "Tournament", path: "/admin/tournament", icon: <Award size={18} />},
    { label: "Peserta", path: "/admin/peserta", icon: <Users size={18} /> },
    { label: "Jadwal Pertandingan", path: "/admin/jadwal-pertandingan", icon: <Calendar size={18} /> },
    { label: "Bagan", path: "/admin/bagan-peserta", icon: <List size={18} /> },
    { label: "Skor", path: "/admin/skor", icon: <ClipboardList size={18} /> },
    { label: "Hasil Pertandingan", path: "/admin/hasil-pertandingan", icon: <Trophy size={18} /> },
    { label: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ];

  const wasitMenu = [
    { label: "Peserta", path: "/wasit/peserta", icon: <Users size={18} /> },
    { label: "Jadwal Pertandingan", path: "/wasit/jadwal-pertandingan", icon: <Calendar size={18} /> },
    { label: "Bagan", path: "/wasit/bagan-peserta", icon: <List size={18} /> },
    { label: "Skor", path: "/wasit/skor", icon: <ClipboardList size={18} /> },
  ];

  const menuItems = role === "admin" ? adminMenu : wasitMenu;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-white shadow-md z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
    >
      <nav className="px-2 mt-16">
        <div className="p-4 border-b bg-gray-50">
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Pilih Tournament
          </label>

          <select
            value={selectedTournament}
            onChange={handleTournamentChange}
            className="w-full border p-2 rounded-lg bg-white"
          >
            <option value="">-- Semua Tournament --</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <ul className="space-y-2 mt-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg 
                  ${location.pathname === item.path
                    ? "bg-yellow-200 text-yellow-600"
                    : "hover:bg-gray-100"}
                `}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
