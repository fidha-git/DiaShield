import React, { useEffect, useState } from "react";
import { fetchAdminPredictions } from "../services/adminService";

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminPredictions();
        const data = res.data;
        setPredictions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load predictions", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Predictions</h2>
          <p className="font-body-md text-on-surface-variant mt-1">All diabetes predictions made on the platform.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant font-headline-md">Loading predictions...</span>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Patient ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Result</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Risk Level</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Probability</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-md">
                        No predictions found
                      </td>
                    </tr>
                  ) : (
                    predictions.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-body-md text-on-surface">{p.id}</td>
                        <td className="p-4 font-body-md text-on-surface">{p.patient_id}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-label-md ${
                            p.prediction_result === "Positive" || p.prediction_result === "1" || p.prediction_result === 1
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {p.prediction_result}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-label-md ${
                            p.risk_level === "High" ? "bg-red-500/20 text-red-400" :
                            p.risk_level === "Moderate" ? "bg-amber-500/20 text-amber-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {p.risk_level}
                          </span>
                        </td>
                        <td className="p-4 font-body-md text-on-surface">
                          {p.probability != null ? `${Math.round(p.probability)}%` : 'N/A'}
                        </td>
                        <td className="p-4 font-body-sm text-on-surface-variant">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
