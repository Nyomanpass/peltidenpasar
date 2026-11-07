import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import {
  X,
  CheckCircle,
  Upload,
  CreditCard,
  Loader2,
  AlertCircle,
  UserRound,
  Users,
  Phone,
  IdCard,
  CalendarDays,
  GraduationCap,
  Trophy,
  MapPin,
  Wallet,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ImageIcon,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/15";

const labelBase =
  "mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500";

const fmtDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date)) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SectionHeading = ({ step, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-[11px] font-black text-yellow-700 ring-1 ring-yellow-500/20">
      {step}
    </span>
    <div>
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
        {title}
      </h3>
      {description && (
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      )}
    </div>
  </div>
);

const UploadField = ({
  inputRef,
  name,
  accept,
  onChange,
  file,
  preview,
  onRemove,
  icon,
  title,
  hint,
  required,
}) => {
  const UploadIcon = icon || ImageIcon;

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-yellow-400 hover:bg-yellow-50/40">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          required={required}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:text-yellow-600">
            <UploadIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700">
              {file?.name || title}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
          </div>
          <span className="ml-auto hidden shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200 transition group-hover:text-yellow-700 group-hover:ring-yellow-300 sm:block">
            Pilih File
          </span>
        </div>
      </div>

      {preview && (
        <div className="relative w-full max-w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Hapus berkas"
            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg transition hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

function PesertaForm({ onSuccess }) {
  const fileInputRef = useRef(null);
  const buktiBayarRef = useRef(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();

  const [tournamentStatus, setTournamentStatus] = useState("checking");

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    nomorWhatsapp: "",
    tanggalLahir: "",
    kelompokUmurId: "",
    tournamentId: "",
    asalSekolah: "",
    fotoKartu: null,
    buktiBayar: null,
  });

  const [kelompokList, setKelompokList] = useState([]);
  const [tournamentList, setTournamentList] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [previewBayar, setPreviewBayar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKelompok();
    fetchTournament();
  }, []);

  useEffect(() => {
    if (!tournamentList.length) return;

    const params = new URLSearchParams(location.search);
    const tournamentName = params.get("tournament");

    if (!tournamentName) return;

    const found = tournamentList.find(
      (t) =>
        t.name.trim().toLowerCase() ===
        decodeURIComponent(tournamentName).trim().toLowerCase()
    );

    if (found) {
      setSelectedTournament(found);
      setFormData((prev) => ({
        ...prev,
        tournamentId: found.id.toString(),
      }));
    }
  }, [tournamentList, location.search]);

  const fetchKelompok = async () => {
    try {
      const res = await api.get("/kelompok-umur");
      setKelompokList(res.data);
    } catch (err) {
      console.error("Gagal fetch kelompok umur:", err);
    }
  };

  const fetchTournament = async () => {
    try {
      const res = await api.get("/tournaments");
      const activeTournaments = res.data.filter((t) => t.status === "aktif");

      setTournamentList(activeTournaments);

      const available = activeTournaments.filter((t) => {
        const deadline = getDeadline(t.start_date);
        return new Date() <= deadline;
      });

      if (available.length === 0) {
        setTournamentStatus("closed");
      } else {
        setTournamentStatus("open");
      }
    } catch (err) {
      console.error(err);
      setTournamentStatus("closed");
    }
  };

  const handleTournamentChange = (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedTournament(null);
      setFormData({ ...formData, tournamentId: "" });
      return;
    }

    const detail = tournamentList.find((t) => t.id === parseInt(id));

    const deadline = getDeadline(detail.start_date);
    const isRegistrationClosed = new Date() > deadline;

    if (isRegistrationClosed) {
      setError("Maaf, pendaftaran untuk turnamen ini sudah ditutup (Batas H-1).");
      setSelectedTournament(null);
      setFormData({ ...formData, tournamentId: "" }); // Reset pilihan
      return;
    }

    setSelectedTournament(detail);
    setFormData({ ...formData, tournamentId: id, buktiBayar: null });
    setPreviewBayar(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      const objectUrl = URL.createObjectURL(file);
      if (name === "fotoKartu") setPreviewFoto(objectUrl);
      if (name === "buktiBayar") setPreviewBayar(objectUrl);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    return today.getFullYear() - birth.getFullYear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = calculateAge(formData.tanggalLahir);

    const selectedKelompok = kelompokList.find(
      (k) => k.id == formData.kelompokUmurId
    );

    if (!selectedKelompok) {
      setError("Pilih kategori terlebih dahulu");
      return;
    }

    if (age > selectedKelompok.umur) {
      setError(
        `Umur peserta (${age} tahun) melebihi batas kategori ${selectedKelompok.nama}`
      );
      return;
    }

    if (selectedTournament?.type === "berbayar" && !formData.buktiBayar) {
      setError("Harap unggah bukti pembayaran terlebih dahulu!");
      return;
    }

    // Validasi NIK wajib 16 digit
    if (!formData.nik || formData.nik.length !== 16) {
      setError("NIK harus 16 digit angka");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      await api.post("/peserta", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Pendaftaran berhasil! Data Anda akan diverifikasi panitia.");

      setFormData({
        namaLengkap: "",
        nik: "",
        nomorWhatsapp: "",
        tanggalLahir: "",
        kelompokUmurId: "",
        tournamentId: "",
        asalSekolah: "",
        fotoKartu: null,
        buktiBayar: null,
      });
      setPreviewFoto(null);
      setPreviewBayar(null);
      setSelectedTournament(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (buktiBayarRef.current) buktiBayarRef.current.value = "";

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(
          "Hanya file JPG, JPEG, dan PNG yang diperbolehkan dengan ukuran maksimal 1.5MB"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeadline = (startDate) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() - 1);
    // set ke akhir hari (23:59:59)
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const isPaid = selectedTournament?.type === "berbayar";

  if (tournamentStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#130807]">
        <div className="flex flex-col items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">
            Memuat data turnamen
          </p>
        </div>
      </div>
    );
  }

  // Jika Loading selesai tapi tidak ada turnamen yang pendaftarannya buka
  if (tournamentStatus === "closed") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#130807] p-6">
        {/* Dekorasi Latar Belakang */}
        <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

        <div className="relative w-full max-w-lg">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 text-center text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
            {/* Bagian Icon */}
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 scale-110 rotate-12 rounded-3xl bg-yellow-500/20" />
              <div className="relative rounded-3xl border border-white/10 bg-white/10 p-6 shadow-sm">
                <AlertCircle size={52} className="text-yellow-400" />
              </div>
            </div>

            {/* Teks Informasi */}
            <h2 className="mb-4 text-3xl font-black tracking-tight">
              Pendaftaran Ditutup
            </h2>

            <div className="mb-10 space-y-4">
              <p className="leading-relaxed text-white/70">
                Mohon maaf, saat ini pendaftaran untuk semua turnamen{" "}
                <span className="font-bold text-white">telah berakhir</span> atau
                sedang <span className="font-bold text-white">tidak tersedia</span>.
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-yellow-400">
                  Ketentuan
                </p>
                <p className="text-sm font-medium text-white/70">
                  Pendaftaran ditutup otomatis 1 hari (H-1) sebelum jadwal
                  pertandingan dimulai.
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-3">
              <a
                href="/"
                className="w-full rounded-2xl bg-yellow-400 py-4 text-sm font-bold uppercase tracking-widest text-slate-900 shadow-lg transition-all hover:bg-yellow-300 active:scale-95"
              >
                Kembali ke Beranda
              </a>

              <a
                href="https://wa.me/62xxxxxxxxxx" // Ganti dengan nomor Admin
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                Hubungi Panitia
              </a>
            </div>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
              PELTI Kota Denpasar • Persatuan Lawn Tenis Indonesia
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] font-sans">
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

      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] ring-1 ring-black/5 sm:rounded-[2.25rem] lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* KOLOM KIRI: BRANDING & INFO */}
          <div className="relative overflow-hidden bg-secondary px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            {/* Glow & pattern */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-1/3 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-10 top-1/3 h-40 w-40 rounded-full border border-white/10" />

            <div className="relative flex h-full flex-col">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <img
                    src="/logo.png"
                    alt="Logo PELTI Denpasar"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-black tracking-wide">
                    PELTI DENPASAR
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                    Persatuan Lawn Tenis Indonesia
                  </p>
                </div>
              </div>

              {/* Headline */}
              <div className="mt-10 lg:mt-14">
                <h1 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl">
                  Ayo Gabung,
                  <br />
                  Jadi <span className="text-yellow-400">Juara Baru!</span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                  Raih gelar juara Turnamen Tenis PELTI Denpasar di kategori umur
                  Anda. Isi formulir, unggah berkas, dan bersiap ke lapangan.
                </p>
              </div>

              {/* Ringkasan Turnamen Terpilih */}
              <div className="mt-8">
                {selectedTournament ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400/80">
                          Turnamen Dipilih
                        </p>
                        <h3 className="mt-1 truncate text-base font-black">
                          {selectedTournament.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-white/70">
                        <CalendarDays className="h-3.5 w-3.5 text-yellow-400/80" />
                        <span>
                          {fmtDate(selectedTournament.start_date)} –{" "}
                          {fmtDate(selectedTournament.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="h-3.5 w-3.5 text-yellow-400/80" />
                        <span className="truncate">
                          {selectedTournament.location || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Wallet className="h-3.5 w-3.5 text-yellow-400/80" />
                        <span>
                          {isPaid
                            ? `Rp ${Number(selectedTournament.nominal || 0).toLocaleString("id-ID")}`
                            : "Tanpa biaya pendaftaran"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <AlertCircle className="h-3.5 w-3.5 text-yellow-400/80" />
                        <span>
                          Batas daftar {fmtDate(getDeadline(selectedTournament.start_date))}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/20 p-5">
                    <p className="flex items-center gap-2 text-xs font-semibold text-white/60">
                      <Trophy className="h-4 w-4 text-yellow-400/70" />
                      Pilih turnamen di formulir untuk melihat ringkasannya di sini.
                    </p>
                  </div>
                )}
              </div>

              {/* Steps */}
              <div className="mt-8 hidden space-y-3 lg:block">                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Alur Pendaftaran
                </p>
                {[
                  { icon: UserRound, text: "Isi data diri sesuai identitas resmi." },
                  { icon: Users, text: "Tentukan kelompok umur yang sesuai." },
                  { icon: Upload, text: "Unggah foto identitas (KK/KTP)." },
                  {
                    icon: CreditCard,
                    text: "Selesaikan pembayaran bila turnamen berbayar.",
                  },
                ].map((item, i) => {
                  const StepIcon = item.icon;
                  return (
                    <div
                      key={i}
                      className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition-colors hover:border-white/15 hover:bg-white/[0.07]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-yellow-400 ring-1 ring-white/10 transition-colors group-hover:bg-yellow-400 group-hover:text-slate-900">
                        <StepIcon className="h-4 w-4" />
                      </span>
                      <p className="pt-1 text-sm font-medium leading-relaxed text-white/70">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: FORMULIR */}
          <div className="bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="mx-auto w-full max-w-2xl">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-700 ring-1 ring-yellow-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    Formulir Pendaftaran
                  </p>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Daftar Turnamen
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Lengkapi data peserta dengan benar untuk proses verifikasi
                    panitia.
                  </p>
                </div>

                <a
                  href="/"
                  className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 sm:inline-flex"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Beranda
                </a>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 01 — PILIH TURNAMEN */}
                <div>
                  <SectionHeading
                    step="01"
                    title="Pilih Turnamen"
                    description="Hanya turnamen aktif yang masih membuka pendaftaran."
                  />

                  <div className="relative">
                    <Trophy className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-600" />
                    <select
                      name="tournamentId"
                      value={formData.tournamentId}
                      onChange={handleTournamentChange}
                      className={`${inputBase} appearance-none pl-11 pr-11 font-bold text-slate-700`}
                      required
                    >
                      <option value="">-- Pilih Turnamen Aktif --</option>
                      {tournamentList
                        .filter((t) => new Date() <= getDeadline(t.start_date)) // HANYA TAMPILKAN YANG BELUM DEADLINE
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {selectedTournament && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-500/15">
                        <CheckCircle className="h-3 w-3" />
                        Pendaftaran dibuka
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        <CalendarDays className="h-3 w-3" />
                        {fmtDate(selectedTournament.start_date)} –{" "}
                        {fmtDate(selectedTournament.end_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AREA PEMBAYARAN */}
                {selectedTournament && selectedTournament.type === "berbayar" && (
                  <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60">
                    <div className="flex items-center gap-2 border-b border-amber-200/70 px-5 py-3.5 text-amber-800">
                      <CreditCard className="h-4 w-4" />
                      <h3 className="text-[11px] font-black uppercase tracking-wider">
                        Instruksi Pembayaran
                      </h3>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex flex-col gap-4 rounded-xl border border-amber-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Nominal Transfer
                          </p>
                          <p className="mt-0.5 text-xl font-black text-slate-900">
                            Rp{" "}
                            {Number(
                              selectedTournament.nominal || 0
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Bank / Tujuan
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-slate-700">
                            {selectedTournament.bank_info}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wide text-amber-700">
                          Upload Bukti Transfer
                        </label>
                        <UploadField
                          inputRef={buktiBayarRef}
                          name="buktiBayar"
                          accept="image/*"
                          onChange={handleChange}
                          file={formData.buktiBayar}
                          preview={previewBayar}
                          icon={Upload}
                          title="Unggah bukti transfer"
                          hint="JPG, JPEG, atau PNG • Maks 1.5 MB"
                          required
                          onRemove={() => {
                            setPreviewBayar(null);
                            setFormData({ ...formData, buktiBayar: null });
                            if (buktiBayarRef.current)
                              buktiBayarRef.current.value = "";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 02 — BIODATA PESERTA */}
                <div>
                  <SectionHeading
                    step="02"
                    title="Data Peserta"
                    description="Pastikan seluruh data sesuai dokumen resmi."
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelBase}>
                        <UserRound className="h-3.5 w-3.5 text-slate-400" />
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="namaLengkap"
                        value={formData.namaLengkap}
                        onChange={handleChange}
                        className={inputBase}
                        placeholder="Sesuai KTP / KK"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelBase}>
                        <IdCard className="h-3.5 w-3.5 text-slate-400" />
                        NIK
                      </label>
                      <input
                        type="text"
                        name="nik"
                        inputMode="numeric"
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, nik: onlyDigits });
                        }}
                        placeholder="16 digit sesuai KTP/KK"
                        className={`${inputBase} tracking-wide`}
                        required
                      />
                      {formData.nik && formData.nik.length !== 16 && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          NIK harus 16 digit ({formData.nik.length}/16)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelBase}>
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        No. WhatsApp
                      </label>
                      <input
                        type="text"
                        name="nomorWhatsapp"
                        value={formData.nomorWhatsapp}
                        onChange={handleChange}
                        className={inputBase}
                        placeholder="08xxxxxxxx"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelBase}>
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        Tanggal Lahir
                      </label>
                      <DatePicker
                        selected={
                          formData.tanggalLahir
                            ? new Date(formData.tanggalLahir)
                            : null
                        }
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            tanggalLahir: date
                              ? date.toISOString().split("T")[0]
                              : "",
                          })
                        }
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        placeholderText="Pilih tanggal lahir"
                        popperPlacement="bottom-start"
                        className={inputBase}
                        wrapperClassName="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelBase}>
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        Kelompok Umur
                      </label>
                      <div className="relative">
                        <select
                          name="kelompokUmurId"
                          value={formData.kelompokUmurId}
                          onChange={handleChange}
                          className={`${inputBase} appearance-none pr-11`}
                          required
                        >
                          <option value="">-- Pilih --</option>
                          {[...kelompokList]
                            .sort((a, b) => {
                              if (a.umur === b.umur) {
                                return a.id - b.id; // kalau umur sama → id terkecil dulu
                              }
                              return a.umur - b.umur; // umur terkecil dulu
                            })
                            .map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.nama}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    {/* ASAL SEKOLAH (MUNCUL JIKA TOURNAMENT WAJIB SEKOLAH) */}
                    {selectedTournament?.requireSchool && (
                      <div className="sm:col-span-2">
                        <label className={labelBase}>
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                          Asal Sekolah
                        </label>
                        <input
                          type="text"
                          name="asalSekolah"
                          value={formData.asalSekolah}
                          onChange={handleChange}
                          placeholder="Contoh: SMA Negeri 1 Denpasar"
                          required
                          className={inputBase}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 03 — BERKAS PENDUKUNG */}
                <div>
                  <SectionHeading
                    step="03"
                    title="Berkas Pendukung"
                    description="Unggah dokumen yang diperlukan untuk verifikasi."
                  />

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wide text-slate-600">
                      Foto Identitas (KK/KTP)
                    </label>
                    <UploadField
                      inputRef={fileInputRef}
                      name="fotoKartu"
                      accept="image/*"
                      onChange={handleChange}
                      file={formData.fotoKartu}
                      preview={previewFoto}
                      icon={ImageIcon}
                      title="Unggah foto identitas"
                      hint="JPG, JPEG, atau PNG • Maks 1.5 MB"
                      required
                      onRemove={() => {
                        setPreviewFoto(null);
                        setFormData({ ...formData, fotoKartu: null });
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-yellow-400 px-6 py-4 text-sm font-black uppercase tracking-[0.15em] text-slate-900 shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:bg-yellow-300 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Memproses Pendaftaran
                      </>
                    ) : (
                      <>
                        Daftar Sekarang
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Data Anda aman dan hanya digunakan untuk verifikasi panitia.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          PELTI Kota Denpasar • Persatuan Lawn Tenis Indonesia
        </p>
      </div>
    </div>
  );
}

export default PesertaForm;
