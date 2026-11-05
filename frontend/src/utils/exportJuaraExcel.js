import * as XLSX from "xlsx";
import { hitungSelisih } from "./hitungSelisih";

export function exportJuaraToExcel(winnersData, tournamentName, filterKategori) {
  const wb = XLSX.utils.book_new();

  const used = new Set(["ringkasan juara"]);
  function sheetName(raw, fallback) {
    const base = (raw || fallback).replace(/[:\\/?*\[\]]/g, "-").substring(0, 25).trim() || fallback;
    let name = base, i = 2;
    while (used.has(name.toLowerCase())) name = `${base}-${i++}`;
    used.add(name.toLowerCase());
    return name;
  }

  // Sheet 1: Ringkasan
  const ringkasan = winnersData.map((d) => ({
    Bagan: d.baganNama,
    Kategori: d.kategori,
    "Juara 1": renderWinnerName(d.winners?.juara1),
    "Juara 2": renderWinnerName(d.winners?.juara2),
    "Juara 3": Array.isArray(d.winners?.juara3)
      ? d.winners.juara3.filter(Boolean).map(renderWinnerName).join(" & ")
      : renderWinnerName(d.winners?.juara3),
  }));
  const wsRingkasan = XLSX.utils.json_to_sheet(ringkasan);
  wsRingkasan["!cols"] = [
    { wch: 30 }, { wch: 12 }, { wch: 28 }, { wch: 28 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRingkasan, "Ringkasan Juara");

  // Sheet per-bagan untuk klasemen (kalau ada)
  winnersData.forEach((d) => {
    if (d.winners?.klasemen?.length) {
      const rows = d.winners.klasemen.map((p, i) => ({
        Peringkat: i + 1,
        Peserta: renderWinnerName(p.peserta),
        Poin: p.poin || 0,
        Menang: p.menang || 0,
        Kalah: p.kalah || 0,
        "Selisih": hitungSelisih(p),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [
        { wch: 10 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, sheetName(d.baganNama, `Bagan ${d.baganId}`));
    }
  });

  XLSX.writeFile(wb, `Juara_${tournamentName}_${filterKategori}.xlsx`);
}

function renderWinnerName(winner) {
  if (!winner) return "Belum Ditetapkan";
  if (winner.Player1 && winner.Player2) return `${winner.Player1.namaLengkap} / ${winner.Player2.namaLengkap}`;
  if (winner.namaTim) return winner.namaTim;
  return winner.namaLengkap || "N/A";
}
