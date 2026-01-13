import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

// --- Ikon SVG ---
const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.78 4.09H5.22A3.22 3.22 0 0 0 2 7.31v9.38A3.22 3.22 0 0 0 5.22 20h13.56A3.22 3.22 0 0 0 22 16.69V7.31A3.22 3.22 0 0 0 18.78 4.09zM10.47 14.41V9.59l4.13 2.41-4.13 2.41z" />
  </svg>
);
const DownArrow = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) setShowNav(false);
      else setShowNav(true);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const activeClass = "text-amber-700 font-bold border-b-2 border-amber-700 pb-1";
  const inactiveClass = "text-gray-700 hover:text-amber-700";

  // Nav items
  const navItems = [
    { name: "Home", path: "/" },
    {
      name: "Tentang Kami",
      children: [
        { name: "Visi & Misi", path: "/about/visi-misi" },
        { name: "Struktur Organisasi", path: "/about/struktur-organisasi" },
        { name: "Kepengurusan", path: "/about/kepengurusan" },
        { name: "Anggota", path: "/about/anggota" },
        { name: "Berita", path: "/berita" },

      ],
    },
    { name: "Turnamen", path: "/tournament" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      {/* Top Bar */}
      <div className="bg-black text-white text-xs sm:text-sm px-4 sm:px-10 lg:px-40 py-1 flex justify-between items-center">
        <p>Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali</p>
        <div className="flex gap-3">
          <FacebookIcon className="w-5 h-5" />
          <InstagramIcon className="w-5 h-5" />
          <YoutubeIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white px-4 sm:px-10 lg:px-40 py-4 shadow-md flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PELTI" className="w-10 md:w-14" />
          <div>
            <h1 className="font-bold text-lg md:text-2xl">PELTI DENPASAR</h1>
            <p className="text-[10px] md:text-xs font-semibold">
              Persatuan Lawn Tenis Indonesia
            </p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 font-medium">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.name} className="relative group">
                <span className="cursor-pointer text-sm uppercase text-gray-700 hover:text-amber-700 flex items-center gap-1">
                  {item.name} <DownArrow className="w-3 h-3" />
                </span>
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.path}
                      className="block px-5 py-3 text-sm hover:bg-amber-50 hover:text-amber-700 rounded-xl"
                    >
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `cursor-pointer text-sm uppercase ${isActive ? activeClass : inactiveClass}`}
              >
                {item.name}
              </NavLink>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-lg px-6 py-4 space-y-3">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.name}>
                <button
                  onClick={() =>
                    setDropdownOpen((prev) => ({ ...prev, [item.name]: !prev[item.name] }))
                  }
                  className="w-full text-left font-semibold flex justify-between items-center"
                >
                  {item.name} <DownArrow className={`w-3 h-3 transform transition-transform ${dropdownOpen[item.name] ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen[item.name] && (
                  <div className="pl-4 mt-2 flex flex-col space-y-2 text-sm">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className="hover:text-amber-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                className="block py-2"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            )
          )}
        </div>
      )}
    </header>
  );
}
