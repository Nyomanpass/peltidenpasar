// File: src/components/admin/Peserta.jsx

import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Link, useLocation } from "react-router-dom";
import {
  Eye,
  Trash2,
  Search,
  ChevronDown,
  User,
  Users2,
  FileSpreadsheet,
  Trophy,
  Phone,
  Calendar,
  Hash,
  X,
  Users,
} from "lucide-react";
import AlertMessage from "../AlertMessage";
import { exportPesertaToExcel } from "../../utils/exportPesertaExcel";

function Peserta({ tournamentId, searchTerm: searchTermFromProps }) {
  const location = useLocation();
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, pesertaId: null });
  const [isExporting, setIsExporting] = useState(false);

  const role = localStorage.getItem("role");
  const currentTournamentName = localStorage.getItem("selectedTournamentName");

  // Logika pencarian gabungan
  const finalSearch = searchTermFromProps !== undefined ? searchTermFromProps : localSearch;
  const basePath = `/${role}`;

  const totalPeserta = kelompokUmur.reduce((total, ku) => {
    return total + (ku.peserta?.length || 0);
  }, 0);

  const isActive = (path) => location.pathname === path;

  const fetchPeserta = useCallback(async () => {
    const idToUse = tournamentId || localStorage.getItem("selectedTournament");
    if (!idToUse) {
      setKelompokUmur([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/admin/peserta/kelompok-umur?tournamentId=${idToUse}`);
      setKelompokUmur(res.data);
    } catch (err) {
      setError("Gagal mengambil data peserta");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchPeserta();

    const handleTournamentChange = () => {
      fetchPeserta();
    };

    window.addEventListener("tournament-changed", handleTournamentChange);

    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, [fetchPeserta]);

  // Handler interaksi
  const toggleGroup = (id) =>
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = (id) => setConfirmDelete({ show: true, pesertaId: id });

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/peserta/${confirmDelete.pesertaId}`);
      setSuccess("Peserta berhasil dihapus");
      fetchPeserta();
    } catch (err) {
      setError("Gagal menghapus peserta");
    } finally {
      setConfirmDelete({ show: false, pesertaId: null });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportPesertaToExcel({
        tournamentId: tournamentId || localStorage.getItem("selectedTournament"),
        tournamentName: currentTournamentName,
        kelompokUmurList: kelompokUmur,
      });
      setSuccess("Data seluruh peserta (Tunggal & Ganda) berhasil diexport");
    } catch {
      setError("Gagal mengexport data peserta");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper render status badge
  const renderStatusBadge = (status) => {
    const isPending = status === "pending";
    const isVerified = status === "verified";
    const isRejected = status === "rejected";

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          isPending
            ? "bg-amber-50 text-amber-700 border border-amber-200"
            : isVerified
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : isRejected
            ? "bg-rose-50 text-rose-700 border border-rose-200"
            : "bg-slate-100 text-slate-700 border border-slate-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isPending
              ? "bg-amber-500"
              : isVerified
              ? "bg-emerald-500"
              : isRejected
              ? "bg-rose-500"
              : "bg-slate-400"
          }`}
        />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-3 border-amber-200 border-t-amber-500 animate-spin" />
          <Trophy size={18} className="absolute text-amber-500" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Memuat data peserta...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* --- PAGE HEADER (tanpa card/box) --- */}
      {searchTermFromProps === undefined && (
        <>
          {/* Baris 1: Badge turnamen (mobile) + Badge jumlah + Judul besar */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Badge Turnamen: HANYA di mobile */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 sm:hidden">
                <Trophy size={13} className="text-amber-500" />
                <span className="truncate max-w-[220px]">
                  {currentTournamentName || "Belum Memilih Turnamen"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                <Users size={13} className="text-slate-500" />
                <span>{totalPeserta} Peserta Terdaftar</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Peserta
            </h1>
          </div>

          {/* Baris 2: Deskripsi (kiri) sejajar dengan tombol + search (kanan) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-500">
              Kelola dan verifikasi data atlet peserta turnamen.
            </p>

            {/* Search + Export */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Cari nama peserta..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs focus:ring-2 focus:ring-amber-500/20"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {(role === "admin" || role === "panitia") && (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all disabled:opacity-75 disabled:cursor-wait"
                  title="Unduh seluruh data peserta ke Excel"
                >
                  {isExporting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileSpreadsheet size={15} />
                  )}
                  <span className="hidden sm:inline">{isExporting ? "Mengunduh..." : "Export Excel"}</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB SWITCHER: centered */}
          {(role === "admin" || role === "wasit" || role === "panitia") && (
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <Link
                  to={`${basePath}/peserta`}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                    isActive(`${basePath}/peserta`)
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <User size={14} />
                  <span>Single</span>
                </Link>
                <Link
                  to={`${basePath}/peserta-ganda`}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                    isActive(`${basePath}/peserta-ganda`)
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Users2 size={14} />
                  <span>Double</span>
                </Link>
              </div>
            </div>
          )}
        </>
      )}

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

      {/* --- KONTEN DATA PESERTA --- */}
      {(() => {
        const allPesertaRaw = kelompokUmur.flatMap((ku) => ku.peserta || []);
        const allFilteredPeserta = kelompokUmur.flatMap((ku) =>
          (ku.peserta || []).filter((p) =>
            p.namaLengkap.toLowerCase().includes(finalSearch.toLowerCase())
          )
        );

        if (allPesertaRaw.length === 0) {
          return (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <User size={30} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Belum Ada Peserta Terdaftar
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Turnamen ini belum memiliki data peserta yang masuk. Pastikan turnamen aktif sudah dipilih dengan benar.
              </p>
            </div>
          );
        }

        if (finalSearch && allFilteredPeserta.length === 0) {
          return (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <Search size={36} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">
                Peserta "{finalSearch}" tidak ditemukan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Coba gunakan kata kunci pencarian yang lain.
              </p>
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                className="mt-4 px-4 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
              >
                Reset Pencarian
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {kelompokUmur.map((ku) => {
              const filteredPeserta = (ku.peserta || []).filter((p) =>
                p.namaLengkap.toLowerCase().includes(finalSearch.toLowerCase())
              );

              if (finalSearch !== "" && filteredPeserta.length === 0) return null;
              if (ku.peserta.length === 0) return null;

              const isCollapsed = collapsedGroups[ku.id];

              return (
                <div
                  key={ku.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all overflow-hidden"
                >
                  {/* Header Accordion Kelompok Umur */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(ku.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50/70 to-white hover:from-amber-50/30 hover:to-white transition-all text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {ku.nama.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                          {ku.nama}
                        </h2>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {filteredPeserta.length} Peserta Terdata
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {filteredPeserta.length} Atlet
                      </span>
                      <div
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-transform duration-200 ${
                          isCollapsed ? "" : "rotate-180"
                        }`}
                      >
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </button>

                  {/* Isi Accordion (Tabel Desktop + Kartu Mobile) */}
                  {!isCollapsed && (
                    <div className="border-t border-slate-100">
                      {/* --- TAMPILAN DESKTOP & TABLET (Tabel Rapi) --- */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/60 border-b border-slate-100">
                              <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-14">
                                No
                              </th>
                              <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Profil Atlet
                              </th>
                              {(role === "admin" || role === "panitia") && (
                                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Kontak & NIK
                                </th>
                              )}
                              <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                                Status
                              </th>
                              <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-28">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredPeserta.map((p, index) => (
                              <tr
                                key={p.id}
                                className="hover:bg-slate-50/80 transition-colors group"
                              >
                                {/* No */}
                                <td className="px-5 py-3.5 text-xs font-semibold text-slate-400 text-center">
                                  {index + 1}
                                </td>

                                {/* Profil Atlet */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 font-bold text-xs flex items-center justify-center shrink-0">
                                      {p.namaLengkap.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors block">
                                        {p.namaLengkap}
                                      </span>
                                      {(role === "admin" || role === "panitia") && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 font-medium">
                                          <Calendar size={12} className="text-slate-400" />
                                          <span>{p.tanggalLahir || "Tgl Lahir -"}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Kontak & NIK (Admin/Panitia) */}
                                {(role === "admin" || role === "panitia") && (
                                  <td className="px-5 py-3.5">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                        <Phone size={12} className="text-slate-400" />
                                        <span>{p.nomorWhatsapp || "-"}</span>
                                      </div>
                                      {p.nik && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                                          <Hash size={12} className="text-slate-400" />
                                          <span>
                                            {p.nik.substring(0, 4)}••••••••{p.nik.substring(12)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                )}

                                {/* Status */}
                                <td className="px-5 py-3.5 text-center">
                                  {renderStatusBadge(p.status)}
                                </td>

                                {/* Aksi */}
                                <td className="px-5 py-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {role === "admin" || role === "panitia" ? (
                                      <>
                                        <Link
                                          to={`/${role}/detail-peserta/${p.id}`}
                                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                          title="Lihat Detail Peserta"
                                        >
                                          <Eye size={16} />
                                        </Link>
                                        <button
                                          type="button"
                                          onClick={() => handleDelete(p.id)}
                                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                          title="Hapus Peserta"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                                        View Only
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* --- TAMPILAN MOBILE (Kartu Responsif Touch-Friendly) --- */}
                      <div className="md:hidden divide-y divide-slate-100">
                        {filteredPeserta.map((p, index) => (
                          <div key={p.id} className="p-4 space-y-3">
                            {/* Baris Atas: No + Avatar + Nama + Status */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-bold text-slate-400 w-5">
                                  #{index + 1}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 font-bold text-xs flex items-center justify-center shrink-0">
                                  {p.namaLengkap.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                                    {p.namaLengkap}
                                  </span>
                                  {(role === "admin" || role === "panitia") && (
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      {p.tanggalLahir || "Tgl Lahir -"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {renderStatusBadge(p.status)}
                            </div>

                            {/* Info Kontak & NIK di Mobile */}
                            {(role === "admin" || role === "panitia") && (
                              <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-[11px]">WhatsApp:</span>
                                  <span className="font-semibold text-slate-800">
                                    {p.nomorWhatsapp || "-"}
                                  </span>
                                </div>
                                {p.nik && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-[11px]">NIK:</span>
                                    <span className="font-mono text-slate-700">
                                      {p.nik.substring(0, 4)}••••••••{p.nik.substring(12)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tombol Aksi di Mobile (Sekarang Tersedia & Mudah Ditekan!) */}
                            {(role === "admin" || role === "panitia") && (
                              <div className="flex items-center gap-2 pt-1">
                                <Link
                                  to={`/${role}/detail-peserta/${p.id}`}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider hover:bg-blue-100 active:scale-98 transition-all"
                                >
                                  <Eye size={14} />
                                  <span>Detail</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(p.id)}
                                  className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-98 transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message="Yakin ingin menghapus data peserta ini? Data yang sudah dihapus tidak dapat dipulihkan."
          onClose={() => setConfirmDelete({ show: false, pesertaId: null })}
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
            <button
              type="button"
              onClick={() => setConfirmDelete({ show: false, pesertaId: null })}
              className="flex-1 order-2 sm:order-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 active:scale-98 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 order-1 sm:order-2 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 active:scale-98 shadow-sm transition-all"
            >
              Ya, Hapus Peserta
            </button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}

export default Peserta;