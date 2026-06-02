import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDoctorProfile,
  getDoctorDashboard,
  getDoctorAppointments,
} from "../services/doctorService";

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-500/20 border-green-500/30 text-green-300" : "bg-red-500/20 border-red-500/30 text-red-300";
  const icon = type === "success" ? "check_circle" : "error";
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} shadow-2xl animate-slide-down`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="font-label-md">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-lg">close</span></button>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className="glass-card rounded-xl p-5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <span className="font-display-lg text-[28px] text-on-surface">{value}</span>
        <p className="font-label-md text-on-surface-variant text-[11px]">{label}</p>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const profRes = await getMyDoctorProfile();
        const prof = profRes.data;
        setProfile(prof);

        const [dashRes, aptRes] = await Promise.all([
          getDoctorDashboard(prof.id),
          getDoctorAppointments(prof.id, { limit: 100 }),
        ]);
        setDashboard(dashRes.data);
        const allApts = aptRes.data?.appointments || [];
        setAppointments(allApts);
      } catch {
        setToast({ message: "Failed to load dashboard data", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(
    (a) => a.date === todayStr && a.status === "booked"
  );
  const upcomingAppts = appointments
    .filter((a) => a.status === "booked")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const totalSlots = dashboard?.total_appointments ?? 0;
  const booked = dashboard?.booked_appointments ?? 0;
  const completed = dashboard?.completed_appointments ?? 0;
  const cancelled = dashboard?.cancelled_appointments ?? 0;
  const availableSlots = totalSlots - booked;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-on-surface-variant font-headline-md">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">
            Welcome, Dr. {profile?.name || "Doctor"}
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            {profile?.specialization} &middot; {profile?.hospital}
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-unit-8">
          <StatCard icon="calendar_month" label="Total Appointments" value={totalSlots} color="bg-blue-500/20 text-blue-400" />
          <StatCard icon="upcoming" label="Upcoming" value={booked} color="bg-green-500/20 text-green-400" onClick={() => navigate("/doctor/appointments")} />
          <StatCard icon="check_circle" label="Completed" value={completed} color="bg-cyan-500/20 text-cyan-400" />
          <StatCard icon="event_available" label="Available Slots" value={availableSlots} color="bg-purple-500/20 text-purple-400" onClick={() => navigate("/doctor/availability")} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-unit-6 mb-unit-8">
          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">today</span>
              Today's Schedule
            </h3>
            {todayAppts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2">event_busy</span>
                <p className="font-body-md">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-cyan-400 text-lg">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-on-surface">{apt.doctor_name || `Patient #${apt.id}`}</p>
                      <p className="font-body-sm text-on-surface-variant text-[11px]">
                        {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[11px] font-label-md">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">upcoming</span>
              Upcoming Appointments
            </h3>
            {upcomingAppts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2">event_note</span>
                <p className="font-body-md">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-purple-400 text-lg">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-on-surface">{apt.doctor_name || `Appointment #${apt.id}`}</p>
                      <p className="font-body-sm text-on-surface-variant text-[11px]">
                        {new Date(apt.date).toLocaleDateString()} &middot; {apt.start_time?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-unit-6 mb-unit-8">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">bolt</span>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <QuickActionBtn icon="add" label="Add Slot" onClick={() => navigate("/doctor/availability")} />
            <QuickActionBtn icon="calendar_today" label="View Appointments" onClick={() => navigate("/doctor/appointments")} />
            <QuickActionBtn icon="medication" label="Create Prescription" onClick={() => navigate("/doctor/prescriptions")} />
            <QuickActionBtn icon="description" label="Add Clinical Note" onClick={() => navigate("/doctor/notes")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-lg font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg"
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </button>
  );
}
