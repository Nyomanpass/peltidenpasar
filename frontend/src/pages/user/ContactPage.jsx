import React from 'react';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react'; 
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactHero from '../../components/ContactHero';

const ContactPage = () => {
  
    // Ganti dengan data aktual PelTI Denpasar
    const contactDetails = [
        { icon: MapPin, title: "Alamat Sekretariat", detail: "Jl. Gunung Agung No. 12, Denpasar, Bali", color: "text-indigo-600" },
        { icon: Phone, title: "Nomor Telepon Resmi", detail: "(0361) 777-888 (Kantor)", color: "text-indigo-600" },
        { icon: Mail, title: "Email Organisasi", detail: "sekretariat@peltidenpasar.org", color: "text-indigo-600" },
    ];

  return (
    <>
    <Navbar/>
    <ContactHero/>
    <div className="min-h-screen bg-gray-50">

      {/* 2. MAIN CONTENT (FORM + INFO + JAM OPERASIONAL) */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-20">
          
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* KOLOM KIRI: INFO DETAIL & JAM KERJA */}
            <div className="lg:col-span-1 space-y-8">
              
              <h2 className="text-3xl font-bold text-secondary border-b pb-3 mb-4">Informasi Kontak</h2>

              {/* Detail Kontak */}
              <div className="space-y-6">
                {contactDetails.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={index} className="flex items-start p-4 bg-white rounded-xl shadow-md border-l-4 border-yellow-500">
                            <IconComponent className={`w-7 h-7 text-secondary flex-shrink-0 mt-1`} />
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                                <p className="text-gray-600">{item.detail}</p>
                            </div>
                        </div>
                    );
                })}
              </div>

              {/* Jam Operasional */}
              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Clock className="w-6 h-6 text-primary mr-2" /> Jam Operasional
                </h3>
                <table className="min-w-full text-left text-gray-700">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2 font-semibold">Senin - Jumat:</td>
                            <td className="py-2">09.00 - 17.00 WITA</td>
                        </tr>
                        <tr>
                            <td className="py-2 font-semibold">Sabtu:</td>
                            <td className="py-2">09.00 - 13.00 WITA</td>
                        </tr>
                    </tbody>
                </table>
              </div>

            </div>

            {/* KOLOM KANAN: CONTACT FORM */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-secondary border-b pb-3 mb-4">Kirim Pesan Langsung</h2>
              <form className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" placeholder="Nama Lengkap" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" required />
                  <input type="email" placeholder="Email Aktif" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" required />
                </div>
                
                <input type="text" placeholder="Subjek Pesan (Contoh: Kemitraan Sponsorship)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" required />
                
                <textarea placeholder="Pesan Anda" rows="6" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" required></textarea>
                
                <button 
                  type="submit" 
                  className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition duration-300 shadow-md flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2"/> Kirim Pesan Sekarang
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* 3. MAP SECTION */}
      <section className="pb-16 pt-8 bg-gray-50">
        <div className="container mx-auto px-4 md:px-20">
          <h2 className="text-3xl font-bold text-secondary text-center mb-6">Lokasi Sekretariat PelTI Denpasar</h2>
          
          {/* Placeholder Peta Google Maps */}
          <div className="w-full h-96 bg-gray-200 rounded-xl shadow-xl flex items-center justify-center overflow-hidden border border-gray-300">
            [Embed Google Maps Location Here]
          </div>
          
          
        </div>
      </section>

    </div>
    <Footer/>
    </>
  );
};

export default ContactPage;