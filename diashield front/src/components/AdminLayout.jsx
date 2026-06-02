import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const sidebarLinks = [
    { path: "/admin", label: "Dashboard", icon: "dashboard" },
    { path: "/admin/users", label: "Users", icon: "people" },
    { path: "/admin/doctors", label: "Doctors", icon: "stethoscope" },
    { path: "/admin/appointments", label: "Appointments", icon: "calendar_today" },
    { path: "/admin/predictions", label: "Predictions", icon: "query_stats" },
    { path: "/admin/activity-logs", label: "Activity Logs", icon: "monitoring" },
  ];

  return (
    <div className="min-h-screen bg-[#020B2D] text-white flex">
      <div className="w-[280px] bg-[#0A122F]/90 backdrop-blur-xl border-r border-white/10 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <div>
            <h1 className="text-purple-400 text-2xl font-bold">DiaShield</h1>
            <p className="text-gray-400 text-sm">Admin Panel</p>
          </div>
        </div>
        <div className="space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/admin"}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 p-3 rounded-xl bg-purple-500/20 text-purple-400 transition-all"
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
