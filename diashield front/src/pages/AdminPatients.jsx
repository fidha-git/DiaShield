import React, { useEffect, useMemo, useState } from "react";
import {
  fetchAdminUsers,
  fetchAdminAppointments,
  fetchAdminPredictions,
} from "../services/adminService";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  AdminInput,
  AdminSelect,
  AdminButton,
  Avatar,
  Badge,
  EmptyCard,
  AdminToast,
  MetricCard,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";

function riskTone(risk = "") {
  const v = risk.toLowerCase();
  if (v.includes("high")) return "rose";
  if (v.includes("moderate") || v.includes("medium")) return "amber";
  if (v.includes("low")) return "emerald";
  return "slate";
}

function healthStatusFromRisk(risk = "") {
  const v = risk.toLowerCase();
  if (v.includes("high")) return "Needs Follow-up";
  if (v.includes("moderate") || v.includes("medium")) return "Monitor";
  if (v.includes("low")) return "Stable";
  return "Unknown";
}

const PROFILE_BASE = "http://127.0.0.1:8000";

export default function AdminPatients() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, appointmentsRes, predictionsRes] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminAppointments(),
          fetchAdminPredictions(),
        ]);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
        setPredictions(Array.isArray(predictionsRes.data) ? predictionsRes.data : []);
      } catch {
        setToast({ type: "error", message: "Failed to load patient data" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestPredictionByPatient = useMemo(() => {
    const map = new Map();
    predictions.forEach((p) => {
      const existing = map.get(p.patient_id);
      if (!existing) {
        map.set(p.patient_id, p);
        return;
      }
      const prev = existing.created_at ? new Date(existing.created_at).getTime() : 0;
      const next = p.created_at ? new Date(p.created_at).getTime() : 0;
      if (next > prev) map.set(p.patient_id, p);
    });
    return map;
  }, [predictions]);

  const lastAppointmentByUser = useMemo(() => {
    const map = new Map();
    appointments.forEach((apt) => {
      const existing = map.get(apt.user_id);
      if (!existing) {
        map.set(apt.user_id, apt);
        return;
      }
      const prev = existing.created_at ? new Date(existing.created_at).getTime() : 0;
      const next = apt.created_at ? new Date(apt.created_at).getTime() : 0;
      if (next > prev) map.set(apt.user_id, apt);
    });
    return map;
  }, [appointments]);

  const patients = useMemo(() => {
    return users
      .filter((u) => (u.role || "patient") === "patient")
      .map((u) => {
        const pred = latestPredictionByPatient.get(u.id);
        const risk = pred?.risk_level || "Unknown";
        const appointment = lastAppointmentByUser.get(u.id);
        return {
          ...u,
          risk,
          healthStatus: healthStatusFromRisk(risk),
          lastAppointment: appointment?.created_at || null,
        };
      });
  }, [users, latestPredictionByPatient, lastAppointmentByUser]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return patients.filter((p) => {
      const text = `${p.username || ""} ${p.email || ""}`.toLowerCase();
      const matchesSearch = !q || text.includes(q);
      const matchesRisk =
        riskFilter === "all" ||
        (riskFilter === "high" && (p.risk || "").toLowerCase().includes("high")) ||
        (riskFilter === "moderate" && ((p.risk || "").toLowerCase().includes("moderate") || (p.risk || "").toLowerCase().includes("medium"))) ||
        (riskFilter === "low" && (p.risk || "").toLowerCase().includes("low"));
      return matchesSearch && matchesRisk;
    });
  }, [patients, search, riskFilter]);

  const stats = useMemo(() => ({
    total: patients.length,
    highRisk: patients.filter((p) => (p.risk || "").toLowerCase().includes("high")).length,
    stable: patients.filter((p) => (p.risk || "").toLowerCase().includes("low")).length,
    recentlySeen: patients.filter((p) => p.lastAppointment).length,
  }), [patients]);

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <AdminHero
        title="Patients"
        subtitle="Review patient cohorts with risk intelligence, appointment recency, and quick operational actions."
        right={<HealthcareHero className="w-full h-auto" />}
      />

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Patients" value={stats.total} icon="clinical_notes" tone="sky" />
        <MetricCard label="High-Risk" value={stats.highRisk} icon="warning" tone="rose" />
        <MetricCard label="Stable" value={stats.stable} icon="favorite" tone="emerald" />
        <MetricCard label="Recent Visits" value={stats.recentlySeen} icon="event_available" tone="cyan" />
      </section>

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AdminInput
            placeholder="Search patient by username or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AdminSelect value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </AdminSelect>
          <div className="text-sm text-slate-500 flex items-center justify-end">{filtered.length} patients</div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-48 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyCard icon="group_off" title="No patients found" subtitle="Try different search criteria or filters." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((patient) => (
              <article key={patient.id} className="rounded-[20px] border border-sky-100 bg-white p-5 shadow-md shadow-sky-100/50 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={patient.username || "Patient"}
                      src={patient.profile_image ? `${PROFILE_BASE}${patient.profile_image}` : ""}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{patient.username || "Unknown"}</h3>
                      <p className="text-sm text-slate-500 truncate">{patient.email}</p>
                    </div>
                  </div>
                  <Badge tone={riskTone(patient.risk)}>{patient.risk}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Mini label="Health Status" value={patient.healthStatus} icon="monitor_heart" />
                  <Mini label="Patient ID" value={`#${patient.id}`} icon="tag" />
                  <Mini
                    label="Last Appointment"
                    value={patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString() : "No visits"}
                    icon="calendar_month"
                  />
                  <Mini label="Account" value={patient.is_active === false ? "Inactive" : "Active"} icon="verified_user" />
                </div>

                <div className="mt-4 flex gap-2">
                  <AdminButton
                    variant="outline"
                    className="flex-1 !text-xs !px-2"
                    onClick={() => setToast({ type: "success", message: `Patient profile selected: ${patient.username || patient.email}` })}
                  >
                    View Profile
                  </AdminButton>
                  <AdminButton
                    variant="outline"
                    className="flex-1 !text-xs !px-2"
                    onClick={() => setToast({ type: "success", message: `Timeline opened for ${patient.username || patient.email}` })}
                  >
                    View Timeline
                  </AdminButton>
                  <AdminButton
                    variant="outline"
                    className="flex-1 !text-xs !px-2"
                    onClick={() => setToast({ type: "success", message: `Contact action prepared for ${patient.email}` })}
                  >
                    Contact
                  </AdminButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
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
