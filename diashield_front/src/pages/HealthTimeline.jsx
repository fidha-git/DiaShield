import React, { useEffect, useState, useMemo } from "react";
import { fetchHealthTimeline, updateLifestyleFields, createMedicalHistoryRecord } from "../services/healthTimelineService";
import { EmptyHealthRecords } from "../components/Illustrations";
import { Button } from "../components/ui/DesignSystem";

const CATEGORY_META = {
  appointments: { label: "Appointments", icon: "calendar_month", color: "cyan" },
  diagnoses: { label: "Diagnoses", icon: "monitor_heart", color: "amber" },
  medications: { label: "Medications", icon: "medication", color: "violet" },
  predictions: { label: "Predictions", icon: "neurology", color: "sky" },
  doctor_notes: { label: "Doctor Notes", icon: "clinical_notes", color: "teal" },
  health_records: { label: "Health Records", icon: "heart_plus", color: "emerald" },
  procedures: { label: "Procedures", icon: "surgical", color: "rose" },
};

const EVENT_CONFIG = {
  appointment_scheduled: { icon: "calendar_add_on", color: "cyan" },
  appointment_completed: { icon: "check_circle", color: "emerald" },
  appointment_cancelled: { icon: "cancel", color: "red" },
  diagnosis_added: { icon: "monitor_heart", color: "amber" },
  medication_prescribed: { icon: "prescriptions", color: "violet" },
  medication_updated: { icon: "medication", color: "violet" },
  risk_prediction: { icon: "neurology", color: "sky" },
  doctor_note: { icon: "clinical_notes", color: "teal" },
  health_record_updated: { icon: "heart_plus", color: "emerald" },
  procedure_surgery: { icon: "surgical", color: "rose" },
};

const FILTERS = [
  { key: "all", label: "All Events", icon: "timeline" },
  { key: "appointments", label: "Appointments", icon: "calendar_month" },
  { key: "diagnoses", label: "Diagnoses", icon: "monitor_heart" },
  { key: "medications", label: "Medications", icon: "medication" },
  { key: "predictions", label: "Predictions", icon: "neurology" },
  { key: "doctor_notes", label: "Doctor Notes", icon: "clinical_notes" },
  { key: "health_records", label: "Health Records", icon: "heart_plus" },
  { key: "procedures", label: "Procedures", icon: "surgical" },
];

const COLOR_MAP = {
  cyan: { bg: "bg-cyan-500", lightBg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200", dotBg: "bg-cyan-100 dark:bg-cyan-900/30", ring: "ring-cyan-500/20", badge: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200" },
  emerald: { bg: "bg-emerald-500", lightBg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200", dotBg: "bg-emerald-100 dark:bg-emerald-900/30", ring: "ring-emerald-500/20", badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200" },
  amber: { bg: "bg-amber-500", lightBg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200", dotBg: "bg-amber-100 dark:bg-amber-900/30", ring: "ring-amber-500/20", badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200" },
  red: { bg: "bg-red-500", lightBg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", border: "border-red-200", dotBg: "bg-red-100 dark:bg-red-900/30", ring: "ring-red-500/20", badge: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200" },
  violet: { bg: "bg-violet-500", lightBg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200", dotBg: "bg-violet-100 dark:bg-violet-900/30", ring: "ring-violet-500/20", badge: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200" },
  sky: { bg: "bg-sky-500", lightBg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-600 dark:text-sky-400", border: "border-sky-200", dotBg: "bg-sky-100 dark:bg-sky-900/30", ring: "ring-sky-500/20", badge: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-sky-200" },
  teal: { bg: "bg-teal-500", lightBg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-600 dark:text-teal-400", border: "border-teal-200", dotBg: "bg-teal-100 dark:bg-teal-900/30", ring: "ring-teal-500/20", badge: "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200" },
  rose: { bg: "bg-rose-500", lightBg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200", dotBg: "bg-rose-100 dark:bg-rose-900/30", ring: "ring-rose-500/20", badge: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200" },
};

function getColor(name) {
  return COLOR_MAP[name] || COLOR_MAP.cyan;
}

function getRiskBadge(level) {
  const lvl = (level || "").toLowerCase();
  if (lvl.includes("high")) return { label: "High Risk", cls: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200" };
  if (lvl.includes("moderate") || lvl.includes("medium")) return { label: "Moderate Risk", cls: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200" };
  if (lvl.includes("low")) return { label: "Low Risk", cls: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200" };
  return { label: level || "Unknown", cls: "bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200" };
}

function getStatusBadge(status) {
  switch (status) {
    case "completed": return { label: "Completed", cls: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200" };
    case "booked": return { label: "Upcoming", cls: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200" };
    case "cancelled": return { label: "Cancelled", cls: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200" };
    default: return null;
  }
}

function groupByMonth(events) {
  const groups = {};
  events.forEach(ev => {
    const d = new Date(ev.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }), events: [] };
    groups[key].events.push(ev);
  });
  return Object.values(groups).sort((a, b) => b.year - a.year || b.month - a.month);
}

export default function HealthTimeline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLifestyle, setShowLifestyle] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchHealthTimeline();
      setData(result);
    } catch (e) {
      setError("Failed to load health timeline");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredTimeline = useMemo(() => {
    if (!data) return [];
    let events = data.timeline;
    if (filterBy !== "all") events = events.filter(e => e.category === filterBy);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      events = events.filter(e =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.subtitle || "").toLowerCase().includes(q) ||
        (e.doctor || "").toLowerCase().includes(q) ||
        (e.details || "").toLowerCase().includes(q)
      );
    }
    return events;
  }, [data, filterBy, searchQuery]);

  const groupedTimeline = useMemo(() => groupByMonth(filteredTimeline), [filteredTimeline]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 bg-sky-100 dark:bg-sky-900/30 rounded-lg" />
            <div className="h-4 w-80 bg-sky-100 dark:bg-sky-900/30 rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-sky-100 dark:bg-sky-900/30 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-3">
                <div className="h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl" />
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-sky-100 dark:bg-sky-900/30 rounded-xl" />)}
              </div>
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-sky-100 dark:bg-sky-900/30 rounded-xl" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="max-w-6xl mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-red-500">error_outline</span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Failed to load timeline</p>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button onClick={loadData} className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { timeline, summary, medicalHistory, healthSnapshot, doctorNotes } = data;

  return (
    <div className="space-y-6">
      <div className="page-container space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200/50 mb-3">
              <span className="material-symbols-outlined text-sm text-sky-600">timeline</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-600">Patient Journey</span>
            </div>
            <h1 className="hero-title text-2xl md:text-3xl">Health Timeline</h1>
            <p className="hero-subtitle mt-1 text-sm">Complete healthcare journey — appointments, diagnoses, medications, and risk assessments.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {timeline.length} event{timeline.length !== 1 ? "s" : ""} recorded
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard icon="event_available" label="Total Visits" value={summary.totalVisits ?? 0}
            sub={summary.lastAppointment ? `Last: ${new Date(summary.lastAppointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "No visits yet"}
            color="from-cyan-500/15 to-cyan-500/5 border-cyan-200/50" iconColor="text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" />
          <SummaryCard icon="monitor_heart" label="Active Conditions" value={summary.activeConditions.length || 0}
            sub={summary.activeConditions.length > 0 ? summary.activeConditions.slice(0, 2).join(", ") + (summary.activeConditions.length > 2 ? ` +${summary.activeConditions.length - 2}` : "") : "None recorded"}
            color="from-amber-500/15 to-amber-500/5 border-amber-200/50" iconColor="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
          <SummaryCard icon="medication" label="Active Medications" value={summary.currentMedications ? summary.currentMedications.split(";").length : 0}
            sub={summary.currentMedications ? "Prescribed" : "None recorded"}
            color="from-violet-500/15 to-violet-500/5 border-violet-200/50" iconColor="text-violet-600 bg-violet-50 dark:bg-violet-900/20" />
          <SummaryCard icon="neurology" label="Latest Risk Score" value={summary.latestRiskScore ? getRiskBadge(summary.latestRiskScore.level).label : "—"}
            sub={summary.latestRiskScore?.score != null ? `${summary.latestRiskScore.score}% confidence` : "No assessment"}
            color="from-sky-500/15 to-sky-500/5 border-sky-200/50" iconColor="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
          <SummaryCard icon="folder_medical" label="Health Records" value={summary.healthRecordsCount ?? 0}
            sub={`${summary.healthRecordsCount || 0} record${summary.healthRecordsCount !== 1 ? "s" : ""} on file`}
            color="from-emerald-500/15 to-emerald-500/5 border-emerald-200/50" iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilterBy(f.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  filterBy === f.key
                    ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20"
                    : "bg-white dark:bg-[#0F172A]/90 text-slate-600 dark:text-slate-400 border-sky-100 dark:border-sky-900/30 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                }`}>
                <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
            <input type="text" placeholder="Search timeline..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Timeline Column */}
          <div className="lg:col-span-2">
            {filteredTimeline.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 rounded-2xl shadow-sm">
                <TimelineEmptyState filter={filterBy} search={searchQuery} onClearFilter={() => { setFilterBy("all"); setSearchQuery(""); }} />
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-sky-200 via-cyan-200 to-sky-100 dark:from-sky-800/40 dark:via-cyan-800/30 dark:to-sky-800/20" />

                <div className="space-y-1">
                  {groupedTimeline.map(group => (
                    <div key={`${group.year}-${group.month}`}>
                      {/* Month group header */}
                      <div className="sticky top-0 z-10 py-2 mb-1">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/20">
                            <span className="material-symbols-outlined text-sm text-white">calendar_month</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{group.label}</h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-sky-200/50 to-transparent dark:from-sky-800/30" />
                        </div>
                      </div>

                      {/* Events */}
                      <div className="space-y-2 pl-0">
                        {group.events.map((event, idx) => (
                          <TimelineEvent key={event.id} event={event} index={idx}
                            isExpanded={expandedEvents.has(event.id)} onToggle={() => toggleExpand(event.id)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Health Snapshot */}
          <div className="space-y-4">
            <HealthSnapshotPanel snapshot={healthSnapshot} />

            {/* Doctor Notes */}
            <DoctorNotesSection notes={doctorNotes} />

            {/* Lifestyle quick view */}
            <div className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-500">favorite</span>
                  Lifestyle Factors
                </h3>
                <button onClick={() => setShowLifestyle(true)}
                  className="text-[10px] font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">edit</span>
                  Edit
                </button>
              </div>
              {healthSnapshot?.lifestyle?.smoking || healthSnapshot?.lifestyle?.alcohol ? (
                <div className="space-y-2">
                  {healthSnapshot.lifestyle.smoking && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Smoking</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        healthSnapshot.lifestyle.smoking === "non-smoker" || healthSnapshot.lifestyle.smoking === "Not set"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      }`}>{healthSnapshot.lifestyle.smoking}</span>
                    </div>
                  )}
                  {healthSnapshot.lifestyle.alcohol && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Alcohol</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        healthSnapshot.lifestyle.alcohol === "non-drinker" || healthSnapshot.lifestyle.alcohol === "Not set"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      }`}>{healthSnapshot.lifestyle.alcohol}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No lifestyle data recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Modal */}
      {showLifestyle && (
        <LifestyleModal
          history={medicalHistory.length > 0 ? medicalHistory.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b) : null}
          onClose={() => setShowLifestyle(false)}
          onSaved={() => { setShowLifestyle(false); loadData(); }}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, color, iconColor }) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${color} shadow-sm border ${color.split(" ").pop()} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-base">{icon}</span>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

function TimelineEvent({ event, index, isExpanded, onToggle }) {
  const config = EVENT_CONFIG[event.type] || { icon: "circle", color: "slate" };
  const color = getColor(event.color || config.color || "slate");
  const statusBadge = getStatusBadge(event.status);
  const riskBadge = event.type === "risk_prediction" ? getRiskBadge(event.riskLevel) : null;
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = event.raw?.start_time?.slice(0, 5) || "";

  const isPrediction = event.type === "risk_prediction";

  return (
    <div className="group relative pl-12 pr-0 transition-all duration-200">
      {/* Timeline dot */}
      <div className={`absolute left-[9px] top-[18px] w-[17px] h-[17px] rounded-full ${color.dotBg} border-2 border-white dark:border-[#0B1120] ring-2 ${color.ring} flex items-center justify-center z-10 transition-transform duration-200 group-hover:scale-110`}>
        <span className={`material-symbols-outlined text-[8px] ${color.text}`}>{config.icon}</span>
      </div>

      {/* Event card */}
      <div className={`relative rounded-xl border ${color.border} bg-white dark:bg-[#0F172A]/90 shadow-sm transition-all duration-200 hover:shadow-md hover:border-opacity-60 ${
        isPrediction ? "border-sky-300 dark:border-sky-700 ring-1 ring-sky-500/10" : ""
      }`}>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Category badge + date */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${color.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${color.bg}`} />
                  {CATEGORY_META[event.category]?.label || event.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{dateStr}{timeStr ? ` · ${timeStr}` : ""}</span>
              </div>

              {/* Title */}
              <p className={`text-sm font-bold ${isPrediction ? "text-sky-700 dark:text-sky-300" : "text-slate-800 dark:text-slate-100"}`}>
                {event.title}
              </p>

              {/* Subtitle */}
              {event.subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.subtitle}</p>
              )}

              {/* Doctor */}
              {event.doctor && event.doctor !== "Self-reported" && (
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">stethoscope</span>
                  {event.doctor}
                </p>
              )}

              {/* Prediction-specific risk score display */}
              {isPrediction && event.riskScore != null && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Risk Score:</span>
                    <span className={`text-lg font-bold ${event.riskScore >= 60 ? "text-red-500" : event.riskScore >= 30 ? "text-amber-500" : "text-emerald-500"}`}>
                      {event.riskScore}%
                    </span>
                  </div>
                  {riskBadge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskBadge.cls}`}>
                      {riskBadge.label}
                    </span>
                  )}
                </div>
              )}

              {/* Details (shown when expanded) */}
              {event.details && (
                <button onClick={onToggle} className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  <span className="material-symbols-outlined text-[12px]">{isExpanded ? "expand_less" : "expand_more"}</span>
                  {isExpanded ? "Show less" : "Show details"}
                </button>
              )}
              {isExpanded && event.expandedDetails && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                  <pre className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans">{event.expandedDetails}</pre>
                </div>
              )}
              {isExpanded && event.details && !event.expandedDetails && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{event.details}</p>
                </div>
              )}

              {/* Doctor note if available */}
              {event.doctorNote && (
                <div className="mt-2 p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">Doctor's Note</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{typeof event.doctorNote === "object" ? JSON.stringify(event.doctorNote) : event.doctorNote}</p>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              {statusBadge && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
              )}
              {/* Risk badge for predictions (also shown inline) */}
              {isPrediction && riskBadge && !event.riskScore && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${riskBadge.cls}`}>
                  {riskBadge.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthSnapshotPanel({ snapshot }) {
  if (!snapshot) return null;

  const items = [
    { label: "Blood Group", value: snapshot.bloodGroup, icon: "bloodtype" },
    { label: "Height", value: snapshot.height, icon: "height", suffix: "cm" },
    { label: "Weight", value: snapshot.weight, icon: "monitor_weight", suffix: "kg" },
    { label: "BMI", value: snapshot.bmi, icon: "body_system_metabolic" },
    { label: "Allergies", value: snapshot.allergies, icon: "allergy" },
    { label: "Family History", value: snapshot.familyHistory, icon: "group" },
  ];

  const hasSnapshotSection = items.some(i => i.value);
  const hasConditions = snapshot.conditions && snapshot.conditions.length > 0;
  const hasMedications = snapshot.medications && snapshot.medications.length > 0;

  if (!hasSnapshotSection && !hasConditions && !hasMedications) return null;

  return (
    <div className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-sky-100 dark:border-sky-900/30 bg-gradient-to-r from-sky-500/5 to-cyan-500/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-sky-500">badge</span>
          Patient Health Snapshot
        </h3>
      </div>
      <div className="p-4 space-y-2.5">
        {/* Vital stats */}
        {items.map(item => item.value ? (
          <div key={item.label} className="flex items-center justify-between py-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-slate-400">{item.icon}</span>
              {item.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {item.value}{item.suffix || ""}
            </span>
          </div>
        ) : null)}

        {/* Separator if conditions or meds exist */}
        {(hasConditions || hasMedications) && hasSnapshotSection && (
          <div className="border-t border-sky-100 dark:border-sky-900/30 pt-2.5 mt-1" />
        )}

        {/* Current Conditions */}
        {hasConditions && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
              <span className="material-symbols-outlined text-[12px]">monitor_heart</span>
              Current Conditions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {snapshot.conditions.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border border-amber-200 dark:border-amber-800/30">
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active Medications */}
        {hasMedications && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1 mb-1.5">
              <span className="material-symbols-outlined text-[12px]">medication</span>
              Active Medications
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">{snapshot.medications.join("; ")}</p>
          </div>
        )}

        {/* No data fallback */}
        {!hasSnapshotSection && !hasConditions && !hasMedications && (
          <p className="text-xs text-slate-400 text-center py-2">No health data recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function DoctorNotesSection({ notes }) {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-sky-100 dark:border-sky-900/30 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-teal-500">clinical_notes</span>
          Doctor's Notes
        </h3>
      </div>
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {notes.map(note => (
          <div key={note.id} className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-slate-400">stethoscope</span>
                {note.doctor}
              </span>
              <span className="text-[10px] text-slate-400">{new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {typeof note.note === "object" ? (
                <>
                  {note.note.clinical_summary && <span><strong>Summary:</strong> {note.note.clinical_summary}<br /></span>}
                  {note.note.recommendations && <span><strong>Recommendations:</strong> {note.note.recommendations}</span>}
                  {!note.note.clinical_summary && !note.note.recommendations && JSON.stringify(note.note)}
                </>
              ) : note.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineEmptyState({ filter, search, onClearFilter }) {
  const hasFilter = filter !== "all" || search;

  return (
    <div className="flex flex-col items-center gap-4 px-4">
      <div className="w-32 h-24 opacity-50">
        <EmptyHealthRecords className="w-full h-full" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {search ? `No results for "${search}"` : hasFilter ? `No ${FILTERS.find(f => f.key === filter)?.label.toLowerCase() || "timeline"} events` : "No timeline events yet"}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {search ? "Try a different search term" : hasFilter ? "Try adjusting your filters" : "Events will appear here as you interact with healthcare services."}
        </p>
      </div>
      {hasFilter && (
        <button onClick={onClearFilter}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors border border-sky-200 dark:border-sky-800/30">
          <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
          Clear Filters
        </button>
      )}
    </div>
  );
}

function LifestyleModal({ history, onClose, onSaved }) {
  const [form, setForm] = useState({
    smoking_status: history?.smoking_status || "",
    alcohol_status: history?.alcohol_status || "",
    family_history: history?.family_history || "",
    notes: history?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (history?.id) {
        await updateLifestyleFields(history.id, form);
      } else {
        await createMedicalHistoryRecord(form);
      }
      onSaved();
    } catch (e) {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">favorite</span>
            Lifestyle & Family History
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Smoking Status</label>
            <select name="smoking_status" value={form.smoking_status} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 transition-colors">
              <option value="">Not set</option>
              <option value="non-smoker">Non-smoker</option>
              <option value="former smoker">Former smoker</option>
              <option value="current smoker">Current smoker</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Alcohol Consumption</label>
            <select name="alcohol_status" value={form.alcohol_status} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 transition-colors">
              <option value="">Not set</option>
              <option value="non-drinker">Non-drinker</option>
              <option value="occasional">Occasional</option>
              <option value="regular">Regular</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Family History</label>
            <input name="family_history" value={form.family_history} onChange={handleChange}
              placeholder="e.g. Diabetes, Hypertension (parent, sibling)"
              className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Allergies / Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="e.g. Allergic to penicillin, sulfa drugs"
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-sky-900/30 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400 resize-none" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-sky-100 dark:border-sky-900/30 text-slate-500 dark:text-slate-400 font-semibold text-sm bg-white dark:bg-[#0F172A]/90 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
