import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminActivityLogs } from "../services/adminService";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  AdminInput,
  AdminSelect,
  Avatar,
  Badge,
  EmptyCard,
  AdminToast,
  MetricCard,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";

function eventType(action = "") {
  const v = action.toLowerCase();
  if (v.includes("register") || v.includes("create")) return { icon: "person_add", label: "Registration", tone: "emerald" };
  if (v.includes("delete") || v.includes("remove")) return { icon: "delete", label: "Deletion", tone: "rose" };
  if (v.includes("appointment")) return { icon: "calendar_month", label: "Appointment", tone: "sky" };
  if (v.includes("prediction")) return { icon: "query_stats", label: "Prediction", tone: "amber" };
  if (v.includes("doctor")) return { icon: "stethoscope", label: "Doctor", tone: "cyan" };
  if (v.includes("login") || v.includes("signin")) return { icon: "login", label: "Access", tone: "violet" };
  return { icon: "notifications", label: "System", tone: "slate" };
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminActivityLogs();
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch {
        setToast({ type: "error", message: "Failed to load activity logs" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const now = Date.now();

    return logs.filter((log) => {
      const text = `${log.username || ""} ${log.action || ""} ${log.user_id || ""}`.toLowerCase();
      const matchesSearch = !q || text.includes(q);

      const event = eventType(log.action).label.toLowerCase();
      const matchesEvent = eventFilter === "all" || event === eventFilter;

      let matchesTime = true;
      const created = log.created_at ? new Date(log.created_at).getTime() : 0;
      if (timeFilter === "24h") matchesTime = created >= now - 24 * 60 * 60 * 1000;
      if (timeFilter === "7d") matchesTime = created >= now - 7 * 24 * 60 * 60 * 1000;
      if (timeFilter === "30d") matchesTime = created >= now - 30 * 24 * 60 * 60 * 1000;

      return matchesSearch && matchesEvent && matchesTime;
    });
  }, [logs, search, eventFilter, timeFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((log) => {
      const d = log.created_at ? new Date(log.created_at) : null;
      const key = d ? d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Unknown Date";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(log);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const metrics = useMemo(() => ({
    total: filtered.length,
    registration: filtered.filter((l) => eventType(l.action).label === "Registration").length,
    system: filtered.filter((l) => eventType(l.action).label === "System").length,
    alerts: filtered.filter((l) => eventType(l.action).tone === "rose").length,
  }), [filtered]);

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <AdminHero
        title="Activity Logs"
        subtitle="Monitor user and system events with searchable timeline intelligence and grouped audit trails."
        right={<HealthcareHero className="w-full h-auto" />}
      />

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Events" value={metrics.total} icon="timeline" tone="sky" />
        <MetricCard label="Registrations" value={metrics.registration} icon="person_add" tone="emerald" />
        <MetricCard label="System Events" value={metrics.system} icon="notifications" tone="cyan" />
        <MetricCard label="Critical Alerts" value={metrics.alerts} icon="warning" tone="rose" />
      </section>

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <AdminInput placeholder="Search username, action, user id" value={search} onChange={(e) => setSearch(e.target.value)} />
          <AdminSelect value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">All Event Types</option>
            <option value="registration">Registration</option>
            <option value="appointment">Appointment</option>
            <option value="prediction">Prediction</option>
            <option value="doctor">Doctor</option>
            <option value="deletion">Deletion</option>
            <option value="access">Access</option>
            <option value="system">System</option>
          </AdminSelect>
          <AdminSelect value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </AdminSelect>
          <div className="card-light-label text-sm flex items-center justify-end">{filtered.length} events</div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
          </div>
        ) : grouped.length === 0 ? (
          <EmptyCard icon="timeline" title="No activity events found" subtitle="Try broadening filters to view system activity." />
        ) : (
          <AdminPanel title="Timeline" icon="timeline">
            <div className="space-y-6">
              {grouped.map(([dateLabel, entries]) => (
                <section key={dateLabel}>
                  <p className="card-light-label text-xs uppercase tracking-[0.14em] font-semibold mb-3">{dateLabel}</p>
                  <div className="space-y-3">
                    {entries.map((log, idx) => {
                      const evt = eventType(log.action);
                      return (
                        <article key={`${dateLabel}-${idx}`} className="card-light rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                          <div className="flex items-start gap-3">
                            <Avatar name={log.username || "Unknown"} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="card-light-heading text-sm font-semibold truncate">{log.username || "Unknown User"}</p>
                                <Badge tone="sky">{log.role || "User"}</Badge>
                                <Badge tone={evt.tone}>
                                  <span className="material-symbols-outlined text-[14px] mr-1">{evt.icon}</span>
                                  {evt.label}
                                </Badge>
                              </div>
                              <p className="card-light-text text-sm mt-1 break-words">{log.action || "No description"}</p>
                              <div className="card-light-label flex flex-wrap items-center gap-2 text-xs mt-2">
                                <span>User ID: {log.user_id}</span>
                                <span>•</span>
                                <span>{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </AdminPanel>
        )}
      </div>
    </AdminPage>
  );
}
