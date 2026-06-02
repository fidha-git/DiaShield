import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDoctorProfile,
  getDoctorDashboard,
  getDoctorAppointments,
} from "../services/doctorService";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5);
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const isSuccess = type === "success";
  const bg = isSuccess ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600";
  const icon = isSuccess ? "check_circle" : "error";
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl animate-slide-down ${bg}`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-lg">close</span></button>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className="relative group bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-0.5 transition-all duration-300 p-5 flex items-center gap-4 cursor-pointer overflow-hidden">
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-sky-50 rounded-full blur-2xl group-hover:bg-sky-100 transition-all duration-500" />
      <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="relative z-10">
        <span className="block text-[28px] font-bold text-slate-900 leading-none mb-1">{value}</span>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
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
    .sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      return da - db;
    })
    .slice(0, 5);

  const totalSlots = dashboard?.total_appointments ?? 0;
  const booked = dashboard?.booked_appointments ?? 0;
  const completed = dashboard?.completed_appointments ?? 0;
  const cancelled = dashboard?.cancelled_appointments ?? 0;
  const availableSlots = totalSlots - booked;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="shimmer h-32 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="shimmer h-24 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="shimmer h-64 rounded-2xl" />
            <div className="shimmer h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Doctor Portal
          </div>
          <h1 className="text-[32px] md:text-[42px] font-bold tracking-tight leading-tight">
            Welcome, Dr.{' '}
            <span className="text-gradient">{profile?.name || "Doctor"}</span>
          </h1>
          <p className="text-slate-400 mt-2 text-base">
            {profile?.specialization} &middot; {profile?.hospital}
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="calendar_month" label="Total Appointments" value={totalSlots} color="bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600" />
          <StatCard icon="upcoming" label="Upcoming" value={booked} color="bg-gradient-to-br from-green-100 to-green-200 text-green-600" onClick={() => navigate("/doctor/appointments")} />
          <StatCard icon="check_circle" label="Completed" value={completed} color="bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600" />
          <StatCard icon="event_available" label="Available Slots" value={availableSlots} color="bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600" onClick={() => navigate("/doctor/availability")} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500">today</span>
              Today's Schedule
            </h3>
            {todayAppts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-500">
                <span className="material-symbols-outlined text-3xl mb-2">event_busy</span>
                <p className="font-body-md">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-sky-50">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sky-500 text-lg">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-slate-900">{apt.patient_name || `Patient #${apt.id}`}</p>
                      <p className="font-body-sm text-slate-500 text-[11px]">
                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-[10px] font-bold uppercase tracking-wider">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500">upcoming</span>
              Upcoming Appointments
            </h3>
            {upcomingAppts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-500">
                <span className="material-symbols-outlined text-3xl mb-2">event_note</span>
                <p className="font-body-md">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-sky-50">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sky-500 text-lg">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-slate-900">{apt.patient_name || `Appointment #${apt.id}`}</p>
                      <p className="font-body-sm text-slate-500 text-[11px]">
                        {formatDate(apt.date)} &middot; {formatTime(apt.start_time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 p-6 mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500">bolt</span>
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
      className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-sky-600 hover:to-cyan-600 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30"
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </button>
  );
}

