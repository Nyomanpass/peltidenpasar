import React from "react";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const ContactPage = () => {
  const contactDetails = [
    {
      icon: MapPin,
      title: "Alamat Sekretariat",
      detail: "Jl. Gunung Agung No. 12, Denpasar, Bali",
    },
    {
      icon: Phone,
      title: "Nomor Telepon Resmi",
      detail: "(0361) 777-888 (Kantor)",
    },
    {
      icon: Mail,
      title: "Email Organisasi",
      detail: "sekretariat@peltidenpasar.org",
    },
  ];

  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF (Selaras dengan Halaman Publik Lainnya) */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Kontak PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Hubungi Kami
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-lg mt-1.5 opacity-90 hidden sm:block">
            Kami siap menjawab pertanyaan Anda mengenai pembinaan atlet, keanggotaan, jadwal turnamen, atau peluang kemitraan.
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        {/* MAIN CONTENT */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* KIRI – INFO KONTAK */}
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Informasi Kontak
                </h2>

                {/* DETAIL KONTAK */}
                <div className="space-y-4">
                  {contactDetails.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
                      >
                        <div className="p-3 rounded-xl bg-yellow-50 text-yellow-700 shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-bold text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* JAM OPERASIONAL */}
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    Jam Operasional
                  </h3>

                  <div className="text-xs text-gray-700 space-y-2.5">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="font-semibold text-gray-800">Senin - Jumat</span>
                      <span className="text-gray-600">09.00 - 17.00 WITA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">Sabtu</span>
                      <span className="text-gray-600">09.00 - 13.00 WITA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KANAN – FORM */}
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
                  Kirim Pesan Langsung
                </h2>

                <form className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Aktif"
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Subjek Pesan"
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    required
                  />

                  <textarea
                    placeholder="Tuliskan pesan Anda..."
                    rows="5"
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none"
                    required
                  ></textarea>

                  <button
                    type="submit"
                    className="w-full text-sm font-bold bg-yellow-500 text-black py-3.5 rounded-xl hover:bg-yellow-600 transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Pesan Sekarang
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* MAP */}
        <section className="pb-16 pt-4 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 text-center mb-6 tracking-tight">
              Lokasi Kesekretariatan
            </h2>

            <div className="rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white p-2">
              <div className="relative w-full aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden">
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

      <Footer />
    </>
  );
};

export default ContactPage;