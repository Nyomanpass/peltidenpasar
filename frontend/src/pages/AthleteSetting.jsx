import { useState, useEffect, useRef } from "react";
import {
  Plus,
  FileDown,
  Trash2,
  Edit,
  Image as ImageIcon,
  Save,
  X,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import api from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AlertMessage from "../components/AlertMessage";

export default function AthleteSetting() {
  const [athleteList, setAthleteList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    name: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "male",
    kelompokUmurId: "",
    phoneNumber: "",
    address: "",
    club: "",
    photo: null,
  });

  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmurList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelompok umur:", err);
    }
  };

  const fetchAthletes = async () => {
    try {
      const res = await api.get("/athlete/get");
      setAthleteList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data atlet:", err);
    }
  };

  useEffect(() => {
    fetchAthletes();
    fetchKelompokUmur();
  }, []);

  const handleExportPDF = async (athlete) => {
    setSelectedAthlete(athlete);

    // tunggu React render DOM
    await new Promise((r) => setTimeout(r, 200));

    const element = document.getElementById("athlete-card-pdf");
    if (!element) return alert("Element PDF tidak ditemukan");

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`kartu-atlet-${athlete.name}.pdf`);
    } catch (err) {
      console.error("Gagal cetak PDF:", err);
      setError("Gagal mencetak kartu atlet ke PDF");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      birthDate: "",
      gender: "male",
      kelompokUmurId: "",
      phoneNumber: "",
      address: "",
      club: "",
      photo: null,
    });
    setEditingId(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openForm = (athlete = null) => {
    if (athlete) {
      setFormData({
        name: athlete.name || "",
        birthDate: athlete.birthDate ? athlete.birthDate.slice(0, 10) : "",
        gender: athlete.gender || "male",
        kelompokUmurId: athlete.kelompokUmurId || "",
        phoneNumber: athlete.phoneNumber || "",
        address: athlete.address || "",
        club: athlete.club || "",
        photo: null,
      });

      setEditingId(athlete.id);

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

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getFullYear() - birth.getFullYear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = calculateAge(formData.birthDate);

    const selectedKelompok = kelompokUmurList.find(
      (k) => k.id == formData.kelompokUmurId
    );

    if (!selectedKelompok) {
      setError("Pilih kategori kelompok umur terlebih dahulu");
      return;
    }

    if (age > selectedKelompok.umur) {
      setError(
        `Umur atlet (${age} tahun) melebihi batas kategori ${selectedKelompok.nama}`
      );
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("birthDate", formData.birthDate);
      fd.append("gender", formData.gender);
      fd.append("kelompokUmurId", formData.kelompokUmurId);
      fd.append("phoneNumber", formData.phoneNumber);
      fd.append("address", formData.address);
      fd.append("club", formData.club);
      if (formData.photo) fd.append("photo", formData.photo);

      if (editingId) {
        await api.put(`/athlete/update/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Data atlet berhasil diperbarui");
      } else {
        await api.post("/athlete/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Atlet baru berhasil ditambahkan");
      }

      resetForm();
      fetchAthletes();
      setCurrentPage(1);
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan data atlet");
    }
  };

  const handleDelete = (athlete) => {
    setConfirmDelete({ show: true, id: athlete.id, name: athlete.name });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/athlete/delete/${confirmDelete.id}`);
      setSuccess("Data atlet berhasil dihapus");
      fetchAthletes();
    } catch (err) {
      setError("Gagal menghapus data atlet");
    } finally {
      setConfirmDelete({ show: false, id: null, name: "" });
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(athleteList.length / itemsPerPage);
  const paginatedData = athleteList.slice(
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
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
            <Award size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Settings Data Atlet
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Kelola data atlet tenis binaan, kategori usia, club/pelatih, dan cetak kartu atlet
            </p>
          </div>
        </div>

        <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {athleteList.length} Atlet Terdaftar
        </span>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Putu Bagus Pratama"
              className={inputClass}
              required
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className={labelClass}>
              Tanggal Lahir <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className={`${inputClass} appearance-none`}
              required
            />
          </div>

          {/* Gender (Dropdown with custom chevron) */}
          <div>
            <label className={labelClass}>Jenis Kelamin</label>
            <div className="relative group">
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className={`${inputClass} pr-10 appearance-none bg-white cursor-pointer hover:border-slate-300 transition-colors`}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 group-focus-within:text-amber-500 transition-colors flex items-center justify-center">
                <ChevronsUpDown size={15} />
              </div>
            </div>
          </div>

          {/* Category (Dropdown with custom chevron) */}
          <div>
            <label className={labelClass}>
              Kategori Umur <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <select
                value={formData.kelompokUmurId}
                onChange={(e) =>
                  setFormData({ ...formData, kelompokUmurId: e.target.value })
                }
                className={`${inputClass} pr-10 appearance-none bg-white cursor-pointer hover:border-slate-300 transition-colors`}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {kelompokUmurList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} (Maks {k.umur} Thn)
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 group-focus-within:text-amber-500 transition-colors flex items-center justify-center">
                <ChevronsUpDown size={15} />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className={labelClass}>No. Telepon / WhatsApp</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="08123456789"
              className={inputClass}
            />
          </div>

          {/* Club */}
          <div>
            <label className={labelClass}>Club / Pelatih</label>
            <input
              type="text"
              value={formData.club}
              onChange={(e) =>
                setFormData({ ...formData, club: e.target.value })
              }
              placeholder="Contoh: Denpasar Tennis Club"
              className={inputClass}
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className={labelClass}>Alamat Tempat Tinggal</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Jl. Merdeka No. 10, Denpasar"
              className={inputClass}
            />
          </div>

          {/* Photo */}
          <div>
            <label className={labelClass}>
              Foto Atlet {editingId && "(Biarkan kosong jika tidak diubah)"}
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
            {editingId ? "Update Data Atlet" : "Tambah Data Atlet"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 w-12 text-center">No</th>
              <th className="px-4 py-3.5">Nama Atlet</th>
              <th className="px-4 py-3.5">Club / Pelatih</th>
              <th className="px-4 py-3.5 text-center">Kategori</th>
              <th className="px-4 py-3.5 text-center">Gender</th>
              <th className="px-4 py-3.5 text-center w-20">Foto</th>
              <th className="px-4 py-3.5 text-center w-36">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.map((a, i) => (
              <tr
                key={a.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-4 py-3 text-center font-semibold text-slate-400">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-slate-800 block">
                    {a.name}
                  </span>
                  {a.phoneNumber && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {a.phoneNumber}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium">
                  {a.club || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                    {a.kelompokUmur?.nama || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                      a.gender === "male"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-pink-50 text-pink-700 border border-pink-200/70"
                    }`}
                  >
                    {a.gender === "male" ? "Laki-laki" : "Perempuan"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {a.photo ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(a.photo)}
                      className="group/img relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
                      title="Lihat Foto"
                    >
                      <img
                        src={a.photo}
                        alt={a.name}
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
                      onClick={() => openForm(a)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                      title="Edit Data Atlet"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                      title="Hapus Data Atlet"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPDF(a)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200/60 transition-all active:scale-95"
                      title="Cetak Kartu Atlet (PDF)"
                    >
                      <FileDown size={15} />
                    </button>
                    {a.photo && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(a.photo)}
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

            {athleteList.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 px-4 text-slate-400 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                      <Award size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Belum ada data atlet terdaftar.
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
              alt="Foto Atlet"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* HIDDEN ATHLETE CARD TEMPLATE FOR PDF */}
      {selectedAthlete && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div
            id="athlete-card-pdf"
            style={{
              width: "300px",
              padding: "16px",
              background: "#ffffff",
              color: "#000000",
              fontFamily: "Arial, sans-serif",
              border: "2px solid #000",
              borderRadius: "10px",
            }}
          >
            {/* FOTO */}
            <div
              style={{
                height: "250px",
                background: "#f3f4f6",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              {selectedAthlete.photo ? (
                <img
                  src={selectedAthlete.photo}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  alt={selectedAthlete.name}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Tidak ada foto
                </div>
              )}
            </div>

            {/* INFO */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                {selectedAthlete.name}
              </div>
              <div style={{ fontSize: "12px", marginBottom: "6px" }}>
                {selectedAthlete.kelompokUmur?.nama}
              </div>
              <div style={{ fontSize: "12px" }}>
                Gender: {selectedAthlete.gender}
              </div>
              <div style={{ fontSize: "12px" }}>
                Club: {selectedAthlete.club || "-"}
              </div>
              <div style={{ fontSize: "12px" }}>
                No Telp: {selectedAthlete.phoneNumber || "-"}
              </div>

              <div
                style={{
                  fontSize: "10px",
                  marginTop: "10px",
                  color: "#888",
                }}
              >
                PELTI DENPASAR
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus data atlet "${confirmDelete.name}"? Data yang sudah dihapus tidak bisa dikembalikan.`}
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
