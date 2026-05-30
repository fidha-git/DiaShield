
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

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
    // Subtle entrance animation delay
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
      role: "patient"
    })

    if (response.data.success) {
      alert("Registration successful")
      navigate("/login")
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
    <div className="bg-[#0F172A] text-[#e4e2e4] min-h-screen flex items-center justify-center relative overflow-hidden font-body-md text-body-md antialiased">
      {/* Abstract Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-secondary-container/20 blur-[120px] opacity-50 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-tertiary-container/30 blur-[100px] opacity-60 mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#4cd7f6 1px, transparent 1px), linear-gradient(90deg, #4cd7f6 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      </div>

      {/* Registration Container */}
      <main className="w-full max-w-md px-unit-4 z-10 relative mt-unit-8 mb-unit-8">
        <div 
          className="glass-panel rounded-xl p-unit-8 w-full relative overflow-hidden group transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          {/* Subtle top accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#4cd7f6]/50 to-transparent"></div>
          
          {/* Header */}
          <div className="text-center mb-unit-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container/80 border border-white/10 mb-unit-4 shadow-[0_0_20px_rgba(76,215,246,0.15)]">
              <span className="material-symbols-outlined text-[32px] text-[#4cd7f6]" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-unit-2">DiaShield</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Secure Patient Portal Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-unit-4">
                        {errorMsg && (
                          <div className="font-body-sm text-body-sm text-error mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {errorMsg}
                          </div>
                        )}
            {/* Full Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit-2 uppercase tracking-wider" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-unit-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">badge</span>
                </div>
                <input 
                  className="input-glass w-full rounded-lg pl-10 pr-unit-3 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 outline-none" 
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
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit-2 uppercase tracking-wider" htmlFor="username">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-unit-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">person</span>
                </div>
                <input 
                  className="input-glass w-full rounded-lg pl-10 pr-unit-3 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 outline-none" 
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
              <label className="block font-label-md text-label-md text-on-surface-variant mb-unit-2 uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-unit-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">mail</span>
                </div>
                <input 
                  className="input-glass w-full rounded-lg pl-10 pr-unit-3 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 outline-none" 
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-4">
              {/* Password */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit-2 uppercase tracking-wider" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-unit-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">lock</span>
                  </div>
                  <input 
                    className="input-glass w-full rounded-lg pl-10 pr-unit-3 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 outline-none" 
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
                <label className="block font-label-md text-label-md text-on-surface-variant mb-unit-2 uppercase tracking-wider" htmlFor="confirmPassword">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-unit-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">check_circle</span>
                  </div>
                  <input 
                    className="input-glass w-full rounded-lg pl-10 pr-unit-3 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 outline-none" 
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
            <div className="pt-unit-6">
              <button 
                className={`w-full bg-secondary-container text-on-background font-body-md text-body-md font-semibold py-3 px-unit-4 rounded-lg shadow-lg hover:bg-[#7222da] transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden ${loading ? 'opacity-80 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                    Registering Account...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Register Account</span>
                    <span className="material-symbols-outlined text-[20px] relative z-10 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center mt-unit-6">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Already registered? 
                <Link className="text-[#4cd7f6] hover:text-primary transition-colors duration-200 ml-1 inline-flex items-center gap-1" to="/login">
                  Sign in to portal
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Clinical Footer subtle */}
        <div className="text-center mt-unit-6 opacity-40">
          <p className="font-label-md text-label-md text-on-surface-variant flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[14px]">encrypted</span>
            End-to-End Encrypted Healthcare Data
          </p>
        </div>
      </main>
    </div>
  )
}
