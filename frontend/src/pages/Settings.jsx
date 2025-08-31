// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import api from "../api";

export default function Settings() {
  // ================= Kelompok Umur =================
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [namaUmur, setNamaUmur] = useState("");
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
      if (editingUmurId) {
        await api.put(`/kelompok-umur/${editingUmurId}`, { nama: namaUmur });
      } else {
        await api.post("/kelompok-umur", { nama: namaUmur });
      }
      setNamaUmur("");
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
    setEditingUmurId(item.id);
  };

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
<div className="p-6 space-y-12">
  {/* Kelompok Umur */}
  <div className="bg-white shadow-md rounded-xl p-6">
    <h1 className="text-xl font-semibold mb-6 border-b pb-2">
      ⚡ Settings Kelompok Umur
    </h1>

    {/* Form */}
    <form onSubmit={handleSubmitUmur} className="mb-6 flex flex-wrap gap-3">
      <input
        type="text"
        value={namaUmur}
        onChange={(e) => setNamaUmur(e.target.value)}
        placeholder="Nama kelompok umur"
        className="border px-3 py-2 rounded-lg w-64 focus:ring-2 focus:ring-blue-400 outline-none"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg shadow"
      >
        {editingUmurId ? "Update" : "Tambah"}
      </button>
      {editingUmurId && (
        <button
          type="button"
          onClick={() => {
            setEditingUmurId(null);
            setNamaUmur("");
          }}
          className="bg-gray-400 hover:bg-gray-500 transition text-white px-4 py-2 rounded-lg shadow"
        >
          Batal
        </button>
      )}
    </form>

    {/* Table */}
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Nama</th>
            <th className="px-4 py-2 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {kelompokUmur.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.nama}</td>
              <td className="px-4 py-2 flex gap-2 justify-center">
                <button
                  onClick={() => handleEditUmur(item)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg shadow"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUmur(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          {kelompokUmur.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                Belum ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Lapangan */}
  <div className="bg-white shadow-md rounded-xl p-6">
    <h1 className="text-xl font-semibold mb-6 border-b pb-2">
      🏟️ Settings Lapangan
    </h1>

    {/* Form */}
    <form onSubmit={handleSubmitLapangan} className="mb-6 flex flex-wrap gap-3">
      <input
        type="text"
        value={namaLapangan}
        onChange={(e) => setNamaLapangan(e.target.value)}
        placeholder="Nama lapangan"
        className="border px-3 py-2 rounded-lg w-48 focus:ring-2 focus:ring-blue-400 outline-none"
        required
      />
      <input
        type="text"
        value={lokasiLapangan}
        onChange={(e) => setLokasiLapangan(e.target.value)}
        placeholder="Lokasi"
        className="border px-3 py-2 rounded-lg w-64 focus:ring-2 focus:ring-blue-400 outline-none"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg shadow"
      >
        {editingLapanganId ? "Update" : "Tambah"}
      </button>
      {editingLapanganId && (
        <button
          type="button"
          onClick={() => {
            setEditingLapanganId(null);
            setNamaLapangan("");
            setLokasiLapangan("");
          }}
          className="bg-gray-400 hover:bg-gray-500 transition text-white px-4 py-2 rounded-lg shadow"
        >
          Batal
        </button>
      )}
    </form>

    {/* Table */}
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Nama</th>
            <th className="px-4 py-2 text-left">Lokasi</th>
            <th className="px-4 py-2 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {lapangan.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.nama}</td>
              <td className="px-4 py-2">{item.lokasi}</td>
              <td className="px-4 py-2 flex gap-2 justify-center">
                <button
                  onClick={() => handleEditLapangan(item)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg shadow"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLapangan(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          {lapangan.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                Belum ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );
}
