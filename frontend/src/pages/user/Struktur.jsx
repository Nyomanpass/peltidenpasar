import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function StrukturOrganisasi() {
  const ketua = {
    name: "Made Widiatmika, SE, M.Si",
    role: "Ketua Umum",
    initials: "MW",
    photo: "", // untuk mengisi foto jika URL fot ada
  };

  const wakil = [
    {
      name: "Made Sumarsana",
      role: "Wakil Ketua I",
      initials: "MS",
      photo: "",
    },
    {
      name: "I Gusti Ngurah Ketut Sukadarma, S.Kp, M.Kes",
      role: "Wakil Ketua II",
      initials: "IK",
      photo: "",
    },
  ];

  const pengurusLain = [
    {
      name: "I Rudi Thomas Worek, SE",
      role: "Sekretaris Umum",
      initials: "RT",
      photo: "",
    },
    {
      name: "Wahyudianto, SE",
      role: "Wakil Sekretaris Umum I",
      initials: "WY",
      photo: "",
    },
    {
      name: "I Made Widiartha, SE",
      role: "Bendahara",
      initials: "MW",
      photo: "",
    },
    {
      name: "I Gusti Nyoman Bagus Wiraatmaja, SE",
      role: "Wakil Bendahara",
      initials: "GB",
      photo: "",
    },
  ];

  const MemberCard = ({ name, role, initials, photo, isLeader = false }) => (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 flex flex-col items-center text-center transition-all duration-200 ${
        isLeader ? "w-full max-w-sm border-yellow-300 ring-2 ring-yellow-400/20" : "w-full"
      }`}
    >
      <div className="relative mb-4">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-400 shadow-sm"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-300 text-black font-extrabold text-xl flex items-center justify-center shadow-inner border-2 border-white">
            {initials}
          </div>
        )}
      </div>

      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug mb-1">
        {name}
      </h3>
      <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
        {role}
      </span>
    </div>
  );

  return (
    <>
      <Navbar />

            {/* HERO BANNER RESPONSIF */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Struktur Organisasi PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Struktur Organisasi
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-md mt-1.5 opacity-90 hidden sm:block">
            Pengurus Inti Persatuan Lawn Tenis Indonesia Kota Denpasar
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>
      {/* MAIN CONTENT */}
      <section className="bg-gray-50 py-12 sm:py-16 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          
          {/* LEVEL 1: KETUA UMUM */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Pimpinan Utama
            </span>
            <MemberCard {...ketua} isLeader={true} />
          </div>

          {/* LEVEL 2: WAKIL KETUA */}
          <div>
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Wakil Ketua
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {wakil.map((item, idx) => (
                <MemberCard key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* LEVEL 3: SEKRETARIS & BENDAHARA */}
          <div>
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Sekretariat & Kebendaharaan
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pengurusLain.map((item, idx) => (
                <MemberCard key={idx} {...item} />
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}