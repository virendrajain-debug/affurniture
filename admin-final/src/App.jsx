// ============================================================
// Admin Panel - Root App Component (Lazy Loaded & Code-Split)
// ============================================================
// Manages authentication state and defines all routes using
// React.lazy and Suspense for optimized production performance.
// ============================================================

import { useState, lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Lazy Load Root Pages
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const OTP = lazy(() => import('./pages/OTP'))
const NewPassword = lazy(() => import('./pages/NewPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  // Initialize token from localStorage (persists across refreshes)
  const [token, setToken] = useState(() => {
    return localStorage.getItem('af_admin_token') || localStorage.getItem('token') || localStorage.getItem('adminToken') || null
  })

  // Called after successful login - saves JWT token
  const handleLogin = (jwtToken) => {
    if (jwtToken) {
      localStorage.setItem('af_admin_token', jwtToken)
      localStorage.setItem('token', jwtToken)
      localStorage.setItem('adminToken', jwtToken)
    }
    setToken(jwtToken)
  }

  // Called on logout - removes token from storage
  const handleLogout = () => {
    localStorage.removeItem('af_admin_token')
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('af_reset_email')
    localStorage.removeItem('af_reset_token')
    setToken(null)
  }

  return (
    <HashRouter>
      <style>{`
        .app-suspense-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--page-bg, #1a1e29);
          color: var(--text-secondary, #a6b0cf);
          font-weight: 500;
          font-size: 1rem;
          gap: 12px;
        }
      `}</style>

      <Suspense
        fallback={
          <div className="app-suspense-loader">
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--accent-color, #ff7eb3)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            ></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading application...
          </div>
        }
      >
        <Routes>
          {/* Login - redirects to dashboard if already logged in */}
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
          />

          {/* Forgot Password - redirects to dashboard if already logged in */}
          <Route
            path="/forgot-password"
            element={token ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
          />

          {/* OTP Verification */}
          <Route
            path="/otp"
            element={token ? <Navigate to="/dashboard" replace /> : <OTP />}
          />

          {/* New Password */}
          <Route
            path="/new-password"
            element={token ? <Navigate to="/dashboard" replace /> : <NewPassword />}
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
      </Suspense>
    </HashRouter>
  )
}

export default App