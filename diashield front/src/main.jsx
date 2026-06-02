import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MedicalHistory from './pages/MedicalHistory';
import HealthRecords from './pages/HealthRecords';
import DiabetesPrediction from './pages/DiabetesPrediction';
import Appointments from './pages/Appointments';
import ChatAssistant from './pages/ChatAssistant';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDoctors from './pages/AdminDoctors';
import AdminAppointments from './pages/AdminAppointments';
import AdminPredictions from './pages/AdminPredictions';
import AdminActivityLogs from './pages/AdminActivityLogs';

import DoctorRoute from './components/DoctorRoute';
import DoctorLayout from './components/DoctorLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorAvailability from './pages/DoctorAvailability';
import DoctorClinicalNotes from './pages/DoctorClinicalNotes';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import DoctorProfile from './pages/DoctorProfile';
import DoctorSettings from './pages/DoctorSettings';

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

        {/* Protected Patient Routes */}
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

        {/* Protected Admin Routes */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/predictions" element={<AdminPredictions />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
        </Route>

        {/* Protected Doctor Routes */}
        <Route
          element={
            <DoctorRoute>
              <DoctorLayout />
            </DoctorRoute>
          }
        >
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/availability" element={<DoctorAvailability />} />
          <Route path="/doctor/notes" element={<DoctorClinicalNotes />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);