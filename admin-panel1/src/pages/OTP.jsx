// ============================================================
// OTP Verification Page Component
// ============================================================
// 6-digit OTP input for password reset verification.
// API: POST /api/auth/verify-otp with { email, otp }
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'

function OTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const inputRefs = useRef([])
  const navigate = useNavigate()

  const email = localStorage.getItem('af_reset_email')

  useEffect(() => {
    if (!email) navigate('/forgot-password')
  }, [email, navigate])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''))
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return showToast('Please enter complete 6-digit OTP', 'warning')

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast('OTP verified! Redirecting...', 'success')
        const tokenVal = data.resetToken || data.token || code
        localStorage.setItem('af_reset_token', tokenVal)
        setTimeout(() => navigate('/new-password'), 800)
      } else {
        showToast(data.message || 'Invalid or expired OTP', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="login-card">
        <img src="/aeryp.png" alt="AF Furniture" className="logo" />
        <h2>Verify OTP</h2>
        <p className="subtitle">Enter the 6-digit code sent to {email}</p>

        <form onSubmit={handleVerify}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="otp-box"
              />
            ))}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button type="button" className="back-link" onClick={() => navigate('/forgot-password')}>
          Change Email
        </button>
      </div>
    </div>
  )
}

export default OTP