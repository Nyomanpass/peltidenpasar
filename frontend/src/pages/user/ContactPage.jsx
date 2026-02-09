import React from 'react';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react'; 
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';


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
    {/* HERO */}
     

       <div className="relative w-full h-[400px] mt-18">
        <img
          src="/hero.jpg"
          alt="Kepengurusan Pelti Denpasar"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50"></div>

        <div
          className="
            absolute inset-0
            flex flex-col items-center justify-center
            px-4 sm:px-6 md:px-10 lg:px-20
            text-center text-white
          "
        >
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 leading-tight">
              Hubungi Kami
          </h2>

          <p
            className="
              max-w-md sm:max-w-xl md:max-w-2xl
              text-xs sm:text-sm md:text-base
              opacity-90 leading-relaxed
            "
          >
             Kami siap menjawab pertanyaan Anda mengenai pembinaan atlet, keanggotaan, jadwal turnamen, atau peluang kemitraan.

          </p>
        </div>
      </div>

  <div className="min-h-screen bg-gray-50">

  {/* MAIN CONTENT */}
  <section className="py-12 sm:py-16">
    <div className="mx-auto px-4 md:px-10 lg:px-20">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* KIRI – INFO KONTAK */}
        <div className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Informasi Kontak
          </h2>

          {/* DETAIL KONTAK */}
          <div className="space-y-4">
            {contactDetails.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start p-4 bg-white rounded-xl shadow-md"
                >
                  <IconComponent className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* JAM OPERASIONAL */}
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-primary mr-2" />
              Jam Operasional
            </h3>

            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Senin - Jumat</span>
                <span>09.00 - 17.00 WITA</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Sabtu</span>
                <span>09.00 - 13.00 WITA</span>
              </div>
            </div>
          </div>
        </div>

        {/* KANAN – FORM */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Kirim Pesan Langsung
          </h2>

          <form className="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
              <input
                type="email"
                placeholder="Email Aktif"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Subjek Pesan (Contoh: Kemitraan Sponsorship)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
            />

            <textarea
              placeholder="Pesan Anda"
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
            ></textarea>

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg
                         hover:bg-yellow-500 transition shadow-md
                         flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Kirim Pesan Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>

  {/* MAP */}
  <section className="pb-16 pt-8 bg-gray-50">
    <div className="mx-auto px-4 md:px-10 lg:px-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
        Lokasi Kesekretariatan
      </h2>

      <div className="rounded-xl shadow-xl overflow-hidden">
        <div className="relative w-full aspect-video">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.413230801631!2d115.1920860746113!3d-8.652190341394816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd240aa3d7071f3%3A0xc8dc2db3234d6bb5!2sStadion%20Kompyang%20Sujana!5e0!3m2!1sid!2sid!4v1769075076344!5m2!1sid!2sid"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Stadion Kompyang Sujana"
          />
        </div>
      </div>
    </div>
  </section>

</div>

    <Footer/>
    </>
  );
};

export default ContactPage;