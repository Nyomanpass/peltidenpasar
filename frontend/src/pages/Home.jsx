import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import News from "../components/News";
import Footer from "../components/Footer";


function Home(){
    return(
        <>
            <Navbar/>
            <Hero/>
            <div className="px-4 lg:px-25 md:px-25">
            
                <News/>

            </div>
     
            <Footer/>
        </>
    )
}

export default Home;