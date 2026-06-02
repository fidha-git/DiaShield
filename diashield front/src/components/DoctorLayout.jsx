import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const sidebarLinks = [
  { path: "/doctor", label: "Dashboard", icon: "dashboard" },
  { path: "/doctor/appointments", label: "My Appointments", icon: "calendar_today" },
  { path: "/doctor/availability", label: "Availability Slots", icon: "schedule" },
  { path: "/doctor/notes", label: "Clinical Notes", icon: "description" },
  { path: "/doctor/prescriptions", label: "Prescriptions", icon: "medication" },
  { path: "/doctor/profile", label: "My Profile", icon: "person" },
  { path: "/doctor/settings", label: "Settings", icon: "settings" },
];

export default function DoctorLayout() {
  const navigate = useNavigate();

  return (
    <div className="portal-shell">
      <div className="portal-sidebar w-[280px] flex flex-col p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="material-symbols-outlined text-white text-2xl">stethoscope</span>
          </div>
          <div>
            <h1 className="text-sky-600 dark:text-sky-400 text-2xl font-bold tracking-tight">DiaShield</h1>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase tracking-wider">Doctor Portal</p>
          </div>
        </div>
        <div className="space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) => {
                return isActive
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold transition-all shadow-md shadow-sky-500/5 border border-sky-100 dark:border-slate-700/50"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-100 transition-all";
              }}
            >
              <span className="material-symbols-outlined text-xl">{link.icon}</span>
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}
          <div className="border-t border-sky-100 dark:border-slate-800/80 my-4" />
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 p-3 rounded-xl w-full text-left text-slate-400 dark:text-slate-500 hover:bg-sky-100/50 dark:hover:bg-slate-800/30 hover:text-slate-700 dark:hover:text-slate-300 transition-all mt-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Patient Portal
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              localStorage.removeItem("role");
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </div>
      <main className="portal-main overflow-auto flex flex-col">
        <div className="portal-topbar">
          <ThemeToggle />
        </div>
        <div className="portal-content-wrap flex-1">
          <div className="portal-page h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
