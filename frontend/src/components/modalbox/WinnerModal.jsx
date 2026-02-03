import { useState, useEffect } from "react";
import api from "../../api";

function WinnerModal({ match, onClose, onSaved }) {
  const isDouble = !!match.doubleTeam1Id;

  const p1Id = isDouble ? match.doubleTeam1Id : match.peserta1Id;
  const p2Id = isDouble ? match.doubleTeam2Id : match.peserta2Id;

  const p1Name = isDouble
    ? match.doubleTeam1?.namaTim
    : match.peserta1?.namaLengkap;

  const p2Name = isDouble
    ? match.doubleTeam2?.namaTim
    : match.peserta2?.namaLengkap;

  const [rule, setRule] = useState(null);
  const [winnerId, setWinnerId] = useState("");
  const [loading, setLoading] = useState(false);

  // ambil ScoreRule dari backend
  useEffect(() => {
    if (!match.scoreRuleId) return;

    api.get(`/score-rules/${match.scoreRuleId}`).then(res => {
      setRule(res.data);
    });
  }, [match.scoreRuleId]);

  if (!rule) return null;

  // =========================
  // ✅ SIMPAN WO (AUTO POINT → GAME → SET)
  // =========================
 const handleWO = async () => {
  if (!winnerId) {
    alert("Pilih pemenang dulu");
    return;
  }

  const isDouble = !!match.doubleTeam1Id;
  const winnerSide = winnerId === p1Id ? "p1" : "p2";

  const finalSetWin = Math.ceil(rule.jumlahSet / 2);

  try {
    setLoading(true);

    // 1. Buat skor WO otomatis
    await api.post("/matches/manual-wo-point", {
      matchId: match.id,
      winnerSide
    });

    // 2. SET WINNER (INI YANG MEMICU BAGAN LANJUT)
    await api.patch(`/${match.id}/winner`, {
      winnerId: isDouble ? null : winnerId,
      winnerDoubleId: isDouble ? winnerId : null,
      score1: winnerSide === "p1" ? finalSetWin : 0,
      score2: winnerSide === "p2" ? finalSetWin : 0,
      isDouble
    });

    onSaved();
    onClose();
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan WO");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg">

        <h3 className="text-xl font-bold mb-2 text-center">
          Input Skor Manual (WO)
        </h3>

        <p className="text-sm text-gray-500 text-center mb-4">
          Rule: <b>{rule.name}</b> ({rule.jumlahSet} set, {rule.gamePerSet} game)
        </p>

        {/* PILIH PEMENANG */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setWinnerId(p1Id)}
            className={`flex-1 p-3 rounded-xl border font-bold transition ${
              winnerId === p1Id
                ? "bg-green-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {p1Name}
          </button>

          <button
            onClick={() => setWinnerId(p2Id)}
            className={`flex-1 p-3 rounded-xl border font-bold transition ${
              winnerId === p2Id
                ? "bg-green-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {p2Name}
          </button>
        </div>

        {/* INFO */}
        <p className="text-xs text-gray-500 text-center mb-4">
          Sistem akan otomatis membuat skor:
          <br />
          <b>
            sesuai aturan ({rule.gamePerSet}-0 per set sampai menang{" "}
            {Math.ceil(rule.jumlahSet / 2)} set)
          </b>
        </p>

        {/* TOMBOL WO */}
        <button
          onClick={handleWO}
          disabled={!winnerId || loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold disabled:bg-gray-300"
        >
          {loading ? "Menyimpan..." : "Menang WO (lawan tidak hadir)"}
        </button>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}

export default WinnerModal;
