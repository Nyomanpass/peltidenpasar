import { FaFacebook, FaInstagram } from "react-icons/fa";
export default function Footer() {
  return (
    <footer
      className="
        relative
        w-screen
        left-1/2 right-1/2
        -ml-[50vw] -mr-[50vw]
        text-left
        bg-black
        text-gray-300
      "
    >
      {/* Container isi footer */}
      <div className="max-w-screen  mx-auto px-6 sm:px-12 lg:px-45 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Logo + Deskripsi */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="logo.png" alt="Logo Pelti" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-extrabold text-white">
                PELTI DENPASAR
              </h1>
              <p className="text-sm text-gray-400">
                Persatuan Lawn Tenis Indonesia
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            PELTI Denpasar adalah organisasi olahraga yang fokus pada pengembangan
            tenis lapangan di Kota Denpasar, Bali.
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Navigasi</h2>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-yellow-400 transition">Beranda</li>
            <li className="hover:text-yellow-400 transition">Turnamen</li>
            <li className="hover:text-yellow-400 transition">Bagan</li>
            <li className="hover:text-yellow-400 transition">Jadwal</li>
            <li className="hover:text-yellow-400 transition">Kontak</li>
          </ul>
        </div>

        {/* Media Sosial */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Media Sosial</h2>
          <div className="flex gap-4">
            <div className="p-2 rounded-full bg-slate-700 hover:bg-yellow-400 hover:text-black transition aria-label='Facebook'">
                   <FaFacebook size={16} />
            </div>
            <div className="p-2 rounded-full bg-slate-700 hover:bg-yellow-400 hover:text-black transition aria-label='Instagram'">
                   <FaInstagram size={16} />
              
            </div>
          </div>
        </div>

        {/* Kontak */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Kontak</h2>
          <p className="text-sm text-gray-400">
            Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali
          </p>
          <p className="mt-2 text-sm text-gray-400">📞 (+62) 123-456-789</p>
          <p className="mt-2 text-sm text-gray-400">
            ✉️ peltidenpasar@gmail.com
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-700 text-center py-4 text-sm text-gray-400">
        © 2025 <span className="text-yellow-400 font-semibold">PELTI Denpasar</span>. All Rights Reserved.
      </div>
    </footer>
  );
}
