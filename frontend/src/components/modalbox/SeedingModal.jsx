import { useState } from "react";
import { Trash2, Plus, Info, Trophy, Star, Users, X } from "lucide-react"; 

export default function SeedingModal({ pesertaList, onClose, onSaved }) {
  const [seededPeserta, setSeededPeserta] = useState([]);

  const handleChange = (index, value) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], id: Number(value) };
    setSeededPeserta(newSeeded);
  };
  
  const addSlot = () => {
    // Tambahkan default isSeeded: false
    setSeededPeserta([...seededPeserta, { id: null, slot: "", isSeeded: false }]);
  };
  
  const removeSlot = (index) => {
    const newSeeded = seededPeserta.filter((_, i) => i !== index);
    setSeededPeserta(newSeeded);
  };
  
  const handleSlotChange = (index, value) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], slot: Number(value) };
    setSeededPeserta(newSeeded);
  };

  // Fungsi untuk toggle status unggulan (Seed)
  const toggleSeed = (index) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index].isSeeded = !newSeeded[index].isSeeded;
    setSeededPeserta(newSeeded);
  };

  const save = () => {
    const finalSeeded = seededPeserta.filter(p => p.id && p.slot);
    onSaved(finalSeeded);
  };

  return (
<div className="fixed inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm z-50 p-6">
  <div className="bg-white rounded-2xl shadow-xl w-full h-[85vh] max-w-5xl flex flex-col overflow-hidden animate-in fade-in duration-300">
    
    {/* Header Modal - Dibuat Bersih (Light Mode) */}
    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-[#D4A949]/10 p-2.5 rounded-xl">
          <Trophy className="w-7 h-7 text-[#D4A949]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-2xl tracking-tight">Plotting Peserta</h3>
          <p className="text-gray-400 text-sm font-medium italic">Atur posisi bagan: Unggulan atau Pemisahan Khusus</p>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
      >
        <X className="w-6 h-6 text-gray-400 group-hover:text-[#6E332C]" />
      </button>
    </div>

    {/* Body Modal - Area Putih Bersih */}
    <div className="flex-1 p-8 overflow-y-auto bg-white">
      {seededPeserta.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Belum ada pengaturan penempatan.</p>
          <button 
            onClick={addSlot}
            className="mt-2 text-[#D4A949] font-bold hover:underline underline-offset-4"
          >
            Klik untuk menambah peserta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {seededPeserta.map((seeded, index) => (
            <div key={index} className={`flex items-center space-x-6 p-4 rounded-xl border transition-all duration-200 ${seeded.isSeeded ? 'border-[#D4A949] bg-[#D4A949]/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
              
              {/* Pilihan Peserta */}
              <div className="flex-[2]">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Peserta</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-lg focus:ring-2 focus:ring-[#D4A949]/20 focus:border-[#D4A949] outline-none transition-all text-gray-700 font-medium"
                  value={seeded.id || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                >
                  <option value="">Pilih Peserta...</option>
                  {pesertaList.map((p) => (
                    <option key={p.id} value={p.id}>
                        {/* Jika ada namaTim tampilkan namaTim, jika tidak gunakan namaLengkap */}
                        {p.namaTim ? p.namaTim : p.namaLengkap}
                      </option>
                  ))}
                </select>
              </div>
              
              {/* Slot Angka */}
              <div className="w-28">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block text-center">Slot</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xl text-center focus:ring-2 focus:ring-[#D4A949]/20 focus:border-[#D4A949] outline-none font-bold text-[#6E332C]"
                  value={seeded.slot || ""}
                  onChange={(e) => handleSlotChange(index, e.target.value)}
                />
              </div>

              {/* Toggle Status */}
              <div className="w-40 flex flex-col items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tipe</label>
                <button
                  onClick={() => toggleSeed(index)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs transition-all border ${
                    seeded.isSeeded 
                    ? 'bg-[#D4A949] border-[#D4A949] text-white' 
                    : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${seeded.isSeeded ? 'fill-white' : ''}`} />
                  {seeded.isSeeded ? "SEED" : "MANUAL"}
                </button>
              </div>

              {/* Hapus */}
              <div className="pt-5">
                <button 
                  onClick={() => removeSlot(index)} 
                  className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={addSlot} 
        className="flex items-center justify-center gap-2 w-full mt-6 py-4 border-2 border-dashed border-gray-100 text-gray-400 rounded-xl hover:border-[#D4A949] hover:text-[#D4A949] transition-all font-bold group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        Tambah Slot Baru
      </button>
    </div>

    {/* Footer - Minimalis & Elegan */}
    <div className="p-8 bg-gray-50/50 border-t border-gray-100">
      <div className="flex items-start gap-4 bg-white p-5 rounded-xl mb-8 border border-gray-100 shadow-sm">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-md text-gray-500 leading-relaxed italic">
          <strong className="text-gray-700">Catatan:</strong> Peserta <span className="text-[#D4A949] font-bold text-xs px-1.5 py-0.5 border border-[#D4A949] rounded mx-1">SEED</span> adalah unggulan. Peserta <span className="text-[#6E332C] font-bold text-xs px-1.5 py-0.5 border border-[#6E332C] rounded mx-1">MANUAL</span> diatur agar tidak bertemu lawan tertentu. Pengundian otomatis dilakukan secara sah oleh sistem.
        </p>
      </div>

      <div className="flex justify-end items-center gap-6">
        <button 
          onClick={onClose} 
          className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Batalkan
        </button>
        <button 
          onClick={save} 
          className="px-10 py-3 bg-[#6E332C] hover:bg-[#522520] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          Simpan & Undi Sekarang
        </button>
      </div>
    </div>
  </div>
</div>
  );
}