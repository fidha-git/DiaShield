import api from "./api";
import { formatRisk } from "../utils/formatRisk";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchHealthTimeline() {
  const headers = getAuthHeaders();

  const [apptsRes, patientRes] = await Promise.all([
    api.get("/appointments/my-appointments?limit=100", { headers }),
    api.get("/patient/me", { headers }).catch(() => ({ data: null })),
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
  const healthSnapshot = buildHealthSnapshot(medicalHistory, healthRecords, predictions, appointments);
  const doctorNotes = extractDoctorNotes(appointments);

  return { timeline, summary, medicalHistory, appointments, healthRecords, predictions, healthSnapshot, doctorNotes };
}

function buildTimeline(appointments, medicalHistory, healthRecords, predictions) {
  const events = [];

  appointments.forEach(apt => {
    const date = apt.date || apt.created_at;
    const base = {
      id: `apt-${apt.id}`,
      date,
      category: "appointments",
      doctor: apt.doctor_name || "Healthcare Provider",
      status: apt.status,
      details: apt.start_time ? `${apt.start_time.slice(0, 5)} - ${apt.end_time?.slice(0, 5)}` : "",
      raw: apt,
    };

    if (apt.status === "completed") {
      events.push({
        ...base,
        type: "appointment_completed",
        title: "Appointment Completed",
        subtitle: `Visit with ${apt.doctor_name || "Healthcare Provider"}`,
        doctorNote: apt.doctor_note || null,
      });
    } else if (apt.status === "cancelled") {
      events.push({
        ...base,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        subtitle: `Cancelled — ${apt.doctor_name || "Healthcare Provider"}`,
      });
    } else {
      events.push({
        ...base,
        type: "appointment_scheduled",
        title: "Appointment Scheduled",
        subtitle: `Upcoming visit with ${apt.doctor_name || "Healthcare Provider"}`,
      });
    }
  });

  medicalHistory.forEach(rec => {
    const date = rec.created_at;
    if (rec.chronic_diseases) {
      const diseases = rec.chronic_diseases.split(",").map(s => s.trim()).filter(Boolean);
      events.push({
        id: `mh-diag-${rec.id}`,
        date,
        type: "diagnosis_added",
        category: "diagnoses",
        title: diseases.length > 1 ? "Diagnoses Added" : "Diagnosis Added",
        subtitle: diseases.join(", "),
        doctor: "Self-reported",
        details: "Recorded in medical history",
        raw: rec,
      });
    }
    if (rec.past_illnesses) {
      events.push({
        id: `mh-past-${rec.id}`,
        date,
        type: "diagnosis_added",
        category: "diagnoses",
        title: "Past Illness Recorded",
        subtitle: rec.past_illnesses,
        doctor: "Self-reported",
        details: "",
        raw: rec,
      });
    }
    if (rec.surgeries) {
      events.push({
        id: `mh-surg-${rec.id}`,
        date,
        type: "procedure_surgery",
        category: "procedures",
        title: "Procedure / Surgery",
        subtitle: rec.surgeries,
        doctor: "Self-reported",
        details: "Surgical procedure recorded in medical history",
        raw: rec,
      });
    }
    if (rec.notes && /(?:medication|prescription|drug|tablet|capsule|injection|insulin|metformin|atorvastatin|lisinopril)/i.test(rec.notes)) {
      events.push({
        id: `mh-med-${rec.id}`,
        date,
        type: "medication_prescribed",
        category: "medications",
        title: "Medication Recorded",
        subtitle: `Referenced in medical history notes`,
        doctor: "Self-reported",
        details: rec.notes,
        raw: rec,
      });
    }
  });

  healthRecords.forEach(rec => {
    const date = rec.recorded_at || rec.created_at;
    const vitals = [];
    if (rec.blood_sugar) vitals.push(`Glucose: ${rec.blood_sugar}${rec.glucose_period ? ` (${rec.glucose_period})` : ""}`);
    if (rec.blood_pressure) vitals.push(`BP: ${rec.blood_pressure}`);
    if (rec.heart_rate) vitals.push(`HR: ${rec.heart_rate} bpm`);
    if (rec.weight) vitals.push(`Weight: ${rec.weight}`);
    if (rec.bmi) vitals.push(`BMI: ${rec.bmi}`);

    events.push({
      id: `hr-${rec.id}`,
      date,
      type: "health_record_updated",
      category: "health_records",
      title: "Health Vitals Recorded",
      subtitle: vitals.slice(0, 3).join(" · "),
      doctor: "Self-reported",
      details: vitals.length > 3 ? vitals.slice(3).join(" · ") : "",
      expandedDetails: vitals.join("\n"),
      raw: rec,
    });

    if (rec.notes && /(?:medication|prescription|drug|tablet|capsule|injection|insulin|metformin|atorvastatin|lisinopril)/i.test(rec.notes)) {
      events.push({
        id: `hr-med-${rec.id}`,
        date,
        type: "medication_updated",
        category: "medications",
        title: "Medication Updated",
        subtitle: rec.notes,
        doctor: "Self-reported",
        details: "",
        raw: rec,
      });
    }
  });

  predictions.forEach(pred => {
    const date = pred.created_at;
    const probability = pred.probability ? Math.round(pred.probability * 100) : null;

    events.push({
      id: `pred-${pred.id}`,
      date,
      type: "risk_prediction",
      category: "predictions",
      title: "Diabetes Risk Assessment Generated",
      subtitle: `Risk Category: ${pred.risk_level || "N/A"}`,
      doctor: "AI Model — DiaShield",
      details: `Risk Score: ${probability || "N/A"}%`,
      riskScore: probability,
      riskLevel: pred.risk_level,
      expandedDetails: [
        `Prediction: ${pred.prediction_result || "N/A"}`,
        `Probability: ${pred.probability ? formatRisk(pred.probability) : "N/A"}`,
        `Generated: ${new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      ].join("\n"),
      raw: pred,
    });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events;
}

function buildSummary(appointments, medicalHistory, healthRecords, predictions) {
  const completedAppts = appointments.filter(a => a.status === "completed");
  const lastAppt = completedAppts.length > 0
    ? completedAppts.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  const latestHistory = medicalHistory.length > 0
    ? medicalHistory.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b)
    : null;

  const chronicDiseases = latestHistory?.chronic_diseases
    ? latestHistory.chronic_diseases.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const latestPred = predictions.length > 0
    ? predictions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null;

  const medsFromNotes = medicalHistory.filter(r => r.notes && /(?:medication|prescription|drug|tablet|capsule|injection|insulin)/i.test(r.notes)).map(r => r.notes);
  const medsFromRecords = healthRecords.filter(r => r.notes && /(?:medication|prescription|drug|tablet|capsule|injection|insulin)/i.test(r.notes)).map(r => r.notes);
  const allMeds = [...new Set([...medsFromNotes, ...medsFromRecords])].join("; ") || null;

  return {
    totalVisits: completedAppts.length,
    activeConditions: chronicDiseases,
    currentMedications: allMeds,
    latestRiskScore: latestPred ? {
      level: latestPred.risk_level || "Unknown",
      score: latestPred.probability ? Math.round(latestPred.probability * 100) : null,
    } : null,
    riskLevel: latestPred ? {
      level: latestPred.risk_level || "Unknown",
      score: latestPred.probability ? Math.round(latestPred.probability * 100) : null,
    } : null,
    healthRecordsCount: healthRecords.length,
    lastAppointment: lastAppt ? { date: lastAppt.date, doctor: lastAppt.doctor_name } : null,
  };
}

function buildHealthSnapshot(medicalHistory, healthRecords, predictions, appointments) {
  const latestHistory = medicalHistory.length > 0
    ? medicalHistory.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b)
    : null;

  const latestRecord = healthRecords.length > 0
    ? healthRecords.reduce((a, b) => new Date(b.recorded_at || b.created_at) > new Date(a.recorded_at || a.created_at) ? b : a)
    : null;

  const completedAppts = appointments.filter(a => a.status === "completed");
  const lastAppt = completedAppts.length > 0
    ? completedAppts.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  const chronicDiseases = latestHistory?.chronic_diseases
    ? latestHistory.chronic_diseases.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const medsFromNotes = medicalHistory.filter(r => r.notes && /(?:medication|prescription|drug|tablet|capsule|injection|insulin)/i.test(r.notes)).map(r => r.notes);
  const medsFromRecords = healthRecords.filter(r => r.notes && /(?:medication|prescription|drug|tablet|capsule|injection|insulin)/i.test(r.notes)).map(r => r.notes);
  const allMeds = [...new Set([...medsFromNotes, ...medsFromRecords])];

  return {
    bloodGroup: null,
    height: null,
    weight: latestRecord?.weight || null,
    bmi: latestRecord?.bmi || null,
    allergies: latestHistory?.notes?.includes("allerg") ? latestHistory.notes : null,
    familyHistory: latestHistory?.family_history || null,
    lifestyle: {
      smoking: latestHistory?.smoking_status || null,
      alcohol: latestHistory?.alcohol_status || null,
    },
    conditions: chronicDiseases,
    medications: allMeds,
    lastAppointment: lastAppt ? { date: lastAppt.date, doctor: lastAppt.doctor_name } : null,
  };
}

function extractDoctorNotes(appointments) {
  return appointments
    .filter(apt => apt.status === "completed" && apt.doctor_note)
    .map(apt => ({
      id: `note-${apt.id}`,
      doctor: apt.doctor_name || "Healthcare Provider",
      date: apt.date || apt.created_at,
      note: apt.doctor_note,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
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
