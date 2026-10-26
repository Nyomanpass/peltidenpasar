import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";
import AlertMessage from "../../components/AlertMessage";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  KeyRound,
  Save,
  ShieldCheck,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function Profile() {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // UPDATE PROFILE
  const updateProfile = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsUpdatingProfile(true);

    try {
      const res = await api.put("/auth/profile", { name, email });
      setSuccess(res.data?.message || "Profil berhasil diperbarui");
    } catch (err) {
      setError(
        err.response?.data?.message || "Terjadi kesalahan saat memperbarui profil"
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // CHANGE PASSWORD
  const changePassword = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess(res.data?.message || "Password berhasil diubah");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Terjadi kesalahan saat mengubah password"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";
  const labelClass =
    "text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="font-sans min-h-screen pb-16 space-y-6">
      {/* ALERT MESSAGES */}
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

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kelola data akun administrator dan keamanan kata sandi Anda
          </p>
        </div>
      </div>

      {/* HERO PROFILE CARD */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-sm shrink-0 border border-amber-300/40">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {user?.name || "Administrator"}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200/80">
                  <ShieldCheck size={12} /> {user?.role || "Admin"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <CheckCircle2 size={12} /> Aktif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                {user?.email || "admin@peltidenpasar.com"}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-1 text-xs text-slate-400 font-medium">
            <span>Tingkat Akses</span>
            <span className="font-bold text-slate-700">Administrator Penuh</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID FOR FORMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= 1. INFORMASI PROFIL ================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Informasi Profil
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Perbarui nama lengkap dan email akun administrator
              </p>
            </div>
          </div>

          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <label className={labelClass}>
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@peltidenpasar.com"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-500 font-medium">
              <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <span>
                Email ini digunakan untuk login ke portal admin dan menerima pemberitahuan sistem.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={14} />
                {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= 2. KEAMANAN & GANTI PASSWORD ================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Keamanan Kata Sandi
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Ganti password lama dengan password baru yang lebih aman
              </p>
            </div>
          </div>

          <form onSubmit={changePassword} className="space-y-4">
            {/* Password Lama */}
            <div>
              <label className={labelClass}>
                Password Lama <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showOldPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className={`${inputClass} pl-10 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showOldPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label className={labelClass}>
                Password Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className={`${inputClass} pl-10 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showNewPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div>
              <label className={labelClass}>
                Konfirmasi Password Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className={`${inputClass} pl-10 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-500 font-medium">
              <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <span>
                Disarankan menggunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk keamanan maksimal.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <KeyRound size={14} />
                {isChangingPassword ? "Memproses..." : "Perbarui Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}