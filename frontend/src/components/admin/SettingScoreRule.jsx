import { useEffect, useState } from "react";
import api from "../../api";

export default function SettingScoreRule() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    jumlahSet: 0,
    gamePerSet: 0,
    useDeuce: true,
    tieBreakPoint: 0,
    finalTieBreakPoint: 0
  });

  const fetchRules = async () => {
    const res = await api.get("/score-rules");
    setRules(res.data);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/score-rules", form);
    fetchRules();
    setForm({
      name: "",
      jumlahSet: 3,
      gamePerSet: 6,
      useDeuce: true,
      tieBreakPoint: 7,
      finalTieBreakPoint: 10
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus rule ini?")) return;
    await api.delete(`/score-rules/${id}`);
    fetchRules();
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 mt-10">
  <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
    ⚙ Settings Score Rules
  </h1>

  {/* FORM */}
  <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap gap-4 items-end">

    <div className="flex flex-col flex-grow">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Nama Rule
      </label>
      <input
        placeholder="Contoh: BO3 Super Tiebreak"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none w-full shadow-sm"
        required
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Jumlah Set
      </label>
      <input
        type="number"
        value={form.jumlahSet}
        onChange={e => setForm({ ...form, jumlahSet: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-32 shadow-sm"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Game per Set
      </label>
      <input
        type="number"
        value={form.gamePerSet}
        onChange={e => setForm({ ...form, gamePerSet: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-32 shadow-sm"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Tie Break
      </label>
      <input
        type="number"
        value={form.tieBreakPoint}
        onChange={e => setForm({ ...form, tieBreakPoint: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-32 shadow-sm"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">
        Final Tie Break
      </label>
      <input
        type="number"
        value={form.finalTieBreakPoint}
        onChange={e => setForm({ ...form, finalTieBreakPoint: e.target.value })}
        className="border border-gray-300 px-4 py-3 rounded-xl w-36 shadow-sm"
      />
    </div>

    <div className="flex items-center gap-2 mt-6">
      <input
        type="checkbox"
        checked={form.useDeuce}
        onChange={e => setForm({ ...form, useDeuce: e.target.checked })}
      />
      <span className="text-sm font-semibold text-gray-700">Pakai Deuce</span>
    </div>

    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
    >
      Simpan Rule
    </button>
  </form>

  {/* TABLE */}
  <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
        <tr>
          <th className="px-5 py-3 text-left">Nama</th>
          <th className="px-5 py-3 text-center">Set</th>
          <th className="px-5 py-3 text-center">Game</th>
          <th className="px-5 py-3 text-center">TB</th>
          <th className="px-5 py-3 text-center">Final TB</th>
          <th className="px-5 py-3 text-center">Deuce</th>
          <th className="px-5 py-3 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {rules.map(r => (
          <tr key={r.id} className="hover:bg-yellow-50/50 transition">
            <td className="px-5 py-3 font-semibold text-gray-800">{r.name}</td>
            <td className="px-5 py-3 text-center">{r.jumlahSet}</td>
            <td className="px-5 py-3 text-center">{r.gamePerSet}</td>
            <td className="px-5 py-3 text-center">{r.tieBreakPoint}</td>
            <td className="px-5 py-3 text-center">{r.finalTieBreakPoint}</td>
            <td className="px-5 py-3 text-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${r.useDeuce ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {r.useDeuce ? "Ya" : "Tidak"}
              </span>
            </td>
            <td className="px-5 py-3 text-center">
              <button
                onClick={() => handleDelete(r.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                Hapus
              </button>
            </td>
          </tr>
        ))}

        {rules.length === 0 && (
          <tr>
            <td colSpan="7" className="text-center py-5 text-gray-500 italic">
              Belum ada score rule.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

  );
}
