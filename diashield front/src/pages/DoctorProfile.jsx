import React, { useEffect, useState, useCallback } from "react";
import { getMyDoctorProfile, updateDoctorProfile } from "../services/doctorService";

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

const formatINR = (value) => {
  if (value == null || isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [form, setForm] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyDoctorProfile();
        const d = res.data;
        setProfile(d);
        setForm({
          name: d.name || "",
          phone: d.phone || "",
          specialization: d.specialization || "",
          qualification: d.qualification || "",
          experience: d.experience ?? "",
          consultation_fee: d.consultation_fee ?? "",
          hospital: d.hospital || "",
          bio: d.bio || "",
        });
      } catch {
        setToast({ message: "Failed to load profile", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctorProfile(profile.id, {
        ...form,
        experience: form.experience !== "" ? Number(form.experience) : undefined,
        consultation_fee: form.consultation_fee !== "" ? Number(form.consultation_fee) : undefined,
      });
      setToast({ message: "Profile updated successfully", type: "success" });
      setEditing(false);
      const res = await getMyDoctorProfile();
      setProfile(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update profile";
      setToast({ message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-on-surface-variant font-headline-md">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="flex items-center justify-between mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">My Profile</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Manage your professional information.</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-lg font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg">
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </button>
          )}
        </header>

        {!editing ? (
          <div className="glass-card rounded-xl p-unit-6">
            <div className="flex items-center gap-6 pb-6 border-b border-white/10 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white">person</span>
              </div>
              <div>
                <h3 className="font-display-lg text-[28px] text-on-surface">{profile.name}</h3>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-label-md">{profile.specialization}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <ProfileField label="Qualification" value={profile.qualification} />
              <ProfileField label="Experience" value={profile.experience ? `${profile.experience} years` : "—"} />
              <ProfileField label="Hospital / Clinic" value={profile.hospital} />
              <ProfileField label="Phone" value={profile.phone} />
              <ProfileField label="Consultation Fee" value={formatINR(profile.consultation_fee)} />
              <ProfileField label="Bio" value={profile.bio || "—"} className="md:col-span-2 lg:col-span-3" />
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Edit Profile</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" id="edit-name" name="name" required value={form.name} onChange={handleChange} />
              <Field label="Phone Number" id="edit-phone" name="phone" required value={form.phone} onChange={handleChange} />
              <Field label="Specialization" id="edit-spec" name="specialization" required value={form.specialization} onChange={handleChange} />
              <Field label="Qualification" id="edit-qual" name="qualification" required value={form.qualification} onChange={handleChange} />
              <Field label="Experience (Years)" id="edit-exp" name="experience" type="number" value={form.experience} onChange={handleChange} />
              <Field label="Consultation Fee (₹)" id="edit-fee" name="consultation_fee" type="number" step="0.01" value={form.consultation_fee} onChange={handleChange} />
              <Field label="Hospital / Clinic" id="edit-hospital" name="hospital" required value={form.hospital} onChange={handleChange} />
              <div className="md:col-span-2">
                <Field label="Bio" id="edit-bio" name="bio" type="textarea" value={form.bio} onChange={handleChange} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => { setEditing(false); setForm({ ...profile }); }}
                  className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-label-md hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="font-label-md text-on-surface-variant text-[11px] mb-0.5">{label}</p>
      <p className="font-body-md text-on-surface">{value}</p>
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
