import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminAppointments, fetchAdminUsers, fetchAdminDoctors } from "../services/adminService";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  AdminInput,
  AdminSelect,
  AdminButton,
  Badge,
  Avatar,
  EmptyCard,
  MetricCard,
  AdminToast,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";

function statusTone(status) {
  const v = (status || "").toLowerCase();
  if (v === "completed") return "emerald";
  if (v === "booked") return "sky";
  if (v === "cancelled") return "rose";
  return "slate";
}

function sameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");

  const closeToast = () => setToast(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aRes, uRes, dRes] = await Promise.all([
          fetchAdminAppointments(),
          fetchAdminUsers(),
          fetchAdminDoctors(),
        ]);
        setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
        setUsers(Array.isArray(uRes.data) ? uRes.data : []);
        setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
      } catch {
        setToast({ type: "error", message: "Failed to load appointments" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const doctorMap = useMemo(() => {
    const map = new Map();
    doctors.forEach((d) => map.set(d.id, d));
    return map;
  }, [doctors]);

  const counts = useMemo(() => ({
    total: appointments.length,
    booked: appointments.filter((a) => a.status === "booked").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }), [appointments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return appointments.filter((apt) => {
      const user = userMap.get(apt.user_id);
      const doctor = doctorMap.get(apt.doctor_id);
      const text = `${user?.username || ""} ${user?.email || ""} ${doctor?.name || ""}`.toLowerCase();

      const matchesSearch = !q || text.includes(q);
      const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
      const matchesDoctor = doctorFilter === "all" || String(apt.doctor_id) === doctorFilter;
      const matchesPatient = patientFilter === "all" || String(apt.user_id) === patientFilter;

      return matchesSearch && matchesStatus && matchesDoctor && matchesPatient;
    });
  }, [appointments, search, statusFilter, doctorFilter, patientFilter, userMap, doctorMap]);

  const dateBuckets = useMemo(() => {
    const map = new Map();
    filtered.forEach((apt) => {
      const date = apt.created_at ? new Date(apt.created_at) : new Date();
      const key = date.toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(apt);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const thisMonth = new Date();
  const days = Array.from({ length: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={closeToast} />

      <AdminHero
        title="Appointments"
        subtitle="Manage and monitor system-wide appointments with premium filters and operational visibility."
        right={<HealthcareHero className="w-full h-auto" />}
        actions={
          <>
            <AdminButton variant={viewMode === "list" ? "primary" : "outline"} onClick={() => setViewMode("list")}>
              <span className="material-symbols-outlined text-[18px]">view_list</span>
              List View
            </AdminButton>
            <AdminButton variant={viewMode === "calendar" ? "primary" : "outline"} onClick={() => setViewMode("calendar")}>
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Calendar View
            </AdminButton>
          </>
        }
      />

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total" value={counts.total} icon="calendar_month" tone="sky" />
        <MetricCard label="Booked" value={counts.booked} icon="schedule" tone="cyan" />
        <MetricCard label="Completed" value={counts.completed} icon="check_circle" tone="emerald" />
        <MetricCard label="Cancelled" value={counts.cancelled} icon="event_busy" tone="rose" />
      </section>

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <AdminInput placeholder="Search by patient or doctor" value={search} onChange={(e) => setSearch(e.target.value)} />
          <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </AdminSelect>
          <AdminSelect value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={String(d.id)}>{d.name}</option>
            ))}
          </AdminSelect>
          <AdminSelect value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)}>
            <option value="all">All Patients</option>
            {users.filter((u) => (u.role || "patient") === "patient").map((u) => (
              <option key={u.id} value={String(u.id)}>{u.username || u.email}</option>
            ))}
          </AdminSelect>
          <div className="text-sm text-slate-500 flex items-center justify-end">{filtered.length} results</div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-44 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyCard icon="event_busy" title="No appointments match filters" subtitle="Try clearing filters or switching the view mode." />
        ) : viewMode === "list" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((apt) => {
              const patient = userMap.get(apt.user_id);
              const doctor = doctorMap.get(apt.doctor_id);
              const created = apt.created_at ? new Date(apt.created_at) : null;
              return (
                <article key={apt.id} className="rounded-[20px] border border-sky-100 bg-white p-5 shadow-md shadow-sky-100/50 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={patient?.username || `Patient #${apt.user_id}`} size="md" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{patient?.username || `Patient #${apt.user_id}`}</h3>
                        <p className="text-sm text-slate-500">with Dr. {doctor?.name || `#${apt.doctor_id}`}</p>
                      </div>
                    </div>
                    <Badge tone={statusTone(apt.status)}>{apt.status || "Unknown"}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <Mini label="Appointment ID" value={`#${apt.id}`} icon="tag" />
                    <Mini label="Slot" value={`#${apt.slot_id}`} icon="schedule" />
                    <Mini label="Patient" value={`ID ${apt.user_id}`} icon="person" />
                    <Mini label="Doctor" value={`ID ${apt.doctor_id}`} icon="stethoscope" />
                  </div>

                  <div className="mt-4 text-xs text-slate-400">
                    Created {created ? created.toLocaleString() : "-"}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <AdminPanel title="Calendar" icon="calendar_month">
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 py-2">{d}</div>
              ))}
              {days.map((day) => {
                const date = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), day);
                const dayEvents = filtered.filter((apt) => {
                  const c = apt.created_at ? new Date(apt.created_at) : null;
                  if (!c) return false;
                  return sameDay(c, date);
                });

                return (
                  <div key={day} className="min-h-[110px] rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-700">{day}</p>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="text-[11px] rounded-md px-2 py-1 bg-white border border-slate-200 truncate">
                          #{apt.id} • {doctorMap.get(apt.doctor_id)?.name || `Dr #${apt.doctor_id}`}
                        </div>
                      ))}
                      {dayEvents.length > 3 ? <div className="text-[11px] text-slate-500">+{dayEvents.length - 3} more</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminPanel>
        )}
      </div>

      {!loading && viewMode === "calendar" && dateBuckets.length > 0 && (
        <div className="mt-5">
          <AdminPanel title="Grouped by Date" icon="event_note">
            <div className="space-y-4">
              {dateBuckets.map(([date, items]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em] mb-2">{date}</p>
                  <div className="space-y-2">
                    {items.slice(0, 4).map((apt) => (
                      <div key={apt.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">Appointment #{apt.id}</p>
                        <Badge tone={statusTone(apt.status)}>{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminPage>
  );
}

function Mini({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-slate-500 font-semibold">
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{value}</p>
    </div>
  );
}
