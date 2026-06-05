import React, { useEffect, useMemo, useState } from "react";
import { formatRisk } from "../utils/formatRisk";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import { fetchAdminPredictions, fetchAdminUsers } from "../services/adminService";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  AdminInput,
  AdminSelect,
  AdminButton,
  Badge,
  EmptyCard,
  MetricCard,
  AdminToast,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";

const RISK_COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

function toRiskTone(risk = "") {
  const v = risk.toLowerCase();
  if (v.includes("high")) return "rose";
  if (v.includes("moderate") || v.includes("medium")) return "amber";
  if (v.includes("low")) return "emerald";
  return "slate";
}

function safeProbability(prob) {
  const n = Number(prob);
  if (Number.isNaN(n)) return 0;
  if (n <= 1) return Math.round(n * 100);
  return Math.round(n);
}

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [predRes, usersRes] = await Promise.all([
          fetchAdminPredictions(),
          fetchAdminUsers(),
        ]);
        setPredictions(Array.isArray(predRes.data) ? predRes.data : []);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch {
        setToast({ type: "error", message: "Failed to load prediction data" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const enriched = useMemo(
    () =>
      predictions.map((p) => ({
        ...p,
        probabilityPct: safeProbability(p.probability),
        risk: p.risk_level || "Unknown",
        resultLabel:
          p.prediction_result === 1 ||
          p.prediction_result === "1" ||
          String(p.prediction_result).toLowerCase() === "positive"
            ? "Positive"
            : "Negative",
      })),
    [predictions]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enriched.filter((p) => {
      const user = userMap.get(p.patient_id);
      const text = `${user?.username || ""} ${user?.email || ""} ${p.patient_id}`.toLowerCase();
      const matchesSearch = !q || text.includes(q);
      const matchesRisk = riskFilter === "all" || (p.risk || "").toLowerCase() === riskFilter;
      const matchesResult = resultFilter === "all" || p.resultLabel.toLowerCase() === resultFilter;
      return matchesSearch && matchesRisk && matchesResult;
    });
  }, [enriched, search, riskFilter, resultFilter, userMap]);

  const riskDistribution = useMemo(() => {
    const low = filtered.filter((p) => (p.risk || "").toLowerCase().includes("low")).length;
    const moderate = filtered.filter((p) => (p.risk || "").toLowerCase().includes("moderate") || (p.risk || "").toLowerCase().includes("medium")).length;
    const high = filtered.filter((p) => (p.risk || "").toLowerCase().includes("high")).length;

    return [
      { name: "Low", value: low },
      { name: "Moderate", value: moderate },
      { name: "High", value: high },
    ];
  }, [filtered]);

  const resultDistribution = useMemo(() => {
    const positive = filtered.filter((p) => p.resultLabel === "Positive").length;
    const negative = filtered.filter((p) => p.resultLabel === "Negative").length;
    return [
      { name: "Positive", count: positive },
      { name: "Negative", count: negative },
    ];
  }, [filtered]);

  const usageByMonth = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      const d = p.created_at ? new Date(p.created_at) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      if (!map.has(key)) map.set(key, { month: label, count: 0, highRisk: 0 });
      const bucket = map.get(key);
      bucket.count += 1;
      if ((p.risk || "").toLowerCase().includes("high")) bucket.highRisk += 1;
    });
    return Array.from(map.values());
  }, [filtered]);

  const highRiskPatients = useMemo(
    () => filtered.filter((p) => (p.risk || "").toLowerCase().includes("high")).sort((a, b) => b.probabilityPct - a.probabilityPct).slice(0, 8),
    [filtered]
  );

  const stats = useMemo(() => ({
    total: filtered.length,
    avgProbability: filtered.length ? Math.round(filtered.reduce((sum, p) => sum + p.probabilityPct, 0) / filtered.length) : 0,
    highRisk: highRiskPatients.length,
    modelConfidence: filtered.length ? Math.min(99, Math.max(60, Math.round(100 - filtered.reduce((sum, p) => sum + Math.abs(50 - p.probabilityPct), 0) / filtered.length / 2))) : 0,
  }), [filtered, highRiskPatients.length]);

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <AdminHero
        title="Predictions"
        subtitle="Track diabetes risk predictions, monitor model usage, and prioritize high-risk patient cohorts."
        right={<HealthcareHero className="w-full h-auto" />}
        actions={<AdminButton variant="outline" onClick={() => window.location.reload()}>Refresh Analytics</AdminButton>}
      />

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Prediction History" value={stats.total} icon="query_stats" tone="sky" />
        <MetricCard label="Avg Probability" value={`${stats.avgProbability}%`} icon="percent" tone="amber" />
        <MetricCard label="High-Risk Patients" value={stats.highRisk} icon="warning" tone="rose" />
        <MetricCard label="AI Model Confidence" value={`${stats.modelConfidence}%`} icon="neurology" tone="emerald" />
      </section>

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <AdminInput placeholder="Search by patient id / username" value={search} onChange={(e) => setSearch(e.target.value)} />
          <AdminSelect value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </AdminSelect>
          <AdminSelect value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
            <option value="all">All Results</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </AdminSelect>
          <div className="text-sm text-slate-500 flex items-center justify-end">{filtered.length} records</div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-72 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyCard icon="query_stats" title="No predictions found" subtitle="Adjust filters to inspect available prediction records." />
        ) : (
          <>
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
              <AdminPanel title="Risk Distribution" icon="pie_chart">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                        {riskDistribution.map((entry, i) => (
                          <Cell key={entry.name} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AdminPanel>

              <AdminPanel title="Prediction Results" icon="bar_chart">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resultDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AdminPanel>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
              <AdminPanel title="Prediction Usage Trend" icon="monitoring" className="xl:col-span-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AdminPanel>

              <AdminPanel title="High-Risk Patients" icon="warning">
                <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                  {highRiskPatients.length === 0 ? (
                    <p className="text-sm text-slate-500">No high-risk records in current filter.</p>
                  ) : (
                    highRiskPatients.map((p) => {
                      const patient = userMap.get(p.patient_id);
                      return (
                        <div key={p.id} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-rose-800 truncate">{patient?.username || `Patient #${p.patient_id}`}</p>
                            <Badge tone="rose">{formatRisk(p.probability)}</Badge>
                          </div>
                          <p className="text-xs text-rose-700 mt-1">Prediction #{p.id}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </AdminPanel>
            </section>

            <AdminPanel title="Prediction History" icon="table_view">
              <div className="overflow-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">ID</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Patient</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Result</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Risk</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Probability</th>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const patient = userMap.get(p.patient_id);
                      return (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-800">#{p.id}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{patient?.username || `Patient #${p.patient_id}`}</td>
                          <td className="px-4 py-3"><Badge tone={p.resultLabel === "Positive" ? "rose" : "emerald"}>{p.resultLabel}</Badge></td>
                          <td className="px-4 py-3"><Badge tone={toRiskTone(p.risk)}>{p.risk}</Badge></td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatRisk(p.probability)}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </AdminPanel>
          </>
        )}
      </div>
    </AdminPage>
  );
}
