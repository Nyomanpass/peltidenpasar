import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Image as ImageIcon,
  Trash2,
  Save,
  X,
  Sliders,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

export default function SliderSetting() {
  const [sliderList, setSliderList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    title: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    urutan: 1,
    isActive: true,
    image: null,
  });

  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSlider = async () => {
    try {
      const res = await api.get("/slider/get");
      setSliderList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data slider:", err);
    }
  };

  useEffect(() => {
    fetchSlider();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      ctaText: "",
      ctaLink: "",
      urutan: 1,
      isActive: true,
      image: null,
    });
    setEditingId(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openForm = (slider = null) => {
    if (slider) {
      setFormData({
        title: slider.title || "",
        description: slider.description || "",
        ctaText: slider.ctaText || "",
        ctaLink: slider.ctaLink || "",
        urutan: slider.urutan || 1,
        isActive: slider.isActive ?? true,
        image: null,
      });

      setEditingId(slider.idSlider);
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
      fd.append("description", formData.description);
      fd.append("ctaText", formData.ctaText);
      fd.append("ctaLink", formData.ctaLink);
      fd.append("urutan", formData.urutan);
      fd.append("isActive", formData.isActive);
      if (formData.image) fd.append("image", formData.image);

      if (editingId) {
        await api.put(`/slider/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Banner slider berhasil diperbarui");
      } else {
        await api.post("/slider/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Banner slider berhasil ditambahkan");
      }

      resetForm();
      fetchSlider();
      setCurrentPage(1);
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan slider");
    }
  };

  const handleDelete = (slider) => {
    setConfirmDelete({ show: true, id: slider.idSlider, title: slider.title });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/slider/delete/${confirmDelete.id}`);
      setSuccess("Banner slider berhasil dihapus");
      fetchSlider();
    } catch (err) {
      setError("Gagal menghapus banner slider");
    } finally {
      setConfirmDelete({ show: false, id: null, title: "" });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(sliderList.length / itemsPerPage);
  const paginatedData = sliderList.slice(
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
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-200/60 shadow-2xs">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Settings Slider Banner
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Atur gambar carousel hero di halaman utama, urutan tayang, dan tombol aksi (CTA)
            </p>
          </div>
        </div>

        <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {sliderList.length} Slide Aktif
        </span>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Judul */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Judul Banner <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Contoh: Turnamen Terbuka PELTI 2025"
              className={inputClass}
              required
            />
          </div>

          {/* CTA Text */}
          <div>
            <label className={labelClass}>
              Teks Tombol (CTA) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) =>
                setFormData({ ...formData, ctaText: e.target.value })
              }
              placeholder="Contoh: Daftar Sekarang"
              className={inputClass}
              required
            />
          </div>

          {/* CTA Link */}
          <div>
            <label className={labelClass}>
              Link Tujuan (CTA Link) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ctaLink}
              onChange={(e) =>
                setFormData({ ...formData, ctaLink: e.target.value })
              }
              placeholder="Contoh: /pendaftaran"
              className={inputClass}
              required
            />
          </div>

          {/* Urutan */}
          <div>
            <label className={labelClass}>Urutan Tampil</label>
            <input
              type="number"
              min="1"
              value={formData.urutan}
              onChange={(e) =>
                setFormData({ ...formData, urutan: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* Gambar File */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>
              Gambar Banner {editingId && "(Biarkan kosong jika tidak ingin ganti)"}
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

        {/* Deskripsi */}
        <div>
          <label className={labelClass}>
            Deskripsi Singkat <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tuliskan keterangan singkat yang menarik untuk banner..."
            className={`${inputClass} resize-none`}
            required
          />
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
            {editingId ? "Update Slider" : "Tambah Slider"}
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
              <th className="px-4 py-3.5">Deskripsi</th>
              <th className="px-4 py-3.5">CTA Button</th>
              <th className="px-4 py-3.5 text-center w-24">Gambar</th>
              <th className="px-4 py-3.5 text-center w-20">Urutan</th>
              <th className="px-4 py-3.5 text-center w-28">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.map((s, i) => (
              <tr
                key={s.idSlider}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-4 py-3 text-center font-semibold text-slate-400">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                <td className="px-4 py-3 font-bold text-slate-800 max-w-[180px] truncate">
                  {s.title}
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[240px]">
                  <p className="line-clamp-2 leading-relaxed">
                    {s.description || "-"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                      {s.ctaText || "-"}
                    </span>
                    {s.ctaLink && (
                      <a
                        href={s.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline max-w-[150px] truncate font-medium"
                      >
                        <ExternalLink size={10} /> {s.ctaLink}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.image ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(s.image)}
                      className="group/img relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
                      title="Lihat Gambar"
                    >
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-12 h-12 object-cover"
                      />
                    </button>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">
                  #{s.urutan}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openForm(s)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                      title="Edit Slider"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                      title="Hapus Slider"
                    >
                      <Trash2 size={15} />
                    </button>
                    {s.image && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(s.image)}
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

            {sliderList.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 px-4 text-slate-400 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                      <Sliders size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Belum ada banner slider terdaftar.
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
          {visiblePages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                currentPage === p
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
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

      {/* PREVIEW IMAGE MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl bg-white p-2 rounded-2xl shadow-2xl"
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
              alt="Preview Slider"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus banner slider "${confirmDelete.title}"? Data yang sudah dihapus tidak bisa dikembalikan.`}
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
