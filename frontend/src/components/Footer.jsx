import { FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="relative text-gray-300 min-h-[400px] flex flex-col"
      style={{
            backgroundImage: "url('/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay hitam transparan */}
      <div className="absolute inset-0 bg-black opacity-70 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex-grow flex items-center">
        <div className="w-full px-6 sm:px-12 lg:px-40 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + Deskripsi */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="logo.png" alt="Logo Pelti" className="w-12 h-12" />
              <div className="leading-none">
                <h1 className="text-xl font-bold">PELTI DENPASAR</h1>
                <p className="text-sm font-medium">
                  Persatuan Lawn Tenis Indonesia
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed">
              PELTI Denpasar (Persatuan Lawn Tenis Indonesia) Denpasar adalah
              organisasi olahraga yang fokus pada pengembangan tenis lapangan di
              Kota Denpasar, Bali. PELTI Denpasar berkomitmen untuk meningkatkan
              kualitas atlet, memfasilitasi turnamen, dan mendorong partisipasi
              masyarakat dalam olahraga tenis.
            </p>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Navigasi Cepat</h2>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-yellow-400 cursor-pointer">About</li>
              <li className="hover:text-yellow-400 cursor-pointer">Growers</li>
              <li className="hover:text-yellow-400 cursor-pointer">Merchants</li>
              <li className="hover:text-yellow-400 cursor-pointer">Partners</li>
              <li className="hover:text-yellow-400 cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Social</h2>
            <div className="flex gap-3">
              <a>
                <FaFacebook
                  className="hover:text-yellow-400 cursor-pointer"
                  size={20}
                />
              </a>
              <a>
                <FaInstagram
                  className="hover:text-yellow-400 cursor-pointer"
                  size={20}
                />
              </a>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Kontak</h2>
            <p className="text-sm leading-relaxed">
              Jalan Gunung Agung, Desa Pemecutan Kaja, Kota Denpasar, Bali
            </p>
            <p className="mt-2 text-sm">(+62) 123-456-789</p>
            <p className="mt-2 text-sm">peltidenpasar@gmail.co.id</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative z-10 bg-yellow-400 text-black text-center py-2 text-sm font-medium">
        © 2025 PELTI Denpasar. All Rights Reserved.
      </div>
    </footer>
  );
}
