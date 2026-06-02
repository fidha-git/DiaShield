import React, { useMemo, useState, useCallback } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function SignOutModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-[#0F172A] dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px] text-rose-500">logout</span>
        </div>

        {/* Content */}
        <h2 className="text-center text-[20px] font-bold text-slate-900 dark:text-white">Sign Out</h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Are you sure you want to sign out of the Admin Console?
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-rose-500/25"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkItem({ to, icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
          isActive
            ? "bg-white text-sky-700 border-sky-200 shadow-md shadow-sky-100/70 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-400/30 dark:shadow-none"
            : "bg-transparent text-slate-500 border-transparent hover:bg-white/60 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
        }`
      }
      title={collapsed ? label : undefined}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      {!collapsed ? <span className="text-sm font-semibold truncate">{label}</span> : null}
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    management: true,
    operations: true,
    system: true,
  });

  const groups = useMemo(
    () => [
      {
        key: "management",
        title: "Management",
        links: [
          { path: "/admin", label: "Dashboard", icon: "dashboard" },
          { path: "/admin/users", label: "Users", icon: "group" },
          { path: "/admin/doctors", label: "Doctors", icon: "stethoscope" },
          { path: "/admin/patients", label: "Patients", icon: "clinical_notes" },
        ],
      },
      {
        key: "operations",
        title: "Operations",
        links: [
          { path: "/admin/appointments", label: "Appointments", icon: "calendar_month" },
          { path: "/admin/predictions", label: "Predictions", icon: "query_stats" },
          { path: "/admin/activity-logs", label: "Activity Logs", icon: "timeline" },
        ],
      },
      {
        key: "system",
        title: "System",
        links: [{ path: "/admin/settings", label: "Settings", icon: "settings" }],
      },
    ],
    []
  );

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setShowSignOut(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="portal-shell dark:text-slate-100">
      <aside className={`portal-sidebar ${collapsed ? "w-[92px]" : "w-[290px]"} p-4 md:p-5 transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
              <span className="material-symbols-outlined text-white text-[22px]">shield</span>
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <h1 className="text-sky-700 text-xl font-extrabold tracking-tight truncate">DiaShield</h1>
                <p className="text-muted text-[10px] uppercase tracking-[0.16em] font-semibold">Admin Console</p>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-9 w-9 rounded-xl border border-sky-200 bg-white text-sky-700 flex items-center justify-center hover:bg-sky-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <span className="material-symbols-outlined text-[18px]">{collapsed ? "chevron_right" : "chevron_left"}</span>
          </button>
        </div>

        <div className="overflow-y-auto hide-scroll flex-1 pr-1 space-y-4">
          {groups.map((group) => {
            const isOpen = openGroups[group.key];
            const activeInGroup = group.links.some((l) => location.pathname === l.path);

            return (
              <section key={group.key} className="space-y-2">
                {!collapsed ? (
                  <button
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [group.key]: !prev[group.key],
                      }))
                    }
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.14em] font-bold ${
                      activeInGroup ? "text-sky-700 dark:text-sky-200" : "text-muted"
                    } hover:text-slate-700 dark:hover:text-slate-100`}
                  >
                    {group.title}
                    <span className="material-symbols-outlined text-[16px]">{isOpen ? "expand_more" : "chevron_right"}</span>
                  </button>
                ) : null}

                {(collapsed || isOpen) && (
                  <div className="space-y-1">
                    {group.links.map((link) => (
                      <LinkItem key={link.path} to={link.path} icon={link.icon} label={link.label} collapsed={collapsed} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="pt-4 mt-4 border-t border-sky-100 space-y-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title={collapsed ? "Patient Portal" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            {!collapsed ? <span className="text-sm font-semibold">Patient Portal</span> : null}
          </button>

          <button
            onClick={() => setShowSignOut(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm shadow-rose-500/20"
            title={collapsed ? "Sign Out" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!collapsed ? <span className="text-sm font-semibold">Sign Out</span> : null}
          </button>
        </div>
      </aside>

      <main className="portal-main overflow-auto">
        <div className="portal-topbar">
          <ThemeToggle />
        </div>
        <div className="portal-content-wrap pb-8">
          <div className="portal-page">
            <Outlet />
          </div>
        </div>
      </main>

      {showSignOut ? (
        <SignOutModal
          onConfirm={signOut}
          onCancel={() => setShowSignOut(false)}
        />
      ) : null}
    </div>
  );
}
