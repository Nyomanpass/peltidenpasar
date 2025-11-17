import React, { useEffect, useState } from "react";
import api from "../../api";
import { Edit, Trash2 } from "lucide-react";

function Tournament() {
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    location: "",
    description: "",
    status: "nonaktif",
    poster: null, // ubah ke null (bukan string)
  });
  const [editingId, setEditingId] = useState(null);

  // 🔹 Ambil semua turnamen
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get("/tournaments");
      setTournaments(res.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  // 🔹 Handle input teks
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle upload file
  const handleFileChange = (e) => {
    setForm({ ...form, poster: e.target.files[0] });
  };

  // 🔹 Tambah / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("status", form.status);
      if (form.poster) {
        formData.append("poster", form.poster);
      }

      if (editingId) {
        await api.put(`/tournaments/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/tournaments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      fetchTournaments();
    } catch (err) {
      console.error("Gagal simpan data:", err);
    }
  };

  // 🔹 Hapus
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus turnamen ini?")) {
      try {
        await api.delete(`/tournaments/${id}`);
        fetchTournaments();
      } catch (err) {
        console.error("Gagal hapus data:", err);
      }
    }
  };

  // 🔹 Edit
  const handleEdit = (t) => {
    setForm({
      name: t.name,
      start_date: t.start_date,
      end_date: t.end_date,
      location: t.location,
      description: t.description,
      status: t.status,
      poster: null,
    });
    setEditingId(t.id);
  };

  const resetForm = () => {
    setForm({
      name: "",
      start_date: "",
      end_date: "",
      location: "",
      description: "",
      status: "nonaktif",
      poster: null,
    });
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Manajemen Turnamen
      </h1>

      {/* FORM */}
      <div className="bg-gray-50 p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
          {editingId ? "Edit Turnamen" : "Tambah Turnamen Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          {/* Nama */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Nama Turnamen
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Lokasi */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Lokasi Turnamen
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tanggal Mulai */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tanggal Selesai */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Poster (Upload File) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Upload Poster Turnamen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded h-24 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tombol */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingId ? "Simpan Perubahan" : "Tambah Turnamen"}
            </button>
          </div>
        </form>
      </div>

      {/* TABEL */}
      <h2 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">
        Daftar Turnamen
      </h2>
      <div className="overflow-x-auto shadow rounded-xl">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-2">Poster</th>
              <th className="border p-2">Nama</th>
              <th className="border p-2">Tanggal</th>
              <th className="border p-2">Lokasi</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">
                  {t.poster ? (
                    <img
                      src={`http://localhost:5004/${t.poster}`}
                      alt={t.name}
                      className="h-16 w-auto mx-auto rounded"
                    />
                  ) : (
                    <span className="text-gray-400">Tidak ada</span>
                  )}
                </td>
                <td className="border p-2 font-medium">{t.name}</td>
                <td className="border p-2">
                  {t.start_date} - {t.end_date}
                </td>
                <td className="border p-2">{t.location}</td>
                <td
                  className={`border p-2 font-semibold ${
                    t.status === "aktif" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.status}
                </td>
                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {tournaments.length === 0 && (
              <tr>
                <td colSpan="6" className="border p-4 text-center text-gray-500 italic">
                  Belum ada turnamen
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tournament;
