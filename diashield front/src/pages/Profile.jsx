import React, { useState } from 'react'

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: 'Amal Al-Mansoori',
    dob: '1981-04-12',
    gender: 'Female',
    bloodType: 'O+',
    phone: '+971 50 123 4567',
    email: 'amal.mansoori@example.com',
    address: 'Downtown Dubai, UAE',
    emergencyContact: 'Fatima Al-Mansoori',
    emergencyRelation: 'Sister',
    emergencyPhone: '+971 50 987 6543',
    insuranceProvider: 'Daman National Health',
    policyNumber: 'DM-98231-A',
    groupNumber: 'G-7489'
  })

  const [saving, setSaving] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('Demographics and profile preferences saved successfully!')
    }, 1200)
  }

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {/* Header */}
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Patient Profile</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage your administrative details and emergency care network contacts.</p>
        </header>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-unit-6">
          {/* Left Column - Avatar & Core Info */}
          <div className="lg:col-span-1 space-y-unit-6">
            <div className="glass-card rounded-xl p-unit-6 text-center flex flex-col items-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-secondary to-tertiary"></div>
              
              <div className="relative mb-4 mt-2">
                <img 
                  alt="Patient Avatar large" 
                  className="w-32 h-32 rounded-full border-4 border-white/10 group-hover:border-tertiary transition-colors duration-300"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuFah2Nex9h6V5CEgrhzEDV1RnYpcPovQJeoKdeVt28QcWySKqiCd-sSDIIHQnj9aN2ay43Hdkswwa9NSv0wBe7FM0fUjWz0K6MMVrd4YcjADpV02POPp7wYzWCy3br2iZu_ddmxK3Umva-2CWFLyNvNPVHlw1NKrnHWGmLNXlFD9d2C_Qwg45KE26coVQ1aw0SK-_OUY93y3L7VoP2Pv6xWzBeHt_vmXKbrzysOXuEXQGp79WKL575xPdPVFbOpe-3uhkJzOs5beQ"
                />
                <button type="button" className="absolute bottom-1 right-1 bg-tertiary text-on-tertiary rounded-full p-2 hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>

              <h3 className="font-headline-md text-white text-[20px] font-bold">{formData.fullName}</h3>
              <p className="font-label-md text-on-surface-variant text-[11px] tracking-wider uppercase mb-6">Patient ID: #DS-8829-X</p>
              
              <div className="w-full space-y-3 pt-4 border-t border-white/5 text-left">
                <div className="flex justify-between">
                  <span className="font-label-md text-on-surface-variant text-[11px] uppercase">Portal Access</span>
                  <span className="font-headline-md text-green-400 text-[13px] flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Verified HIPAA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-label-md text-on-surface-variant text-[11px] uppercase">Primary Clinic</span>
                  <span className="font-body-sm text-white">Al Zahra Endocrinology</span>
                </div>
              </div>
            </div>

            {/* Insurance details */}
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
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({...formData, insuranceProvider: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Policy / Card Number</label>
                  <input 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Group Code</label>
                  <input 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    value={formData.groupNumber}
                    onChange={(e) => setFormData({...formData, groupNumber: e.target.value})}
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
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Date of Birth</label>
                  <input 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Biological Gender</label>
                  <select 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
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
                    value={formData.bloodType}
                    onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
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
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Email Address</label>
                  <input 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Residential Address</label>
                <input 
                  className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Relationship</label>
                  <input 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({...formData, emergencyRelation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Contact Phone</label>
                  <input 
                    className="input-glass w-full rounded-lg px-3 py-2 text-on-surface text-[14px] outline-none" 
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
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
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
