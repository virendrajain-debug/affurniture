// ============================================================
// Premium Contact Information Module (Theme Engine Enabled)
// ============================================================
// Features: Storefront contact settings management, API sync,
// fully integrated with global themes.
// API: GET /api/contact, PUT /api/contact
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Contact({ token }) {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    whatsapp: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/contact`)
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setContactInfo({
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              whatsapp: data.whatsapp || '',
            })
          }
        }
      } catch {
        // Fallback to defaults if backend route is not initialized
      } finally {
        setLoading(false)
      }
    }
    fetchContact()
  }, [])

  const handleChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactInfo),
      })
      if (res.ok) {
        showToast('Contact info updated successfully', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update contact info', 'error')
      }
    } catch {
      showToast('Server error while updating contact info', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-form-card { background: var(--sidebar-bg); border-radius: 12px; border: 1px solid var(--border-color); padding: 40px; width: 100%; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        
        .p-grid { display: grid; gap: 20px; margin-bottom: 20px; }
        .p-grid-2 { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 768px) { .p-grid-2 { grid-template-columns: 1fr; } }

        .p-input-group { display: flex; flex-direction: column; gap: 6px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus { border-color: var(--accent-color); }

        .p-form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--border-color); }
        .p-btn { padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .page-loading { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }

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

      {loading ? (
        <div className="page-loading">Loading contact information...</div>
      ) : (
        <form className="p-form-card" onSubmit={handleSave}>
          <div className="p-grid p-grid-2">
            <div className="p-input-group">
              <label className="p-label">Support Email</label>
              <input
                type="email"
                className="p-input"
                value={contactInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="support@affurnishing.co.nz"
              />
            </div>
            <div className="p-input-group">
              <label className="p-label">Primary Phone</label>
              <input
                type="text"
                className="p-input"
                value={contactInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+64 9 123 4567"
              />
            </div>
          </div>

          <div className="p-grid p-grid-2">
            <div className="p-input-group">
              <label className="p-label">WhatsApp Number</label>
              <input
                type="text"
                className="p-input"
                value={contactInfo.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+64 21 123 4567"
              />
            </div>
          </div>

          <div className="p-input-group" style={{ marginBottom: '20px' }}>
            <label className="p-label">Office Address</label>
            <textarea
              rows="4"
              className="p-input"
              value={contactInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter full office or store address..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="p-form-actions">
            <button type="submit" className="p-btn p-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Contact