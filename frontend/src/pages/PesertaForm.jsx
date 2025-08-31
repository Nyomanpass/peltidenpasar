import React, { useState, useEffect } from "react";
import api from "../api";

function PesertaForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nomorWhatsapp: "",
    tanggalLahir: "",
    kelompokUmurId: "",
    fotoKartu: null,
  });

  const [kelompokList, setKelompokList] = useState([]);

  // Ambil daftar kelompok umur dari API
  useEffect(() => {
    const fetchKelompok = async () => {
      try {
        const res = await api.get("/kelompok-umur");
        setKelompokList(res.data);
      } catch (err) {
        console.error("Gagal fetch kelompok umur:", err);
      }
    };
    fetchKelompok();
  }, []);

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
        fotoKartu: null,
      });
    } catch (err) {
      console.error("Gagal tambah peserta:", err);
      alert("Terjadi kesalahan saat menambahkan peserta ❌");
    }
  };

  return (
 <form
  onSubmit={handleSubmit}
  className="max-w-lg mx-auto mt-10 bg-white p-6 shadow-lg rounded-3xl space-y-5"
>
  <h2 className="text-2xl font-extrabold text-gray-800 mb-4 text-center">
    📝 Form Pendaftaran Peserta
  </h2>

  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">Nama Lengkap</label>
    <input
      type="text"
      name="namaLengkap"
      value={formData.namaLengkap}
      onChange={handleChange}
      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      placeholder="Masukkan nama lengkap"
      required
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">Nomor Whatsapp</label>
    <input
      type="text"
      name="nomorWhatsapp"
      value={formData.nomorWhatsapp}
      onChange={handleChange}
      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      placeholder="0812xxxxxxx"
      required
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">Tanggal Lahir</label>
    <input
      type="date"
      name="tanggalLahir"
      value={formData.tanggalLahir}
      onChange={handleChange}
      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      required
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">Kelompok Umur</label>
    <select
      name="kelompokUmurId"
      value={formData.kelompokUmurId}
      onChange={handleChange}
      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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

  <div className="flex flex-col">
    <label className="mb-1 font-medium text-gray-700">Upload Foto KK / KTP</label>
    <input
      type="file"
      name="fotoKartu"
      accept="image/*"
      onChange={handleChange}
      className="w-full"
    />
  </div>

  <button
    type="submit"
    className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg transition transform hover:scale-[1.02]"
  >
    Simpan
  </button>
</form>

  );
}

export default PesertaForm;
