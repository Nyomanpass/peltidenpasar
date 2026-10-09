import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Kepengurusan() {
  // Fungsi mengambil 2 huruf inisial nama secara rapi (mengabaikan gelar)
  const getInitial = (nama) => {
    if (!nama) return "";
    const cleanName = nama
      .replace(
        /(Dr\.|dr\.|Prof\.|Ir\.|Haji|S\.T\.|M\.T\.|M\.Kom|S\.E\.|M\.Si|Ph\.D|S\.Pt|S\.Kom|S\.Pi|Sp\.PD|M\.Kes|MARS|MM|Ak)/g,
        ""
      )
      .trim();
    const words = cleanName.split(" ").filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const kepengurusan = [
    {
      title: "Dewan Pembina",
      members: [
        { nama: "Walikota Denpasar", jabatan: "Pembina" },
        { nama: "Ketua Umum KONI Kota Denpasar", jabatan: "Pembina" },
      ],
    },
    {
      title: "Dewan Penyantun",
      members: [
        { nama: "Dr. I Wayan Sudana, M.Kes", jabatan: "Penyantun" },
        { nama: "dr. Gede Harsa Wardana, MM, MARS", jabatan: "Penyantun" },
        { nama: "Prof. I Dewa Gede Ary Subagia, S.T., M.T., Ph.D", jabatan: "Penyantun" },
      ],
    },
    {
      title: "Bidang Pembinaan dan Prestasi",
      members: [
        { nama: "Ida Bagus Wayan Mega Antara, S.T", jabatan: "Koordinator" },
        { nama: "I Made Agus Armana, S.Kom", jabatan: "Anggota" },
        { nama: "I Wayan Eka Sanjaya, S.E", jabatan: "Anggota" },
      ],
    },
    {
      title: "Bidang Pertandingan dan Perwakilan",
      members: [
        { nama: "I Gst Agung Kurniawan, S.Pt", jabatan: "Koordinator" },
        { nama: "Joko Prasetyo", jabatan: "Anggota" },
        { nama: "Wayan Widya", jabatan: "Anggota" },
      ],
    },
    {
      title: "Bidang Kepelatihan",
      members: [
        { nama: "Ir. Ketut Dirga, S.T., M.Si", jabatan: "Koordinator" },
        { nama: "Hamzah", jabatan: "Anggota" },
        { nama: "Nyoman Partadi, S.Pi", jabatan: "Anggota" },
      ],
    },
    {
      title: "Bidang Penelitian dan Pengembangan",
      members: [
        { nama: "Prof. Dr. I Nyoman Gede Arya Astawa, S.T., M.Kom", jabatan: "Koordinator" },
        { nama: "Dr. I Gede Ary Wirajaya, S.E., M.Si., Ak", jabatan: "Anggota" },
        { nama: "Dr. dr. I Ketut Mariadi, Sp.PD, K-GEH", jabatan: "Anggota" },
      ],
    },
    {
      title: "Bidang Organisasi",
      members: [
        { nama: "Gede Sukadarmika, S.T., M.Sc", jabatan: "Koordinator" },
        { nama: "Ir. Ida Bagus Gede Indramanik S.T., M.T", jabatan: "Anggota" },
        { nama: "I Made Dwi Budiana Penindra, S.T., M.T", jabatan: "Anggota" },
      ],
    },
    {
      title: "Bidang Humas dan Kerjasama",
      members: [
        { nama: "I Gusti Agung Ketut Chatur Adhi Wirya Aryadi, S.T., M.T", jabatan: "Koordinator" },
        { nama: "I Gusti Agung Kade Suriadi, S.T., M.T", jabatan: "Anggota" },
        { nama: "Ketut Bhaswara Kader, S.T", jabatan: "Anggota" },
      ],
    },
    {
      title: "Bidang Dana dan Usaha",
      members: [
        { nama: "Haji Eddy Soetjahyo", jabatan: "Koordinator" },
        { nama: "Benny Heryanto", jabatan: "Anggota" },
        { nama: "Ir. Ketut Medy Suharta", jabatan: "Anggota" },
      ],
    },
  ];

  return (
    <>
      <Navbar />

      {/* HERO BANNER RESPONSIF (Diselaraskan persis dengan Visi Misi & Struktur Organisasi) */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/4] min-h-[220px] max-h-[450px] mt-[65px] sm:mt-[75px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Kepengurusan PELTI Denpasar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 drop-shadow">
            PELTI Denpasar
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            Kepengurusan
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-md mt-1.5 opacity-90 hidden sm:block">
            Jajaran Pengurus dan Bidang-Bidang PELTI Kota Denpasar
          </p>
          <div className="w-12 h-1 bg-yellow-500 rounded-full mt-2 sm:mt-3"></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="bg-gray-50 py-12 sm:py-16 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {kepengurusan.map((bidang, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6"
            >
              {/* JUDUL BIDANG */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-2.5 h-7 bg-yellow-500 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {bidang.title}
                </h2>
              </div>

              {/* CARD GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {bidang.members.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50/70 hover:bg-white rounded-2xl p-5 border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all duration-200 flex items-center gap-4"
                  >
                    {/* AVATAR LINGKARAN */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-yellow-300 text-black font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm border border-white">
                      {getInitial(p.nama)}
                    </div>

                    {/* TEKS NAMA & JABATAN */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-sm font-bold text-gray-900 leading-snug"
                        title={p.nama}
                      >
                        {p.nama}
                      </h3>
                      <span className="inline-block mt-1.5 text-[11px] font-semibold text-yellow-800 bg-yellow-100/80 px-2.5 py-0.5 rounded-full">
                        {p.jabatan || "Anggota"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}