// ============================================================
// Premium Profile Management Module (Theme Engine Enabled)
// ============================================================
// Features: Admin profile info, social links, avatar upload to API,
// secure password change with toggles, fully theme-aware.
// API: GET, PUT /api/auth/profile, PUT /api/auth/change-password, POST /api/upload
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Profile({ profileImage, onProfileImageChange, token }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Social Media States
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [linkedin, setLinkedin] = useState('')

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.name) setName(data.name)
          if (data.email) setEmail(data.email)
          if (data.profile_image) onProfileImageChange(data.profile_image)
          if (data.instagram) setInstagram(data.instagram)
          if (data.facebook) setFacebook(data.facebook)
          if (data.linkedin) setLinkedin(data.linkedin)
        }
      } catch {
        showToast('Failed to load profile data', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchProfile()
  }, [token])

  const handleSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name, 
          email, 
          profile_image: profileImage,
          instagram,
          facebook,
          linkedin,
        }),
      })
      if (res.ok) {
        showToast('Profile updated successfully!', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update profile', 'error')
      }
    } catch {
      showToast('Server error while saving profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!currentPass || !newPass || !confirmPass) {
      return showToast('Please fill all password fields', 'warning')
    }
    if (newPass !== confirmPass) {
      return showToast('New passwords do not match', 'error')
    }
    if (newPass.length < 6) {
      return showToast('Password must be at least 6 characters', 'warning')
    }

    setSavingPassword(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        showToast('Password changed successfully!', 'success')
        setCurrentPass('')
        setNewPass('')
        setConfirmPass('')
      } else {
        showToast(data.message || 'Failed to change password', 'error')
      }
    } catch {
      showToast('Server error while changing password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const fullUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        onProfileImageChange(fullUrl)
        showToast('Profile photo uploaded', 'success')
        // Also update site logo
        try {
          await fetch(`${API_BASE}/api/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ site_logo: fullUrl }),
          })
          localStorage.setItem('site_logo', fullUrl)
          window.dispatchEvent(new Event('logo-updated'))
        } catch {}
      } else {
        showToast('Failed to upload photo', 'error')
      }
    } catch {
      showToast('Server error during photo upload', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemovePhoto = () => {
    onProfileImageChange(null)
    showToast('Profile photo removed', 'success')
    // Also clear site logo
    try {
      fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ site_logo: '' }),
      })
      localStorage.setItem('site_logo', '')
      window.dispatchEvent(new Event('logo-updated'))
    } catch {}
  }

  const EyeOpen = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
  const EyeClosed = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px; }
        @media (max-width: 768px) { .p-profile-grid { grid-template-columns: 1fr; } }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 32px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card-title { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); }

        .p-avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
        .p-avatar-box { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-color); background: var(--header-bg); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); flex-shrink: 0; }
        .p-avatar-box img { width: 100%; height: 100%; object-fit: cover; }
        .p-avatar-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

        .p-input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus { border-color: var(--accent-color); }

        .p-pass-wrap { position: relative; display: flex; align-items: center; }
        .p-pass-wrap input { padding-right: 44px; }
        .p-eye-btn { position: absolute; right: 12px; background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; transition: color 0.2s; }
        .p-eye-btn:hover { color: var(--text-primary); }

        .p-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .p-btn-primary { background: var(--accent-color); color: #fff; width: 100%; margin-top: 8px; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .p-btn-secondary { background: var(--hover-bg); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px 16px; font-size: 0.85rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .p-btn-secondary:hover { background: var(--border-color); }
        
        .p-btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 16px; font-size: 0.85rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .p-btn-danger:hover { background: #ef4444; color: #fff; }

        .toast-premium {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);
          color: var(--text-primary); padding: 16px 24px; border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem;
          display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out;
        }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }
        .toast-premium.warning { border-left-color: #f59e0b; }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-profile-grid">
        {/* Profile Info Card */}
        <div className="p-card">
          <h3 className="p-card-title">Account Information</h3>
          <div className="p-avatar-section">
            <div className="p-avatar-box">
              {profileImage ? (
                <img src={profileImage} alt="Profile" />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            <div className="p-avatar-actions">
              <label className="p-btn-secondary" style={{ cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} hidden />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </label>
              {profileImage && (
                <button type="button" className="p-btn-danger" onClick={handleRemovePhoto}>
                  Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="p-input-group">
              <label className="p-label">Full Name</label>
              <input type="text" className="p-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" disabled={loading} />
            </div>
            
            <div className="p-input-group">
              <label className="p-label">Email Address</label>
              <input type="email" className="p-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" disabled={loading} />
            </div>

            <div className="p-input-group">
              <label className="p-label">Instagram Link</label>
              <input type="url" className="p-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." disabled={loading} />
            </div>

            <div className="p-input-group">
              <label className="p-label">Facebook Link</label>
              <input type="url" className="p-input" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." disabled={loading} />
            </div>

            <div className="p-input-group">
              <label className="p-label">LinkedIn Link</label>
              <input type="url" className="p-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." disabled={loading} />
            </div>

            <button type="submit" className="p-btn p-btn-primary" disabled={savingProfile || loading}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="p-card">
          <h3 className="p-card-title">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="p-input-group">
              <label className="p-label">Current Password</label>
              <div className="p-pass-wrap">
                <input type={showCurrent ? 'text' : 'password'} className="p-input" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="Enter current password" />
                <button type="button" className="p-eye-btn" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>
            
            <div className="p-input-group">
              <label className="p-label">New Password</label>
              <div className="p-pass-wrap">
                <input type={showNew ? 'text' : 'password'} className="p-input" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Enter new password" />
                <button type="button" className="p-eye-btn" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <div className="p-input-group">
              <label className="p-label">Confirm New Password</label>
              <div className="p-pass-wrap">
                <input type={showConfirm ? 'text' : 'password'} className="p-input" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm new password" />
                <button type="button" className="p-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <button type="submit" className="p-btn p-btn-primary" disabled={savingPassword}>
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile