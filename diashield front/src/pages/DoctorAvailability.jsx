import React, { useEffect, useState, useCallback } from "react";
import {
  getMyDoctorProfile,
  getDoctorSlots,
  addDoctorSlot,
  updateDoctorSlot,
  deleteDoctorSlot,
} from "../services/doctorService";

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

function SlotModal({ slot, onClose, onSave, onDelete }) {
  const isEdit = !!slot;
  const [form, setForm] = useState({
    date: slot?.date || "",
    start_time: slot?.start_time?.slice(0, 5) || "",
    end_time: slot?.end_time?.slice(0, 5) || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: slot?.id,
      date: form.date,
      start_time: form.start_time + ":00",
      end_time: form.end_time + ":00",
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-md border border-white/10 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">{isEdit ? "edit" : "add_circle"}</span>
            {isEdit ? "Edit Slot" : "Add New Slot"}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-on-surface-variant text-[11px]">Date</label>
            <input type="date" name="date" required value={form.date} onChange={handleChange}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface-variant text-[11px]">Start Time</label>
              <input type="time" name="start_time" required value={form.start_time} onChange={handleChange}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface-variant text-[11px]">End Time</label>
              <input type="time" name="end_time" required value={form.end_time} onChange={handleChange}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50 text-sm" />
            </div>
          </div>
          <div className="flex justify-between gap-3 mt-4">
            <div>
              {isEdit && (
                <button type="button" onClick={() => onDelete(slot.id)}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-label-md hover:bg-red-500/30 transition-colors">
                  Delete Slot
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? "Saving..." : isEdit ? "Update Slot" : "Add Slot"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ slot, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-sm border border-white/10 shadow-2xl animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-red-400">delete_forever</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Delete Slot</h3>
        <p className="font-body-md text-on-surface-variant mb-6">
          Delete slot on {new Date(slot.date).toLocaleDateString()} at {slot.start_time?.slice(0, 5)}?
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
          <button onClick={() => onConfirm(slot.id)}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-label-md hover:from-red-500 hover:to-red-400 transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorAvailability() {
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [modalSlot, setModalSlot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadSlots = useCallback(async (docId) => {
    setLoading(true);
    try {
      const res = await getDoctorSlots(docId);
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch {
      setToast({ message: "Failed to load slots", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const profRes = await getMyDoctorProfile();
        const prof = profRes.data;
        setProfile(prof);
        loadSlots(prof.id);
      } catch {
        setToast({ message: "Failed to load profile", type: "error" });
      }
    })();
  }, [loadSlots]);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateDoctorSlot(data.id, {
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
        });
        setToast({ message: "Slot updated successfully", type: "success" });
      } else {
        await addDoctorSlot(profile.id, {
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
        });
        setToast({ message: "Slot added successfully", type: "success" });
      }
      setModalSlot(null);
      loadSlots(profile.id);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to save slot";
      setToast({ message: msg, type: "error" });
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await deleteDoctorSlot(slotId);
      setToast({ message: "Slot deleted successfully", type: "success" });
      setDeleteTarget(null);
      setModalSlot(null);
      loadSlots(profile.id);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to delete slot";
      setToast({ message: msg, type: "error" });
    }
  };

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.is_booked).length;
  const availableSlots = totalSlots - bookedSlots;

  const groupedByDate = {};
  slots.forEach((s) => {
    const key = s.date;
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(s);
  });

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Availability Slots</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Manage your available time slots.</p>
          </div>
          <button onClick={() => setModalSlot({})}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-lg font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Slot
          </button>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-unit-8">
          <div className="glass-card rounded-xl p-5 text-center">
            <span className="font-display-lg text-[32px] text-on-surface">{totalSlots}</span>
            <p className="font-label-md text-on-surface-variant text-[11px]">Total Slots</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <span className="font-display-lg text-[32px] text-green-400">{availableSlots}</span>
            <p className="font-label-md text-on-surface-variant text-[11px]">Available</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <span className="font-display-lg text-[32px] text-cyan-400">{bookedSlots}</span>
            <p className="font-label-md text-on-surface-variant text-[11px]">Booked</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant font-headline-md">Loading slots...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="glass-card rounded-xl flex flex-col items-center py-20 gap-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">schedule</span>
            <span className="font-headline-md text-on-surface-variant">No slots created yet</span>
            <p className="font-body-md text-on-surface-variant">Click "Add Slot" to create your first availability slot.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dateSlots]) => (
              <div key={date} className="glass-card rounded-xl p-unit-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
                  {new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {dateSlots.map((slot) => (
                    <div key={slot.id} className={`p-3 rounded-lg border relative group ${
                      slot.is_booked
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-green-500/10 border-green-500/30"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-label-md ${slot.is_booked ? "text-red-400" : "text-green-400"}`}>
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                          </p>
                          <p className="font-body-sm text-on-surface-variant text-[11px] mt-0.5">
                            {slot.is_booked ? "Booked" : "Available"}
                          </p>
                        </div>
                        {!slot.is_booked && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setModalSlot(slot)}
                              className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onClick={() => setDeleteTarget(slot)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {modalSlot !== null && (
          <SlotModal
            slot={modalSlot.id ? modalSlot : null}
            onClose={() => setModalSlot(null)}
            onSave={handleSave}
            onDelete={(id) => setDeleteTarget(slots.find((s) => s.id === id))}
          />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            slot={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
