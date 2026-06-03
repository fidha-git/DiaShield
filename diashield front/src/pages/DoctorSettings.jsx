import React, { useState, useCallback } from "react";

function Toast({ message, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600";
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} shadow-2xl animate-slide-down`}>
      <span className="material-symbols-outlined text-lg">{type === "success" ? "check_circle" : "error"}</span>
      <span className="font-label-md">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-lg">close</span></button>
    </div>
  );
}

export default function DoctorSettings() {
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setToast({ message: "Password change submitted (backend integration pending)", type: "success" });
  };

  const handleNotificationToggle = () => {
    setToast({ message: "Notification preferences updated", type: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4 shadow-lg shadow-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Doctor Portal
          </div>
          <h1 className="hero-title text-[30px] md:text-[44px]">
            <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Manage your account preferences.</p>
        </header>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500">lock</span>
              Security
            </h3>
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Password</label>
                <input type="password" required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Password</label>
                <input type="password" required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm New Password</label>
                <input type="password" required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm text-sm" />
              </div>
              <button type="submit"
                className="btn-primary text-xs">
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500">notifications</span>
              Notifications
            </h3>
            <div className="space-y-4">
              {[
                { label: "Email notifications for new appointments", default: true },
                { label: "SMS reminders for upcoming appointments", default: false },
                { label: "Weekly summary reports", default: true },
              ].map((item) => (
                <label key={item.label} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={item.default}
                    onChange={handleNotificationToggle}
                    className="w-4 h-4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 accent-sky-500" />
                  <span className="text-sm text-slate-900 dark:text-slate-100">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500">palette</span>
              Theme
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              The DiaShield Doctor Portal uses your system's dark mode preference. Theme customization coming soon.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl border-2 border-sky-400 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-500/20 dark:to-cyan-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-500 dark:text-sky-400 text-sm">light_mode</span>
              </div>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">Light Mode (Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

