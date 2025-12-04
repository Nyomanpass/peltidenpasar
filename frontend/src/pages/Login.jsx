// src/pages/Login.jsx
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api"; // Pastikan Anda mengimpor API instance Anda

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Lakukan proses login
      const user = await login(email, password);

      // --- START: LOGIKA SET DEFAULT TOURNAMENT ---
      if (user.role === "admin") {
        try {
          // Ambil semua daftar tournaments
          const res = await api.get('/tournaments');
          const tournaments = res.data;

          if (tournaments.length > 0) {
            // Filter hanya yang berstatus "aktif"
            const activeTournaments = tournaments.filter(t => t.status === "aktif");

            if (activeTournaments.length > 0) {
              // 2. Cari tournament dengan ID terbesar
              const latestTournament = activeTournaments.reduce((prev, current) => 
                (prev.id > current.id) ? prev : current
              );

              // 3. Simpan ID dan Nama ke localStorage
              localStorage.setItem("selectedTournament", latestTournament.id);
              localStorage.setItem("selectedTournamentName", latestTournament.name);

              // Broadcast event agar Sidebar / komponen lain bisa merespon
              window.dispatchEvent(new Event("tournament-changed"));
            } else {
                 // Jika tidak ada yang aktif, bersihkan localstorage agar tidak salah pakai
                 localStorage.removeItem("selectedTournament");
                 localStorage.removeItem("selectedTournamentName");
            }
          }
        } catch (fetchErr) {
          console.error("Gagal mengambil data tournament default:", fetchErr);
          // Biarkan login berlanjut, tetapi tanpa default tournament.
        }
      }
      // --- END: LOGIKA SET DEFAULT TOURNAMENT ---

      // 4. Navigasi
      if (user.role === "admin") nav("/admin/peserta");
      else nav("/wasit");

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Terjadi kesalahan, coba lagi");
      }
    }
  };

  return (
    // ... sisa tampilan Login.jsx tidak berubah
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo dan Judul */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png" // ganti dengan path logo kamu
            alt="Logo"
            className="w-20 h-20 mb-2"
          />
          <h1 className="text-xl font-bold text-black">PELTI DENPASAR</h1>
          <p className="text-sm text-gray-600 -mt-1">
            Persatuan Lawn Tenis Indonesia
          </p>
        </div>

        {/* Subjudul */}
        <p className="text-center text-gray-700 mb-4">
          Silahkan isi email dan password anda
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* Form Login */}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />


          {/* Tombol */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition"
          >
            Log In
          </button>
        </form>

        {/* Link daftar */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Belum memiliki akun?{" "}
          <a href="/register" className="text-yellow-500 font-medium">
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
}