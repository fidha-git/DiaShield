import React, { useState } from 'react'

export default function HealthRecords() {
  const [activeTab, setActiveTab] = useState('vitals')

  const vitals = [
    { name: 'Fasting Blood Glucose', value: '112 mg/dL', date: 'Oct 24, 2023', status: 'Near Optimal', color: 'text-tertiary border-tertiary/20 bg-tertiary/5' },
    { name: 'HbA1c Level', value: '6.2 %', date: 'Oct 14, 2023', status: 'Stable (Controlled)', color: 'text-secondary border-secondary/20 bg-secondary/5' },
    { name: 'Systolic/Diastolic BP', value: '118/76 mmHg', date: 'Oct 24, 2023', status: 'Optimal', color: 'text-green-400 border-green-500/20 bg-green-500/5' },
    { name: 'Body Mass Index (BMI)', value: '24.2 kg/m²', date: 'Oct 14, 2023', status: 'Normal Weight', color: 'text-white border-white/10 bg-white/5' }
  ]

  const glucoseLogs = [
    { date: 'Oct 24, 2023', period: 'Fasting', value: '112 mg/dL', notes: 'Excellent preprandial baseline.' },
    { date: 'Oct 23, 2023', period: '2hr Postprandial', value: '138 mg/dL', notes: 'Lunch: Whole wheat wrap and salad.' },
    { date: 'Oct 23, 2023', period: 'Fasting', value: '109 mg/dL', notes: 'Normal fasting glucose.' },
    { date: 'Oct 22, 2023', period: '2hr Postprandial', value: '144 mg/dL', notes: 'Dinner: Italian soup, slightly elevated.' },
    { date: 'Oct 22, 2023', period: 'Fasting', value: '115 mg/dL', notes: 'Stable.' }
  ]

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
              {vitals.map((vit, i) => (
                <div key={i} className={`glass-card rounded-xl p-unit-4 border flex flex-col justify-between min-h-[140px] ${vit.color}`}>
                  <div>
                    <span className="block font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider mb-2">{vit.name}</span>
                    <span className="font-display-lg text-[26px] md:text-[30px] font-bold text-white">{vit.value}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/5 text-[11px]">
                    <span className="font-label-md opacity-80">{vit.status}</span>
                    <span className="font-label-md text-on-surface-variant">{vit.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Blood Glucose Log */}
            <div className="glass-card rounded-xl p-unit-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-[18px] text-white font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">water_drop</span>
                  Recent Blood Glucose Tracking Log
                </h3>
                <button 
                  onClick={() => alert('New Record: Fasting Blood Glucose form loaded.')}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface rounded-lg font-label-md text-[13px] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Reading
                </button>
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
                    {glucoseLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 text-white font-medium">{log.date}</td>
                        <td className="py-4 text-on-surface-variant">{log.period}</td>
                        <td className="py-4">
                          <span className={`font-semibold ${log.value.includes('144') ? 'text-secondary' : 'text-tertiary'}`}>
                            {log.value}
                          </span>
                        </td>
                        <td className="py-4 text-on-surface-variant hidden md:table-cell">{log.notes}</td>
                      </tr>
                    ))}
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
