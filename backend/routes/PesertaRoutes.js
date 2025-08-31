// routes/PesertaRoutes.js
import express from "express";
import {
  getPesertaByStatus,
  getPesertaById,
  createPeserta,
  updatePeserta,
  deletePeserta,
  upload,
  verifyPeserta,
  getPesertaByKelompokUmur,
  getPesertaFiltered
} from "../controllers/PesertaController.js";

const router = express.Router();

router.get("/peserta", getPesertaByStatus);
router.get('/peserta/kelompok-umur', getPesertaByKelompokUmur);
router.get('/pesertafilter', getPesertaFiltered),
router.get("/peserta/:id", getPesertaById);
router.post("/peserta", upload.single("fotoKartu"), createPeserta);
router.put("/peserta/:id", upload.single("fotoKartu"), updatePeserta);
router.delete("/peserta/:id", deletePeserta);
router.put('/peserta/:id/verify', verifyPeserta);

export default router;
