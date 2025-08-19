import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role = "peserta" } = req.body;

    // Cek konfirmasi password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password dan konfirmasi password tidak sama" });
    }

    // Validasi password: minimal 8 karakter, ada huruf besar, huruf kecil, dan angka
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, serta angka"
      });
    }

    // Cek apakah email sudah terdaftar
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "Email Sudah Terdaftar" });
    }

    // Enkripsi password dan simpan user baru
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });

    return res.status(201).json({ 
      message: "Pendaftaran berhasil",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email Tidak Terdaftar" });
    }

    // Cek password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Password Salah" });
    }

    // Cek status akun
    if (user.status !== "verified") {
      return res.status(403).json({ message: "Akun Anda belum diverifikasi oleh admin" });
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};


export const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "createdAt"]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};
