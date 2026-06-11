import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchAdminAnalytics, fetchAdminActivityLogs } from "../services/adminService";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  MetricCard,
  AdminButton,
  EmptyCard,
  Avatar,
  Badge,
  Counter,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";

const PIE_COLORS = ["#22C55E", "#0EA5E9", "#EF4444"];

function eventIcon(action = "") {
  const v = action.toLowerCase();
  if (v.includes("register") || v.includes("create")) return "person_add";
  if (v.includes("doctor")) return "stethoscope";
  if (v.includes("appointment")) return "calendar_month";
  if (v.includes("prediction")) return "query_stats";
  if (v.includes("delete")) return "delete";
  if (v.includes("login")) return "login";
  return "notifications";
}

function safeDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function monthLabel(date) {
  return date.toLocaleString("en-US", { month: "short" });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [analyticsRes, logsRes] = await Promise.all([
          fetchAdminAnalytics(),
          fetchAdminActivityLogs(),
        ]);
        setAnalytics(analyticsRes.data);
        setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      } catch {
        setError("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartSeries = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: monthLabel(d),
        users: 0,
        appointments: 0,
        predictions: 0,
        doctorEvents: 0,
      });
    }

    const monthMap = new Map(months.map((m) => [m.key, m]));

    logs.forEach((log) => {
      const d = safeDate(log.created_at);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthMap.get(key);
      if (!bucket) return;
      const action = (log.action || "").toLowerCase();
      bucket.users += 1;
      if (action.includes("appointment")) bucket.appointments += 1;
      if (action.includes("prediction")) bucket.predictions += 1;
      if (action.includes("doctor")) bucket.doctorEvents += 1;
    });

    return months;
  }, [logs]);

  const appointmentStatusData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Completed", value: analytics.completed_appointments || 0 },
      { name: "Booked", value: analytics.booked_appointments || 0 },
      { name: "Cancelled", value: analytics.cancelled_appointments || 0 },
    ];
  }, [analytics]);

  const activeSessions = useMemo(() => {
    const since = Date.now() - 30 * 60 * 1000;
    const users = new Set();
    logs.forEach((log) => {
      const d = safeDate(log.created_at);
      if (!d) return;
      if (d.getTime() >= since) users.add(log.user_id);
    });
    return users.size;
  }, [logs]);

  const topCards = analytics
    ? [
        { label: "Total Users", value: analytics.total_users, icon: "group", tone: "sky", path: "/admin/users" },
        { label: "Total Patients", value: analytics.total_patients, icon: "clinical_notes", tone: "emerald", path: "/admin/patients" },
        { label: "Total Doctors", value: analytics.total_doctors, icon: "stethoscope", tone: "cyan", path: "/admin/doctors" },
        { label: "Appointments", value: analytics.total_appointments, icon: "calendar_month", tone: "amber", path: "/admin/appointments" },
        { label: "Prediction Requests", value: analytics.total_predictions, icon: "query_stats", tone: "violet", path: "/admin/predictions" },
        { label: "Active Sessions", value: activeSessions, icon: "monitor_heart", tone: "rose", path: "/admin/activity-logs" },
      ]
    : [];

  if (loading) {
    return (
      <AdminPage>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="shimmer h-52 rounded-3xl" />
          <div className="shimmer h-52 rounded-3xl" />
          <div className="shimmer h-72 rounded-3xl" />
          <div className="shimmer h-72 rounded-3xl" />
        </div>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage>
        <EmptyCard
          icon="error"
          title="Unable to load admin analytics"
          subtitle={error}
          action={<AdminButton onClick={() => window.location.reload()}>Retry</AdminButton>}
        />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminHero
        title="Admin Command Center"
        subtitle="Manage users, doctors, appointments, predictions, and system operations from one enterprise-grade healthcare console."
        right={<HealthcareHero className="w-full h-auto" />}
        actions={
          <>
            <AdminButton onClick={() => navigate("/admin/doctors")}>
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Doctor
            </AdminButton>
            <AdminButton variant="outline" onClick={() => navigate("/admin/users")}>
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Manage Users
            </AdminButton>
            <AdminButton variant="outline" onClick={() => navigate("/admin/activity-logs")}>
              <span className="material-symbols-outlined text-[18px]">timeline</span>
              View Logs
            </AdminButton>
            <AdminButton variant="outline" onClick={() => navigate("/admin/predictions")}>
              <span className="material-symbols-outlined text-[18px]">description</span>
              Generate Reports
            </AdminButton>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mb-7">
        {topCards.map((card) => (
          <button key={card.label} onClick={() => navigate(card.path)} className="text-left">
            <MetricCard
              label={card.label}
              value={<Counter value={card.value} />}
              icon={card.icon}
              tone={card.tone}
            />
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-7">
        <AdminPanel title="User Growth" icon="trending_up">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#0EA5E9" fill="#BAE6FD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel title="Appointment Trends" icon="calendar_month">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#06B6D4" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <AdminPanel title="Doctor Activity" icon="stethoscope" className="xl:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="doctorEvents" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel title="Prediction Usage" icon="query_stats">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={appointmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <AdminPanel title="Recent Activity Feed" icon="history" className="xl:col-span-2">
          <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
            {logs.slice(0, 14).map((log, idx) => (
              <div key={`${log.user_id}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 flex items-start gap-3">
                <Avatar name={log.username || "Unknown"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{log.username || "Unknown User"}</p>
                  <p className="text-sm text-slate-500 truncate">{log.action || "System activity"}</p>
                </div>
                <div className="text-right">
                  <Badge tone="sky">
                    <span className="material-symbols-outlined text-[14px] mr-1">{eventIcon(log.action)}</span>
                    Event
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">
                    {safeDate(log.created_at)?.toLocaleString() || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Quick Actions" icon="bolt">
          <div className="space-y-2">
            <AdminButton className="w-full" onClick={() => navigate("/admin/doctors")}>Create / Manage Doctors</AdminButton>
            <AdminButton className="w-full" variant="outline" onClick={() => navigate("/admin/users")}>Review User Accounts</AdminButton>
            <AdminButton className="w-full" variant="outline" onClick={() => navigate("/admin/appointments")}>Track Appointments</AdminButton>
            <AdminButton className="w-full" variant="outline" onClick={() => navigate("/admin/predictions")}>Prediction Analytics</AdminButton>
            <AdminButton className="w-full" variant="outline" onClick={() => navigate("/admin/settings")}>System Settings</AdminButton>
          </div>
        </AdminPanel>
      </section>
    </AdminPage>
  );
}
