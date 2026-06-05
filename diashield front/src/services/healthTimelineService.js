import api from "./api";
import { formatRisk } from "../utils/formatRisk";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchHealthTimeline() {
  const headers = getAuthHeaders();

  const [apptsRes, medHistRes, healthRecRes, predHistRes, patientRes] = await Promise.all([
    api.get("/appointments/my-appointments?limit=100", { headers }),
    api.get("/patient/me", { headers }).catch(() => ({ data: null })),
    null, null, null
  ]);

  let patientId = patientRes?.data?.id;
  if (!patientId) {
    try {
      const profileRes = await api.get("/user/profile", { headers });
      patientId = profileRes?.data?.id;
    } catch {}
  }

  const [medHistPromise, healthRecPromise, predHistPromise] = patientId
    ? [
        api.get(`/medical-history/${patientId}`, { headers }).catch(() => ({ data: [] })),
        api.get(`/health-record/${patientId}`, { headers }).catch(() => ({ data: [] })),
        api.get("/prediction-history/", { headers }).catch(() => ({ data: [] })),
      ]
    : [Promise.resolve({ data: [] }), Promise.resolve({ data: [] }), Promise.resolve({ data: [] })];

  const [medHistRes2, healthRecRes2, predHistRes2] = await Promise.all([medHistPromise, healthRecPromise, predHistPromise]);

  const appointments = Array.isArray(apptsRes.data?.appointments) ? apptsRes.data.appointments : [];
  const medicalHistory = Array.isArray(medHistRes2.data) ? medHistRes2.data : [];
  const healthRecords = Array.isArray(healthRecRes2.data) ? healthRecRes2.data : [];
  const predictions = Array.isArray(predHistRes2.data) ? predHistRes2.data : [];

  const timeline = buildTimeline(appointments, medicalHistory, healthRecords, predictions);
  const summary = buildSummary(appointments, medicalHistory, healthRecords, predictions);

  return { timeline, summary, medicalHistory, appointments, healthRecords, predictions };
}

function buildTimeline(appointments, medicalHistory, healthRecords, predictions) {
  const events = [];

  appointments.forEach(apt => {
    const date = apt.date || apt.created_at;
    events.push({
      id: `apt-${apt.id}`,
      date,
      type: "appointment",
      title: `${apt.status === "completed" ? "Visit" : "Scheduled"} — ${apt.doctor_name || "Doctor"}`,
      subtitle: apt.status === "completed" ? "Completed" : apt.status === "cancelled" ? "Cancelled" : "Upcoming",
      doctor: apt.doctor_name || "Doctor",
      status: apt.status,
      details: `${apt.start_time?.slice(0, 5)} - ${apt.end_time?.slice(0, 5)}`,
      raw: apt,
    });
  });

  medicalHistory.forEach(rec => {
    const date = rec.created_at;
    if (rec.chronic_diseases) {
      events.push({
        id: `mh-chronic-${rec.id}`,
        date,
        type: "condition",
        title: "Chronic Condition Recorded",
        subtitle: rec.chronic_diseases,
        doctor: "Self-reported",
        details: "",
        raw: rec,
      });
    }
    if (rec.past_illnesses) {
      events.push({
        id: `mh-past-${rec.id}`,
        date,
        type: "condition",
        title: "Past Illness Recorded",
        subtitle: rec.past_illnesses,
        doctor: "Self-reported",
        details: "",
        raw: rec,
      });
    }
    if (rec.surgeries) {
      events.push({
        id: `mh-surgery-${rec.id}`,
        date,
        type: "surgery",
        title: "Surgery Recorded",
        subtitle: rec.surgeries,
        doctor: "Self-reported",
        details: "",
        raw: rec,
      });
    }
  });

  healthRecords.forEach(rec => {
    const date = rec.recorded_at || rec.created_at;
    events.push({
      id: `hr-${rec.id}`,
      date,
      type: "vitals",
      title: "Health Vitals Recorded",
      subtitle: `Blood Sugar: ${rec.blood_sugar || "-"} | BP: ${rec.blood_pressure || "-"} | HR: ${rec.heart_rate || "-"}`,
      doctor: "Self-reported",
      details: `BMI: ${rec.bmi || "-"} | Weight: ${rec.weight || "-"}`,
      raw: rec,
    });
  });

  predictions.forEach(pred => {
    const date = pred.created_at;
    events.push({
      id: `pred-${pred.id}`,
      date,
      type: "prediction",
      title: `AI Risk Assessment — ${pred.risk_level || "N/A"}`,
      subtitle: `Result: ${pred.prediction_result || "N/A"}`,
      doctor: "AI Model",
      details: `Confidence: ${pred.probability ? formatRisk(pred.probability) : "N/A"}`,
      raw: pred,
    });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events;
}

function buildSummary(appointments, medicalHistory, healthRecords, predictions) {
  const completed = appointments.filter(a => a.status === "completed");
  const lastAppt = completed.length > 0
    ? completed.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  const chronicDiseaseEntries = medicalHistory.filter(r => r.chronic_diseases);
  const activeConditions = chronicDiseaseEntries.length > 0
    ? chronicDiseaseEntries[chronicDiseaseEntries.length - 1].chronic_diseases
    : null;

  const medications = medicalHistory.filter(r => r.notes).map(r => r.notes).join("; ") || null;

  const latestPred = predictions.length > 0
    ? predictions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null;

  return {
    activeConditions: activeConditions ? activeConditions.split(",").map(s => s.trim()).filter(Boolean) : [],
    lastAppointment: lastAppt ? { date: lastAppt.date, doctor: lastAppt.doctor_name } : null,
    currentMedications: medications,
    riskLevel: latestPred
      ? {
          level: latestPred.risk_level || "Unknown",
          score: latestPred.probability ? Math.round(latestPred.probability * 100) : null,
        }
      : null,
  };
}

export async function updateLifestyleFields(historyId, data) {
  const headers = getAuthHeaders();
  const response = await api.put(`/medical-history/update/${historyId}`, data, { headers });
  return response.data;
}

export async function createMedicalHistoryRecord(data) {
  const headers = getAuthHeaders();
  const response = await api.post("/medical-history/create", data, { headers });
  return response.data;
}
