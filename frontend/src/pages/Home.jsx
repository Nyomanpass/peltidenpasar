import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureSection from "../components/FeatureSection";
import Footer from "../components/Footer";
import AboutSection from "../components/AboutSection";
import JoinTournamentCTA from "../components/JoinTournamentCTA";
import ContactSection from "../components/ContactSection";
import TournamentSection from "../components/TournamentSection";

function Home(){
    return(
        <>
            <Navbar/>
            <Hero/>
            <FeatureSection/>
            <AboutSection/>
            <JoinTournamentCTA/>
            <TournamentSection/>
            <ContactSection/>
            <Footer/>
        </>
    )
}

export default Home;