import { useState } from "react";

// --- Ikon SVG Sederhana (Pengganti react-icons) ---

// Ikon Telepon/Hubungi Kami
const PhoneIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.67-2.61L7.54 13.9a1 1 0 0 0-.58-.58l-.66-.66a.8.8 0 0 1-.22-.44.8.8 0 0 1-.07-.36 1.3 1.3 0 0 1 .35-1.16l2.9-2.9a1 1 0 0 1 1.41 0l1.83 1.83a1 1 0 0 1 .28.94 1 1 0 0 1-.3.33l-1.4 1.4a.5.5 0 0 0-.1.5 14.86 14.86 0 0 0 7.32 7.32.5.5 0 0 0 .5-.1l1.4-1.4a1 1 0 0 1 .33-.3 1 1 0 0 1 .94.28l1.83 1.83a1 1 0 0 1 0 1.41l-2.9 2.9a1.3 1.3 0 0 1-1.16.35z"/>
  </svg>
);

// Ikon Kalender
const CalendarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// Ikon Sosial
const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const YoutubeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.78 4.09H5.22A3.22 3.22 0 0 0 2 7.31v9.38A3.22 3.22 0 0 0 5.22 20h13.56A3.22 3.22 0 0 0 22 16.69V7.31A3.22 3.22 0 0 0 18.78 4.09zm-8.31 10.32v-4.82l4.13 2.41-4.13 2.41z"/></svg>
);
const SearchIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
  const [activeMenu, setActiveMenu] = useState("Beranda"); // State untuk menu aktif

  const handleNavigation = (path, name) => {
    console.log("Navigasi ke:", path);
    setActiveMenu(name);
    setMenuOpen(false);
  };
  
  // Fungsi untuk menentukan style menu aktif
  const getMenuStyle = (name) => {
    return activeMenu === name 
      ? "text-amber-700 font-bold border-b-2 border-amber-700 pb-1" 
      : "text-gray-700 hover:text-amber-700";
  };
  
  // Data Navigasi untuk memudahkan mapping
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Tentang Kami", path: "/about" },
    { name: "Turnamen", path: "/tournament" },

    { name: "Contact", path: "/contact" },
  ];


  return (
   <header className="w-full fixed top-0 z-50">
      {/* Top Bar (Warna Emas dan Cokelat Tua dengan shape diagonal) */}
      <div className="relative bg-secondary min-h-[45px] flex items-center shadow-lg">
        
        {/* Konten Top Bar */}
        <div className="relative z-10 w-full flex justify-between items-center px-4 md:px-8 lg:px-20">
          
          {/* Tombol Kiri (Hubungi Kami & Kalender Pertandingan) */}
          <div className="flex space-x-2 md:space-x-4 text-white">
             <p>Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali</p>
          </div>

          {/* Ikon Kanan (Sosial Media, Login, Cari) */}
          <div className="flex items-center space-x-4 text-white">
            
            {/* Ikon Sosial Media (Warna Cokelat Tua) */}
            <div className="hidden md:flex space-x-3 text-secondary">
              <a href="#" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center bg-white/70 rounded-full hover:bg-white transition duration-200">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center bg-white/70 rounded-full hover:bg-white transition duration-200">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Youtube" className="w-8 h-8 flex items-center justify-center bg-white/70 rounded-full hover:bg-white transition duration-200">
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
            
            {/* Login / Daftar */}
            <a href='/daftar-peserta' className="cursor-pointer flex items-center space-x-1 text-sm font-medium border-l border-white/30 pl-4">
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Daftar</span>
            </a>  
          </div>
        </div>
      </div>
      
      {/* Navbar Utama (Putih) */}
      <nav className="bg-white py-2 px-4 md:px-8 lg:px-20 flex items-center justify-between shadow-md">
        
        {/* Logo Kiri */}
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" // Menggunakan nama logo yang lebih spesifik
            alt="Logo Persatuan Tenis Seluruh Indonesia PELTI" 
            className="w-12 md:w-14 h-auto" 
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/000000/ffffff?text=PELTI" }} 
          />
          <div className="hidden md:block">
            <h1 className="font-bold text-xl text-black leading-none">PELTI DENPASAR</h1>
            <p className="text-xs text-gray-600 font-semibold mt-1">Persatuan Lawn Tenis Indonesia Denpasar</p>
          </div>
        </div>

        {/* Menu Desktop Tengah */}
        <div className="hidden lg:flex items-center space-x-6 font-medium text-black">
          {navItems.map((item) => (
            <a 
              href={item.path}
              key={item.name}
              onClick={() => handleNavigation(item.path, item.name)} 
              className={`cursor-pointer text-sm uppercase ${getMenuStyle(item.name)}`}
            >
              {item.name}
            </a>
          ))}
        </div>
        
        {/* Tombol Menu Mobile */}
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

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="bg-white shadow-lg lg:hidden flex flex-col px-6 py-4 space-y-4 font-medium text-black">
          {navItems.map((item) => (
            <a 
              key={item.name}
              onClick={() => handleNavigation(item.path, item.name)} 
              className={`cursor-pointer p-2 rounded-lg ${getMenuStyle(item.name)}`}
            >
              {item.name}
            </a>
          ))}
          <a onClick={() => handleNavigation("/komunitas", "Komunitas")} className="cursor-pointer bg-[#D4A949] text-[#5A4B29] font-bold px-4 py-2 rounded-xl text-center shadow-md mt-4">
             KOMUNITAS TENIS
          </a>
        </div>
      )}
    </header>

  );
}