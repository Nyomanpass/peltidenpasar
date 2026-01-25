import { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarDashboard from "../components/NavbarDashboard";
import { Outlet } from "react-router-dom";


export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} />
      <div className="flex-1 md:ml-72">
        <NavbarDashboard toggleSidebar={() => setIsOpen(!isOpen)}/>
        <main className="p-6 pt-28 md:pt-28">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
