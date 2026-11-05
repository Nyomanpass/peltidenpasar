import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Edit,
  Image as ImageIcon,
  Plus,
  Save,
  X,
  Newspaper,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import api from "../api";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AlertMessage from "../components/AlertMessage";

export default function NewsSetting() {
  const [newsList, setNewsList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
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

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    title: "",
  });

  const [formKey, setFormKey] = useState(0);
  const fileInputRef = useRef(null);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news/get");
      setNewsList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data news:", err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      desc: "",
      image: null,
      tanggalUpload: format(new Date(), "yyyy-MM-dd"),
    });

    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFormKey((prev) => prev + 1);
  };

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
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      resetForm();
    }
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
        setSuccess("Berita berhasil diperbarui");
      } else {
        await api.post("/news/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Berita berhasil ditambahkan");
      }

      resetForm();
      fetchNews();
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan berita");
    }
  };

  const handleDelete = (news) => {
    setConfirmDelete({ show: true, id: news.idNews, title: news.title });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/news/delete/${confirmDelete.id}`);
      setSuccess("Berita berhasil dihapus");
      fetchNews();
    } catch (err) {
      setError("Gagal menghapus berita");
    } finally {
      setConfirmDelete({ show: false, id: null, title: "" });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  const paginatedNews = newsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const visiblePages = Array.from(
    { length: Math.max(0, endPage - startPage + 1) },
    (_, i) => startPage + i
  );

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  const stripHtml = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";
  const labelClass =
    "text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
            <Newspaper size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Settings Berita & Artikel
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Kelola artikel berita, tanggal terbit, dan konten informasi PELTI
            </p>
          </div>
        </div>

        <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {newsList.length} Berita Terbit
        </span>
      </div>

      {/* FORM */}
      <form
        key={formKey}
        onSubmit={handleSubmit}
        ref={formRef}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Judul */}
          <div className="md:col-span-1">
            <label className={labelClass}>
              Judul Berita <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Contoh: Kejuaraan Tenis Junior 2025"
              className={inputClass}
              required
            />
          </div>

          {/* Tanggal Upload */}
          <div className="md:col-span-1">
            <label className={labelClass}>
              Tanggal Upload <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tanggalUpload}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tanggalUpload: e.target.value,
                })
              }
              className={`${inputClass} appearance-none`}
              required
            />
          </div>

          {/* Gambar */}
          <div className="md:col-span-1">
            <label className={labelClass}>
              Gambar / Thumbnail {editingId && "(Biarkan kosong jika tetap)"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
              className={`${inputClass} file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer`}
            />
          </div>
        </div>

        {/* Deskripsi (Quill Editor) */}
        <div>
          <label className={labelClass}>
            Konten Berita <span className="text-rose-500">*</span>
          </label>
          <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/10 focus-within:border-amber-500 transition-all">
            <ReactQuill
              theme="snow"
              value={formData.desc}
              onChange={(value) =>
                setFormData({ ...formData, desc: value })
              }
              modules={modules}
              formats={formats}
              className="bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              <X size={14} /> Batal
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
          >
            {editingId ? <Save size={14} /> : <Plus size={14} />}
            {editingId ? "Update Berita" : "Tambah Berita"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 w-12 text-center">No</th>
              <th className="px-4 py-3.5">Judul</th>
              <th className="px-4 py-3.5">Ringkasan Konten</th>
              <th className="px-4 py-3.5 text-center w-24">Gambar</th>
              <th className="px-4 py-3.5 w-32">Tanggal Upload</th>
              <th className="px-4 py-3.5 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedNews.map((n, idx) => (
              <tr
                key={n.idNews}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-4 py-3 text-center font-semibold text-slate-400">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>
                <td className="px-4 py-3 font-bold text-slate-800 max-w-[200px] truncate">
                  {n.title}
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[280px]">
                  <p className="line-clamp-2 leading-relaxed">
                    {stripHtml(n.desc) || "-"}
                  </p>
                </td>
                <td className="px-4 py-3 text-center">
                  {n.image ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(n.image)}
                      className="group/img relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
                      title="Lihat Gambar Penuh"
                    >
                      <img
                        src={n.image}
                        alt={n.title}
                        className="w-12 h-12 object-cover"
                      />
                    </button>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 font-medium">
                  {n.tanggalUpload ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {format(new Date(n.tanggalUpload), "dd MMM yyyy")}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openForm(n)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                      title="Edit Berita"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(n)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                      title="Hapus Berita"
                    >
                      <Trash2 size={15} />
                    </button>
                    {n.image && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(n.image)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200/60 transition-all active:scale-95"
                        title="Lihat Gambar"
                      >
                        <ImageIcon size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {newsList.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-10 px-4 text-slate-400 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                      <Newspaper size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Belum ada berita yang diterbitkan.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentPage === page
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* MODAL PREVIEW IMAGE */}
      {previewImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-2xl bg-white p-2 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-slate-900 text-white p-1.5 rounded-full shadow-lg hover:bg-slate-800 transition active:scale-95"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage}
              alt="Preview Berita"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus berita "${confirmDelete.title}"? Data yang sudah dihapus tidak bisa dikembalikan.`}
          onClose={() => setConfirmDelete({ show: false, id: null, title: "" })}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() =>
                setConfirmDelete({ show: false, id: null, title: "" })
              }
              className="flex-1 order-2 sm:order-1 min-h-[50px] px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-wider hover:bg-slate-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 order-1 sm:order-2 min-h-[50px] px-6 py-3 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
            >
              Ya, Hapus
            </button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}