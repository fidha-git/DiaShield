import React, { useEffect, useState } from "react";
import {
  getMedicalHistory,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../services/medicalHistoryService";
import API from "../services/api";
import { EmptyHealthRecords } from "../components/Illustrations";

export default function MedicalHistory() {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    chronic_diseases: "",
    past_illnesses: "",
    surgeries: "",
    family_history: "",
    smoking_status: "",
    alcohol_status: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState(null);

  // Get patientId from profile API
  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const res = await API.get("/patient/me");
        setPatientId(res.data.id);
      } catch (e) {
        setError("Failed to load patient info");
      }
    };
    fetchPatientId();
  }, []);

  // Fetch medical history
  const fetchHistory = async () => {
    if (!patientId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMedicalHistory(patientId);
      setHistoryRecords(data);
    } catch (err) {
      setError("Failed to load medical history");
      setHistoryRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchHistory();
    // eslint-disable-next-line
  }, [patientId]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Add or update record
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        await updateMedicalHistory(editingId, form);
        setSuccess("Medical history updated successfully");
      } else {
        await createMedicalHistory(form);
        setSuccess("Medical history added successfully");
      }
      setShowForm(false);
      setForm({
        chronic_diseases: "",
        past_illnesses: "",
        surgeries: "",
        family_history: "",
        smoking_status: "",
        alcohol_status: "",
        notes: "",
      });
      setEditingId(null);
      fetchHistory();
    } catch (err) {
      setError("Failed to save record");
    }
  };

  // Edit record
  const handleEdit = (rec) => {
    setForm({
      chronic_diseases: rec.chronic_diseases || "",
      past_illnesses: rec.past_illnesses || "",
      surgeries: rec.surgeries || "",
      family_history: rec.family_history || "",
      smoking_status: rec.smoking_status || "",
      alcohol_status: rec.alcohol_status || "",
      notes: rec.notes || "",
    });
    setEditingId(rec.id);
    setShowForm(true);
  };

  // Delete record
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      await deleteMedicalHistory(id);
      setSuccess("Medical history deleted successfully");
      fetchHistory();
    } catch (err) {
      setError("Failed to delete record");
    }
  };

  // UI
  return (
    <div className="space-y-6">
      <div className="max-w-container-max mx-auto">
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Medical History</h2>
          <p className="font-body-md text-on-surface-variant mt-1">A chronologically verified summary of chronic diagnoses, surgeries, and family medical background.</p>
        </header>

        <div className="mb-4 flex gap-2">
          <button
            className="btn-glass px-4 py-2 rounded text-white bg-secondary hover:bg-secondary/80"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm({
                chronic_diseases: "",
                past_illnesses: "",
                surgeries: "",
                family_history: "",
                smoking_status: "",
                alcohol_status: "",
                notes: "",
              });
            }}
          >
            Add Medical History
          </button>
        </div>

        {loading && <div className="text-on-surface-variant">Loading medical history...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-500 mb-2">{success}</div>}

        {/* Medical History List */}
        <div className="space-y-4">
          {!loading && historyRecords.length === 0 && (
            <div className="text-center py-16">
              <EmptyHealthRecords className="w-36 h-28 mx-auto mb-4 opacity-60" />
              <p className="text-on-surface-variant font-medium">No medical history records available</p>
              <p className="text-on-surface-variant/60 text-sm mt-1">Add your first medical history record to get started.</p>
            </div>
          )}
          {historyRecords.map((rec) => (
            <div key={rec.id} className="glass-card rounded-xl p-unit-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-headline-md text-white text-[16px] font-bold">{rec.chronic_diseases || "-"}</span>
                  <span className="font-label-md text-[10px] bg-white/5 border border-white/10 text-on-surface-variant px-2 py-0.5 rounded-full">ID: {rec.id}</span>
                </div>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Past Illnesses: <span className="text-white font-medium">{rec.past_illnesses || "-"}</span></p>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Surgeries: <span className="text-white font-medium">{rec.surgeries || "-"}</span></p>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Family History: <span className="text-white font-medium">{rec.family_history || "-"}</span></p>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Smoking Status: <span className="text-white font-medium">{rec.smoking_status || "-"}</span></p>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Alcohol Status: <span className="text-white font-medium">{rec.alcohol_status || "-"}</span></p>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Notes: <span className="text-white font-medium">{rec.notes || "-"}</span></p>
                <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Created: <span className="text-white font-medium">{new Date(rec.created_at).toLocaleString()}</span></p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 mt-2 md:mt-0">
                <button
                  className="btn-glass px-3 py-1 rounded text-white bg-tertiary hover:bg-tertiary/80"
                  onClick={() => handleEdit(rec)}
                >
                  Edit
                </button>
                <button
                  className="btn-glass px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(rec.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-unit-6 mt-6 space-y-4">
            <h3 className="font-headline-md text-[18px] text-white font-semibold mb-2">{editingId ? "Edit Medical History" : "Add Medical History"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Chronic Diseases</label>
                <input
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="chronic_diseases"
                  value={form.chronic_diseases}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Past Illnesses</label>
                <input
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="past_illnesses"
                  value={form.past_illnesses}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Surgeries</label>
                <input
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="surgeries"
                  value={form.surgeries}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Family History</label>
                <input
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="family_history"
                  value={form.family_history}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Smoking Status</label>
                <input
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="smoking_status"
                  value={form.smoking_status}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Alcohol Status</label>
                <input
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="alcohol_status"
                  value={form.alcohol_status}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Notes</label>
                <textarea
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="btn-glass px-4 py-2 rounded text-white bg-secondary hover:bg-secondary/80"
              >
                {editingId ? "Update" : "Add"}
              </button>
              <button
                type="button"
                 className="btn-glass px-4 py-2 rounded text-white bg-gray-500 dark:bg-gray-700 hover:bg-gray-600"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({
                    chronic_diseases: "",
                    past_illnesses: "",
                    surgeries: "",
                    family_history: "",
                    smoking_status: "",
                    alcohol_status: "",
                    notes: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

