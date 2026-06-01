
import React, { useEffect, useState } from 'react';
import HealthTrendChart from './HealthTrendChart';
import MonthlyAnalyticsChart from './MonthlyAnalyticsChart';
import SearchBar from '../components/SearchBar';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPatientProfile, fetchDashboardStats } from '../services/dashboardService';
import { fetchMonthlyAnalytics } from '../services/analyticsService';

export default function Dashboard() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, dashboardData] = await Promise.all([
          fetchPatientProfile(),
          fetchDashboardStats(),
        ]);
        setProfile(profileData);
        console.log("Dashboard API Response", dashboardData);
        setDashboard(dashboardData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const analyticsData = await fetchMonthlyAnalytics();
        console.log('Monthly Analytics API Response:', analyticsData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Analytics API Error:", err);
        setAnalyticsError('Failed to load analytics data');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    loadAnalytics();
  }, []);
  // Skeleton loader component
  const ChartSkeleton = () => (
    <div className="w-full h-full flex flex-col gap-3 p-2 animate-pulse">
      <div className="h-3 w-1/3 rounded bg-white/10" />
      <div className="flex-1 flex items-end gap-2">
        {[40, 70, 55, 85, 60, 75, 50].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-white/10" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="h-2 w-full rounded bg-white/10" />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-on-surface-variant font-headline-md">Loading dashboard...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-error font-headline-md">{error}</span>
      </div>
    );
  }
  // Stats config from backend
  const stats = [
    {
      count: dashboard?.upcoming_appointments_count != null ? dashboard.upcoming_appointments_count : 'N/A',
      label: 'Upcoming\nAppointments',
      icon: 'calendar_today',
      path: '/appointments',
      color: 'text-secondary bg-secondary-container/20'
    },
    {
      count: dashboard?.medical_history_count != null ? dashboard.medical_history_count : 'N/A',
      label: 'Medical\nHistory',
      icon: 'history',
      path: '/history',
      color: 'text-primary bg-primary-container/50'
    },
    {
      count: dashboard?.health_records_count != null ? dashboard.health_records_count : 'N/A',
      label: 'Health\nRecords',
      icon: 'description',
      path: '/records',
      color: 'text-tertiary bg-tertiary-container/50'
    },
    {
      count: dashboard?.prescription_count != null ? dashboard.prescription_count : 'N/A',
      label: 'Active\nPrescriptions',
      icon: 'medication',
      path: '/records',
      color: 'text-secondary bg-secondary/10'
    }
  ];



  // Health Trend chart: extract real glucose readings + all vitals for rich tooltip
  const healthRecords = dashboard?.recent_health_records || [];
  console.log("Health Records from API:", healthRecords);

  // Parse numeric value from strings like "120", "120.5", "120 mg/dL"
  const parseNumeric = (val) => {
    if (val === undefined || val === null) return NaN;
    const n = parseFloat(String(val).replace(/[^\d.]/g, ''));
    return isNaN(n) ? NaN : n;
  };

  // Sort records by timestamp ascending so the trend line reads left-to-right
  const sortedRecords = [...healthRecords].sort((a, b) => {
    const ta = new Date(a.created_at || a.recorded_at || 0).getTime();
    const tb = new Date(b.created_at || b.recorded_at || 0).getTime();
    return ta - tb;
  });

  const trendData = sortedRecords
    .map(r => {
      const glucose = parseNumeric(r.blood_sugar);
      const ts = r.created_at || r.recorded_at;
      return {
        date: ts ? new Date(ts).toLocaleDateString() : 'N/A',
        glucose,
        blood_pressure: r.blood_pressure || 'N/A',
        heart_rate: r.heart_rate || 'N/A',
        bmi: r.bmi || 'N/A',
      };
    })
    .filter(r => !isNaN(r.glucose));

  console.log("Trend Data (parsed):", trendData);

  // analytics is already the array returned by fetchMonthlyAnalytics
  const monthlyAnalytics = Array.isArray(analytics) ? analytics : [];
  console.log('Dashboard monthly analytics records:', monthlyAnalytics);

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Welcome back, {profile?.first_name || profile?.name || ''}</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Here is your health overview for today.</p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-4">
            <SearchBar />
            <button className="hidden md:flex relative p-2 rounded-full bg-surface-container-high border border-white/10 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary rounded-full glass-glow-cyan"></span>
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-unit-6">
          {/* Latest Prediction Card */}
          <div className="md:col-span-3 glass-card rounded-xl p-unit-6 glass-glow-cyan flex flex-col justify-between relative overflow-hidden group min-h-[260px]">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl group-hover:bg-tertiary/20 transition-all duration-500"></div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">query_stats</span>
                  Latest Prediction
                </h3>
              </div>
              <p className="font-body-sm text-on-surface-variant mb-6">Based on your recent lab results and continuous monitoring.</p>
              <div className="flex items-end gap-4 mb-2">
                <span className="font-display-lg text-[42px] md:text-display-lg text-tertiary leading-none">
                  {(() => {
                    const p = dashboard?.latest_prediction?.probability;
                    if (p == null) return 'N/A';
                    if (typeof p === 'string' && p.trim() === '') return 'N/A';
                    let val = Number(p);
                    if (isNaN(val)) return 'N/A';
                    if (val > 0 && val <= 1) val = Math.round(val * 100);
                    else val = Math.round(val);
                    return `${val}%`;
                  })()}
                </span>
                <span className="font-body-md text-on-surface-variant pb-1">Probability</span>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center z-10">
              <div>
                <span className="block font-label-md text-on-surface-variant text-[11px]">Risk Level</span>
                <span className="font-headline-lg-mobile text-green-400">
                  {dashboard?.latest_prediction && dashboard.latest_prediction.risk_level
                    ? dashboard.latest_prediction.risk_level
                    : 'No prediction available'}
                </span>
              </div>
              <Link to="/prediction" className="px-4 py-2 bg-tertiary/10 text-tertiary border border-tertiary/30 rounded-lg font-label-md hover:bg-tertiary/20 transition-colors">
                View Details
              </Link>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div 
                key={i}
                onClick={() => navigate(stat.path)}
                className="glass-card rounded-xl p-4 flex flex-col justify-center items-center text-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <span className="font-display-lg text-[28px] md:text-headline-lg text-on-surface mb-1">{stat.count}</span>
                <span className="font-label-md text-on-surface-variant text-[11px] whitespace-pre-line leading-snug">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-unit-6">
            {/* Health Trend Chart */}
            <div className="glass-card rounded-xl p-unit-6 h-[360px] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                  Blood Sugar Trend
                </h3>
              </div>
              <div className="flex-1 min-h-0 w-full p-3 md:p-4 border border-white/5 rounded-lg bg-surface-container-lowest/30 overflow-hidden">
                {loading ? (
                  <ChartSkeleton />
                ) : error ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-error font-label-md">Failed to load health trend</span>
                  </div>
                ) : (
                  <HealthTrendChart data={trendData} />
                )}
              </div>
            </div>

            {/* Monthly Analytics */}
            <div className="glass-card rounded-xl p-unit-6 h-[360px] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Avg Blood Sugar / Month
                </h3>
              </div>
              <div className="flex-1 min-h-0 w-full p-3 md:p-4 border border-white/5 rounded-lg bg-surface-container-lowest/30 overflow-hidden">
                {analyticsLoading ? (
                  <ChartSkeleton />
                ) : analyticsError ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-on-surface-variant font-label-md">No analytics data available</span>
                  </div>
                ) : (
                  <MonthlyAnalyticsChart data={monthlyAnalytics} />
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-8 glass-card rounded-xl p-unit-6">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/records" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-secondary-container text-white px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-secondary-container/85 transition-colors shadow-lg">
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Health Record
                </button>
              </Link>
              <Link to="/history" className="w-full md:w-auto" onClick={() => console.log("Navigating to Medical History")}>
                <button className="w-full flex items-center justify-center gap-2 bg-surface-container border border-white/20 text-on-surface px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-white/10 transition-colors backdrop-blur-md">
                  <span className="material-symbols-outlined">visibility</span>
                  View Medical History
                </button>
              </Link>
              <Link to="/appointments" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-surface-container border border-white/20 text-on-surface px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-white/10 transition-colors backdrop-blur-md">
                  <span className="material-symbols-outlined">event_available</span>
                  Book Appointment
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
