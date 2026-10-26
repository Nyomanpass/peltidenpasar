// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import api from "../api";
import {
  Edit,
  Trash2,
  Users,
  MapPin,
  XCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Save,
  X,
  ShieldCheck,
  UserCheck,
  Sliders,
  LayoutGrid,
  Clock,
  Sparkles,
} from "lucide-react";
import SettingScoreRule from "../components/admin/SettingScoreRule";
import AlertMessage from "../components/AlertMessage";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("all");

  // ================= Kelompok Umur =================
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [namaUmur, setNamaUmur] = useState("");
  const [umur, setUmur] = useState("");
  const [editingUmurId, setEditingUmurId] = useState(null);

  // ================= Wasit =================
  const [wasit, setWasit] = useState([]);
  const [namaWasit, setNamaWasit] = useState("");
  const [emailWasit, setEmailWasit] = useState("");
  const [passwordWasit, setPasswordWasit] = useState("");
  const [editingWasitId, setEditingWasitId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // ================= Panitia =================
  const [panitia, setPanitia] = useState([]);
  const [namaPanitia, setNamaPanitia] = useState("");
  const [emailPanitia, setEmailPanitia] = useState("");
  const [passwordPanitia, setPasswordPanitia] = useState("");
  const [editingPanitiaId, setEditingPanitiaId] = useState(null);
  const [showPasswordPanitia, setShowPasswordPanitia] = useState(false);

  // ================= Lapangan =================
  const [lapangan, setLapangan] = useState([]);
  const [namaLapangan, setNamaLapangan] = useState("");
  const [lokasiLapangan, setLokasiLapangan] = useState("");
  const [editingLapanganId, setEditingLapanganId] = useState(null);

  // ================= Alerts & Confirmations =================
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    type: null,
    name: "",
  });

  // ================= Fetch Data =================
  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmur(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelompok umur:", err);
    }
  };

  const fetchLapangan = async () => {
    try {
      const res = await api.get("/lapangan");
      setLapangan(res.data);
    } catch (err) {
      console.error("Gagal mengambil data lapangan:", err);
    }
  };

  const fetchPanitia = async () => {
    try {
      const res = await api.get("/panitia");
      setPanitia(res.data);
    } catch (err) {
      console.error("Gagal mengambil data panitia:", err);
    }
  };

  const fetchWasit = async () => {
    try {
      const res = await api.get("/wasit");
      setWasit(res.data);
    } catch (err) {
      console.error("Gagal mengambil data wasit:", err);
    }
  };

  useEffect(() => {
    fetchKelompokUmur();
    fetchLapangan();
    fetchWasit();
    fetchPanitia();
  }, []);

  // ================= Handlers: Kelompok Umur =================
  const handleSubmitUmur = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nama: namaUmur,
        umur: parseInt(umur),
      };

      if (editingUmurId) {
        await api.put(`/kelompok-umur/${editingUmurId}`, payload);
        setSuccess("Kelompok umur berhasil diperbarui");
      } else {
        await api.post("/kelompok-umur", payload);
        setSuccess("Kelompok umur berhasil ditambahkan");
      }

      setNamaUmur("");
      setUmur("");
      setEditingUmurId(null);
      fetchKelompokUmur();
    } catch (err) {
      setError("Gagal menyimpan kelompok umur");
    }
  };

  const handleEditUmur = (item) => {
    setNamaUmur(item.nama);
    setUmur(item.umur);
    setEditingUmurId(item.id);
  };

  const handleDeleteUmur = async (id) => {
    try {
      await api.delete(`/kelompok-umur/${id}`);
      setSuccess("Kelompok umur berhasil dihapus");
      fetchKelompokUmur();
    } catch (err) {
      setError("Gagal menghapus kelompok umur, masih ada data peserta");
    }
  };

  // ================= Handlers: Lapangan =================
  const handleSubmitLapangan = async (e) => {
    e.preventDefault();
    try {
      if (editingLapanganId) {
        await api.put(`/lapangan/${editingLapanganId}`, {
          nama: namaLapangan,
          lokasi: lokasiLapangan,
        });
        setSuccess("Data lapangan berhasil diperbarui");
      } else {
        await api.post("/lapangan", {
          nama: namaLapangan,
          lokasi: lokasiLapangan,
        });
        setSuccess("Lapangan baru berhasil ditambahkan");
      }
      setNamaLapangan("");
      setLokasiLapangan("");
      setEditingLapanganId(null);
      fetchLapangan();
    } catch (err) {
      setError("Gagal menyimpan data lapangan");
    }
  };

  const handleEditLapangan = (item) => {
    setNamaLapangan(item.nama);
    setLokasiLapangan(item.lokasi);
    setEditingLapanganId(item.id);
  };

  const handleDeleteLapangan = async (id) => {
    try {
      await api.delete(`/lapangan/${id}`);
      setSuccess("Lapangan berhasil dihapus");
      fetchLapangan();
    } catch (err) {
      setError("Gagal menghapus lapangan, masih ada data jadwal yang terkait");
    }
  };

  // ================= Handlers: Panitia =================
  const handleSubmitPanitia = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: namaPanitia,
        email: emailPanitia,
      };

      if (passwordPanitia) {
        payload.password = passwordPanitia;
      }

      if (editingPanitiaId) {
        await api.put(`/panitia/${editingPanitiaId}`, payload);
        setSuccess("Akun panitia berhasil diperbarui");
      } else {
        await api.post("/panitia", {
          ...payload,
          password: passwordPanitia,
        });
        setSuccess("Akun panitia berhasil ditambahkan");
      }

      setNamaPanitia("");
      setEmailPanitia("");
      setPasswordPanitia("");
      setEditingPanitiaId(null);
      fetchPanitia();
    } catch (err) {
      setError("Gagal menyimpan akun panitia");
    }
  };

  const updateStatusPanitia = async (id, status) => {
    try {
      await api.put(`/panitia/${id}/status`, { status });
      setSuccess(`Status panitia berhasil diubah ke "${status}"`);
      fetchPanitia();
    } catch (err) {
      setError("Gagal mengubah status panitia");
    }
  };

  const deletePanitia = async (id) => {
    try {
      await api.delete(`/panitia/${id}`);
      setSuccess("Akun panitia berhasil dihapus");
      fetchPanitia();
    } catch (err) {
      setError("Gagal menghapus akun panitia");
    }
  };

  // ================= Handlers: Wasit =================
  const handleSubmitWasit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: namaWasit,
        email: emailWasit,
      };

      if (passwordWasit) {
        payload.password = passwordWasit;
      }

      if (editingWasitId) {
        await api.put(`/wasit/${editingWasitId}`, payload);
        setSuccess("Akun wasit berhasil diperbarui");
      } else {
        await api.post("/wasit", {
          ...payload,
          password: passwordWasit,
        });
        setSuccess("Akun wasit berhasil ditambahkan");
      }

      setNamaWasit("");
      setEmailWasit("");
      setPasswordWasit("");
      setEditingWasitId(null);
      fetchWasit();
    } catch (err) {
      setError("Gagal menyimpan akun wasit");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/wasit/${id}/status`, { status });
      setSuccess(`Status wasit berhasil diubah ke "${status}"`);
      fetchWasit();
    } catch (err) {
      setError("Gagal mengubah status wasit");
    }
  };

  const deleteWasit = async (id) => {
    try {
      await api.delete(`/wasit/${id}`);
      setSuccess("Akun wasit berhasil dihapus");
      fetchWasit();
    } catch (err) {
      setError("Gagal menghapus akun wasit");
    }
  };

  const handleEditWasit = (w) => {
    setNamaWasit(w.name);
    setEmailWasit(w.email);
    setPasswordWasit("");
    setEditingWasitId(w.id);
  };

  // ================= Confirmation Delete Router =================
  const handleConfirmDelete = async () => {
    try {
      if (confirmDelete.type === "umur") {
        await handleDeleteUmur(confirmDelete.id);
      } else if (confirmDelete.type === "lapangan") {
        await handleDeleteLapangan(confirmDelete.id);
      } else if (confirmDelete.type === "wasit") {
        await deleteWasit(confirmDelete.id);
      } else if (confirmDelete.type === "panitia") {
        await deletePanitia(confirmDelete.id);
      }
    } catch (error) {
      setError("Gagal menghapus data");
    } finally {
      setConfirmDelete({ show: false, id: null, type: null, name: "" });
    }
  };

  // ================= Style Helpers =================
  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";
  const labelClass =
    "text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block";

  const tabs = [
    { id: "all", label: "Semua", icon: LayoutGrid },
    { id: "umur", label: "Kelompok Umur", icon: Users, count: kelompokUmur.length },
    { id: "lapangan", label: "Lapangan", icon: MapPin, count: lapangan.length },
    { id: "panitia", label: "Akun Panitia", icon: ShieldCheck, count: panitia.length },
    { id: "wasit", label: "Akun Wasit", icon: UserCheck, count: wasit.length },
    { id: "rules", label: "Aturan Skor", icon: Sliders },
  ];

  return (
    <div className="font-sans min-h-screen pb-16 space-y-6">
      {/* --- TOAST NOTIFICATIONS --- */}
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

      {/* --- MODAL CONFIRM DELETE --- */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus ${
            confirmDelete.type === "umur"
              ? `kelompok umur "${confirmDelete.name}"`
              : confirmDelete.type === "lapangan"
              ? `lapangan "${confirmDelete.name}"`
              : confirmDelete.type === "panitia"
              ? `akun panitia "${confirmDelete.name}"`
              : `akun wasit "${confirmDelete.name}"`
          }? Data yang sudah dihapus tidak bisa dikembalikan.`}
          onClose={() =>
            setConfirmDelete({ show: false, id: null, type: null, name: "" })
          }
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() =>
                setConfirmDelete({ show: false, id: null, type: null, name: "" })
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

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Game Settings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kelola kelompok umur, lapangan, akun panitia, wasit, dan aturan skor pertandingan
          </p>
        </div>
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Icon
                size={14}
                className={isActive ? "text-amber-500" : "text-slate-400"}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    isActive
                      ? "bg-amber-100/80 text-amber-800"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= MAIN CONTENT SECTIONS ================= */}
      <div className="space-y-6">
        {/* ================= 1. KELOMPOK UMUR ================= */}
        {(activeTab === "all" || activeTab === "umur") && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Settings Kelompok Umur
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Atur nama kategori kelompok umur dan batasan usia peserta
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                {kelompokUmur.length} Kategori
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUmur} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>
                    Nama Kelompok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaUmur}
                    onChange={(e) => setNamaUmur(e.target.value)}
                    placeholder="Contoh: KU 10 PA"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Batas Umur (Tahun) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={umur}
                    onChange={(e) => setUmur(e.target.value)}
                    placeholder="10"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 sm:self-end">
                  {editingUmurId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUmurId(null);
                        setNamaUmur("");
                        setUmur("");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      <X size={14} /> Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
                  >
                    {editingUmurId ? <Save size={14} /> : <Plus size={14} />}
                    {editingUmurId ? "Update Kelompok" : "Tambah Kelompok"}
                  </button>
                </div>
              </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 w-16">ID</th>
                    <th className="px-4 py-3.5">Nama Kelompok</th>
                    <th className="px-4 py-3.5">Batas Usia</th>
                    <th className="px-4 py-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {kelompokUmur.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-400">
                        #{item.id}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {item.nama}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                          {item.umur} Tahun
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditUmur(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                            title="Edit Kelompok"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                show: true,
                                id: item.id,
                                type: "umur",
                                name: item.nama,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                            title="Hapus Kelompok"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {kelompokUmur.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 px-4 text-slate-400 bg-white"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                            <Users size={24} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            Belum ada kelompok umur terdaftar.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 2. LAPANGAN ================= */}
        {(activeTab === "all" || activeTab === "lapangan") && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Settings Lapangan
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Kelola data lapangan dan lokasi venue turnamen tenis
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                {lapangan.length} Lapangan
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLapangan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>
                    Nama Lapangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaLapangan}
                    onChange={(e) => setNamaLapangan(e.target.value)}
                    placeholder="Contoh: Lapangan A"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Lokasi Lapangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lokasiLapangan}
                    onChange={(e) => setLokasiLapangan(e.target.value)}
                    placeholder="Contoh: Indoor / Gor Denpasar"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 sm:self-end">
                  {editingLapanganId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLapanganId(null);
                        setNamaLapangan("");
                        setLokasiLapangan("");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      <X size={14} /> Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
                  >
                    {editingLapanganId ? <Save size={14} /> : <Plus size={14} />}
                    {editingLapanganId ? "Update Lapangan" : "Tambah Lapangan"}
                  </button>
                </div>
              </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 w-16">ID</th>
                    <th className="px-4 py-3.5">Nama Lapangan</th>
                    <th className="px-4 py-3.5">Lokasi</th>
                    <th className="px-4 py-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lapangan.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-400">
                        #{item.id}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {item.nama}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                          <MapPin size={11} className="text-slate-400" />
                          {item.lokasi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditLapangan(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                            title="Edit Lapangan"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                show: true,
                                id: item.id,
                                type: "lapangan",
                                name: item.nama,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                            title="Hapus Lapangan"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {lapangan.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 px-4 text-slate-400 bg-white"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                            <MapPin size={24} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            Tidak ada data lapangan tersedia.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 3. AKUN PANITIA ================= */}
        {(activeTab === "all" || activeTab === "panitia") && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Settings Akun Panitia
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Manajemen akun dan hak verifikasi panitia pelaksana turnamen
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                {panitia.length} Panitia
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPanitia} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>
                    Nama Panitia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaPanitia}
                    onChange={(e) => setNamaPanitia(e.target.value)}
                    placeholder="Nama lengkap panitia"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Email Panitia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailPanitia}
                    onChange={(e) => setEmailPanitia(e.target.value)}
                    placeholder="panitia@example.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Password {editingPanitiaId ? "(Opsional)" : <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordPanitia ? "text" : "password"}
                      value={passwordPanitia}
                      onChange={(e) => setPasswordPanitia(e.target.value)}
                      placeholder={
                        editingPanitiaId
                          ? "Kosongkan jika tidak diubah"
                          : "Minimal 8 karakter"
                      }
                      className={`${inputClass} pr-10`}
                      required={!editingPanitiaId}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordPanitia(!showPasswordPanitia)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPasswordPanitia ? "Sembunyikan Password" : "Lihat Password"}
                    >
                      {showPasswordPanitia ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                {editingPanitiaId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPanitiaId(null);
                      setNamaPanitia("");
                      setEmailPanitia("");
                      setPasswordPanitia("");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                  >
                    <X size={14} /> Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
                >
                  {editingPanitiaId ? <Save size={14} /> : <Plus size={14} />}
                  {editingPanitiaId ? "Update Panitia" : "Tambah Panitia"}
                </button>
              </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 w-16">ID</th>
                    <th className="px-4 py-3.5">Nama</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {panitia.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-400">
                        #{p.id}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {p.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            p.status === "verified"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                              : p.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/70"
                              : "bg-rose-50 text-rose-700 border border-rose-200/70"
                          }`}
                        >
                          {p.status === "verified" && <CheckCircle size={10} />}
                          {p.status === "pending" && <Clock size={10} />}
                          {p.status === "rejected" && <XCircle size={10} />}
                          <span className="capitalize">{p.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* VERIFY BUTTON */}
                          <button
                            type="button"
                            onClick={() => updateStatusPanitia(p.id, "verified")}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200/60 transition-all active:scale-95"
                            title="Setujui / Verifikasi Akun"
                          >
                            <CheckCircle size={15} />
                          </button>

                          {/* REJECT BUTTON */}
                          <button
                            type="button"
                            onClick={() => updateStatusPanitia(p.id, "rejected")}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                            title="Tolak Akun"
                          >
                            <XCircle size={15} />
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              setNamaPanitia(p.name);
                              setEmailPanitia(p.email);
                              setPasswordPanitia("");
                              setEditingPanitiaId(p.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                            title="Edit Data Panitia"
                          >
                            <Edit size={15} />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                show: true,
                                id: p.id,
                                type: "panitia",
                                name: p.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                            title="Hapus Akun Panitia"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {panitia.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 px-4 text-slate-400 bg-white"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                            <ShieldCheck size={24} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            Tidak ada data panitia terdaftar.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 4. AKUN WASIT ================= */}
        {(activeTab === "all" || activeTab === "wasit") && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Settings Akun Wasit
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Manajemen akun dan status verifikasi wasit pertandingan tenis
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                {wasit.length} Wasit
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitWasit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>
                    Nama Wasit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaWasit}
                    onChange={(e) => setNamaWasit(e.target.value)}
                    placeholder="Nama lengkap wasit"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Email Wasit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailWasit}
                    onChange={(e) => setEmailWasit(e.target.value)}
                    placeholder="wasit@example.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Password {editingWasitId ? "(Opsional)" : <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordWasit}
                      onChange={(e) => setPasswordWasit(e.target.value)}
                      placeholder={
                        editingWasitId
                          ? "Kosongkan jika tidak diubah"
                          : "Minimal 8 karakter"
                      }
                      className={`${inputClass} pr-10`}
                      required={!editingWasitId}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                {editingWasitId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWasitId(null);
                      setNamaWasit("");
                      setEmailWasit("");
                      setPasswordWasit("");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                  >
                    <X size={14} /> Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
                >
                  {editingWasitId ? <Save size={14} /> : <Plus size={14} />}
                  {editingWasitId ? "Update Wasit" : "Tambah Wasit"}
                </button>
              </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 w-16">ID</th>
                    <th className="px-4 py-3.5">Nama</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {wasit.map((w) => (
                    <tr
                      key={w.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-400">
                        #{w.id}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {w.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {w.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            w.status === "verified"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                              : w.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/70"
                              : "bg-rose-50 text-rose-700 border border-rose-200/70"
                          }`}
                        >
                          {w.status === "verified" && <CheckCircle size={10} />}
                          {w.status === "pending" && <Clock size={10} />}
                          {w.status === "rejected" && <XCircle size={10} />}
                          <span className="capitalize">{w.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* VERIFY BUTTON */}
                          <button
                            type="button"
                            onClick={() => updateStatus(w.id, "verified")}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200/60 transition-all active:scale-95"
                            title="Setujui / Verifikasi Akun"
                          >
                            <CheckCircle size={15} />
                          </button>

                          {/* REJECT BUTTON */}
                          <button
                            type="button"
                            onClick={() => updateStatus(w.id, "rejected")}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                            title="Tolak Akun"
                          >
                            <XCircle size={15} />
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleEditWasit(w)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                            title="Edit Data Wasit"
                          >
                            <Edit size={15} />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                show: true,
                                id: w.id,
                                type: "wasit",
                                name: w.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                            title="Hapus Akun Wasit"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {wasit.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 px-4 text-slate-400 bg-white"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                            <UserCheck size={24} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            Tidak ada data wasit terdaftar.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 5. ATURAN SKOR (SCORE RULES) ================= */}
        {(activeTab === "all" || activeTab === "rules") && (
          <div className="animate-in fade-in duration-200">
            <SettingScoreRule />
          </div>
        )}
      </div>
    </div>
  );
}
