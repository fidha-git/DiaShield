import React, { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import healthRecordService from "../services/healthRecordService";
import { fetchHealthTimeline } from "../services/healthTimelineService";
import { EmptyHealthRecords } from "../components/Illustrations";

function SectionCard({ title, icon, iconColor, children, empty }) {
  if (!children && empty) return null;
  return (
    <div className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 rounded-2xl shadow-lg shadow-blue-200/30 overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-sky-100 dark:border-sky-900/30">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className={`material-symbols-outlined text-lg ${iconColor}`}>{icon}</span>
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children || <p className="text-sm text-slate-400 text-center py-6">{empty || "No data available."}</p>}</div>
    </div>
  );
}

function EmptyBlock({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <div className="w-20 h-16 opacity-40"><EmptyHealthRecords className="w-full h-full" /></div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export default function HealthRecords() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [records, setRecords] = useState([]);
  const [medications, setMedications] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [timelineRes, profileRes] = await Promise.all([
        fetchHealthTimeline().catch(() => null),
        API.get("/patient/me").catch(() => ({ data: null })),
      ]);

      setTimelineData(timelineRes);
      setProfile(profileRes?.data || null);

      const pid = profileRes?.data?.id;
      if (pid) {
        const [recRes, medsRes] = await Promise.all([
          API.get(`/health-record/${pid}`).catch(() => ({ data: [] })),
          healthRecordService.getMedications().catch(() => []),
        ]);
        setRecords(Array.isArray(recRes.data) ? recRes.data : []);
        setMedications(Array.isArray(medsRes) ? medsRes : []);
      }
    } catch {
      setError("Failed to load health records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const latestRecord = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.recorded_at || b.created_at) - new Date(a.recorded_at || a.created_at));
    return sorted[0] || null;
  }, [records]);

  const activeConditions = useMemo(() => {
    const conditions = [];
    // From medical history (self-reported chronic diseases)
    if (timelineData?.medicalHistory?.length) {
      const latest = timelineData.medicalHistory.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
      if (latest?.chronic_diseases) {
        latest.chronic_diseases.split(",").map(s => s.trim()).filter(Boolean).forEach(c => {
          if (!conditions.includes(c)) conditions.push(c);
        });
      }
    }
    // From clinical notes (doctor-diagnosed conditions)
    if (timelineData?.appointments?.length) {
      timelineData.appointments
        .filter(a => a.status === "completed" && a.doctor_note?.diagnosis)
        .forEach(a => {
          const diag = a.doctor_note.diagnosis.trim();
          if (diag && !conditions.includes(diag)) conditions.push(diag);
        });
    }
    return conditions;
  }, [timelineData]);

  const doctorNotes = useMemo(() => {
    if (!timelineData?.appointments?.length) return [];
    return timelineData.appointments
      .filter(a => a.status === "completed" && a.doctor_note?.notes)
      .map(a => ({ id: `note-${a.id}`, doctor: a.doctor_name || "Healthcare Provider", date: a.date || a.created_at, note: a.doctor_note }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [timelineData]);

  const { name, age, gender, blood_group, weight } = profile || {};
  const calcBmi = (h, w) => {
    const hNum = parseFloat(h), wNum = parseFloat(w);
    if (!isNaN(hNum) && !isNaN(wNum) && hNum > 0) return (wNum / Math.pow(hNum / 100, 2)).toFixed(1);
    return null;
  };
  const height = profile?.height || null;
  const latestWeight = weight || latestRecord?.weight || null;
  const bmi = latestRecord?.bmi ? parseFloat(latestRecord.bmi).toFixed(1) : calcBmi(height, latestWeight);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-sky-100 dark:bg-sky-900/30 rounded-lg" />
          <div className="h-4 w-72 bg-sky-100 dark:bg-sky-900/30 rounded-lg" />
          <div className="h-44 bg-sky-100 dark:bg-sky-900/30 rounded-2xl" />
          <div className="h-32 bg-sky-100 dark:bg-sky-900/30 rounded-2xl" />
          <div className="h-32 bg-sky-100 dark:bg-sky-900/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-red-500">error_outline</span>
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Failed to load data</p>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button onClick={loadAll}
            className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200/50 mb-3">
              <span className="material-symbols-outlined text-sm text-sky-600">description</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-600">Medical Records</span>
            </div>
            <h1 className="hero-title text-2xl md:text-3xl">Health Records</h1>
            <p className="hero-subtitle mt-1 text-sm">Your medical information, conditions, medications, and clinical notes.</p>
          </div>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                const response = await API.get("/report/pdf", {
                  responseType: "blob",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `diashield_health_report_${new Date().toISOString().split("T")[0]}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } catch {
                alert("Failed to generate PDF report.");
              }
            }}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/20"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export PDF
          </button>
        </div>

        {/* Patient Information Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 shadow-lg shadow-blue-200/30">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-sky-200/30 to-cyan-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-cyan-200/20 to-sky-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 p-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="material-symbols-outlined text-white text-2xl">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name || "Patient"}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {age && <span>{age} years</span>}
                  {gender && <span>{gender}</span>}
                  {blood_group && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/30">
                      <span className="material-symbols-outlined text-sm">bloodtype</span>
                      {blood_group}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-sky-100 dark:border-sky-900/30">
              <InfoItem icon="straighten" label="Height" value={height ? `${height} cm` : "—"} />
              <InfoItem icon="fitness_center" label="Weight" value={latestWeight ? `${latestWeight} kg` : "—"} />
              <InfoItem icon="monitoring" label="BMI" value={bmi ? `${bmi} kg/m²` : "—"} />
              <InfoItem icon="description" label="Records" value={records.length + doctorNotes.length + medications.length} />
            </div>
          </div>
        </div>

        {/* Current Conditions */}
        <SectionCard title="Current Conditions" icon="monitor_heart" iconColor="text-amber-500">
          {activeConditions.length === 0 ? (
            <p className="text-sm text-slate-400">No active conditions recorded.</p>
          ) : (
            <div className="space-y-2">
              {activeConditions.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">{c}</span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Active Medications */}
        <SectionCard title="Active Medications" icon="medication" iconColor="text-violet-500">
          {medications.length === 0 ? (
            <p className="text-sm text-slate-400">No active medications. Prescriptions will appear here once issued.</p>
          ) : (
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={med.id || i} className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/20">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{med.medicines || "Medication"}</span>
                      {med.dosage && <span className="text-sm text-slate-500 ml-2">{med.dosage}</span>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">Active</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                    {med.frequency && <span>Frequency: <strong className="text-slate-700 dark:text-slate-300">{med.frequency}</strong></span>}
                    {med.doctor_name && <span>Prescribed by: <strong className="text-slate-700 dark:text-slate-300">{med.doctor_name}</strong></span>}
                    {med.created_at && <span>Started: <strong className="text-slate-700 dark:text-slate-300">{new Date(med.created_at).toLocaleDateString()}</strong></span>}
                  </div>
                  {med.instructions && <p className="text-xs text-slate-400 mt-2 italic">{med.instructions}</p>}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Doctor Notes */}
        <SectionCard title="Doctor's Notes" icon="clinical_notes" iconColor="text-teal-500">
          {doctorNotes.length === 0 ? (
            <p className="text-sm text-slate-400">No clinical notes yet. Notes from completed appointments will appear here.</p>
          ) : (
            <div className="space-y-3">
              {doctorNotes.slice(0, 5).map(n => (
                <div key={n.id} className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-slate-400">stethoscope</span>
                      {n.doctor}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                    {n.note?.diagnosis && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-amber-500 mt-0.5">monitor_heart</span>
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diagnosis</span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium">{n.note.diagnosis}</p>
                        </div>
                      </div>
                    )}
                    {n.note?.notes && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-teal-500 mt-0.5">clinical_notes</span>
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clinical Notes</span>
                          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{n.note.notes}</p>
                        </div>
                      </div>
                    )}
                    {n.note?.advice && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-sky-500 mt-0.5">lightbulb</span>
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recommendations</span>
                          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{n.note.advice}</p>
                        </div>
                      </div>
                    )}
                    {(!n.note?.diagnosis && !n.note?.notes && !n.note?.advice) && (
                      <p className="text-slate-400 italic">No clinical details available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-base text-sky-600 dark:text-sky-400">{icon}</span>
      </div>
      <div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}
