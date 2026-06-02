import React, { useEffect, useState, useCallback } from "react";
import {
  getMyDoctorProfile,
  getDoctorAppointments,
  completeAppointment,
  addClinicalNote,
  getPrescription,
  addPrescription,
  updatePrescription,
  deletePrescription,
} from "../services/doctorService";
import { getErrorMessage } from "../services/api";

const STATUS_COLORS = {
  booked: "text-green-400 bg-green-500/20",
  completed: "text-blue-400 bg-blue-500/20",
  cancelled: "text-red-400 bg-red-500/20",
};

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

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-white/5 animate-pulse">
      {[1,2,3,4,5].map((j) => (
        <td key={j} className="p-4"><div className="h-4 rounded bg-white/10" style={{ width: `${60 + j * 10}px` }} /></td>
      ))}
    </tr>
  ));
}

export default function DoctorAppointments() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [selectedApt, setSelectedApt] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [createPrescModal, setCreatePrescModal] = useState(null);
  const [viewPrescModal, setViewPrescModal] = useState(null);
  const [editPrescModal, setEditPrescModal] = useState(null);
  const [deletePrescTarget, setDeletePrescTarget] = useState(null);

  const loadPrescriptionsForApts = useCallback(async (apts) => {
    const map = {};
    const completed = apts.filter((a) => a.status === "completed");
    if (completed.length === 0) { setPrescriptions({}); return; }
    await Promise.all(completed.map(async (apt) => {
      try {
        const res = await getPrescription(apt.id);
        map[apt.id] = res.data;
      } catch {
        // no prescription
      }
    }));
    setPrescriptions(map);
  }, []);

  const loadAppointments = useCallback(async (docId, pg, sts) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (sts && sts !== "all") params.status = sts;
      const res = await getDoctorAppointments(docId, params);
      const apts = res.data?.appointments || [];
      setAppointments(apts);
      setTotalPages(res.data?.total_pages || 1);
      await loadPrescriptionsForApts(apts);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  }, [loadPrescriptionsForApts]);

  useEffect(() => {
    getMyDoctorProfile().then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile) return;
    loadAppointments(profile.id, page, statusFilter);
  }, [profile, page, statusFilter, loadAppointments]);

  const handleStatusFilter = (s) => { setStatusFilter(s); setPage(1); };

  const handleComplete = async (id) => {
    try {
      await completeAppointment(id);
      setToast({ message: "Appointment marked as completed", type: "success" });
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleAddNote = async (appointmentId, data) => {
    try {
      await addClinicalNote(appointmentId, data);
      setToast({ message: "Clinical note created", type: "success" });
      setNoteModal(null);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleCreatePrescription = async (appointmentId, data) => {
    try {
      await addPrescription(appointmentId, data);
      setToast({ message: "Prescription created", type: "success" });
      setCreatePrescModal(null);
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleEditPrescription = async (appointmentId, data) => {
    try {
      await updatePrescription(appointmentId, data);
      setToast({ message: "Prescription updated", type: "success" });
      setEditPrescModal(null);
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleDeletePrescription = async () => {
    if (!deletePrescTarget) return;
    try {
      await deletePrescription(deletePrescTarget.appointment_id);
      setToast({ message: "Prescription deleted", type: "success" });
      setDeletePrescTarget(null);
      loadAppointments(profile.id, page, statusFilter);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const normalizedSearch = search.toLowerCase().trim();
  const filtered = normalizedSearch
    ? appointments.filter((a) =>
        (a.doctor_name || "").toLowerCase().includes(normalizedSearch)
      )
    : appointments;

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">My Appointments</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage your patient appointments.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" placeholder="Search by patient name..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-cyan-400/50" />
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: "all" },
              { label: "Booked", value: "booked" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ].map((t) => (
              <button key={t.value} onClick={() => handleStatusFilter(t.value)}
                className={`px-4 py-2 rounded-lg font-label-md text-[11px] transition-colors ${
                  statusFilter === t.value
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-white/5 text-on-surface-variant border border-white/10 hover:bg-white/10"
                }`}>{t.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full"><tbody>{SkeletonRows()}</tbody></table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">calendar_today</span>
            <span className="font-headline-md text-on-surface-variant">No appointments found</span>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Patient</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Date</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Time</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Status</th>
                    <th className="text-right p-4 font-label-md text-on-surface-variant text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apt) => {
                    const hasPresc = !!prescriptions[apt.id];
                    const presc = prescriptions[apt.id];
                    return (
                      <tr key={apt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-cyan-400 text-sm">person</span>
                            </div>
                            <span className="font-body-md text-on-surface">{apt.doctor_name || `Patient #${apt.id}`}</span>
                          </div>
                        </td>
                        <td className="p-4 font-body-md text-on-surface">
                          {new Date(apt.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-body-md text-on-surface">
                          {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-label-md ${STATUS_COLORS[apt.status] || "text-gray-400 bg-gray-500/20"}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <ActionBtn icon="visibility" tip="View Details" onClick={() => setSelectedApt(apt)} />
                            {apt.status === "booked" && (
                              <ActionBtn icon="check_circle" tip="Mark Completed" onClick={() => handleComplete(apt.id)} className="text-green-400 hover:bg-green-500/20" />
                            )}
                            {(apt.status === "booked" || apt.status === "completed") && (
                              <ActionBtn icon="description" tip="Add Clinical Note" onClick={() => setNoteModal(apt)} className="text-purple-400 hover:bg-purple-500/20" />
                            )}
                            {apt.status === "completed" && !hasPresc && (
                              <ActionBtn icon="medication" tip="Create Prescription" onClick={() => setCreatePrescModal(apt)} className="text-amber-400 hover:bg-amber-500/20" />
                            )}
                            {apt.status === "completed" && hasPresc && (
                              <>
                                <ActionBtn icon="visibility" tip="View Prescription" onClick={() => setViewPrescModal({ prescription: presc, appointment: apt })} className="text-blue-400 hover:bg-blue-500/20" />
                                <ActionBtn icon="edit" tip="Edit Prescription" onClick={() => setEditPrescModal({ prescription: presc, appointment: apt })} className="text-purple-400 hover:bg-purple-500/20" />
                                <ActionBtn icon="delete" tip="Delete Prescription" onClick={() => setDeletePrescTarget({ prescription: presc, appointment: apt })} className="text-red-400 hover:bg-red-500/20" />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <span className="font-body-sm text-on-surface-variant">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-on-surface font-label-md text-[11px] disabled:opacity-30 hover:bg-white/10">Previous</button>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-on-surface font-label-md text-[11px] disabled:opacity-30 hover:bg-white/10">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedApt && (
          <AppointmentDetailsModal appointment={selectedApt} onClose={() => setSelectedApt(null)} />
        )}

        {noteModal && (
          <QuickNoteModal appointment={noteModal} onClose={() => setNoteModal(null)} onSave={handleAddNote} />
        )}

        {createPrescModal && (
          <QuickCreatePrescriptionModal appointment={createPrescModal} onClose={() => setCreatePrescModal(null)} onSave={handleCreatePrescription} />
        )}

        {viewPrescModal && (
          <ViewPrescriptionModal
            prescription={viewPrescModal.prescription}
            appointment={viewPrescModal.appointment}
            onClose={() => setViewPrescModal(null)}
          />
        )}

        {editPrescModal && (
          <QuickEditPrescriptionModal
            prescription={editPrescModal.prescription}
            appointment={editPrescModal.appointment}
            onClose={() => setEditPrescModal(null)}
            onSave={handleEditPrescription}
          />
        )}

        {deletePrescTarget && (
          <ConfirmDeletePrescriptionModal
            prescription={deletePrescTarget.prescription}
            appointment={deletePrescTarget.appointment}
            onClose={() => setDeletePrescTarget(null)}
            onConfirm={handleDeletePrescription}
          />
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon, tip, onClick, className = "text-on-surface-variant hover:bg-white/10" }) {
  return (
    <button onClick={onClick} title={tip}
      className={`p-2 rounded-lg transition-colors ${className}`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </button>
  );
}

function AppointmentDetailsModal({ appointment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-md border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">calendar_today</span>
            Appointment Details
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white">person</span>
            </div>
            <div>
              <h4 className="font-headline-md text-on-surface">{appointment.doctor_name || `Appointment #${appointment.id}`}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-label-md ${STATUS_COLORS[appointment.status] || ""}`}>{appointment.status}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <DetailItem label="Date" value={new Date(appointment.date).toLocaleDateString()} />
            <DetailItem label="Time" value={`${appointment.start_time?.slice(0, 5)} - ${appointment.end_time?.slice(0, 5)}`} />
            <DetailItem label="Doctor ID" value={`#${appointment.doctor_id}`} />
            <DetailItem label="Slot ID" value={`#${appointment.slot_id}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="font-label-md text-on-surface-variant text-[11px] mb-0.5">{label}</p>
      <p className="font-body-md text-on-surface">{value}</p>
    </div>
  );
}

function QuickNoteModal({ appointment, onClose, onSave }) {
  const [form, setForm] = useState({ diagnosis: "", notes: "", advice: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(appointment.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-lg border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">description</span>
            Add Clinical Note
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="font-body-sm text-on-surface-variant mb-4">
          Appointment #{appointment.id} — {new Date(appointment.date).toLocaleDateString()}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Diagnosis" id="q-diagnosis" name="diagnosis" required value={form.diagnosis} onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))} />
          <Field label="Clinical Notes" id="q-notes" name="notes" type="textarea" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          <Field label="Recommendations" id="q-advice" name="advice" type="textarea" value={form.advice} onChange={(e) => setForm((p) => ({ ...p, advice: e.target.value }))} />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-label-md hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuickCreatePrescriptionModal({ appointment, onClose, onSave }) {
  const [form, setForm] = useState({ medicines: "", dosage: "", frequency: "", duration: "", instructions: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(appointment.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-lg border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">medication</span>
            Create Prescription
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="font-body-sm text-on-surface-variant mb-4">
          Appointment #{appointment.id} — {new Date(appointment.date).toLocaleDateString()} — {appointment.doctor_name}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Medicine Name" name="medicines" required value={form.medicines}
            onChange={(e) => setForm((p) => ({ ...p, medicines: e.target.value }))} placeholder="Metformin 500mg" />
          <Field label="Dosage" name="dosage" required value={form.dosage}
            onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))} placeholder="1 tablet" />
          <Field label="Frequency" name="frequency" value={form.frequency}
            onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} placeholder="Twice daily" />
          <Field label="Duration" name="duration" required value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} placeholder="30 days" />
          <Field label="Instructions" name="instructions" type="textarea" value={form.instructions}
            onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} placeholder="Take with meals..." />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white font-label-md hover:from-amber-500 hover:to-amber-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewPrescriptionModal({ prescription, appointment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-md border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">medication</span>
            Prescription Details
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white">prescriptions</span>
            </div>
            <div>
              <h4 className="font-headline-md text-on-surface">{appointment?.doctor_name || `Appointment #${prescription.appointment_id}`}</h4>
              <p className="font-body-sm text-on-surface-variant">
                {appointment ? new Date(appointment.date).toLocaleDateString() : ""}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <DetailItem label="Medicine" value={prescription.medicines} />
            <DetailItem label="Dosage" value={prescription.dosage} />
            {prescription.frequency && <DetailItem label="Frequency" value={prescription.frequency} />}
            <DetailItem label="Duration" value={prescription.duration} />
            {prescription.instructions && (
              <div className="col-span-2">
                <DetailItem label="Instructions" value={prescription.instructions} />
              </div>
            )}
            <DetailItem label="Created" value={new Date(prescription.created_at).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickEditPrescriptionModal({ prescription, appointment, onClose, onSave }) {
  const [form, setForm] = useState({
    medicines: prescription.medicines || "",
    dosage: prescription.dosage || "",
    frequency: prescription.frequency || "",
    duration: prescription.duration || "",
    instructions: prescription.instructions || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(prescription.appointment_id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-lg border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">edit</span>
            Edit Prescription
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="font-body-sm text-on-surface-variant mb-4">
          {appointment?.doctor_name || `Appointment #${prescription.appointment_id}`}
          {appointment && ` — ${new Date(appointment.date).toLocaleDateString()}`}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Medicine Name" name="medicines" required value={form.medicines}
            onChange={(e) => setForm((p) => ({ ...p, medicines: e.target.value }))} placeholder="Metformin 500mg" />
          <Field label="Dosage" name="dosage" required value={form.dosage}
            onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))} placeholder="1 tablet" />
          <Field label="Frequency" name="frequency" value={form.frequency}
            onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))} placeholder="Twice daily" />
          <Field label="Duration" name="duration" required value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} placeholder="30 days" />
          <Field label="Instructions" name="instructions" type="textarea" value={form.instructions}
            onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} placeholder="Take with meals..." />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-label-md hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Update Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeletePrescriptionModal({ prescription, appointment, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-sm border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-red-400">warning</span>
          </div>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface text-center mb-2">Delete Prescription</h3>
        <p className="font-body-md text-on-surface-variant text-center mb-6">
          Are you sure you want to delete the prescription for <span className="text-on-surface font-label-md">{appointment?.doctor_name || `Appointment #${prescription.appointment_id}`}</span>?
          <br />This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
          <button onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-red-500/20 text-red-400 font-label-md hover:bg-red-500/30 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, name, type, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id || name} className="font-label-md text-on-surface-variant text-[11px]">{label}</label>
      {type === "textarea" ? (
        <textarea id={id || name} name={name} rows={3} {...props}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-cyan-400/50 text-sm resize-none" />
      ) : (
        <input id={id || name} name={name} {...props}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-cyan-400/50 text-sm" />
      )}
    </div>
  );
}
