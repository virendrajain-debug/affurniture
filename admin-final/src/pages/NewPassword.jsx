// ============================================================
// New Password Reset Page Component
// ============================================================
// Sets new password using the validated reset token.
// API: POST /api/auth/reset-password with { email, newPassword, resetToken }
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const email = localStorage.getItem('af_reset_email')
  const resetToken = localStorage.getItem('af_reset_token')

  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/forgot-password')
    }
  }, [email, resetToken, navigate])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return showToast('Please enter a new password', 'warning')
    if (password.length < 6) return showToast('Password must be at least 6 characters', 'warning')
    if (password !== confirm) return showToast('Passwords do not match', 'warning')

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password, resetToken }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast('Password reset successful! Redirecting to login...', 'success')
        localStorage.removeItem('af_reset_email')
        localStorage.removeItem('af_reset_token')
        setTimeout(() => navigate('/'), 1000)
      } else {
        showToast(data.message || 'Failed to reset password', 'error')
      }
    } catch {
      showToast('Server error while resetting password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="login-card">
        <img src="/aeryp.png" alt="AF Furniture" className="logo" />
        <h2>New Password</h2>
        <p className="subtitle">Enter your new password below</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button type="button" className="back-link" onClick={() => navigate('/')}>
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default NewPassword