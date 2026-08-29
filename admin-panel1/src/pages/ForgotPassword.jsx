// ============================================================
// Forgot Password Page Component
// ============================================================
// Allows admin to request a password reset OTP.
// API: POST /api/auth/forgot-password with { email }
// ============================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return showToast('Please enter your email', 'warning')

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast(data.message || 'OTP sent to your email!', 'success')
        localStorage.setItem('af_reset_email', trimmedEmail)
        setTimeout(() => navigate('/otp'), 800)
      } else {
        showToast(data.message || 'Unable to send OTP. Please verify your email.', 'error')
      }
    } catch {
      showToast('Server connection failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="login-card">
        <img src="/aeryp.png" alt="AF Furniture" className="logo" />
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a verification code</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <Link to="/" className="back-link">Back to Login</Link>
      </div>
    </div>
  )
}

export default ForgotPassword