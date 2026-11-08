import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TournamentComming from "../components/TournamentComming";
import AboutPreview from "../components/AboutPreview";
import HomeNews from "../components/HomeNews";
import CTASection from "../components/CTASection";
import ContactPreview from "../components/ContactPreview";
import Footer from "../components/Footer";

function Home() {
  // Sembunyikan scrollbar hanya saat berada di landing page
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-page-scrollbar");
    return () => root.classList.remove("no-page-scrollbar");
  }, []);

  return (
    <>
      <Navbar variant="overlay" />
      <Hero />
      <TournamentComming />
      <AboutPreview />
      <HomeNews />
      <CTASection />
      <ContactPreview />
      <Footer />
    </>
  );
}

export default Home;
