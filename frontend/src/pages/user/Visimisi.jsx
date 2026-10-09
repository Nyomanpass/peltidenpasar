import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Visimisi() {
  return (
    <>
      <Navbar />

          {/* HERO BANNER RESPONSIF */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Visi dan Misi Pelti Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Visi & Misi
          </h1>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* CONTENT MAIN SECTION */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20 min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          
          {/* MAIN CONTAINER (Visi & Misi Menyatu) */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden divide-y divide-gray-100">
            
            {/* VISI */}
            <div className="p-8 sm:p-10 md:p-12 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-8 bg-yellow-500 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Visi
                </h2>
              </div>

              <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed font-medium pl-5 border-l-2 border-yellow-100 italic">
                "Menjadi organisasi PELTI yang terkemuka di Indonesia, khususnya dalam pengembangan dan pembinaan tenis lapangan di Kota Denpasar."
              </p>
            </div>

            {/* MISI */}
            <div className="p-8 sm:p-10 md:p-12 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-8 bg-yellow-500 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Misi
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500 text-black font-extrabold flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed pt-0.5">
                    Membentuk manusia yang sehat dalam rangka mendukung pembangunan bangsa dan Negara Indonesia serta memupuk persahabatan antar PELTI melalui olahraga tenis lapangan.
                  </p>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500 text-black font-extrabold flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed pt-0.5">
                    Membentuk anggota agar memiliki rasa kepemilikan dan kecintaan terhadap PELTI Pengurus Kota Denpasar demi kemajuan bersama.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}