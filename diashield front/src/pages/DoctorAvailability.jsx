import React, { useEffect, useState, useCallback } from "react";
import {
  getMyDoctorProfile,
  getDoctorSlots,
  addDoctorSlot,
  updateDoctorSlot,
  deleteDoctorSlot,
} from "../services/doctorService";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-red-50 border-red-200 text-red-700";

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} shadow-2xl animate-slide-down`}>
      <span className="material-symbols-outlined text-lg">{type === "success" ? "check_circle" : "error"}</span>
      <span className="text-xs font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
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
      start_time: `${form.start_time}:00`,
      end_time: `${form.end_time}:00`,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500">{isEdit ? "edit" : "add_circle"}</span>
            {isEdit ? "Edit Slot" : "Add New Slot"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Date</label>
            <input
              type="date"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
              className="h-11 px-3 rounded-lg bg-sky-50 border border-sky-100 text-slate-900 focus:outline-none focus:border-sky-400/50 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Start Time</label>
              <input
                type="time"
                name="start_time"
                required
                value={form.start_time}
                onChange={handleChange}
                className="h-11 px-3 rounded-lg bg-sky-50 border border-sky-100 text-slate-900 focus:outline-none focus:border-sky-400/50 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">End Time</label>
              <input
                type="time"
                name="end_time"
                required
                value={form.end_time}
                onChange={handleChange}
                className="h-11 px-3 rounded-lg bg-sky-50 border border-sky-100 text-slate-900 focus:outline-none focus:border-sky-400/50 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => onDelete(slot.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  Delete Slot
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-sky-100 text-slate-500 text-xs font-semibold hover:bg-sky-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30 p-6 w-full max-w-sm animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">Delete Slot</h3>
        <p className="text-sm text-slate-500 mb-6">
          Delete slot on {new Date(slot.date).toLocaleDateString()} at {slot.start_time?.slice(0, 5)}?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-sky-100 text-slate-500 text-xs font-semibold hover:bg-sky-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(slot.id)}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold hover:from-red-600 hover:to-red-700 transition-all"
          >
            Delete
          </button>
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

  const [createForm, setCreateForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });
  const [creating, setCreating] = useState(false);

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

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (!createForm.date || !createForm.start_time || !createForm.end_time) {
      setToast({ message: "Please fill all slot fields", type: "error" });
      return;
    }

    setCreating(true);
    try {
      await addDoctorSlot(profile.id, {
        date: createForm.date,
        start_time: `${createForm.start_time}:00`,
        end_time: `${createForm.end_time}:00`,
      });
      setToast({ message: "Slot added successfully", type: "success" });
      setCreateForm({ date: "", start_time: "", end_time: "" });
      loadSlots(profile.id);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to save slot";
      setToast({ message: msg, type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.is_booked).length;
  const availableSlots = totalSlots - bookedSlots;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysSlots = slots.filter((s) => s.date === todayKey).length;

  const sortedSlots = [...slots].sort((a, b) => {
    const ad = `${a.date}T${a.start_time || "00:00:00"}`;
    const bd = `${b.date}T${b.start_time || "00:00:00"}`;
    return new Date(ad).getTime() - new Date(bd).getTime();
  });

  return (
    <div className="space-y-8">
      <div className="max-w-[1400px] mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <section className="relative overflow-hidden rounded-[24px] border border-cyan-200/35 bg-gradient-to-br from-[#021B3A] via-[#053B70] to-[#0C7CB8] shadow-[0_24px_70px_rgba(2,23,55,0.42)] p-8 md:p-10">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(125,211,252,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.28) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full bg-sky-300/15 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-xl text-white/90 text-[11px] font-bold uppercase tracking-widest mb-5">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Schedule Management
              </div>
              <h1 className="text-4xl md:text-[52px] leading-[1.05] font-extrabold text-white tracking-tight">Availability Slots</h1>
              <p className="mt-6 text-[17px] md:text-[20px] leading-relaxed text-sky-50/90 max-w-3xl">
                Manage your consultation schedule and available appointment slots.
              </p>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative w-[240px] h-[240px] rounded-[24px] border border-white/25 bg-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center">
                <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[20px]">event</span>
                </div>
                <div className="absolute bottom-4 left-4 w-9 h-9 rounded-xl bg-cyan-200/20 border border-cyan-100/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-cyan-50 text-[20px]">schedule</span>
                </div>
                <span className="material-symbols-outlined text-white/95 text-[96px]">calendar_clock</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard label="Total Slots" value={totalSlots} valueClass="text-slate-900" border="border-sky-200/70" />
          <StatCard label="Available Slots" value={availableSlots} valueClass="text-green-600" border="border-green-200/70" />
          <StatCard label="Booked Slots" value={bookedSlots} valueClass="text-sky-600" border="border-sky-200/70" />
          <StatCard label="Today's Slots" value={todaysSlots} valueClass="text-cyan-600" border="border-cyan-200/70" />
        </section>

        <section className="mt-8 rounded-[20px] border border-sky-200/70 bg-white/80 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.08)] p-6">
          <div className="mb-6">
            <h2 className="text-2xl md:text-[30px] font-bold text-slate-900 tracking-tight">Create New Slot</h2>
            <p className="text-slate-500 mt-2 text-[15px]">Add consultation windows for patient bookings.</p>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Date">
              <input
                type="date"
                name="date"
                required
                value={createForm.date}
                onChange={handleCreateChange}
                className="h-12 px-4 rounded-xl border border-sky-200 bg-sky-50/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400"
              />
            </FormField>

            <FormField label="Start Time">
              <input
                type="time"
                name="start_time"
                required
                value={createForm.start_time}
                onChange={handleCreateChange}
                className="h-12 px-4 rounded-xl border border-sky-200 bg-sky-50/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400"
              />
            </FormField>

            <FormField label="End Time">
              <input
                type="time"
                name="end_time"
                required
                value={createForm.end_time}
                onChange={handleCreateChange}
                className="h-12 px-4 rounded-xl border border-sky-200 bg-sky-50/80 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400"
              />
            </FormField>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-200/60 disabled:opacity-60"
              >
                {creating && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {creating ? "Creating..." : "Add Availability Slot"}
              </button>
            </div>
          </form>
        </section>

        {loading ? (
          <div className="mt-10 space-y-6">
            <div className="shimmer h-32 rounded-[20px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-48 rounded-[20px]" />
              ))}
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="mt-10 relative rounded-[20px] border border-sky-200 bg-white/80 backdrop-blur-xl shadow-[0_12px_36px_rgba(15,23,42,0.08)] flex flex-col items-center py-20 gap-4 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-sky-500/5 to-cyan-500/5 blur-2xl" />
            <span className="material-symbols-outlined text-6xl text-sky-300">schedule</span>
            <span className="text-xl font-bold text-slate-700">No slots created yet</span>
            <p className="text-base text-slate-500">Use the form above to create your first availability slot.</p>
          </div>
        ) : (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-[30px] font-bold text-slate-900 tracking-tight">Available Slots</h2>
              <p className="text-sm text-slate-500 font-medium">{totalSlots} total slots</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="group rounded-[20px] border border-sky-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-[0_10px_28px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_38px_rgba(14,116,144,0.18)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] uppercase tracking-wider font-semibold text-slate-500">Date</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {new Date(slot.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        slot.is_booked
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {slot.is_booked ? "Booked" : "Available"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-500">Start Time</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{slot.start_time?.slice(0, 5)}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-500">End Time</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{slot.end_time?.slice(0, 5)}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-sky-100 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-500">Number of Bookings</p>
                      <p className="mt-1 text-base font-bold text-slate-900">{slot.is_booked ? 1 : 0}</p>
                    </div>

                    {!slot.is_booked && (
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalSlot(slot)}
                          className="h-10 w-10 rounded-xl border border-sky-200 text-sky-600 hover:bg-sky-50 transition-colors flex items-center justify-center"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(slot)}
                          className="h-10 w-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
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

function StatCard({ label, value, valueClass, border }) {
  return (
    <div className={`rounded-[20px] border ${border} bg-white/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-6`}>
      <p className="text-sm font-semibold tracking-wide text-slate-500">{label}</p>
      <p className={`mt-3 text-[38px] leading-none font-extrabold ${valueClass}`}>{value}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

