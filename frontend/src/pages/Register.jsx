// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      setSuccess(res.data.message || "Akun berhasil didaftarkan!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Gagal terhubung ke server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="PELTI Denpasar"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            PELTI DENPASAR
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Persatuan Lawn Tenis Indonesia
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Buat Akun Baru
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Lengkapi data di bawah untuk melakukan pendaftaran
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-rose-50 border border-rose-200/60 rounded-xl">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-emerald-50 border border-emerald-200/60 rounded-xl">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-bold text-emerald-700">{success}</p>
            </div>
          )}

          {/* Form Register */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAMA LENGKAP */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="contoh@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition-all disabled:opacity-70 disabled:cursor-wait mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Daftar Akun</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link Login */}
        <p className="text-center text-xs text-slate-400 font-medium mt-5">
          Sudah memiliki akun?{" "}
          <Link
            to="/login"
            className="text-amber-600 font-bold hover:text-amber-700 transition-colors"
          >
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
