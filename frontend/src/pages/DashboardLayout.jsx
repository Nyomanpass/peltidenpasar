import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarDashboard from "../components/NavbarDashboard";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false); // drawer (mobile)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "1";
    } catch {
      return false;
    }
  }); // mode mini (desktop)

  const setCollapsed = (value) => {
    setIsCollapsed(value);
    try {
      localStorage.setItem("sidebarCollapsed", value ? "1" : "0");
    } catch {
      /* penyimpanan browser tidak tersedia — abaikan */
    }
  };

  // Escape menutup drawer mobile
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div className="min-h-screen md:flex">
      <Sidebar
        isOpen={isOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsOpen(false)}
        onExpand={() => setCollapsed(false)}
        onToggleCollapse={() => setCollapsed(!isCollapsed)}
      />

      {/* Latar gelap di belakang drawer (mobile) */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[35] bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`flex-1 transition-[margin] duration-300 motion-reduce:transition-none ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <NavbarDashboard
          toggleSidebar={() => setIsOpen((v) => !v)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setCollapsed(!isCollapsed)}
        />

        <main
          className="
            pt-24 md:pt-28
            p-4 md:p-6
            overflow-visible relative
          "
        >
          <div
            className="
              max-w-7xl mx-auto w-full
              md:max-w-none md:mx-0
            "
          >
            <div
              className="
                bg-white shadow-lg border border-gray-100 rounded-xl p-4
                md:bg-transparent md:shadow-none md:border-0 md:rounded-none md:p-0
              "
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
