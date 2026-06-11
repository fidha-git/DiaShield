import React, { useEffect, useState } from "react";
import API from "../services/api";
import { formatRisk } from "../utils/formatRisk";

const METRICS = [
  { key: "glucose", label: "Glucose", unit: "mg/dL", icon: "bloodtype" },
  { key: "bmi", label: "BMI", unit: "kg/m²", icon: "monitoring" },
  { key: "blood_pressure", label: "Blood Pressure", unit: "mm Hg", icon: "favorite" },
  { key: "age", label: "Age", unit: "years", icon: "calendar_today" },
  { key: "pregnancies", label: "Pregnancies", unit: "", icon: "pregnant_woman" },
  { key: "skin_thickness", label: "Skin Thickness", unit: "mm", icon: "straighten" },
  { key: "insulin", label: "Insulin", unit: "IU/mL", icon: "syringe" },
  { key: "diabetes_pedigree", label: "Diabetes Pedigree", unit: "", icon: "genetics" },
];

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setError(null);
    try {
      const response = await API.get("/prediction-history");
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load prediction history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-sky-100 rounded-lg" />
            <div className="h-4 w-96 bg-sky-100 rounded-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-sky-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Prediction History</h1>
          <p className="text-slate-400 dark:text-slate-500 mt-2 text-base">Your past diabetes risk assessments and AI analysis results.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 dark:text-red-400">error</span>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-blue-200/30">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">query_stats</span>
            <p className="text-slate-400 dark:text-slate-500 text-base font-medium">No predictions yet</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete a risk assessment to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {history.map((item, index) => {
              const risk = formatRisk(item.probability || 0);
              const isPositive = item.prediction_result === "Positive" || item.prediction_result === "1" || item.prediction_result === 1;
              const isHigh = item.risk_level === "High";
              const isModerate = item.risk_level === "Moderate";
              const hasMetrics = METRICS.some(m => item[m.key] != null);
              return (
                <div
                  key={item.id || index}
                  className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-blue-200/30 dark:shadow-none transition-all duration-200 hover:shadow-xl hover:border-sky-200"
                >
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isHigh ? "bg-red-50 dark:bg-red-900/20" : isModerate ? "bg-amber-50 dark:bg-amber-900/20" : "bg-green-50 dark:bg-green-900/20"
                    }`}>
                      <span className={`material-symbols-outlined text-2xl ${
                        isHigh ? "text-red-500 dark:text-red-400" : isModerate ? "text-amber-500 dark:text-amber-400" : "text-green-500 dark:text-green-400"
                      }`}>neurology</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {isPositive ? "Diabetes Risk Detected" : "No Diabetes Risk Detected"}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {new Date(item.created_at).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            isHigh ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : isModerate ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          }`}>
                            {item.risk_level || "Unknown"}
                          </span>
                          <span className="text-2xl font-bold text-sky-600">{risk}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input metrics grid */}
                  {hasMetrics && (
                    <div className="border-t border-sky-100 dark:border-slate-700/30 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {METRICS.map((m) => {
                          const val = item[m.key];
                          if (val == null) return null;
                          return (
                            <div key={m.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50/50 dark:bg-sky-900/10">
                              <span className="material-symbols-outlined text-sky-500 text-[16px] shrink-0">{m.icon}</span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{m.label}</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {typeof val === "number" ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}
                                  {m.unit ? <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">{m.unit}</span> : null}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Top Factors (Explainability) */}
                  {item.top_factors && item.top_factors.length > 0 && (
                    <div className="border-t border-sky-100 dark:border-slate-700/30 pt-3 mt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">insights</span>
                        Why this prediction?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.top_factors.slice(0, 5).map((f, i) => {
                          const up = f.direction === "Increase Risk";
                          const color = up
                            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
                            : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30";
                          return (
                            <span key={i}
                              className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-semibold border ${color}`}
                            >
                              <span className="material-symbols-outlined text-[12px]">{up ? "arrow_upward" : "arrow_downward"}</span>
                              {f.feature === "BloodPressure" ? "Blood Pressure"
                                : f.feature === "DiabetesPedigreeFunction" ? "Diabetes Pedigree"
                                : f.feature === "SkinThickness" ? "Skin Thickness"
                                : f.feature}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
