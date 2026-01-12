import { useState } from "react";
import { NavLink } from "react-router-dom";

// --- Ikon SVG Sederhana ---
const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const YoutubeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.78 4.09H5.22A3.22 3.22 0 0 0 2 7.31v9.38A3.22 3.22 0 0 0 5.22 20h13.56A3.22 3.22 0 0 0 22 16.69V7.31A3.22 3.22 0 0 0 18.78 4.09zm-8.31 10.32v-4.82l4.13 2.41-4.13 2.41z"/>
  </svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Tentang Kami", path: "/about" },
    { name: "Turnamen", path: "/tournament" },
    { name: "Contact", path: "/contact" },
  ];

  const activeClass = "text-amber-700 font-bold border-b-2 border-amber-700 pb-1";
  const inactiveClass = "text-gray-700 hover:text-amber-700";

  return (
    <header className="w-full fixed top-0 z-50">
      {/* Top Bar */}
      <div className="relative bg-black min-h-[30px] flex items-center shadow-lg">
        <div className="relative z-10 w-full flex justify-between items-center px-4 sm:px-10 lg:px-40 py-2 text-white text-xs sm:text-sm">
          <p>Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali</p>

          <div className="flex items-center space-x-3">
            <a href="#" aria-label="Facebook" className="w-6 h-6 flex items-center justify-center bg-white/70 rounded-full hover:bg-white transition duration-200">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-6 h-6 flex items-center justify-center bg-white/70 rounded-full hover:bg-white transition duration-200">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Youtube" className="w-6 h-6 flex items-center justify-center bg-white/70 rounded-full hover:bg-white transition duration-200">
              <YoutubeIcon className="w-4 h-4" />
            </a>
            <NavLink to="/daftar-peserta" className="flex items-center space-x-1 text-sm font-medium border-l border-white/30 pl-4">
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Daftar</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Navbar Utama */}
      <nav className="bg-white py-4 px-4 sm:px-10 lg:px-40 flex items-center justify-between shadow-md">
        {/* Logo */}
       <div className="flex items-center gap-2 md:gap-4">
        <img
          src="/logo.png"
          alt="Logo PELTI"
          className="w-10 md:w-14 h-auto"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/000000/ffffff?text=PELTI" }}
        />
        <div>
          <h1 className="font-bold text-lg md:text-2xl text-black leading-none">PELTI DENPASAR</h1>
          <p className="text-[10px] md:text-xs font-semibold mt-1">Persatuan Lawn Tenis Indonesia</p>
        </div>
      </div>


        {/* Menu Desktop */}
        <div className="hidden lg:flex items-center space-x-6 font-medium text-black">
          {navItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) => `cursor-pointer text-sm uppercase ${isActive ? activeClass : inactiveClass}`}
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Hamburger Mobile */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="bg-white shadow-lg lg:hidden flex flex-col px-6 py-4 space-y-4 font-medium text-black">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `cursor-pointer p-2 rounded-lg ${isActive ? activeClass : inactiveClass}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
          <NavLink
            to="/komunitas"
            className="cursor-pointer bg-[#D4A949] text-[#5A4B29] font-bold px-4 py-2 rounded-xl text-center shadow-md mt-4"
            onClick={() => setMenuOpen(false)}
          >
            KOMUNITAS TENIS
          </NavLink>
        </div>
      )}
    </header>
  );
}
