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

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-500/20 border-green-500/30 text-green-300" : "bg-red-500/20 border-red-500/30 text-red-300";
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
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Clinical Notes</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Create and manage patient clinical notes.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant font-headline-md">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-unit-6">
            <div className="glass-card rounded-xl p-unit-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">note_add</span>
                Completed Appointments (No Note)
              </h3>
              {noNoteAppts.length === 0 ? (
                <p className="text-on-surface-variant font-body-md py-8 text-center">All done! No pending notes.</p>
              ) : (
                <div className="space-y-3">
                  {noNoteAppts.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-label-md text-on-surface">{apt.doctor_name || `Appointment #${apt.id}`}</p>
                        <p className="font-body-sm text-on-surface-variant text-[11px]">{new Date(apt.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => setNoteModal({ appointment: apt, existing: null })}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-[11px] font-label-md hover:bg-cyan-500/30 transition-colors">
                        Add Note
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-unit-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">description</span>
                Existing Notes
              </h3>
              {existingNoteAppts.length === 0 ? (
                <p className="text-on-surface-variant font-body-md py-8 text-center">No notes created yet.</p>
              ) : (
                <div className="space-y-3">
                  {existingNoteAppts.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="font-label-md text-on-surface">{apt.doctor_name || `Appointment #${apt.id}`}</p>
                        <p className="font-body-sm text-on-surface-variant text-[11px]">{new Date(apt.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => setNoteModal({ appointment: apt, existing: notes[apt.id] })}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-[11px] font-label-md hover:bg-purple-500/30 transition-colors">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-lg border border-white/10 shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">description</span>
            {existing ? "Edit Clinical Note" : "Add Clinical Note"}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="font-body-sm text-on-surface-variant mb-4">
          Appointment #{appointment.id} — {new Date(appointment.date).toLocaleDateString()}
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
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-label-md hover:bg-red-500/30 transition-colors">
                  Delete Note
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center gap-2">
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
      <label htmlFor={id} className="font-label-md text-on-surface-variant text-[11px]">{label}</label>
      {type === "textarea" ? (
        <textarea id={id} rows={3} {...props}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-cyan-400/50 text-sm resize-none" />
      ) : (
        <input id={id} {...props}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-cyan-400/50 text-sm" />
      )}
    </div>
  );
}
