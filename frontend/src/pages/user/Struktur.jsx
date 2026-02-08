import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Struktur() {
  const kepengurusan = [
    // Baris 1
    { jabatan: "Ketua Umum", nama: "Made Widiatmika, SE, M.Si", foto: "" },
    { jabatan: "Wakil Ketua I", nama: "Made Sumarsana", foto: "" },
    { jabatan: "Wakil Ketua II", nama: "I Gusti Ngurah Ketut Sukadarma, S.Kp, M.Kes", foto: "" },

    // Baris 2
    { jabatan: "Sekretaris Umum", nama: "I Rudi Thomas Worek, SE", foto: "" },
    { jabatan: "Wakil Sekretaris Umum I", nama: "Wahyudianto, SE", foto: "" },
    { jabatan: "Bendahara", nama: "I Made Widiartha, SE", foto: "" },
    { jabatan: "Wakil Bendahara", nama: "I Gusti Nyoman Bagus Wiraatmaja, SE", foto:"" },
  ];

  const baris1 = kepengurusan.slice(0, 3);
  const baris2 = kepengurusan.slice(3);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[370px] mt-18">
        <img
          src="/hero.jpg"
          alt="Struktur Organisasi Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Struktur Organisasi
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
            Struktur organisasi ini menunjukkan jajaran pengurus inti yang memimpin dan mengelola kegiatan PELTI Kota Denpasar.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="w-full bg-gray-50 py-16">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 max-w-6xl mx-auto space-y-12">

          {/* Baris 1 */}
          <div className="flex flex-wrap justify-center gap-6">
            {baris1.map((p, idx) => (
              <div key={idx} className="w-[150px] sm:w-[160px] md:w-[180px]">
                {/* Card asli tetap */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="h-[180px] w-full bg-gradient-to-b from-yellow-400 to-yellow-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.foto}
                      alt={p.nama}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `<div class="text-5xl text-yellow-600 font-bold">${p.nama.split(" ").map(n => n[0]).join("")}</div>`;
                      }}
                    />
                  </div>
                  <div className="p-4 text-center bg-white">
                    <h4 className="text-sm font-semibold text-gray-800">{p.nama}</h4>
                    <p className="text-xs text-gray-600 mt-1">{p.jabatan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Baris 2 */}
          <div className="flex flex-wrap justify-center gap-6">
            {baris2.map((p, idx) => (
              <div key={idx} className="w-[150px] sm:w-[160px] md:w-[180px]">
                {/* Card asli tetap */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="h-[180px] w-full bg-gradient-to-b from-yellow-400 to-yellow-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={p.foto}
                      alt={p.nama}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `<div class="text-5xl text-yellow-600 font-bold">${p.nama.split(" ").map(n => n[0]).join("")}</div>`;
                      }}
                     
                    />
                  </div>
                  <div className="p-2 text-center bg-white">
                    <h4 className="text-sm font-bold text-gray-800">{p.nama}</h4>
                    <p className="text-xs text-gray-600 mt-1">{p.jabatan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
