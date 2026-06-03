import React, { useEffect, useState, useCallback, useRef } from "react";
import { getMyDoctorProfile, updateDoctorProfile, uploadDoctorProfileImage } from "../services/doctorService";

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600";
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} shadow-2xl animate-slide-down`}>
      <span className="material-symbols-outlined text-lg">{type === "success" ? "check_circle" : "error"}</span>
      <span className="text-xs font-semibold">{message}</span>
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
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [form, setForm] = useState(null);
  const fileInputRef = useRef(null);

  const profileImageUrl = profile?.profile_image
    ? `http://127.0.0.1:8000${profile.profile_image}`
    : null;

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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setToast({ message: "Invalid file type. Allowed: jpg, jpeg, png, webp", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "File too large. Maximum size is 5 MB", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadDoctorProfileImage(file);
      setProfile(res.data);
      setToast({ message: "Profile picture updated", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to upload image";
      setToast({ message: msg, type: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="shimmer h-48 rounded-3xl" />
        <div className="shimmer h-64 rounded-3xl" />
      </div>
    </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Doctor Portal
            </div>
            <h1 className="hero-title text-[30px] md:text-[44px]">
              <span className="text-gradient">My Profile</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Manage your professional information.</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg">
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </button>
          )}
        </header>

        {!editing ? (
          <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
              <div className="relative group">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center ring-4 ring-sky-100 dark:ring-slate-700/50">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-white">person</span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-white">camera_alt</span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.name}</h3>
                <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold">{profile.specialization}</span>
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
          <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6">Edit Profile</h3>
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
                  className="px-4 py-2 rounded-lg border border-sky-100 text-slate-500 text-xs font-semibold hover:bg-sky-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-semibold hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 flex items-center gap-2">
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
      <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-900">{value}</p>
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

