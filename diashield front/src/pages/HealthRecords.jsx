import React, { useState, useEffect } from 'react'
import API from '../services/api'


function AddReadingModal({ open, onClose, onSuccess, editRecord }) {
  const isEdit = !!editRecord
  const [form, setForm] = useState({
    blood_sugar: '',
    blood_pressure: '',
    heart_rate: '',
    bmi: '',
    weight: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Reset or prefill form when modal opens
  React.useEffect(() => {
    if (open) {
      if (isEdit && editRecord) {
        setForm({
          blood_sugar: editRecord.blood_sugar || '',
          blood_pressure: editRecord.blood_pressure || '',
          heart_rate: editRecord.heart_rate || '',
          bmi: editRecord.bmi || '',
          weight: editRecord.weight || '',
          notes: editRecord.notes || ''
        })
      } else {
        setForm({ blood_sugar: '', blood_pressure: '', heart_rate: '', bmi: '', weight: '', notes: '' })
      }
      setError("")
      setSuccess("")
      setSubmitting(false)
    }
  }, [open, isEdit, editRecord])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const validate = () => {
    if (!form.blood_sugar || !form.blood_pressure || !form.heart_rate || !form.bmi || !form.weight) {
      setError("All required fields must be filled.")
      return false
    }
    if (isNaN(form.blood_sugar)) {
      setError("Blood Sugar must be numeric.")
      return false
    }
    if (isNaN(form.heart_rate)) {
      setError("Heart Rate must be numeric.")
      return false
    }
    if (isNaN(form.bmi)) {
      setError("BMI must be numeric.")
      return false
    }
    if (isNaN(form.weight)) {
      setError("Weight must be numeric.")
      return false
    }
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setError("")
    try {
      if (isEdit && editRecord) {
        await API.put(`/health-record/update/${editRecord.id}`, form)
        setSuccess("Health record updated successfully.")
      } else {
        const patientRes = await API.get('/patient/me')
        const patientId = patientRes.data.id
        await API.post('/health-record/create', {
          ...form,
          patient_id: patientId
        })
        setSuccess("Health record added successfully.")
      }
      setTimeout(() => {
        setSuccess("")
        onSuccess()
        onClose()
      }, 800)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail)
      } else {
        setError(isEdit ? "Failed to update health record." : "Failed to add health record.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-8 relative border border-white/10">
        <button onClick={onClose} className="absolute top-3 right-3 text-on-surface-variant hover:text-tertiary text-xl">&times;</button>
        <h2 className="font-headline-md text-white mb-4">{isEdit ? 'Edit Health Record' : 'Add New Health Record'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Blood Sugar <span className="text-red-400">*</span></label>
            <input name="blood_sugar" type="number" min="0" step="any" value={form.blood_sugar} onChange={handleChange} className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tertiary" required />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Blood Pressure <span className="text-red-400">*</span></label>
            <input name="blood_pressure" type="text" value={form.blood_pressure} onChange={handleChange} className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tertiary" required placeholder="e.g. 120/80" />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Heart Rate <span className="text-red-400">*</span></label>
            <input name="heart_rate" type="number" min="0" step="any" value={form.heart_rate} onChange={handleChange} className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tertiary" required />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">BMI <span className="text-red-400">*</span></label>
            <input name="bmi" type="number" min="0" step="any" value={form.bmi} onChange={handleChange} className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tertiary" required />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Weight <span className="text-red-400">*</span></label>
            <input name="weight" type="number" min="0" step="any" value={form.weight} onChange={handleChange} className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tertiary" required />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-tertiary" rows={2} />
          </div>
          {error && <div className="text-red-400 font-label-md text-sm">{error}</div>}
          {success && <div className="text-green-400 font-label-md text-sm">{success}</div>}
          <button type="submit" className="w-full bg-tertiary text-white py-2 rounded-lg font-label-md mt-2 disabled:opacity-60" disabled={submitting}>{submitting ? (isEdit ? 'Saving...' : 'Saving...') : (isEdit ? 'Save Changes' : 'Save Record')}</button>
        </form>
      </div>
    </div>
  )
}

export default function HealthRecords() {

  const [activeTab, setActiveTab] = useState('vitals')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [toast, setToast] = useState("")
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)

  const fetchRecords = async () => {
    setLoading(true)
    setError("")
    try {
      const patientRes = await API.get('/patient/me')
      const patientId = patientRes.data.id
      const recRes = await API.get(`/health-record/${patientId}`)
      setRecords(Array.isArray(recRes.data) ? recRes.data : [])
    } catch (err) {
      setError("Failed to load health records")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchRecords() }, [])

  // Sort records by recorded_at descending
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
  )
  // Latest record for summary cards
  const latestRecord = sortedRecords[0] || null

  const labReports = [
    { id: 'LAB-9923', name: 'Comprehensive Metabolic Panel (CMP)', date: 'Oct 14, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'CMP_Report_Amal.pdf', status: 'Reviewed' },
    { id: 'LAB-9801', name: 'Lipid Profile Assessment', date: 'Oct 14, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'Lipid_Panel_Amal.pdf', status: 'Reviewed' },
    { id: 'LAB-8723', name: 'Urinalysis Microalbumin Screening', date: 'Jul 05, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'Urinalysis_Screening.pdf', status: 'Archived' },
    { id: 'LAB-7489', name: 'Hemoglobin A1c (HbA1c) Panel', date: 'Jul 05, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'HbA1c_Panel_Jul.pdf', status: 'Archived' }
  ]

  const prescriptions = [
    { name: 'Metformin HCl 500mg', dosage: '1 tablet twice daily', route: 'Oral', duration: '90 Days (Refills: 2)', rxNumber: 'Rx-88231', active: true },
    { name: 'Lisinopril 5mg', dosage: '1 tablet once daily in morning', route: 'Oral', duration: '90 Days (Refills: 3)', rxNumber: 'Rx-44810', active: true },
    { name: 'Atorvastatin 10mg', dosage: '1 tablet at bedtime', route: 'Oral', duration: '90 Days (Refills: 1)', rxNumber: 'Rx-99201', active: false }
  ]

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Health Records</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Access clinical laboratory reports, medication parameters, and ongoing vital logs.</p>
          </div>
          <button 
            onClick={() => alert('Diagnostic PDF Report Generator: Full patient record compilation is being initialized. Check back shortly.')}
            className="self-start md:self-auto bg-secondary-container hover:bg-[#7222da] text-white px-6 py-3 rounded-lg font-label-md hover:shadow-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Full Clinical Record
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-unit-6 overflow-x-auto hide-scroll w-full gap-2">
          <button 
            onClick={() => setActiveTab('vitals')}
            className={`whitespace-nowrap px-unit-6 py-unit-3 font-label-md text-label-md transition-colors relative ${activeTab === 'vitals' ? 'text-tertiary font-bold' : 'text-on-surface-variant opacity-75 hover:text-white'}`}
          >
            Vitals & Metrics
            {activeTab === 'vitals' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('labs')}
            className={`whitespace-nowrap px-unit-6 py-unit-3 font-label-md text-label-md transition-colors relative ${activeTab === 'labs' ? 'text-tertiary font-bold' : 'text-on-surface-variant opacity-75 hover:text-white'}`}
          >
            Laboratory Reports
            {activeTab === 'labs' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('meds')}
            className={`whitespace-nowrap px-unit-6 py-unit-3 font-label-md text-label-md transition-colors relative ${activeTab === 'meds' ? 'text-tertiary font-bold' : 'text-on-surface-variant opacity-75 hover:text-white'}`}
          >
            Active Medications
            {activeTab === 'meds' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary"></span>}
          </button>
        </div>

        {/* Tab Content Areas */}
        {activeTab === 'vitals' && (
          <div className="space-y-unit-6">
            {/* Vitals Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-unit-4">
              {loading ? (
                <div className="col-span-4 text-center py-8 text-on-surface-variant">Loading health records...</div>
              ) : error ? (
                <div className="col-span-4 text-center py-8 text-red-400">{error}</div>
              ) : !latestRecord ? (
                <div className="col-span-4 text-center py-8 text-on-surface-variant">No health records found</div>
              ) : (
                <>
                  <div className="glass-card rounded-xl p-unit-4 border flex flex-col justify-between min-h-[140px] text-tertiary border-tertiary/20 bg-tertiary/5">
                    <div>
                      <span className="block font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider mb-2">Fasting Blood Glucose</span>
                      <span className="font-display-lg text-[26px] md:text-[30px] font-bold text-white">{latestRecord.blood_sugar ? `${latestRecord.blood_sugar} mg/dL` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/5 text-[11px]">
                      <span className="font-label-md opacity-80">{latestRecord.blood_sugar_status || '--'}</span>
                      <span className="font-label-md text-on-surface-variant">{latestRecord.recorded_at ? new Date(latestRecord.recorded_at).toLocaleDateString() : '--'}</span>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-unit-4 border flex flex-col justify-between min-h-[140px] text-secondary border-secondary/20 bg-secondary/5">
                    <div>
                      <span className="block font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider mb-2">Blood Pressure</span>
                      <span className="font-display-lg text-[26px] md:text-[30px] font-bold text-white">{latestRecord.blood_pressure ? `${latestRecord.blood_pressure} mmHg` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/5 text-[11px]">
                      <span className="font-label-md opacity-80">{latestRecord.blood_pressure_status || '--'}</span>
                      <span className="font-label-md text-on-surface-variant">{latestRecord.recorded_at ? new Date(latestRecord.recorded_at).toLocaleDateString() : '--'}</span>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-unit-4 border flex flex-col justify-between min-h-[140px] text-white border-white/10 bg-white/5">
                    <div>
                      <span className="block font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider mb-2">Body Mass Index (BMI)</span>
                      <span className="font-display-lg text-[26px] md:text-[30px] font-bold text-white">{latestRecord.bmi ? `${latestRecord.bmi} kg/m²` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/5 text-[11px]">
                      <span className="font-label-md opacity-80">{latestRecord.bmi_status || '--'}</span>
                      <span className="font-label-md text-on-surface-variant">{latestRecord.recorded_at ? new Date(latestRecord.recorded_at).toLocaleDateString() : '--'}</span>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-unit-4 border flex flex-col justify-between min-h-[140px] text-green-400 border-green-500/20 bg-green-500/5">
                    <div>
                      <span className="block font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider mb-2">Weight</span>
                      <span className="font-display-lg text-[26px] md:text-[30px] font-bold text-white">{latestRecord.weight ? `${latestRecord.weight} kg` : '--'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/5 text-[11px]">
                      <span className="font-label-md opacity-80">{latestRecord.weight_status || '--'}</span>
                      <span className="font-label-md text-on-surface-variant">{latestRecord.recorded_at ? new Date(latestRecord.recorded_at).toLocaleDateString() : '--'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Blood Glucose Log */}
            <div className="glass-card rounded-xl p-unit-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-[18px] text-white font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">water_drop</span>
                  Recent Blood Glucose Tracking Log
                </h3>
                <button
                  onClick={() => { setEditRecord(null); setModalOpen(true) }}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface rounded-lg font-label-md text-[13px] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Reading
                </button>
                <AddReadingModal
                  open={modalOpen}
                  onClose={() => { setModalOpen(false); setEditRecord(null) }}
                  onSuccess={() => {
                    setToast(editRecord ? "Health record updated successfully." : "Health record added successfully.")
                    fetchRecords()
                    setTimeout(() => setToast("") , 2000)
                  }}
                  editRecord={editRecord}
                />
                {toast && (
                  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-label-md animate-fade-in">
                    {toast}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="pb-3">Log Date</th>
                      <th className="pb-3">Measurement Window</th>
                      <th className="pb-3">Clinical Value</th>
                      <th className="pb-3 hidden md:table-cell">Clinician Annotations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[14px]">
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-6 text-on-surface-variant">Loading health records...</td></tr>
                    ) : error ? (
                      <tr><td colSpan={4} className="text-center py-6 text-red-400">{error}</td></tr>
                    ) : records.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-6 text-on-surface-variant">No health records found</td></tr>
                    ) : (
                      sortedRecords.map((rec, i) => (
                        <tr key={rec.id || i} className="hover:bg-white/5 transition-colors group">
                          <td className="py-4 text-white font-medium">{rec.recorded_at ? new Date(rec.recorded_at).toLocaleDateString() : '--'}</td>
                          <td className="py-4 text-on-surface-variant">{rec.glucose_period || '--'}</td>
                          <td className="py-4">
                            <span className={`font-semibold ${rec.blood_sugar && rec.blood_sugar > 140 ? 'text-secondary' : 'text-tertiary'}`}>
                              {rec.blood_sugar ? `${rec.blood_sugar} mg/dL` : '--'}
                            </span>
                          </td>
                          <td className="py-4 text-on-surface-variant hidden md:table-cell">
                            {rec.notes || '--'}
                            <div className="flex gap-2 mt-2 opacity-80 group-hover:opacity-100">
                              <button
                                title="Edit"
                                className="p-1 rounded hover:bg-tertiary/10 text-tertiary"
                                onClick={() => { setEditRecord(rec); setModalOpen(true) }}
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                title="Delete"
                                className="p-1 rounded hover:bg-red-500/10 text-red-400"
                                disabled={deleteLoadingId === rec.id}
                                onClick={async () => {
                                  if (!window.confirm('Delete this health record?')) return
                                  setDeleteLoadingId(rec.id)
                                  try {
                                    await API.delete(`/health-record/delete/${rec.id}`)
                                    setRecords(prev => prev.filter(r => r.id !== rec.id))
                                    setToast("Health record deleted.")
                                    fetchRecords()
                                    setTimeout(() => setToast("") , 2000)
                                  } catch (err) {
                                    setToast("Failed to delete record.")
                                  } finally {
                                    setDeleteLoadingId(null)
                                  }
                                }}
                              >
                                {deleteLoadingId === rec.id ? (
                                  <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-[18px] text-white font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">biotech</span>
              Laboratory Results
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    <th className="pb-3">ID Code</th>
                    <th className="pb-3">Laboratory Assessment</th>
                    <th className="pb-3">Clinical Date</th>
                    <th className="pb-3 hidden md:table-cell">Ordering Provider</th>
                    <th className="pb-3">File Reference</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[14px]">
                  {labReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-on-surface-variant font-mono">{rep.id}</td>
                      <td className="py-4 text-white font-medium">{rep.name}</td>
                      <td className="py-4 text-on-surface-variant">{rep.date}</td>
                      <td className="py-4 text-on-surface-variant hidden md:table-cell">{rep.orderedBy}</td>
                      <td className="py-4 font-mono text-[12px] text-tertiary">{rep.file}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => alert(`Downloading ${rep.file}...`)}
                          className="p-1 hover:text-tertiary text-on-surface-variant transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'meds' && (
          <div className="glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-[18px] text-white font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">medication</span>
              Pharmacological Meds Management
            </h3>

            <div className="space-y-4">
              {prescriptions.map((rx, i) => (
                <div key={i} className="border border-white/5 bg-surface-container-lowest/30 p-unit-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-headline-md text-white text-[16px] font-bold">{rx.name}</span>
                      <span className={`font-label-md text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${rx.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-on-surface-variant opacity-50'}`}>
                        {rx.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-[13px] mb-1">Dosage: <span className="text-white font-medium">{rx.dosage}</span></p>
                    <p className="font-body-sm text-on-surface-variant text-[13px]">{rx.route} • {rx.duration}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-label-md text-on-surface-variant text-[10px] uppercase">Prescription RX</span>
                    <span className="font-label-md text-white font-mono text-[13px]">{rx.rxNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
