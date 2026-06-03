import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await API.get("/prediction-history");
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
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
              <div key={i} className="h-28 bg-sky-100 rounded-2xl" />
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

        {history.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0F172A]/90 border border-sky-100 rounded-2xl shadow-lg shadow-blue-200/30">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">query_stats</span>
            <p className="text-slate-400 dark:text-slate-500 text-base font-medium">No predictions yet</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete a risk assessment to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {history.map((item, index) => {
              const risk = Math.round((item.probability || 0) * 100);
              const isPositive = item.prediction_result === "Positive" || item.prediction_result === "1" || item.prediction_result === 1;
              const isHigh = item.risk_level === "High";
              const isModerate = item.risk_level === "Moderate";
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0F172A]/90 border border-sky-100 rounded-2xl p-6 shadow-lg shadow-blue-200/30 transition-all duration-200 hover:shadow-xl hover:border-sky-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      isHigh ? "bg-red-50 dark:bg-red-900/20" : isModerate ? "bg-amber-50 dark:bg-amber-900/20" : "bg-green-50 dark:bg-green-900/20"
                    }`}>
                      <span className={`material-symbols-outlined text-2xl ${
                        isHigh ? "text-red-500 dark:text-red-400" : isModerate ? "text-amber-500 dark:text-amber-400" : "text-green-500 dark:text-green-400"
                      }`}>neurology</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            isHigh ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : isModerate ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          }`}>
                            {item.risk_level || "Unknown"}
                          </span>
                          <span className="text-2xl font-bold text-sky-600">{risk}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

