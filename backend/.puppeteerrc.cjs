const { join } = require("path");

/**
 * Konfigurasi Puppeteer agar direktori cache Chrome terisolasi
 * di dalam folder backend/.cache dan tidak bergantung pada direktori user OS.
 */
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
