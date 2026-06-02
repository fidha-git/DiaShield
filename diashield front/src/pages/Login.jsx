import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import { HealthcareArtwork } from '../components/Illustrations'

export default function Login() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)
    setErrorMsg("")

    try {


      const response = await API.post(
        "/login",
        {
          email: username.trim(),
          password: password.trim()
        }
      );

      // Save new login details
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("username", response.data.username);
        const role = response.data.role;
        navigate(role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/dashboard");
      } else {
        setErrorMsg("Invalid login response: missing token");
      }

    } catch (error) {

      setErrorMsg(
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.response?.data?.detail?.[0]?.msg ||
          "Invalid credentials"
      )

    } finally {

      setLoading(false)

    }

  }

  return (
    <div className="auth-shell text-slate-900 dark:text-slate-100 font-body-md antialiased overflow-hidden selection:bg-sky-500/30 selection:text-sky-600 flex items-center justify-center relative transition-colors duration-300">
      
      {/* Decorative floating blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none animate-blob1" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-blob2" />
      
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-12 py-8">

        {/* Left Healthcare Panel */}
        <div className="hidden md:flex flex-col flex-1 max-w-xl h-[600px] relative rounded-3xl overflow-hidden border border-sky-100 dark:border-slate-800 shadow-2xl transition-colors duration-300">
          <HealthcareArtwork className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-10 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              Intelligence
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Advanced Patient Intelligence
            </h2>
            <p className="text-slate-300 leading-relaxed max-w-md">
              Securely access your medical history, predictive analytics and personalized health recommendations in real-time.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md relative">
          {/* Glass Card */}
          <div className="auth-card backdrop-blur-xl p-8 transition-all duration-300">
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-sky-500 dark:text-sky-400 text-4xl">
                  health_and_safety
                </span>
                <h1 className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight">
                  DiaShield
                </h1>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Welcome Back
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Sign in to access your patient portal
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  className="input-premium"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="input-premium pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={()=>setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="text-sm text-red-500 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 font-bold text-base mt-2 shadow-lg shadow-sky-500/20 dark:shadow-sky-500/10 cursor-pointer"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                New to DiaShield?
                <Link
                  to="/register"
                  className="text-sky-600 dark:text-sky-400 font-bold hover:underline ml-1.5 transition-all"
                >
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>

      </main>

    </div>
  )
}
