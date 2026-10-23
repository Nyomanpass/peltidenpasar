import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Eye,
  PlusCircle,
  Layout,
  User,
  Users,
  Users2,
  ChevronRight,
  Trophy,
  GitFork,
  Filter,
} from "lucide-react";
import AlertMessage from "../components/AlertMessage";
import api from "../api";

export default function BaganPage({ onSelectBagan }) {
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("single");
  const [baganList, setBaganList] = useState([]);
  const [filterKategori, setFilterKategori] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    baganId: null,
    baganName: "",
  });

  const role = localStorage.getItem("role");
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");
  const isExactMatch = confirmInput === confirmDelete.baganName;
  const navigate = useNavigate();
  const isSelectorMode = !!onSelectBagan;

  const isAdmin = role === "admin" || role === "panitia";

  const fetchBagan = async () => {
    try {
      const newTournamentId = localStorage.getItem("selectedTournament");
      const res = await api.get("/bagan", {
        params: { tournamentId: newTournamentId },
      });
      setBaganList(res.data);
    } catch (err) {
      console.error("Gagal fetch bagan:", err);
    }
  };

  const fetchKelompokUmur = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokUmurList(res.data);
    } catch (err) {
      console.error("Gagal fetch kelompok umur:", err);
    }
  };

  useEffect(() => {
    const reloadBagan = () => {
      fetchBagan();
      fetchKelompokUmur();
    };
    window.addEventListener("tournament-changed", reloadBagan);
    return () => window.removeEventListener("tournament-changed", reloadBagan);
  }, []);

  useEffect(() => {
    fetchKelompokUmur();
    fetchBagan();
  }, []);

  const handleCreateBagan = async () => {
    if (!selectedKelompok) {
      setError("Pilih kelompok umur terlebih dahulu.");
      return;
    }
    const tournamentId = localStorage.getItem("selectedTournament");
    try {
      await api.post("/bagan", {
        kelompokUmurId: selectedKelompok,
        tournamentId,
        kategori: selectedKategori,
      });
      setSuccess("Bagan berhasil dibuat!");
      setSelectedKelompok("");
      fetchBagan();
    } catch (err) {
      console.error("Gagal membuat bagan:", err);
      setError("Gagal membuat bagan. Pastikan data peserta sudah ada.");
    }
  };

  const handleDeleteBagan = (bagan) => {
    setConfirmDelete({
      show: true,
      baganId: bagan.id,
      baganName: bagan.nama,
    });
  };

  const confirmDeleteBagan = async () => {
    try {
      await api.delete(`/bagan/${confirmDelete.baganId}`);
      setSuccess("Bagan berhasil dihapus!");
      fetchBagan();
    } catch (err) {
      console.error("Gagal menghapus bagan:", err);
      setError("Gagal menghapus bagan.");
    } finally {
      setConfirmDelete({ show: false, baganId: null, baganName: "" });
      setConfirmInput("");
    }
  };

  const handleViewDetail = (baganId) => {
    if (isSelectorMode) {
      onSelectBagan(baganId);
    } else {
      navigate(`/${role}/bagan-view/${baganId}`);
    }
  };

  // Derived data
  const totalBagan = baganList.length;
  const filteredData = baganList
    .filter((b) => filterKategori === "all" || b.kategori === filterKategori)
    .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId);

  const singleCount = baganList.filter((b) => b.kategori === "single").length;
  const doubleCount = baganList.filter((b) => b.kategori === "double").length;

  return (
    <div className="w-full space-y-4">
      {/* --- NOTIFIKASI TOAST --- */}
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

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        {/* Sisi Kiri */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Badge Turnamen: mobile only */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 sm:hidden">
              <Trophy size={13} className="text-amber-500" />
              <span className="truncate max-w-[220px]">
                {selectedTournamentName || "Belum Memilih Turnamen"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              <GitFork size={13} className="text-slate-500" />
              <span>{totalBagan} Bagan Dibuat</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bagan Pertandingan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Kelola dan pantau struktur bagan turnamen per kategori.
          </p>
        </div>

        {/* Tab Filter Kanan */}
        <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
          {[
            { key: "all", label: "Semua", icon: null },
            { key: "single", label: "Single", icon: <User size={13} /> },
            { key: "double", label: "Double", icon: <Users2 size={13} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterKategori(key)}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                filterKategori === key
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- FORM BUAT BAGAN (Admin/Panitia) --- */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Select Kategori */}
          <select
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium text-slate-700 transition-all shadow-xs"
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value);
              setSelectedKelompok("");
            }}
          >
            <option value="single">Single (Perseorangan)</option>
            <option value="double">Double (Ganda)</option>
          </select>

          {/* Select Kelompok Umur */}
          <select
            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl outline-none text-xs sm:text-sm font-medium text-slate-700 transition-all shadow-xs"
            value={selectedKelompok}
            onChange={(e) => setSelectedKelompok(e.target.value)}
          >
            <option value="">Pilih Kelompok Umur</option>
            {kelompokUmurList
              .filter((k) => {
                const sudahAda = baganList.some(
                  (b) =>
                    b.kelompokUmurId === k.id &&
                    b.kategori === selectedKategori
                );
                return !sudahAda;
              })
              .map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
          </select>

          {/* Tombol Buat */}
          <button
            type="button"
            onClick={handleCreateBagan}
            disabled={!selectedKelompok}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <span>Buat Bagan</span>
          </button>
        </div>
      )}

      {/* --- DAFTAR BAGAN --- */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
            <Layout size={26} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Belum Ada Bagan
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            {filterKategori === "all"
              ? "Belum ada bagan yang dibuat untuk turnamen ini."
              : `Belum ada bagan kategori ${filterKategori === "single" ? "Single" : "Double"} untuk turnamen ini.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredData.map((bagan) => (
            <div
              key={bagan.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300/60 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => handleViewDetail(bagan.id)}
            >
              <div className="flex items-center justify-between p-4 sm:p-5">
                {/* Kiri: Icon + Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar Bagan */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                      bagan.kategori === "double"
                        ? "bg-gradient-to-br from-sky-500 to-blue-600 border-sky-400/30"
                        : "bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-400/30"
                    } text-white`}
                  >
                    {bagan.kategori === "double" ? (
                      <Users2 size={18} />
                    ) : (
                      <User size={18} />
                    )}
                  </div>

                  {/* Nama & Detail */}
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                      {bagan.nama}
                    </h2>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users size={11} className="text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {bagan.jumlahPeserta} Peserta
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kanan: Tombol Aksi */}
                <div
                  className="flex items-center gap-2 ml-3 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBagan(bagan)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200/60 transition-all"
                      title="Hapus Bagan"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleViewDetail(bagan.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
                    title="Lihat Bagan"
                  >
                    <Eye size={14} />
                    <span className="hidden sm:inline">Lihat</span>
                  </button>

                  <ChevronRight
                    size={16}
                    className="text-slate-300 sm:hidden"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={
            <div className="space-y-3 text-left w-full">
              <p className="text-sm text-slate-600 text-center">
                Untuk menghapus bagan ini, ketik nama bagan dengan tepat:
              </p>
              <div className="bg-slate-100 px-4 py-2.5 rounded-xl text-center font-black text-sm tracking-wide text-slate-800">
                {confirmDelete.baganName}
              </div>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Ketik nama bagan di sini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-sm font-medium transition-all"
              />
              {confirmInput !== "" && !isExactMatch && (
                <p className="text-xs text-rose-600 font-semibold">
                  Nama tidak cocok. Perhatikan huruf besar, kecil, dan spasi.
                </p>
              )}
            </div>
          }
          onClose={() => {
            setConfirmDelete({ show: false, baganId: null, baganName: "" });
            setConfirmInput("");
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
            <button
              type="button"
              onClick={() => {
                setConfirmDelete({ show: false, baganId: null, baganName: "" });
                setConfirmInput("");
              }}
              className="flex-1 order-2 sm:order-1 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDeleteBagan}
              disabled={!isExactMatch}
              className={`flex-1 order-1 sm:order-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                isExactMatch
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Ya, Hapus
            </button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}
