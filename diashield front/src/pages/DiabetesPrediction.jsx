import React, { useState } from "react"
import API from "../services/api"

export default function DiabetesPrediction() {

  const [formData, setFormData] = useState({
    pregnancies: 2,
    glucose: 112,
    blood_pressure: 76,
    skin_thickness: 20,
    insulin: 85,
    bmi: 24.2,
    diabetes_pedigree: 0.45,
    age: 45
  })

  const [loading, setLoading] = useState(false)

  const [predictionResult, setPredictionResult] = useState({
    prediction: "Negative",
    confidence: 0.15
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePredict = async () => {

    try {

      setLoading(true)

      const token = localStorage.getItem("token")

      if (!token) {
        alert("Please login first")
        return
      }

      // Prediction API
      const response = await API.post(
        "/predict",
        {
          pregnancies: Number(formData.pregnancies),
          glucose: Number(formData.glucose),
          blood_pressure: Number(formData.blood_pressure),
          skin_thickness: Number(formData.skin_thickness),
          insulin: Number(formData.insulin),
          bmi: Number(formData.bmi),
          diabetes_pedigree: Number(formData.diabetes_pedigree),
          age: Number(formData.age)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setPredictionResult(response.data)

      // Risk %
      const risk = Math.round(
        response.data.confidence * 100
      )

      // Risk Level
      const riskLevel =
        risk < 20
          ? "Low Risk"
          : risk < 50
          ? "Moderate Risk"
          : "High Risk"

      // Save history automatically
      const historyResponse = await API.post(
        "/prediction-history/create",
        {
          prediction_result:
            response.data.prediction,

          risk_level:
            riskLevel,

          probability:
            response.data.confidence
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log(
        "Prediction history saved:",
        historyResponse.data
      )

    } catch(error) {

      console.log(
        "Error:",
        error.response?.data || error
      )

      alert(
        error.response?.data?.detail ||
        "Prediction failed"
      )

    } finally {

      setLoading(false)

    }

  }

  const risk = Math.round(
    predictionResult.confidence * 100
  )

  const riskLevel =
    risk < 20
      ? {
          label: "Low Risk",
          color: "text-green-400"
        }
      : risk < 50
      ? {
          label: "Moderate Risk",
          color: "text-orange-400"
        }
      : {
          label: "High Risk",
          color: "text-red-400"
        }

  return (

    <div className="p-6 min-h-screen">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-6">
          Diabetes Prediction
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Input Card */}

          <div className="glass-card p-6 rounded-xl space-y-4">

            <input
              type="number"
              name="pregnancies"
              value={formData.pregnancies}
              onChange={handleChange}
              placeholder="Pregnancies"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              name="glucose"
              value={formData.glucose}
              onChange={handleChange}
              placeholder="Glucose"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              name="blood_pressure"
              value={formData.blood_pressure}
              onChange={handleChange}
              placeholder="Blood Pressure"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              name="skin_thickness"
              value={formData.skin_thickness}
              onChange={handleChange}
              placeholder="Skin Thickness"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              name="insulin"
              value={formData.insulin}
              onChange={handleChange}
              placeholder="Insulin"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              step="0.1"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              placeholder="BMI"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              step="0.01"
              name="diabetes_pedigree"
              value={formData.diabetes_pedigree}
              onChange={handleChange}
              placeholder="Diabetes Pedigree"
              className="w-full p-3 rounded bg-black/30"
            />

            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="w-full p-3 rounded bg-black/30"
            />

            <button
              onClick={handlePredict}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 transition w-full py-3 rounded-lg"
            >
              {
                loading
                ? "Predicting..."
                : "Run AI Prediction"
              }
            </button>

          </div>

          {/* Result Card */}

          <div className="glass-card p-6 rounded-xl">

            <h2 className="text-xl font-bold mb-4 text-white">
              AI Prediction Result
            </h2>

            <div className="text-6xl font-bold text-cyan-400">
              {risk}%
            </div>

            <div
              className={`mt-4 text-lg ${riskLevel.color}`}
            >
              {riskLevel.label}
            </div>

            <div className="mt-6 text-white">

              <p>
                Prediction:
                <strong>
                  {" "}
                  {predictionResult.prediction}
                </strong>
              </p>

              <p className="mt-2">
                Confidence:
                <strong>
                  {" "}
                  {(predictionResult.confidence * 100).toFixed(2)}%
                </strong>
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  )
}