import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function StrukturOrganisasi() {
  const ketua = {
    name: "Made Widiatmika, SE, M.Si",
    role: "Ketua Umum",
    initials: "MW",
    photo: "",
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

  const MemberCard = ({ name, role, initials, photo, isLeader = false }) => {
    if (isLeader) {
      return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-5 sm:p-6 flex flex-col justify-between items-center text-center transition-all duration-200">
          <div className="flex flex-col items-center w-full">
            {/* AVATAR / INITIALS */}
            <div className="relative mb-3 sm:mb-4">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-300 text-black font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-inner border-2 border-white">
                  {initials}
                </div>
              )}
            </div>

            {/* NAMA PENGURUS */}
            <div className="min-h-0 sm:min-h-[3.2rem] flex items-center justify-center w-full mb-2.5 sm:mb-3">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">
                {name}
              </h3>
            </div>
          </div>

          {/* BADGE JABATAN */}
          <div className="mt-auto">
            <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
              {role}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-3.5 sm:p-6 flex flex-row sm:flex-col items-center sm:items-center sm:justify-between text-left sm:text-center transition-all duration-200 gap-3.5 sm:gap-0">
        {/* AVATAR */}
        <div className="relative shrink-0 sm:mb-4">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-300 text-black font-extrabold text-base sm:text-xl flex items-center justify-center shadow-inner border-2 border-white">
              {initials}
            </div>
          )}
        </div>

        {/* NAMA & ROLE MOBILE */}
        <div className="min-w-0 flex-1 sm:w-full flex flex-col sm:items-center">
          <span className="sm:hidden inline-block self-start text-[10px] font-bold uppercase tracking-wider text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200 mb-1">
            {role}
          </span>
          <div className="sm:min-h-[3.2rem] flex items-center sm:justify-center w-full sm:mb-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg leading-snug">
              {name}
            </h3>
          </div>
        </div>

        {/* BADGE JABATAN (DESKTOP: RATA DI BAWAH) */}
        <div className="hidden sm:block mt-auto">
          <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
            {role}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[250px] sm:min-h-[280px] max-h-[450px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Struktur Organisasi PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-12 sm:pt-14 px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Struktur Organisasi
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-xs sm:max-w-md mt-1.5 opacity-90 block">
            Pengurus Inti Persatuan Lawn Tenis Indonesia Kota Denpasar
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="bg-gray-50 py-10 sm:py-16 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          {/* LEVEL 1: KETUA UMUM */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Pimpinan Utama
            </span>
            <MemberCard {...ketua} isLeader={true} />
          </div>

          {/* LEVEL 2: WAKIL KETUA */}
          <div>
            <div className="text-center mb-3 sm:mb-4">
              <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                Wakil Ketua
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto">
              {wakil.map((item, idx) => (
                <MemberCard key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* LEVEL 3: SEKRETARIS & BENDAHARA */}
          <div>
            <div className="text-center mb-3 sm:mb-4">
              <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                Sekretariat & Kebendaharaan
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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