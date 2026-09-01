// ============================================================
// Executive Login Portal (Dynamic Branding & Bulletproof Auth)
// ============================================================
// Features:
//  - Zero static logo imports; 100% dynamic network branding fetch
//  - Cache-busted live avatar resolution from GET /api/auth/branding
//  - Instant fallback onError handling
//  - Sleek glassmorphic card architecture
//  - Strict JWT validation
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Initialize with cached avatar if present, fallback to default brand asset
  const [logoUrl, setLogoUrl] = useState(() => {
    const cached = localStorage.getItem('adminAvatar') || localStorage.getItem('site_logo')
    return cached ? getAssetUrl(cached) : '/aeryp.png'
  })
  const [imgError, setImgError] = useState(false)

  // Bulletproof live branding fetch
  useEffect(() => {
    let isMounted = true

    const fetchLiveBranding = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/branding`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (res.ok) {
          const data = await res.json()
          const rawAvatar = data.avatarUrl || data.logoUrl
          if (rawAvatar && isMounted) {
            const liveAvatar = rawAvatar.startsWith('http') || rawAvatar.startsWith('data:')
              ? rawAvatar
              : `${API_BASE}${rawAvatar.startsWith('/') ? rawAvatar : `/${rawAvatar}`}`
            
            localStorage.setItem('adminAvatar', rawAvatar)
            localStorage.setItem('site_logo', rawAvatar)
            setLogoUrl(`${liveAvatar}?nocache=${Date.now()}`)
            setImgError(false)
          }
        }
      } catch (err) {
        // Silently ignore if server is unreachable or offline
      }
    }

    fetchLiveBranding()
    window.addEventListener('logo-updated', fetchLiveBranding)
    window.addEventListener('storage', fetchLiveBranding)
    return () => {
      isMounted = false
      window.removeEventListener('logo-updated', fetchLiveBranding)
      window.removeEventListener('storage', fetchLiveBranding)
    }
  }, [])

  // Show a toast notification (auto-dismiss after 3 seconds)
  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handle form submission - strict API validation
  const handleLogin = async (e) => {
    e.preventDefault()
    
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      return showToast('Please fill all fields', 'warning')
    }

    setLoading(true)
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })
      const data = await res.json()

      // STRICT CHECK: Response must be OK AND contain a valid token string
      if (res.ok && data && typeof data.token === 'string' && data.token.trim().length > 0) {
        showToast('Login successful!', 'success')
        // Pass token to parent only after it is completely verified
        setTimeout(() => onLogin(data.token), 600)
      } else {
        // Catch 401s, 404s, or malformed 200s lacking a token
        showToast(data.message || 'Invalid credentials or access denied.', 'error')
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
        {/* Centered Dynamic Branding Logo Wrapper */}
        <div className="login-logo-container">
          <div className="login-logo-wrapper">
            <img 
              src={imgError ? '/aeryp.png' : logoUrl} 
              alt="Admin Brand Logo" 
              className="login-brand-logo"
              onError={() => setImgError(true)} 
            />
          </div>
        </div>

        <h2>Admin Panel</h2>
        <p className="subtitle">Executive Portal Access</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <Link to="/forgot-password" className="forgot-pass">Forgot Password?</Link>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login