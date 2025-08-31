
import { Users, Calendar, Trophy, List, ClipboardList, CheckSquare, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";


function Sidebar({ isOpen }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const adminMenu = [
    { label: "Verifikasi Admin", path: "/admin/verify", icon: <CheckSquare size={18} /> },
    { label: "Peserta", path: "/admin/peserta/", icon: <Users size={18} /> },
    { label: "Jadwal Pertandingan", path: "/admin/jadwal-pertandingan", icon: <Calendar size={18} /> },
    { label: "Bagan", path: "/admin/bagan-peserta", icon: <List size={18} /> },
    { label: "Skor", path: "/admin/skor", icon: <ClipboardList size={18} /> },
    { label: "Hasil Pertandingan", path: "/admin/hasil-pertandingan", icon: <Trophy size={18} /> },
    { label: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
  ];

  const wasitMenu = [
    { label: "Peserta", path: "/wasit/peserta/", icon: <Users size={18} /> },
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

      {/* Menu */}
      <nav className="px-2 mt-22">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg 
                  ${location.pathname === item.path
                    ? "bg-yellow-200 text-yellow-600"
                    : "hover:bg-gray-100"}`}
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
