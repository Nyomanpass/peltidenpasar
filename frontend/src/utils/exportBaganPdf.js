// Export PDF bagan — digambar langsung (vector) dengan jsPDF, TANPA html2canvas.
// Hasilnya: teks tajam, tidak terpotong, tidak ada bayangan hitam, ukuran halaman
// menyesuaikan besar bagan, header/footer bertema maroon-gold.
import jsPDF from "jspdf";

/* ===================== TEMA ===================== */
const C = {
  maroon: [110, 51, 44],      // #6E332C
  maroonDark: [42, 19, 16],   // #2a1310
  gold: [234, 179, 8],        // #EAB308
  goldDark: [161, 98, 7],
  goldSoft: [254, 243, 199],
  goldPale: [255, 251, 235],
  ink: [30, 41, 59],
  muted: [100, 116, 139],
  faint: [148, 163, 184],
  line: [203, 213, 225],
  lineDark: [112, 112, 112],
  white: [255, 255, 255],
  slate50: [248, 250, 252],
  slate100: [241, 245, 249],
  scoreBg: [15, 23, 42],
};

/* ===================== LAYOUT (satuan pt) ===================== */
const L = {
  margin: 32,
  headerH: 84,
  footerH: 34,
  cardMinW: 190,
  cardMaxW: 330,
  slotH: 24,
  slotGap: 4,
  colGap: 56,
  titleH: 30,
  pitch: 86, // jarak vertikal antar match di babak pertama (sudah termasuk ruang badge skor)
  fontName: 10,
};
L.cardH = L.slotH * 2 + L.slotGap;

/* ===================== HELPER ===================== */
// Font bawaan jsPDF hanya mendukung Latin-1; buang karakter lain agar tidak jadi simbol aneh.
const clean = (s) =>
  String(s ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .normalize("NFC")
    .replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, "")
    .trim();

const setFill = (d, c) => d.setFillColor(c[0], c[1], c[2]);
const setDraw = (d, c) => d.setDrawColor(c[0], c[1], c[2]);
const setText = (d, c) => d.setTextColor(c[0], c[1], c[2]);

const textW = (d, str, size, style = "bold") => {
  d.setFont("helvetica", style);
  d.setFontSize(size);
  return d.getTextWidth(str);
};

// Potong teks dengan "..." hanya jika benar-benar melebihi lebar (fallback terakhir).
const fit = (d, str, maxW, size, style = "bold") => {
  const s = clean(str);
  if (textW(d, s, size, style) <= maxW) return s;
  let t = s;
  while (t.length > 1 && textW(d, t + "...", size, style) > maxW) t = t.slice(0, -1);
  return t.trimEnd() + "...";
};

const star = (d, cx, cy, r, color) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  setFill(d, color);
  const lines = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
  d.lines(lines, pts[0][0], pts[0][1], [1, 1], "F", true);
};

// Badge "JUARA" (pill maroon, teks emas, bintang) — lebar mengikuti teks, tidak pernah terpotong.
const badgeW = (d, label, size = 7) => textW(d, label, size) + 22;
const drawBadge = (d, x, cy, label, size = 7, h = 13) => {
  const w = badgeW(d, label, size);
  setFill(d, C.maroon);
  d.roundedRect(x, cy - h / 2, w, h, h / 2, h / 2, "F");
  star(d, x + 8, cy, 3, C.gold);
  d.setFont("helvetica", "bold");
  d.setFontSize(size);
  setText(d, C.gold);
  d.text(label, x + 14, cy, { baseline: "middle" });
  return w;
};

const loadLogo = async () => {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => resolve({ data: fr.result, w: img.width, h: img.height });
        img.onerror = () => resolve(null);
        img.src = fr.result;
      };
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/* ===================== HEADER & FOOTER ===================== */
function drawHeader(d, pageW, bagan, logo, subtitle) {
  setFill(d, C.maroon);
  d.rect(0, 0, pageW, L.headerH, "F");
  setFill(d, C.gold);
  d.rect(0, L.headerH, pageW, 4, "F");

  // Logo di kiri; teks tetap rata tengah halaman (area teks disisakan simetris agar tidak menabrak logo)
  let sideReserve = L.margin;
  if (logo) {
    const lh = 50;
    const lw = (logo.w / logo.h) * lh;
    try {
      d.addImage(logo.data, "PNG", L.margin, (L.headerH - lh) / 2, lw, lh);
      sideReserve = L.margin + lw + 14;
    } catch {
      /* logo gagal dimuat -> lanjut tanpa logo */
    }
  }

  const cx = pageW / 2;
  const maxW = pageW - sideReserve * 2;

  const tName = clean(bagan.Tournament?.name || "PELTI DENPASAR").toUpperCase();
  let size = 18;
  while (size > 10 && textW(d, tName, size) > maxW) size--;
  setText(d, C.gold);
  d.text(fit(d, tName, maxW, size), cx, 32, { align: "center", baseline: "middle" });

  const title = clean(bagan.nama || "Bagan");
  size = 13;
  while (size > 9 && textW(d, title, size) > maxW) size--;
  setText(d, C.white);
  d.text(fit(d, title, maxW, size), cx, 53, { align: "center", baseline: "middle" });

  if (subtitle) {
    setText(d, [230, 214, 210]);
    d.text(fit(d, subtitle, maxW, 9, "normal"), cx, 70, { align: "center", baseline: "middle" });
  }
}

function drawFooter(d, pageW, pageH, pageNo, totalPages) {
  const y = pageH - L.footerH;
  setFill(d, C.maroonDark);
  d.rect(0, y, pageW, L.footerH, "F");
  setFill(d, C.gold);
  d.rect(0, y, pageW, 2, "F");

  d.setFont("helvetica", "bold");
  d.setFontSize(8);
  setText(d, C.gold);
  d.text("PELTI DENPASAR OFFICIAL SYSTEM", L.margin, y + L.footerH / 2 + 1, { baseline: "middle" });

  d.setFont("helvetica", "normal");
  setText(d, [220, 205, 201]);
  const stamp = totalPages > 1
    ? `${new Date().toLocaleString("id-ID")}   |   Hal ${pageNo}/${totalPages}`
    : new Date().toLocaleString("id-ID");
  d.text(stamp, pageW - L.margin, y + L.footerH / 2 + 1, { align: "right", baseline: "middle" });
}

/* ===================== NAMA & SLOT ===================== */
const slotName = (m, idx, isDouble) => {
  if (isDouble) {
    const t = idx === 1 ? m.doubleTeam1 : m.doubleTeam2;
    const id = idx === 1 ? m.doubleTeam1Id : m.doubleTeam2Id;
    return t?.namaTim || (id ? "TBD" : "BYE");
  }
  const p = idx === 1 ? m.peserta1 : m.peserta2;
  const id = idx === 1 ? m.peserta1Id : m.peserta2Id;
  return p?.namaLengkap || (id ? "TBD" : "BYE");
};

const winnerFlags = (m, isDouble) => {
  const w1 = isDouble
    ? !!m.winnerDoubleId && m.winnerDoubleId === m.doubleTeam1Id
    : !!m.winnerId && m.winnerId === m.peserta1Id;
  const w2 = isDouble
    ? !!m.winnerDoubleId && m.winnerDoubleId === m.doubleTeam2Id
    : !!m.winnerId && m.winnerId === m.peserta2Id;
  return [w1, w2];
};

/* ===================== BAGAN ELIMINASI ===================== */
function computeLayout(d, rounds, isDouble) {
  // Lebar card mengikuti nama terpanjang supaya nama tidak terpotong.
  let longest = 0;
  rounds.forEach((r) =>
    r.seeds.forEach((s) => {
      if (!s.raw) return;
      [1, 2].forEach((i) => {
        longest = Math.max(longest, textW(d, clean(slotName(s.raw, i, isDouble)), L.fontName));
      });
    })
  );
  const cardW = Math.min(L.cardMaxW, Math.max(L.cardMinW, longest + 24 + 56)); // +ruang badge JUARA

  // Posisi vertikal: babak utama dimulai dari round 1, tiap babak berikut = rata-rata dua feeder.
  const hasPrelim = rounds[0]?.title === "Kualifikasi";
  const mainRounds = hasPrelim ? rounds.slice(1) : rounds;
  const centers = [];
  const first = mainRounds[0]?.seeds.length || 1;
  centers[0] = Array.from({ length: first }, (_, i) => i * L.pitch + L.pitch / 2);
  for (let r = 1; r < mainRounds.length; r++) {
    const n = mainRounds[r].seeds.length;
    centers[r] = Array.from({ length: n }, (_, j) => {
      const a = centers[r - 1][2 * j];
      const b = centers[r - 1][2 * j + 1];
      if (a !== undefined && b !== undefined) return (a + b) / 2;
      return a ?? b ?? j * L.pitch + L.pitch / 2;
    });
  }
  const allCenters = hasPrelim ? [centers[0], ...centers] : centers;

  const bodyH = first * L.pitch;
  const bodyW = rounds.length * cardW + (rounds.length - 1) * L.colGap;
  return { cardW, allCenters, bodyW, bodyH, hasPrelim };
}

function drawCard(d, x, cy, cardW, match, isDouble, isFinalRound, formatSetScore) {
  const [w1, w2] = winnerFlags(match, isDouble);
  const finished = w1 || w2;
  const top = cy - L.cardH / 2;
  const slots = [
    { name: slotName(match, 1, isDouble), win: w1, y: top },
    { name: slotName(match, 2, isDouble), win: w2, y: top + L.slotH + L.slotGap },
  ];

  const hasJuara = isFinalRound && finished;
  if (hasJuara) {
    // Bingkai emas statis (bukan shadow) untuk partai final yang sudah selesai
    setFill(d, C.goldPale);
    setDraw(d, C.gold);
    d.setLineWidth(1.2);
    d.roundedRect(x - 4, top - 4, cardW + 8, L.cardH + 8, 7, 7, "FD");
  }

  slots.forEach((s) => {
    const isChampion = isFinalRound && s.win;
    const isRunner = isFinalRound && finished && !s.win;
    let bg = C.white, border = C.line, txt = C.ink, style = "bold", lw = 0.8;
    if (isChampion) { bg = C.goldSoft; border = C.goldDark; txt = [69, 26, 3]; lw = 1.5; }
    else if (isRunner) { bg = C.slate100; border = [203, 213, 225]; txt = [71, 85, 105]; style = "normal"; }
    else if (s.win) { bg = [254, 249, 195]; border = C.gold; txt = [120, 53, 15]; lw = 1.3; }
    else if (finished) { bg = C.slate50; border = [226, 232, 240]; txt = C.faint; style = "normal"; }
    else if (s.name === "BYE" || s.name === "TBD") { txt = C.faint; style = "normal"; }

    setFill(d, bg);
    setDraw(d, border);
    d.setLineWidth(lw);
    d.roundedRect(x, s.y, cardW, L.slotH, 4, 4, "FD");

    const bw = isChampion ? badgeW(d, "JUARA") + 6 : 0;
    const avail = cardW - 16 - bw;
    d.setFont("helvetica", style);
    d.setFontSize(L.fontName);
    setText(d, txt);
    d.text(fit(d, s.name, avail, L.fontName, style), x + 8, s.y + L.slotH / 2, { baseline: "middle" });

    if (isChampion) drawBadge(d, x + cardW - bw + 2 - 4, s.y + L.slotH / 2, "JUARA");
  });

  // Badge skor — pill gelap rata dengan tepi atas card, lebar mengikuti teks
  const score = clean(formatSetScore(match));
  if (score) {
    const sw = textW(d, score, 8) + 14;
    const sh = 13;
    const sx = x + cardW - sw - 6;
    const sy = top - sh / 2 - 4;
    setFill(d, C.scoreBg);
    d.roundedRect(sx, sy, sw, sh, 3, 3, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(8);
    setText(d, C.white);
    d.text(score, sx + sw / 2, sy + sh / 2, { align: "center", baseline: "middle" });
  }
}

function drawBracketBody(d, ox, oy, rounds, isDouble, finalRound, formatSetScore, lay) {
  const { cardW, allCenters, hasPrelim } = lay;
  const colX = (r) => ox + r * (cardW + L.colGap);

  // 1) Judul babak
  rounds.forEach((r, ri) => {
    const title = clean(r.title).toUpperCase();
    const w = Math.max(cardW * 0.6, textW(d, title, 8) + 24);
    const x = colX(ri) + (cardW - w) / 2;
    setFill(d, C.maroon);
    d.roundedRect(x, oy, w, 18, 9, 9, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(8);
    setText(d, C.gold);
    d.text(title, x + w / 2, oy + 9, { align: "center", baseline: "middle" });
  });

  const by = oy + L.titleH;

  // 2) Garis penghubung (digambar dulu supaya berada di bawah card)
  setDraw(d, C.lineDark);
  d.setLineWidth(1);
  for (let ri = 0; ri < rounds.length - 1; ri++) {
    const xR = colX(ri) + cardW;
    const xN = colX(ri + 1);
    const xM = xR + L.colGap / 2;
    const cur = allCenters[ri];
    const nxt = allCenters[ri + 1];
    const isPrelimCol = hasPrelim && ri === 0;

    if (isPrelimCol) {
      // Kualifikasi -> match babak 1 yang sejajar
      cur.forEach((cy, i) => {
        if (rounds[0].seeds[i]?.isPlaceholder) return;
        d.line(xR, by + cy, xN, by + nxt[i] + 0);
      });
      continue;
    }
    nxt.forEach((ny, j) => {
      const a = cur[2 * j];
      const b = cur[2 * j + 1];
      const feeders = [a, b].filter((v) => v !== undefined);
      feeders.forEach((fy) => d.line(xR, by + fy, xM, by + fy));
      if (feeders.length === 2) d.line(xM, by + a, xM, by + b);
      const my = feeders.length === 2 ? (a + b) / 2 : feeders[0];
      d.line(xM, by + my, xN, by + ny);
    });
  }

  // 3) Card
  rounds.forEach((r, ri) => {
    r.seeds.forEach((s, si) => {
      if (s.isPlaceholder || !s.raw) return;
      const cy = by + allCenters[ri][si];
      const isFinalRound = ri === rounds.length - 1 || s.raw.round === finalRound;
      drawCard(d, colX(ri), cy, cardW, s.raw, isDouble, isFinalRound, formatSetScore);
    });
  });
}

/* ===================== HALAMAN KETERANGAN ===================== */
function seededList(bagan, isDouble) {
  const out = [];
  const seen = new Set();
  bagan.Matches.filter((m) => m.round === 1).forEach((m) => {
    [1, 2].forEach((i) => {
      const p = isDouble ? (i === 1 ? m.doubleTeam1 : m.doubleTeam2) : i === 1 ? m.peserta1 : m.peserta2;
      const id = isDouble ? (i === 1 ? m.doubleTeam1Id : m.doubleTeam2Id) : i === 1 ? m.peserta1Id : m.peserta2Id;
      if (id && p?.isSeeded && !seen.has(id)) {
        seen.add(id);
        out.push(isDouble ? p.namaTim || p.Player1?.namaLengkap : p.namaLengkap);
      }
    });
  });
  return out;
}

// Keterangan ringkas di bawah bagan. Mengembalikan tinggi blok. Dipanggil juga untuk mengukur (draw=false).
function drawKeterangan(d, x, y, w, bagan, isDouble, draw = true) {
  const gap = 16, pad = 12, headH = 26, chipH = 20, chipGap = 6;
  const colW = (w - gap) / 2;
  const seeds = seededList(bagan, isDouble).map(clean);

  // Susun chip seed dalam baris-baris (wrap) sesuai lebar kolom
  const rows = [[]];
  let cur = 0;
  const chipW = (n) => textW(d, fit(d, n, colW - pad * 2 - 40, 9, "normal"), 9, "normal") + 20 + 34;
  seeds.forEach((n) => {
    const cw = chipW(n);
    if (cur + cw > colW - pad * 2 && rows[rows.length - 1].length) {
      rows.push([]);
      cur = 0;
    }
    rows[rows.length - 1].push({ n, cw });
    cur += cw + chipGap;
  });
  const seedBodyH = seeds.length ? rows.length * (chipH + chipGap) - chipGap : 14;

  const note =
    "Beberapa peserta telah dipisahkan posisinya secara manual (plotting) guna menghindari pertemuan dini antar rekan satu tim atau instansi yang sama.";
  d.setFont("helvetica", "normal");
  d.setFontSize(8.5);
  const noteLines = d.splitTextToSize(note, colW - pad * 2);
  const noteBodyH = noteLines.length * 12;

  const boxH = headH + Math.max(seedBodyH, noteBodyH) + pad;
  if (!draw) return boxH;

  // Kotak seed
  setFill(d, C.goldPale);
  setDraw(d, C.gold);
  d.setLineWidth(0.8);
  d.roundedRect(x, y, colW, boxH, 8, 8, "FD");
  d.setFont("helvetica", "bold");
  d.setFontSize(9);
  setText(d, C.goldDark);
  d.text("PESERTA UNGGULAN (SEEDED)", x + pad, y + 14, { baseline: "middle" });

  if (!seeds.length) {
    d.setFont("helvetica", "italic");
    d.setFontSize(8.5);
    setText(d, C.muted);
    d.text("Tidak ada peserta unggulan.", x + pad, y + headH + 6, { baseline: "middle" });
  }
  rows.forEach((row, ri) => {
    let cx = x + pad;
    const cy = y + headH + ri * (chipH + chipGap);
    row.forEach(({ n, cw }) => {
      setFill(d, C.white);
      setDraw(d, [253, 230, 138]);
      d.setLineWidth(0.6);
      d.roundedRect(cx, cy, cw, chipH, 10, 10, "FD");
      d.setFont("helvetica", "normal");
      d.setFontSize(9);
      setText(d, C.ink);
      d.text(fit(d, n, cw - 40, 9, "normal"), cx + 10, cy + chipH / 2, { baseline: "middle" });
      const pw = textW(d, "SEED", 6.5) + 10;
      setFill(d, C.gold);
      d.roundedRect(cx + cw - pw - 4, cy + chipH / 2 - 6, pw, 12, 6, 6, "F");
      d.setFont("helvetica", "bold");
      d.setFontSize(6.5);
      setText(d, C.maroonDark);
      d.text("SEED", cx + cw - pw / 2 - 4, cy + chipH / 2, { align: "center", baseline: "middle" });
      cx += cw + chipGap;
    });
  });

  // Kotak plotting
  const px0 = x + colW + gap;
  setFill(d, C.slate50);
  setDraw(d, [226, 232, 240]);
  d.setLineWidth(0.8);
  d.roundedRect(px0, y, colW, boxH, 8, 8, "FD");
  d.setFont("helvetica", "bold");
  d.setFontSize(9);
  setText(d, C.maroon);
  d.text("PENEMPATAN KHUSUS (NON-SEED)", px0 + pad, y + 14, { baseline: "middle" });
  d.setFont("helvetica", "normal");
  d.setFontSize(8.5);
  setText(d, [71, 85, 105]);
  noteLines.forEach((ln, i) => d.text(ln, px0 + pad, y + headH + i * 12 + 5, { baseline: "middle" }));
  return boxH;
}

/* ===================== ROUND ROBIN ===================== */
function drawRoundRobin(d, bagan, isDouble, juaraRR, formatSetScore, logo, subtitle) {
  const pageW = 595.28; // A4 portrait
  const pageH = 841.89;
  const x = L.margin;
  const w = pageW - L.margin * 2;
  const cols = { no: 28, vs: 26, skor: 96 };
  const nameW = (w - cols.no - cols.vs - cols.skor) / 2;
  const startY = L.headerH + 4 + 22;
  const bottom = pageH - L.footerH - 14;

  const pages = [];
  let y = startY;
  let page = 0;
  const newPage = () => {
    if (page > 0) d.addPage([pageW, pageH], "p");
    drawHeader(d, pageW, bagan, logo, subtitle);
    pages.push(true);
    page++;
    y = startY;
  };
  newPage();

  const drawTableHead = () => {
    setFill(d, C.maroon);
    d.roundedRect(x, y, w, 22, 4, 4, "F");
    d.setFont("helvetica", "bold");
    d.setFontSize(8);
    setText(d, C.gold);
    const mid = y + 11;
    d.text("NO", x + cols.no / 2, mid, { align: "center", baseline: "middle" });
    d.text("PESERTA 1", x + cols.no + 8, mid, { baseline: "middle" });
    d.text("VS", x + cols.no + nameW + cols.vs / 2, mid, { align: "center", baseline: "middle" });
    d.text("PESERTA 2", x + cols.no + nameW + cols.vs + 8, mid, { baseline: "middle" });
    d.text("SKOR", x + w - cols.skor / 2, mid, { align: "center", baseline: "middle" });
    y += 26;
  };
  drawTableHead();

  const isJuara = (id) => !!juaraRR && id === juaraRR.id;

  bagan.Matches.forEach((m, i) => {
    const n1 = clean(slotName(m, 1, isDouble));
    const n2 = clean(slotName(m, 2, isDouble));
    const [w1, w2] = winnerFlags(m, isDouble);
    const j1 = isJuara(isDouble ? m.doubleTeam1Id : m.peserta1Id);
    const j2 = isJuara(isDouble ? m.doubleTeam2Id : m.peserta2Id);

    // Ukur badge DULU (textW mengubah font), baru atur font nama lalu pecah baris
    const bw1 = j1 ? badgeW(d, "JUARA") + 6 : 0;
    const bw2 = j2 ? badgeW(d, "JUARA") + 6 : 0;
    d.setFont("helvetica", w1 ? "bold" : "normal");
    d.setFontSize(10);
    const l1 = d.splitTextToSize(n1, nameW - 16 - bw1);
    d.setFont("helvetica", w2 ? "bold" : "normal");
    d.setFontSize(10);
    const l2 = d.splitTextToSize(n2, nameW - 16 - bw2);
    const rowH = Math.max(28, Math.max(l1.length, l2.length) * 13 + 14);

    if (y + rowH > bottom) {
      newPage();
      drawTableHead();
    }

    if (i % 2 === 0) {
      setFill(d, C.slate50);
      d.rect(x, y, w, rowH, "F");
    }
    setDraw(d, [226, 232, 240]);
    d.setLineWidth(0.5);
    d.line(x, y + rowH, x + w, y + rowH);

    const mid = y + rowH / 2;
    d.setFont("helvetica", "bold");
    d.setFontSize(9);
    setText(d, C.faint);
    d.text(String(i + 1), x + cols.no / 2, mid, { align: "center", baseline: "middle" });

    const drawName = (lines, win, nx, badge) => {
      d.setFont("helvetica", win ? "bold" : "normal");
      d.setFontSize(10);
      setText(d, win ? C.goldDark : C.ink);
      const lh = 13;
      lines.forEach((ln, k) => {
        d.text(ln, nx, mid - ((lines.length - 1) * lh) / 2 + k * lh, { baseline: "middle" });
      });
      if (badge) {
        // Badge rata kanan kolom nama -> tidak pernah menabrak kolom VS
        drawBadge(d, nx + nameW - 16 - badgeW(d, "JUARA"), mid, "JUARA");
      }
    };
    drawName(l1, w1, x + cols.no + 8, j1);
    drawName(l2, w2, x + cols.no + nameW + cols.vs + 8, j2);

    d.setFont("helvetica", "bold");
    d.setFontSize(7);
    setText(d, C.faint);
    d.text("VS", x + cols.no + nameW + cols.vs / 2, mid, { align: "center", baseline: "middle" });

    const sc = clean(formatSetScore(m));
    if (sc) {
      d.setFont("helvetica", "bold");
      d.setFontSize(9);
      const sw = Math.min(cols.skor - 8, d.getTextWidth(sc) + 14);
      setFill(d, C.scoreBg);
      d.roundedRect(x + w - cols.skor / 2 - sw / 2, mid - 8, sw, 16, 4, 4, "F");
      setText(d, C.white);
      d.text(fit(d, sc, sw - 8, 9), x + w - cols.skor / 2, mid, { align: "center", baseline: "middle" });
    } else {
      d.setFont("helvetica", "normal");
      d.setFontSize(10);
      setText(d, C.line);
      d.text("-", x + w - cols.skor / 2, mid, { align: "center", baseline: "middle" });
    }
    y += rowH;
  });

  return { pageW, pageH, pages: page };
}

/* ===================== ENTRY POINT ===================== */
export async function exportBaganPdf({
  bagan,
  rounds = [],
  isRoundRobin,
  isDouble,
  finalRound,
  juara,
  juaraRR,
  formatSetScore,
}) {
  const logo = await loadLogo();
  const subtitle = clean(
    [isRoundRobin ? "Round Robin" : "Eliminasi", isDouble ? "Ganda" : "Tunggal", bagan.KelompokUmur?.nama]
      .filter(Boolean)
      .join("  |  ")
  );

  /* --- Round robin: tabel A4, multi-halaman --- */
  if (isRoundRobin) {
    const d = new jsPDF({ unit: "pt", format: [595.28, 841.89], orientation: "p", compress: true });
    const { pageW, pageH, pages } = drawRoundRobin(d, bagan, isDouble, juaraRR, formatSetScore, logo, subtitle);
    for (let p = 1; p <= pages; p++) {
      d.setPage(p);
      drawFooter(d, pageW, pageH, p, pages);
    }
    d.save(`Bagan-${clean(bagan.nama) || "RoundRobin"}.pdf`);
    return;
  }

  /* --- Eliminasi: SATU halaman, ukuran menyesuaikan bagan --- */
  const measure = new jsPDF({ unit: "pt", format: [100, 100], compress: true });
  const lay = computeLayout(measure, rounds, isDouble);

  const contentW = lay.bodyW + 8; // +8 untuk bingkai emas final
  const pageW = Math.max(600, contentW + L.margin * 2);
  const ketW = pageW - L.margin * 2;
  const ketH = drawKeterangan(measure, 0, 0, ketW, bagan, isDouble, false);

  const bodyTop = L.headerH + 4 + 24;
  const ketY = bodyTop + L.titleH + lay.bodyH + 24;
  const pageH = ketY + ketH + 24 + L.footerH;

  const d = new jsPDF({
    unit: "pt",
    format: [pageW, pageH],
    orientation: pageW > pageH ? "l" : "p",
    compress: true,
  });

  drawHeader(d, pageW, bagan, logo, subtitle);
  const ox = (pageW - lay.bodyW) / 2;
  drawBracketBody(d, ox, bodyTop, rounds, isDouble, finalRound, formatSetScore, lay);
  drawKeterangan(d, L.margin, ketY, ketW, bagan, isDouble, true);
  drawFooter(d, pageW, pageH, 1, 1);

  d.save(`Bagan-${clean(bagan.nama) || "Eliminasi"}.pdf`);
}
