import React, { useEffect, useState, useCallback } from "react";
import {
  getMyDoctorProfile,
  getDoctorAppointments,
  getClinicalNote,
  addClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
} from "../services/doctorService";
import { getErrorMessage } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600";
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} shadow-2xl animate-slide-down`}>
      <span className="material-symbols-outlined text-lg">{type === "success" ? "check_circle" : "error"}</span>
      <span className="font-label-md">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-lg">close</span></button>
    </div>
  );
}

export default function DoctorClinicalNotes() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [noteModal, setNoteModal] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profRes = await getMyDoctorProfile();
      const prof = profRes.data;
      setProfile(prof);

      const aptRes = await getDoctorAppointments(prof.id, { limit: 100 });
      const allApts = aptRes.data?.appointments || [];
      setAppointments(allApts);

      const notesMap = {};
      for (const apt of allApts) {
        try {
          const noteRes = await getClinicalNote(apt.id);
          notesMap[apt.id] = noteRes.data;
        } catch {
          // no note exists for this appointment
        }
      }
      setNotes(notesMap);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const completedAppts = appointments.filter((a) => a.status === "completed");

  const handleSave = async (appointmentId, data) => {
    try {
      if (notes[appointmentId]) {
        await updateClinicalNote(appointmentId, data);
        setToast({ message: "Clinical note updated", type: "success" });
      } else {
        await addClinicalNote(appointmentId, data);
        setToast({ message: "Clinical note created", type: "success" });
      }
      loadData();
      setNoteModal(null);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      await deleteClinicalNote(appointmentId);
      setToast({ message: "Clinical note deleted", type: "success" });
      loadData();
      setNoteModal(null);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const existingNoteAppts = appointments.filter((a) => notes[a.id]);
  const noNoteAppts = completedAppts.filter((a) => !notes[a.id]);

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Doctor Portal
          </div>
          <h1 className="text-3xl md:text-[42px] font-bold tracking-tight leading-tight">
            <span className="text-gradient">Clinical Notes</span>
          </h1>
          <p className="text-slate-400 mt-2 text-base">Create and manage patient clinical notes.</p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 p-6 animate-pulse">
                <div className="h-4 w-48 rounded bg-sky-100 mb-4" />
                <div className="h-3 w-full rounded bg-sky-50 mb-2" />
                <div className="h-3 w-3/4 rounded bg-sky-50" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">note_add</span>
                Completed Appointments (No Note)
              </h3>
              {noNoteAppts.length === 0 ? (
                <p className="text-slate-500 font-body-md py-8 text-center">All done! No pending notes.</p>
              ) : (
                <div className="space-y-3">
                  {noNoteAppts.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-sky-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{apt.patient_name || `Appointment #${apt.id}`}</p>
                        <p className="text-xs text-slate-500">{formatDate(apt.date)}</p>
                      </div>
                      <button onClick={() => setNoteModal({ appointment: apt, existing: null })}
                        className="px-3 py-1.5 rounded-lg bg-sky-100 text-sky-600 text-xs font-semibold hover:bg-sky-200 transition-colors">
                        Add Note
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-500">description</span>
                Existing Notes
              </h3>
              {existingNoteAppts.length === 0 ? (
                <p className="text-slate-500 font-body-md py-8 text-center">No notes created yet.</p>
              ) : (
                <div className="space-y-3">
                  {existingNoteAppts.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-sky-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{apt.patient_name || `Appointment #${apt.id}`}</p>
                        <p className="text-xs text-slate-500">{formatDate(apt.date)}</p>
                      </div>
                      <button onClick={() => setNoteModal({ appointment: apt, existing: notes[apt.id] })}
                        className="px-3 py-1.5 rounded-lg bg-sky-100 text-sky-600 text-xs font-semibold hover:bg-sky-200 transition-colors">
                        View / Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {noteModal && (
          <NoteFormModal
            appointment={noteModal.appointment}
            existing={noteModal.existing}
            onClose={() => setNoteModal(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

function NoteFormModal({ appointment, existing, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    diagnosis: existing?.diagnosis || "",
    notes: existing?.notes || "",
    medicines: existing?.medicines || "",
    advice: existing?.advice || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(appointment.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 p-6 w-full max-w-lg animate-scale-in overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500">description</span>
            {existing ? "Edit Clinical Note" : "Add Clinical Note"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Appointment #{appointment.id} — {formatDate(appointment.date)}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Diagnosis" id="diagnosis" name="diagnosis" required value={form.diagnosis} onChange={handleChange} />
          <Field label="Clinical Notes" id="notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} />
          <Field label="Medicines" id="medicines" name="medicines" type="textarea" value={form.medicines} onChange={handleChange} />
          <Field label="Recommendations / Advice" id="advice" name="advice" type="textarea" value={form.advice} onChange={handleChange} />
          <div className="flex justify-between gap-3 mt-4">
            <div>
              {existing && (
                <button type="button" onClick={() => onDelete(appointment.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
                  Delete Note
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg border border-sky-100 text-slate-500 text-xs font-semibold hover:bg-sky-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? "Saving..." : existing ? "Update Note" : "Create Note"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, id, type, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-slate-500">{label}</label>
      {type === "textarea" ? (
        <textarea id={id} rows={3} {...props}
          className="px-3 py-2 rounded-lg bg-sky-50 border border-sky-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400/50 text-sm resize-none" />
      ) : (
        <input id={id} {...props}
          className="px-3 py-2 rounded-lg bg-sky-50 border border-sky-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400/50 text-sm" />
      )}
    </div>
  );
}

