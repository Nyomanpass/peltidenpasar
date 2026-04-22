import express from "express";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const router = express.Router();

// 🔥 supaya bisa pakai __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 lokasi file template.json
const TEMPLATE_FILE = path.join(__dirname, "../template.json");

// 🔥 helper ambil template
const getTemplate = () => {
  if (!fs.existsSync(TEMPLATE_FILE)) return null;
  return JSON.parse(fs.readFileSync(TEMPLATE_FILE));
};

// =====================================
// 🚀 DOWNLOAD SERTIFIKAT
// =====================================
router.get("/sertifikat/download", async (req, res) => {
  try {
    console.log("API SERTIFIKAT KE PANGGIL ✅");

    const { nama, sebagai } = req.query;

    if (!nama || !sebagai) {
      return res.status(400).json({
        error: "Parameter nama & sebagai wajib diisi"
      });
    }

    // 🔥 ambil template
    const template = getTemplate();

    if (!template) {
      return res.status(400).json({
        error: "Template belum diupload"
      });
    }

    // 🔥 generate QR
    const verifyUrl = `http://localhost:3000/verify?nama=${encodeURIComponent(nama)}`;
    const qr = await QRCode.toDataURL(verifyUrl);

    // 🔥 load HTML template
    let html = fs.readFileSync(
      path.join(__dirname, "../templates/sertifikat.html"),
      "utf8"
    );

    // 🔥 inject data ke HTML
    html = html
      .replace("{{nama}}", nama)
      .replace("{{sebagai}}", sebagai)
      .replace("{{qr}}", qr)
      .replace("{{bg}}", `http://localhost:5004${template.path}`);

    // 🔥 jalankan puppeteer
    const browser = await puppeteer.launch({
      headless: "new"
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    // 🔥 generate PDF
    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true
    });

    await browser.close();

    // 🔥 kirim ke browser
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${nama}.pdf`
    });

    res.send(pdf);

  } catch (err) {
    console.error("ERROR SERTIFIKAT:", err);
    res.status(500).json({
      error: "Gagal generate sertifikat"
    });
  }
});

export default router;