import { Menu, LogOut, Bell, User, Settings, Globe, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import VerificationDrawer from "./VerificationDrawer";
import api from "../api";

function NavbarDashboard({ toggleSidebar, isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State untuk drawer verifikasi
  const [pendingUsers, setPendingUsers] = useState([]); // State untuk data pending

  const displayName = user?.name || "Admin";
  const displayEmail = user?.email || "";
  const role = user?.role || localStorage.getItem("role") || "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleGoToWebsite = () => {
    setIsProfileDropdownOpen(false);
    window.open("/");
  };

  const profileRef = useRef(null);

  const handleDropdownToggle = () => setIsProfileDropdownOpen((v) => !v);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsProfileDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileDropdownOpen]);

  // --- LOGIKA FETCH DAN HANDLER VERIFIKASI ---
  
  // 1. Fetch data peserta pending
  const fetchPendingUsers = async () => {
    try {
      const res = await api.get("/peserta?status=pending");
      setPendingUsers(res.data);
    } catch (err) {
      console.error("Gagal mengambil peserta pending:", err);
    }
  };

  // 2. Efek untuk fetch saat komponen dimuat
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Handler Verifikasi (Setuju)
  const handleVerify = async (id) => {
    try {
      await api.put(`/peserta/${id}/verify`, { status: "verified" });
      fetchPendingUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // Handler Tolak (Reject)
const handleReject = async (id, message) => {
  try {
    // 1. Cari data peserta dari state lokal SEBELUM dihapus di backend
    const user = pendingUsers.find(p => p.id === id);
    
    if (!user) {
     
      return;
    }

    // 2. Panggil API untuk hapus data di backend
    await api.put(`/peserta/${id}/verify`, { 
      status: "rejected", 
      alasan: message 
    });

    // 3. Jalankan logika WhatsApp
    let phone = user.nomorWhatsapp; // Pastikan nama field sesuai dengan Model (nomorWhatsapp)
    
    if (phone) {
      // Format nomor: ubah 08... menjadi 628...
      if (phone.startsWith("0")) phone = "62" + phone.slice(1);
      
      const text = `Halo *${user.namaLengkap}*,\n\nMohon maaf, pendaftaran Anda di PELTI Denpasar ditolak dengan alasan:\n\n_"${message}"_\n\nSilakan melakukan pendaftaran ulang dengan data yang benar. Terima kasih.`;
      
      // Buka link WhatsApp
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, "_blank");
    }

    // 4. Refresh list (karena data sudah dihapus di backend, list akan otomatis berkurang)
    fetchPendingUsers();
   

  } catch (error) {
    console.error(error);
  
  }
};
  
  // 5. Handler Detail (Navigasi)
  const handleViewDetail = (id) => {
      setIsDrawerOpen(false); // Tutup drawer sebelum navigasi
      navigate(`/${role}/detail-peserta/${id}`);
  }
  // --- END LOGIKA FETCH DAN HANDLER VERIFIKASI ---


  return (
    <>
    <nav className={`
      fixed top-0 left-0 z-30 flex h-16 w-full items-center justify-between
      border-b border-gray-200 bg-white/90 px-4 backdrop-blur
      transition-[left,width] duration-300 motion-reduce:transition-none
      ${isCollapsed
        ? "md:left-20 md:w-[calc(100%-5rem)]"
        : "md:left-64 md:w-[calc(100%-16rem)]"}
    `}>

        {/* KIRI: logo + nama brand + tombol toggle sidebar */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Tombol buka sidebar (mobile) */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            onClick={toggleSidebar}
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo + Nama Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo PELTI"
              className="h-11 w-11 shrink-0 rounded-full object-contain ring-2 ring-gray-200"
              onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
            />
            <div className="hidden sm:block leading-tight">
              <p className="text-base font-bold text-gray-800 leading-none">PELTI Denpasar</p>
              <p className="text-xs text-gray-400 mt-0.5">Persatuan Tennis Seluruh Indonesia</p>
            </div>
          </div>
        </div>

        {/* KANAN: Notifikasi dan Menu Profil */}
        <div className="flex items-center gap-2">
          
          {/* Tombol Notifikasi (Lonceng) - Mengubah menjadi BUTTON Aksi */}
          {(role === "admin" || role === "panitia") && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`p-2.5 rounded-xl transition-all duration-200 relative border ${
                pendingUsers.length > 0
                  ? "bg-amber-50/80 text-amber-700 border-amber-200/80 hover:bg-amber-100 hover:border-amber-300 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent"
              } active:scale-95`}
              title="Notifikasi Verifikasi Peserta"
              aria-label="Notifikasi Verifikasi Peserta"
            >
              <Bell size={19} className={pendingUsers.length > 0 ? "text-amber-600" : ""} />
              {/* Badge Notifikasi Real-time */}
              {pendingUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white shadow-xs">
                    {pendingUsers.length > 9 ? "9+" : pendingUsers.length}
                  </span>
                </span>
              )}
            </button>
          )}

          {/* Tombol Pengaturan (di samping kanan lonceng) */}
          {role === "admin" && (
            <Link
              to="/admin/settings"
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent active:scale-95"
              title="Pengaturan"
              aria-label="Pengaturan"
            >
              <Settings size={19} />
            </Link>
          )}

          {/* Menu Profil dengan Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={handleDropdownToggle}
              aria-haspopup="menu"
              aria-expanded={isProfileDropdownOpen}
              className="flex items-center gap-2 p-1.5 pl-3 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 active:scale-95"
            >
              <span className="text-xs font-bold text-slate-700 hidden sm:inline capitalize">
                {displayName}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                {displayName[0]?.toUpperCase() || "A"}
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl shadow-xl bg-white border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Profil Dropdown */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs">
                    {displayName[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      {displayEmail || `Akun ${role}`}
                    </p>
                  </div>
                </div>

                {/* Menu Navigasi Dropdown */}
                <div className="p-1.5 space-y-0.5">
                  {role === "admin" && (
                    <Link
                      to="/admin/profile"
                      className="group flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User
                        size={15}
                        className="text-slate-400 group-hover:text-amber-500 transition-colors"
                      />
                      Profil Saya
                    </Link>
                  )}

                  <button
                    onClick={handleGoToWebsite}
                    className="group flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Globe
                      size={15}
                      className="text-slate-400 group-hover:text-blue-500 transition-colors"
                    />
                    Kembali ke Website
                  </button>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut
                        size={15}
                        className="text-rose-500 transition-transform group-hover:translate-x-0.5"
                      />
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* 2. Komponen Drawer Verifikasi */}
      {(role === "admin" || role === "panitia") && (
        <VerificationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          pendingUsers={pendingUsers}
          onVerify={handleVerify}
          onReject={handleReject}
          onViewDetail={handleViewDetail}
          role={role}
        />
      )}
    </>
  );
}

export default NavbarDashboard;