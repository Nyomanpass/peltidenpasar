import { useState, useEffect } from "react";
import { PlusCircle, Edit, Image } from "lucide-react";
import api from "../api";
import { format } from "date-fns";

export default function NewsSetting() {
  const [newsList, setNewsList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    image: null,
    tanggalUpload: format(new Date(), "yyyy-MM-dd"),
  });
  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openForm = (news = null) => {
    if (news) {
      setFormData({
        title: news.title || "",
        desc: news.desc || "",
        image: null,
        tanggalUpload: news.tanggalUpload
          ? news.tanggalUpload.slice(0, 10)
          : format(new Date(), "yyyy-MM-dd"),
      });
      setEditingId(news.idNews);
    } else {
      setFormData({
        title: "",
        desc: "",
        image: null,
        tanggalUpload: format(new Date(), "yyyy-MM-dd"),
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("desc", formData.desc);
      fd.append("tanggalUpload", formData.tanggalUpload);
      if (formData.image) fd.append("image", formData.image);

      if (editingId) {
        await api.put(`/news/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/news/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setModalOpen(false);
      fetchNews();
      setCurrentPage(1); // reset ke halaman pertama
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah yakin ingin menghapus news ini?")) return;
    try {
      await api.delete(`/news/delete/${id}`);
      fetchNews();
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(newsList.length / itemsPerPage);
  const paginatedNews = newsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white shadow-2xl max-width-5xl rounded-2xl p-8 border border-gray-100">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
        <PlusCircle size={24} className="text-blue-600" /> Tambah / Kelola News
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Judul</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Tanggal Upload</label>
            <input
              type="date"
              value={formData.tanggalUpload}
              onChange={(e) => setFormData({ ...formData, tanggalUpload: e.target.value })}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col mt-4">
          <label className="text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
          <textarea
            rows={3}
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
            placeholder="Masukkan deskripsi singkat..."
            required
          />
        </div>

        {/* Tombol Tambah / Update di bawah kanan */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2"
          >
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? "Update" : "Tambah"}
          </button>
        </div>
      </form>

      {/* Table News */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">No</th>
              <th className="px-5 py-3 text-left">Judul</th>
              <th className="px-5 py-3 text-left">Deskripsi</th>
              <th className="px-5 py-3 text-left">Gambar</th>
              <th className="px-5 py-3 text-left">Tanggal Upload</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedNews.map((n, idx) => (
              <tr key={n.idNews} className="hover:bg-yellow-50/50 transition">
                <td className="px-5 py-3 font-medium text-gray-700">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td className="px-5 py-3 font-semibold text-gray-800">{n.title}</td>
                <td className="px-5 py-3 text-gray-700">
                  {n.desc.length > 100 ? n.desc.slice(0, 100) + "..." : n.desc}
                </td>
                <td className="px-5 py-3">
                  {n.image ? <img src={n.image} alt="news" className="w-16 h-16 object-cover rounded" /> : "-"}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {n.tanggalUpload ? format(new Date(n.tanggalUpload), "dd MMM yyyy") : "-"}
                </td>
                <td className="px-5 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => openForm(n)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(n.idNews)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition"
                  >
                    <PlusCircle size={16} />
                  </button>
                  {n.image && (
                    <button
                      onClick={() => setPreviewImage(n.image)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md transition"
                    >
                      <Image size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded hover:bg-gray-300 ${currentPage === i + 1 ? "bg-yellow-500 text-white" : "bg-gray-200"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview News"
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
