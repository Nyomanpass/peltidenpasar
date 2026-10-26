import React, { useEffect, useState } from "react";
import api from "../../api";
import {
  Edit,
  Trash2,
  Upload,
  X,
  QrCode,
  Trophy,
  MapPin,
  Calendar,
  FileText,
  Plus,
  Save,
  Eye,
  Banknote,
  Building2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Search,
  GraduationCap,
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import QRCode from "qrcode";

function Tournament() {
  const [tournaments, setTournaments] = useState([]);
  const [preview, setPreview] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const level = query.get("level");

  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: "" });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    location: "",
    description: "",
    status: "nonaktif",
    poster: null,
    type: "gratis",
    level: level || "",
    nominal: "",
    bank_info: "",
    requireSchool: false,
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (level) {
      setForm((prev) => ({ ...prev, level: level }));
    }
  }, [level]);

  useEffect(() => {
    fetchTournaments();
  }, [level]);

  const fetchTournaments = async () => {
    try {
      let url = "/tournaments";
      if (level) url += `?level=${level}`;
      const res = await api.get(url);
      setTournaments(res.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, poster: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("status", form.status);
      formData.append("type", form.type);
      formData.append("level", form.level);
      formData.append("nominal", form.nominal);
      formData.append("bank_info", form.bank_info);
      formData.append("requireSchool", form.requireSchool);

      if (form.poster) {
        formData.append("poster", form.poster);
      }

      if (editingId) {
        await api.put(`/tournaments/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTimeout(() => setSuccess(`Perubahan pada "${form.name}" berhasil disimpan!`), 100);
      } else {
        await api.post("/tournaments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTimeout(() => setSuccess(`Turnamen "${form.name}" berhasil dipublikasikan!`), 100);
      }

      resetForm();
      setShowForm(false);
      fetchTournaments();
    } catch (err) {
      setErrorAlert("Gagal menyimpan data turnamen. Periksa kembali inputan.");
    }
  };

  const handleDownloadQR = async (tournament) => {
    const baseDomain = window.location.origin;
    const url = `${baseDomain}/daftar-peserta?tournament=${encodeURIComponent(tournament.name)}`;
    try {
      const qr = await QRCode.toDataURL(url, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      const link = document.createElement("a");
      link.href = qr;
      link.download = `${tournament.name}-qr.png`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/tournaments/${confirmDelete.id}`);
      setSuccess(`Turnamen "${confirmDelete.name}" telah dihapus.`);
      fetchTournaments();
    } catch (err) {
      console.error("Gagal hapus data:", err);
      setErrorAlert("Gagal menghapus turnamen. Mungkin data masih digunakan di bagian lain.");
    } finally {
      setConfirmDelete({ show: false, id: null, name: "" });
    }
  };

  const handleEdit = (t) => {
    setForm({
      name: t.name,
      start_date: t.start_date,
      end_date: t.end_date,
      location: t.location,
      description: t.description,
      status: t.status,
      poster: null,
      type: t.type || "gratis",
      level: t.level || level || "",
      nominal: t.nominal || 0,
      bank_info: t.bank_info || "",
      requireSchool: t.requireSchool || false,
    });
    setEditingId(t.id);
    if (t.poster) {
      setPreview(`${BASE_URL}/${t.poster}`);
    } else {
      setPreview(null);
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      type: "gratis",
      level: level || "",
      nominal: 0,
      bank_info: "",
      requireSchool: false,
    });
    setPreview(null);
    setEditingId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(term) ||
      t.location?.toLowerCase().includes(term) ||
      t.status?.toLowerCase().includes(term)
    );
  });

  const activeTournaments = filteredTournaments.filter((t) => t.status === "aktif");
  const inactiveTournaments = filteredTournaments.filter((t) => t.status !== "aktif");

  // ───── Input class helpers ─────
  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";
  const labelClass = "text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="min-h-screen pb-16 space-y-6">
      {/* --- TOAST ALERTS --- */}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />}
      {errorAlert && <AlertMessage type="error" message={errorAlert} onClose={() => setErrorAlert("")} />}

      {/* --- MODAL HAPUS --- */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus turnamen "${confirmDelete.name}"? Semua data pendaftaran terkait mungkin akan terdampak.`}
          onClose={() => setConfirmDelete({ show: false, id: null, name: "" })}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() => setConfirmDelete({ show: false, id: null, name: "" })}
              className="flex-1 order-2 sm:order-1 min-h-[56px] px-8 py-4 rounded-2xl bg-slate-100 text-slate-800 font-black text-sm uppercase tracking-tighter hover:bg-slate-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 order-1 sm:order-2 min-h-[56px] px-8 py-4 rounded-2xl bg-rose-600 text-white font-black text-sm uppercase tracking-tighter shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
            >
              Ya, Hapus
            </button>
          </div>
        </AlertMessage>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manajemen Turnamen
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kelola data turnamen, jadwal, dan konfigurasi pendaftaran
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95 shrink-0 ${
            showForm && !editingId
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {showForm && !editingId ? (
            <>
              <X size={15} /> Tutup Form
            </>
          ) : (
            <>
              <Plus size={15} /> Tambah Turnamen
            </>
          )}
        </button>
      </div>

      {/* Level badge */}
      {level && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold">
          <Tag size={13} />
          Kategori: <span className="uppercase">{level}</span>
        </div>
      )}

      {/* ================= FORM SECTION ================= */}
      {showForm && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Form Header */}
          <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border shadow-2xs ${
                  editingId
                    ? "bg-amber-50 text-amber-600 border-amber-200/60"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                }`}
              >
                {editingId ? <Edit size={18} /> : <Plus size={18} />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  {editingId ? "Edit Detail Turnamen" : "Tambah Turnamen Baru"}
                </h3>
                <p className="text-slate-400 text-xs">
                  {editingId
                    ? "Perbarui informasi turnamen yang sudah ada"
                    : "Isi data untuk membuat turnamen baru"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
              title="Tutup Form"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Nama, Lokasi */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Nama Turnamen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Kejuaraan Nasional 2025"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Lokasi Turnamen</label>
                <div className="relative">
                  <MapPin
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Contoh: GOR Jaya Sakti"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Tanggal, Status, Tipe */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Tanggal Mulai</label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className={`${inputClass} pl-9 appearance-none`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Tanggal Selesai</label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className={`${inputClass} pl-9 appearance-none`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <div className="relative group">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${inputClass} pr-10 appearance-none bg-white cursor-pointer hover:border-slate-300 transition-colors`}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 group-focus-within:text-amber-500 transition-colors flex items-center justify-center">
                    <ChevronsUpDown size={15} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Tipe Turnamen</label>
                <div className="relative group">
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`${inputClass} pr-10 appearance-none bg-white cursor-pointer hover:border-slate-300 transition-colors`}
                  >
                    <option value="gratis">Gratis</option>
                    <option value="berbayar">Berbayar</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 group-focus-within:text-amber-500 transition-colors flex items-center justify-center">
                    <ChevronsUpDown size={15} />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional: Berbayar fields */}
            {form.type === "berbayar" && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
                <div>
                  <label className={labelClass}>
                    <Banknote size={12} className="inline mr-1" /> Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    name="nominal"
                    value={form.nominal}
                    onChange={handleChange}
                    placeholder="150000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Building2 size={12} className="inline mr-1" /> Info Bank & Rekening
                  </label>
                  <input
                    type="text"
                    name="bank_info"
                    value={form.bank_info}
                    onChange={handleChange}
                    placeholder="BCA - 1234567 a/n PELTI"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Checkbox: Require School */}
            <label
              htmlFor="requireSchool"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-all select-none w-fit"
            >
              <input
                type="checkbox"
                id="requireSchool"
                checked={form.requireSchool}
                onChange={(e) => setForm({ ...form, requireSchool: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-slate-500" />
                  Wajib Isi Asal Sekolah Saat Pendaftaran
                </span>
              </div>
            </label>

            {/* Row: Poster Upload & Description */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Poster Upload */}
              <div>
                <label className={labelClass}>Poster Turnamen</label>
                <label
                  htmlFor="poster-upload"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all text-center min-h-[100px]"
                >
                  {preview ? (
                    <div className="relative w-full">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-28 object-contain rounded-lg bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPreview(null);
                          setForm({ ...form, poster: null });
                        }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition active:scale-95"
                      >
                        <X size={12} />
                      </button>
                      <p className="text-[10px] text-center mt-1.5 text-slate-400 font-bold uppercase tracking-wider">
                        {form.poster ? "File Baru" : "Gambar Terpasang"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {form.poster ? form.poster.name : "Klik untuk upload poster"}
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="poster-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className={labelClass}>Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Masukkan deskripsi singkat tentang turnamen..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
              >
                <Save size={14} />
                {editingId ? "Simpan Perubahan" : "Tambah Turnamen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TOURNAMENT LIST ================= */}
      <div className="space-y-5">
        {/* List Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200/60 shadow-2xs">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                Daftar Turnamen
              </h3>
              <p className="text-slate-400 text-xs">
                {tournaments.length} turnamen terdaftar
              </p>
            </div>
          </div>

          {tournaments.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Cari turnamen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest">
              Aktif ({activeTournaments.length})
            </h4>
            <div className="grid gap-3">
              {activeTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  BASE_URL={BASE_URL}
                  formatDate={formatDate}
                  onEdit={handleEdit}
                  onDelete={(t) => setConfirmDelete({ show: true, id: t.id, name: t.name })}
                  onDownloadQR={handleDownloadQR}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Tournaments */}
        {inactiveTournaments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Nonaktif ({inactiveTournaments.length})
            </h4>
            <div className="grid gap-3">
              {inactiveTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  BASE_URL={BASE_URL}
                  formatDate={formatDate}
                  onEdit={handleEdit}
                  onDelete={(t) => setConfirmDelete({ show: true, id: t.id, name: t.name })}
                  onDownloadQR={handleDownloadQR}
                  inactive
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTournaments.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200/80 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
              <Trophy size={28} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
              {searchTerm ? "Tidak Ditemukan" : "Belum Ada Turnamen"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchTerm
                ? `Tidak ada turnamen yang cocok dengan "${searchTerm}".`
                : "Buat turnamen pertama Anda dengan menekan tombol \"Tambah Turnamen\" di atas."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 text-xs font-bold text-amber-600 hover:underline"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────── TOURNAMENT CARD COMPONENT ───────────────
function TournamentCard({ t, BASE_URL, formatDate, onEdit, onDelete, onDownloadQR, inactive }) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden group ${
        inactive ? "border-slate-200/60 opacity-80 hover:opacity-100" : "border-slate-200/90"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Poster Thumbnail */}
        <div className="sm:w-28 sm:min-h-[100px] shrink-0 bg-slate-50 flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-100">
          {t.poster ? (
            <img
              src={`${BASE_URL}/${t.poster}`}
              alt={t.name}
              className="w-full h-24 sm:h-full object-cover"
            />
          ) : (
            <div className="p-4 text-slate-300">
              <ImageIcon size={28} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start">
          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title row */}
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-amber-700 transition-colors leading-snug">
                {t.name}
              </h3>
              <span
                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                  t.status === "aktif"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                    : "bg-slate-100 text-slate-500 border border-slate-200/60"
                }`}
              >
                {t.status === "aktif" ? "Aktif" : "Nonaktif"}
              </span>
              {t.type === "berbayar" && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/70 shrink-0">
                  <Banknote size={10} /> Berbayar
                </span>
              )}
            </div>

            {/* Meta tags */}
            <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500 font-medium">
              {(t.start_date || t.end_date) && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {formatDate(t.start_date)} — {formatDate(t.end_date)}
                </span>
              )}
              {t.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {t.location}
                </span>
              )}
              {t.level && (
                <span className="inline-flex items-center gap-1">
                  <Tag size={12} className="text-slate-400" />
                  <span className="uppercase">{t.level}</span>
                </span>
              )}
            </div>

            {/* Description snippet */}
            {t.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {t.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(t)}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
              title="Edit Turnamen"
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDownloadQR(t)}
              className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl border border-transparent hover:border-violet-200/60 transition-all active:scale-95"
              title="Download QR Code Pendaftaran"
            >
              <QrCode size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(t)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
              title="Hapus Turnamen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tournament;
