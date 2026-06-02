import React, { useState, useEffect } from 'react'
import API from '../services/api'
import { EmptyHealthRecords, AIHealthcareIllustration } from '../components/Illustrations'

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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setError('')
      setSuccess('')
      setSubmitting(false)
    }
  }, [open, isEdit, editRecord])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validate = () => {
    if (!form.blood_sugar || !form.blood_pressure || !form.heart_rate || !form.bmi || !form.weight) {
      setError('All required fields must be filled.')
      return false
    }
    if (isNaN(form.blood_sugar) || isNaN(form.heart_rate) || isNaN(form.bmi) || isNaN(form.weight)) {
      setError('Blood Sugar, Heart Rate, BMI, and Weight must be numeric.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setError('')
    try {
      if (isEdit && editRecord) {
        await API.put(`/health-record/update/${editRecord.id}`, form)
        setSuccess('Health record updated successfully.')
      } else {
        const patientRes = await API.get('/patient/me')
        const patientId = patientRes.data.id
        await API.post('/health-record/create', { ...form, patient_id: patientId })
        setSuccess('Health record added successfully.')
      }
      setTimeout(() => {
        setSuccess('')
        onSuccess()
        onClose()
      }, 800)
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail)
      } else {
        setError(isEdit ? 'Failed to update health record.' : 'Failed to add health record.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl border border-sky-100 shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-sky-600 text-xl">&times;</button>
        <h2 className="font-headline-md card-title mb-4">{isEdit ? 'Edit Health Record' : 'Add New Health Record'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-muted mb-1">Blood Sugar <span className="text-red-500">*</span></label>
            <input name="blood_sugar" type="number" min="0" step="any" value={form.blood_sugar} onChange={handleChange} className="w-full bg-white border border-sky-100 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label className="block font-label-md text-muted mb-1">Blood Pressure <span className="text-red-500">*</span></label>
            <input name="blood_pressure" type="text" value={form.blood_pressure} onChange={handleChange} className="w-full bg-white border border-sky-100 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500" required placeholder="e.g. 120/80" />
          </div>
          <div>
            <label className="block font-label-md text-muted mb-1">Heart Rate <span className="text-red-500">*</span></label>
            <input name="heart_rate" type="number" min="0" step="any" value={form.heart_rate} onChange={handleChange} className="w-full bg-white border border-sky-100 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label className="block font-label-md text-muted mb-1">BMI <span className="text-red-500">*</span></label>
            <input name="bmi" type="number" min="0" step="any" value={form.bmi} onChange={handleChange} className="w-full bg-white border border-sky-100 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label className="block font-label-md text-muted mb-1">Weight <span className="text-red-500">*</span></label>
            <input name="weight" type="number" min="0" step="any" value={form.weight} onChange={handleChange} className="w-full bg-white border border-sky-100 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label className="block font-label-md text-muted mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full bg-white border border-sky-100 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500" rows={2} />
          </div>
          {error && <div className="text-red-500 font-label-md text-sm">{error}</div>}
          {success && <div className="text-green-600 font-label-md text-sm">{success}</div>}
          <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded-lg font-label-md mt-2 disabled:opacity-60" disabled={submitting}>{submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Save Record')}</button>
        </form>
      </div>
    </div>
  )
}

function MetricCard({ title, value, status, date, border }) {
  return (
    <div className={`bg-white rounded-[20px] p-6 border ${border} shadow-md shadow-sky-100/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-200/60 transition-all min-h-[160px] flex flex-col justify-between`}>
      <div>
        <span className="block font-label-md text-slate-500 text-[11px] uppercase tracking-wider mb-2">{title}</span>
        <span className="font-display-lg text-[26px] md:text-[30px] font-bold text-slate-900">{value}</span>
      </div>
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-sky-100 text-[11px]">
        <span className="font-label-md opacity-80">{status}</span>
        <span className="font-label-md text-slate-500">{date ? new Date(date).toLocaleDateString() : '--'}</span>
      </div>
    </div>
  )
}

export default function HealthRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [toast, setToast] = useState('')
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)

  const fetchRecords = async () => {
    setLoading(true)
    setError('')
    try {
      const patientRes = await API.get('/patient/me')
      const patientId = patientRes.data.id
      const recRes = await API.get(`/health-record/${patientId}`)
      setRecords(Array.isArray(recRes.data) ? recRes.data : [])
    } catch {
      setError('Failed to load health records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecords() }, [])

  const sortedRecords = [...records].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
  const latestRecord = sortedRecords[0] || null

  const labReports = [
    { id: 'LAB-9923', name: 'Comprehensive Metabolic Panel (CMP)', date: 'Oct 14, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'CMP_Report_Amal.pdf' },
    { id: 'LAB-9801', name: 'Lipid Profile Assessment', date: 'Oct 14, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'Lipid_Panel_Amal.pdf' },
    { id: 'LAB-8723', name: 'Urinalysis Microalbumin Screening', date: 'Jul 05, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'Urinalysis_Screening.pdf' },
    { id: 'LAB-7489', name: 'Hemoglobin A1c (HbA1c) Panel', date: 'Jul 05, 2023', orderedBy: 'Dr. Sarah Jenkins', file: 'HbA1c_Panel_Jul.pdf' }
  ]

  const prescriptions = [
    { name: 'Metformin HCl 500mg', dosage: '1 tablet twice daily', route: 'Oral', duration: '90 Days (Refills: 2)', rxNumber: 'Rx-88231', active: true },
    { name: 'Lisinopril 5mg', dosage: '1 tablet once daily in morning', route: 'Oral', duration: '90 Days (Refills: 3)', rxNumber: 'Rx-44810', active: true },
    { name: 'Atorvastatin 10mg', dosage: '1 tablet at bedtime', route: 'Oral', duration: '90 Days (Refills: 1)', rxNumber: 'Rx-99201', active: false }
  ]

  return (
    <div className="space-y-8">
      <div className="max-w-[1400px] mx-auto p-8">
        <section className="relative overflow-hidden rounded-[24px] border border-cyan-300/25 shadow-[0_28px_80px_rgba(2,27,58,0.55)] backdrop-blur-xl p-12" style={{ background: 'linear-gradient(135deg, #021B3A 0%, #012A4A 50%, #013A63 100%)' }}>
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-[110px]" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-sky-300/15 blur-[120px]" />
          <div className="absolute top-12 left-20 h-2 w-2 rounded-full bg-cyan-200/40" />
          <div className="absolute top-24 right-44 h-2.5 w-2.5 rounded-full bg-white/30" />
          <div className="absolute bottom-20 left-1/3 h-1.5 w-1.5 rounded-full bg-cyan-100/40" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10">
            <div>
              <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div>
                  <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold text-white">Health Records</h2>
                  <p className="mt-6 text-[18px] md:text-[22px] max-w-[700px] text-white/85">Access clinical laboratory reports, medication parameters, and ongoing vital logs.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token')
                      const response = await API.get('/report/pdf', {
                        responseType: 'blob',
                        headers: { Authorization: `Bearer ${token}` }
                      })
                      const url = window.URL.createObjectURL(new Blob([response.data]))
                      const link = document.createElement('a')
                      link.href = url
                      link.setAttribute('download', `diashield_health_report_${new Date().toISOString().split('T')[0]}.pdf`)
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                      window.URL.revokeObjectURL(url)
                    } catch {
                      alert('Failed to generate PDF report. Please try again.')
                    }
                  }}
                  className="self-start whitespace-nowrap px-6 py-3 rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-400/25 to-sky-400/20 text-white font-label-md shadow-[0_12px_30px_rgba(56,189,248,0.25)] hover:shadow-[0_16px_36px_rgba(56,189,248,0.35)] hover:from-cyan-400/35 hover:to-sky-400/30 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Export Full Clinical Record
                </button>
              </header>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-[320px] h-[320px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300/20 to-sky-300/10 blur-3xl" />
                <div className="absolute top-4 right-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 shadow-lg">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/70 font-semibold">Records Synced</p>
                  <p className="text-white text-lg font-bold mt-1">24 Files</p>
                </div>
                <div className="absolute bottom-6 left-0 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 shadow-lg">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/70 font-semibold">Clinical Index</p>
                  <p className="text-white text-lg font-bold mt-1">A+</p>
                </div>
                <div className="absolute top-10 left-10 h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-300/35 to-sky-300/20 border border-cyan-100/30 flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-[28px]">description</span>
                </div>
                <AIHealthcareIllustration className="absolute bottom-0 right-0 w-[280px] h-auto drop-shadow-[0_10px_35px_rgba(56,189,248,0.25)]" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-8 text-slate-500">Loading health records...</div>
            ) : error ? (
              <div className="col-span-4 text-center py-8 text-red-600">{error}</div>
            ) : !latestRecord ? (
              <div className="col-span-4 text-center py-12">
                <EmptyHealthRecords className="w-36 h-28 mx-auto mb-4 opacity-60" />
                <p className="text-slate-500 font-medium">No health records found</p>
                <p className="text-slate-400/60 text-sm mt-1">Add your first health record to start tracking.</p>
              </div>
            ) : (
              <>
                <MetricCard title="Fasting Blood Glucose" value={latestRecord.blood_sugar ? `${latestRecord.blood_sugar} mg/dL` : '--'} status={latestRecord.blood_sugar_status || '--'} date={latestRecord.recorded_at} border="border-sky-200" />
                <MetricCard title="Blood Pressure" value={latestRecord.blood_pressure ? `${latestRecord.blood_pressure} mmHg` : '--'} status={latestRecord.blood_pressure_status || '--'} date={latestRecord.recorded_at} border="border-cyan-200" />
                <MetricCard title="Body Mass Index (BMI)" value={latestRecord.bmi ? `${latestRecord.bmi} kg/m²` : '--'} status={latestRecord.bmi_status || '--'} date={latestRecord.recorded_at} border="border-sky-100" />
                <MetricCard title="Weight" value={latestRecord.weight ? `${latestRecord.weight} kg` : '--'} status={latestRecord.weight_status || '--'} date={latestRecord.recorded_at} border="border-green-200" />
              </>
            )}
          </div>

          <div className="bg-white border border-sky-100 rounded-[20px] p-6 shadow-lg shadow-blue-200/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-[18px] card-title font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600">water_drop</span>
                Recent Blood Glucose Tracking Log
              </h3>
              <button onClick={() => { setEditRecord(null); setModalOpen(true) }} className="px-4 py-2 bg-white border border-sky-100 hover:bg-sky-50 text-slate-700 rounded-lg font-label-md text-[13px] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Add Reading
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sky-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Log Date</th>
                    <th className="pb-3">Measurement Window</th>
                    <th className="pb-3">Clinical Value</th>
                    <th className="pb-3 hidden md:table-cell">Clinician Annotations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-[14px]">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-6 text-slate-500">Loading health records...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={4} className="text-center py-6 text-red-600">{error}</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12"><EmptyHealthRecords className="w-28 h-24 mx-auto mb-3 opacity-60" /><p className="text-slate-500">No health records found</p></td></tr>
                  ) : (
                    sortedRecords.map((rec, i) => (
                      <tr key={rec.id || i} className="hover:bg-sky-50 transition-colors group">
                        <td className="py-4 text-slate-900 font-medium">{rec.recorded_at ? new Date(rec.recorded_at).toLocaleDateString() : '--'}</td>
                        <td className="py-4 text-slate-500">{rec.glucose_period || '--'}</td>
                        <td className="py-4"><span className={`font-semibold ${rec.blood_sugar && rec.blood_sugar > 140 ? 'text-cyan-500' : 'text-sky-600'}`}>{rec.blood_sugar ? `${rec.blood_sugar} mg/dL` : '--'}</span></td>
                        <td className="py-4 text-slate-500 hidden md:table-cell">
                          {rec.notes || '--'}
                          <div className="flex gap-2 mt-2 opacity-80 group-hover:opacity-100">
                            <button title="Edit" className="p-1 rounded hover:bg-sky-50 text-sky-600" onClick={() => { setEditRecord(rec); setModalOpen(true) }}><span className="material-symbols-outlined text-[18px]">edit</span></button>
                            <button
                              title="Delete"
                              className="p-1 rounded hover:bg-red-50 text-red-600"
                              disabled={deleteLoadingId === rec.id}
                              onClick={async () => {
                                if (!window.confirm('Delete this health record?')) return
                                setDeleteLoadingId(rec.id)
                                try {
                                  await API.delete(`/health-record/delete/${rec.id}`)
                                  setRecords((prev) => prev.filter((r) => r.id !== rec.id))
                                  setToast('Health record deleted.')
                                  fetchRecords()
                                  setTimeout(() => setToast(''), 2000)
                                } catch {
                                  setToast('Failed to delete record.')
                                } finally {
                                  setDeleteLoadingId(null)
                                }
                              }}
                            >
                              {deleteLoadingId === rec.id ? <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> : <span className="material-symbols-outlined text-[18px]">delete</span>}
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

          <div className="mt-10 bg-white border border-sky-100 rounded-[20px] p-6 shadow-lg shadow-blue-200/30">
            <h3 className="font-headline-md text-[18px] card-title font-semibold mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-cyan-500">biotech</span>Laboratory Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sky-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">ID Code</th>
                    <th className="pb-3">Laboratory Assessment</th>
                    <th className="pb-3">Clinical Date</th>
                    <th className="pb-3 hidden md:table-cell">Ordering Provider</th>
                    <th className="pb-3">File Reference</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-[14px]">
                  {labReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-sky-50 transition-colors">
                      <td className="py-4 text-slate-500 font-mono">{rep.id}</td>
                      <td className="py-4 text-slate-900 font-medium">{rep.name}</td>
                      <td className="py-4 text-slate-500">{rep.date}</td>
                      <td className="py-4 text-slate-500 hidden md:table-cell">{rep.orderedBy}</td>
                      <td className="py-4 font-mono text-[12px] text-sky-600">{rep.file}</td>
                      <td className="py-4 text-right"><button onClick={() => alert(`Downloading ${rep.file}...`)} className="p-1 hover:text-sky-500 text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">download</span></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 bg-white border border-sky-100 rounded-[20px] p-6 shadow-lg shadow-blue-200/30">
            <h3 className="font-headline-md text-[18px] card-title font-semibold mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-cyan-500">medication</span>Pharmacological Meds Management</h3>
            <div className="space-y-4">
              {prescriptions.map((rx, i) => (
                <div key={i} className="border border-sky-100 bg-[#F0F9FF] p-unit-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-headline-md card-title text-[16px] font-bold">{rx.name}</span>
                      <span className={`font-label-md text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${rx.active ? 'bg-green-50 text-green-600' : 'bg-sky-100 text-slate-400 opacity-50'}`}>{rx.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="font-body-sm text-slate-500 text-[13px] mb-1">Dosage: <span className="text-slate-900 font-medium">{rx.dosage}</span></p>
                    <p className="font-body-sm text-slate-500 text-[13px]">{rx.route} • {rx.duration}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-label-md text-slate-500 text-[10px] uppercase">Prescription RX</span>
                    <span className="font-label-md text-slate-900 font-mono text-[13px]">{rx.rxNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AddReadingModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditRecord(null) }}
          onSuccess={() => {
            setToast(editRecord ? 'Health record updated successfully.' : 'Health record added successfully.')
            fetchRecords()
            setTimeout(() => setToast(''), 2000)
          }}
          editRecord={editRecord}
        />

        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-label-md animate-fade-in">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
