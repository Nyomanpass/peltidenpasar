import React, { useState, useMemo } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  UserCheck,
  Eye,
  Send,
  Phone,
  Search,
  Building2,
  FileText,
  CreditCard,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage";

export default function VerificationDrawer({
  isOpen,
  onClose,
  pendingUsers = [],
  onVerify,
  onReject,
  onViewDetail,
  role = "admin",
}) {
  const navigate = useNavigate();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [confirmVerifyData, setConfirmVerifyData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [warning, setWarning] = useState("");

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectMessage("");
  };

  // Preset alasan penolakan cepat
  const quickReasons = [
    "Bukti transfer tidak valid / belum masuk",
    "Foto kartu identitas (KTP/KIA/Akta) buram",
    "Kategori kelompok umur tidak sesuai",
    "Data nama atau identitas tidak sesuai dokumen",
  ];

  // Filter pencarian
  const filteredUsers = useMemo(() => {
    if (!pendingUsers || !Array.isArray(pendingUsers)) return [];
    if (!searchTerm.trim()) return pendingUsers;
    const term = searchTerm.toLowerCase();
    return pendingUsers.filter(
      (p) =>
        p.namaLengkap?.toLowerCase().includes(term) ||
        p.nomorWhatsapp?.toLowerCase().includes(term) ||
        p.kelompokUmur?.nama?.toLowerCase().includes(term) ||
        p.asalSekolah?.toLowerCase().includes(term)
    );
  }, [pendingUsers, searchTerm]);

  return (
    <>
      {/* Toast Notifikasi */}
      {success && (
        <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />
      )}
      {errorAlert && (
        <AlertMessage type="error" message={errorAlert} onClose={() => setErrorAlert("")} />
      )}
      {warning && (
        <AlertMessage type="warning" message={warning} onClose={() => setWarning("")} />
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[99] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer Shell */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-[440px] max-w-full bg-slate-50 h-full shadow-2xl z-[100] flex flex-col border-l border-slate-200/90 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* --- HEADER DRAWER --- */}
        <div className="p-5 bg-white border-b border-slate-200/80 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shadow-2xs shrink-0">
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Verifikasi Peserta
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tinjau dan konfirmasi pendaftaran peserta turnamen
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
              title="Tutup Panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Search Input jika ada peserta */}
          {pendingUsers && pendingUsers.length > 0 && (
            <div className="mt-3.5 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Cari nama, kelompok umur, atau nomor WA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
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

        {/* --- LIST PESERTA --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((p) => {
              const isRejecting = rejectingId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 space-y-3 group"
                >
                  {/* Top Bar: Avatar, Info, Detail Link */}
                  <div className="flex items-start gap-3">
                    {/* Avatar Initials */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs ring-2 ring-amber-100 shrink-0">
                      {getInitials(p.namaLengkap)}
                    </div>

                    {/* Participant Main Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-amber-600 transition-colors">
                          {p.namaLengkap}
                        </h3>
                      </div>

                      {/* Meta Tags (Kelompok Umur & Asal Sekolah) */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {p.kelompokUmur?.nama && (
                          <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                            {p.kelompokUmur.nama}
                          </span>
                        )}
                        {p.asalSekolah && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                            <Building2 size={10} className="shrink-0 text-slate-400" />
                            <span className="truncate">{p.asalSekolah}</span>
                          </span>
                        )}
                      </div>

                      {/* Nomor WhatsApp */}
                      {p.nomorWhatsapp && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                          <Phone size={11} className="text-slate-400" />
                          <span>{p.nomorWhatsapp}</span>
                        </div>
                      )}
                    </div>

                    {/* Tombol Lihat Detail Peserta */}
                    <button
                      onClick={() => onViewDetail(p.id)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200/60 transition-all active:scale-95 shrink-0"
                      title="Lihat Detail Lengkap"
                    >
                      <Eye size={17} />
                    </button>
                  </div>

                  {/* Kelengkapan Berkas Indikator */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Dokumen:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          p.fotoKartu
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <FileText size={10} />
                        {p.fotoKartu ? "ID Ada" : "Tanpa ID"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          p.buktiBayar
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <CreditCard size={10} />
                        {p.buktiBayar ? "Bukti Bayar Ada" : "Tanpa Bukti"}
                      </span>
                    </div>
                  </div>

                  {/* REJECTION FORM (JIKA SEDANG DITOLAK) */}
                  {isRejecting ? (
                    <div className="mt-2 p-3.5 bg-rose-50/80 rounded-xl border border-rose-200/80 animate-in fade-in slide-in-from-top-2 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle size={12} /> Alasan Penolakan
                        </label>
                        <span className="text-[10px] text-rose-500 font-semibold">
                          Otomatis via WA
                        </span>
                      </div>

                      {/* Chip Preset Alasan Cepat */}
                      <div className="flex flex-wrap gap-1.5">
                        {quickReasons.map((reason, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRejectMessage(reason)}
                            className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-all text-left"
                          >
                            + {reason}
                          </button>
                        ))}
                      </div>

                      {/* Textarea Alasan */}
                      <textarea
                        className="w-full p-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="Tulis alasan penolakan untuk peserta ini..."
                        rows="3"
                        value={rejectMessage}
                        onChange={(e) => setRejectMessage(e.target.value)}
                      />

                      {/* Action buttons penolakan */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={async () => {
                            if (!rejectMessage.trim()) {
                              setErrorAlert("Mohon masukkan alasan penolakan terlebih dahulu.");
                              return;
                            }
                            setIsSubmitting(true);
                            try {
                              await onReject(p.id, rejectMessage);
                              setSuccess(`Pendaftaran ${p.namaLengkap} berhasil ditolak.`);
                              cancelReject();
                            } catch {
                              setErrorAlert(`Gagal menolak ${p.namaLengkap}. Silakan coba lagi.`);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white py-2 px-3 rounded-xl font-bold text-xs shadow-xs hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Send size={13} />
                          <span>Tolak & Buka WA</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelReject}
                          className="px-3.5 py-2 bg-white text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs border border-slate-200 transition-all active:scale-95"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ACTION BUTTONS (VERIFIKASI & TOLAK) */
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmVerifyData(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all"
                      >
                        <CheckCircle size={14} />
                        <span>Verifikasi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(p.id);
                          setRejectMessage("");
                        }}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200/70 font-bold text-xs transition-all"
                      >
                        <XCircle size={14} />
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs my-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                <UserCheck size={28} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {searchTerm ? "Tidak Ditemukan" : "Semua Peserta Terverifikasi"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {searchTerm
                  ? `Tidak ada peserta yang cocok dengan kata kunci "${searchTerm}".`
                  : "Tidak ada data pendaftaran atlet yang perlu diverifikasi saat ini."}
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

        {/* --- FOOTER DRAWER --- */}
        <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Total: <span className="font-extrabold text-slate-800">{pendingUsers?.length || 0}</span> pending
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/${role}/peserta`);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 transition-all active:scale-95"
          >
            <span>Buka Manajemen Peserta</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* --- MODAL KONFIRMASI VERIFIKASI MODERN --- */}
      {confirmVerifyData && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Top Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <UserCheck size={28} />
            </div>

            <div className="text-center">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Verifikasi Peserta Ini?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Pastikan data & kelengkapan atlet sudah sesuai. Setelah diverifikasi, peserta akan masuk ke daftar siap tanding turnamen.
              </p>
            </div>

            {/* Athlete Preview Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {getInitials(confirmVerifyData.namaLengkap)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {confirmVerifyData.namaLengkap}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                  {confirmVerifyData.kelompokUmur?.nama && (
                    <span className="font-semibold text-slate-600">
                      {confirmVerifyData.kelompokUmur.nama}
                    </span>
                  )}
                  {confirmVerifyData.nomorWhatsapp && (
                    <span>• {confirmVerifyData.nomorWhatsapp}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmVerifyData(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onVerify(confirmVerifyData.id);
                    setSuccess(`${confirmVerifyData.namaLengkap} berhasil diverifikasi!`);
                    setConfirmVerifyData(null);
                  } catch {
                    setErrorAlert("Gagal memverifikasi peserta.");
                    setConfirmVerifyData(null);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle size={15} />
                <span>Ya, Verifikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}