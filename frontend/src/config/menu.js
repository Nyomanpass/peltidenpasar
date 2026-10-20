import {
  Users,
  List,
  Calendar,
  ClipboardList,
  Trophy,
  FileBadge,
  Award,
  Settings,
  Monitor,
} from "lucide-react";

/**
 * Satu-satunya sumber definisi menu dashboard.
 *
 * - `to`     : path relatif terhadap /{role}/ (prefix role ditambahkan otomatis)
 * - `match`  : daftar segmen path yang membuat item ini tampil "aktif"
 *              (mis. halaman detail & turunan ikut menyalakan menu induknya)
 * - `roles`  : role yang boleh melihat menu ini
 * - `children`: submenu (khusus Tournament), pakai query ?level=...
 */
const ALL = ["admin", "panitia", "wasit"];

export const MENU_GROUPS = [
  {
    label: "Peserta dan bagan",
    items: [
      {
        key: "peserta",
        label: "Peserta",
        to: "peserta",
        icon: Users,
        roles: ALL,
        match: ["peserta", "detail-peserta", "peserta-ganda"],
      },
      {
        key: "bagan",
        label: "Bagan",
        to: "bagan-peserta",
        icon: List,
        roles: ALL,
        match: ["bagan-peserta", "bagan-view"],
      },
    ],
  },
  {
    label: "Pertandingan",
    items: [
      {
        key: "jadwal",
        label: "Jadwal pertandingan",
        to: "jadwal-pertandingan",
        icon: Calendar,
        roles: ALL,
        match: ["jadwal-pertandingan"],
      },
      {
        key: "skor",
        label: "Skor",
        to: "skor",
        icon: ClipboardList,
        roles: ALL,
        match: ["skor"],
      },
      {
        key: "hasil",
        label: "Hasil pertandingan",
        to: "hasil-pertandingan",
        icon: Trophy,
        roles: ["admin", "panitia"],
        match: ["hasil-pertandingan"],
      },
    ],
  },
  {
    label: "Manajemen",
    items: [
      {
        key: "sertifikat",
        label: "Sertifikat",
        to: "sertifikat",
        icon: FileBadge,
        roles: ["admin"],
        match: ["sertifikat"],
      },
      {
        key: "tournament",
        label: "Tournament",
        to: "tournament",
        icon: Award,
        roles: ["admin"],
        match: ["tournament"],
        children: [
          { label: "Local", level: "local" },
          { label: "Nasional", level: "nasional" },
          { label: "Internasional", level: "internasional" },
        ],
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        key: "settings",
        label: "Game settings",
        to: "settings",
        icon: Settings,
        roles: ["admin"],
        match: ["settings"],
      },
      {
        key: "uisettings",
        label: "UI settings",
        to: "uisettings",
        icon: Monitor,
        roles: ["admin"],
        match: ["uisettings"],
      },
    ],
  },
];

/** Menu yang boleh dilihat role tertentu, lengkap dengan path final. */
export function getMenuForRole(role) {
  const base = `/${role}`;
  return MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => item.roles.includes(role))
      .map((item) => ({ ...item, path: `${base}/${item.to}` })),
  })).filter((group) => group.items.length > 0);
}

/** True jika pathname sekarang termasuk salah satu `match` milik item. */
export function isItemActive(item, pathname, role) {
  const base = `/${role}`;
  return item.match.some(
    (segment) =>
      pathname === `${base}/${segment}` ||
      pathname.startsWith(`${base}/${segment}/`) ||
      pathname.startsWith(`${base}/${segment}-`)
  );
}

/** Judul halaman untuk navbar, diambil dari menu yang sedang aktif. */
export function getPageTitle(pathname, role) {
  if (pathname === `/${role}/profile`) return "Profil";
  for (const group of getMenuForRole(role)) {
    for (const item of group.items) {
      if (isItemActive(item, pathname, role)) return item.label;
    }
  }
  return "Dashboard";
}
