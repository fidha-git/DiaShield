import React from "react";
import { Navigate } from "react-router-dom";

export default function DoctorRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || token.trim() === "") {
    return <Navigate to="/login" replace />;
  }

  if (role !== "doctor") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
