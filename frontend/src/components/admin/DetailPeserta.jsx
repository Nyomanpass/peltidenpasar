import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  X,
  Bell,
  XCircle,
  Send,
  Pencil,
  IdCard,
  Trophy,
  Clock,
  ExternalLink,
  Maximize2,
  Building2,
  Award,
  Eye,
  Receipt,
  UploadCloud,
} from "lucide-react";
import AlertMessage from "../AlertMessage";

export default function DetailPeserta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null); // { url, title } or null
  const [pendingCount, setPendingCount] = useState(0);

  // State untuk fitur Tolak
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");

  // State untuk fitur Edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newFotoKartu, setNewFotoKartu] = useState(null);
  const [newBuktiBayar, setNewBuktiBayar] = useState(null);
  const [previewFotoKartu, setPreviewFotoKartu] = useState(null);
  const [previewBuktiBayar, setPreviewBuktiBayar] = useState(null);
  const [kelompokUmurList, setKelompokUmurList] = useState([]);

  // State notifikasi
  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPesertaDetail();
    fetchPendingTotal();
    fetchKelompokUmur();
  }, [id]);

  useEffect(() => {
    if (peserta) {
      setFormData({
        namaLengkap: peserta.namaLengkap || "",
        nik: peserta.nik || "",
        nomorWhatsapp: peserta.nomorWhatsapp || "",
        tanggalLahir: peserta.tanggalLahir || "",
        kelompokUmurId: peserta.kelompokUmurId || "",
        asalSekolah: peserta.asalSekolah || "",
      });
      setPreviewFotoKartu(peserta.fotoKartu ? `${BASE_URL}/${peserta.fotoKartu}` : null);
      setPreviewBuktiBayar(peserta.buktiBayar ? `${BASE_URL}/${peserta.buktiBayar}` : null);
    }
  }, [peserta]);

  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmurList(res.data);
    } catch (err) {
      console.error("Gagal ambil kelompok umur", err);
    }
  };

  const fetchPesertaDetail = async () => {
    try {
      const res = await api.get(`/peserta/${id}`);
      setPeserta(res.data);
    } catch (err) {
      setError("Gagal mengambil data peserta.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTotal = async () => {
    try {
      const res = await api.get("/peserta?status=pending");
      setPendingCount(res.data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const form = new FormData();
      form.append("namaLengkap", formData.namaLengkap);
      form.append("nik", formData.nik);
      form.append("nomorWhatsapp", formData.nomorWhatsapp);
      form.append("tanggalLahir", formData.tanggalLahir);
      form.append("kelompokUmurId", formData.kelompokUmurId);
      if (formData.asalSekolah !== undefined) {
        form.append("asalSekolah", formData.asalSekolah);
      }

      if (newFotoKartu) {
        form.append("fotoKartu", newFotoKartu);
      }

      if (newBuktiBayar) {
        form.append("buktiBayar", newBuktiBayar);
      }

      await api.put(`/peserta/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Data peserta berhasil diperbarui ✅");
      setIsEditing(false);
      fetchPesertaDetail();
    } catch (err) {
      console.error(err);
      setErrorAlert("Gagal update data peserta.");
    }
  };

  const handleVerify = async () => {
    try {
      await api.put(`/peserta/${id}/verify`, { status: "verified" });
      setPeserta((p) => ({ ...p, status: "verified" }));
      fetchPendingTotal();
      setSuccess(`Peserta ${peserta.namaLengkap} berhasil diverifikasi!`);
      setShowVerifyConfirm(false);
    } catch (err) {
      console.error(err);
      setErrorAlert("Gagal memverifikasi peserta.");
      setShowVerifyConfirm(false);
    }
  };

  // Handler Tolak
  const handleReject = async () => {
    if (!rejectMessage.trim()) {
      setErrorAlert("Mohon masukkan alasan penolakan.");
      return;
    }

    try {
      await api.put(`/peserta/${id}/verify`, {
        status: "rejected",
        alasan: rejectMessage,
      });

      let phone = peserta.nomorWhatsapp;
      if (phone) {
        if (phone.startsWith("0")) phone = "62" + phone.slice(1);
        const text = `Halo *${peserta.namaLengkap}*,\n\nMohon maaf, pendaftaran Anda di PELTI Denpasar *DITOLAK* dengan alasan:\n\n_"${rejectMessage}"_\n\nSilakan melakukan pendaftaran ulang dengan data yang benar. Terima kasih.`;
        window.open(
          `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
          "_blank"
        );
      }

      setSuccess(`Pendaftaran ${peserta.namaLengkap} berhasil ditolak.`);
      navigate(-1);
    } catch (err) {
      console.error(err);
      setErrorAlert("Gagal memproses penolakan.");
    }
  };

  // Handler Chat WA
  const handleContactWA = () => {
    let phone = peserta?.nomorWhatsapp;
    if (!phone) return;
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    const text = `Halo *${peserta.namaLengkap}*, kami dari Panitia PELTI Denpasar terkait data pendaftaran turnamen ${peserta.tournament?.name || ""}...`;
    window.open(
      `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getAge = (dateString) => {
    if (!dateString) return null;
    try {
      const birth = new Date(dateString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? `${age} Tahun` : null;
    } catch (e) {
      return null;
    }
  };

  const getInitials = (name) => {
    if (!name) return "P";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Memuat data peserta...
        </p>
      </div>
    );
  }

  if (error || !peserta) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <XCircle size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Data Tidak Ditemukan</h2>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          {error || "Peserta yang Anda cari tidak tersedia atau telah dihapus."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* --- NOTIFIKASI TOAST --- */}
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {errorAlert && (
        <AlertMessage
          type="error"
          message={errorAlert}
          onClose={() => setErrorAlert("")}
        />
      )}

      {/* --- TOP BAR NAVIGATION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tombol Kembali + Info Posisi */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Manajemen Peserta / Detail Atlet
          </span>
        </div>

        {/* Pending Badge Alert */}
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold shadow-xs">
            <Bell size={13} className="text-amber-600 animate-pulse" />
            <span>{pendingCount} Peserta Menunggu Verifikasi</span>
          </div>
        )}
      </div>

      {/* --- HERO PROFILE CARD --- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Top Accent Stripe by Status */}
        <div
          className={`h-1.5 w-full ${
            peserta.status === "verified"
              ? "bg-emerald-500"
              : peserta.status === "rejected"
              ? "bg-rose-500"
              : "bg-amber-500"
          }`}
        />

        <div className="p-5 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* Avatar & Identitas Utama */}
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xs shrink-0 border border-amber-400/40">
                {getInitials(peserta.namaLengkap)}
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Badge Status */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      peserta.status === "verified"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        : peserta.status === "rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                        : "bg-amber-50 text-amber-700 border border-amber-200/80"
                    }`}
                  >
                    {peserta.status === "verified" && <CheckCircle size={13} />}
                    {peserta.status === "rejected" && <XCircle size={13} />}
                    {peserta.status === "pending" && <Clock size={13} />}
                    <span>
                      {peserta.status === "verified"
                        ? "Terverifikasi"
                        : peserta.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu Verifikasi"}
                    </span>
                  </span>

                  {/* Badge Turnamen */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 truncate max-w-[220px] sm:max-w-none">
                    <Trophy size={13} className="text-amber-500 shrink-0" />
                    <span className="truncate">{peserta.tournament?.name || "Turnamen"}</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                  {peserta.namaLengkap}
                </h1>
              </div>
            </div>

            {/* Action Buttons Kanan */}
            <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
                title="Edit Data Peserta"
              >
                <Pencil size={14} />
                <span>Edit Data</span>
              </button>
            </div>
          </div>

          {/* Banner Alasan jika Rejected */}
          {peserta.status === "rejected" && peserta.alasan && (
            <div className="mt-5 p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-800">
              <div className="flex items-start gap-2.5">
                <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Alasan Penolakan:
                  </p>
                  <p className="text-sm font-medium mt-0.5 text-rose-700">
                    "{peserta.alasan}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section Aksi Verifikasi / Tolak jika status Pending */}
          {peserta.status === "pending" && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              {!isRejecting ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/70 to-slate-50 border border-amber-200/60">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Tindakan Verifikasi Pendaftaran
                    </p>
                    <p className="text-xs text-slate-500">
                      Periksa keabsahan bukti bayar dan kartu identitas sebelum memverifikasi atlet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 active:scale-95 text-rose-600 hover:text-rose-700 font-bold text-xs uppercase tracking-wider border border-rose-200 shadow-xs transition-all"
                    >
                      <XCircle size={15} />
                      <span>Tolak</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVerifyConfirm(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
                    >
                      <CheckCircle size={15} />
                      <span>Verifikasi</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-xl bg-rose-50/80 border border-rose-200 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-rose-900">
                    <XCircle size={17} className="text-rose-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Alasan Penolakan Pendaftaran
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mb-3">
                    Masukkan alasan penolakan. Keterangan ini akan langsung dikirimkan ke nomor WhatsApp atlet terkait.
                  </p>
                  <textarea
                    className="w-full p-3.5 bg-white border border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all"
                    placeholder="Contoh: Bukti transfer tidak valid / Foto kartu identitas buram..."
                    rows="3"
                    value={rejectMessage}
                    onChange={(e) => setRejectMessage(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-xs transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
                    >
                      <Send size={14} />
                      <span>Kirim Alasan & Chat WA</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- GRID 2 KOLOM: DATA PRIBADI & DOKUMEN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* KOLOM KIRI: DATA PRIBADI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                <User size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Data Pribadi Atlet
                </h2>
                <p className="text-[11px] text-slate-400">Informasi identitas dan kontak</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DataTile
              label="Nomor Induk Kependudukan (NIK)"
              value={peserta.nik || "-"}
              icon={<IdCard size={15} />}
            />
            <DataTile
              label="Nomor WhatsApp"
              value={peserta.nomorWhatsapp || "-"}
              icon={<Phone size={15} />}
              action={
                peserta.nomorWhatsapp ? (
                  <button
                    type="button"
                    onClick={handleContactWA}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] hover:underline"
                  >
                    Chat
                  </button>
                ) : null
              }
            />
            <DataTile
              label="Tanggal Lahir"
              value={formatDate(peserta.tanggalLahir)}
              subValue={getAge(peserta.tanggalLahir)}
              icon={<Calendar size={15} />}
            />
            <DataTile
              label="Kelompok Umur"
              value={peserta.kelompokUmur?.nama || "Umum"}
              icon={<Award size={15} />}
            />
            <DataTile
              label="Asal Sekolah"
              value={peserta.asalSekolah || "-"}
              icon={<Building2 size={15} />}
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* KOLOM KANAN: DOKUMEN VERIFIKASI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                <FileText size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Dokumen Verifikasi
                </h2>
                <p className="text-[11px] text-slate-400">Berkas identitas dan pembayaran</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <DocumentCard
              title="Bukti Pembayaran"
              path={peserta.buktiBayar}
              baseUrl={BASE_URL}
              icon={<Receipt size={16} />}
              onPreview={(url, title) => setModalImage({ url, title })}
            />
            <DocumentCard
              title="Kartu Identitas (KK/KTP)"
              path={peserta.fotoKartu}
              baseUrl={BASE_URL}
              icon={<IdCard size={16} />}
              onPreview={(url, title) => setModalImage({ url, title })}
            />
          </div>
        </div>
      </div>

      {/* --- MODAL POPUP PREVIEW GAMBAR --- */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {typeof modalImage === "object" ? modalImage.title : "Preview Dokumen"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={typeof modalImage === "object" ? modalImage.url : modalImage}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all text-xs font-semibold inline-flex items-center gap-1"
                  title="Buka di tab baru"
                >
                  <ExternalLink size={15} />
                  <span className="hidden sm:inline">Buka Tab Baru</span>
                </a>
                <button
                  type="button"
                  onClick={() => setModalImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 bg-slate-950/5 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={typeof modalImage === "object" ? modalImage.url : modalImage}
                alt="Dokumen"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT DATA PESERTA --- */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white shadow-2xl rounded-2xl border border-slate-200/80 w-full max-w-2xl my-8 relative overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                  <Pencil size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Edit Data Peserta
                  </h2>
                  <p className="text-xs text-slate-500">Perbarui informasi dan dokumen atlet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.namaLengkap}
                    onChange={(e) =>
                      setFormData({ ...formData, namaLengkap: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs"
                    placeholder="Nama lengkap atlet..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    NIK (16 Digit)
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    inputMode="numeric"
                    maxLength={16}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, nik: onlyDigits });
                    }}
                    placeholder="16 digit NIK"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs"
                  />
                  {formData.nik && formData.nik.length !== 16 && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      NIK harus 16 digit ({formData.nik.length}/16)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.nomorWhatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, nomorWhatsapp: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalLahir: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kelompok Umur
                  </label>
                  <select
                    value={formData.kelompokUmurId}
                    onChange={(e) =>
                      setFormData({ ...formData, kelompokUmurId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs"
                  >
                    <option value="">-- Pilih Kelompok Umur --</option>
                    {kelompokUmurList.map((ku) => (
                      <option key={ku.id} value={ku.id}>
                        {ku.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Asal Sekolah / Klub
                  </label>
                  <input
                    type="text"
                    value={formData.asalSekolah}
                    onChange={(e) =>
                      setFormData({ ...formData, asalSekolah: e.target.value })
                    }
                    placeholder="Nama sekolah atau klub tenis..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Upload Foto Kartu & Bukti Bayar */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Pembaruan Berkas Dokumen (Opsional)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Foto Kartu */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700">
                      Kartu Identitas (KK/KTP)
                    </span>
                    {previewFotoKartu ? (
                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={previewFotoKartu}
                          alt="Kartu Identitas"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                        Belum ada file
                      </div>
                    )}
                    <label className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs transition-all">
                      <UploadCloud size={14} />
                      <span>Ganti Kartu Identitas</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewFotoKartu(e.target.files[0]);
                            setPreviewFotoKartu(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Bukti Bayar */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700">
                      Bukti Pembayaran
                    </span>
                    {previewBuktiBayar ? (
                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={previewBuktiBayar}
                          alt="Bukti Bayar"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                        Belum ada file
                      </div>
                    )}
                    <label className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs transition-all">
                      <UploadCloud size={14} />
                      <span>Ganti Bukti Bayar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewBuktiBayar(e.target.files[0]);
                            setPreviewBuktiBayar(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI VERIFIKASI --- */}
      {showVerifyConfirm && (
        <AlertMessage
          type="warning"
          message={`Pastikan data dan dokumen ${peserta.namaLengkap} sudah sesuai. Setelah diverifikasi, peserta akan masuk ke daftar siap tanding.`}
          onClose={() => setShowVerifyConfirm(false)}
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
            <button
              type="button"
              onClick={() => setShowVerifyConfirm(false)}
              className="flex-1 order-2 sm:order-1 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="flex-1 order-1 sm:order-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
            >
              Ya, Verifikasi
            </button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}

// Komponen Sub-Tile Data Pribadi
function DataTile({ label, value, subValue, icon, action, className = "" }) {
  return (
    <div
      className={`p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3 ${className}`}
    >
      <div className="p-2 rounded-lg bg-white border border-slate-200 text-amber-600 shadow-2xs shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          {label}
        </p>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs sm:text-sm font-bold text-slate-800 break-words">
            {value}
          </p>
          {action}
        </div>
        {subValue && (
          <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

// Komponen Kartu Dokumen Modern dengan Thumbnail Preview
function DocumentCard({ title, path, baseUrl, icon, onPreview }) {
  const isExist = Boolean(path);
  const fullUrl = isExist ? `${baseUrl}/${path}` : null;

  return (
    <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50 flex flex-col justify-between gap-3 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
            {icon}
          </div>
          <span className="text-xs font-bold text-slate-800 truncate">{title}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            isExist
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-400 border border-slate-200"
          }`}
        >
          {isExist ? "Tersedia" : "Belum Ada"}
        </span>
      </div>

      {/* Thumbnail preview */}
      {isExist ? (
        <div
          onClick={() => onPreview(fullUrl, title)}
          className="relative group cursor-pointer aspect-video rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center shadow-2xs"
        >
          <img
            src={fullUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-[2px]">
            <Eye size={15} />
            <span>Perbesar</span>
          </div>
        </div>
      ) : (
        <div className="aspect-video rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 text-xs">
          <FileText size={22} className="text-slate-300 mb-1" />
          <span>Tidak ada berkas</span>
        </div>
      )}

      {isExist && (
        <button
          type="button"
          onClick={() => onPreview(fullUrl, title)}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
        >
          <Maximize2 size={13} />
          <span>Lihat Dokumen</span>
        </button>
      )}
    </div>
  );
}