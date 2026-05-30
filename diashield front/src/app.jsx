import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MedicalHistory from "./pages/MedicalHistory";
import HealthRecords from "./pages/HealthRecords";
import DiabetesPrediction from "./pages/DiabetesPrediction";
import PredictionHistory from "./pages/PredictionHistory";
import Appointments from "./pages/Appointments";
import ChatAssistant from "./pages/ChatAssistant";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="history" element={<MedicalHistory />} />
        <Route path="records" element={<HealthRecords />} />
        <Route path="prediction" element={<DiabetesPrediction />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="chat" element={<ChatAssistant />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;