import { useState } from "react";
import { FaFacebook, FaInstagram, FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full shadow-md">
      {/* Topbar */}
      <div className="bg-black text-white text-xs sm:text-sm flex justify-between items-center px-4 sm:px-10 lg:px-40 py-2">
        <p className="hidden sm:block">
          Jalan Gunung Agung Desa Pemecutan Kaja Kota Denpasar, Bali
        </p>
        <div className="flex gap-3 ml-auto sm:ml-0">
          <a>
            <FaFacebook className="hover:text-yellow-400 cursor-pointer" />
          </a>
          <a>
            <FaInstagram className="hover:text-yellow-400 cursor-pointer" />
          </a>
        </div>
      </div>

      {/* Mainbar */}
      <div className="bg-white h-25 flex justify-between items-center px-4 sm:px-10 lg:px-40">
        {/* Logo + Text */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo Pelti"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <div className="flex flex-col text-black leading-none">
            <h1 className="text-xl sm:text-2xl font-bold">PELTI DENPASAR</h1>
            <h2 className="text-xs sm:text-sm font-medium -mt-1">
              Persatuan Lawn Tenis Indonesia
            </h2>
          </div>
        </div>

        {/* Navigation Menu (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium">
          <span className="hover:text-yellow-500 cursor-pointer">Beranda</span>
          <span className="hover:text-yellow-500 cursor-pointer">Profil</span>
          <span className="hover:text-yellow-500 cursor-pointer">Pengumuman</span>
          <span className="hover:text-yellow-500 cursor-pointer">Berita</span>
          <button className="bg-yellow-400 text-black px-3 py-2 rounded-md hover:bg-yellow-500 transition">
            Login →
          </button>
        </nav>

        {/* Hamburger Button (Mobile) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md flex flex-col items-start px-6 py-4 space-y-3 text-sm font-medium">
          <span className="hover:text-yellow-500 cursor-pointer">Beranda</span>
          <span className="hover:text-yellow-500 cursor-pointer">Profil</span>
          <span className="hover:text-yellow-500 cursor-pointer">Pengumuman</span>
          <span className="hover:text-yellow-500 cursor-pointer">Berita</span>
          <button className="bg-yellow-400 text-black px-3 py-2 rounded-md hover:bg-yellow-500 transition">
            Login →
          </button>
        </div>
      )}
    </header>
  );
}
