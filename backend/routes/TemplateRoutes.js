import express from "express";
import multer from "multer";
import path from "path";

import {
  getTemplate,
  uploadTemplate,
  updateTemplate,
  deleteTemplate,
  downloadSertifikat,
  previewSertifikat,
  getValidasiSertifikat
} from "../controllers/TemplateController.js";

import { getJuara } from "../controllers/MatchController.js";

const router = express.Router();

// 🔥 storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/templates/");
  },
  filename: (req, file, cb) => {
    cb(null, "template-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// routes
router.get("/template", getTemplate);
router.post("/template", upload.single("file"), uploadTemplate);
router.put("/template", upload.single("file"), updateTemplate);
router.delete("/template", deleteTemplate);
router.get("/sertifikat/download", downloadSertifikat);
router.get("/sertifikat/preview", previewSertifikat);
router.get("/sertifikat/:baganId", getJuara);
router.get("/sertifikat/valid/:id", getValidasiSertifikat);

export default router;