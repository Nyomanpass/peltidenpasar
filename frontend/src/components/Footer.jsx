import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <footer className="relative bg-cover bg-center text-white" style={{ backgroundImage: "url('hero.jpg')" }}>
      {/* Overlay hitam transparan */}
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 container mx-auto px-4 md:px-20 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Kolom 1 - Logo & Deskripsi */}
        <div>
          <img src="logo.png" alt="Logo PELTI" className="h-14 mb-4" />
          <h2 className="text-xl font-bold">PELTI DENPASAR</h2>
          <p className="text-sm mt-3 text-gray-300">
            Persatuan Tenis Lapangan Indonesia (PELTI) Denpasar adalah organisasi
            olahraga tenis yang berkomitmen untuk mengembangkan prestasi dan
            membina generasi muda.
          </p>
        </div>

        {/* Kolom 2 - Navigasi Cepat */}
        <div>
          <h3 className="font-bold text-lg mb-4">Navigasi Cepat</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#home" className="hover:text-yellow-400">Beranda</a></li>
            <li><a href="#struktur" className="hover:text-yellow-400">Struktur</a></li>
            <li><a href="#pengumuman" className="hover:text-yellow-400">Pengumuman</a></li>
            <li><a href="#berita" className="hover:text-yellow-400">Berita</a></li>
            <li><a href="#kontak" className="hover:text-yellow-400">Kontak</a></li>
          </ul>
        </div>

        {/* Kolom 3 - Sosial Media */}
        <div>
          <h3 className="font-bold text-lg mb-4">Social</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-yellow-400 text-2xl">
              <FaFacebook />
            </a>
            <a href="#" className="text-gray-300 hover:text-yellow-400 text-2xl">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-300 hover:text-yellow-400 text-2xl">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Kolom 4 - Alamat */}
        <div>
          <h3 className="font-bold text-lg mb-4">Alamat</h3>
          <p className="text-sm text-gray-300">
            Jalan Gunung Agung <br />
            Desa Pemecutan Kaja, <br />
            Kota Denpasar, Bali
          </p>
          <p className="text-sm text-gray-300 mt-3">📞 0812-3456-7890</p>
          <p className="text-sm text-gray-300">✉️ info@pelti-denpasar.org</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 bg-yellow-400 text-black text-center py-4 text-sm font-medium">
        © 2025 PELTI Denpasar. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
