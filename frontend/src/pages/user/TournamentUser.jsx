import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TournamentHero from "../../components/TournamentHero";
import TournamentComming from "../../components/TournamentComming";
import TournamentArchive from "../../components/TournamentArchive";
import FinalContactCTA from "../../components/TournamentGallery";
import TournamentCTA from "../../components/TournamentCTA";

function TournamentUser() {


  return (
    <>
    <Navbar/>
    {/* HERO */}
      <div className="relative w-full h-[300px] mt-30">
        <img
          src="/hero.jpg"
          alt="Kepengurusan Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
           Jadwal Turnamen Mendatang
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
            Panggung resmi untuk membuktikan kualitas atlet, meraih poin ranking kota, dan mengikuti seleksi menuju kejuaraan provinsi
          </p>
        </div>
      </div>
    <TournamentComming/>
    <TournamentArchive/>
    <FinalContactCTA/>
    <TournamentCTA/>
    <Footer/>
    </>
  );
}

export default TournamentUser;
