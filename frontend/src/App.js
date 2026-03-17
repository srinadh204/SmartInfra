import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
// Improvised stubs for dashboards (will create in next chunk)
import Dashboard from "./pages/Dashboard";
import CitizenHome from "./pages/CitizenHome";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminReportDetail from "./pages/AdminReportDetail";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminMap from "./pages/AdminMap";
import Profile from "./pages/Profile";
import ReportDamage from "./pages/ReportDamage";
import HowItWorks from "./pages/HowItWorks";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect visually unauthorized users back to their native dashboard
    return <Navigate to={user.role === "Admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

function RoleBasedHomeRedirect() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    return <Navigate to={user.role === "Admin" ? "/admin" : "/home"} replace />;
  }
  return <Navigate to="/login" replace />;
}

function LoginRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (token && user) {
    return <Navigate to={user.role === "Admin" ? "/admin" : "/dashboard"} replace />;
  }
  return <Login />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<RoleBasedHomeRedirect />} />
          <Route path="/login" element={<LoginRoute />} />
          
          {/* Citizen Modules */}
          <Route path="/home" element={<ProtectedRoute allowedRole="Citizen"><CitizenHome /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRole="Citizen"><Dashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute allowedRole="Citizen"><ReportDamage /></ProtectedRoute>} />
          <Route path="/how-it-works" element={<ProtectedRoute allowedRole="Citizen"><HowItWorks /></ProtectedRoute>} />
          
          {/* Shared Modules */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin Modules */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="Admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRole="Admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/reports/:id" element={<ProtectedRoute allowedRole="Admin"><AdminReportDetail /></ProtectedRoute>} />
          <Route path="/admin/map" element={<ProtectedRoute allowedRole="Admin"><AdminMap /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;