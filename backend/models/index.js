// models/index.js
import { Peserta } from "./PesertaModel.js";
import { KelompokUmur } from "./KelompokUmurModel.js";
import { Lapangan } from "./LapanganModel.js";
import { Jadwal } from "./JadwalModel.js";
import { Match } from "./MatchModel.js";


// Relasi Peserta ↔ Kelompok Umur
KelompokUmur.hasMany(Peserta, { foreignKey: "kelompokUmurId", as: "peserta" });
Peserta.belongsTo(KelompokUmur, { foreignKey: "kelompokUmurId", as: "kelompokUmur" });

// Relasi Lapangan ↔ Jadwal
Lapangan.hasMany(Jadwal, { foreignKey: "lapanganId", as: "jadwal" });
Jadwal.belongsTo(Lapangan, { foreignKey: "lapanganId", as: "lapangan" });

Match.hasOne(Jadwal, { foreignKey: "matchId", as: "jadwal" });
Jadwal.belongsTo(Match, { foreignKey: "matchId", as: "match" });


export { Peserta, KelompokUmur, Lapangan, Jadwal, Match };
