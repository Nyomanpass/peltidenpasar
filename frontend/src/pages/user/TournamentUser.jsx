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
    <TournamentHero/>
    <TournamentComming/>
    <TournamentArchive/>
    <FinalContactCTA/>
    <TournamentCTA/>
    <Footer/>
    </>
  );
}

export default TournamentUser;
