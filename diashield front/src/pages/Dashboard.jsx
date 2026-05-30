import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = [
    {
      count: '3',
      label: 'Upcoming\nAppointments',
      icon: 'calendar_today',
      path: '/appointments',
      color: 'text-secondary bg-secondary-container/20'
    },
    {
      count: '5',
      label: 'Medical\nHistory',
      icon: 'history',
      path: '/history',
      color: 'text-primary bg-primary-container/50'
    },
    {
      count: '12',
      label: 'Health\nRecords',
      icon: 'description',
      path: '/records',
      color: 'text-tertiary bg-tertiary-container/50'
    },
    {
      count: '4',
      label: 'Active\nPrescriptions',
      icon: 'medication',
      path: '/records',
      color: 'text-secondary bg-secondary/10'
    }
  ]

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Welcome back, Amal</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Here is your health overview for today.</p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full bg-surface-container-high border border-white/10 rounded-lg pl-10 pr-4 py-2 text-body-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all placeholder:text-on-surface-variant/50 outline-none" 
                placeholder="Search records, appointments..." 
                type="text"
              />
            </div>
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
                <span className="px-3 py-1 bg-tertiary/20 text-tertiary rounded-full font-label-md text-label-md border border-tertiary/30">Stable</span>
              </div>
              <p className="font-body-sm text-on-surface-variant mb-6">Based on your recent lab results and continuous monitoring.</p>
              <div className="flex items-end gap-4 mb-2">
                <span className="font-display-lg text-[42px] md:text-display-lg text-tertiary leading-none">15%</span>
                <span className="font-body-md text-on-surface-variant pb-1">Probability</span>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center z-10">
              <div>
                <span className="block font-label-md text-on-surface-variant text-[11px]">Risk Level</span>
                <span className="font-headline-lg-mobile text-green-400">Low</span>
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
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
            <div className="glass-card rounded-xl p-unit-6 h-80 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                  Health Trend
                </h3>
                <button className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">more_horiz</span></button>
              </div>
              
              <div className="flex-1 w-full relative rounded-lg border border-white/5 bg-surface-container-lowest/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                <svg className="w-full h-full opacity-70" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path className="drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]" d="M0,40 Q20,30 40,35 T80,20 T100,10" fill="none" stroke="#4cd7f6" strokeWidth="1.5"></path>
                  <path d="M0,45 Q20,40 40,42 T80,30 T100,25" fill="none" opacity="0.5" stroke="#d2bbff" strokeDasharray="2 2" strokeWidth="1"></path>
                </svg>
                <span className="absolute text-on-surface-variant font-label-md bg-surface-dim/80 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 text-[11px] tracking-wider uppercase">Continuous Glucose Monitor</span>
              </div>
            </div>

            {/* Monthly Analytics */}
            <div className="glass-card rounded-xl p-unit-6 h-80 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Monthly Analytics
                </h3>
                <select className="bg-surface-container border border-white/10 text-on-surface text-label-md rounded px-2 py-1 focus:outline-none">
                  <option>Oct 2023</option>
                  <option>Sep 2023</option>
                </select>
              </div>
              
              <div className="flex-1 w-full flex items-end gap-2 p-4 border border-white/5 rounded-lg bg-surface-container-lowest/30">
                {/* Bar chart representation */}
                <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-sm h-[40%] relative group cursor-pointer">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md hidden group-hover:block text-[11px]">40</span>
                </div>
                <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-sm h-[60%] relative group cursor-pointer">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md hidden group-hover:block text-[11px]">60</span>
                </div>
                <div className="flex-1 bg-tertiary/40 hover:bg-tertiary/60 transition-colors rounded-t-sm h-[85%] relative group glass-glow-cyan cursor-pointer">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md hidden group-hover:block text-[11px] font-bold text-tertiary">85</span>
                </div>
                <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-sm h-[50%] relative group cursor-pointer">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md hidden group-hover:block text-[11px]">50</span>
                </div>
                <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-sm h-[70%] relative group cursor-pointer">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md hidden group-hover:block text-[11px]">70</span>
                </div>
                <div className="flex-1 bg-secondary/20 hover:bg-secondary/40 transition-colors rounded-t-sm h-[30%] relative group cursor-pointer">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md hidden group-hover:block text-[11px]">30</span>
                </div>
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
              <Link to="/history" className="w-full md:w-auto">
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
  )
}
