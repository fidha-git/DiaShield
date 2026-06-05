import React, { useEffect, useState } from 'react'
import HealthTrendChart from './HealthTrendChart'
import MonthlyAnalyticsChart from './MonthlyAnalyticsChart'
import { Link, useNavigate } from 'react-router-dom'
import { fetchPatientProfile, fetchDashboardStats } from '../services/dashboardService'
import { fetchMonthlyAnalytics } from '../services/analyticsService'
import { HealthcareHero } from '../components/Illustrations'
import { formatRisk } from '../utils/formatRisk'

const GREETINGS = [
  { hr: [5, 12], text: 'Morning', icon: 'wb_sunny' },
  { hr: [12, 17], text: 'Afternoon', icon: 'partly_cloudy_day' },
  { hr: [17, 21], text: 'Evening', icon: 'nights_stay' },
  { hr: [21, 24], text: 'Night', icon: 'bedtime' },
  { hr: [0, 5], text: 'Night', icon: 'bedtime' },
]

function getGreeting() {
  const h = new Date().getHours()
  const g = GREETINGS.find(g => h >= g.hr[0] && h < g.hr[1])
  return g || GREETINGS[0]
}

function StatCard({ stat, index }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(stat.path)}
      className="relative group cursor-pointer bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/5 hover:-translate-y-0.5 transition-all duration-300 p-6 overflow-hidden animate-scale-in"
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-sky-50/50 dark:bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-100 transition-all duration-500" />
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-cyan-50/50 dark:bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-100 transition-all duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
            <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-sky-500 transition-colors">
            View All
          </span>
        </div>
        <span className="block text-[34px] font-black text-slate-900 dark:text-slate-100 leading-none mb-1 tracking-tight">
          {stat.count}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {stat.label.replace('\n', ' ')}
        </span>
      </div>
    </div>
  )
}

function Blob({ className }) {
  return <div className={`floating-dot ${className}`} />
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [analytics, setAnalytics] = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [profileData, dashboardData] = await Promise.all([
          fetchPatientProfile(),
          fetchDashboardStats(),
        ])
        setProfile(profileData)
        setDashboard(dashboardData)
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      setAnalyticsLoading(true)
      try {
        const data = await fetchMonthlyAnalytics()
        setAnalytics(data)
      } catch {
        setAnalyticsError('Failed to load analytics')
      } finally {
        setAnalyticsLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="shimmer h-56 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="shimmer h-36 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="shimmer h-80 rounded-2xl" />
            <div className="shimmer h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[360px]">
        <span className="text-red-500 text-lg font-semibold">{error}</span>
      </div>
    )
  }

  const stats = [
    {
      count: dashboard?.upcoming_appointments_count ?? 'N/A',
      label: 'Upcoming Appointments',
      icon: 'calendar_today',
      path: '/appointments',
      color: 'text-sky-600 dark:text-sky-400 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-slate-800 dark:to-slate-750 border border-sky-100/50 dark:border-slate-700/50'
    },
    {
      count: dashboard?.medical_history_count ?? 'N/A',
      label: 'Health Timeline Entries',
      icon: 'timeline',
      path: '/history',
      color: 'text-cyan-600 dark:text-cyan-400 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-slate-800 dark:to-slate-750 border border-sky-100/50 dark:border-slate-700/50'
    },
    {
      count: dashboard?.health_records_count ?? 'N/A',
      label: 'Health Records',
      icon: 'description',
      path: '/records',
      color: 'text-emerald-600 dark:text-emerald-400 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-slate-800 dark:to-slate-750 border border-sky-100/50 dark:border-slate-700/50'
    }
  ]

  const healthRecords = dashboard?.recent_health_records || []
  const parseNumeric = (val) => {
    if (val == null) return NaN
    const n = parseFloat(String(val).replace(/[^\d.]/g, ''))
    return isNaN(n) ? NaN : n
  }
  const sortedRecords = [...healthRecords].sort((a, b) => {
    return new Date(a.created_at || a.recorded_at || 0) - new Date(b.created_at || b.recorded_at || 0)
  })
  const trendData = sortedRecords
    .map(r => ({
      date: (r.created_at || r.recorded_at) ? new Date(r.created_at || r.recorded_at).toLocaleDateString() : 'N/A',
      glucose: parseNumeric(r.blood_sugar),
      blood_pressure: r.blood_pressure || 'N/A',
      heart_rate: r.heart_rate || 'N/A',
      bmi: r.bmi || 'N/A',
    }))
    .filter(r => !isNaN(r.glucose))

  const monthlyAnalytics = Array.isArray(analytics) ? analytics : []
  const greeting = getGreeting()
  const firstName = profile?.first_name || profile?.name?.split(' ')[0] || 'Patient'

  const formatPct = () => {
    const p = dashboard?.latest_prediction?.probability
    if (p == null || (typeof p === 'string' && p.trim() === '')) return 'N/A'
    const val = Number(p)
    if (isNaN(val)) return 'N/A'
    if (val > 0 && val <= 1) return formatRisk(val)
    return `${Math.round(val)}%`
  }
  const risk = dashboard?.latest_prediction?.risk_level

  return (
    <div className="space-y-6 animate-fade-in transition-colors duration-300">
      <div className="page-container space-y-6">

        {/* ───────────── HERO ───────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-[2px] shadow-2xl shadow-sky-500/20 dark:shadow-sky-500/10">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-white dark:bg-[#0F172A] transition-colors duration-300">
            <Blob className="w-96 h-96 bg-sky-400/20 dark:bg-sky-500/5 -top-20 -right-20 animate-blob1" />
            <Blob className="w-80 h-80 bg-cyan-300/20 dark:bg-cyan-500/5 -bottom-32 -left-20 animate-blob2" />
            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4 shadow-lg shadow-sky-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  System Online
                </div>
                <h1 className="hero-title text-[30px] md:text-[44px] transition-colors">
                  Good {greeting.text},{' '}
                  <span className="text-gradient">{firstName}</span>
                </h1>
                <p className="hero-subtitle mt-3 text-base max-w-xl transition-colors">
                  Your comprehensive health overview. Track vitals, review predictions, and manage appointments — all in one place.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to="/records">
                    <button className="btn-primary cursor-pointer">
                      <span className="material-symbols-outlined text-base">add_circle</span>
                      Add Record
                    </button>
                  </Link>
                  <Link to="/appointments">
                    <button className="btn-outline cursor-pointer">
                      <span className="material-symbols-outlined text-base">event_available</span>
                      Book Appointment
                    </button>
                  </Link>
                  <Link to="/prediction">
                    <button className="btn-outline cursor-pointer">
                      <span className="material-symbols-outlined text-base">query_stats</span>
                      Run Prediction
                    </button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block w-64 shrink-0">
                <HealthcareHero className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* ───────────── BENTO GRID ───────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ── Prediction ── */}
          <div className="md:col-span-4 bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/5 hover:-translate-y-0.5 transition-all duration-300 p-6 flex flex-col justify-between min-h-[290px] relative overflow-hidden group">
            <Blob className="w-64 h-64 bg-sky-400/20 dark:bg-sky-500/5 -top-32 -right-32 group-hover:opacity-30 transition-all duration-700" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-slate-850 dark:to-slate-800 text-sky-700 dark:text-sky-400 text-[11px] font-bold mb-4 border border-sky-100/20 dark:border-slate-800/30">
                <span className="material-symbols-outlined text-sm">smart_toy</span>
                AI Assessment
              </div>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                Based on your recent lab results and continuous monitoring.
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[46px] font-black text-sky-600 dark:text-sky-400 leading-none tracking-tighter">
                  {formatPct()}
                </span>
                <span className="text-sm text-muted font-medium">Risk Score</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                  risk === 'High' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-500/20' :
                  risk === 'Moderate' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/20' :
                  'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    risk === 'High' ? 'bg-red-500 animate-pulse' :
                    risk === 'Moderate' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  {risk || 'No data'}
                </span>
              </div>
            </div>
            <Link to="/prediction" className="relative z-10 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 mt-6 transition-colors group/link">
              View Full Report
              <span className="material-symbols-outlined text-base group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {/* ── Stats ── */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>

          {/* ── Charts ── */}
          <div className="md:col-span-6 bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/5 transition-all duration-300 p-6 h-[390px] flex flex-col relative overflow-hidden group">
            <Blob className="w-48 h-48 bg-sky-400/20 dark:bg-sky-500/5 -top-24 -right-24 group-hover:opacity-30 transition-all duration-700" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-slate-800 dark:to-slate-750 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-xl">trending_up</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Blood Sugar Trend</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Last 30 Days</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex-1 min-h-0 p-3 bg-gradient-to-br from-sky-50/50 to-cyan-50/50 dark:from-slate-900/60 dark:to-slate-900/40 border border-sky-100/50 dark:border-slate-800 rounded-xl overflow-hidden">
              {loading ? (
                <div className="shimmer w-full h-full rounded-lg" />
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center text-red-500 text-xs font-medium">Failed to load</div>
              ) : (
                <HealthTrendChart data={trendData} />
              )}
            </div>
          </div>

          <div className="md:col-span-6 bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/5 transition-all duration-300 p-6 h-[390px] flex flex-col relative overflow-hidden group">
            <Blob className="w-48 h-48 bg-emerald-400/20 dark:bg-emerald-500/5 -top-24 -right-24 group-hover:opacity-30 transition-all duration-700" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-slate-800 dark:to-slate-750 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">analytics</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Avg Blood Sugar / Month</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Monthly Summary</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex-1 min-h-0 p-3 bg-gradient-to-br from-sky-50/50 to-emerald-50/50 dark:from-slate-900/60 dark:to-slate-900/40 border border-sky-100/50 dark:border-slate-800 rounded-xl overflow-hidden">
              {analyticsLoading ? (
                <div className="shimmer w-full h-full rounded-lg" />
              ) : analyticsError || monthlyAnalytics.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-medium">No data available</div>
              ) : (
                <MonthlyAnalyticsChart data={monthlyAnalytics} />
              )}
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="md:col-span-12 bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/5 transition-all duration-300 p-6 relative overflow-hidden">
            <Blob className="w-64 h-64 bg-sky-400/20 dark:bg-sky-500/5 -bottom-32 -right-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 dark:from-slate-800 dark:to-slate-750 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-xl">bolt</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Actions</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Frequently used tasks</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/records">
                  <div className="group/card flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover/card:shadow-xl group-hover/card:shadow-sky-500/30 transition-shadow">
                      <span className="material-symbols-outlined text-white text-xl">add_circle</span>
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">Add Health Record</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Log your latest vitals</span>
                    </div>
                  </div>
                </Link>
                <Link to="/history">
                  <div className="group/card flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-white dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 hover:border-cyan-200 dark:hover:border-cyan-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover/card:shadow-xl group-hover/card:shadow-cyan-500/30 transition-shadow">
                      <span className="material-symbols-outlined text-white text-xl">timeline</span>
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">View Health Timeline</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Review your health journey</span>
                    </div>
                  </div>
                </Link>
                <Link to="/appointments">
                  <div className="group/card flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover/card:shadow-xl group-hover/card:shadow-emerald-500/30 transition-shadow">
                      <span className="material-symbols-outlined text-white text-xl">event_available</span>
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">Book Appointment</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Schedule a doctor visit</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

