import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HomeNews from "../components/HomeNews"; // <-- Ganti News dengan HomeNews
import Footer from "../components/Footer";
import TournamentComming from "../components/TournamentComming";

function Home(){
    return(
        <>
            <Navbar/>
            <Hero/>
            <TournamentComming/>
            <HomeNews/> {/* <-- Ubah dari <News/> ke <HomeNews/> */}
            <Footer/>
        </>
    )
}

export default Home;