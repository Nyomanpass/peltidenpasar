import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NavbarDashboard({ toggleSidebar }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between fixed top-0 left-0 z-50">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          <Menu size={22} />
        </button>
        {/* Logo Pelatnas Denpasar ditambahkan di sini */}
        <img src="/logo.png" alt="Logo Pelatnas Denpasar" className="h-8 w-auto" /> 
        <span className="font-bold text-lg">Dashboard</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
      >
        <LogOut size={18} /> Logout
      </button>
    </nav>
  );
}

export default NavbarDashboard;