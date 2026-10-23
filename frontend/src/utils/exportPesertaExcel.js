import * as XLSX from "xlsx";
import api from "../api";

/**
 * Export data peserta Single dan Double ke dalam 1 file Excel (beda sheet).
 * 
 * Mendukung parameter objek { tournamentId, tournamentName, kelompokUmurList, doubleTeamsList }
 * maupun parameter terpisah untuk kompatibilitas.
 */
export async function exportPesertaToExcel(arg1, arg2) {
  let tournamentId = null;
  let tournamentName = "";
  let kelompokUmurList = null;
  let doubleTeamsList = null;

  if (typeof arg1 === "object" && !Array.isArray(arg1) && arg1 !== null) {
    tournamentId = arg1.tournamentId;
    tournamentName = arg1.tournamentName;
    kelompokUmurList = arg1.kelompokUmurList;
    doubleTeamsList = arg1.doubleTeamsList;
  } else {
    kelompokUmurList = arg1;
    tournamentName = arg2;
  }

  const idToUse =
    tournamentId || localStorage.getItem("selectedTournament");
  const nameToUse =
    tournamentName ||
    localStorage.getItem("selectedTournamentName") ||
    "Turnamen";

  // 1. Dapatkan data Peserta Tunggal (Single) jika belum ada
  if (!kelompokUmurList || kelompokUmurList.length === 0) {
    if (idToUse) {
      try {
        const res = await api.get(
          `/admin/peserta/kelompok-umur?tournamentId=${idToUse}`
        );
        kelompokUmurList = res.data || [];
      } catch {
        try {
          const resPublic = await api.get(
            `/peserta/kelompok-umur?tournamentId=${idToUse}`
          );
          kelompokUmurList = resPublic.data || [];
        } catch {
          kelompokUmurList = [];
        }
      }
    } else {
      kelompokUmurList = [];
    }
  }

  // 2. Dapatkan data Peserta Ganda (Double) jika belum ada
  if (!doubleTeamsList || doubleTeamsList.length === 0) {
    if (idToUse) {
      try {
        const resDouble = await api.get(
          `/double-teams?tournamentId=${idToUse}`
        );
        doubleTeamsList = resDouble.data || [];
      } catch {
        doubleTeamsList = [];
      }
    } else {
      doubleTeamsList = [];
    }
  }

  // ===== SHEET 1: PESERTA TUNGGAL (SINGLE) =====
  let singleCounter = 1;
  const rowsSingle = (kelompokUmurList || []).flatMap((ku) =>
    (ku.peserta || []).map((p) => ({
      No: singleCounter++,
      "Kelompok Umur": ku.nama || "-",
      "Nama Lengkap": p.namaLengkap || "-",
      NIK: p.nik || "-",
      "No. WhatsApp": p.nomorWhatsapp || "-",
      "Tanggal Lahir": p.tanggalLahir || "-",
      "Asal Sekolah": p.asalSekolah || "-",
      Status: p.status || "-",
    }))
  );

  const wsSingle =
    rowsSingle.length > 0
      ? XLSX.utils.json_to_sheet(rowsSingle)
      : XLSX.utils.json_to_sheet([{ Keterangan: "Belum ada data peserta tunggal" }]);

  wsSingle["!cols"] = [
    { wch: 6 },  // No
    { wch: 18 }, // Kelompok Umur
    { wch: 28 }, // Nama Lengkap
    { wch: 22 }, // NIK
    { wch: 18 }, // No. WhatsApp
    { wch: 16 }, // Tanggal Lahir
    { wch: 28 }, // Asal Sekolah
    { wch: 14 }, // Status
  ];

  // ===== SHEET 2: PESERTA GANDA (DOUBLE) =====
  let doubleCounter = 1;
  const rowsDouble = (doubleTeamsList || []).map((team) => {
    const kuNama =
      team.KelompokUmur?.nama ||
      (team.kelompokUmurId ? `KU-${team.kelompokUmurId}` : "-");

    return {
      No: doubleCounter++,
      "Kategori Ganda": `Ganda ${kuNama}`,
      "Nama Pemain 1": team.Player1?.namaLengkap || "-",
      "NIK Pemain 1": team.Player1?.nik || "-",
      "Kontak Pemain 1": team.Player1?.nomorWhatsapp || "-",
      "Tgl Lahir Pemain 1": team.Player1?.tanggalLahir || "-",
      "Nama Pemain 2": team.Player2?.namaLengkap || "-",
      "NIK Pemain 2": team.Player2?.nik || "-",
      "Kontak Pemain 2": team.Player2?.nomorWhatsapp || "-",
      "Tgl Lahir Pemain 2": team.Player2?.tanggalLahir || "-",
    };
  });

  const wsDouble =
    rowsDouble.length > 0
      ? XLSX.utils.json_to_sheet(rowsDouble)
      : XLSX.utils.json_to_sheet([{ Keterangan: "Belum ada data tim ganda" }]);

  wsDouble["!cols"] = [
    { wch: 6 },  // No
    { wch: 20 }, // Kategori Ganda
    { wch: 28 }, // Nama Pemain 1
    { wch: 22 }, // NIK Pemain 1
    { wch: 18 }, // Kontak Pemain 1
    { wch: 16 }, // Tgl Lahir Pemain 1
    { wch: 28 }, // Nama Pemain 2
    { wch: 22 }, // NIK Pemain 2
    { wch: 18 }, // Kontak Pemain 2
    { wch: 16 }, // Tgl Lahir Pemain 2
  ];

  // ===== GABUNGKAN DALAM 1 WORKBOOK (2 SHEET) =====
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSingle, "Peserta Tunggal");
  XLSX.utils.book_append_sheet(wb, wsDouble, "Peserta Ganda");

  // Simpan file
  const safeFilename = (nameToUse || "Turnamen").replace(/[/\\?%*:|"<>]/g, "_");
  XLSX.writeFile(wb, `Peserta_${safeFilename}.xlsx`);
}
