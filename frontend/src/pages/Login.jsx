// src/pages/Login.jsx
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 const submit = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const user = await login(email, password);

    // 🔥 Ambil semua tournament
    const res = await api.get("/tournaments");
    const tournaments = res.data;

    let selectedTournament = null;

    if (tournaments.length > 0) {
      const activeTournaments = tournaments.filter(
        (t) => t.status === "aktif"
      );

      if (activeTournaments.length > 0) {
        // Ambil berdasarkan createdAt terbaru (lebih aman dari ID)
        selectedTournament = activeTournaments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
      }
    }

    // 🔥 Simpan tournament kalau ada
    if (selectedTournament) {
      localStorage.setItem(
        "selectedTournament",
        selectedTournament.id
      );
      localStorage.setItem(
        "selectedTournamentName",
        selectedTournament.name
      );
    } else {
      localStorage.removeItem("selectedTournament");
      localStorage.removeItem("selectedTournamentName");
    }

    const roleRoutes = {
      admin: "/admin/peserta",
      wasit: "/wasit/peserta",
      panitia: "/panitia/peserta",
    };

    nav(roleRoutes[user.role] || "/");

  } catch (err) {
    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Terjadi kesalahan, coba lagi");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-[420px]">

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
              Masuk ke Akun
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Silakan masukkan email dan password Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-rose-50 border border-rose-200/60 rounded-xl">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
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
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-xl shadow-xs transition-all disabled:opacity-70 disabled:cursor-wait mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link daftar */}
        <p className="text-center text-xs text-slate-400 font-medium mt-5">
          Belum memiliki akun?{" "}
          <Link
            to="/register"
            className="text-amber-600 font-bold hover:text-amber-700 transition-colors"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
