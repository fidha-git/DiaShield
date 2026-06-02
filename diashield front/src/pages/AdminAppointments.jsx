import React, { useEffect, useState } from "react";
import { fetchAdminAppointments } from "../services/adminService";

const STATUS_COLORS = {
  booked: "text-cyan-400 bg-cyan-500/20",
  completed: "text-green-400 bg-green-500/20",
  cancelled: "text-red-400 bg-red-500/20",
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminAppointments();
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = statusFilter === "all"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const counts = {
    booked: appointments.filter((a) => a.status === "booked").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Appointments</h2>
          <p className="font-body-md text-on-surface-variant mt-1">All appointments across the platform.</p>
        </header>

        <div className="flex gap-4 mb-6">
          {[
            { label: "All", value: "all", count: appointments.length },
            { label: "Booked", value: "booked", count: counts.booked },
            { label: "Completed", value: "completed", count: counts.completed },
            { label: "Cancelled", value: "cancelled", count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-label-md text-[11px] transition-colors ${
                statusFilter === tab.value
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-on-surface-variant border border-white/10 hover:bg-white/10"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant font-headline-md">Loading appointments...</span>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">User ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Doctor ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Slot ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Status</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-md">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((apt) => (
                      <tr key={apt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-body-md text-on-surface">{apt.id}</td>
                        <td className="p-4 font-body-md text-on-surface">{apt.user_id}</td>
                        <td className="p-4 font-body-md text-on-surface">{apt.doctor_id}</td>
                        <td className="p-4 font-body-md text-on-surface">{apt.slot_id}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-label-md ${STATUS_COLORS[apt.status] || "text-gray-400 bg-gray-500/20"}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-4 font-body-sm text-on-surface-variant">
                          {new Date(apt.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
