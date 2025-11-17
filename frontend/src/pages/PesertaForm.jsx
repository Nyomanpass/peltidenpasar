import React, { useState, useEffect } from "react";
import api from "../api";


function PesertaForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nomorWhatsapp: "",
    tanggalLahir: "",
    kelompokUmurId: "",
    tournamentId: "",
    fotoKartu: null,
  });

  const [kelompokList, setKelompokList] = useState([]);
  const [tournamentList, setTournamentList] = useState([]);

  // Ambil daftar kelompok umur dari API
  useEffect(() => {
    fetchKelompok();
    fetchTournament()
  }, []);

    const fetchKelompok = async () => {
      try {
        const res = await api.get("/kelompok-umur");
        setKelompokList(res.data);
      } catch (err) {
        console.error("Gagal fetch kelompok umur:", err);
      }
    };

    const fetchTournament = async () => {
      try{
        const res = await api.get('/tournaments');
        const activeTournaments = res.data.filter(
          (t) => t.status = "aktif"
        )
        setTournamentList(activeTournaments);

      }catch(err){
        console.error("Fetch tourmanet ada masalah:", err);
      }
    }
    

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Kirim FormData agar bisa upload file
      const data = new FormData();
      data.append("namaLengkap", formData.namaLengkap);
      data.append("nomorWhatsapp", formData.nomorWhatsapp);
      data.append("tanggalLahir", formData.tanggalLahir);
      data.append("kelompokUmurId", formData.kelompokUmurId);
      data.append("tournamentId", formData.tournamentId);
      if (formData.fotoKartu) data.append("fotoKartu", formData.fotoKartu);

      await api.post("/peserta", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Peserta berhasil ditambahkan ✅");
      if (onSuccess) onSuccess();

      // Reset form
      setFormData({
        namaLengkap: "",
        nomorWhatsapp: "",
        tanggalLahir: "",
        kelompokUmurId: "",
        tournamentId: "",
        fotoKartu: null,
      });
    } catch (err) {
      console.error("Gagal tambah peserta:", err);
      alert("Terjadi kesalahan saat menambahkan peserta ❌");
    }
  };

  return (
  <div className="flex items-stretch justify-center bg-gray-50 font-sans min-h-screen">
 
  <div className="bg-white shadow-2xl overflow-hidden w-full h-full min-h-screen">
    <div className="lg:grid lg:grid-cols-2 h-full min-h-screen">
      
    <div className="flex relative bg-secondary p-8 flex-col justify-center text-white h-[70vh] md:h-full md:min-h-screen overflow-hidden">
 
  <div className="absolute top-0 -left-1/3 w-72 h-72 md:w-96 md:h-96 bg-primary rounded-full transform -translate-y-1/2"></div>
  <div className="absolute -bottom-90 -right-1/3 md:w-96 md:h-96 w-72 h-72 bg-primary rounded-full transform -translate-y-1/2"></div>


  <div className="flex flex-col items-center mb-6 relative z-10">
    <img
      src="/logo.png"
      alt="Logo"
      className="w-20 h-20 mb-2 drop-shadow-md"
    />
    <h1 className="text-xl font-bold text-white">PELTI DENPASAR</h1>
    <p className="text-sm text-gray-white -mt-1">Persatuan Lawn Tenis Indonesia</p>
  </div>

  {/* === Konten Teks === */}
  <div className="max-w-md mx-auto text-center md:text-left relative z-10">
    <h1 className="text-3xl font-extrabold leading-tight mb-4 text-white">
      Ayo Gabung, Jadi Juara Baru!
    </h1>
    <p className="text-white text-md mb-6">Daftar sekarang! Raih gelar juara Turnamen Tenis PELTI Denpasar di kategori umur Anda.</p>
    <div className="space-y-3 text-white">
      {[
        "Lengkapi data diri Anda.",
        "Pilih Kelompok Umur yang tepat.",
        "Upload Foto Kartu Keluarga/KTP.",
      ].map((text, i) => (
        <p
          key={i}
          className="flex items-center justify-center md:justify-start text-md"
        >
          <span className="w-6 h-6 mr-2 inline-flex items-center justify-center bg-white/50 rounded-full text-xs font-bold text-slate-900 shadow">
            {i + 1}
          </span>
          {text}
        </p>
      ))}
    </div>
  </div>
</div>


      {/* Kolom Kanan */}
      <div className="p-8 md:p-12 lg:p-16 flex md:mt-0 mt-18 md:items-center md:justify-center h-full min-h-screen bg-white">
        
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">

          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            Formulir Pendaftaran
          </h2>
          <p className="text-gray-500 mb-8">
            Isi semua bidang untuk melanjutkan pendaftaran peserta.
          </p>

  <div>
                <label htmlFor="tournamentId" className="mb-2 block text-sm font-medium text-gray-700">
                  Pilih Turnamen
                </label>
                <select
                  id="tournamentId"
                  name="tournamentId"
                  value={formData.tournamentId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Turnamen Aktif --</option>

                  {tournamentList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
          {/* Input Nama */}
          <div>
            <label htmlFor="namaLengkap" className="mb-2 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="namaLengkap"
              name="namaLengkap"
              value={formData.namaLengkap}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150"
              placeholder="Masukkan nama lengkap Anda"
              required
            />
          </div>

          {/* Input Nomor WhatsApp */}
          <div>
            <label htmlFor="nomorWhatsapp" className="mb-2 block text-sm font-medium text-gray-700">
              Nomor Whatsapp
            </label>
            <input
              type="text"
              id="nomorWhatsapp"
              name="nomorWhatsapp"
              value={formData.nomorWhatsapp}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150"
              placeholder="0812xxxxxxx"
              required
            />
          </div>

          {/* Input Tanggal Lahir */}
          <div>
            <label htmlFor="tanggalLahir" className="mb-2 block text-sm font-medium text-gray-700">
              Tanggal Lahir
            </label>
            <input
              type="date"
              id="tanggalLahir"
              name="tanggalLahir"
              value={formData.tanggalLahir}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150"
              required
            />
          </div>

          {/* Dropdown Kelompok Umur */}
          <div>
            <label htmlFor="kelompokUmurId" className="mb-2 block text-sm font-medium text-gray-700">
              Kelompok Umur
            </label>
            <select
              id="kelompokUmurId"
              name="kelompokUmurId"
              value={formData.kelompokUmurId}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-150 bg-white cursor-pointer"
              required
            >
              <option value="">-- Pilih Kelompok Umur --</option>
              {kelompokList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Foto */}
          <div>
            <label htmlFor="fotoKartu" className="mb-2 block text-sm font-medium text-gray-700">
              Upload Foto KK / KTP (Bukti Usia)
            </label>
            <input
              type="file"
              id="fotoKartu"
              name="fotoKartu"
              accept="image/*"
              onChange={handleChange}
              className="w-full text-gray-700 
                file:mr-4 file:py-2 file:px-4 
                file:rounded-lg file:border-0 
                file:text-sm file:font-semibold 
                file:bg-primary file:text-white
                hover:file:bg-primary transition duration-150"
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-xl 
                      hover:bg-primary transform hover:scale-[1.01] 
                      transition duration-300 shadow-md"
          >
            Daftar Sekarang
          </button>
        </form>
      </div>
    </div>
  </div>
</div>


  );
}

export default PesertaForm;
