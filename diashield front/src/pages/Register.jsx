import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import { HealthcareArtwork } from '../components/Illustrations'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleSubmit = async (e) => {
  e.preventDefault()

  setErrorMsg("")

  if (password !== confirmPassword) {
    setErrorMsg("Passwords do not match!")
    return
  }

  try {
    setLoading(true)

    const response = await API.post("/register", {
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      full_name: fullName.trim(),
      role: "patient"
    })

    if (response.data.success) {
      alert("Registration successful")
      navigate("/login")
    } else {
      setErrorMsg(response.data.message || "Registration failed")
    }

  } catch (error) {

    setErrorMsg(
      typeof error.response?.data?.detail === "string"
        ? error.response.data.detail
        : error.response?.data?.detail?.[0]?.msg ||
          "Registration failed"
    )

  } finally {

    setLoading(false)

  }
}
  return (
    <div className="auth-shell text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative floating blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none animate-blob1" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-blob2" />
      
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-12 py-8">
        
        {/* Left - Healthcare Artwork */}
        <div className="hidden md:flex flex-col flex-1 max-w-xl h-[600px] relative rounded-3xl overflow-hidden border border-sky-100 dark:border-slate-800 shadow-2xl transition-colors duration-300">
          <HealthcareArtwork className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-10 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              Your Portal
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Your Health, Connected
            </h2>
            <p className="text-slate-300 leading-relaxed max-w-md">
              Create your secure patient portal to access predictive analytics, track your vitals, and stay connected with your care team.
            </p>
          </div>
        </div>

        {/* Right - Registration Form */}
        <div className="w-full max-w-md">
          <div
            className="auth-card backdrop-blur-xl p-8 w-full transition-all duration-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px] text-sky-500" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
              </div>
              <h1 className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight mb-1">DiaShield</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Secure Patient Portal Access</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="text-sm text-red-500 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                  </div>
                  <input 
                    className="input-premium pl-10" 
                    id="fullName" 
                    placeholder="Jane Doe" 
                    required 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider" htmlFor="username">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                  </div>
                  <input 
                    className="input-premium pl-10" 
                    id="username" 
                    placeholder="jane.doe99" 
                    required 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                  </div>
                  <input 
                    className="input-premium pl-10" 
                    id="email" 
                    placeholder="jane@example.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider" htmlFor="password">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                    </div>
                    <input 
                      className="input-premium pl-10" 
                      id="password" 
                      placeholder="••••••••" 
                      required 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider" htmlFor="confirmPassword">Confirm</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">check_circle</span>
                    </div>
                    <input 
                      className="input-premium pl-10" 
                      id="confirmPassword" 
                      placeholder="••••••••" 
                      required 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-4">
                <button 
                  className="w-full btn-primary py-3.5 font-bold text-base cursor-pointer shadow-lg shadow-sky-500/20 dark:shadow-sky-500/10"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                      Registering Account...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">Register Account</span>
                      <span className="material-symbols-outlined text-[20px] relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Already registered? 
                  <Link className="text-sky-600 dark:text-sky-400 font-bold hover:underline ml-1 inline-flex items-center gap-1" to="/login">
                    Sign in to portal
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Clinical Footer */}
          <div className="text-center mt-6 opacity-60">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[14px]">encrypted</span>
              End-to-End Encrypted Healthcare Data
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
