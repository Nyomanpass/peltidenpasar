import * as XLSX from "xlsx";

export function exportPesertaToExcel(kelompokUmurList, tournamentName) {
  const rows = kelompokUmurList.flatMap((ku) =>
    (ku.peserta || []).map((p) => ({
      "Kelompok Umur": ku.nama,
      "Nama Lengkap": p.namaLengkap,
      "NIK": p.nik || "-",
      "No. WhatsApp": p.nomorWhatsapp,
      "Tanggal Lahir": p.tanggalLahir,
      "Asal Sekolah": p.asalSekolah || "-",
      "Status": p.status,
    }))
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 18 }, { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 28 }, { wch: 12 },
  ]; // lebar kolom biar rapi

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Peserta");
  XLSX.writeFile(wb, `Peserta_${tournamentName || "Turnamen"}.xlsx`);
}
