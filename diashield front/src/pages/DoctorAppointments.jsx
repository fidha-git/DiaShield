import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDoctorProfile,
  getDoctorAppointments,
  completeAppointment,
  addClinicalNote,
  getPrescription,
  addPrescription,
  updatePrescription,
  deletePrescription,
} from "../services/doctorService";
import { EmptyAppointments, HealthcareHero } from "../components/Illustrations";
import { getErrorMessage } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

function formatTime(timeStr) {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5);
}

function getPatientAge(apt) {
  return apt.patient_age || apt.age || apt.user_age || null;
}

function getPatientGender(apt) {
  return apt.patient_gender || apt.gender || apt.user_gender || null;
}

function getAppointmentType(apt) {
  return apt.appointment_type || apt.type || apt.consultation_type || "General Consultation";
}

function getRiskLevel(apt) {
  const risk = apt.risk_level || apt.risk || apt.latest_risk_level || apt.diabetes_risk;
  return risk || "Not Available";
}

function getStatusBadge(status) {
  const s = (status || "").toLowerCase();
  if (s === "booked") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s === "completed") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  if (s === "cancelled") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getRiskBadge(riskLevel) {
  const risk = (riskLevel || "").toLowerCase();
  if (risk.includes("high")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (risk.includes("moderate") || risk.includes("medium")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (risk.includes("low")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getPatientInitial(name, fallbackId) {
  const safe = (name || "").trim();
  if (!safe) return `P${fallbackId || ""}`.slice(0, 2).toUpperCase();
  const chunks = safe.split(/\s+/).filter(Boolean);
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
  return `${chunks[0][0]}${chunks[chunks.length - 1][0]}`.toUpperCase();
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";
  const bg = isSuccess
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : "bg-rose-50 border-rose-200 text-rose-700";

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-down ${bg}`}>
      <span className="material-symbols-outlined text-lg">
        {isSuccess ? "check_circle" : "error"}
      </span>
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

function StatsCard({ icon, label, value, gradient, pulse = false }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/70 p-5 text-slate-900 shadow-lg shadow-sky-100/60 ${gradient}`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-600 font-semibold">
            {label}
          </p>
          <p className={`mt-1 text-[30px] leading-none font-extrabold ${pulse ? "animate-pulse" : ""}`}>
            {value}
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white/80 border border-white/80 flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-sky-700">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-md shadow-sky-100/40">
          <div className="flex items-start justify-between gap-4 animate-pulse">
            <div className="flex gap-3 items-center">
              <div className="h-12 w-12 rounded-2xl bg-sky-100" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-sky-100" />
                <div className="h-3 w-24 rounded bg-sky-100" />
              </div>
            </div>
            <div className="h-7 w-24 rounded-full bg-sky-100" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 animate-pulse">
            <div className="h-12 rounded-xl bg-sky-50" />
            <div className="h-12 rounded-xl bg-sky-50" />
            <div className="h-12 rounded-xl bg-sky-50" />
            <div className="h-12 rounded-xl bg-sky-50" />
          </div>
          <div className="mt-5 flex gap-2 animate-pulse">
            <div className="h-9 flex-1 rounded-xl bg-sky-100" />
            <div className="h-9 flex-1 rounded-xl bg-sky-100" />
            <div className="h-9 flex-1 rounded-xl bg-sky-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterControl({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function AppointmentCard({
  apt,
  hasPrescription,
  prescription,
  onView,
  onAddNote,
  onComplete,
  onCreatePrescription,
  onViewPrescription,
  onEditPrescription,
  onDeletePrescription,
}) {
  const patientName = apt.patient_name || `Patient #${apt.id}`;
  const age = getPatientAge(apt);
  const gender = getPatientGender(apt);
  const appointmentType = getAppointmentType(apt);
  const riskLevel = getRiskLevel(apt);

  return (
    <article className="group rounded-[20px] border border-sky-100 bg-white p-5 shadow-md shadow-sky-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-sky-500/30">
            {getPatientInitial(patientName, apt.id)}
          </div>
          <div className="min-w-0">
            <h3 className="text-[18px] leading-tight font-bold text-slate-900 truncate">
              {patientName}
            </h3>
            <p className="text-sm text-slate-500">
              {age ? `${age} yrs` : "Age N/A"} - {gender || "Gender N/A"}
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${getStatusBadge(apt.status)}`}>
          {apt.status || "Unknown"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <InfoPill icon="schedule" label="Time" value={`${formatTime(apt.start_time)} - ${formatTime(apt.end_time)}`} />
        <InfoPill icon="calendar_today" label="Date" value={formatDate(apt.date)} />
        <InfoPill icon="stethoscope" label="Type" value={appointmentType} />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <span className="material-symbols-outlined text-[15px]">monitor_heart</span>
            Risk
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRiskBadge(riskLevel)}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={onView}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[12px] font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          View Patient
        </button>

        <button
          onClick={onAddNote}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-[12px] font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          Add Clinical Note
        </button>

        {apt.status === "completed" && !hasPrescription && (
          <button
            onClick={onCreatePrescription}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">medication</span>
            Create Prescription
          </button>
        )}

        {apt.status === "completed" && hasPrescription && (
          <div className="sm:col-span-1 grid grid-cols-3 gap-2">
            <IconAction icon="visibility" title="View" onClick={onViewPrescription} className="text-sky-600 border-sky-200 bg-sky-50 hover:bg-sky-100" />
            <IconAction icon="edit" title="Edit" onClick={onEditPrescription} className="text-cyan-600 border-cyan-200 bg-cyan-50 hover:bg-cyan-100" />
            <IconAction icon="delete" title="Delete" onClick={onDeletePrescription} className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100" />
          </div>
        )}

        {apt.status === "booked" && (
          <button
            onClick={onComplete}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Mark Completed
          </button>
        )}

        {apt.status !== "completed" && (
          <button
            disabled
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-400 cursor-not-allowed"
            title="Prescription can be created once appointment is completed"
          >
            <span className="material-symbols-outlined text-[16px]">medication</span>
            Create Prescription
          </button>
        )}
      </div>

      {hasPrescription && prescription?.medicines && (
        <div className="mt-4 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-sky-700">Active Prescription</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{prescription.medicines}</p>
        </div>
      )}
    </article>
  );
}

function IconAction({ icon, title, onClick, className }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-xl border px-2 py-2 inline-flex items-center justify-center transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        <span className="material-symbols-outlined text-[15px]">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-800 truncate">{value || "-"}</p>
    </div>
  );
}

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [selectedApt, setSelectedApt] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [createPrescModal, setCreatePrescModal] = useState(null);
  const [viewPrescModal, setViewPrescModal] = useState(null);
  const [editPrescModal, setEditPrescModal] = useState(null);
  const [deletePrescTarget, setDeletePrescTarget] = useState(null);

  const loadPrescriptionsForApts = useCallback(async (apts) => {
    const map = {};
    const completed = apts.filter((a) => a.status === "completed");

    if (completed.length === 0) {
      setPrescriptions({});
      return;
    }

    await Promise.all(
      completed.map(async (apt) => {
        try {
          const res = await getPrescription(apt.id);
          map[apt.id] = res.data;
        } catch {
          // No existing prescription.
        }
      })
    );

    setPrescriptions(map);
  }, []);

  const loadAppointments = useCallback(
    async (docId, pg, sts) => {
      setLoading(true);

      try {
        const params = { page: pg, limit: 12 };
        if (sts && sts !== "all") {
          params.status = sts;
        }

        const res = await getDoctorAppointments(docId, params);
        const apts = res.data?.appointments || [];
        setAppointments(apts);
        setTotalPages(res.data?.total_pages || 1);
        await loadPrescriptionsForApts(apts);
      } catch (err) {
        setToast({ message: getErrorMessage(err), type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [loadPrescriptionsForApts]
  );

  useEffect(() => {
    getMyDoctorProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setToast({ message: "Failed to load doctor profile", type: "error" }));
  }, []);

  useEffect(() => {
    if (!profile) return;
    loadAppointments(profile.id, page, statusFilter);
  }, [profile, page, statusFilter, loadAppointments]);

  const handleComplete = async (id) => {
    try {
      await completeAppointment(id);
      setToast({ message: "Appointment marked as completed", type: "success" });
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleAddNote = async (appointmentId, data) => {
    try {
      await addClinicalNote(appointmentId, data);
      setToast({ message: "Clinical note created", type: "success" });
      setNoteModal(null);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleCreatePrescription = async (appointmentId, data) => {
    try {
      await addPrescription(appointmentId, data);
      setToast({ message: "Prescription created", type: "success" });
      setCreatePrescModal(null);
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleEditPrescription = async (appointmentId, data) => {
    try {
      await updatePrescription(appointmentId, data);
      setToast({ message: "Prescription updated", type: "success" });
      setEditPrescModal(null);
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleDeletePrescription = async () => {
    if (!deletePrescTarget) return;

    try {
      await deletePrescription(deletePrescTarget.appointment_id);
      setToast({ message: "Prescription deleted", type: "success" });
      setDeletePrescTarget(null);
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const todayIso = new Date().toISOString().split("T")[0];

  const appointmentTypes = useMemo(() => {
    const unique = new Set();
    appointments.forEach((apt) => unique.add(getAppointmentType(apt)));
    return ["all", ...Array.from(unique).sort()];
  }, [appointments]);

  const metrics = useMemo(() => {
    const today = appointments.filter((apt) => apt.date === todayIso).length;
    const upcoming = appointments.filter(
      (apt) => apt.status === "booked" && (apt.date || "") >= todayIso
    ).length;
    const completed = appointments.filter((apt) => apt.status === "completed").length;
    const cancelled = appointments.filter((apt) => apt.status === "cancelled").length;

    return { today, upcoming, completed, cancelled };
  }, [appointments, todayIso]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return appointments.filter((apt) => {
      const patientName = (apt.patient_name || "").toLowerCase();
      const aptType = getAppointmentType(apt);

      const matchesSearch = !normalizedSearch || patientName.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
      const matchesType = typeFilter === "all" || aptType === typeFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = apt.date === todayIso;
      } else if (dateFilter === "upcoming") {
        matchesDate = (apt.date || "") >= todayIso;
      } else if (dateFilter === "past") {
        matchesDate = (apt.date || "") < todayIso;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [appointments, search, statusFilter, typeFilter, dateFilter, todayIso]);

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <section className="relative overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-xl shadow-sky-100/70 px-6 py-7 md:px-9 md:py-9 mb-7">
          <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute -bottom-20 -left-8 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sky-200 text-sky-700 text-[11px] font-bold uppercase tracking-[0.14em] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                Doctor Workflow
              </div>

              <h1 className="text-[32px] md:text-[44px] font-extrabold tracking-tight leading-tight text-slate-900">
                My Appointments
              </h1>
              <p className="mt-2 text-[15px] text-slate-500 max-w-2xl">
                Run your clinic day with clarity. Review upcoming visits, complete consults, capture clinical notes, and manage prescriptions from one premium workspace.
              </p>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl">
                <SummaryChip label="Today" value={metrics.today} />
                <SummaryChip label="Upcoming" value={metrics.upcoming} />
                <SummaryChip label="Completed" value={metrics.completed} />
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <button className="btn-primary" onClick={() => navigate("/doctor/availability")}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Slot
                </button>
                <button className="btn-outline" onClick={() => navigate("/doctor/notes")}>
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  Clinical Notes
                </button>
                <button className="btn-outline" onClick={() => navigate("/doctor/prescriptions")}>
                  <span className="material-symbols-outlined text-[18px]">medication</span>
                  Prescriptions
                </button>
              </div>
            </div>

            <div className="hidden lg:block w-[280px]">
              <HealthcareHero className="w-full h-auto" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          <StatsCard icon="calendar_month" label="Today's Appointments" value={metrics.today} gradient="bg-gradient-to-br from-sky-100 via-sky-50 to-white" pulse />
          <StatsCard icon="schedule" label="Upcoming" value={metrics.upcoming} gradient="bg-gradient-to-br from-cyan-100 via-cyan-50 to-white" />
          <StatsCard icon="check_circle" label="Completed" value={metrics.completed} gradient="bg-gradient-to-br from-emerald-100 via-emerald-50 to-white" />
          <StatsCard icon="event_busy" label="Cancelled" value={metrics.cancelled} gradient="bg-gradient-to-br from-rose-100 via-rose-50 to-white" />
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-4 md:p-5 shadow-md shadow-sky-100/50 mb-7">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <FilterControl label="Search Patient">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name"
                className="input-premium h-11"
              />
            </FilterControl>

            <FilterControl label="Date Filter">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-premium h-11"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </FilterControl>

            <FilterControl label="Status Filter">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-premium h-11"
              >
                <option value="all">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FilterControl>

            <FilterControl label="Appointment Type">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-premium h-11"
              >
                {appointmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All Types" : t}
                  </option>
                ))}
              </select>
            </FilterControl>
          </div>
        </section>

        <section>
          {loading ? (
            <SkeletonCards />
          ) : filteredAppointments.length === 0 ? (
            <div className="rounded-[24px] border border-sky-100 bg-white py-16 px-6 text-center shadow-lg shadow-sky-100/40">
              <EmptyAppointments className="w-40 h-32 mx-auto opacity-70" />
              <h3 className="mt-4 text-[22px] font-bold text-slate-900">No appointments matched your filters</h3>
              <p className="mt-2 text-slate-500 max-w-xl mx-auto">
                Try broadening your filters or update your availability to open new appointment slots for patients.
              </p>
              <button
                className="btn-primary mt-6"
                onClick={() => navigate("/doctor/availability")}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Manage Availability
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredAppointments.map((apt) => {
                  const hasPresc = !!prescriptions[apt.id];
                  const presc = prescriptions[apt.id];

                  return (
                    <AppointmentCard
                      key={apt.id}
                      apt={apt}
                      hasPrescription={hasPresc}
                      prescription={presc}
                      onView={() => setSelectedApt(apt)}
                      onAddNote={() => setNoteModal(apt)}
                      onComplete={() => handleComplete(apt.id)}
                      onCreatePrescription={() => setCreatePrescModal(apt)}
                      onViewPrescription={() => setViewPrescModal({ prescription: presc, appointment: apt })}
                      onEditPrescription={() => setEditPrescModal({ prescription: presc, appointment: apt })}
                      onDeletePrescription={() => setDeletePrescTarget({ prescription: presc, appointment: apt })}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm text-slate-500 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="btn-outline disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="btn-primary disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {selectedApt && (
          <AppointmentDetailsModal appointment={selectedApt} onClose={() => setSelectedApt(null)} />
        )}

        {noteModal && (
          <QuickNoteModal appointment={noteModal} onClose={() => setNoteModal(null)} onSave={handleAddNote} />
        )}

        {createPrescModal && (
          <QuickCreatePrescriptionModal
            appointment={createPrescModal}
            onClose={() => setCreatePrescModal(null)}
            onSave={handleCreatePrescription}
          />
        )}

        {viewPrescModal && (
          <ViewPrescriptionModal
            prescription={viewPrescModal.prescription}
            appointment={viewPrescModal.appointment}
            onClose={() => setViewPrescModal(null)}
          />
        )}

        {editPrescModal && (
          <QuickEditPrescriptionModal
            prescription={editPrescModal.prescription}
            appointment={editPrescModal.appointment}
            onClose={() => setEditPrescModal(null)}
            onSave={handleEditPrescription}
          />
        )}

        {deletePrescTarget && (
          <ConfirmDeletePrescriptionModal
            prescription={deletePrescTarget.prescription}
            appointment={deletePrescTarget.appointment}
            onClose={() => setDeletePrescTarget(null)}
            onConfirm={handleDeletePrescription}
          />
        )}
      </div>
    </div>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white/80 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-slate-500">{label}</p>
      <p className="text-[20px] leading-none font-extrabold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function AppointmentDetailsModal({ appointment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">patient_list</span>
            Patient Overview
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex items-center gap-4 pb-4 border-b border-sky-100">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold flex items-center justify-center shadow-lg shadow-sky-500/30">
            {getPatientInitial(appointment.patient_name, appointment.id)}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              {appointment.patient_name || `Patient #${appointment.id}`}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusBadge(appointment.status)}`}>
                {appointment.status}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRiskBadge(getRiskLevel(appointment))}`}>
                Risk: {getRiskLevel(appointment)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <DetailItem label="Date" value={formatDate(appointment.date)} />
          <DetailItem label="Time" value={`${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`} />
          <DetailItem label="Type" value={getAppointmentType(appointment)} />
          <DetailItem label="Age / Gender" value={`${getPatientAge(appointment) || "N/A"} / ${getPatientGender(appointment) || "N/A"}`} />
          <DetailItem label="Doctor ID" value={`#${appointment.doctor_id}`} />
          <DetailItem label="Slot ID" value={`#${appointment.slot_id}`} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 break-words">{value || "-"}</p>
    </div>
  );
}

function QuickNoteModal({ appointment, onClose, onSave }) {
  const [form, setForm] = useState({ diagnosis: "", notes: "", advice: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(appointment.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">description</span>
            Add Clinical Note
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Appointment #{appointment.id} - {formatDate(appointment.date)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Diagnosis"
            id="q-diagnosis"
            name="diagnosis"
            required
            value={form.diagnosis}
            onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))}
          />
          <Field
            label="Clinical Notes"
            id="q-notes"
            name="notes"
            type="textarea"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
          <Field
            label="Recommendations"
            id="q-advice"
            name="advice"
            type="textarea"
            value={form.advice}
            onChange={(e) => setForm((p) => ({ ...p, advice: e.target.value }))}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuickCreatePrescriptionModal({ appointment, onClose, onSave }) {
  const [form, setForm] = useState({
    medicines: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(appointment.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">medication</span>
            Create Prescription
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Appointment #{appointment.id} - {formatDate(appointment.date)} - {appointment.patient_name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Medicine Name"
            name="medicines"
            required
            value={form.medicines}
            onChange={(e) => setForm((p) => ({ ...p, medicines: e.target.value }))}
            placeholder="Metformin 500mg"
          />
          <Field
            label="Dosage"
            name="dosage"
            required
            value={form.dosage}
            onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))}
            placeholder="1 tablet"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Frequency"
              name="frequency"
              value={form.frequency}
              onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
              placeholder="Twice daily"
            />
            <Field
              label="Duration"
              name="duration"
              required
              value={form.duration}
              onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
              placeholder="30 days"
            />
          </div>
          <Field
            label="Instructions"
            name="instructions"
            type="textarea"
            value={form.instructions}
            onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
            placeholder="Take after meals"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewPrescriptionModal({ prescription, appointment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">medication</span>
            Prescription Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-sky-100">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <span className="material-symbols-outlined text-2xl">prescriptions</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {appointment?.patient_name || `Appointment #${prescription.appointment_id}`}
              </h4>
              <p className="text-sm text-slate-500">{appointment ? formatDate(appointment.date) : ""}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Medicine" value={prescription.medicines} />
            <DetailItem label="Dosage" value={prescription.dosage} />
            {prescription.frequency && <DetailItem label="Frequency" value={prescription.frequency} />}
            <DetailItem label="Duration" value={prescription.duration} />
            {prescription.instructions && (
              <div className="col-span-2">
                <DetailItem label="Instructions" value={prescription.instructions} />
              </div>
            )}
            <DetailItem label="Created" value={new Date(prescription.created_at).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickEditPrescriptionModal({ prescription, appointment, onClose, onSave }) {
  const [form, setForm] = useState({
    medicines: prescription.medicines || "",
    dosage: prescription.dosage || "",
    frequency: prescription.frequency || "",
    duration: prescription.duration || "",
    instructions: prescription.instructions || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(prescription.appointment_id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">edit</span>
            Edit Prescription
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          {appointment?.patient_name || `Appointment #${prescription.appointment_id}`}
          {appointment && ` � ${formatDate(appointment.date)}`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Medicine Name"
            name="medicines"
            required
            value={form.medicines}
            onChange={(e) => setForm((p) => ({ ...p, medicines: e.target.value }))}
          />
          <Field
            label="Dosage"
            name="dosage"
            required
            value={form.dosage}
            onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Frequency"
              name="frequency"
              value={form.frequency}
              onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
            />
            <Field
              label="Duration"
              name="duration"
              required
              value={form.duration}
              onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            />
          </div>
          <Field
            label="Instructions"
            name="instructions"
            type="textarea"
            value={form.instructions}
            onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Update Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeletePrescriptionModal({ prescription, appointment, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-rose-600 text-3xl">warning</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Prescription</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          Delete prescription for
          <span className="font-semibold text-slate-800"> {appointment?.patient_name || `Appointment #${prescription.appointment_id}`}</span>?
          This action cannot be undone.
        </p>

        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, name, type, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id || name} className="text-xs font-semibold text-slate-500">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id || name}
          name={name}
          rows={3}
          {...props}
          className="input-premium resize-none"
        />
      ) : (
        <input id={id || name} name={name} {...props} className="input-premium" />
      )}
    </div>
  );
}

