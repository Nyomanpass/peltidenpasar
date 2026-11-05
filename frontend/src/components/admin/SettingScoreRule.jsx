import { useEffect, useState } from "react";
import api from "../../api";
import {
  Sliders,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AlertMessage from "../AlertMessage";

export default function SettingScoreRule() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
    name: "",
  });
  const [editId, setEditId] = useState(null);

  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    jumlahSet: 3,
    gamePerSet: 6,
    useDeuce: true,
    tieBreakPoint: 7,
    finalTieBreakPoint: 10,
  });

  const fetchRules = async () => {
    try {
      const res = await api.get("/score-rules");
      setRules(res.data);
    } catch (err) {
      console.error("Gagal mengambil score rules:", err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // UPDATE MODE
        await api.put(`/score-rules/${editId}`, form);
        setSuccess("Score rule berhasil diperbarui");
      } else {
        // CREATE MODE
        await api.post("/score-rules", form);
        setSuccess("Score rule berhasil ditambahkan");
      }

      fetchRules();
      resetForm();
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan rule");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      jumlahSet: 3,
      gamePerSet: 6,
      useDeuce: true,
      tieBreakPoint: 7,
      finalTieBreakPoint: 10,
    });
    setEditId(null);
  };

  const handleEdit = (rule) => {
    setForm({
      name: rule.name,
      jumlahSet: rule.jumlahSet,
      gamePerSet: rule.gamePerSet,
      useDeuce: rule.useDeuce,
      tieBreakPoint: rule.tieBreakPoint,
      finalTieBreakPoint: rule.finalTieBreakPoint,
    });
    setEditId(rule.id);
  };

  const handleDelete = (rule) => {
    setConfirmDelete({ show: true, id: rule.id, name: rule.name });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/score-rules/${confirmDelete.id}`);
      setSuccess("Score rule berhasil dihapus");
      fetchRules();
    } catch (err) {
      setError("Gagal menghapus score rule, masih digunakan di pertandingan");
    } finally {
      setConfirmDelete({ show: false, id: null, name: "" });
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";
  const labelClass =
    "text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
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

      {/* MODAL HAPUS */}
      {confirmDelete.show && (
        <AlertMessage
          type="warning"
          message={`Hapus aturan skor "${confirmDelete.name}"? Data yang sudah dihapus tidak bisa dikembalikan.`}
          onClose={() => setConfirmDelete({ show: false, id: null, name: "" })}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
            <button
              onClick={() =>
                setConfirmDelete({ show: false, id: null, name: "" })
              }
              className="flex-1 order-2 sm:order-1 min-h-[50px] px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-wider hover:bg-slate-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 order-1 sm:order-2 min-h-[50px] px-6 py-3 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
            >
              Ya, Hapus
            </button>
          </div>
        </AlertMessage>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-200/60 shadow-2xs">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Settings Score Rules
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Konfigurasi jumlah set, game, poin tie break, dan penggunaan deuce
            </p>
          </div>
        </div>

        <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {rules.length} Aturan Terdaftar
        </span>
      </div>

      {/* FORM ATURAN SKOR */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
          {/* Nama Rule */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className={labelClass}>
              Nama Rule <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: BO3 Super Tiebreak"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          {/* Jumlah Set */}
          <div className="sm:col-span-1 lg:col-span-1">
            <label className={labelClass}>Jumlah Set</label>
            <input
              type="number"
              min="1"
              max="5"
              value={form.jumlahSet}
              onChange={(e) =>
                setForm({
                  ...form,
                  jumlahSet:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className={inputClass}
              required
            />
          </div>

          {/* Game Per Set */}
          <div className="sm:col-span-1 lg:col-span-1">
            <label className={labelClass}>Game / Set</label>
            <input
              type="number"
              min="1"
              max="12"
              value={form.gamePerSet}
              onChange={(e) =>
                setForm({
                  ...form,
                  gamePerSet:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className={inputClass}
              required
            />
          </div>

          {/* Tie Break */}
          <div className="sm:col-span-1 lg:col-span-1">
            <label className={labelClass}>Tie Break</label>
            <input
              type="number"
              min="0"
              value={form.tieBreakPoint}
              onChange={(e) =>
                setForm({
                  ...form,
                  tieBreakPoint:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className={inputClass}
              required
            />
          </div>

          {/* Final Tie Break */}
          <div className="sm:col-span-1 lg:col-span-1">
            <label className={labelClass}>Final Tie Break</label>
            <input
              type="number"
              min="0"
              value={form.finalTieBreakPoint}
              onChange={(e) =>
                setForm({
                  ...form,
                  finalTieBreakPoint:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Row 2: Deuce Checkbox & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Deuce Checkbox */}
          <label
            htmlFor="useDeuceCheckbox"
            className="flex items-center gap-2.5 p-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-all select-none w-fit"
          >
            <input
              id="useDeuceCheckbox"
              type="checkbox"
              checked={form.useDeuce}
              onChange={(e) =>
                setForm({ ...form, useDeuce: e.target.checked })
              }
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">
              Gunakan Sistem Deuce
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                <X size={14} /> Batal
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-95"
            >
              {editId ? <Save size={14} /> : <Plus size={14} />}
              {editId ? "Update Rule" : "Tambah Rule"}
            </button>
          </div>
        </div>
      </form>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5">Nama Rule</th>
              <th className="px-3 py-3.5 text-center">Set</th>
              <th className="px-3 py-3.5 text-center">Game/Set</th>
              <th className="px-3 py-3.5 text-center">Tie Break</th>
              <th className="px-3 py-3.5 text-center">Final TB</th>
              <th className="px-3 py-3.5 text-center">Deuce</th>
              <th className="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {rules.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                <td className="px-4 py-3 font-bold text-slate-800">
                  {r.name}
                </td>
                <td className="px-3 py-3 text-center font-semibold text-slate-700">
                  {r.jumlahSet}
                </td>
                <td className="px-3 py-3 text-center font-semibold text-slate-700">
                  {r.gamePerSet}
                </td>
                <td className="px-3 py-3 text-center font-semibold text-slate-700">
                  {r.tieBreakPoint} pt
                </td>
                <td className="px-3 py-3 text-center font-semibold text-slate-700">
                  {r.finalTieBreakPoint} pt
                </td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      r.useDeuce
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                        : "bg-slate-100 text-slate-500 border border-slate-200/60"
                    }`}
                  >
                    {r.useDeuce ? (
                      <>
                        <CheckCircle2 size={11} /> Pakai Deuce
                      </>
                    ) : (
                      <>
                        <XCircle size={11} /> Tanpa Deuce
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(r)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200/60 transition-all active:scale-95"
                      title="Edit Rule"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all active:scale-95"
                      title="Hapus Rule"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 px-4 text-slate-400 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100">
                      <Sliders size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Belum ada score rule terdaftar.
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Gunakan form di atas untuk membuat aturan skor pertandingan baru.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
