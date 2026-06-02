import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-[#020B2D] text-white flex">
      <div className="w-[280px] bg-[#0A122F]/90 backdrop-blur-xl border-r border-white/10 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="material-symbols-outlined">stethoscope</span>
          </div>
          <div>
            <h1 className="text-cyan-400 text-2xl font-bold">DiaShield</h1>
            <p className="text-gray-400 text-sm">Doctor Portal</p>
          </div>
        </div>
        <div className="space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/doctor"}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 p-3 rounded-xl bg-cyan-500/20 text-cyan-400 transition-all"
                  : "flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-300 transition-all"
              }
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="border-t border-white/10 my-4" />
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 p-3 rounded-xl w-full text-left text-gray-400 hover:bg-white/10"
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
            className="w-full flex items-center gap-3 p-3 mt-2 rounded-xl text-red-400 hover:bg-red-500/10"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </div>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
