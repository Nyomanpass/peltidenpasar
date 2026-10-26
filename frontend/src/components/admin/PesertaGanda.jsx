// File: src/components/admin/PesertaGanda.jsx

import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  UserPlus,
  Users2,
  User,
  ChevronDown,
  X,
  Trash2,
  Users,
  Trophy,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import AlertMessage from "../AlertMessage";
import { exportPesertaToExcel } from "../../utils/exportPesertaExcel";

function PesertaGanda({ tournamentId, searchTerm: searchTermFromProps }) {
  const location = useLocation();
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [masterKU, setMasterKU] = useState([]);
  const [doubleTeams, setDoubleTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentTournamentId, setCurrentTournamentId] = useState(
    tournamentId || localStorage.getItem("selectedTournament") || ""
  );
  const [currentTournamentName, setCurrentTournamentName] = useState(
    localStorage.getItem("selectedTournamentName") || ""
  );
  const [selectedTargetKU, setSelectedTargetKU] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, teamId: null });
  const [isExporting, setIsExporting] = useState(false);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin" || role === "panitia";
  const isAdminOrWasit = role === "admin" || role === "wasit" || role === "panitia";
  const basePath = `/${role}`;

  const totalTimGanda = doubleTeams.filter(
    (team) => String(team.tournamentId) === String(currentTournamentId)
  ).length;

  // Logika pencarian gabungan (Props vs Lokal)
  const finalSearch =
    searchTermFromProps !== undefined ? searchTermFromProps : localSearch;

  const isActive = (path) => location.pathname === path;

  const fetchData = useCallback(
    async (idOverride) => {
      const idToUse =
        idOverride || tournamentId || localStorage.getItem("selectedTournament");
      if (!idToUse) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [resPeserta, resKU, resTeams] = await Promise.all([
          api.get(`/peserta/kelompok-umur?tournamentId=${idToUse}`),
          api.get("/kelompok-umur"),
          api.get(`/double-teams?tournamentId=${idToUse}`),
        ]);
        setKelompokUmur(resPeserta.data || []);
        setMasterKU(resKU.data || []);
        setDoubleTeams(resTeams.data || []);
      } catch (err) {
        console.error("Error fetch data:", err);
      } finally {
        setLoading(false);
      }
    },
    [tournamentId]
  );

  useEffect(() => {
    fetchData();

    const handleTournamentChange = () => {
      const newId = localStorage.getItem("selectedTournament");
      const newName = localStorage.getItem("selectedTournamentName");

      setCurrentTournamentId(newId);
      setCurrentTournamentName(newName);

      fetchData(newId);
    };

    window.addEventListener("tournament-changed", handleTournamentChange);

    return () => {
      window.removeEventListener("tournament-changed", handleTournamentChange);
    };
  }, [fetchData]);

  // Handler interaksi
  const toggleGroup = (id) =>
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const hitungUmurSederhana = (tanggalLahir) => {
    if (!tanggalLahir) return 0;
    const tahunLahir = new Date(tanggalLahir).getFullYear();
    const tahunSekarang = new Date().getFullYear();
    return tahunSekarang - tahunLahir;
  };

  // Map untuk mengecek siapa saja yang sudah punya pasangan di kategori tertentu
  const pairedMap = doubleTeams.reduce((acc, team) => {
    if (!acc[team.kelompokUmurId]) acc[team.kelompokUmurId] = new Set();
    acc[team.kelompokUmurId].add(team.player1Id);
    acc[team.kelompokUmurId].add(team.player2Id);
    return acc;
  }, {});

  const handlePasangkan = async () => {
    try {
      const payload = {
        player1Id: selectedPlayers[0],
        player2Id: selectedPlayers[1],
        tournamentId: parseInt(currentTournamentId),
        kelompokUmurId: parseInt(selectedTargetKU),
      };
      await api.post("/double-teams", payload);
      setAlert({
        show: true,
        type: "success",
        message: "Tim ganda berhasil dibuat",
      });
      setSelectedPlayers([]);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.response?.data?.msg || "Gagal membuat tim ganda",
      });
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/double-teams/${confirmDelete.teamId}`);
      setAlert({
        show: true,
        type: "success",
        message: "Tim ganda berhasil dihapus",
      });
      setConfirmDelete({ show: false, teamId: null });
      fetchData();
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menghapus tim" });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportPesertaToExcel({
        tournamentId: currentTournamentId,
        tournamentName: currentTournamentName,
        kelompokUmurList: kelompokUmur,
        doubleTeamsList: doubleTeams,
      });
      setAlert({
        show: true,
        type: "success",
        message: "Data seluruh peserta (Tunggal & Ganda) berhasil diexport",
      });
    } catch {
      setAlert({
        show: true,
        type: "error",
        message: "Gagal mengexport data peserta",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-3 border-amber-200 border-t-amber-500 animate-spin" />
          <Trophy size={18} className="absolute text-amber-500" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Memuat data tim ganda...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* --- PAGE HEADER (tanpa card/box) --- */}
      {searchTermFromProps === undefined && (
        <>
          {/* Header Row: Judul & Deskripsi (kiri) sejajar dengan Search & Kontrol (kanan) */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            {/* Sisi Kiri: Badge + Judul + Deskripsi */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Badge Turnamen: HANYA di mobile */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 sm:hidden">
                  <Trophy size={13} className="text-amber-500" />
                  <span className="truncate max-w-[220px]">
                    {currentTournamentName || "Belum Memilih Turnamen"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  <Users2 size={13} className="text-slate-500" />
                  <span>{totalTimGanda} Pasangan Terdaftar</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Peserta
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Kelola dan pasangkan atlet peserta kategori ganda.
              </p>
            </div>

            {/* Sisi Kanan: Search + Buat Tim + Export */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-48">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Cari nama pemain..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl outline-none text-xs sm:text-sm font-medium transition-all shadow-xs focus:ring-2 focus:ring-amber-500/20"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    title="Hapus pencarian"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Tombol Buat Tim Ganda (admin only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all"
                >
                  <UserPlus size={15} />
                  <span className="hidden sm:inline">Buat Tim</span>
                </button>
              )}

              {/* Tombol Export Excel (admin & panitia) */}
              {(isAdmin || role === "panitia") && (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="group inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait"
                  title="Unduh seluruh data peserta (Tunggal & Ganda) ke Excel"
                >
                  {isExporting ? (
                    <Loader2 size={15} className="text-emerald-500 animate-spin" />
                  ) : (
                    <FileSpreadsheet size={15} className="text-emerald-500" />
                  )}
                  <span className="hidden sm:inline">{isExporting ? "Mengunduh..." : "Export Excel"}</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB SWITCHER: IDENTIK dengan Peserta.jsx — centered di antara header card dan list */}
          {isAdminOrWasit && (
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
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: "success", message: "" })}
        />
      )}

      {/* --- LIST TIM GANDA BERDASARKAN KATEGORI --- */}
      <div className="space-y-4">
        {doubleTeams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Users2 size={30} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Belum Ada Tim Ganda Terdaftar
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Silakan buat pasangan tim ganda dengan menekan tombol{" "}
              <span className="font-semibold text-slate-700">"Buat Tim Ganda"</span> di atas.
            </p>
          </div>
        ) : (
          masterKU.map((ku) => {
            const teamsInCategory = doubleTeams.filter(
              (team) =>
                (team.kelompokUmurId === ku.id || team.KelompokUmur?.id === ku.id) &&
                (team.Player1?.namaLengkap
                  ?.toLowerCase()
                  .includes(finalSearch.toLowerCase()) ||
                  team.Player2?.namaLengkap
                    ?.toLowerCase()
                    .includes(finalSearch.toLowerCase()))
            );

            if (teamsInCategory.length === 0) return null;
            const isCollapsed = collapsedGroups[ku.id];

            return (
              <div
                key={ku.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all overflow-hidden"
              >
                {/* Header Accordion Kategori Ganda */}
                <button
                  type="button"
                  onClick={() => toggleGroup(ku.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50/70 to-white hover:from-amber-50/30 hover:to-white transition-all text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                      G-{ku.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                        GANDA {ku.nama}
                      </h2>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {teamsInCategory.length} Pasangan Terdata
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-transform duration-200 ${
                      isCollapsed ? "" : "rotate-180"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Konten Tim Ganda */}
                {!isCollapsed && (
                  <div className="border-t border-slate-100">
                    {/* --- TAMPILAN DESKTOP & TABLET --- */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/60 border-b border-slate-100">
                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-14">
                              No
                            </th>
                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Pasangan Pemain
                            </th>
                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-24">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teamsInCategory.map((team, index) => (
                            <tr
                              key={team.id}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              <td className="px-5 py-4 text-xs font-semibold text-slate-400 text-center">
                                {index + 1}
                              </td>

                              <td className="px-5 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                                  {/* Player 1 */}
                                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                                      1
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                                      {team.Player1?.namaLengkap || "-"}
                                    </span>
                                  </div>

                                  {/* Player 2 */}
                                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                                      2
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                                      {team.Player2?.namaLengkap || "-"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-center">
                                {isAdmin ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmDelete({ show: true, teamId: team.id })
                                    }
                                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    title="Hapus Tim Ganda"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                                    View Only
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* --- TAMPILAN MOBILE (Kartu Responsif Touch-Friendly) --- */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {teamsInCategory.map((team, index) => (
                        <div key={team.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              Tim #{index + 1}
                            </span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDelete({ show: true, teamId: team.id })
                                }
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Hapus Tim"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 font-bold text-[10px] flex items-center justify-center">
                                1
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {team.Player1?.namaLengkap || "-"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 font-bold text-[10px] flex items-center justify-center">
                                2
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {team.Player2?.namaLengkap || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL BUAT TIM GANDA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Pasangkan Pemain Ganda
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih kategori umur dan 2 pemain yang akan dipasangkan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6 overflow-y-auto">
              {/* Step 1: Kategori */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 block">
                  1. Pilih Kategori Kelompok Umur
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {masterKU.map((ku) => {
                    const isSelected = selectedTargetKU === ku.id;
                    return (
                      <button
                        type="button"
                        key={ku.id}
                        onClick={() => {
                          setSelectedTargetKU(ku.id);
                          setSelectedPlayers([]);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <p
                          className={`font-bold text-xs uppercase ${
                            isSelected ? "text-amber-800" : "text-slate-800"
                          }`}
                        >
                          Ganda {ku.nama}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Maks {ku.umur} Tahun
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: List Pemain */}
              {selectedTargetKU && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Pilih 2 Pemain
                    </label>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        selectedPlayers.length === 2
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {selectedPlayers.length}/2 Pemain Terpilih
                    </span>
                  </div>

                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Cari nama pemain..."
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    {kelompokUmur.map((group) => {
                      const pairedInKU = pairedMap[selectedTargetKU] || new Set();
                      const targetKUData = masterKU.find((k) => k.id === selectedTargetKU);
                      const batasUmurKategori = targetKUData ? targetKUData.umur : 999;

                      const available = (group.peserta || []).filter(
                        (p) =>
                          !pairedInKU.has(p.id) &&
                          p.namaLengkap
                            .toLowerCase()
                            .includes(modalSearchTerm.toLowerCase())
                      );

                      if (available.length === 0) return null;

                      return (
                        <div
                          key={group.id}
                          className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40"
                        >
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200/60">
                            Asal Kategori: {group.nama}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {available.map((p) => {
                              const umurUser = hitungUmurSederhana(p.tanggalLahir);
                              const isOverAge = umurUser > batasUmurKategori;
                              const isSelected = selectedPlayers.includes(p.id);

                              return (
                                <button
                                  type="button"
                                  key={p.id}
                                  disabled={isOverAge}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedPlayers(
                                        selectedPlayers.filter((id) => id !== p.id)
                                      );
                                    } else if (selectedPlayers.length < 2) {
                                      setSelectedPlayers([...selectedPlayers, p.id]);
                                    }
                                  }}
                                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all border text-left ${
                                    isOverAge
                                      ? "bg-rose-50 text-rose-400 border-rose-100 cursor-not-allowed opacity-75"
                                      : isSelected
                                      ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                      : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="truncate pr-1 font-bold">
                                      {p.namaLengkap}
                                    </span>
                                    <span
                                      className={`text-[10px] mt-0.5 ${
                                        isSelected
                                          ? "text-amber-100"
                                          : isOverAge
                                          ? "text-rose-500 font-bold"
                                          : "text-slate-400 font-medium"
                                      }`}
                                    >
                                      Lahir: {new Date(p.tanggalLahir).getFullYear()} • {umurUser} Thn
                                    </span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1.5 ml-2">
                                    {isOverAge ? (
                                      <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase">
                                        Over
                                      </span>
                                    ) : isSelected ? (
                                      <div className="bg-white/20 p-1 rounded-full">
                                        <User size={12} className="text-white" />
                                      </div>
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-200 active:scale-98 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={selectedPlayers.length !== 2}
                onClick={handlePasangkan}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-98 transition-all ${
                  selectedPlayers.length === 2
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Simpan Tim Ganda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS TIM --- */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message="Yakin ingin menghapus tim ganda ini? Data pasangan yang dihapus tidak dapat dipulihkan."
          onClose={() => setConfirmDelete({ show: false, teamId: null })}
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
            <button
              type="button"
              onClick={() => setConfirmDelete({ show: false, teamId: null })}
              className="flex-1 order-2 sm:order-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 active:scale-98 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteTeam}
              className="flex-1 order-1 sm:order-2 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 active:scale-98 shadow-sm transition-all"
            >
              Ya, Hapus Tim
            </button>
          </div>
        </AlertMessage>
      )}
    </div>
  );
}

export default PesertaGanda;