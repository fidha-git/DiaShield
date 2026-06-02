import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminAnalytics, fetchAdminActivityLogs } from "../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, logsRes] = await Promise.all([
          fetchAdminAnalytics(),
          fetchAdminActivityLogs(),
        ]);
        setAnalytics(analyticsRes.data);
        setLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 10) : []);
      } catch (err) {
        setError("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = analytics
    ? [
        { label: "Total Users", value: analytics.total_users, icon: "people", color: "text-blue-400 bg-blue-500/20", path: "/admin/users" },
        { label: "Patients", value: analytics.total_patients, icon: "personal_injury", color: "text-green-400 bg-green-500/20", path: "/admin/users" },
        { label: "Doctors", value: analytics.total_doctors, icon: "stethoscope", color: "text-cyan-400 bg-cyan-500/20", path: "/admin/doctors" },
        { label: "Admins", value: analytics.total_admins, icon: "shield", color: "text-purple-400 bg-purple-500/20", path: "/admin/users" },
        { label: "Appointments", value: analytics.total_appointments, icon: "calendar_today", color: "text-amber-400 bg-amber-500/20", path: "/admin/appointments" },
        { label: "Predictions", value: analytics.total_predictions, icon: "query_stats", color: "text-pink-400 bg-pink-500/20", path: "/admin/predictions" },
      ]
    : [];

  const appointmentStats = analytics
    ? [
        { label: "Booked", value: analytics.booked_appointments, color: "text-cyan-400" },
        { label: "Completed", value: analytics.completed_appointments, color: "text-green-400" },
        { label: "Cancelled", value: analytics.cancelled_appointments, color: "text-red-400" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-on-surface-variant font-headline-md">Loading admin dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-error font-headline-md">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Admin Dashboard</h2>
          <p className="font-body-md text-on-surface-variant mt-1">System overview and management.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-unit-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              onClick={() => navigate(stat.path)}
              className="glass-card rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className="font-display-lg text-[28px] text-on-surface mb-1">{stat.value}</span>
              <span className="font-label-md text-on-surface-variant text-[11px]">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-unit-6 mb-unit-8">
          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">calendar_month</span>
              Appointment Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {appointmentStats.map((s) => (
                <div key={s.label} className="flex flex-col items-center p-4 rounded-lg bg-white/5">
                  <span className={`font-display-lg text-[32px] ${s.color}`}>{s.value}</span>
                  <span className="font-label-md text-on-surface-variant text-[11px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">monitoring</span>
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto hide-scroll">
              {logs.length === 0 ? (
                <p className="text-on-surface-variant font-body-md">No recent activity</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-purple-400 text-sm">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-on-surface truncate">{log.username}</p>
                      <p className="font-body-sm text-on-surface-variant text-[12px] truncate">{log.action}</p>
                    </div>
                    <span className="font-body-sm text-on-surface-variant text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
