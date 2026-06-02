import React, { useEffect, useState } from "react";
import { fetchHealthTimeline, updateLifestyleFields, createMedicalHistoryRecord } from "../services/healthTimelineService";
import { EmptyHealthRecords } from "../components/Illustrations";

const TYPE_ICONS = {
  appointment: "calendar_today",
  condition: "monitor_heart",
  surgery: "surgical",
  vitals: "heart_plus",
  prediction: "neurology",
};

const TYPE_COLORS = {
  appointment: "border-l-cyan-500 bg-[#F0F9FF]",
  condition: "border-l-amber-500 bg-amber-50",
  surgery: "border-l-red-500 bg-red-50",
  vitals: "border-l-emerald-500 bg-emerald-50",
  prediction: "border-l-sky-500 bg-[#F0F9FF]",
};

const TYPE_BADGES = {
  appointment: "bg-[#F0F9FF] text-cyan-600",
  condition: "bg-amber-50 text-amber-600",
  surgery: "bg-red-50 text-red-600",
  vitals: "bg-emerald-50 text-emerald-600",
  prediction: "bg-[#F0F9FF] text-sky-600",
};

export default function HealthTimeline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLifestyle, setShowLifestyle] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-sky-100 rounded-lg" />
            <div className="h-4 w-96 bg-sky-100 rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-sky-100 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-sky-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto text-center py-16">
          <p className="text-red-600 text-lg">{error}</p>
          <button onClick={loadData} className="mt-4 px-5 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 font-semibold text-sm hover:bg-sky-50 transition-all">Retry</button>
        </div>
      </div>
    );
  }

  const { timeline, summary, medicalHistory, appointments } = data;

  const latestHistory = medicalHistory.length > 0
    ? medicalHistory.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b)
    : null;

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="hero-title text-3xl md:text-4xl">Health Timeline</h1>
          <p className="hero-subtitle mt-2 text-base">A comprehensive view of your healthcare journey - automatically populated from your clinical interactions.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <SummaryCard
            icon="monitor_heart"
            label="Active Conditions"
            value={summary.activeConditions.length > 0 ? summary.activeConditions.length : "None"}
            sub={summary.activeConditions.length > 0 ? summary.activeConditions.slice(0, 2).join(", ") : "No conditions recorded"}
            color="from-amber-500/20 to-amber-500/5 border-amber-200"
            iconColor="text-amber-600 bg-amber-100"
          />
          <SummaryCard
            icon="calendar_today"
            label="Last Appointment"
            value={summary.lastAppointment ? new Date(summary.lastAppointment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}
            sub={summary.lastAppointment ? summary.lastAppointment.doctor : "No visits yet"}
            color="from-cyan-500/20 to-cyan-500/5 border-cyan-200"
            iconColor="text-cyan-600 bg-cyan-100"
          />
          <SummaryCard
            icon="medication"
            label="Medications"
            value={summary.currentMedications ? "Recorded" : "None"}
            sub={summary.currentMedications ? "View in timeline" : "No medications"}
            color="from-emerald-500/20 to-emerald-500/5 border-emerald-200"
            iconColor="text-emerald-600 bg-emerald-100"
          />
          <SummaryCard
            icon="neurology"
            label="Risk Level"
            value={summary.riskLevel ? summary.riskLevel.level : "N/A"}
            sub={summary.riskLevel?.score != null ? `${summary.riskLevel.score}% confidence` : "No assessment"}
            color="from-sky-500/20 to-sky-500/5 border-sky-200"
            iconColor="text-sky-600 bg-sky-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Timeline */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="section-heading text-xl flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-white">timeline</span>
                </span>
                Activity Timeline
              </h2>
              <span className="text-xs text-slate-500 font-medium">{timeline.length} events</span>
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-16 bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30">
                <EmptyHealthRecords className="w-36 h-28 mx-auto mb-4 opacity-60" />
                <p className="text-muted text-base font-medium">No timeline events yet</p>
                <p className="card-description text-sm mt-1">Events will appear here as you interact with healthcare services.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((event) => (
                  <TimelineCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — Medical Profile */}
          <div className="space-y-6">
            {/* Current Conditions */}
            <SectionCard
              title="Current Conditions"
              icon="monitor_heart"
              iconColor="text-amber-600"
              empty="No conditions recorded"
            >
              {latestHistory?.chronic_diseases ? (
                <div className="flex flex-wrap gap-2">
                  {latestHistory.chronic_diseases.split(",").map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      {d.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No chronic conditions reported.</p>
              )}
            </SectionCard>

            {/* Past Conditions */}
            <SectionCard
              title="Past Conditions"
              icon="history"
              iconColor="text-cyan-600"
              empty="No past conditions"
            >
              {latestHistory?.past_illnesses ? (
                <div className="flex flex-wrap gap-2">
                  {latestHistory.past_illnesses.split(",").map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F9FF] text-cyan-600 text-xs font-semibold border border-cyan-200">
                      {d.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No past conditions reported.</p>
              )}
            </SectionCard>

            {/* Surgeries */}
            <SectionCard
              title="Surgeries"
              icon="surgical"
              iconColor="text-red-600"
              empty="No surgeries recorded"
            >
              {latestHistory?.surgeries ? (
                <p className="text-muted text-sm">{latestHistory.surgeries}</p>
              ) : (
                <p className="text-slate-500 text-sm">No surgeries recorded.</p>
              )}
            </SectionCard>

            {/* Family History */}
            <SectionCard
              title="Family History"
              icon="group"
              iconColor="text-emerald-600"
              empty="No family history"
            >
              <p className="text-muted text-sm">{latestHistory?.family_history || "No family history recorded."}</p>
            </SectionCard>

            {/* Lifestyle + Edit Button */}
            <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-lg shadow-blue-200/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg">favorite</span>
                  Lifestyle Factors
                </h3>
                <button
                  onClick={() => setShowLifestyle(true)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  Edit
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs font-medium uppercase tracking-wider">Smoking</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    latestHistory?.smoking_status === "non-smoker" || !latestHistory?.smoking_status
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {latestHistory?.smoking_status || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs font-medium uppercase tracking-wider">Alcohol</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    latestHistory?.alcohol_status === "non-drinker" || !latestHistory?.alcohol_status
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {latestHistory?.alcohol_status || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs font-medium uppercase tracking-wider">Allergies</span>
                  <span className="text-xs font-semibold text-muted">
                    {latestHistory?.notes || "None recorded"}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Notes Summary */}
            <SectionCard
              title="Recent Doctor Notes"
              icon="clinical_notes"
              iconColor="text-sky-600"
              empty="No clinical notes available"
            >
              <p className="card-description text-sm">Clinical notes from your doctor visits will be displayed here once available from completed appointments.</p>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Lifestyle Edit Modal */}
      {showLifestyle && (
        <LifestyleModal
          history={latestHistory}
          onClose={() => setShowLifestyle(false)}
          onSaved={() => { setShowLifestyle(false); loadData(); }}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, color, iconColor }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${color} shadow-lg shadow-blue-200/30`}>
      <div className="relative z-10">
        <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center mb-3`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <p className="text-muted text-[10px] font-semibold uppercase tracking-widest mb-0.5">{label}</p>
        <p className="card-title text-2xl">{value}</p>
        <p className="text-muted text-xs mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, iconColor, children, empty }) {
  return (
    <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-lg shadow-blue-200/30">
      <h3 className="card-title text-sm flex items-center gap-2 mb-4">
        <span className={`material-symbols-outlined text-lg ${iconColor}`}>{icon}</span>
        {title}
      </h3>
      {children || <p className="card-description text-sm">{empty}</p>}
    </div>
  );
}

function TimelineCard({ event }) {
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = event.raw?.start_time?.slice(0, 5) || "";
  const icon = TYPE_ICONS[event.type] || "circle";
  const borderColor = TYPE_COLORS[event.type] || "border-l-gray-500 bg-gray-500/5";
  const badgeColor = TYPE_BADGES[event.type] || "bg-gray-500/20 text-gray-400";
  const typeLabel = event.type.charAt(0).toUpperCase() + event.type.slice(1);

  return (
    <div className={`relative pl-6 border-l-2 ${borderColor} rounded-r-2xl p-5 transition-all duration-200 hover:bg-sky-50`}>
      <div className="absolute -left-3 top-5 w-6 h-6 rounded-full bg-white border-2 border-sky-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-[12px] text-slate-400">{icon}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
              {typeLabel}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{dateStr}{timeStr ? ` at ${timeStr}` : ""}</span>
          </div>
          <p className="text-sm font-bold surface-light-title mt-1">{event.title}</p>
          <p className="text-xs text-muted mt-0.5">{event.subtitle}</p>
          {event.doctor && event.doctor !== "Self-reported" && event.doctor !== "AI Model" && (
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">stethoscope</span>
              {event.doctor}
            </p>
          )}
          {event.details && (
            <p className="text-[11px] text-slate-500 mt-1">{event.details}</p>
          )}
        </div>
        {event.status === "completed" && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0 self-start">
            Completed
          </span>
        )}
        {event.status === "booked" && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-[#F0F9FF] px-2.5 py-1 rounded-full shrink-0 self-start">
            Upcoming
          </span>
        )}
        {event.status === "cancelled" && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full shrink-0 self-start">
            Cancelled
          </span>
        )}
      </div>
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
      <div className="bg-white border border-sky-100 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-title text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">favorite</span>
            Lifestyle & Family History
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5 block">Smoking Status</label>
            <select name="smoking_status" value={form.smoking_status} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 text-sm outline-none focus:border-sky-500 transition-colors">
              <option value="">Not set</option>
              <option value="non-smoker">Non-smoker</option>
              <option value="former smoker">Former smoker</option>
              <option value="current smoker">Current smoker</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5 block">Alcohol Consumption</label>
            <select name="alcohol_status" value={form.alcohol_status} onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 text-sm outline-none focus:border-sky-500 transition-colors">
              <option value="">Not set</option>
              <option value="non-drinker">Non-drinker</option>
              <option value="occasional">Occasional</option>
              <option value="regular">Regular</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5 block">Family History</label>
            <input name="family_history" value={form.family_history} onChange={handleChange}
              placeholder="e.g. Diabetes, Hypertension (parent, sibling)"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 text-sm outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5 block">Allergies / Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="e.g. Allergic to penicillin, sulfa drugs"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 text-sm outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400 resize-none" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-sky-100 text-slate-500 font-semibold text-sm bg-white hover:bg-sky-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

