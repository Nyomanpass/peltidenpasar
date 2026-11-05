import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Image as ImageIcon,
  Trash2,
  Save,
  X,
  Building2,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

export default function ClubSetting() {
  const [clubList, setClubList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    name: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    leaderName: "",
    photo: null,
  });

  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchClubs = async () => {
    try {
      const res = await api.get("/club/get");
      setClubList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data club:", err);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      leaderName: "",
      photo: null,
    });
    setEditingId(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openForm = (club = null) => {
    if (club) {
      setFormData({
        name: club.name || "",
        address: club.address || "",
        phone: club.phone || "",
        leaderName: club.leaderName || "",
        photo: null,
      });

      setEditingId(club.idClub);

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
      fd.append("name", formData.name);
      fd.append("address", formData.address);
      fd.append("phone", formData.phone);
      fd.append("leaderName", formData.leaderName);
      if (formData.photo) fd.append("photo", formData.photo);

      if (editingId) {
        await api.put(`/club/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Data club berhasil diperbarui");
      } else {
        await api.post("/club/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Club baru berhasil ditambahkan");
      }

      resetForm();
      fetchClubs();
      setCurrentPage(1);
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan data club");
    }
  };

  const handleDelete = (club) => {
    setConfirmDelete({ show: true, id: club.idClub, name: club.name });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/club/delete/${confirmDelete.id}`);
      setSuccess("Club berhasil dihapus");
      fetchClubs();
    } catch (err) {
      setError("Gagal menghapus club");
    } finally {
      setConfirmDelete({ show: false, id: null, name: "" });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(clubList.length / itemsPerPage);
  const paginatedData = clubList.slice(
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
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Settings Club Tenis
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Manajemen club / akademi tenis naungan PELTI Denpasar
            </p>
          </div>
        </div>

        <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {clubList.length} Club Terdaftar
        </span>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Nama Club <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Denpasar Tennis Academy"
              className={inputClass}
              required
            />
          </div>

          {/* Leader Name */}
          <div>
            <label className={labelClass}>Nama Ketua / Pembina</label>
            <input
              type="text"
              value={formData.leaderName}
              onChange={(e) =>
                setFormData({ ...formData, leaderName: e.target.value })
              }
              placeholder="Nama ketua club"
              className={inputClass}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Telepon / Kontak</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="08123456789"
              className={inputClass}
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Alamat Sekretariat</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Jl. Lapangan Tenis No. 1, Denpasar"
              className={inputClass}
            />
          </div>

          {/* Photo */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>
              Logo / Foto {editingId && "(Biarkan kosong jika tidak diubah)"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.files[0] })
              }
              className={`${inputClass} file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer`}
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
            {editingId ? "Update Data Club" : "Tambah Club"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 w-12 text-center">No</th>
              <th className="px-4 py-3.5">Nama Club</th>
              <th className="px-4 py-3.5">Alamat</th>
              <th className="px-4 py-3.5">Kontak</th>
              <th className="px-4 py-3.5">Ketua</th>
              <th className="px-4 py-3.5 text-center w-20">Foto</th>
              <th className="px-4 py-3.5 text-center w-28">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.map((c, i) => (
              <tr
                key={c.idClub}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-4 py-3 text-center font-semibold text-slate-400">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                <td className="px-4 py-3 font-bold text-slate-800">
                  {c.name}
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium max-w-[200px] truncate">
                  {c.address || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium">
                  {c.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" />
                      {c.phone}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">
                  {c.leaderName ? (
                    <span className="inline-flex items-center gap-1">
                      <User size={11} className="text-slate-400" />
                      {c.leaderName}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.photo ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(c.photo)}
                      className="group/img relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
                      title="Lihat Foto"
                    >
                      <img
                        src={c.photo}
                        alt={c.name}
                        className="w-10 h-10 object-cover"
                      />
                    </button>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openForm(c)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                      title="Edit Club"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                      title="Hapus Club"
                    >
                      <Trash2 size={15} />
                    </button>
                    {c.photo && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(c.photo)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200/60 transition-all active:scale-95"
                        title="Lihat Foto"
                      >
                        <ImageIcon size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {clubList.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 px-4 text-slate-400 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                      <Building2 size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Belum ada club tenis terdaftar.
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

      {/* PREVIEW IMAGE MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-md bg-white p-2 rounded-2xl shadow-2xl"
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
              alt="Foto Club"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus data club "${confirmDelete.name}"? Data yang sudah dihapus tidak bisa dikembalikan.`}
          onClose={() => setConfirmDelete({ show: false, id: null, name: "" })}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() =>
                setConfirmDelete({ show: false, id: null, name: "" })
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
