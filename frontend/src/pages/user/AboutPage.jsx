import { Trophy, Target, Users, Code, Mail } from 'lucide-react'; // Ikon dari 'lucide-react'

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AboutHero from '../../components/AboutHero';
import TeamSection from '../../components/TeamSection';
import DetailedAboutSection from '../../components/DetailedAboutSection';
import CoreValuesSection from '../../components/CoreValuesSection';
import HistorySection from '../../components/HistorySection';

export default function AboutPage() {
  return (
    <>
    <Navbar/>
    <AboutHero/>
    <DetailedAboutSection/>
    <TeamSection/>
    <CoreValuesSection/>
   <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 md:px-20">
        
        {/* === 4. Fokus Utama: Turnamen Tahunan (Highlight Section) === */}
        <section className="bg-gradient-to-r from-secondary to-[#6A5A48] p-10 rounded-2xl shadow-2xl mb-16">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-2 text-white">
              <Trophy className="w-12 h-12 mb-4 text-yellow-400" />
              <h2 className="text-4xl font-extrabold mb-4">
                Pencarian Bibit Unggul: Turnamen Tahunan
              </h2>
              <p className="text-white text-lg leading-relaxed">
                Turnamen tahunan kami adalah **Gerbang Resmi** untuk menemukan calon bintang Denpasar. Di sini, semangat bertanding bertemu dengan kesempatan pembinaan. Kami mencari atlet dengan potensi tertinggi untuk mewakili Denpasar di kancah Provinsi dan Nasional.
              </p>
              <ul className="mt-4 list-disc pl-5 text-white space-y-1">
                  <li>Tujuan: Seleksi dan promosi atlet.</li>
                  <li>Dampak: Peningkatan standar permainan di seluruh klub Denpasar.</li>
              </ul>
            </div>

            <div className="lg:col-span-1 text-center">
              <a 
                href="/turnamen" // Link ke halaman detail turnamen
                className="inline-block bg-yellow-400 text-white font-bold text-lg py-4 px-10 rounded-full shadow-2xl transition duration-300 transform hover:scale-105"
              >
                Jadwal & Pendaftaran
              </a>
              <p className="mt-3 text-sm text-white">
                Turnamen berikutnya: November 2026
              </p>
            </div>
          </div>
        </section>
        <HistorySection/>

        {/* === 5. Call to Action (Final CTA) === */}
        <section className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Siap Menjadi Bagian dari Sejarah Tenis Denpasar?
          </h2>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Dukung misi kami sebagai mitra, daftarkan klub Anda, atau mulai karir Anda sebagai atlet bersama PelTI Denpasar.
          </p>
          <a 
            href="/kontak" 
            className="bg-secondary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary transition duration-300 inline-flex items-center"
          >
            <Mail className="w-5 h-5 mr-2" /> Hubungi Sekretariat
          </a>
        </section>


      </div>
    </div>
    <Footer/>
    </>
  );
}
