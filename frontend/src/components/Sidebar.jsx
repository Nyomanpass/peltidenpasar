import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Trophy,
  X,
} from "lucide-react";
import api from "../api";
import { getMenuForRole, isItemActive } from "../config/menu";

/* ------------------------------------------------------------------ */
/*  Helper kecil                                                       */
/* ------------------------------------------------------------------ */

// Jari-jari sudut cekung tempat tab aktif menyatu dengan konten (px)
const CURVE = 32;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** Buka-tutup halus tanpa tinggi tetap; isi yang tertutup tidak bisa difokus. */
function Collapsible({ open, children }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none ${
        open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

/**
 * Tooltip untuk mode mini. Dirender lewat portal ke <body> supaya tidak
 * terpotong area scroll sidebar.
 */
function Tip({ label, enabled, children }) {
  const [pos, setPos] = useState(null);

  const show = (e) => {
    if (!enabled) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 10 });
  };
  const hide = () => setPos(null);

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {enabled &&
        pos &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[70] max-w-56 -translate-y-1/2 rounded-md bg-ink-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          >
            {label}
          </div>,
          document.body
        )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

function Sidebar({ isOpen, isCollapsed, onClose, onExpand, onToggleCollapse }) {
  const location = useLocation();
  const role = localStorage.getItem("role") || "admin";
  const groups = getMenuForRole(role);

  // Di mobile sidebar selalu tampil penuh; mode mini hanya berlaku di md ke atas.
  const hideMini = isCollapsed ? "md:hidden" : "";
  const centerMini = isCollapsed ? "md:justify-center md:px-0" : "";

  /* ---------- Turnamen yang dipilih ---------- */
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState(
    localStorage.getItem("selectedTournament") || ""
  );
  const [selectedName, setSelectedName] = useState(
    localStorage.getItem("selectedTournamentName") || ""
  );
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    api
      .get("/tournaments")
      .then((res) =>
        setTournaments(res.data.filter((t) => t.status === "aktif"))
      )
      .catch((err) => console.error("Fetch tournament error:", err));
  }, []);

  // Pilihan turnamen bisa berubah dari halaman lain (event yang sama dipakai Peserta, Bagan, dll.)
  useEffect(() => {
    const sync = () => {
      setSelectedId(localStorage.getItem("selectedTournament") || "");
      setSelectedName(localStorage.getItem("selectedTournamentName") || "");
    };
    window.addEventListener("tournament-changed", sync);
    return () => window.removeEventListener("tournament-changed", sync);
  }, []);

  const handleTournamentSelect = (t) => {
    localStorage.setItem("selectedTournament", t.id);
    localStorage.setItem("selectedTournamentName", t.name);
    setSelectedId(String(t.id));
    setSelectedName(t.name);
    setSwitcherOpen(false);
    window.dispatchEvent(new Event("tournament-changed"));
  };

  /* ---------- Submenu Tournament ---------- */
  // null = ikuti halaman aktif; true/false = sudah dibuka/ditutup manual
  const [tournamentManual, setTournamentManual] = useState(null);

  const params = new URLSearchParams(location.search);
  const activeLevel = params.get("level");

  /* ---------- Indikator tab aktif (bergeser + menyatu dengan konten) ---------- */
  const shellRef = useRef(null); // pembungkus area menu (tempat tab digambar)
  const navRef = useRef(null); // area menu yang bisa di-scroll
  const navInnerRef = useRef(null); // isi menu (diamati ukurannya)
  const indicatorRef = useRef(null);
  const placedOnce = useRef(false);

  const placeIndicator = useCallback((instant = false) => {
    const shell = shellRef.current;
    const nav = navRef.current;
    const ind = indicatorRef.current;
    if (!shell || !nav || !ind) return;

    // Baris aktif yang sedang terlihat (versi mini / mobile bisa ada dua di DOM)
    const row = [...nav.querySelectorAll("[data-nav-active]")].find(
      (el) => el.getClientRects().length > 0
    );
    if (!row) {
      ind.style.opacity = "0";
      return;
    }

    const r = row.getBoundingClientRect();
    const c = shell.getBoundingClientRect();
    // Penempatan pertama & saat scroll langsung; perpindahan menu meluncur.
    ind.style.transition = instant || !placedOnce.current ? "none" : "";
    // Tepi tab dibulatkan ke piksel layar nyata (mis. skala 125%) supaya
    // tidak ada baris buram di atas/bawah kapsul.
    const dpr = window.devicePixelRatio || 1;
    const snap = (v) => Math.round(v * dpr) / dpr;
    const top = snap(r.top);
    const bottom = snap(r.bottom);
    ind.style.height = `${bottom - top}px`;
    ind.style.top = `${top - c.top}px`;
    ind.style.opacity = "1";
    placedOnce.current = true;
  }, []);

  useLayoutEffect(() => {
    placeIndicator();
  }, [location.pathname, location.search, isCollapsed, role, placeIndicator]);

  // Submenu membuka/menutup atau font selesai dimuat → posisi baris bergeser
  useEffect(() => {
    const inner = navInnerRef.current;
    const shell = shellRef.current;
    if (!inner || !shell || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => placeIndicator());
    ro.observe(inner);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [placeIndicator]);

  return (
    <aside
      aria-label="Navigasi dashboard"
      className={`
        fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col
        bg-linear-to-b from-ink-900 to-ink-950
        transition-[transform,width] duration-300 ease-out motion-reduce:transition-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:max-w-none md:translate-x-0
        ${isCollapsed ? "md:w-20" : "md:w-64"}
      `}
    >
      {/* ===== HEADER: Tombol tutup drawer (mobile only) ===== */}
      <div className="flex h-14 shrink-0 items-center justify-end px-3 md:hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
          className={`rounded-md p-1.5 text-ink-300 hover:bg-white/10 hover:text-white ${focusRing}`}
        >
          <X size={20} />
        </button>
      </div>

      {/* Spacer atas di desktop (menggantikan area brand yang dulu) */}
      <div className="hidden md:block h-4 shrink-0" />

      {/* ===== TURNAMEN AKTIF ===== */}
      <div className="shrink-0 px-3 pt-3">
        {/* Mode lebar: satu baris pemilih */}
        <div className={hideMini}>
          <button
            type="button"
            onClick={() => setSwitcherOpen((v) => !v)}
            aria-expanded={switcherOpen}
            className={`group flex w-full items-start gap-3 rounded-lg px-3 py-[11px] text-center text-sm transition-colors hover:bg-white/[0.06] motion-reduce:transition-none ${focusRing}`}
          >
            <div className="flex flex-1 items-center justify-center gap-2">
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center justify-center"
            >
              <Trophy
                size={17}
                className={selectedName ? "text-primary" : "text-ink-500"}
              />
            </span>

            <span
              className={`line-clamp-2 break-words text-center font-semibold leading-5 ${
                selectedName ? "text-white" : "text-ink-300"
              }`}
            >
              {selectedName || "Pilih turnamen"}
            </span>
          </div>
            <ChevronsUpDown
              size={16}
              className="ml-auto mt-0.5 shrink-0 text-ink-500 transition-colors group-hover:text-ink-300"
            />
          </button>

          <Collapsible open={switcherOpen}>
            <ul className="ml-[1.4rem] mt-0.5 max-h-52 space-y-0.5 overflow-y-auto border-l border-white/10 pl-2">
              {tournaments.length === 0 && (
                <li className="px-3 py-2 text-xs text-ink-500">
                  Belum ada turnamen aktif.
                </li>
              )}
              {tournaments.map((t) => {
                const selected = String(t.id) === String(selectedId);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => handleTournamentSelect(t)}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors motion-reduce:transition-none ${focusRing} ${
                        selected
                          ? "font-semibold text-primary"
                          : "text-ink-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span className="line-clamp-2 break-words leading-5">{t.name}</span>
                      {selected && (
                        <Check size={15} className="ml-auto shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Collapsible>
        </div>

        {/* Mode mini: ikon saja; klik untuk melebarkan sidebar */}
        {isCollapsed && (
          <div className="hidden md:block">
            <Tip
              enabled
              label={`Turnamen: ${selectedName || "belum dipilih"}`}
            >
              <button
                type="button"
                onClick={onExpand}
                aria-label="Pilih turnamen"
                className={`flex w-full items-center justify-center rounded-lg py-[11px] text-primary transition-colors hover:bg-white/[0.06] motion-reduce:transition-none ${focusRing}`}
              >
                <Trophy size={19} />
              </button>
            </Tip>
          </div>
        )}

        {/* Pemisah turnamen aktif dan menu: garis memudar di kedua ujung */}
        <div
          aria-hidden="true"
          className="mx-1 mt-2.5 mb-0.5 h-px bg-linear-to-r from-transparent via-white/25 to-transparent"
        />
      </div>

      {/* ===== MENU ===== */}
      <div ref={shellRef} className="relative min-h-0 flex-1">
        {/* Tab putih yang meluncur ke menu aktif. Digambar di lapisan sendiri
            (di luar area scroll) supaya tepinya selalu tajam di semua skala
            layar. Di desktop ujung kanannya menempel ke konten dengan dua
            sudut cekung; di mobile jadi pil biasa. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span
            ref={indicatorRef}
            className="absolute left-3 right-3 top-0 rounded-lg bg-white opacity-0 transition-[top,height,opacity] duration-[450ms] ease-[cubic-bezier(0.34,1.35,0.64,1)] motion-reduce:transition-none md:-right-px md:rounded-l-full md:rounded-r-none"
          >
            <span
              className="absolute bottom-full right-0 hidden md:block"
              style={{
                width: CURVE,
                height: CURVE,
                background: `radial-gradient(circle at 0 0, transparent ${CURVE - 0.5}px, #fff ${CURVE + 0.5}px)`,
              }}
            />
            <span
              className="absolute right-0 top-full hidden md:block"
              style={{
                width: CURVE,
                height: CURVE,
                background: `radial-gradient(circle at 0 100%, transparent ${CURVE - 0.5}px, #fff ${CURVE + 0.5}px)`,
              }}
            />
          </span>
        </div>

      <nav
        ref={navRef}
        aria-label="Menu utama"
        onScroll={() => placeIndicator(true)}
        className="absolute inset-0 overflow-y-auto overscroll-contain pb-9 pl-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
       <div ref={navInnerRef}>
        {groups.map((group, gi) => (
          <div
            key={group.label}
            className={
              gi === 0
                ? isCollapsed
                  ? "pt-[34px]"
                  : "pt-2"
                : "mt-4"
            }
          >
            <p
              className={`px-3 pb-1.5 pr-6 text-xs font-medium text-ink-500 ${hideMini}`}
            >
              {group.label}
            </p>
            {isCollapsed && gi > 0 && (
              <div
                aria-hidden="true"
                className="ml-3 mr-6 mb-2 hidden border-t border-white/10 md:block"
              />
            )}

            <ul className="space-y-1.5 pr-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item, location.pathname, role);

                const iconEl = (
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.25 : 1.9}
                    className={`shrink-0 transition-colors motion-reduce:transition-none ${
                      active
                        ? "text-secondary delay-150 duration-200"
                        : "text-ink-500 duration-150 group-hover:text-ink-300"
                    }`}
                  />
                );

                // Warna teks aktif baru berganti setelah tab putih hampir sampai (delay)
                const rowClass = `group relative z-10 flex w-full items-center gap-3 rounded-lg px-3 py-[11px] text-sm transition-colors motion-reduce:transition-none ${centerMini} ${focusRing} ${
                  active
                    ? "font-semibold text-secondary delay-150 duration-200"
                    : "font-medium text-ink-300 duration-150 hover:bg-white/[0.06] hover:text-white"
                }`;
                const navActive = active ? "" : undefined;

                /* ----- Item dengan submenu (Tournament) ----- */
                if (item.children) {
                  const open = tournamentManual ?? active;

                  const accordion = (
                    <>
                      <button
                        type="button"
                        onClick={() => setTournamentManual(!open)}
                        aria-expanded={open}
                        data-nav-active={navActive}
                        className={rowClass}
                      >
                        {iconEl}
                        <span className="truncate">{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`ml-auto shrink-0 transition-[transform,color] duration-200 motion-reduce:transition-none ${
                            active ? "text-secondary/70" : "text-ink-500"
                          } ${open ? "rotate-180" : ""}`}
                        />
                      </button>

                      <Collapsible open={open}>
                        <ul className="ml-[1.4rem] mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                          {item.children.map((sub) => {
                            const subActive =
                              active && (activeLevel || "local") === sub.level;
                            return (
                              <li key={sub.level}>
                                <Link
                                  to={`${item.path}?level=${sub.level}`}
                                  onClick={onClose}
                                  aria-current={subActive ? "page" : undefined}
                                  className={`block rounded-md px-3 py-2 text-sm transition-colors motion-reduce:transition-none ${focusRing} ${
                                    subActive
                                      ? "font-semibold text-primary"
                                      : "text-ink-300 hover:bg-white/[0.06] hover:text-white"
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </Collapsible>
                    </>
                  );

                  // Mode mini (desktop): ikon saja, langsung ke level Local.
                  // Di mobile drawer tetap memakai accordion lengkap.
                  if (isCollapsed) {
                    return (
                      <li key={item.key}>
                        <div className="md:hidden">{accordion}</div>
                        <div className="hidden md:block">
                          <Tip label={item.label} enabled>
                            <Link
                              to={`${item.path}?level=local`}
                              aria-current={active ? "page" : undefined}
                              aria-label={item.label}
                              data-nav-active={navActive}
                              className={rowClass}
                            >
                              {iconEl}
                            </Link>
                          </Tip>
                        </div>
                      </li>
                    );
                  }

                  return <li key={item.key}>{accordion}</li>;
                }

                /* ----- Item biasa ----- */
                return (
                  <li key={item.key}>
                    <Tip label={item.label} enabled={isCollapsed}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        aria-label={isCollapsed ? item.label : undefined}
                        data-nav-active={navActive}
                        className={rowClass}
                      >
                        {iconEl}
                        <span className={`truncate ${hideMini}`}>
                          {item.label}
                        </span>
                      </Link>
                    </Tip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
       </div>
      </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
