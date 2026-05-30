import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

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

      console.log("Login response:", response.data);

      // Save new login details
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("username", response.data.username);
        navigate("/dashboard");
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

    <div className="min-h-screen text-[#e4e2e4] font-body-md antialiased overflow-hidden selection:bg-[#4cd7f6]/30 selection:text-[#4cd7f6] flex items-center justify-center relative bg-[#0F172A]">

      <div className="absolute inset-0 z-0 bg-medical-mesh pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-gutter md:px-unit-8 flex flex-col md:flex-row items-center justify-between gap-unit-12 h-[calc(100vh-4rem)] md:h-auto">

        {/* Left Healthcare Panel */}

        <div className="hidden md:flex flex-col flex-1 max-w-xl h-[600px] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl">

          <img
            alt="Healthcare"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>

          <div className="absolute bottom-0 left-0 p-8">

            <h2 className="text-4xl font-bold text-white mb-4">
              Advanced Patient Intelligence
            </h2>

            <p className="text-gray-300">
              Securely access your medical history,
              predictive analytics and personalized
              health recommendations.
            </p>

          </div>

        </div>

        {/* Login Form */}

        <div className="w-full max-w-md">

          <div className="glass-card rounded-xl p-8 shadow-2xl">

            <div className="mb-8">

              <div className="flex items-center gap-2 mb-4">

                <span className="material-symbols-outlined text-[#4cd7f6] text-4xl">
                  health_and_safety
                </span>

                <h1 className="text-3xl font-bold text-[#4cd7f6]">
                  DiaShield
                </h1>

              </div>

              <h3 className="text-2xl font-bold text-white">
                Welcome Back
              </h3>

              <p className="text-gray-400">
                Sign in to access your patient portal
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div>

                <label className="block mb-2 text-sm text-gray-400">
                  Username or Email
                </label>

                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/10 outline-none"
                  placeholder="john@example.com"
                />

              </div>

              <div>

                <label className="block mb-2 text-sm text-gray-400">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                      ? "text"
                      : "password"
                    }
                    required
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/10 outline-none"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={()=>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-3"
                  >
                    {
                      showPassword
                      ? "Hide"
                      : "Show"
                    }
                  </button>

                </div>

              </div>

              {errorMsg && (

                <p className="text-red-400">
                  {errorMsg}
                </p>

              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg"
              >
                {
                  loading
                  ? "Authenticating..."
                  : "Sign In"
                }
              </button>

            </form>

            <div className="mt-6 text-center">

              <p className="text-gray-400">

                New to DiaShield?

                <Link
                  to="/register"
                  className="text-[#4cd7f6] ml-2"
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