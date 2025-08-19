import { Users, Calendar, Trophy, List, ClipboardList, CheckSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const role = localStorage.getItem("role"); // ambil role user

  // menu khusus admin
  const adminMenu = [
    {
      label: "Verifikasi Admin",
      path: "/admin/verify",
      icon: <CheckSquare size={18} />,
    },
    {
      label: "Peserta",
      path: "/peserta/list",
      icon: <Users size={18} />,
    },
    {
      label: "Jadwal Pertandingan",
      path: "/jadwal",
      icon: <Calendar size={18} />,
    },
    {
      label: "Bagan",
      path: "/bagan",
      icon: <List size={18} />,
    },
    {
      label: "Skor",
      path: "/skor",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Hasil Pertandingan",
      path: "/hasil",
      icon: <Trophy size={18} />,
    },
  ];

  // menu khusus peserta
  const pesertaMenu = [
    {
      label: "Jadwal Pertandingan",
      path: "/jadwal",
      icon: <Calendar size={18} />,
    },
    {
      label: "Peserta",
      path: "/peserta/list",
      icon: <Users size={18} />,
    },
    {
      label: "Skor",
      path: "/skor",
      icon: <ClipboardList size={18} />,
    },
  ];

  const menuItems = role === "admin" ? adminMenu : pesertaMenu;

  return (
    <aside
      className={`bg-white shadow-md w-64 h-screen p-5 fixed top-0 left-0 z-50 md:block 
        ${isOpen ? "block" : "hidden"} md:w-64 md:h-screen`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-yellow-500 text-white w-10 h-10 flex items-center justify-center rounded-lg">
          P
        </div>
        <span className="text-xl font-bold">PELTI Denpasar</span>
      </div>
      <p className="mb-5">{role}</p>

      {/* Menu */}
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg 
                  ${
                    location.pathname === item.path
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
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
