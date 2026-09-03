// ============================================================
// Premium Profile Management Module
// ============================================================
// Features: Admin profile info, social links, avatar upload to API,
// secure password change with toggles, fully theme-aware.
// API: GET, PUT /api/auth/profile, PUT /api/auth/change-password, POST /api/upload
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function Profile({ profileImage, onProfileImageChange, token }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Social Media States
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')

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

  const authToken = getAuthToken(token)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.name) setName(data.name)
          if (data.email) setEmail(data.email)
          const avatar = data.avatar_url || data.profile_image || ''
          if (avatar) {
            onProfileImageChange(avatar)
            localStorage.setItem('adminAvatar', avatar)
            // profile image only
          }
          if (data.instagram) setInstagram(data.instagram)
          if (data.facebook) setFacebook(data.facebook)
          if (data.linkedin) setLinkedin(data.linkedin)
          if (data.twitter) setTwitter(data.twitter)
        }
      } catch {
        showToast('Failed to load profile data', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (authToken) fetchProfile()
  }, [token])

  const handleSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          name, 
          email, 
          avatar_url: profileImage,
          profile_image: profileImage,
          instagram,
          facebook,
          linkedin,
          twitter,
        }),
      })
      if (res.ok) {
        const resData = await res.json().catch(() => ({}))
        const savedAvatar = resData.avatarUrl || resData.avatar_url || profileImage
        if (savedAvatar) {
          localStorage.setItem('adminAvatar', savedAvatar)
          // profile image only
        }
        window.dispatchEvent(new Event('logo-updated'))
        window.dispatchEvent(new Event('storage'))
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
      return showToast('Please fill out all password fields', 'warning')
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
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      })
      if (res.ok) {
        showToast('Password changed successfully!', 'success')
        setCurrentPass('')
        setNewPass('')
        setConfirmPass('')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update password', 'error')
      }
    } catch {
      showToast('Server error while updating password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload/single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.imageUrl || data.url || ''
        onProfileImageChange(url)
        localStorage.setItem('adminAvatar', url)
        localStorage.setItem('site_logo', url)
        window.dispatchEvent(new Event('logo-updated'))
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: url }))
        
        // Auto-save to profile
        await fetch(`${API_BASE}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ 
            name, 
            email, 
            avatar_url: url,
            profile_image: url, 
            instagram, 
            facebook, 
            linkedin, 
            twitter 
          }),
        })

        // Sync profile photo as site logo for website header/footer
        await fetch(`${API_BASE}/api/settings/global`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ site_logo: url }),
        })

        showToast('Profile photo updated!', 'success')
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch {
      showToast('Error uploading avatar', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemovePhoto = async () => {
    onProfileImageChange('')
    localStorage.removeItem('adminAvatar')
    localStorage.removeItem('site_logo')
    window.dispatchEvent(new Event('logo-updated'))
    window.dispatchEvent(new Event('storage'))
    try {
      await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          name, 
          email, 
          avatar_url: '',
          profile_image: '', 
          instagram, 
          facebook, 
          linkedin, 
          twitter 
        }),
      })

      // Clear site logo in global settings too
      await fetch(`${API_BASE}/api/settings/global`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ site_logo: '' }),
      })

      showToast('Profile photo removed', 'info')
    } catch {
      showToast('Error saving changes', 'error')
    }
  }

  const EyeOpen = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const EyeClosed = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-grid-2">
        {/* Profile Info Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Account Information</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-color)', background: 'var(--header-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
              {profileImage ? (
                <img src={getAssetUrl(profileImage)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="btn-secondary" style={{ cursor: uploadingAvatar ? 'not-allowed' : 'pointer' }}>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} hidden />
                {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </label>
              {profileImage && (
                <button type="button" className="btn-action btn-delete" onClick={handleRemovePhoto}>
                  Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" disabled={loading} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram Link</label>
              <input type="url" className="form-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Facebook Link</label>
              <input type="url" className="form-input" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Link</label>
              <input type="url" className="form-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Twitter / X Link</label>
              <input type="url" className="form-input" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." disabled={loading} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }} disabled={savingProfile || loading}>
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showCurrent ? 'text' : 'password'} className="form-input" style={{ paddingRight: '40px' }} value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="Enter current password" />
                <button type="button" style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showNew ? 'text' : 'password'} className="form-input" style={{ paddingRight: '40px' }} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Enter new password" />
                <button type="button" style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showConfirm ? 'text' : 'password'} className="form-input" style={{ paddingRight: '40px' }} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Confirm new password" />
                <button type="button" style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }} disabled={savingPassword}>
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile