import React from 'react'

export default function MedicalHistory() {
  const conditions = [
    { title: 'Type 2 Diabetes Mellitus', code: 'ICD-10 E11.9', diagnosed: 'June 2018', status: 'Active', severity: 'Controlled', notes: 'Managed with Metformin, low glycemic diet, and light exercise.' },
    { title: 'Essential Hypertension', code: 'ICD-10 I10', diagnosed: 'March 2020', status: 'Active', severity: 'Mild', notes: 'Under daily monitoring, stable readings under pharmacological control.' }
  ]

  const timelineEvents = [
    { date: 'Oct 14, 2023', title: 'Consultation with Endocrinologist', description: 'Regular quarterly checkup with Dr. Sarah Jenkins. HbA1c remains steady at 6.2%. Meds unchanged.', icon: 'medical_services', type: 'clinical' },
    { date: 'Jul 05, 2023', title: 'Laboratory Lab Panel Results', description: 'Comprehensive renal, metabolic, and liver profiles completed. All metrics stable. Normal range.', icon: 'biotech', type: 'lab' },
    { date: 'Dec 12, 2021', title: 'Pharmacology Dosage Adjustments', description: 'Metformin hydrochloride elevated to 1000mg daily to stabilize postprandial blood glucose trends.', icon: 'medication', type: 'prescription' },
    { date: 'Jun 22, 2018', title: 'Initial Chronic Diabetes Diagnosis', description: 'Officially diagnosed by Dr. Jenkins after blood screening showed fasting glucose levels at 138 mg/dL.', icon: 'error', type: 'alert' }
  ]

  const familyHistory = [
    { relative: 'Father', condition: 'Type 2 Diabetes Mellitus', ageOnset: '52 years old', status: 'Living (Stable)' },
    { relative: 'Mother', condition: 'Essential Hypertension', ageOnset: '48 years old', status: 'Living (Stable)' },
    { relative: 'Maternal Grandmother', condition: 'Ischemic Stroke history', ageOnset: '67 years old', status: 'Deceased' }
  ]

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {/* Header */}
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Medical History</h2>
          <p className="font-body-md text-on-surface-variant mt-1">A chronologically verified summary of chronic diagnoses, surgeries, and family medical background.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-6">
          {/* Timeline & Conditions - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-unit-6">
            {/* Chronic Conditions */}
            <div className="glass-card rounded-xl p-unit-6">
              <h3 className="font-headline-md text-[18px] text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">assignment_late</span>
                Active Chronic Conditions
              </h3>
              
              <div className="space-y-4">
                {conditions.map((cond, i) => (
                  <div key={i} className="border border-white/5 bg-surface-container-lowest/30 p-unit-4 rounded-lg flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-headline-md text-white text-[16px] font-bold">{cond.title}</span>
                        <span className="font-label-md text-[10px] bg-white/5 border border-white/10 text-on-surface-variant px-2 py-0.5 rounded-full">{cond.code}</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant text-[13px] mb-3">Diagnosed: <span className="text-white font-medium">{cond.diagnosed}</span></p>
                      <p className="font-body-sm text-on-surface-variant text-[13px] italic">{cond.notes}</p>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                      <span className="font-label-md text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">{cond.status}</span>
                      <span className="font-label-md text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-tertiary/20 text-tertiary border border-tertiary/30 rounded-full">{cond.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Timeline */}
            <div className="glass-card rounded-xl p-unit-6">
              <h3 className="font-headline-md text-[18px] text-white font-semibold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">history_edu</span>
                Clinical Care Timeline
              </h3>
              
              <div className="relative border-l border-white/10 pl-6 ml-4 space-y-6">
                {timelineEvents.map((evt, i) => (
                  <div key={i} className="relative group">
                    {/* Glowing point */}
                    <div className="absolute -left-[35px] top-1.5 w-[18px] h-[18px] rounded-full bg-surface-dim border border-white/20 flex items-center justify-center group-hover:border-tertiary transition-colors">
                      <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    </div>
                    
                    <div className="glass-card bg-surface-container-lowest/20 rounded-lg p-unit-4 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                        <span className="font-label-md text-on-surface-variant text-[10px] tracking-wider font-semibold uppercase">{evt.date}</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">{evt.icon}</span>
                      </div>
                      <h4 className="font-headline-md text-white text-[15px] font-bold mb-1">{evt.title}</h4>
                      <p className="font-body-sm text-on-surface-variant text-[13px] leading-relaxed">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Family History & Lifestyle */}
          <div className="space-y-unit-6">
            {/* Family Medical history */}
            <div className="glass-card rounded-xl p-unit-6">
              <h3 className="font-headline-md text-[18px] text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">family_history</span>
                Family Background
              </h3>
              
              <div className="space-y-4">
                {familyHistory.map((fam, i) => (
                  <div key={i} className="border border-white/5 bg-surface-container-low/40 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-headline-md text-white text-[14px] font-bold">{fam.relative}</span>
                      <span className="font-label-md text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-full">{fam.status}</span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-[12px]">{fam.condition}</p>
                    <p className="font-body-sm text-on-surface-variant text-[10px] opacity-75 mt-1">Onset Age: {fam.ageOnset}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Parameters */}
            <div className="glass-card rounded-xl p-unit-6">
              <h3 className="font-headline-md text-[18px] text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">spa</span>
                Lifestyle Parameters
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low/40 border border-white/5 p-3 rounded-lg">
                  <span className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Tobacco Use</span>
                  <span className="font-headline-md text-white text-[14px] font-semibold">Never Used</span>
                </div>
                <div className="bg-surface-container-low/40 border border-white/5 p-3 rounded-lg">
                  <span className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Alcohol Consumption</span>
                  <span className="font-headline-md text-white text-[14px] font-semibold">Occasional</span>
                </div>
                <div className="bg-surface-container-low/40 border border-white/5 p-3 rounded-lg col-span-2">
                  <span className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Nutrition Plan</span>
                  <span className="font-headline-md text-tertiary text-[14px] font-semibold">Low Glycemic Index Diet</span>
                </div>
                <div className="bg-surface-container-low/40 border border-white/5 p-3 rounded-lg col-span-2">
                  <span className="block font-label-md text-on-surface-variant text-[10px] uppercase mb-1">Physical Activity</span>
                  <span className="font-headline-md text-white text-[14px] font-semibold">Moderate, 3x per week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
