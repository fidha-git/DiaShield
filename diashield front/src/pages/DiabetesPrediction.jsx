import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../services/api"
import { AIHealthcareIllustration } from "../components/Illustrations"

function AnimatedCounter({ target, suffix = "" }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const duration = 1200
    const steps = 60
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setValue(target)
        clearInterval(interval)
      } else {
        setValue(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [target])

  return (
    <span>
      {value}
      {suffix}
    </span>
  )
}

const FIELDS = [
  {
    name: "pregnancies",
    label: "Pregnancies",
    icon: "pregnant_woman",
    step: 1,
    placeholder: "0"
  },
  {
    name: "glucose",
    label: "Glucose Level (mg/dL)",
    icon: "bloodtype",
    step: 1,
    placeholder: "120"
  },
  {
    name: "blood_pressure",
    label: "Blood Pressure (mm Hg)",
    icon: "favorite",
    step: 1,
    placeholder: "80"
  },
  {
    name: "skin_thickness",
    label: "Skin Thickness (mm)",
    icon: "straighten",
    step: 1,
    placeholder: "20"
  },
  {
    name: "insulin",
    label: "Insulin Level (IU/mL)",
    icon: "syringe",
    step: 1,
    placeholder: "85"
  },
  {
    name: "bmi",
    label: "BMI (kg/m²)",
    icon: "monitoring",
    step: 0.1,
    placeholder: "24.0"
  },
  {
    name: "diabetes_pedigree",
    label: "Diabetes Pedigree",
    icon: "genetics",
    step: 0.01,
    placeholder: "0.45"
  },
  {
    name: "age",
    label: "Age (Years)",
    icon: "calendar_today",
    step: 1,
    placeholder: "45"
  }
]

export default function DiabetesPrediction() {
  const [formData, setFormData] = useState({
    pregnancies: 2,
    glucose: 112,
    blood_pressure: 76,
    skin_thickness: 20,
    insulin: 85,
    bmi: 24.2,
    diabetes_pedigree: 0.45,
    age: 45
  })
  const [loading, setLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState({
    prediction: "Negative",
    confidence: 0.15,
    confidenceScore: 15
  })
  const [hasPredicted, setHasPredicted] = useState(false)

  const parseNumericValue = (value) => {
    if (value == null) return null
    const raw = Number(String(value).replace("%", "").trim())
    return Number.isFinite(raw) ? raw : null
  }

  const toPercentValue = (value) => {
    if (value == null) return null
    // Accept both [0,1] probability and [0,100] percentage payloads.
    const percent = value <= 1 ? value * 100 : value
    return Math.min(100, Math.max(0, percent))
  }

  const extractConfidenceScore = (data) => {
    const candidates = [
      data?.confidenceScore,
      data?.confidence_score,
      data?.riskPercentage,
      data?.risk_percentage,
      data?.predictionScore,
      data?.prediction_score,
      data?.risk_probability,
      data?.probability,
      data?.confidence
    ]

    for (const candidate of candidates) {
      const numeric = parseNumericValue(candidate)
      if (numeric == null) continue
      const percent = toPercentValue(numeric)
      if (percent != null) return percent
    }

    return 0
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePredict = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Please login first")
        return
      }
      const response = await API.post(
        "/predict",
        {
          pregnancies: Number(formData.pregnancies),
          glucose: Number(formData.glucose),
          blood_pressure: Number(formData.blood_pressure),
          skin_thickness: Number(formData.skin_thickness),
          insulin: Number(formData.insulin),
          bmi: Number(formData.bmi),
          diabetes_pedigree: Number(formData.diabetes_pedigree),
          age: Number(formData.age)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = response.data
      const confidenceScore = extractConfidenceScore(data)
      const gaugeValue = confidenceScore

      console.log("Prediction API Response:", data)
      console.log("Confidence Score:", confidenceScore)
      console.log("Gauge Value:", gaugeValue)

      setPredictionResult({
        ...data,
        confidenceScore,
        confidence: confidenceScore / 100
      })
      setHasPredicted(true)

      const risk = Math.round(confidenceScore)
      const riskLevel =
        risk < 20 ? "Low Risk" : risk < 50 ? "Moderate Risk" : "High Risk"

      await API.post(
        "/prediction-history/create",
        {
          prediction_result: data.prediction || "Negative",
          risk_level: riskLevel,
          probability: confidenceScore / 100
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (error) {
      console.log("Error:", error.response?.data || error)
      alert(error.response?.data?.detail || "Prediction failed")
    } finally {
      setLoading(false)
    }
  }

  const confidenceScore = extractConfidenceScore(predictionResult)
  const gaugeValue = hasPredicted ? Math.round(confidenceScore) : 0

  const riskMeta =
    gaugeValue < 20
      ? { label: "Low Risk", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", bar: "bg-gradient-to-r from-emerald-400 to-emerald-500" }
      : gaugeValue < 50
      ? { label: "Moderate Risk", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", bar: "bg-gradient-to-r from-amber-400 to-amber-500" }
      : { label: "High Risk", color: "text-red-500", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-500", bar: "bg-gradient-to-r from-red-400 to-red-500" }

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-cyan-50" />
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/30 to-cyan-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-blue-200/20 to-sky-200/30 rounded-full blur-[120px]" />
      </div>

      <div className="page-container">
        {/* ── Hero Section ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent border border-sky-100/80 p-8 md:p-10 mb-10 shadow-lg shadow-sky-200/20">
          {/* Animated gradient orbs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-sky-300/20 to-cyan-300/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-blue-300/15 to-sky-300/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              {/* AI Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-200/50 mb-4 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-sky-600">AI-Powered Analysis</span>
              </div>

              <h1 className="hero-title text-4xl sm:text-5xl leading-[1.1]">
                Diabetes<br />
                <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">Risk Assessment</span>
              </h1>

              <p className="hero-subtitle mt-4 text-base sm:text-lg max-w-xl">
                Enter your clinical metrics below and let our machine learning model assess your diabetes risk profile with real-time analysis.
              </p>
            </div>

            <div className="hidden lg:block w-72 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-cyan-400/10 rounded-full blur-3xl" />
                <AIHealthcareIllustration className="w-full h-auto relative z-10 drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT: Input Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-[#0F172A]/85 backdrop-blur-xl border border-sky-100/80 rounded-3xl shadow-xl shadow-sky-200/20 overflow-hidden">
              {/* Gradient Header */}
              <div className="relative bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJhIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
                <div className="relative flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/90 text-2xl">biotech</span>
                  <div>
                    <h2 className="hero-title text-lg">Clinical Parameters</h2>
                    <p className="hero-subtitle text-sm">Enter your health metrics for AI analysis</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map((field) => (
                  <div
                    key={field.name}
                    className="group relative bg-white dark:bg-[#0F172A]/90 rounded-xl border border-sky-100/70 p-4 transition-all duration-200 hover:border-sky-200 hover:shadow-md hover:shadow-sky-100/50"
                  >
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      <span className="material-symbols-outlined text-sky-500 text-[16px]">{field.icon}</span>
                      {field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      step={field.step}
                      placeholder={field.placeholder}
                      className="w-full bg-transparent text-slate-900 dark:text-slate-100 font-medium text-base outline-none border-b-2 border-sky-100 pb-1.5 focus:border-sky-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-sky-500 to-cyan-500 p-[1px] shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <div className="relative flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-500 to-cyan-500 px-6 py-3.5">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-white font-semibold text-base">Analyzing your data...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-white text-xl">rocket_launch</span>
                        <span className="text-white font-semibold text-base">Run AI Prediction</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results Panel ── */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-[#0F172A]/85 backdrop-blur-xl border border-sky-100/80 rounded-3xl shadow-xl shadow-sky-200/20 p-8 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-200">
                  <span className="material-symbols-outlined text-white text-lg">analytics</span>
                </span>
                <div>
                  <h2 className="card-title text-lg">AI Prediction Result</h2>
                  <p className="text-xs text-muted">Based on your clinical parameters</p>
                </div>
              </div>

              {/* Percentage */}
              <div className="text-center py-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(gaugeValue / 100) * 327} 327`}
                      className={`transition-all duration-1000 ease-out ${riskMeta.color}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {hasPredicted ? (
                        <AnimatedCounter key={gaugeValue} target={gaugeValue} suffix="%" />
                      ) : (
                        "-%"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className="flex justify-center mb-6">
                <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${riskMeta.bg} ${riskMeta.color} ${riskMeta.border} border`}>
                  <span className={`w-2 h-2 rounded-full ${riskMeta.badge} animate-pulse`} />
                  {riskMeta.label}
                </span>
              </div>

              {/* Confidence Bar */}
              <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Confidence Score</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {hasPredicted
                      ? confidenceScore.toFixed(1) + "%"
                      : "—"}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${riskMeta.bar}`}
                    style={{ width: hasPredicted ? `${gaugeValue}%` : "0%" }}
                  />
                </div>
              </div>

              {/* Prediction Text */}
              <div className={`flex-1 rounded-2xl border p-5 ${riskMeta.bg} ${riskMeta.border} mb-6`}>
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined ${riskMeta.color} text-2xl mt-0.5`}>
                    {gaugeValue < 20 ? "check_circle" : gaugeValue < 50 ? "info" : "warning"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prediction Outcome</p>
                    <p className={`text-lg font-bold mt-0.5 ${riskMeta.color}`}>
                      {predictionResult.prediction}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {gaugeValue < 20
                        ? "Your risk profile appears favorable. Continue maintaining a healthy lifestyle."
                        : gaugeValue < 50
                        ? "Moderate indicators detected. Consider consulting a healthcare professional."
                        : "Elevated risk indicators identified. We strongly recommend immediate medical consultation."}
                    </p>
                  </div>
                </div>
              </div>

              {/* History Link */}
              <Link
                to="/history"
                className="group flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-sky-100 text-sky-600 text-sm font-semibold transition-all duration-200 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-200 hover:shadow-sm"
              >
                <span className="material-symbols-outlined text-lg group-hover:translate-x-[-2px] transition-transform">history</span>
                View Prediction History
                <span className="material-symbols-outlined text-lg group-hover:translate-x-[2px] transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
