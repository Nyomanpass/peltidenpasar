import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { X, CheckCircle, Upload, CreditCard, Loader2 } from "lucide-react";

function PesertaForm({ onSuccess }) {
  const fileInputRef = useRef(null);
  const buktiBayarRef = useRef(null);

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nomorWhatsapp: "",
    tanggalLahir: "",
    kelompokUmurId: "",
    tournamentId: "",
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
      const res = await api.get('/tournaments');
      const activeTournaments = res.data.filter((t) => t.status === "aktif");
      setTournamentList(activeTournaments);
    } catch (err) {
      console.error("Fetch tournament error:", err);
    }
  };

  const handleTournamentChange = (e) => {
    const id = e.target.value;
    setFormData({ ...formData, tournamentId: id, buktiBayar: null });
    setPreviewBayar(null);
    const detail = tournamentList.find((t) => t.id === parseInt(id));
    setSelectedTournament(detail);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTournament?.type === "berbayar" && !formData.buktiBayar) {
      alert("Harap unggah bukti pembayaran terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });

      await api.post("/peserta", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Pendaftaran Berhasil! ✅");
      
      setFormData({
        namaLengkap: "", nomorWhatsapp: "", tanggalLahir: "",
        kelompokUmurId: "", tournamentId: "", fotoKartu: null, buktiBayar: null,
      });
      setPreviewFoto(null);
      setPreviewBayar(null);
      setSelectedTournament(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (buktiBayarRef.current) buktiBayarRef.current.value = "";
      
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Gagal mendaftar, silakan cek kembali data Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <div className="bg-white shadow-2xl w-full min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          
          {/* KOLOM KIRI: BRANDING & INFO (50%) */}
          <div className="relative bg-secondary p-8 lg:p-16 flex flex-col justify-center items-center text-white overflow-hidden order-2 lg:order-1">
            <div className="absolute top-0 -left-12 w-64 h-64 bg-primary/20 rounded-full transform -translate-y-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 -right-12 w-64 h-64 bg-primary/20 rounded-full transform translate-y-1/2 blur-2xl"></div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
              <div className="flex flex-col items-center mb-8">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4 drop-shadow-lg p-2 rounded-2xl bg-white/10" />
                <h1 className="text-2xl font-black tracking-tighter">PELTI DENPASAR</h1>
                <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Persatuan Lawn Tenis Indonesia</p>
              </div>

              <div className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4 italic">Ayo Gabung, Jadi Juara Baru!</h1>
                <p className="text-blue-100 text-sm opacity-80 leading-relaxed">
                  Raih gelar juara Turnamen Tenis PELTI Denpasar di kategori umur Anda.
                </p>
              </div>
              
              <div className="hidden lg:block w-full space-y-4">
                {[
                  "Lengkapi data diri sesuai identitas.",
                  "Pilih Kelompok Umur yang tersedia.",
                  "Upload bukti identitas (KK/KTP).",
                  "Lakukan pembayaran (untuk turnamen berbayar).",
                ].map((text, i) => (
                  <div key={i} className="flex items-center justify-center gap-4 group bg-white/5 p-3 rounded-2xl border border-white/10">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary rounded-xl text-white text-xs font-black shadow-lg">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-left w-64">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: FORMULIR (50%) */}
          <div className="flex-1 p-6  bg-white flex flex-col justify-center items-center order-1">
            <div className="w-full max-w-2xl">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Formulir Pendaftaran</h2>
                <p className="text-slate-500 text-sm italic">Lengkapi data peserta dengan benar untuk verifikasi.</p>
                <div className="w-16 h-1 bg-primary rounded-full mt-4 mx-auto lg:mx-0"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* PILIH TURNAMEN */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Turnamen</label>
                  <select
                    name="tournamentId"
                    value={formData.tournamentId}
                    onChange={handleTournamentChange}
                    className="w-full border-2 border-slate-100 bg-slate-50 p-3.5 rounded-xl focus:border-primary outline-none transition-all font-bold text-slate-700 text-sm"
                    required
                  >
                    <option value="">-- Pilih Turnamen Aktif --</option>
                    {tournamentList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* AREA PEMBAYARAN */}
                {selectedTournament && selectedTournament.type === "berbayar" && (
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <CreditCard size={18}/>
                      <h3 className="font-bold uppercase text-[11px] tracking-wider">Instruksi Pembayaran</h3>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nominal Transfer</p>
                        <p className="text-lg font-black text-blue-600">Rp {Number(selectedTournament.nominal).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bank / Tujuan</p>
                        <p className="text-xs font-bold text-slate-700">{selectedTournament.bank_info}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-amber-700 ml-1 uppercase">Upload Bukti Transfer</label>
                      <input
                        ref={buktiBayarRef}
                        type="file"
                        name="buktiBayar"
                        onChange={handleChange}
                        required
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-amber-500 file:text-white file:font-bold hover:file:bg-amber-600 cursor-pointer"
                      />
                      {previewBayar && (
                        <div className="relative w-24 aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white mt-2">
                          <img src={previewBayar} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => { setPreviewBayar(null); setFormData({...formData, buktiBayar: null}); buktiBayarRef.current.value = ""; }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md"
                          ><X size={12}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* BIODATA PESERTA */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                    <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm" placeholder="Nama Lengkap" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">No. WhatsApp</label>
                    <input type="text" name="nomorWhatsapp" value={formData.nomorWhatsapp} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm" placeholder="08xxxxxxxx" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tanggal Lahir</label>
                    <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:border-primary transition text-sm shadow-sm" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kelompok Umur</label>
                    <select name="kelompokUmurId" value={formData.kelompokUmurId} onChange={handleChange} className="w-full border-2 border-slate-100 p-3.5 rounded-xl bg-white outline-none focus:border-primary transition text-sm shadow-sm font-medium" required>
                      <option value="">-- Pilih --</option>
                      {kelompokList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                </div>

                {/* FOTO IDENTITAS */}
                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Upload size={16} className="text-primary"/> Foto Identitas (KK/KTP)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="fotoKartu"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white file:font-bold hover:file:bg-black transition-all cursor-pointer"
                  />
                  {previewFoto && (
                    <div className="relative w-full max-w-[240px] aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-white mt-2">
                      <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setPreviewFoto(null); setFormData({...formData, fotoKartu: null}); fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600 transition"
                      ><X size={14}/></button>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-black text-sm py-4 rounded-xl hover:bg-blue-600 transform hover:scale-[1.01] active:scale-95 transition-all duration-300 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 uppercase tracking-widest disabled:bg-slate-300"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <>Daftar Sekarang <CheckCircle size={18}/></>}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PesertaForm;