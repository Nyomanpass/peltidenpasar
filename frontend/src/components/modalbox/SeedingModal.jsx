import { useState } from "react";
import { Trash2, Plus, Info, Trophy, Star, Users, X, AlertCircle, Sparkles } from "lucide-react"; 

export default function SeedingModal({ pesertaList, onClose, onSaved }) {
  const [seededPeserta, setSeededPeserta] = useState([]);
  const selectedIds = seededPeserta.map(p => p.id).filter(id => id !== null);

  // --- 1. HITUNG KAPASITAS BAGAN (SUB-BAGAN) ---
  // Bulatkan ke BAWAH ke pangkat 2 terdekat (sub-bagan menghilangkan BYE)
  const getBaganCapacity = (count) => {
    if (count <= 1) return 2;
    return Math.pow(2, Math.floor(Math.log2(count)));
  };

  const maxSlot = getBaganCapacity(pesertaList.length);

  const handleChange = (index, value) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], id: Number(value) };
    setSeededPeserta(newSeeded);
  };
  
  const addSlot = () => {
    setSeededPeserta([...seededPeserta, { id: null, slot: "", isSeeded: false }]);
  };
  
  const removeSlot = (index) => {
    const newSeeded = seededPeserta.filter((_, i) => i !== index);
    setSeededPeserta(newSeeded);
  };
  
  // --- 2. VALIDASI INPUT SLOT AGAR TIDAK BABLAS ---
  const handleSlotChange = (index, value) => {
    let numValue = value === "" ? "" : Number(value);
    
    // Jika angka yang dimasukkan lebih besar dari kapasitas bagan, kunci di angka maksimal
    if (numValue > maxSlot) numValue = maxSlot;
    // Mencegah angka negatif
    if (numValue < 0) numValue = 1;

    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], slot: numValue };
    setSeededPeserta(newSeeded);
  };

  const toggleSeed = (index) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index].isSeeded = !newSeeded[index].isSeeded;
    setSeededPeserta(newSeeded);
  };

  const save = () => {
    // Validasi sebelum simpan: Cek apakah ada slot duplikat
    const activeSlots = seededPeserta.filter(p => p.slot !== "");
    const slotValues = activeSlots.map(p => p.slot);
    const hasDuplicate = new Set(slotValues).size !== slotValues.length;

    const isIncomplete = seededPeserta.some(p => !p.id || !p.slot);
    if (isIncomplete) {
      alert("⚠️ Pastikan semua baris sudah memilih Peserta dan No. Slot!");
      return;
    }

    if (hasDuplicate) {
      alert("⚠️ Ada nomor slot yang duplikat! Satu slot hanya bisa diisi satu peserta.");
      return;
    }

    const finalSeeded = seededPeserta.filter(p => p.id && p.slot);
    onSaved(finalSeeded);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">Pengundian &amp; Plotting Bagan</h3>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                  Kapasitas: Slot 1 - {maxSlot}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Atur penempatan unggulan (Seed) dan plotting manual sebelum pengundian
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
          {/* Info Kapasitas */}
          <div className="mb-6 flex items-start sm:items-center gap-3 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-slate-700 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">
              Sistem mendeteksi <strong>{pesertaList.length} Peserta</strong>, kapasitas bagan adalah <strong>{maxSlot} Slot</strong>. Peserta tanpa penempatan khusus akan diundi otomatis secara acak.
            </span>
          </div>

          {seededPeserta.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-300 mb-3 shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-bold text-sm">Belum ada penempatan khusus</p>
              <p className="text-slate-400 text-xs max-w-sm mt-1 mb-4">
                Semua posisi slot akan diundi secara acak oleh sistem. Klik tombol di bawah jika ingin menentukan Seed atau posisi tertentu.
              </p>
              <button 
                onClick={addSlot} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95"
              >
                <Plus size={14} /> Tambah Slot Khusus
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {seededPeserta.map((seeded, index) => {
                const isInvalid = seeded.slot > maxSlot;
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border transition-all ${
                      seeded.isSeeded 
                        ? 'border-amber-300 bg-amber-50/40 shadow-xs' 
                        : 'border-slate-200/80 bg-slate-50/40 hover:bg-white'
                    }`}
                  >
                    {/* Index Indicator */}
                    <div className="hidden sm:flex w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-400 font-bold text-xs items-center justify-center shrink-0">
                      #{index + 1}
                    </div>

                    {/* Select Peserta */}
                    <div className="flex-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Peserta</label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        value={seeded.id || ""}
                        onChange={(e) => handleChange(index, e.target.value)}
                      >
                        <option value="">Pilih Peserta...</option>
                        {pesertaList.map((p) => {
                          const isAlreadyChosen = selectedIds.includes(p.id) && seeded.id !== p.id;
                          if (isAlreadyChosen) return null;

                          return (
                            <option key={p.id} value={p.id}>
                              {p.namaTim || p.namaLengkap}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Input Slot */}
                      <div className="w-24 sm:w-28 shrink-0">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block text-center">No. Slot</label>
                        <input
                          type="number"
                          min="1"
                          max={maxSlot}
                          placeholder={`1-${maxSlot}`}
                          className={`w-full bg-white border rounded-xl px-3 py-2 text-base text-center font-extrabold outline-none transition-all
                            ${isInvalid 
                              ? 'border-rose-400 text-rose-600 bg-rose-50 focus:ring-2 focus:ring-rose-500/20' 
                              : 'border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'}`}
                          value={seeded.slot || ""}
                          onChange={(e) => handleSlotChange(index, e.target.value)}
                        />
                      </div>

                      {/* Tipe Toggle */}
                      <div className="w-32 sm:w-36 shrink-0 flex flex-col items-center">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Tipe</label>
                        <button
                          type="button"
                          onClick={() => toggleSeed(index)}
                          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 ${
                            seeded.isSeeded 
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                          }`}
                        >
                          <Star size={13} className={seeded.isSeeded ? 'fill-white' : ''} />
                          {seeded.isSeeded ? "SEED" : "MANUAL"}
                        </button>
                      </div>

                      {/* Remove Button */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-extrabold text-transparent mb-1 block select-none">x</span>
                        <button 
                          onClick={() => removeSlot(index)} 
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
          
          <button 
            onClick={addSlot} 
            className="w-full mt-4 py-3.5 border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 text-slate-500 hover:text-amber-700 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Plus size={16} /> Tambah Baris Penempatan
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>Slot yang kosong akan diundi acak secara transparan.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={onClose} 
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Batal
            </button>
            <button 
              onClick={save} 
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-sm transition-all"
            >
              Simpan &amp; Mulai Undian
            </button>
          </div>  
        </div>
      </div>
    </div>
  );
}