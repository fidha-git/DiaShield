import React, { useState, useEffect, useRef } from 'react'
import API from '../services/api'

export default function Profile() {
    // Handle image upload
    const handleImageUpload = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await API.post(
        "/patient/upload-image",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFormData(prev => ({
        ...prev,
        profile_image: response.data.profile_image,
      }));
    };
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    height: '',
    weight: '',
    blood_group: '',
    profile_image: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    insurance_provider: '',
    policy_number: '',
    group_code: '',
    primary_clinic: '',
  })
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [imgUploading, setImgUploading] = useState(false)
  const [imgError, setImgError] = useState("")
  const [imgSuccess, setImgSuccess] = useState("")
  const fileInputRef = useRef()

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await API.get('/patient/me')
        setFormData({
          name: res.data.name || '',
          age: res.data.age || '',
          gender: res.data.gender || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          height: res.data.height || '',
          weight: res.data.weight || '',
          blood_group: res.data.blood_group || '',
          profile_image: res.data.profile_image || '',
          email: res.data.email || '',
          emergency_contact_name: res.data.emergency_contact_name || '',
          emergency_contact_phone: res.data.emergency_contact_phone || '',
          emergency_contact_relationship: res.data.emergency_contact_relationship || '',
          insurance_provider: res.data.insurance_provider || '',
          policy_number: res.data.policy_number || '',
          group_code: res.data.group_code || '',
          primary_clinic: res.data.primary_clinic || '',
        })
        setPatientId(res.data.id)
      } catch (error) {
        setError("Failed to load profile. Please try again later.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(f => ({ ...f, [name]: value }))
  }

  // Validate form
  const validate = () => {
    if (!formData.name) return "Name is required."
    if (formData.age && isNaN(formData.age)) return "Age must be numeric."
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) return "Phone number is invalid."
    if (formData.height && isNaN(formData.height)) return "Height must be numeric."
    if (formData.weight && isNaN(formData.weight)) return "Weight must be numeric."
    return null
  }

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault()
    setSuccess("")
    setError("")
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    try {
      await API.put(`/patient/update/${patientId}`, {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        height: formData.height,
        weight: formData.weight,
        blood_group: formData.blood_group,
        email: formData.email,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        insurance_provider: formData.insurance_provider,
        policy_number: formData.policy_number,
        group_code: formData.group_code,
        primary_clinic: formData.primary_clinic,
      })
      setSuccess("Profile updated successfully.")
      // Refresh profile
      const res = await API.get('/patient/me')
      setFormData({
        name: res.data.name || '',
        age: res.data.age || '',
        gender: res.data.gender || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        height: res.data.height || '',
        weight: res.data.weight || '',
        blood_group: res.data.blood_group || '',
        profile_image: res.data.profile_image || '',
        email: res.data.email || '',
        emergency_contact_name: res.data.emergency_contact_name || '',
        emergency_contact_phone: res.data.emergency_contact_phone || '',
        emergency_contact_relationship: res.data.emergency_contact_relationship || '',
        insurance_provider: res.data.insurance_provider || '',
        policy_number: res.data.policy_number || '',
        group_code: res.data.group_code || '',
        primary_clinic: res.data.primary_clinic || '',
      })
    } catch (error) {
      setError("Failed to update profile. Please try again.")
      console.error(error)
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess("") , 2000)
    }
  }
  // Compute imageUrl for avatar
  const imageUrl = formData?.profile_image
    ? `http://127.0.0.1:8000/${formData.profile_image}`
    : null;

  return (
    <form onSubmit={handleSave} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-6">
        {/* Left Column - Patient Profile Card + Insurance Coverage */}
        <div className="flex flex-col gap-unit-6">
          {/* Patient Profile Card */}
          <div className="glass-card rounded-xl p-unit-6 flex flex-col items-center relative overflow-hidden">
            <div className="w-[120px] h-[120px] rounded-full bg-surface-container flex items-center justify-center mb-4 relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Patient Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-4xl font-bold text-white">{formData.name?.charAt(0)}</span>
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-secondary p-2 rounded-full shadow-lg hover:bg-secondary/80 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Upload profile image"
              >
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <div className="flex flex-col items-center mb-2">
              <span className="font-headline-md text-white text-lg font-semibold">{formData.name || 'Patient Name'}</span>
              <span className="text-on-surface-variant text-xs mt-1">Patient ID: {patientId || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded bg-green-700/30 text-green-300 font-label-md">Portal Access</span>
              <span className="material-symbols-outlined text-[#00e6d2] text-base" title="HIPAA Compliant">verified_user</span>
              <span className="text-xs text-[#00e6d2] font-label-md">HIPAA</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-on-surface-variant text-xs mb-1">Primary Clinic</span>
              <span className="font-label-md text-white text-sm">{formData.primary_clinic || 'N/A'}</span>
            </div>
          </div>

          {/* Insurance Coverage Card (unchanged) */}
          <div className="glass-card rounded-xl p-unit-6 relative overflow-hidden">
            <h4 className="font-headline-md text-[18px] text-white font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              Insurance Coverage
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Provider</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="insurance_provider"
                  value={formData.insurance_provider}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Policy / Card Number</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="policy_number"
                  value={formData.policy_number}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Group Code</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="group_code"
                  value={formData.group_code}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Forms */}
        <div className="lg:col-span-2 space-y-unit-6">
          {/* Demographics details */}
          <div className="glass-card rounded-xl p-unit-6">
            <h4 className="font-headline-md text-[18px] text-white font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">badge</span>
              Personal Demographics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Full Legal Name</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Age</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Biological Gender</label>
                <select 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Blood Type</label>
                <select 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="glass-card rounded-xl p-unit-6">
            <h4 className="font-headline-md text-[18px] text-white font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contacts</span>
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Phone Number</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Email Address</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Residential Address</label>
              <input 
                className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Emergency contacts details */}
          <div className="glass-card rounded-xl p-unit-6">
            <h4 className="font-headline-md text-[18px] text-white font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">emergency</span>
              Emergency Contacts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Contact Name</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Relationship</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Contact Phone</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="flex justify-end gap-4">
            <button 
              type="button"
              className="px-6 py-3 bg-surface-container border border-white/10 text-on-surface hover:bg-white/5 rounded-lg font-label-md transition-colors"
              onClick={() => window.location.reload()}
            >
              Reset Form
            </button>
            <button 
              type="submit"
              disabled={saving}
              className={`px-8 py-3 bg-secondary-container hover:bg-[#7222da] text-white font-headline-md font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2 ${saving ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                  Saving Profile...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Profile Changes
                </>
              )}
              {success && <span className="ml-4 text-green-400 font-label-md">{success}</span>}
              {error && <span className="ml-4 text-red-400 font-label-md">{error}</span>}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
