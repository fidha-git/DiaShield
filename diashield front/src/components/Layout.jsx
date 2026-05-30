import React, { useState, useEffect } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

export default function Layout() {
  const [showSos, setShowSos] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ROUTE CHANGED", location.pathname);
    console.log("Token value", localStorage.getItem("token"));
  }, [location.pathname]);

	const sidebarLinks = [
		{
			path: "/dashboard",
			label: "Dashboard",
			icon: "dashboard",
		},
		{
			path: "/profile",
			label: "Profile",
			icon: "person",
		},
		{
			path: "/history",
			label: "Medical History",
			icon: "history",
		},
		{
			path: "/records",
			label: "Health Records",
			icon: "description",
		},
		{
			path: "/prediction",
			label: "Predictions",
			icon: "query_stats",
		},
		{
			path: "/appointments",
			label: "Appointments",
			icon: "calendar_today",
		},
		{
			path: "/chat",
			label: "Chat Assistant",
			icon: "smart_toy",
		},
	];

	const secondaryLinks = [
		{
			label: "Prescriptions",
			icon: "medication",
		},
		{
			label: "Reminders",
			icon: "alarm",
		},
		{
			label: "Reports",
			icon: "assessment",
		},
		{
			label: "Settings",
			icon: "settings",
		},
	];

  return (
    <div className="min-h-screen bg-[#020B2D] text-white flex">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#0A122F]/90 backdrop-blur-xl border-r border-white/10 flex flex-col p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <h1 className="text-cyan-400 text-2xl font-bold">DiaShield</h1>
            <p className="text-gray-400">Patient Portal</p>
          </div>
        </div>
        {/* Main Navigation */}
        <div className="space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 p-3 rounded-xl bg-cyan-500/20 text-cyan-400 transition-all"
                  : "flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-300 transition-all"
              }
              onClick={() => {
                console.log("Clicked route:", link.path);
              }}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="border-t border-white/10 my-4"></div>
          {secondaryLinks.map((link) => (
            <button
              key={link.label}
              className="flex items-center gap-3 p-3 rounded-xl w-full text-left text-gray-400 hover:bg-white/10"
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </button>
          ))}
          {/* Sign out */}
          <button
            onClick={() => {
              console.log("Sign out: clearing token and navigating to /login");
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              localStorage.removeItem("role");
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 p-3 mt-4 rounded-xl text-red-400 hover:bg-red-500/10"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
        {/* Emergency SOS */}
        <div className="mt-auto">
          <button
            onClick={() => setShowSos(true)}
            className="w-full bg-red-600 py-3 rounded-xl font-semibold mt-6"
          >
            🚨 Emergency SOS
          </button>
        </div>
      </div>
      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      {/* SOS Modal */}
      {showSos && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#0A122F] p-8 rounded-2xl w-[500px]">
            <h2 className="text-red-500 text-2xl font-bold mb-4">Emergency SOS</h2>
            <p className="text-gray-300 mb-6">Emergency services will be contacted immediately.</p>
            <button
              onClick={() => setShowSos(false)}
              className="bg-gray-700 px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}