import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Kepengurusan() {
  const kepengurusan = [
    {
      title: "Dewan Pembina",
      members: [
        { nama: "Walikota Denpasar", foto: "" },
        { nama: "Ketua Umum Koni Kota Denpasar", foto: "" },
      ],
    },
    {
      title: "Dewan Penyantun",
      members: [
        { nama: "Dr. I Wayan Sudana, M.Kes", foto: "" },
        { nama: "dr. Gede Harsa Wardana, MM, MARS", foto: "" },
        { nama: "Prof. I Dewa Gede Ary Subagia, S.T., M.T., Ph.D", foto: "" },
        
      ],
    },
    {
      title: "Bidang Pembinaan dan Prestasi",
      members: [
        { nama: "Ida Bagus Wayan Mega Antara, S.T", foto: "" },
        { nama: "I Made Agus Armana, S.Kom", foto: "" },
        { nama: "I Wayan Eka Sanjaya, S.E", foto: "" },
      ],
    },
    {
      title: "Bidang Pertandingan dan Perwakilan",
      members: [
        { nama: "I Gst Agung Kurniawan, S.Pt", foto: "" },
        { nama: "Joko Prasetyo", foto: "" },
        { nama: "Wayan Widya ", foto: "" },
      ],
    },
    {
      title: "Bidang Kepelatihan",
      members: [
        { nama: "Ir. Ketut Dirga, S.T., M.Si", foto: "" },
        { nama: "Hamzah", foto: "" },
        { nama: "Nyoman Partadi, S.Pi", foto: "" },
      ],
    },
    {
      title: "Bidang Penelitian dan Pengembangan",
      members: [
        { nama: "Prof. Dr. I Nyoman Gede Arya Astawa, S.T., M.Kom", foto: "" },
        { nama: "Dr. I Gede Ary Wirajaya, S.E., M.Si., Ak ", foto: "" },
        { nama: "Dr. dr. I Ketut Mariadi, Sp.PD, K-GEH", foto: "" },
      ],
    },
    {
      title: "Bidang Organisasi",
      members: [
        { nama: "Gede Sukadarmika, S.T., M.Sc", foto: "" },
        { nama: "Ir. Ida Bagus Gede Indramanik S.T., M.T", foto: "" },
        { nama: "I Made Dwi Budiana Penindra, S.T., M.T", foto: "" },
      ],
    },
    {
      title: "Bidang Humas dan Kerjasama",
      members: [
        { nama: "I Gusti Agung Ketut Chatur Adhi Wirya Aryadi, S.T., M.T", foto: "" },
        { nama: "I Gusti Agung Kade Suriadi, S.T., M.T", foto: "" },
        { nama: "Ketut Bhaswara Kader, S.T", foto: "" },
      ],
    },
    {
      title: "Bidang Dana dan Usaha",
      members: [
        { nama: "Haji Eddy Soetjahyo", foto: "" },
        { nama: "Benny Heryanto", foto: "" },
        { nama: "Ir. Ketut Medy Suharta", foto: "" },
      ],
    },
  ];

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[370px] mt-18">
        <img
          src="/hero.jpg"
          alt="Kepengurusan Pelti Denpasar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Kepengurusan
          </h2>
          <p className="max-w-2xl text-sm md:text-base opacity-90">
            Kepengurusan ini mencakup seluruh anggota pengurus PELTI Kota Denpasar,
            termasuk pengurus inti dan staf pendukung.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 space-y-16">

          {kepengurusan.map((bidang, i) => (
            <div key={i} className="space-y-8">

              {/* JUDUL BIDANG */}
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 text-center">
                {bidang.title}
              </h3>

              {/* CARD */}
              <div className="flex flex-wrap justify-center gap-6">
                {bidang.members.map((p, idx) => (
                  <div
                    key={idx}
                    className="w-[150px] sm:w-[160px] md:w-[180px]"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">

                      {/* FOTO */}
                      <div className="h-[180px] bg-gradient-to-b from-yellow-400 to-yellow-50 overflow-hidden">
                        {p.foto && (
                          <img
                            src={p.foto}
                            alt={p.nama}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* TEXT */}
                      <div className="p-4 text-center">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {p.nama}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Anggota
                        </p>
                      </div>

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
