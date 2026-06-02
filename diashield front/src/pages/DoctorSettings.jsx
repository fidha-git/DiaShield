import React, { useState, useCallback } from "react";

function Toast({ message, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-500/20 border-green-500/30 text-green-300" : "bg-red-500/20 border-red-500/30 text-red-300";
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
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Settings</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage your account preferences.</p>
        </header>

        <div className="space-y-unit-6">
          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">lock</span>
              Security
            </h3>
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface-variant text-[11px]">Current Password</label>
                <input type="password" required
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface-variant text-[11px]">New Password</label>
                <input type="password" required
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface-variant text-[11px]">Confirm New Password</label>
                <input type="password" required
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm" />
              </div>
              <button type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all">
                Update Password
              </button>
            </form>
          </div>

          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">notifications</span>
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
                    className="w-4 h-4 rounded bg-white/5 border border-white/10 accent-cyan-500" />
                  <span className="font-body-md text-on-surface">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">palette</span>
              Theme
            </h3>
            <p className="font-body-md text-on-surface-variant mb-4">
              The DiaShield Doctor Portal uses your system's dark mode preference. Theme customization coming soon.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#020B2D] border-2 border-cyan-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-400 text-sm">dark_mode</span>
              </div>
              <span className="font-body-md text-on-surface">Dark Mode (Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
