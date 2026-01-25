// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import api from "../api";
import { Edit, Trash2, PlusCircle, Users, MapPin } from "lucide-react";

export default function Settings() {
  // ================= Kelompok Umur =================
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [namaUmur, setNamaUmur] = useState("");
  const [umur, setUmur] = useState(""); 
  const [editingUmurId, setEditingUmurId] = useState(null);

  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmur(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitUmur = async (e) => {
      e.preventDefault();
      try {
        // Mengirim payload dengan nama dan umur
        const payload = { 
          nama: namaUmur, 
          umur: parseInt(umur) 
        };

        if (editingUmurId) {
          await api.put(`/kelompok-umur/${editingUmurId}`, payload);
        } else {
          await api.post("/kelompok-umur", payload);
        }
        
        // Reset Form
        setNamaUmur("");
        setUmur("");
        setEditingUmurId(null);
        fetchKelompokUmur();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteUmur = async (id) => {
    try {
      await api.delete(`/kelompok-umur/${id}`);
      fetchKelompokUmur();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditUmur = (item) => {
      setNamaUmur(item.nama);
      setUmur(item.umur); // <-- MASUKKAN DATA UMUR KE FORM
      setEditingUmurId(item.id);
    }

  // ================= Lapangan =================
  const [lapangan, setLapangan] = useState([]);
  const [namaLapangan, setNamaLapangan] = useState("");
  const [lokasiLapangan, setLokasiLapangan] = useState("");
  const [editingLapanganId, setEditingLapanganId] = useState(null);

  const fetchLapangan = async () => {
    try {
      const res = await api.get("/lapangan");
      setLapangan(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitLapangan = async (e) => {
    e.preventDefault();
    try {
      if (editingLapanganId) {
        await api.put(`/lapangan/${editingLapanganId}`, {
          nama: namaLapangan,
          lokasi: lokasiLapangan,
        });
      } else {
        await api.post("/lapangan", {
          nama: namaLapangan,
          lokasi: lokasiLapangan,
        });
      }
      setNamaLapangan("");
      setLokasiLapangan("");
      setEditingLapanganId(null);
      fetchLapangan();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLapangan = async (id) => {
    try {
      await api.delete(`/lapangan/${id}`);
      fetchLapangan();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditLapangan = (item) => {
    setNamaLapangan(item.nama);
    setLokasiLapangan(item.lokasi);
    setEditingLapanganId(item.id);
  };

  // ================= Lifecycle =================
  useEffect(() => {
    fetchKelompokUmur();
    fetchLapangan();
  }, []);

  return (
<div className="font-sans bg-gray-50 min-h-screen">

  <div className="space-y-12 mx-auto">
    
    {/* --- 1. SETTINGS KELOMPOK UMUR --- */}
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
            <Users size={24} className="text-blue-600"/> Settings Kelompok Umur
          </h1>

          {/* Form Kelompok Umur */}
          <form onSubmit={handleSubmitUmur} className="mb-8 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col flex-[2]">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Nama Kelompok
                </label>
                <input
                    type="text"
                    value={namaUmur}
                    onChange={(e) => setNamaUmur(e.target.value)}
                    placeholder="Contoh: KU 10 PA"
                    className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                    required
                />
            </div>

            {/* --- INPUT BARU: ANGKA UMUR --- */}
            <div className="flex flex-col flex-grow">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                    Umur (Tahun)
                </label>
                <input
                    type="number"
                    value={umur}
                    onChange={(e) => setUmur(e.target.value)}
                    placeholder="10"
                    className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                    required
                />
            </div>
            
            <div className="flex gap-3">
                {editingUmurId && (
                    <button
                      type="button"
                      onClick={() => {
                          setEditingUmurId(null);
                          setNamaUmur("");
                          setUmur("");
                      }}
                      className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
                    >
                      Batal
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
                >
                    {editingUmurId ? <Edit size={18}/> : <PlusCircle size={18}/>}
                    {editingUmurId ? "Update" : "Tambah"}
                </button>
            </div>
          </form>

          {/* Table Kelompok Umur */}
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Nama Kelompok</th>
                  <th className="px-5 py-3 text-left">Umur</th> {/* KOLOM BARU */}
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {kelompokUmur.map((item) => (
                  <tr key={item.id} className="hover:bg-yellow-50/50 transition">
                    <td className="px-5 py-3 font-medium text-gray-700">{item.id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{item.nama}</td>
                    <td className="px-5 py-3 text-blue-600 font-bold">{item.umur} Tahun</td> {/* DATA BARU */}
                    <td className="px-5 py-3 flex gap-3 justify-center">
                      <button
                        onClick={() => handleEditUmur(item)}
                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUmur(item.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

    {/* --- 2. SETTINGS LAPANGAN --- */}
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
        <MapPin size={24} className="text-blue-600"/> Settings Lapangan
      </h1>

      {/* Form Lapangan */}
      <form onSubmit={handleSubmitLapangan} className="mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
                Nama Lapangan
            </label>
            <input
                type="text"
                value={namaLapangan}
                onChange={(e) => setNamaLapangan(e.target.value)}
                placeholder="Contoh: Lapangan A"
                className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                required
            />
        </div>
        
        <div className="flex flex-col flex-grow">
            <label className="text-sm font-semibold text-gray-700 mb-1">
                Lokasi Lapangan
            </label>
            <input
                type="text"
                value={lokasiLapangan}
                onChange={(e) => setLokasiLapangan(e.target.value)}
                placeholder="Contoh: Indor"
                className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
                required
            />
        </div>

        {/* Tombol Aksi Form Lapangan */}
        <div className="flex gap-3">
            {editingLapanganId && (
                <button
                type="button"
                onClick={() => {
                    setEditingLapanganId(null);
                    setNamaLapangan("");
                    setLokasiLapangan("");
                }}
                className="bg-gray-500 hover:bg-gray-600 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
                >
                Batal
                </button>
            )}
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
            >
                {editingLapanganId ? <Edit size={18}/> : <PlusCircle size={18}/>}
                {editingLapanganId ? "Update" : "Tambah"}
            </button>
        </div>
      </form>

      {/* Table Lapangan */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-5 py-3 text-left">Nama</th>
              <th className="px-5 py-3 text-left">Lokasi</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {lapangan.map((item) => (
              <tr key={item.id} className="hover:bg-yellow-50/50 transition">
                <td className="px-5 py-3 font-medium text-gray-700">{item.id}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">{item.nama}</td>
                <td className="px-5 py-3 text-gray-600">{item.lokasi}</td>
                <td className="px-5 py-3 flex gap-3 justify-center">
                  <button
                    onClick={() => handleEditLapangan(item)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLapangan(item.id)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {lapangan.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-5 text-gray-500 italic bg-white">
                  Tidak ada data lapangan tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

  );
}
