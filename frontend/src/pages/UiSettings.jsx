import { useState } from "react";
import NewsSetting from "../pages/NewsSetting.jsx";
import SliderSetting from "../pages/SliderSetting.jsx";
import AthleteSetting from "./AthleteSetting.jsx";
import ClubSetting from "./ClubSetting.jsx";
import {
  LayoutGrid,
  Newspaper,
  Sliders,
  Award,
  Building2,
} from "lucide-react";

export default function UiSettings() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Semua", icon: LayoutGrid },
    { id: "news", label: "Berita & News", icon: Newspaper },
    { id: "slider", label: "Slider Banner", icon: Sliders },
    { id: "athlete", label: "Data Atlet", icon: Award },
    { id: "club", label: "Data Club", icon: Building2 },
  ];

  return (
    <div className="font-sans min-h-screen pb-16 space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            UI & Content Settings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Kelola konten publik website, artikel berita, banner slider beranda, data atlet, dan club tenis
          </p>
        </div>
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Icon
                size={14}
                className={isActive ? "text-amber-500" : "text-slate-400"}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= MAIN CONTENT SECTIONS ================= */}
      <div className="space-y-6">
        {(activeTab === "all" || activeTab === "news") && (
          <div className="animate-in fade-in duration-200">
            <NewsSetting />
          </div>
        )}

        {(activeTab === "all" || activeTab === "slider") && (
          <div className="animate-in fade-in duration-200">
            <SliderSetting />
          </div>
        )}

        {(activeTab === "all" || activeTab === "athlete") && (
          <div className="animate-in fade-in duration-200">
            <AthleteSetting />
          </div>
        )}

        {(activeTab === "all" || activeTab === "club") && (
          <div className="animate-in fade-in duration-200">
            <ClubSetting />
          </div>
        )}
      </div>
    </div>
  );
}