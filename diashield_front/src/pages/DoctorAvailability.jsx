import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  getMyDoctorProfile,
  getDoctorSlots,
  getDoctorAppointments,
  addDoctorSlot,
  updateDoctorSlot,
  deleteDoctorSlot,
  getAppointmentBySlot,
  doctorCancelAppointment,
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
      <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500">{isEdit ? "edit" : "add_circle"}</span>
            {isEdit ? "Edit Slot" : "Add New Slot"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date</label>
            <input
              type="date"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
              className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start Time</label>
              <input
                type="time"
                name="start_time"
                required
                value={form.start_time}
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End Time</label>
              <input
                type="time"
                name="end_time"
                required
                value={form.end_time}
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => onDelete(slot.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  Delete Slot
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 text-xs"
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

function ConfirmDeleteModal({ slot, onClose, onConfirm, loading, isBlocked }) {
  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6 w-full max-w-sm animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-amber-500">block</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Cannot Delete Slot</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            This slot has an active appointment and cannot be deleted.
          </p>
          <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 mb-4 opacity-50 cursor-not-allowed">
            <input type="checkbox" disabled className="rounded" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Admin override (coming soon)</span>
          </label>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6 w-full max-w-sm animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Slot</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to delete this slot? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log("%c[ConfirmDeleteModal] Delete button clicked, slot.id:", "background:purple;color:white;padding:4px", slot?.id, "slot:", slot);
              if (typeof onConfirm !== "function") {
                console.error("[ConfirmDeleteModal] FATAL: onConfirm is NOT a function!", onConfirm);
              }
              onConfirm(slot.id);
            }}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function todayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DoctorAvailability() {
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [modalSlot, setModalSlot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [blockedDeleteTarget, setBlockedDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [menuOpenSlotId, setMenuOpenSlotId] = useState(null);
  const menuRef = useRef(null);

  const [createForm, setCreateForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });
  const [creating, setCreating] = useState(false);

  const loadSlots = useCallback(async (docId) => {
    setLoading(true);
    try {
      const [slotsRes, apptsRes] = await Promise.allSettled([
        getDoctorSlots(docId),
        getDoctorAppointments(docId, { limit: 100 }),
      ]);
      const rawSlots = slotsRes.status === "fulfilled" && Array.isArray(slotsRes.value.data)
        ? slotsRes.value.data : [];
      const appointments = apptsRes.status === "fulfilled" && Array.isArray(apptsRes.value.data?.appointments)
        ? apptsRes.value.data.appointments : [];

      const slotApptMap = {};
      appointments.forEach(a => { slotApptMap[a.slot_id] = a; });

      const enrichedSlots = rawSlots.map(s => ({
        ...s,
        patient_name: s.is_booked && slotApptMap[s.id]?.patient_name
          ? slotApptMap[s.id].patient_name
          : null,
        appointment_id: s.is_booked && slotApptMap[s.id]?.id
          ? slotApptMap[s.id].id
          : null,
      }));

      setSlots(enrichedSlots);
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
    console.log("%c[handleDelete] called with slotId: %s", "background:red;color:white;font-size:14px;padding:4px", slotId);
    console.trace("[handleDelete] stack trace");
    setDeleteLoading(true);
    console.log("%c[handleDelete] deleteLoading set to true", "color:blue");
    try {
      console.log("%c[handleDelete] calling deleteDoctorSlot(%s)...", "color:orange", slotId);
      const response = await deleteDoctorSlot(slotId);
      console.log("%c[handleDelete] deleteDoctorSlot SUCCEEDED", "background:green;color:white;font-size:14px;padding:4px", response);
      setToast({ message: "Slot deleted successfully", type: "success" });
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      setDeleteTarget(null);
      setModalSlot(null);
    } catch (err) {
      console.error("[handleDelete] API error:", err);
      console.error("[handleDelete] err.response:", err.response);
      console.error("[handleDelete] err.response.data:", err.response?.data);
      console.error("[handleDelete] err.response.status:", err.response?.status);
      const serverMsg = err.response?.data?.detail || err.response?.data?.message;
      const msg = serverMsg || err.message || "Failed to delete slot";
      setToast({ message: msg, type: "error" });
    } finally {
      setDeleteLoading(false);
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

  const handleViewBooking = async (slot) => {
    setBookingDetailLoading(true);
    setBookingDetail(null);
    try {
      const res = await getAppointmentBySlot(slot.id);
      setBookingDetail(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to load booking details";
      setToast({ message: msg, type: "error" });
    } finally {
      setBookingDetailLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelTarget?.appointment_id) return;
    setCancelLoading(true);
    try {
      await doctorCancelAppointment(cancelTarget.appointment_id);
      setToast({ message: "Appointment cancelled successfully", type: "success" });
      setCancelTarget(null);
      setMenuOpenSlotId(null);
      loadSlots(profile.id);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to cancel appointment";
      setToast({ message: msg, type: "error" });
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenSlotId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.is_booked).length;
  const availableSlots = totalSlots - bookedSlots;
  const todayKey = todayLocal();
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

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-[2px] shadow-2xl shadow-sky-500/20 dark:shadow-sky-500/10">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-white dark:bg-[#0F172A]">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/5 rounded-full blur-3xl animate-blob1 pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-cyan-300/20 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob2 pointer-events-none" />
            <div className="relative z-10 p-8 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4 shadow-lg shadow-sky-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Schedule Management
                </div>
                <h1 className="hero-title text-[30px] md:text-[44px]">Availability Slots</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-3xl">
                  Manage your consultation schedule and available appointment slots.
                </p>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="relative w-[200px] h-[200px] rounded-[24px] border border-sky-100 dark:border-slate-800 bg-white dark:bg-[#0F172A]/90 shadow-lg shadow-slate-100/50 dark:shadow-none flex items-center justify-center">
                  <span className="material-symbols-outlined text-sky-400 dark:text-sky-500 text-[80px]">calendar_clock</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard label="Total Slots" value={totalSlots} valueClass="" />
          <StatCard label="Available Slots" value={availableSlots} valueClass="text-green-600 dark:text-green-400" />
          <StatCard label="Booked Slots" value={bookedSlots} valueClass="text-sky-600 dark:text-sky-400" />
          <StatCard label="Today's Slots" value={todaysSlots} valueClass="text-cyan-600 dark:text-cyan-400" />
        </section>

        <section className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Slot</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Add consultation windows for patient bookings.</p>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Date">
              <input
                type="date"
                name="date"
                required
                value={createForm.date}
                onChange={handleCreateChange}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
              />
            </FormField>

            <FormField label="Start Time">
              <input
                type="time"
                name="start_time"
                required
                value={createForm.start_time}
                onChange={handleCreateChange}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
              />
            </FormField>

            <FormField label="End Time">
              <input
                type="time"
                name="end_time"
                required
                value={createForm.end_time}
                onChange={handleCreateChange}
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
              />
            </FormField>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full h-12 disabled:opacity-60"
              >
                {creating && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {creating ? "Creating..." : "Add Availability Slot"}
              </button>
            </div>
          </form>
        </section>

        {loading ? (
          <div className="mt-10 space-y-6">
            <div className="shimmer h-32 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-48 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="mt-10 bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none flex flex-col items-center py-20 gap-4 overflow-hidden">
            <span className="material-symbols-outlined text-6xl text-sky-300 dark:text-sky-500">schedule</span>
            <span className="text-xl font-bold text-slate-700 dark:text-slate-300">No slots created yet</span>
            <p className="text-base text-slate-500 dark:text-slate-400">Use the form above to create your first availability slot.</p>
          </div>
        ) : (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Available Slots</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{totalSlots} total slots</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/5 hover:-translate-y-0.5 transition-all duration-300 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-500">Date</p>
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
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
                          ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                      }`}
                    >
                      {slot.is_booked ? "Booked" : "Available"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-500">Start Time</p>
                      <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-200">{slot.start_time?.slice(0, 5)}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-500">End Time</p>
                      <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-200">{slot.end_time?.slice(0, 5)}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-500">
                        {slot.is_booked ? "Booked By" : "Status"}
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                        {slot.is_booked
                          ? (slot.patient_name || "Patient")
                          : "Available"}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenSlotId(menuOpenSlotId === slot.id ? null : slot.id)}
                        className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                        title="Actions"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>

                      {menuOpenSlotId === slot.id && (
                        <div ref={menuRef} className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 py-1.5 animate-scale-in origin-top-right">
                          {slot.is_booked ? (
                            <>
                              <button
                                onClick={() => { handleViewBooking(slot); setMenuOpenSlotId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px] text-sky-500">visibility</span>
                                View Booking Details
                              </button>
                              <button
                                onClick={() => { setCancelTarget(slot); setMenuOpenSlotId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                Cancel Appointment
                              </button>
                              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                              <button
                                onClick={() => { setBlockedDeleteTarget(slot); setMenuOpenSlotId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px] text-red-400">delete</span>
                                Delete Slot
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { console.log("Edit clicked", slot.id); setModalSlot(slot); setMenuOpenSlotId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px] text-sky-500">edit</span>
                                Edit Slot
                              </button>
                              <button
                                onClick={() => {
                                  console.log("[Delete Slot] clicked for slot:", slot.id, slot);
                                  setDeleteTarget(slot);
                                  setMenuOpenSlotId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                Delete Slot
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
            loading={deleteLoading}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}

        {blockedDeleteTarget && (
          <ConfirmDeleteModal
            slot={blockedDeleteTarget}
            isBlocked
            onClose={() => setBlockedDeleteTarget(null)}
          />
        )}

        {bookingDetail && (
          <BookingDetailModal
            booking={bookingDetail}
            loading={bookingDetailLoading}
            onClose={() => setBookingDetail(null)}
          />
        )}

        {cancelTarget && (
          <DoctorCancelModal
            slot={cancelTarget}
            loading={cancelLoading}
            onClose={() => setCancelTarget(null)}
            onConfirm={handleCancelAppointment}
          />
        )}
      </div>
    </div>
  );
}

function BookingDetailModal({ booking, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-500">event</span>
            Booking Details
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <span className="w-6 h-6 border-2 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
          </div>
        ) : booking ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10">
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-500 text-2xl">person</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{booking.patient_name || "Unknown"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {booking.date ? new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    booking.status === "booked"
                      ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                      : booking.status === "completed"
                      ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20"
                      : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                  }`}>
                    {(booking.status || "unknown").toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{booking.start_time?.slice(0, 5) || "-"}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End Time</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{booking.end_time?.slice(0, 5) || "-"}</p>
              </div>
            </div>

            {booking.created_at && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Booked On</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {new Date(booking.created_at).toLocaleString()}
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-3xl">info</span>
            <p className="mt-2 text-sm">No booking details available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCancelModal({ slot, loading, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6 w-full max-w-sm animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-amber-500">event_busy</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Cancel Appointment</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Cancel appointment for {new Date(slot.date).toLocaleDateString()} at {slot.start_time?.slice(0, 5)}?
          <br />
          <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs mt-2 block">
            The slot will be marked as available again. This action cannot be undone.
          </span>
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Cancelling..." : "Yes, Cancel Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClass }) {
  return (
    <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6 relative overflow-hidden">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">{label}</p>
      <p className={`mt-1 text-[34px] leading-none font-extrabold text-slate-900 dark:text-slate-100 ${valueClass || ""}`}>{value}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

