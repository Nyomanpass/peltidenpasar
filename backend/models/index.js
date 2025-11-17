// models/index.js
import { Tournament } from "./TournamentModel.js";
import { Peserta } from "./PesertaModel.js";
import { KelompokUmur } from "./KelompokUmurModel.js";
import { Lapangan } from "./LapanganModel.js";
import { Jadwal } from "./JadwalModel.js";
import { Match } from "./MatchModel.js";
import { Bagan } from "./BaganModel.js";

// -------------------
// 🔹 Relasi Tournament
// -------------------
Tournament.hasMany(Peserta, { foreignKey: "tournamentId", as: "peserta" });
Peserta.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament" });

Tournament.hasMany(Bagan, { foreignKey: "tournamentId", as: "bagan" });
Bagan.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament" });

Tournament.hasMany(Match, { foreignKey: "tournamentId", as: "matches" });
Match.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament" });

Tournament.hasMany(Jadwal, { foreignKey: "tournamentId", as: "jadwal" });
Jadwal.belongsTo(Tournament, { foreignKey: "tournamentId", as: "tournament" });

// -------------------
// 🔹 Relasi lain (sudah ada)
// -------------------
KelompokUmur.hasMany(Peserta, { foreignKey: "kelompokUmurId", as: "peserta" });
Peserta.belongsTo(KelompokUmur, { foreignKey: "kelompokUmurId", as: "kelompokUmur" });

Lapangan.hasMany(Jadwal, { foreignKey: "lapanganId", as: "jadwal" });
Jadwal.belongsTo(Lapangan, { foreignKey: "lapanganId", as: "lapangan" });

Match.hasOne(Jadwal, { foreignKey: "matchId", as: "jadwal" });
Jadwal.belongsTo(Match, { foreignKey: "matchId", as: "match" });

// -------------------
// 🔹 Export semua model
// -------------------
export {
  Tournament,
  Peserta,
  KelompokUmur,
  Lapangan,
  Jadwal,
  Match,
  Bagan,
};
