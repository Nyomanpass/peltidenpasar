import { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarDashboard from "../components/NavbarDashboard";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-visible relative">
      <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        <NavbarDashboard
          toggleSidebar={() => setIsOpen(!isOpen)}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isCollapsed={isCollapsed}
        />

        <main className="p-6 pt-28 md:pt-28 overflow-visible relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
