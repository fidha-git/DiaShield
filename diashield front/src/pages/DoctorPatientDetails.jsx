import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDoctorPatientProfile,
  getDoctorPatientHealthRecords,
  getDoctorPatientPredictions,
  getDoctorPatientMedicalHistory,
  getDoctorPatientClinicalNotes,
  getDoctorPatientPrescriptions,
} from "../services/doctorService";
import { getErrorMessage } from "../services/api";

const TABS = [
  { key: "profile", label: "Profile", icon: "person" },
  { key: "history", label: "Medical History", icon: "history" },
  { key: "records", label: "Records", icon: "monitor_heart" },
  { key: "predictions", label: "Predictions", icon: "query_stats" },
  { key: "notes", label: "Notes", icon: "description" },
  { key: "prescriptions", label: "Prescriptions", icon: "medication" },
];

const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500";
const VALUE_CLASS = "text-sm font-semibold text-slate-800 break-words";

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
      <p className={LABEL_CLASS}>{label}</p>
      <p className={`${VALUE_CLASS} mt-0.5`}>{value || "-"}</p>
    </div>
  );
}

function Shimmer({ className = "" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-md shadow-sky-100/50">
      {title && (
        <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 mb-4">
          {icon && <span className="material-symbols-outlined text-sky-600 text-[20px]">{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">{icon || "inbox"}</span>
      <p className="text-sm font-semibold text-slate-500">{title || "No data"}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function toastColor(type) {
  return type === "success"
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : "bg-rose-50 border-rose-200 text-rose-700";
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-4 sm:right-6 z-[120] rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl max-w-[90vw] animate-slide-down ${toastColor(type)}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">{type === "success" ? "check_circle" : "error"}</span>
        <p className="text-sm font-semibold">{message}</p>
        <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}

export default function DoctorPatientDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!userId) return;
    setProfileLoading(true);
    setProfileError(null);
    getDoctorPatientProfile(userId)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        const msg = getErrorMessage(err);
        setProfileError(msg);
        setToast({ message: msg, type: "error" });
      })
      .finally(() => setProfileLoading(false));
  }, [userId]);

  const loadTab = useCallback(async (tabKey) => {
    if (tabData[tabKey] || tabLoading[tabKey]) return;
    setTabLoading((p) => ({ ...p, [tabKey]: true }));
    setTabErrors((p) => ({ ...p, [tabKey]: null }));
    try {
      let res;
      switch (tabKey) {
        case "history":
          res = await getDoctorPatientMedicalHistory(userId);
          break;
        case "records":
          res = await getDoctorPatientHealthRecords(userId);
          break;
        case "predictions":
          res = await getDoctorPatientPredictions(userId);
          break;
        case "notes":
          res = await getDoctorPatientClinicalNotes(userId);
          break;
        case "prescriptions":
          res = await getDoctorPatientPrescriptions(userId);
          break;
        default:
          return;
      }
      setTabData((p) => ({ ...p, [tabKey]: res.data }));
    } catch (err) {
      const msg = getErrorMessage(err);
      setTabErrors((p) => ({ ...p, [tabKey]: msg }));
      setToast({ message: msg, type: "error" });
    } finally {
      setTabLoading((p) => ({ ...p, [tabKey]: false }));
    }
  }, [userId, tabData, tabLoading]);

  useEffect(() => {
    if (activeTab !== "profile") loadTab(activeTab);
  }, [activeTab, loadTab]);

  if (profileLoading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <Shimmer className="h-10 w-48" />
        <Shimmer className="h-6 w-72" />
        <div className="flex gap-3 mt-6">
          {TABS.map((t) => <Shimmer key={t.key} className="h-10 w-28" />)}
        </div>
        <Shimmer className="h-64 w-full" />
      </div>
    );
  }

  if (profileError && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-5xl text-rose-400">error</span>
        <h2 className="text-xl font-bold text-slate-900">Failed to load patient</h2>
        <p className="text-sm text-slate-500 max-w-md text-center">{profileError}</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const patientName = profile?.name || profile?.username || "Patient";
  const initials = (patientName || "").split(/\s+/).filter(Boolean).map((s) => s[0]).join("").toUpperCase().slice(0, 2) || "PT";

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Appointments
        </button>

        <div className="rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-xl shadow-sky-100/70 px-6 py-7 md:px-9 md:py-9">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-slate-900 tracking-tight">{patientName}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                {profile?.age && <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Age:</span> {profile.age}</p>}
                {profile?.gender && <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Gender:</span> {profile.gender}</p>}
                {profile?.blood_group && <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Blood:</span> {profile.blood_group}</p>}
                {profile?.phone && <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Phone:</span> {profile.phone}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl border border-b-0 transition-all ${
                activeTab === tab.key
                  ? "bg-white border-slate-200 text-sky-700 -mb-px shadow-sm"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div>
          {activeTab === "profile" && <ProfileTab profile={profile} />}
          {activeTab === "history" && (
            <TabContent
              loading={tabLoading.history}
              error={tabErrors.history}
              onRetry={() => loadTab("history")}
            >
              <MedicalHistoryTab data={tabData.history} />
            </TabContent>
          )}
          {activeTab === "records" && (
            <TabContent
              loading={tabLoading.records}
              error={tabErrors.records}
              onRetry={() => loadTab("records")}
            >
              <RecordsTab data={tabData.records} />
            </TabContent>
          )}
          {activeTab === "predictions" && (
            <TabContent
              loading={tabLoading.predictions}
              error={tabErrors.predictions}
              onRetry={() => loadTab("predictions")}
            >
              <PredictionsTab data={tabData.predictions} />
            </TabContent>
          )}
          {activeTab === "notes" && (
            <TabContent
              loading={tabLoading.notes}
              error={tabErrors.notes}
              onRetry={() => loadTab("notes")}
            >
              <NotesTab data={tabData.notes} />
            </TabContent>
          )}
          {activeTab === "prescriptions" && (
            <TabContent
              loading={tabLoading.prescriptions}
              error={tabErrors.prescriptions}
              onRetry={() => loadTab("prescriptions")}
            >
              <PrescriptionsTab data={tabData.prescriptions} />
            </TabContent>
          )}
        </div>
      </div>
    </div>
  );
}

function TabContent({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Shimmer key={i} className="h-24 w-full" />)}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <span className="material-symbols-outlined text-4xl text-rose-400">error</span>
        <p className="text-sm text-slate-600">{error}</p>
        <button onClick={onRetry} className="btn-outline text-xs">Retry</button>
      </div>
    );
  }
  return <>{children}</>;
}

function ProfileTab({ profile }) {
  if (!profile) return <EmptyState icon="person_off" title="No profile data" />;
  return (
    <div className="space-y-6">
      <SectionCard title="Personal Information" icon="badge">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <DetailRow label="Full Name" value={profile.name} />
          <DetailRow label="Username" value={profile.username} />
          <DetailRow label="Email" value={profile.email} />
          <DetailRow label="Age" value={profile.age ? `${profile.age} yrs` : "-"} />
          <DetailRow label="Gender" value={profile.gender} />
          <DetailRow label="Phone" value={profile.phone} />
          <DetailRow label="Blood Group" value={profile.blood_group} />
          <DetailRow label="Height" value={profile.height ? `${profile.height} cm` : "-"} />
          <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : "-"} />
          <div className="sm:col-span-2 lg:col-span-3">
            <DetailRow label="Address" value={profile.address} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Emergency Contact" icon="contact_emergency">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <DetailRow label="Contact Name" value={profile.emergency_contact_name} />
          <DetailRow label="Contact Phone" value={profile.emergency_contact_phone} />
          <DetailRow label="Relationship" value={profile.emergency_contact_relationship} />
        </div>
      </SectionCard>

      <SectionCard title="Insurance & Clinic" icon="account_balance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <DetailRow label="Insurance Provider" value={profile.insurance_provider} />
          <DetailRow label="Policy Number" value={profile.policy_number} />
          <DetailRow label="Primary Clinic" value={profile.primary_clinic} />
        </div>
      </SectionCard>
    </div>
  );
}

function MedicalHistoryTab({ data }) {
  if (!data || data.length === 0) return <EmptyState icon="history" title="No medical history recorded" subtitle="Medical history will appear once the patient adds it." />;
  return (
    <div className="space-y-4">
      {data.map((h) => (
        <SectionCard key={h.id} icon="history">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailRow label="Past Illnesses" value={h.past_illnesses || "-"} />
            <DetailRow label="Surgeries" value={h.surgeries || "-"} />
            <DetailRow label="Family History" value={h.family_history || "-"} />
            <DetailRow label="Chronic Diseases" value={h.chronic_diseases || "-"} />
            <DetailRow label="Smoking Status" value={h.smoking_status || "-"} />
            <DetailRow label="Alcohol Status" value={h.alcohol_status || "-"} />
            {h.notes && <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Notes" value={h.notes} /></div>}
            <div className="sm:col-span-2 lg:col-span-3">
              <DetailRow label="Recorded At" value={h.created_at ? new Date(h.created_at).toLocaleDateString() : "-"} />
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function RecordsTab({ data }) {
  if (!data || data.length === 0) return <EmptyState icon="monitor_heart" title="No health records found" subtitle="Health records will appear once recorded." />;
  return (
    <div className="space-y-4">
      {data.map((r) => (
        <SectionCard key={r.id} icon="monitor_heart">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <DetailRow label="Blood Sugar" value={r.blood_sugar} />
            <DetailRow label="Glucose Period" value={r.glucose_period || "-"} />
            <DetailRow label="Blood Pressure" value={r.blood_pressure} />
            <DetailRow label="Heart Rate" value={r.heart_rate} />
            <DetailRow label="BMI" value={r.bmi} />
            <DetailRow label="Weight" value={r.weight} />
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <DetailRow label="Notes" value={r.notes || "-"} />
            </div>
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <DetailRow label="Recorded At" value={r.recorded_at ? new Date(r.recorded_at).toLocaleString() : "-"} />
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function riskColor(level) {
  const s = (level || "").toLowerCase();
  if (s.includes("high")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (s.includes("moderate") || s.includes("medium")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("low")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function PredictionsTab({ data }) {
  if (!data || data.length === 0) return <EmptyState icon="query_stats" title="No predictions found" subtitle="Prediction history will appear once assessments are run." />;
  return (
    <div className="space-y-4">
      {data.map((p) => (
        <SectionCard key={p.id} icon="query_stats">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${p.prediction_result === "Positive" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              {p.prediction_result}
            </span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${riskColor(p.risk_level)}`}>
              Risk: {p.risk_level}
            </span>
            {p.probability != null && (
              <span className="text-sm font-semibold text-slate-600">
                Probability: {(p.probability * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DetailRow label="Glucose" value={p.glucose != null ? `${p.glucose} mg/dL` : "-"} />
            <DetailRow label="BMI" value={p.bmi != null ? `${p.bmi} kg/m²` : "-"} />
            <DetailRow label="Blood Pressure" value={p.blood_pressure != null ? `${p.blood_pressure} mm Hg` : "-"} />
            <DetailRow label="Age" value={p.age != null ? `${p.age} yrs` : "-"} />
            <DetailRow label="Pregnancies" value={p.pregnancies != null ? p.pregnancies : "-"} />
            <div className="col-span-2 sm:col-span-4">
              <DetailRow label="Created At" value={p.created_at ? new Date(p.created_at).toLocaleString() : "-"} />
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function NotesTab({ data }) {
  if (!data || data.length === 0) return <EmptyState icon="description" title="No clinical notes found" subtitle="Clinical notes will appear once the doctor adds them." />;
  return (
    <div className="space-y-4">
      {data.map((n) => (
        <SectionCard key={n.id} icon="description">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">Appointment #{n.appointment_id}</span>
            {n.created_at && (
              <span className="text-[11px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><DetailRow label="Diagnosis" value={n.diagnosis} /></div>
            {n.notes && <div className="sm:col-span-2"><DetailRow label="Notes" value={n.notes} /></div>}
            {n.medicines && <DetailRow label="Medicines" value={n.medicines} />}
            {n.advice && <div className="sm:col-span-2"><DetailRow label="Advice" value={n.advice} /></div>}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function PrescriptionsTab({ data }) {
  if (!data || data.length === 0) return <EmptyState icon="medication" title="No prescriptions found" subtitle="Prescriptions will appear once created." />;
  return (
    <div className="space-y-4">
      {data.map((p) => (
        <SectionCard key={p.id} icon="medication">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">Appointment #{p.appointment_id}</span>
            {p.created_at && (
              <span className="text-[11px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailRow label="Medicine" value={p.medicines} />
            <DetailRow label="Dosage" value={p.dosage} />
            <DetailRow label="Frequency" value={p.frequency || "-"} />
            <DetailRow label="Duration" value={p.duration} />
            {p.instructions && <div className="sm:col-span-2 lg:col-span-3"><DetailRow label="Instructions" value={p.instructions} /></div>}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
