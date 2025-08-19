function Sections() {
  return (
    <div className="space-y-20">
      {/* Struktur Organisasi */}
      <section className="py-16 bg-white px-4 md:px-20">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            PELTI DENPASAR
          </h2>
          <h3 className="text-3xl font-bold mb-10">Struktur Organisasi</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-b from-yellow-300 to-white p-6 rounded-lg shadow">
              <h4 className="font-semibold">Ketua</h4>
              <p className="text-sm text-gray-600">Nama Ketua</p>
            </div>
            <div className="bg-gradient-to-b from-yellow-300 to-white p-6 rounded-lg shadow">
              <h4 className="font-semibold">Sekretaris</h4>
              <p className="text-sm text-gray-600">Nama Sekretaris</p>
            </div>
            <div className="bg-gradient-to-b from-yellow-300 to-white p-6 rounded-lg shadow">
              <h4 className="font-semibold">Bendahara</h4>
              <p className="text-sm text-gray-600">Nama Bendahara</p>
            </div>
            <div className="border p-6 rounded-lg shadow">
              <h4 className="font-semibold">Anggota</h4>
              <p className="text-sm text-gray-600">Nama Anggota</p>
            </div>
          </div>

          <a
            href="#struktur"
            className="mt-8 inline-block text-sm font-semibold text-blue-600"
          >
            Lihat Selengkapnya →
          </a>
        </div>
      </section>

      {/* Pengumuman */}
      <section className="py-16 bg-[#ffd51e] relative px-4 md:px-20">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-semibold text-black mb-2">
            PELTI DENPASAR
          </h2>
          <h3 className="text-3xl font-bold mb-10">Pengumuman</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black text-white p-6 rounded-lg shadow">
              <h4 className="font-semibold mb-2">Jadwal Turnamen 01</h4>
              <p className="text-sm mb-4">
                Pengumuman terkait jadwal turnamen 2025.
              </p>
              <a href="#" className="text-yellow-400 text-sm">
                Selengkapnya →
              </a>
            </div>
            <div className="bg-black text-white p-6 rounded-lg shadow">
              <h4 className="font-semibold mb-2">Jadwal Turnamen 02</h4>
              <p className="text-sm mb-4">
                Pengumuman terkait jadwal turnamen 2025.
              </p>
              <a href="#" className="text-yellow-400 text-sm">
                Selengkapnya →
              </a>
            </div>
            <div className="bg-black text-white p-6 rounded-lg shadow">
              <h4 className="font-semibold mb-2">Jadwal Turnamen 03</h4>
              <p className="text-sm mb-4">
                Pengumuman terkait jadwal turnamen 2025.
              </p>
              <a href="#" className="text-yellow-400 text-sm">
                Selengkapnya →
              </a>
            </div>
          </div>

          <a
            href="#pengumuman"
            className="mt-8 inline-block text-sm font-semibold text-black"
          >
            Lihat Selengkapnya →
          </a>
        </div>
      </section>

      {/* Berita Terkini */}
      <section className="py-16 bg-white px-4 md:px-20">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            PELTI DENPASAR
          </h2>
          <h3 className="text-3xl font-bold mb-10">Berita Terkini</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="berita1.jpg" alt="Berita" className="h-48 w-full object-cover" />
              <div className="p-6">
                <h4 className="font-semibold mb-2">Berita 1</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ringkasan berita singkat tentang kegiatan turnamen.
                </p>
                <a href="#" className="text-blue-600 text-sm">
                  Baca Selengkapnya →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="berita2.jpg" alt="Berita" className="h-48 w-full object-cover" />
              <div className="p-6">
                <h4 className="font-semibold mb-2">Berita 2</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ringkasan berita singkat tentang kegiatan turnamen.
                </p>
                <a href="#" className="text-blue-600 text-sm">
                  Baca Selengkapnya →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img src="berita3.jpg" alt="Berita" className="h-48 w-full object-cover" />
              <div className="p-6">
                <h4 className="font-semibold mb-2">Berita 3</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ringkasan berita singkat tentang kegiatan turnamen.
                </p>
                <a href="#" className="text-blue-600 text-sm">
                  Baca Selengkapnya →
                </a>
              </div>
            </div>
          </div>

          <a
            href="#berita"
            className="mt-8 inline-block text-sm font-semibold text-blue-600"
          >
            Lihat Selengkapnya →
          </a>
        </div>
      </section>
    </div>
  );
}

export default Sections;
