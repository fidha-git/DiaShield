import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MedicalHistory from './pages/MedicalHistory';
import HealthRecords from './pages/HealthRecords';
import DiabetesPrediction from './pages/DiabetesPrediction';
import Appointments from './pages/Appointments';
import ChatAssistant from './pages/ChatAssistant';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<MedicalHistory />} />
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/prediction" element={<DiabetesPrediction />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/chat" element={<ChatAssistant />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);