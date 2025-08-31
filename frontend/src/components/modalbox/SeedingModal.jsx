import { useState } from "react";

export default function SeedingModal({ pesertaList, onClose, onSaved }) {
  const [seededPeserta, setSeededPeserta] = useState([]);

  const handleChange = (index, value) => {
    const newSeeded = [...seededPeserta];
    newSeeded[index] = { ...newSeeded[index], id: Number(value) };
    setSeededPeserta(newSeeded);
  };
  
  const addSlot = () => {
    setSeededPeserta([...seededPeserta, { id: null, slot: "" }]);
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

  const save = () => {
    const finalSeeded = seededPeserta.filter(p => p.id && p.slot);
    onSaved(finalSeeded);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded shadow w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="font-bold mb-3">Atur Peserta Unggulan (Seeding)</h3>

        {seededPeserta.map((seeded, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <select
              className="border p-2 w-full"
              value={seeded.id || ""}
              onChange={(e) => handleChange(index, e.target.value)}
            >
              <option value="">Pilih Peserta</option>
              {pesertaList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaLengkap}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Slot"
              className="border p-2 w-20"
              value={seeded.slot || ""}
              onChange={(e) => handleSlotChange(index, e.target.value)}
            />
            <button onClick={() => removeSlot(index)} className="px-2 py-1 bg-red-500 text-white rounded">
              -
            </button>
          </div>
        ))}
        
        <button onClick={addSlot} className="px-3 py-1 mt-2 bg-green-600 text-white rounded">
          Tambah Slot
        </button>

        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Batal
          </button>
          <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded">
            Undi
          </button>
        </div>
      </div>
    </div>
  );
}