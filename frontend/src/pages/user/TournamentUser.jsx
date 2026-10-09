import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TournamentComming from "../../components/TournamentComming";
import TournamentArchive from "../../components/TournamentArchive";
import TournamentCTA from "../../components/TournamentCTA";

function TournamentUser() {
  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF (Persis seperti Halaman About Us) */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        {/* Foto Hero */}
        <img
          src="/hero.jpg"
          alt="Jadwal Turnamen Pelti Denpasar"
          className="w-full h-full object-cover object-center"
        />

        {/* Overlay Gelap */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Konten Teks di Tengah */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          {/* Sub-label Kuning Atas */}
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>

          {/* Judul Utama */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Jadwal Turnamen Mendatang
          </h1>

          {/* Deskripsi Singkat */}
          <p className="text-gray-200 text-xs sm:text-sm max-w-lg mt-1.5 opacity-90 hidden sm:block">
            Panggung resmi untuk membuktikan kualitas atlet, meraih poin
            ranking kota, dan mengikuti seleksi menuju kejuaraan provinsi.
          </p>

          {/* Garis Aksen Kuning di Bawah */}
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* CONTENT */}
      <TournamentComming />
      <TournamentArchive />
      <TournamentCTA />

      <Footer />
    </>
  );
}

export default TournamentUser;