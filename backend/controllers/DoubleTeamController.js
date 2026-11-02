import { DoubleTeam } from "../models/DoubleTeamModel.js";
import { Peserta } from "../models/PesertaModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";

// 1. FUNGSI CREATE (POST)
export const createDoubleTeam = async (req, res) => {
  // Destructuring menggunakan kelompokUmurId sesuai model terbaru
  const { player1Id, player2Id, tournamentId, kelompokUmurId } = req.body;

  try {
    const p1 = await Peserta.findByPk(player1Id);
    const p2 = await Peserta.findByPk(player2Id);
    const targetKU = await KelompokUmur.findByPk(kelompokUmurId);

    if (!p1 || !p2 || !targetKU) {
      return res.status(404).json({ msg: "Data peserta atau kategori tidak ditemukan." });
    }

    // Validasi Umur (Opsional namun disarankan)
    // Asumsi: Anda memiliki fungsi hitungUmur di backend atau field umur di model Peserta
    const hitungUmur = (tgl) => {
        const lahir = new Date(tgl);
        const hariIni = new Date();
        let age = hariIni.getFullYear() - lahir.getFullYear();
        return age;
    };

    if (hitungUmur(p1.tanggalLahir) > targetKU.umur || hitungUmur(p2.tanggalLahir) > targetKU.umur) {
      return res.status(400).json({ 
        msg: "Gagal! Salah satu pemain melebihi batas umur kategori ini." 
      });
    }

    // Simpan ke Database
    const newTeam = await DoubleTeam.create({
      player1Id,
      player2Id,
      tournamentId,
      kelompokUmurId, // Menggunakan field kelompokUmurId sesuai model
      namaTim: `${p1.namaLengkap} / ${p2.namaLengkap}`,
      status: "verified"
    });

    res.status(201).json({ msg: "Tim Ganda Berhasil Dibuat", data: newTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan server saat membuat tim." });
  }
};

// Atribut pemain untuk endpoint publik/umum (tanpa NIK dan nomor WA)
const PUBLIC_PLAYER_ATTRS = ["id", "namaLengkap", "tanggalLahir"];
// Atribut pemain untuk endpoint terproteksi admin/panitia (lengkap dengan NIK dan nomor WA)
const ADMIN_PLAYER_ATTRS = [...PUBLIC_PLAYER_ATTRS, "nik", "nomorWhatsapp"];

const findDoubleTeams = async (req, res, playerAttributes) => {
  try {
    const { tournamentId, kelompokUmurId } = req.query;

    const filter = { tournamentId };
    if (kelompokUmurId) {
      filter.kelompokUmurId = kelompokUmurId;
    }

    const teams = await DoubleTeam.findAll({
      where: filter,
      include: [
        { 
          model: Peserta, 
          as: "Player1", 
          attributes: playerAttributes 
        },
        { 
          model: Peserta, 
          as: "Player2", 
          attributes: playerAttributes 
        },
        { 
          model: KelompokUmur, 
          attributes: ["id", "nama", "umur"] 
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gagal mengambil data tim ganda." });
  }
};

// 2. FUNGSI GET (READ)
// Publik/dashboard umum: tanpa data pribadi NIK & WhatsApp
export const getDoubleTeams = (req, res) =>
  findDoubleTeams(req, res, PUBLIC_PLAYER_ATTRS);

// Khusus admin/panitia: dengan NIK dan WhatsApp
export const getDoubleTeamsAdmin = (req, res) =>
  findDoubleTeams(req, res, ADMIN_PLAYER_ATTRS);


export const deleteDoubleTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await DoubleTeam.findByPk(id);
    if (!team) return res.status(404).json({ msg: "Tim tidak ditemukan" });

    await team.destroy();
    res.status(200).json({ msg: "Tim Ganda berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};