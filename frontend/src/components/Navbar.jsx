import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

/* ================= ICON ================= */
const DownArrow = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const RightArrow = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const CloseIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/* ================= NAVBAR ================= */
export default function Navbar({ variant = "overlay" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Mode "overlay": transparan di atas hero saat di puncak, jadi floating putih saat scroll.
  // Mode "solid": langsung floating putih sejak awal (misal di halaman tanpa hero banner).
  const isOverlay = variant === "overlay";
  const overlay = isOverlay && !scrolled;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup mobile menu otomatis saat berpindah halaman
  const closeMobileMenu = () => {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    closeMobileMenu();
    setDropdownOpen({});
  }, [location.pathname]);

  // Kunci scroll body + tutup drawer dengan tombol Escape saat menu mobile terbuka
  useEffect(() => {
    if (!menuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);

    // Tutup drawer otomatis saat layar melebar ke ukuran desktop
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    desktopQuery.addEventListener("change", onDesktop);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onDesktop);
    };
  }, [menuOpen]);

  // MENU ITEMS
  const navItems = [
    { name: "Home", path: "/" },
    {
      name: "Tentang Kami",
      children: [
        { name: "Visi & Misi", path: "/visi-misi" },
        { name: "Struktur Organisasi", path: "/struktur-organisasi" },
        { name: "Kepengurusan", path: "/kepengurusan" },
        { name: "Club", path: "/anggota" },
        { name: "Berita", path: "/berita" },
      ],
    },
    { name: "Turnamen", path: "/tournament" },
    { name: "Atlet", path: "/atlet" },
  ];

  const isParentActive = (children) =>
    children.some((c) => location.pathname === c.path);

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold tracking-[0.01em] transition duration-200 py-1 border-b-2 ${
      isActive
        ? overlay
          ? "text-yellow-400 font-bold border-yellow-400"
          : "text-yellow-600 font-bold border-yellow-600"
        : overlay
          ? "text-white hover:text-yellow-300 border-transparent [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]"
          : "text-gray-700 hover:text-yellow-600 border-transparent"
    }`;

  return (
    <header className="fixed top-0 w-full z-50 px-2 sm:px-3 lg:px-4">
      {/* MAIN NAV (Selalu Floating Bar Modern) */}
      <nav
        className={`relative z-[70] mt-2 sm:mt-3 rounded-2xl px-5 sm:px-7 py-3 transition-all duration-300 flex justify-between items-center ${
          overlay
            ? "bg-transparent border border-transparent shadow-none"
            : "bg-white/95 border border-gray-200 backdrop-blur-md shadow-xl"
        }`}
      >
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="PELTI"
            className="w-10 md:w-11 object-contain"
          />
          <div>
            <h1
              className={`font-bold text-lg md:text-xl leading-tight transition-colors ${
                overlay
                  ? "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]"
                  : "text-gray-900"
              }`}
            >
              PELTI Denpasar
            </h1>
            <p
              className={`text-[10px] sm:text-xs transition-colors ${
                overlay
                  ? "text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]"
                  : "text-gray-500"
              }`}
            >
              Persatuan Lawn Tenis Indonesia
            </p>
          </div>
        </NavLink>

        {/* DESKTOP MENU — DI TENGAH */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.name} className="relative group py-2">
                <span
                  className={`cursor-pointer text-sm font-semibold tracking-[0.01em] flex items-center gap-1 transition duration-200 ${
                    overlay
                      ? isParentActive(item.children)
                        ? "text-yellow-400 font-bold"
                        : "text-white hover:text-yellow-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]"
                      : isParentActive(item.children)
                        ? "text-yellow-600 font-bold"
                        : "text-gray-700 hover:text-yellow-600"
                  }`}
                >
                  {item.name}
                  <DownArrow className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                </span>

                <div className="absolute left-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white shadow-xl rounded-xl border border-gray-100 py-2">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={({ isActive }) =>
                          `block px-4 py-2.5 text-sm transition duration-150 ${
                            isActive
                              ? "text-yellow-600 font-bold bg-yellow-50"
                              : "text-gray-700 hover:bg-gray-50 hover:text-yellow-600"
                          }`
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={item.name} to={item.path} className={linkClass}>
                {item.name}
              </NavLink>
            )
          )}
        </div>

        {/* KANAN: CTA + TOMBOL MOBILE */}
        <div className="flex items-center gap-3 shrink-0">
          {/* CTA — Tombol Pil */}
          <NavLink
            to="/contact"
            className={`hidden lg:inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
              overlay
                ? "bg-white text-gray-900 hover:bg-yellow-400"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            Hubungi Kami
          </NavLink>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`lg:hidden relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
              overlay ? "text-white" : "text-gray-800"
            }`}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ease-out ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ease-out ${
                  menuOpen ? "scale-x-0 opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ease-out ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER — SLIDE DARI KANAN */}
      <div
        onClick={closeMobileMenu}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-[6px] transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="mobile-drawer"
        aria-hidden={!menuOpen}
        inert={!menuOpen ? "" : undefined}
        className={`lg:hidden fixed inset-y-0 right-0 z-[90] flex w-[84%] max-w-[340px] flex-col overflow-hidden border-l border-white/10 bg-white shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen
            ? "translate-x-0"
            : "pointer-events-none translate-x-full"
        }`}
      >
        {/* DRAWER HEADER */}
        <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-white px-5 pb-5 pt-6">
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
              <img
                src="/logo.png"
                alt="Logo PELTI Denpasar"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-black leading-tight text-slate-900">
                PELTI Denpasar
              </p>
              <p className="whitespace-nowrap text-[7.5px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                Persatuan Lawn Tenis Indonesia
              </p>
            </div>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Tutup menu"
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* DRAWER NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() =>
                      setDropdownOpen((prev) => ({
                        ...prev,
                        [item.name]: !prev[item.name],
                      }))
                    }
                    aria-expanded={!!dropdownOpen[item.name]}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                      isParentActive(item.children)
                        ? "bg-yellow-50 text-yellow-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.name}
                      {isParentActive(item.children) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      )}
                    </span>
                    <DownArrow
                      className={`h-4 w-4 transition-transform duration-300 ${
                        dropdownOpen[item.name]
                          ? "rotate-180 text-yellow-600"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      dropdownOpen[item.name]
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                              `block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 ${
                                isActive
                                  ? "bg-yellow-50 font-bold text-yellow-700"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                              }`
                            }
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "bg-yellow-50 text-yellow-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    {item.name}
                    {location.pathname === item.path && (
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    )}
                  </span>
                  <RightArrow className="h-4 w-4 text-slate-300" />
                </NavLink>
              )
            )}
          </div>
        </nav>

        {/* DRAWER CTA */}
        <div className="shrink-0 border-t border-slate-100 bg-white p-4">
          <NavLink
            to="/contact"
            onClick={closeMobileMenu}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-3.5 text-xs font-black uppercase tracking-[0.15em] text-slate-900 shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:bg-yellow-300 active:scale-[0.99]"
          >
            Hubungi Kami
            <RightArrow className="h-4 w-4" />
          </NavLink>
          <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            PELTI Kota Denpasar
          </p>
        </div>
      </aside>
    </header>
  );
}
