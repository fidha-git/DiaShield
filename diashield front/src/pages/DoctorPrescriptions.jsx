import React, { useEffect, useState, useCallback } from "react";
import {
  getMyDoctorProfile,
  getDoctorAppointments,
  getDoctorPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
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

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-white/5 animate-pulse">
      {[1,2,3,4,5,6].map((j) => (
        <td key={j} className="p-4"><div className="h-4 rounded bg-white/10" style={{ width: `${50 + j * 12}px` }} /></td>
      ))}
    </tr>
  ));
}

export default function DoctorPrescriptions() {
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointmentsMap, setAppointmentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [createModal, setCreateModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profRes = await getMyDoctorProfile();
      const prof = profRes.data;
      setProfile(prof);

      const prescRes = await getDoctorPrescriptions();
      const allPrescriptions = prescRes.data || [];

      const aptRes = await getDoctorAppointments(prof.id, { limit: 200 });
      const allApts = aptRes.data?.appointments || [];
      const aptMap = {};
      allApts.forEach((apt) => { aptMap[apt.id] = apt; });
      setAppointmentsMap(aptMap);

      setPrescriptions(allPrescriptions);
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getPatientName = (presc) => {
    const apt = appointmentsMap[presc.appointment_id];
    return apt?.doctor_name || `Appointment #${presc.appointment_id}`;
  };

  const filtered = search
    ? prescriptions.filter((p) =>
        getPatientName(p).toLowerCase().includes(search.toLowerCase())
      )
    : prescriptions;

  const handleCreate = async (appointmentId, data) => {
    try {
      await addPrescription(appointmentId, data);
      setToast({ message: "Prescription created", type: "success" });
      setCreateModal(null);
      loadData();
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleEdit = async (appointmentId, data) => {
    try {
      await updatePrescription(appointmentId, data);
      setToast({ message: "Prescription updated", type: "success" });
      setEditModal(null);
      loadData();
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePrescription(deleteTarget.appointment_id);
      setToast({ message: "Prescription deleted", type: "success" });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setToast({ message: getErrorMessage(err), type: "error" });
    }
  };

  const completedApts = appointmentsMap
    ? Object.values(appointmentsMap).filter((a) => a.status === "completed")
    : [];
  const noPrescApts = completedApts.filter(
    (a) => !prescriptions.some((p) => p.appointment_id === a.id)
  );

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Prescriptions</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage all prescriptions created during appointments.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input type="text" placeholder="Search by patient name..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-cyan-400/50" />
          {noPrescApts.length > 0 && (
            <button onClick={() => setCreateModal(true)}
              className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white font-label-md text-[11px] hover:from-amber-500 hover:to-amber-400 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              New Prescription
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full"><tbody>{SkeletonRows()}</tbody></table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">medication</span>
            <span className="font-headline-md text-on-surface-variant">
              {prescriptions.length === 0 ? "No prescriptions yet" : "No prescriptions match your search"}
            </span>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Patient</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Appointment Date</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Medicine</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Dosage</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Created</th>
                    <th className="text-right p-4 font-label-md text-on-surface-variant text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((presc) => {
                    const apt = appointmentsMap[presc.appointment_id];
                    return (
                      <tr key={presc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-amber-400 text-sm">person</span>
                            </div>
                            <span className="font-body-md text-on-surface">{getPatientName(presc)}</span>
                          </div>
                        </td>
                        <td className="p-4 font-body-md text-on-surface">
                          {apt ? new Date(apt.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-4 font-body-md text-on-surface">{presc.medicines}</td>
                        <td className="p-4 font-body-md text-on-surface">{presc.dosage}</td>
                        <td className="p-4 font-body-md text-on-surface">
                          {new Date(presc.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <ActionBtn icon="visibility" tip="View Details" onClick={() => setViewModal(presc)} />
                            <ActionBtn icon="edit" tip="Edit Prescription" onClick={() => setEditModal(presc)} className="text-purple-400 hover:bg-purple-500/20" />
                            <ActionBtn icon="delete" tip="Delete Prescription" onClick={() => setDeleteTarget(presc)} className="text-red-400 hover:bg-red-500/20" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {createModal && (
          <NewPrescriptionModal
            appointments={noPrescApts}
            onClose={() => setCreateModal(null)}
            onSave={handleCreate}
          />
        )}

        {viewModal && (
          <ViewPrescriptionModal
            prescription={viewModal}
            appointment={appointmentsMap[viewModal.appointment_id]}
            onClose={() => setViewModal(null)}
          />
        )}

        {editModal && (
          <EditPrescriptionModal
            prescription={editModal}
            appointment={appointmentsMap[editModal.appointment_id]}
            onClose={() => setEditModal(null)}
            onSave={handleEdit}
          />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            prescription={deleteTarget}
            patientName={getPatientName(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
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

function NewPrescriptionModal({ appointments, onClose, onSave }) {
  const [selectedApt, setSelectedApt] = useState(appointments[0]?.id || "");
  const [form, setForm] = useState({
    medicines: "", dosage: "", frequency: "", duration: "", instructions: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;
    setSaving(true);
    await onSave(selectedApt, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-lg border border-white/10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">medication</span>
            New Prescription
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface-variant text-[11px]">Appointment</label>
            <select value={selectedApt} onChange={(e) => setSelectedApt(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm">
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id} className="bg-[#020B2D] text-on-surface">
                  {apt.doctor_name || `Appointment #${apt.id}`} — {new Date(apt.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
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
            <button type="submit" disabled={saving || !selectedApt}
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

function EditPrescriptionModal({ prescription, appointment, onClose, onSave }) {
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
      <div className="glass-card rounded-xl p-6 w-full max-w-lg border border-white/10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
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

function ConfirmDeleteModal({ prescription, patientName, onClose, onConfirm }) {
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
          Are you sure you want to delete the prescription for <span className="text-on-surface font-label-md">{patientName}</span>?
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

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="font-label-md text-on-surface-variant text-[11px] mb-0.5">{label}</p>
      <p className="font-body-md text-on-surface">{value}</p>
    </div>
  );
}
