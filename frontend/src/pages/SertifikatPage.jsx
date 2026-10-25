import api from "../api";
import { useEffect, useState, useRef } from "react";
import { 
  LayoutGrid, Upload, Trash2, RefreshCcw, Eye, Download, 
  Trophy, Crown, Award, CheckCircle, Clock, AlertCircle, 
  X, User, Users, FileCheck, FileText, Loader2, Image as ImageIcon
} from "lucide-react";

export default function SertifikatPage() {
  const [selectedTournament, setSelectedTournament] = useState(localStorage.getItem("selectedTournament") || "");
  const [baganList, setBaganList] = useState([]);
  const [selectedBaganId, setSelectedBaganId] = useState(null);
  const [data, setData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [template, setTemplate] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [filterBaganKategori, setFilterBaganKategori] = useState("all");
  const infoRef = useRef(null);
  const fileInputRef = useRef(null);

  const role = localStorage.getItem('role');
  const isAdmin = role === "admin";

  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const getImageUrl = (path) => {
    if (!path) return "";
    return `${API_URL}${path}`;
  };

  const getPlayers = (p) => {
    if (!p) return [];

    // DOUBLE → gabung nama
    if (p.Player1 && p.Player2) {
      return [
        {
          id: p.Player1.id,
          namaLengkap: `${p.Player1.namaLengkap} / ${p.Player2.namaLengkap}`
        }
      ];
    }

    // SINGLE
    if (p.namaLengkap) {
      return [
        {
          id: p.id,
          namaLengkap: p.namaLengkap
        }
      ];
    }

    // ROUND ROBIN
    if (p.peserta) {
      return [
        {
          id: p.peserta.id,
          namaLengkap: p.peserta.namaLengkap
        }
      ];
    }

    return [];
  };

  const getId = (p) => {
    if (!p) return null;
    if (p.Player1) return p.Player1.id;
    if (p.peserta) return p.peserta.id;
    return p.id;
  };

  const juara3List = Array.isArray(data?.juara3)
    ? data.juara3
    : data?.juara3
    ? [data.juara3]
    : [];

  // ================= REACTIVE TO TOURNAMENT CHANGE =================
  useEffect(() => {
    const handleTournamentChange = () => {
      const newTId = localStorage.getItem("selectedTournament");
      setSelectedTournament(newTId || "");
      setSelectedBaganId(null);
      setData(null);
      setFile(null);
      setFilePreview(null);
    };

    window.addEventListener("tournament-changed", handleTournamentChange);
    return () => window.removeEventListener("tournament-changed", handleTournamentChange);
  }, []);

  // ================= BAGAN LIST =================
  useEffect(() => {
    if (!selectedTournament) {
      setBaganList([]);
      setSelectedBaganId(null);
      return;
    }

    api.get("/bagan", {
      params: { tournamentId: selectedTournament }
    })
      .then(res => {
        const list = res.data || [];
        setBaganList(list);
        if (list.length > 0 && !selectedBaganId) {
          setSelectedBaganId(Number(list[0].id));
        }
      })
      .catch(err => {
        console.error("Error fetch bagan:", err);
      });
  }, [selectedTournament]);

  // ================= JUARA DATA =================
  useEffect(() => {
    if (!selectedBaganId) {
      setData(null);
      return;
    }

    setIsLoadingData(true);
    api.get(`/sertifikat/${selectedBaganId}`)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Error fetch sertifikat data:", err);
        setData(null);
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [selectedBaganId]);

  // ================= TEMPLATE =================
  const fetchTemplate = async () => {
    if (!selectedTournament) return;
    try {
      const res = await api.get("/template", {
        params: { tournamentId: selectedTournament }
      });
      setTemplate(res.data);
    } catch (err) {
      console.error("Error fetch template:", err);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [selectedTournament]);

  // ================= UPLOAD TEMPLATE =================
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (isUpdate = false) => {
    try {
      if (!file) {
        alert("Silakan pilih file gambar template terlebih dahulu.");
        return;
      }

      if (!selectedTournament) {
        alert("Turnamen belum dipilih.");
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tournamentId", selectedTournament);

      if (isUpdate) {
        await api.put("/template", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/template", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      await fetchTemplate();
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Template sertifikat berhasil disimpan!");

    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah template sertifikat.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedTournament) {
        alert("Turnamen belum dipilih.");
        return;
      }

      const confirmDelete = confirm("Apakah Anda yakin ingin menghapus template sertifikat untuk turnamen ini?");
      if (!confirmDelete) return;

      await api.delete("/template", {
        params: { tournamentId: selectedTournament }
      });

      setTemplate(null);
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Template sertifikat berhasil dihapus!");

    } catch (err) {
      console.error(err);
      alert("Gagal menghapus template sertifikat.");
    }
  };

  // ================= PREVIEW =================
  const preview = (w) => {
    const id = getId(w);
    if (!id) {
      alert("ID peserta tidak ditemukan.");
      return;
    }

    const url = `${API_URL}/api/sertifikat/preview?id=${id}&tournamentId=${selectedTournament}&baganId=${selectedBaganId}`;
    setPreviewUrl(url);
    setPreviewPlayer(w);
    setPreviewLoading(true);
    setShowPreview(true);
  };

  // ================= DOWNLOAD =================
  const download = async (w) => {
    const id = getId(w);
    if (!id) {
      alert("ID peserta tidak ditemukan.");
      return;
    }

    try {
      setDownloadingId(id);

      const res = await api.get(
        `/sertifikat/download?id=${id}&tournamentId=${selectedTournament}&baganId=${selectedBaganId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");

      const namaFile = (w.namaLengkap || "PEMENANG")
        .toUpperCase()
        .replace(/\s+/g, "-");

      link.href = url;
      link.setAttribute("download", `SERTIFIKAT-${namaFile}.pdf`);
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      link.remove();

    } catch (err) {
      console.error("Gagal download:", err);
      alert("Gagal mengunduh sertifikat. Pastikan template sudah diunggah di backend.");
    } finally {
      setDownloadingId(null);
    }
  };

  const selectedBagan = baganList.find(b => Number(b.id) === Number(selectedBaganId));

  const hasJuara = data && (
    (data.juara1 && getPlayers(data.juara1).length > 0) ||
    (data.juara2 && getPlayers(data.juara2).length > 0) ||
    (juara3List.flatMap(j => getPlayers(j)).length > 0)
  );

  return (
    <div className="min-h-screen pb-16 space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Sertifikat Pemenang
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
          Kelola template dan cetak sertifikat resmi untuk para juara turnamen
        </p>
      </div>

      {/* ================= TEMPLATE MANAGER (ADMIN ONLY) ================= */}
      {isAdmin && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60 shadow-2xs">
                <FileCheck size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  Template Sertifikat
                </h3>
                <p className="text-slate-400 text-xs">
                  Format gambar background sertifikat
                </p>
              </div>
            </div>


          </div>

          {template ? (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Thumbnail Template Aktif */}
              <div className="relative group w-full lg:w-96 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-50">
                <img
                  src={filePreview || getImageUrl(template.image)}
                  alt="Template Sertifikat"
                  className="w-full aspect-[16/10] object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-xs text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5">
                    <Eye size={13} /> {filePreview ? "Pratinjau File Baru" : "Template Aktif"}
                  </span>
                </div>
              </div>

              {/* Form Ganti / Update Template */}
              <div className="flex-1 space-y-4 w-full">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ganti File Background Sertifikat
                  </label>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                  />
                  {file && (
                    <p className="text-[11px] font-medium text-blue-600 mt-2 flex items-center gap-1">
                      <CheckCircle size={12} /> File terpilih: <span className="font-bold">{file.name}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleUpload(true)}
                    disabled={!file || isUploading}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isUploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={14} />
                    )}
                    <span>{isUploading ? "Menyimpan..." : "Perbarui Template"}</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 active:scale-95 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Upload Dropzone ketika belum ada template */
            <div className="flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20 rounded-2xl transition-all text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-2xs">
                <Upload size={22} />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">
                Unggah Background Template Sertifikat
              </h4>
              <p className="text-slate-400 text-xs mt-1 max-w-md">
                Pilih file gambar desain sertifikat untuk turnamen ini (JPG / PNG, disarankan format A4 Landscape).
              </p>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 file:cursor-pointer cursor-pointer"
                />

                <button
                  onClick={() => handleUpload(false)}
                  disabled={!file || isUploading}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{isUploading ? "Mengunggah..." : "Simpan Template"}</span>
                </button>
              </div>

              {file && (
                <p className="text-[11px] font-medium text-emerald-600 mt-3 flex items-center gap-1">
                  <CheckCircle size={12} /> Siap diunggah: <span className="font-bold">{file.name}</span>
                </p>
              )}
            </div>
          )}

        </div>
      )}

      {/* ================= PILIH BAGAN / KELOMPOK UMUR ================= */}
      <div className="space-y-4">
        
        {/* Header & Filter Kategori */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-blue-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Pilih Bagan Pertandingan
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-full sm:w-fit overflow-x-auto">
            <button
              onClick={() => setFilterBaganKategori("all")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                filterBaganKategori === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua
            </button>

            <button
              onClick={() => setFilterBaganKategori("single")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                filterBaganKategori === "single"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User size={12} />
              <span>Tunggal</span>
            </button>

            <button
              onClick={() => setFilterBaganKategori("double")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                filterBaganKategori === "double"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users size={12} />
              <span>Ganda</span>
            </button>
          </div>
        </div>

        {/* Grid Bagan List */}
        {baganList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs">Belum ada bagan pertandingan yang tersedia untuk turnamen ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {baganList
              .filter(b => (filterBaganKategori || "all") === "all" ? true : b.kategori === filterBaganKategori)
              .sort((a, b) => (a.kelompokUmurId || 0) - (b.kelompokUmurId || 0))
              .map((bagan) => {
                const ringkasNama = bagan.nama
                  ?.replace(/Bagan/gi, '')
                  ?.replace(/\(Tunggal\)/gi, '')
                  ?.replace(/\(Ganda\)/gi, '')
                  ?.trim();

                const active = selectedBaganId === Number(bagan.id);

                return (
                  <button
                    key={bagan.id}
                    type="button"
                    onClick={() => setSelectedBaganId(Number(bagan.id))}
                    className={`group relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
                        : "bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        active
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {bagan.kategori === 'double' ? <Users size={10} /> : <User size={10} />}
                        {bagan.kategori === 'double' ? 'Ganda' : 'Tunggal'}
                      </span>


                    </div>

                    <p className={`text-xs sm:text-sm font-black leading-snug line-clamp-2 ${
                      active ? "text-white" : "text-slate-800"
                    }`}>
                      {ringkasNama}
                    </p>
                  </button>
                );
              })}
          </div>
        )}

      </div>

      {/* ================= INFO BAGAN TERPILIH ================= */}
      {selectedBagan && data && (
        <div ref={infoRef} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
                <Trophy size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  {selectedBagan.nama}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
                    {selectedBagan.kategori === 'double' ? <Users size={11} /> : <User size={11} />}
                    {selectedBagan.kategori === 'double' ? 'Ganda' : 'Tunggal'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                    <LayoutGrid size={11} />
                    {data.tipe === 'round_robin' ? 'Round Robin' : 'Sistem Gugur'}
                  </span>
                  {data.kelompokUmur && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60">
                      {data.kelompokUmur}
                    </span>
                  )}
                </div>
              </div>
            </div>



          </div>
        </div>
      )}

      {/* ================= DAFTAR KARTU SERTIFIKAT JUARA ================= */}
      {isLoadingData ? (
        <div className="p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
          <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-500 text-xs font-bold">Memuat data sertifikat pemenang...</p>
        </div>
      ) : !hasJuara ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mb-3 border border-amber-100">
            <Clock size={22} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Data Juara Belum Tersedia</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Pertandingan pada bagan ini masih berlangsung atau pemenang podium belum ditetapkan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* JUARA 1 */}
          {data?.juara1 && getPlayers(data.juara1).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Juara 1
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {getPlayers(data.juara1).map((player, i) => (
                  <SertifikatCard
                    key={`j1-${i}`}
                    rank="Juara 1"
                    nama={player.namaLengkap}
                    isDownloading={downloadingId === getId(player)}
                    onPreview={() => preview(player)}
                    onDownload={() => download(player)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* JUARA 2 */}
          {data?.juara2 && getPlayers(data.juara2).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Juara 2
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {getPlayers(data.juara2).map((player, i) => (
                  <SertifikatCard
                    key={`j2-${i}`}
                    rank="Juara 2"
                    nama={player.namaLengkap}
                    isDownloading={downloadingId === getId(player)}
                    onPreview={() => preview(player)}
                    onDownload={() => download(player)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* JUARA 3 */}
          {juara3List.flatMap(j => getPlayers(j)).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Juara 3
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {juara3List.flatMap(j => getPlayers(j)).map((player, i) => (
                  <SertifikatCard
                    key={`j3-${i}`}
                    rank="Juara 3"
                    nama={player.namaLengkap}
                    isDownloading={downloadingId === getId(player)}
                    onPreview={() => preview(player)}
                    onDownload={() => download(player)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= MODAL PREVIEW SERTIFIKAT ================= */}
      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[92vh] bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200"
          >
            {/* Modal Header */}
            <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-5 sm:px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/50">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                    Pratinjau Sertifikat
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {previewPlayer?.namaLengkap || "Sertifikat Resmi"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewPlayer && (
                  <button
                    onClick={() => download(previewPlayer)}
                    disabled={downloadingId === getId(previewPlayer)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {downloadingId === getId(previewPlayer) ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    <span>Download PDF</span>
                  </button>
                )}

                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Iframe Body */}
            <div className="relative flex-1 w-full bg-slate-100 overflow-hidden">
              {previewLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                  <Loader2 size={28} className="animate-spin text-blue-600 mb-2" />
                  <p className="text-xs font-bold text-slate-500">Memuat pratinjau sertifikat...</p>
                </div>
              )}
              <iframe
                src={previewUrl}
                onLoad={() => setPreviewLoading(false)}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ================= KOMPONEN KARTU SERTIFIKAT =================
function SertifikatCard({ rank, nama, isDownloading, onPreview, onDownload }) {
  
  // Icon dan Badge Rank sesuai Podium JuaraPage
  const rankConfig = {
    "Juara 1": {
      icon: <Trophy size={18} className="text-white" />,
      bgIcon: "bg-yellow-500 shadow-xs",
      badge: "bg-yellow-50 text-yellow-700 border-yellow-200/80",
    },
    "Juara 2": {
      icon: <Crown size={18} className="text-orange-500" />,
      bgIcon: "bg-orange-50 border border-orange-200",
      badge: "bg-orange-50 text-orange-800 border-orange-200/80",
    },
    "Juara 3": {
      icon: <Award size={18} className="text-slate-500" />,
      bgIcon: "bg-slate-100 border border-slate-200",
      badge: "bg-slate-50 text-slate-700 border-slate-200/80",
    }
  }[rank] || {
    icon: <Trophy size={18} className="text-white" />,
    bgIcon: "bg-yellow-500",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  return (
    <div className={`bg-white rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 ${
      rank === 'Juara 1' ? 'border-yellow-400/60' :
      rank === 'Juara 2' ? 'border-orange-300/60' :
      'border-slate-200/80'
    }`}>
      
      {/* Profil Pemenang */}
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rankConfig.bgIcon}`}>
          {rankConfig.icon}
        </div>
        <div>
          <h4 className="font-black text-sm sm:text-base text-slate-800 leading-snug uppercase tracking-tight">
            {nama}
          </h4>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onPreview}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <Eye size={14} />
          <span>Preview</span>
        </button>

        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isDownloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>{isDownloading ? "Mengunduh..." : "Download PDF"}</span>
        </button>
      </div>

    </div>
  );
}