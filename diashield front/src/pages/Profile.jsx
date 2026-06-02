import React, { useState, useEffect, useRef } from 'react'
import API from '../services/api'

const AVATAR_BASE = "http://127.0.0.1:8000";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', phone: '', address: '',
    height: '', weight: '', blood_group: '', profile_image: '', email: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
    insurance_provider: '', policy_number: '', group_code: '', primary_clinic: '',
  })
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [imgUploading, setImgUploading] = useState(false)
  const [imgError, setImgError] = useState("")
  const [imgSuccess, setImgSuccess] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [editSection, setEditSection] = useState(null)
  const fileInputRef = useRef()

  const imageUrl = formData?.profile_image
    ? `${AVATAR_BASE}/${formData.profile_image.replace(/^\//, '')}`
    : null;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get('/patient/me')
        setFormData({
          name: res.data.name || '', age: res.data.age || '',
          gender: res.data.gender || '', phone: res.data.phone || '',
          address: res.data.address || '', height: res.data.height || '',
          weight: res.data.weight || '', blood_group: res.data.blood_group || '',
          profile_image: res.data.profile_image || '', email: res.data.email || '',
          emergency_contact_name: res.data.emergency_contact_name || '',
          emergency_contact_phone: res.data.emergency_contact_phone || '',
          emergency_contact_relationship: res.data.emergency_contact_relationship || '',
          insurance_provider: res.data.insurance_provider || '',
          policy_number: res.data.policy_number || '',
          group_code: res.data.group_code || '',
          primary_clinic: res.data.primary_clinic || '',
        })
        setPatientId(res.data.id)
      } catch {
        setError("Failed to load profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    setImgError("");
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await API.post("/patient/upload-image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(prev => ({
        ...prev,
        profile_image: response.data.image_url || response.data.profile_image,
      }));
      setImgSuccess("Image uploaded");
    } catch {
      setImgError("Failed to upload image");
    } finally {
      setImgUploading(false);
      setTimeout(() => setImgSuccess(""), 2000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(f => ({ ...f, [name]: value }))
  }

  const validate = () => {
    if (!formData.name) return "Name is required."
    if (formData.age && isNaN(formData.age)) return "Age must be numeric."
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) return "Phone number is invalid."
    if (formData.height && isNaN(formData.height)) return "Height must be numeric."
    if (formData.weight && isNaN(formData.weight)) return "Weight must be numeric."
    return null
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSuccess("")
    setError("")
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSaving(true)
    try {
      await API.put(`/patient/update/${patientId}`, {
        name: formData.name, age: formData.age, gender: formData.gender,
        phone: formData.phone, address: formData.address,
        height: formData.height, weight: formData.weight,
        blood_group: formData.blood_group, email: formData.email,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        insurance_provider: formData.insurance_provider,
        policy_number: formData.policy_number,
        group_code: formData.group_code,
        primary_clinic: formData.primary_clinic,
      })
      setSuccess("Profile updated successfully.")
      const res = await API.get('/patient/me')
      setFormData({
        name: res.data.name || '', age: res.data.age || '',
        gender: res.data.gender || '', phone: res.data.phone || '',
        address: res.data.address || '', height: res.data.height || '',
        weight: res.data.weight || '', blood_group: res.data.blood_group || '',
        profile_image: res.data.profile_image || '', email: res.data.email || '',
        emergency_contact_name: res.data.emergency_contact_name || '',
        emergency_contact_phone: res.data.emergency_contact_phone || '',
        emergency_contact_relationship: res.data.emergency_contact_relationship || '',
        insurance_provider: res.data.insurance_provider || '',
        policy_number: res.data.policy_number || '',
        group_code: res.data.group_code || '',
        primary_clinic: res.data.primary_clinic || '',
      })
      setEditMode(false)
      setEditSection(null)
    } catch {
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(""), 2000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="shimmer h-52 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="shimmer h-28 rounded-2xl" />)}
          </div>
          <div className="shimmer h-72 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto text-center py-16">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">error</span>
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  const f = formData;

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ─── Hero Profile Section ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600/10 via-cyan-500/5 to-transparent border border-sky-100 shadow-xl shadow-blue-200/30 p-6 md:p-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl animate-blob1" />
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-blob2" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center ring-4 ring-sky-100 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {(f.name || 'P').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-white">
                  {imgUploading ? 'hourglass_top' : 'photo_camera'}
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                  <span className="text-gradient">{f.name || 'Patient Name'}</span>
                </h1>
                <div className="flex items-center gap-2">
                  {f.blood_group && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold border border-red-200">
                      <span className="material-symbols-outlined text-[14px]">bloodtype</span>
                      {f.blood_group}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-200">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Verified
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="text-sm text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                  PID: {patientId || 'N/A'}
                </span>
                <span className="text-sm text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">local_hospital</span>
                  {f.primary_clinic || 'No clinic assigned'}
                </span>
                {f.gender && (
                  <span className="text-sm text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">wc</span>
                    {f.gender}
                  </span>
                )}
                {f.age && (
                  <span className="text-sm text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">cake</span>
                    {f.age} yrs
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/20"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
          </div>
        </div>

        {/* ─── Health Summary Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <HealthCard icon="monitor_heart" label="Blood Sugar" value={f.weight || "\u2014"} sub="mg/dL" color="from-amber-500/20 to-amber-500/5 border-amber-200" iconColor="text-amber-600 bg-amber-100" />
          <HealthCard icon="straighten" label="Height" value={f.height || "\u2014"} sub="cm" color="from-cyan-500/20 to-cyan-500/5 border-cyan-200" iconColor="text-cyan-600 bg-cyan-100" />
          <HealthCard icon="fitness_center" label="Weight" value={f.weight || "\u2014"} sub="kg" color="from-emerald-500/20 to-emerald-500/5 border-emerald-200" iconColor="text-emerald-600 bg-emerald-100" />
          <HealthCard icon="neurology" label="Risk Score" value={f.blood_group || "\u2014"} sub="Blood Type" color="from-sky-500/20 to-sky-500/5 border-sky-200" iconColor="text-sky-600 bg-sky-100" />
        </div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Personal Information Card */}
            <InfoCard title="Personal Information" icon="badge" iconColor="text-sky-600">
              <InfoRow label="Full Name" value={f.name || "\u2014"} />
              <InfoRow label="Age" value={f.age ? `${f.age} years` : "\u2014"} />
              <InfoRow label="Gender" value={f.gender || "\u2014"} />
              <InfoRow label="Blood Type" value={f.blood_group || "\u2014"} />
              <InfoRow label="Height" value={f.height ? `${f.height} cm` : "\u2014"} />
              <InfoRow label="Weight" value={f.weight ? `${f.weight} kg` : "\u2014"} />
            </InfoCard>

            {/* Contact Information Card */}
            <InfoCard title="Contact Information" icon="contacts" iconColor="text-cyan-600">
              <InfoRow label="Phone" value={f.phone || "\u2014"} />
              <InfoRow label="Email" value={f.email || "\u2014"} />
              <InfoRow label="Address" value={f.address || "\u2014"} />
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Emergency Contact Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200 p-6 shadow-lg shadow-blue-200/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-xl">emergency</span>
                    Emergency Contact
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    PRIMARY
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ContactDetail icon="person" label="Name" value={f.emergency_contact_name || "Not set"} />
                  <ContactDetail icon="call" label="Phone" value={f.emergency_contact_phone || "Not set"} />
                  <ContactDetail icon="group" label="Relationship" value={f.emergency_contact_relationship || "Not set"} />
                </div>
              </div>
            </div>

            {/* Insurance Card */}
            <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-lg shadow-blue-200/30">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-xl">receipt_long</span>
                  Insurance Coverage
                </h3>
                {f.insurance_provider && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ContactDetail icon="business" label="Provider" value={f.insurance_provider || "Not set"} />
                <ContactDetail icon="card_membership" label="Policy Number" value={f.policy_number || "Not set"} />
                <ContactDetail icon="folder" label="Group Code" value={f.group_code || "Not set"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Modal ─── */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12 overflow-y-auto" onClick={() => setEditMode(false)}>
          <div className="bg-white border border-sky-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-600">edit</span>
                    Edit Profile
                  </h2>
                  <button type="button" onClick={() => setEditMode(false)} className="text-slate-500 hover:text-slate-900 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {error && <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
                {success && <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">{success}</div>}

                {/* Personal Demographics */}
                <SectionForm title="Personal Demographics" icon="badge">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Full Name" name="name" value={f.name} onChange={handleChange} required />
                    <Field label="Age" name="age" type="number" value={f.age} onChange={handleChange} />
                    <Select label="Gender" name="gender" value={f.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
                    <Select label="Blood Type" name="blood_group" value={f.blood_group} onChange={handleChange} options={["O+","O-","A+","A-","B+","B-","AB+","AB-"]} />
                    <Field label="Height (cm)" name="height" type="number" value={f.height} onChange={handleChange} />
                    <Field label="Weight (kg)" name="weight" type="number" value={f.weight} onChange={handleChange} />
                  </div>
                </SectionForm>

                {/* Contact */}
                <SectionForm title="Contact Information" icon="contacts">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Phone" name="phone" value={f.phone} onChange={handleChange} />
                    <Field label="Email" name="email" value={f.email} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <Field label="Address" name="address" value={f.address} onChange={handleChange} />
                    </div>
                    <Field label="Primary Clinic" name="primary_clinic" value={f.primary_clinic} onChange={handleChange} />
                  </div>
                </SectionForm>

                {/* Emergency Contact */}
                <SectionForm title="Emergency Contact" icon="emergency">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Contact Name" name="emergency_contact_name" value={f.emergency_contact_name} onChange={handleChange} />
                    <Field label="Relationship" name="emergency_contact_relationship" value={f.emergency_contact_relationship} onChange={handleChange} />
                    <Field label="Phone" name="emergency_contact_phone" value={f.emergency_contact_phone} onChange={handleChange} />
                  </div>
                </SectionForm>

                {/* Insurance */}
                <SectionForm title="Insurance Coverage" icon="receipt_long">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Provider" name="insurance_provider" value={f.insurance_provider} onChange={handleChange} />
                    <Field label="Policy Number" name="policy_number" value={f.policy_number} onChange={handleChange} />
                    <Field label="Group Code" name="group_code" value={f.group_code} onChange={handleChange} />
                  </div>
                </SectionForm>
              </div>

              {/* Footer */}
              <div className="px-6 md:px-8 py-5 border-t border-sky-100 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setEditMode(false)}
                  className="px-5 py-2.5 rounded-xl border border-sky-100 text-slate-500 font-semibold text-sm bg-white hover:bg-sky-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 flex items-center gap-2">
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><span className="material-symbols-outlined text-base">save</span> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function HealthCard({ icon, label, value, sub, color, iconColor }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${color} shadow-lg shadow-blue-200/30`}>
      <div className="relative z-10">
        <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center mb-3`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function InfoCard({ title, icon, iconColor, children }) {
  return (
    <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-lg shadow-blue-200/30">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
        <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
        {title}
      </h3>
      <div className="space-y-3.5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-900 font-semibold text-right">{value}</span>
    </div>
  )
}

function ContactDetail({ icon, label, value }) {
  return (
    <div className="bg-[#F0F9FF] rounded-xl p-4 border border-sky-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-slate-400 text-base">{icon}</span>
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-slate-900 font-semibold">{value}</p>
    </div>
  )
}

function SectionForm({ title, icon, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-sky-100">
        <span className="material-symbols-outlined text-sky-600 text-lg">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, name, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full px-3 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 text-sm outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400" />
    </div>
  )
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 text-sm outline-none focus:border-sky-500 transition-colors">
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

