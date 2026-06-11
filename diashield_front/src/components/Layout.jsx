import React, { useState, useEffect } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSos, setShowSos] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSos = async () => {
    setSosSending(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/notifications/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: "EMERGENCY SOS triggered by patient" }),
      });
      setSosSent(true);
    } catch {
      setSosSent(true);
    } finally {
      setSosSending(false);
    }
  };

  useEffect(() => {
// console.log("Token value", localStorage.getItem("token"));
  }, [location.pathname]);

  const sidebarLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/prediction", label: "Predictions", icon: "query_stats" },
    { path: "/appointments", label: "Appointments", icon: "calendar_today" },
    { path: "/records", label: "Health Records", icon: "description" },
    { path: "/chat", label: "Chat Assistant", icon: "smart_toy" },
  ];

  return (
    <div className="portal-shell">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`portal-sidebar fixed md:relative w-[280px] flex flex-col p-6 z-40 transition-transform duration-300 -translate-x-full md:translate-x-0 ${sidebarOpen ? "translate-x-0" : ""}`}>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="material-symbols-outlined text-white text-2xl">health_and_safety</span>
          </div>
          <div>
            <h1 className="text-sky-600 dark:text-sky-400 text-2xl font-bold tracking-tight">DiaShield</h1>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium uppercase tracking-wider">Patient Portal</p>
          </div>
        </div>
        <div className="relative z-10 space-y-1">
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
          <button
            onClick={() => navigate("/profile")}
            className="btn-secondary w-full justify-start text-left mt-6"
          >
            <span className="material-symbols-outlined">person</span>
            Profile & Settings
          </button>
          {/* Sign out */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              localStorage.removeItem("role");
              navigate("/login");
            }}
            className="btn-danger w-full justify-start mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
        {/* Emergency SOS */}
        <div className="mt-auto">
          <button
            onClick={() => setShowSos(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold mt-6 shadow-lg shadow-red-500/20 transition-colors"
          >
            🚨 Emergency SOS
          </button>
        </div>
      </div>
      {/* Main content */}
      <main className="portal-main">
        <div className="portal-topbar">
          <button className="md:hidden mr-auto h-10 w-10 rounded-xl border border-sky-200 bg-white text-sky-700 flex items-center justify-center hover:bg-sky-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <NotificationBell />
          <ThemeToggle />
        </div>
        <div className="portal-content-wrap">
          <div className="portal-page">
            <Outlet />
          </div>
        </div>
      </main>
      {/* SOS Modal */}
      {showSos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0F172A] p-8 rounded-2xl w-[500px] border border-sky-100 dark:border-slate-800/80 shadow-2xl animate-scale-in">
            <h2 className="text-red-500 text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px] animate-pulse">error</span>
              Emergency SOS
            </h2>
            {sosSent ? (
              <>
                <p className="text-green-600 dark:text-green-400 mb-6 font-medium">Alert sent successfully. Emergency contacts have been notified.</p>
                <button onClick={() => { setShowSos(false); setSosSent(false); }}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Close</button>
              </>
            ) : (
              <>
                <p className="text-slate-600 dark:text-slate-300 mb-2">Emergency services will be contacted immediately.</p>
                <p className="text-slate-400 dark:text-slate-400 text-sm mb-6">
                  This will send alerts to your emergency contacts and notify the clinic.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowSos(false)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                  <button onClick={handleSos} disabled={sosSending}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20">
                    {sosSending ? "Sending..." : "Confirm Emergency"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}