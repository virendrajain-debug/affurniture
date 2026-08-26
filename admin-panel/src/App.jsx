// ============================================================
// Admin Panel - Root App Component
// ============================================================
// This is the main entry point for the admin panel.
// It manages authentication state and defines all routes.
//
// ROUTES:
//   /               -> Login page (redirects to /dashboard if logged in)
//   /forgot-password -> Password reset request
//   /otp             -> OTP verification
//   /dashboard/*     -> Admin dashboard (all sub-pages)
//
// AUTHENTICATION:
//   Uses JWT token stored in localStorage as 'af_admin_token'.
//   Token is passed to Dashboard which passes it to all child pages.
//   On logout, token is removed and user is redirected to login.
// ============================================================

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import OTP from './pages/OTP'
import NewPassword from './pages/NewPassword'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  // Initialize token from localStorage (persists across refreshes)
  const [token, setToken] = useState(() => localStorage.getItem('af_admin_token'))

  // Called after successful login - saves JWT token
  const handleLogin = (jwtToken) => {
    localStorage.setItem('af_admin_token', jwtToken)
    setToken(jwtToken)
  }

  // Called on logout - removes token from storage
  const handleLogout = () => {
    localStorage.removeItem('af_admin_token')
    setToken(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login - redirects to dashboard if already logged in */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Forgot Password - redirects to dashboard if already logged in */}
        <Route
          path="/forgot-password"
          element={
            token ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
          }
        />

        {/* OTP Verification - redirects to dashboard if already logged in */}
        <Route
          path="/otp"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <OTP onResetComplete={handleLogout} />
            )
          }
        />

        {/* New Password - set new password after OTP verification */}
        <Route
          path="/new-password"
          element={
            token ? <Navigate to="/dashboard" replace /> : <NewPassword />
          }
        />

        {/* Dashboard - requires authentication, handles all sub-routes */}
        <Route
          path="/dashboard/*"
          element={
            token ? (
              <Dashboard onLogout={handleLogout} token={token} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch-all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
