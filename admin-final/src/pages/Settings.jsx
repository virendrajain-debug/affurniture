// ============================================================
// Store Operations & Functional Settings Module
// ============================================================
// Features: Operational Store Contact Details, Business Registration & GST,
// Showroom Operating Hours, Checkout & Financing Options, and Storefront Palette.
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

const COLOR_FIELDS = [
  { key: 'primary_color', label: 'Primary Color', desc: 'Main brand headings & borders' },
  { key: 'accent_color', label: 'Accent / Gold', desc: 'Prices, links, highlight badges' },
  { key: 'bg_color', label: 'Background Color', desc: 'Storefront main page background' },
  { key: 'text_color', label: 'Text Color', desc: 'Body text and paragraph copy' },
  { key: 'button_color', label: 'Button Color', desc: 'Call to Action & Add to Cart' },
  { key: 'header_bg', label: 'Header Bar BG', desc: 'Top navigation background' },
]

function Settings({ token }) {
  const [settings, setSettings] = useState({
    site_name: 'AF Furnishings',
    site_tagline: 'Quality furniture for every New Zealand home',
    business_nzbn: '9429051234567',
    gst_number: '123-456-789',
    contact_phone: '0800 222 548',
    contact_email: 'affurniture@gmail.com',
    contact_address: 'Auckland, New Zealand',
    contact_hours: 'Mon - Sat: 9:00 AM - 5:00 PM | Sun: 10:00 AM - 4:00 PM',
    contact_map: '',
    admin_notification_email: '',
    enable_winz_quotes: '1',
    enable_finance_applications: '1',
    payment_methods_note: 'Visa, Mastercard, EFTPOS, Bank Transfer, WINZ Quotes & Easy Finance',
    delivery_policy_note: 'Standard 2-5 business day delivery across Auckland metropolitan area.',
    primary_color: '#28241f',
    accent_color: '#aa7a3e',
    bg_color: '#fffdf9',
    text_color: '#28241f',
    button_color: '#29251f',
    header_bg: '#29251f',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/settings/all`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === 'object') {
            setSettings((prev) => ({
              ...prev,
              ...data,
              site_name: data.site_name || prev.site_name || 'AF Furnishings',
            }))
          }
        }
      } catch {
        showToast('Failed to load settings', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        showToast('Operational settings saved successfully', 'success')
        localStorage.setItem('site_name', settings.site_name || 'AF Furnishings')
        window.dispatchEvent(new Event('settings-updated'))
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save settings', 'error')
      }
    } catch {
      showToast('Server error while saving settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleColorChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header" style={{ justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading operational settings...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Business Registration & Legal Entity */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Business Information & Legal Registration</h3>
            </div>

            <div className="admin-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Storefront Display Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.site_name}
                  onChange={(e) => setSettings((prev) => ({ ...prev, site_name: e.target.value }))}
                  placeholder="AF Furnishings"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Brand Tagline / Slogan</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.site_tagline || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, site_tagline: e.target.value }))}
                  placeholder="Comfort made for everyday living"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">NZ Business Number (NZBN)</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.business_nzbn || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, business_nzbn: e.target.value }))}
                  placeholder="e.g. 9429051234567"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">GST / Tax Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.gst_number || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, gst_number: e.target.value }))}
                  placeholder="e.g. 123-456-789"
                />
              </div>
            </div>
          </div>

          {/* 2. Customer Contact & Showroom Hours */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Primary Contact & Operating Hours</h3>
            </div>

            <div className="admin-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Toll-Free / Support Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact_phone || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="0800 222 548"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Customer Support Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="affurniture@gmail.com"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Admin Notification Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.admin_notification_email || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, admin_notification_email: e.target.value }))}
                  placeholder="Where to receive enquiry/finance/quote notifications"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  All customer enquiries, finance applications, and WINZ quotes will be sent here.
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Showroom Physical Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact_address || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact_address: e.target.value }))}
                  placeholder="Auckland, New Zealand"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Showroom Operating Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact_hours || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact_hours: e.target.value }))}
                  placeholder="Mon - Sat: 9am - 5pm, Sun: 10am - 4pm"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', margin: 0 }}>
                <label className="form-label">Google Maps Embed URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact_map || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contact_map: e.target.value }))}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </div>
            </div>
          </div>

          {/* 3. Checkout & Customer Financing Options */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Checkout & Financing Policies</h3>
            </div>

            <div className="admin-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">WINZ Quotes Submission Form</label>
                <select
                  className="form-select"
                  value={settings.enable_winz_quotes || '1'}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enable_winz_quotes: e.target.value }))}
                >
                  <option value="1">Enabled (Accept Online WINZ Quote Requests)</option>
                  <option value="0">Disabled (Hide WINZ Quote Forms)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Finance Applications Workflow</label>
                <select
                  className="form-select"
                  value={settings.enable_finance_applications || '1'}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enable_finance_applications: e.target.value }))}
                >
                  <option value="1">Enabled (Accept Customer Finance Applications)</option>
                  <option value="0">Disabled (Hide Finance Application Form)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment Methods Banner Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.payment_methods_note || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, payment_methods_note: e.target.value }))}
                  placeholder="Visa, Mastercard, EFTPOS, Bank Transfer, WINZ Quotes"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Delivery Note / Dispatch Terms</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.delivery_policy_note || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, delivery_policy_note: e.target.value }))}
                  placeholder="Standard 2-5 business day delivery across Auckland"
                />
              </div>
            </div>
          </div>

          {/* 4. Brand Color Palette */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Brand Color Palette</h3>
            </div>

            <div className="admin-grid-3" style={{ marginBottom: '20px' }}>
              {COLOR_FIELDS.map((cf) => (
                <div key={cf.key} style={{ background: 'var(--header-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>{cf.label}</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>{cf.desc}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={settings[cf.key] || '#000000'}
                      onChange={(e) => handleColorChange(cf.key, e.target.value)}
                      style={{ width: '40px', height: '36px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', padding: '2px', background: 'none' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={settings[cf.key] || ''}
                      onChange={(e) => handleColorChange(cf.key, e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Component Preview */}
            <div style={{ background: settings.bg_color || '#fffdf9', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-color)', color: settings.text_color || '#28241f' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: settings.accent_color || '#aa7a3e', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                Storefront Component Preview
              </span>
              <h4 style={{ margin: '0 0 8px 0', color: settings.primary_color || '#28241f', fontSize: '1.2rem', fontWeight: 800 }}>
                {settings.site_name || 'AF Furnishings'}
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: settings.text_color || '#28241f', opacity: 0.85 }}>
                {settings.site_tagline || 'Comfort made for everyday living.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: settings.button_color || '#29251f',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Shop Now
                </button>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: settings.accent_color || '#aa7a3e' }}>
                  $1,299 NZD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
