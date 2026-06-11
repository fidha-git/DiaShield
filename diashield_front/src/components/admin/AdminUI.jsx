import React, { useEffect, useMemo, useState } from "react";

export function AdminPage({ children }) {
  return (
    <div className="admin-theme min-h-screen p-6 md:p-8" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}

export function AdminHero({
  eyebrow = "DiaShield Admin",
  title,
  subtitle,
  actions,
  right,
}) {
  return (
    <section className="card-light relative overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-xl shadow-sky-100/70 px-6 py-7 md:px-9 md:py-9 mb-7">
      <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="absolute -bottom-20 -left-8 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sky-200 text-sky-700 text-[11px] font-bold uppercase tracking-[0.14em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            {eyebrow}
          </div>

          <h1 className="page-title card-light-heading text-[32px] md:text-[44px] leading-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-[15px] admin-subtitle card-light-text max-w-2xl">{subtitle}</p>}

          {actions && <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div>}
        </div>

        {right ? <div className="hidden lg:block w-[280px]">{right}</div> : null}
      </div>
    </section>
  );
}

export function AdminPanel({ title, icon, actions, children, className = "" }) {
  return (
    <section className={`card-light rounded-2xl border border-sky-100 bg-white p-4 md:p-5 shadow-md shadow-sky-100/50 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {title ? (
            <h2 className="section-heading card-light-title text-[18px] flex items-center gap-2">
              {icon ? <span className="material-symbols-outlined text-sky-600">{icon}</span> : null}
              {title}
            </h2>
          ) : (
            <div />
          )}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function MetricCard({ label, value, icon, tone = "sky", hint, animate = true }) {
  const map = {
    sky: "from-sky-100 via-sky-50 to-white text-sky-700",
    cyan: "from-cyan-100 via-cyan-50 to-white text-cyan-700",
    emerald: "from-emerald-100 via-emerald-50 to-white text-emerald-700",
    amber: "from-amber-100 via-amber-50 to-white text-amber-700",
    rose: "from-rose-100 via-rose-50 to-white text-rose-700",
    violet: "from-violet-100 via-violet-50 to-white text-violet-700",
  };

  return (
    <div className={`card-light relative overflow-hidden rounded-2xl border border-white/70 p-5 text-slate-900 shadow-lg shadow-sky-100/60 bg-gradient-to-br ${map[tone] || map.sky}`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="card-light-label text-[11px] uppercase tracking-[0.14em] font-semibold">{label}</p>
          <p className={`card-light-stat mt-1 text-[30px] leading-none font-extrabold ${animate ? "animate-fade-in" : ""}`}>{value}</p>
          {hint ? <p className="card-light-text mt-1 text-xs">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="h-12 w-12 rounded-xl bg-white/80 border border-white/80 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminButton({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all";
  const variants = {
    primary: "bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 text-white hover:brightness-105 shadow-lg shadow-sky-500/25",
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100",
    success: "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || variants.primary} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  );
}

export function AdminInput(props) {
  return <input {...props} className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 ${props.className || ""}`} />;
}

export function AdminSelect(props) {
  return <select {...props} className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 ${props.className || ""}`} />;
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = "md" }) {
  const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-sm",
  };

  const initial = useMemo(() => {
    const safe = (name || "").trim();
    if (!safe) return "NA";
    const parts = safe.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [name]);

  return (
    <div className={`${sizeClass[size] || sizeClass.md} rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold flex items-center justify-center shadow-lg shadow-sky-500/30 overflow-hidden`}>
      {src ? <img src={src} alt={name || "avatar"} className="h-full w-full object-cover" /> : initial}
    </div>
  );
}

export function EmptyCard({ icon = "inbox", title, subtitle, action }) {
  return (
    <div className="card-light rounded-[24px] border border-sky-100 bg-white py-10 sm:py-16 px-4 sm:px-6 text-center shadow-lg shadow-sky-100/40">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
        <span className="material-symbols-outlined text-[30px]">{icon}</span>
      </div>
      <h3 className="mt-4 text-[22px] card-title card-light-title">{title}</h3>
      {subtitle ? <p className="mt-2 card-description card-light-text max-w-xl mx-auto">{subtitle}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function TableShell({ children }) {
  return (
    <div className="card-light rounded-2xl border border-sky-100 bg-white shadow-md shadow-sky-100/50 overflow-hidden">
      <div className="max-h-[560px] overflow-auto overflow-x-auto">{children}</div>
    </div>
  );
}

export function LoadingRows({ cols = 5, rows = 6 }) {
  return Array.from({ length: rows }).map((_, idx) => (
    <tr key={idx} className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((__, cIdx) => (
        <td key={cIdx} className="px-4 py-3">
          <div className="h-4 w-20 rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}

export function AdminToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = toast.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className={`fixed top-6 right-4 sm:right-6 z-[120] rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl max-w-[90vw] ${tone}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">{toast.type === "success" ? "check_circle" : "error"}</span>
        <p className="text-sm font-semibold">{toast.message}</p>
        <button onClick={onClose} className="opacity-60 hover:opacity-100">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}

export function Counter({ value, duration = 500 }) {
  const numeric = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(numeric * progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numeric, duration]);

  return <>{display}</>;
}

export function toneFromStatus(status) {
  const value = (status || "").toLowerCase();
  if (value === "active" || value === "booked" || value === "completed" || value === "low") return "emerald";
  if (value === "moderate" || value === "warning" || value === "pending") return "amber";
  if (value === "blocked" || value === "inactive" || value === "cancelled" || value === "high") return "rose";
  if (value === "admin" || value === "doctor") return "sky";
  return "slate";
}
