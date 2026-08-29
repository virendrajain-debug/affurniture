import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Settings({ token }) {
  const [settings, setSettings] = useState({ site_logo: '', site_name: 'AF Furnishings' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/settings/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === 'object') {
            setSettings({
              site_logo: data.site_logo || '',
              site_name: data.site_name || 'AF Furnishings',
            })
          }
        }
      } catch {
        showToast('Failed to load settings', 'error')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchSettings()
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        showToast('Settings saved', 'success')
        localStorage.setItem('site_logo', settings.site_logo || '')
        window.dispatchEvent(new Event('logo-updated'))
      }
      else showToast('Failed to save', 'error')
    } catch {
      showToast('Server error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setSettings(prev => ({ ...prev, site_logo: data.url }))
        showToast('Logo uploaded — click Save to apply', 'success')
      }
    } catch {
      showToast('Upload failed', 'error')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 700 }}>
      <style>{`
        .ss-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px; margin-bottom: 20px; }
        .ss-card h3 { font-size: 1.1rem; color: var(--text-primary); margin: 0 0 20px; font-weight: 600; }
        .ss-field { margin-bottom: 20px; }
        .ss-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
        .ss-input { width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box; transition: border-color 0.2s; }
        .ss-input:focus { outline: none; border-color: var(--accent-color); }
        .ss-logo-wrap { display: flex; align-items: center; gap: 20px; }
        .ss-logo-preview { width: 120px; height: 80px; border-radius: 10px; border: 1px solid var(--border-color); object-fit: contain; background: var(--hover-bg); padding: 8px; }
        .ss-logo-placeholder { width: 120px; height: 80px; border-radius: 10px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; background: var(--hover-bg); }
        .ss-logo-placeholder:hover { border-color: var(--accent-color); color: var(--accent-color); }
        .ss-btn { padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; background: var(--accent-color); color: #fff; }
        .ss-btn:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .ss-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ss-toast { position: fixed; top: 24px; right: 24px; z-index: 9999; background: var(--sidebar-bg); border-left: 4px solid var(--accent-color); color: var(--text-primary); padding: 16px 24px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; animation: fadeIn 0.3s ease-out; }
        .ss-toast.error { border-left-color: #ef4444; }
        .ss-toast.success { border-left-color: #22c55e; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {toast && <div className={`ss-toast ${toast.type}`}>{toast.msg}</div>}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 4px', fontWeight: 600 }}>Site Settings</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Manage your site logo and name.</p>
      </div>

      {loading ? (
        <div className="ss-card">Loading settings...</div>
      ) : (
        <>
          <div className="ss-card">
            <h3>Site Logo</h3>
            <div className="ss-logo-wrap">
              <label className="ss-logo-placeholder">
                {settings.site_logo ? (
                  <img src={settings.site_logo} alt="Logo" className="ss-logo-preview" />
                ) : (
                  <>
                    + Upload Logo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) handleLogoUpload(e.target.files[0]) }} />
                  </>
                )}
              </label>
              {settings.site_logo && (
                <div>
                  <label className="cm-btn cm-btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    Change Logo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) handleLogoUpload(e.target.files[0]) }} />
                  </label>
                  <button
                    className="cm-btn cm-btn-ghost"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 8, marginLeft: 8, color: '#ef4444', borderColor: '#ef4444' }}
                    onClick={() => setSettings(prev => ({ ...prev, site_logo: '' }))}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ss-card">
            <h3>Site Name</h3>
            <div className="ss-field">
              <label className="ss-label">Company Name</label>
              <input
                type="text"
                className="ss-input"
                value={settings.site_name}
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                placeholder="AF Furnishings"
              />
            </div>
          </div>

          <button className="ss-btn" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </>
      )}
    </div>
  )
}

export default Settings
