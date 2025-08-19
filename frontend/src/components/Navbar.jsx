import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 z-50 shadow-sm">
      {/* Top Bar Hitam */}
      <div className="bg-black text-white text-sm flex justify-between items-center px-4 md:px-20 py-1">
        <p>Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali</p>
        <div className="flex space-x-3">
          <a href="#" className="hover:text-yellow-400">
            <FaFacebook size={18} />
          </a>
          <a href="#" className="hover:text-yellow-400">
            <FaInstagram size={18} />
          </a>
        </div>
      </div>

      {/* Navbar Putih */}
      <nav className="bg-white py-3 px-4 md:px-20 flex items-center justify-between">
        {/* Logo + Teks */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png" // ganti sesuai logo PELTI
            alt="Logo PELTI"
            className="w-12 h-12"
          />
          <div>
            <h1 className="font-bold text-lg text-black">PELTI DENPASAR</h1>
            <p className="text-sm text-gray-600 -mt-1">
              Persatuan Lawn Tenis Indonesia
            </p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-black">
          <Link to="/" className="hover:text-yellow-500">
            Beranda
          </Link>
          <Link to="/profil" className="hover:text-yellow-500">
            Profil
          </Link>
          <Link to="/pengumuman" className="hover:text-yellow-500">
            Pengumuman
          </Link>
          <Link to="/berita" className="hover:text-yellow-500">
            Berita
          </Link>
          <Link
            to="/login"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded-md flex items-center gap-1"
          >
            Login
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-black"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="bg-white shadow-md md:hidden flex flex-col px-6 py-4 space-y-4 font-medium text-black">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Beranda
          </Link>
          <Link to="/profil" onClick={() => setMenuOpen(false)}>
            Profil
          </Link>
          <Link to="/pengumuman" onClick={() => setMenuOpen(false)}>
            Pengumuman
          </Link>
          <Link to="/berita" onClick={() => setMenuOpen(false)}>
            Berita
          </Link>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded-md flex items-center gap-1"
          >
            Login <span className="text-lg">→</span>
          </Link>
        </div>
      )}
    </header>
  );
}
