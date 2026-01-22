import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Visimisi() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[300px] mt-30">
        <img
          src="/hero.jpg"
          alt="Visi dan Misi Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Visi & Misi
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
         PELTI Denpasar
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="px-4 sm:px-6 lg:px-40 py-16 bg-gray-50">
        <div className="w-full mx-auto space-y-12">

          {/* VISI */}
          <div className="bg-white w-full rounded-2xl shadow-sm p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Visi
            </h3>
            <div className="w-16 h-1 bg-gray-800 mb-6"></div>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
              Menjadi organisasi PELTI yang terkemuka di Indonesia, khususnya
              dalam pengembangan dan pembinaan tenis lapangan di Kota Denpasar.
            </p>
          </div>

          {/* MISI */}
          <div className="bg-white w-full rounded-2xl shadow-sm p-8 md:p-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Misi
            </h3>
            <div className="w-16 h-1 bg-gray-800 mb-6"></div>

            <ol className="space-y-4 list-decimal list-inside text-gray-700 leading-relaxed">
              <li>
                Membentuk manusia yang sehat dalam rangka mendukung pembangunan
                bangsa dan Negara Indonesia serta memupuk persahabatan antar
                PELTI melalui olahraga tenis lapangan.
              </li>
              <li>
                Membentuk anggota agar memiliki rasa kepemilikan dan kecintaan
                terhadap PELTI Pengurus Kota Denpasar demi kemajuan bersama.
              </li>
            </ol>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
