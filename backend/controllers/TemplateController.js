import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import QRCode from "qrcode";

import { getJuara } from "./MatchController.js";
import { Bagan } from "../models/BaganModel.js";
import { KelompokUmur } from "../models/KelompokUmurModel.js";
import { TemplateSertifikat } from "../models/TemplateSertifikat.js";
const FRONTEND_URL = process.env.CLIENT_ORIGIN;
const BACKEND_URL = process.env.VITE_API_URL;

// 🔥 biar bisa pakai __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 file penyimpanan template
const TEMPLATE_FILE = path.join(__dirname, "../template.json");

// helper ambil template
const getSavedTemplate = async (tournamentId) => {
  const template = await TemplateSertifikat.findOne({
    where: {
      tournamentId,
      isActive: true
    }
  });

  return template || null;
};

// ==========================
// GET TEMPLATE
// ==========================
export const getTemplate = async (req, res) => {
  try {
    const { tournamentId } = req.query;

    const template = await TemplateSertifikat.findOne({
      where: {
        tournamentId,
        isActive: true
      }
    });

    res.json(template || null);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// CREATE TEMPLATE
// ==========================
export const uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File wajib" });
    }

    const { tournamentId } = req.body;

    const filePath = `/uploads/templates/${req.file.filename}`;

    // 🔥 nonaktifkan template lama
    await TemplateSertifikat.update(
      { isActive: false },
      { where: { tournamentId } }
    );

    const newTemplate = await TemplateSertifikat.create({
      tournamentId,
      image: filePath,
      isActive: true
    });

    res.json({
      message: "Template berhasil dibuat",
      data: newTemplate
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// UPDATE TEMPLATE
// ==========================
export const updateTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File wajib" });
    }

    const { tournamentId } = req.body;

    const old = await TemplateSertifikat.findOne({
      where: { tournamentId, isActive: true }
    });

    // 🔥 hapus file lama
    if (old?.image) {
      const oldPath = path.join(process.cwd(), old.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const newPath = `/uploads/templates/${req.file.filename}`;

    // 🔥 update DB
    await TemplateSertifikat.update(
      { isActive: false },
      { where: { tournamentId } }
    );

    const newTemplate = await TemplateSertifikat.create({
      tournamentId,
      image: newPath,
      isActive: true
    });

    res.json({
      message: "Template berhasil diupdate",
      data: newTemplate
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// DELETE TEMPLATE
// ==========================
export const deleteTemplate = async (req, res) => {
  try {
    const { tournamentId } = req.query;

    const old = await TemplateSertifikat.findOne({
      where: { tournamentId, isActive: true }
    });

    if (old?.image) {
      const filePath = path.join(process.cwd(), old.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await TemplateSertifikat.destroy({
      where: { tournamentId }
    });

    res.json({ message: "Template berhasil dihapus" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= HELPER =================
const getValidasiData = async (id, tournamentId, baganId) => {
  const b = await Bagan.findOne({
    where: { id: baganId, tournamentId },
    include: [{ model: KelompokUmur, attributes: ["nama"] }]
  });

  if (!b) return { valid: false };

  const result = await getJuaraInternal(b.id);

  let found = null;
  let posisi = null;
  let pair = null; // 🔥 TAMBAHAN

  const check = (p, pos) => {
    if (!p) return false;

    // 🔥 DOUBLE
    if (p.Player1?.id == id || p.Player2?.id == id) {
      found = p.Player1?.id == id ? p.Player1 : p.Player2;
      pair = p; // 🔥 simpan pasangan
      posisi = pos;
      return true;
    }

    // 🔥 SINGLE
    if (p.id == id) {
      found = p;
      posisi = pos;
      return true;
    }

    return false;
  };

  if (check(result?.juara1, 1)) {}
  else if (check(result?.juara2, 2)) {}
  else if (result?.juara3) {
    for (const j of result.juara3) {
      if (check(j, 3)) break;
    }
  }

  if (!found) return { valid: false };

  // ===============================
  // 🔥 FORMAT UMUR & GENDER
  // ===============================
  const text = b?.KelompokUmur?.nama?.toUpperCase() || "";

  let gender = "";
  if (text.includes("PA")) gender = "PUTRA";
  if (text.includes("PI")) gender = "PUTRI";

  const isOpen = text.includes("OPEN");
  const umur = text.match(/\d+/)?.[0];

  let bagianUmur = "";

  if (isOpen) {
    bagianUmur = "Kelompok Open";
  } else if (umur) {
    bagianUmur = `Kelompok Umur ${umur} Tahun`;
  } else {
    bagianUmur = "Kelompok Umur";
  }

  // ===============================
  // 🔥 KATEGORI
  // ===============================
  const kategori = b.kategori === "double" ? "DOUBLE" : "SINGLE";

  // ===============================
  // 🔥 NAMA FINAL (INI INTI)
  // ===============================
  let namaFinal = found.namaLengkap;

  if (b.kategori === "double" && pair) {
    namaFinal = `${pair.Player1.namaLengkap} / ${pair.Player2.namaLengkap}`;
  }

  // ===============================
  // 🔥 FINAL
  // ===============================
  const sebagai = `Juara ke-${posisi} ${kategori} ${gender} ${bagianUmur}`;

  return {
    valid: true,
    nama: namaFinal, // 🔥 sudah gabung
    sebagai,
    kategori,
    tipe: b.tipe?.toUpperCase()
  };
};

export const downloadSertifikat = async (req, res) => {
  try {
    const { id, tournamentId, baganId } = req.query;

    if (!id || !tournamentId || !baganId) {
      return res.status(400).json({ error: "ID, tournament & bagan wajib" });
    }

    // =========================
    // 🔥 AMBIL DATA
    // =========================
    const result = await getValidasiData(id, tournamentId, baganId);

    // =========================
    // 🔥 VALIDASI
    // =========================
    if (!result || !result.valid) {
      return res.status(404).json({ error: "Tidak valid" });
    }

    // =========================
    // 🔥 FORMAT NAMA (KAPITAL)
    // =========================
    if (result.nama) {
      result.nama = result.nama.toUpperCase();
    }

    // =========================
    // 🔥 CLASS LOGIC
    // =========================
    let namaClass = (result.kategori || "").toUpperCase();
    const len = result.nama?.length || 0;

    if (namaClass === "DOUBLE") {
      if (len > 80) {
        namaClass += " verylong";
      } else if (len >= 55) {
        namaClass += " long";
      }
    }


    // =========================
    // 🔥 TEMPLATE
    // =========================
    const template = await getSavedTemplate(tournamentId);

    const verifyUrl = `${FRONTEND_URL}/sertifikat/${id}?tournamentId=${tournamentId}&baganId=${baganId}`;
    const qr = await QRCode.toDataURL(verifyUrl);

    let html = fs.readFileSync(
      path.join(__dirname, "../templates/sertifikat.html"),
      "utf8"
    );

    html = html
      .replace("{{nama}}", result.nama)
      .replace("{{sebagai}}", result.sebagai)
      .replace("{{qr}}", qr)
      .replace("{{kategori}}", namaClass)
      .replace(
        "{{bg}}",
        `${BACKEND_URL.replace(/\/$/, "")}/${template.image.replace(/^\//, "")}`
      );

    // =========================
    // 🔥 GENERATE PDF
    // =========================
    const browser = await puppeteer.launch({
      executablePath:
        "/root/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${result.nama}.pdf`
    });

    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal generate sertifikat" });
  }
};

export const previewSertifikat = async (req, res) => {
  try {
    const { id, tournamentId, baganId } = req.query;

    if (!id || !tournamentId || !baganId) {
      return res.status(400).send("ID, tournament & bagan wajib");
    }

    // =========================
    // 🔥 AMBIL DATA
    // =========================
    const result = await getValidasiData(id, tournamentId, baganId);

    // =========================
    // 🔥 VALIDASI
    // =========================
    if (!result || !result.valid) {
      return res.status(404).send("Tidak valid");
    }

    // =========================
    // 🔥 FORMAT NAMA
    // =========================
    if (result.nama) {
      result.nama = result.nama.toUpperCase();
    }

    // =========================
    // 🔥 CLASS LOGIC
    // =========================
    let namaClass = (result.kategori || "").toUpperCase();
    const len = result.nama?.length || 0;

    if (namaClass === "DOUBLE") {
      if (len > 80) {
        namaClass += " verylong";
      } else if (len >= 55) {
        namaClass += " long";
      }
    }



    // =========================
    // 🔥 TEMPLATE
    // =========================
    const template = await getSavedTemplate(tournamentId);

    const verifyUrl = `${FRONTEND_URL}/sertifikat/${id}?tournamentId=${tournamentId}&baganId=${baganId}`;
    const qr = await QRCode.toDataURL(verifyUrl);

    let html = fs.readFileSync(
      path.join(__dirname, "../templates/sertifikat.html"),
      "utf8"
    );

    html = html
      .replace("{{nama}}", result.nama)
      .replace("{{sebagai}}", result.sebagai)
      .replace("{{qr}}", qr)
      .replace("{{kategori}}", namaClass)
      .replace(
        "{{bg}}",
        `${BACKEND_URL.replace(/\/$/, "")}/${template.image.replace(/^\//, "")}`
      );

    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error preview");
  }
};

const getJuaraInternal = async (baganId) => {
  const req = { params: { baganId } };

  let resultData = null;

  const res = {
    json: (data) => {
      resultData = data;
    }
  };

  await getJuara(req, res);

  return resultData;
};


export const getValidasiSertifikat = async (req, res) => {
  try {
    const { id } = req.params;
    const { tournamentId, baganId } = req.query;

    if (!tournamentId || !baganId) {
      return res.status(400).json({
        valid: false,
        message: "Tournament & bagan wajib"
      });
    }

    const template = await getSavedTemplate(tournamentId);

    const result = await getValidasiData(id, tournamentId, baganId); // 🔥 FIX

    if (!result.valid) {
      return res.status(404).json({
        valid: false,
        message: "Bukan juara"
      });
    }

    res.json({
      valid: true,
      nama: result.nama,
      sebagai: result.sebagai,
      kategori: result.kategori,
      tipe: result.tipe,
      template: template?.image
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};