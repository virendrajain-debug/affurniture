// ============================================================
// Phase 1: Dynamic Global Settings Management Module
// ============================================================
// Single-column, vertical layout form (No tabs, No live preview, No split-screens).
// Manages: Brand Identity, Logo, Support Phone/Email, Address, Hours, Social Media, Footer.
// API: GET /api/settings/global & PUT /api/settings/global, POST /api/upload
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function GlobalSettings({ token }) {
  const [form, setForm] = useState({
    // 1. Brand & Header Identity
    site_name: 'AF Furnishings',
    site_tagline: 'Quality furniture for every New Zealand home',
    site_logo: '',
    announcement_bar_text: 'Welcome to AF Furnishings • Quality pieces for every home',

    // 2. Contact & Customer Support
    contact_phone: '0800 222 548',
    contact_email: 'affurniture@gmail.com',
    contact_address: 'Auckland, New Zealand',
    operating_hours: 'Mon - Sat: 9:00 AM - 5:30 PM | Sun: 10:00 AM - 4:00 PM',

    // 3. Social Media Channels
    facebook_url: 'https://facebook.com/affurnishings',
    instagram_url: 'https://instagram.com/affurnishings',

    // 4. Footer & Legal
    footer_text: '© 2026 AF Furnishings. All rights reserved.',
    footer_tagline: 'Secure payments • Friendly service • Home delivery',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Fetch current global settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/settings/global`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === 'object') {
            const incoming = data.settings || data
            setForm((prev) => ({
              ...prev,
              site_name: incoming.site_name || incoming.store_name || prev.site_name,
              site_tagline: incoming.site_tagline || prev.site_tagline,
              site_logo: incoming.site_logo || prev.site_logo,
              announcement_bar_text: incoming.announcement_bar_text || prev.announcement_bar_text,
              contact_phone: incoming.contact_phone || incoming.phone || prev.contact_phone,
              contact_email: incoming.contact_email || incoming.customer_service_email || incoming.email || prev.contact_email,
              contact_address: incoming.contact_address || incoming.address || prev.contact_address,
              operating_hours: incoming.operating_hours || incoming.business_hours || prev.operating_hours,
              facebook_url: incoming.facebook_url || incoming.facebook || prev.facebook_url,
              instagram_url: incoming.instagram_url || incoming.instagram || prev.instagram_url,
              footer_text: incoming.footer_text || incoming.footer_copyright || prev.footer_text,
              footer_tagline: incoming.footer_tagline || prev.footer_tagline,
            }))
          }
        }
      } catch {
        showToast('Failed to connect to backend server', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Logo Upload
  const handleLogoUpload = async (file) => {
    if (!file) return
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.url || data.imageUrl || data.image_url || data.secure_url
        if (url) {
          setForm((prev) => ({ ...prev, site_logo: url }))
          localStorage.setItem('site_logo', url)
          window.dispatchEvent(new Event('logo-updated'))
          showToast('Brand logo uploaded successfully!', 'success')
        }
      } else {
        showToast('Failed to upload image file', 'error')
      }
    } catch {
      showToast('Error uploading logo image', 'error')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Save Settings to Backend API
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      store_name: form.site_name,
      phone: form.contact_phone,
      email: form.contact_email,
      customer_service_email: form.contact_email,
      address: form.contact_address,
      business_hours: form.operating_hours,
      facebook: form.facebook_url,
      instagram: form.instagram_url,
      footer_copyright: form.footer_text,
    }

    try {
      const res = await fetch(`${API_BASE}/api/settings/global`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        // Persist to local cache for instant UI reflection
        localStorage.setItem('site_name', form.site_name)
        if (form.site_logo) localStorage.setItem('site_logo', form.site_logo)
        
        window.dispatchEvent(new Event('settings-updated'))
        window.dispatchEvent(new Event('logo-updated'))
        showToast(data.message || 'Global settings saved and published successfully!', 'success')
      } else {
        showToast(data.message || 'Failed to save settings', 'error')
      }
    } catch (err) {
      console.error('Settings save error:', err)
      showToast('Server error while saving global settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="global-settings-container">
      <style>{`
        .global-settings-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          color: var(--text-primary);
        }

        .gs-header-box {
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .gs-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }

        .gs-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .gs-form-vertical {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .gs-card {
          background: var(--card-bg, rgba(255, 255, 255, 0.03));
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .gs-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .gs-card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .gs-card-header span {
          font-size: 0.78rem;
          color: var(--accent-color, #d4af37);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gs-field-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .gs-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gs-field-group.full-width {
          grid-column: 1 / -1;
        }

        .gs-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gs-hint {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .gs-input,
        .gs-textarea {
          width: 100%;
          padding: 12px 14px;
          background: var(--input-bg, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.92rem;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .gs-input:focus,
        .gs-textarea:focus {
          outline: none;
          border-color: var(--accent-color, #d4af37);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        .gs-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .gs-logo-uploader-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .gs-logo-preview-box {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 6px;
          flex-shrink: 0;
        }

        .gs-logo-preview-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .gs-logo-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 240px;
        }

        .gs-upload-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--hover-bg, rgba(255, 255, 255, 0.08));
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: fit-content;
        }

        .gs-upload-btn:hover {
          background: var(--border-color);
          border-color: var(--accent-color, #d4af37);
        }

        .gs-submit-bar {
          position: sticky;
          bottom: 20px;
          background: var(--header-bg, #1a2238);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          z-index: 50;
        }

        .gs-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--accent-color, #d4af37);
          color: #000;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gs-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
        }

        .gs-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gs-toast {
          position: fixed;
          bottom: 90px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          z-index: 1000;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
          animation: toastIn 0.25s ease;
        }
        .gs-toast.success { background: #10b981; color: #fff; }
        .gs-toast.error { background: #ef4444; color: #fff; }
        .gs-toast.info { background: #3b82f6; color: #fff; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {toast && <div className={`gs-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="gs-header-box">
        <div>
          <h2 className="gs-title">Global Store Settings</h2>
          <p className="gs-subtitle">Manage store-wide brand identity, contact channels, social profiles, and footer copy.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading store settings...
        </div>
      ) : (
        <form className="gs-form-vertical" onSubmit={handleSave}>
          
          {/* Section 1: Brand & Header Identity */}
          <div className="gs-card">
            <div className="gs-card-header">
              <span>01</span>
              <h3>Brand Identity &amp; Header</h3>
            </div>
            <div className="gs-field-grid">
              <div className="gs-field-group">
                <label className="gs-label">
                  Brand / Store Name
                  <span className="gs-hint">Displayed in header &amp; titles</span>
                </label>
                <input
                  type="text"
                  name="site_name"
                  value={form.site_name}
                  onChange={handleChange}
                  placeholder="e.g. AF Furnishings"
                  className="gs-input"
                  required
                />
              </div>

              <div className="gs-field-group">
                <label className="gs-label">
                  Brand Tagline
                  <span className="gs-hint">Subtitle in header &amp; metadata</span>
                </label>
                <input
                  type="text"
                  name="site_tagline"
                  value={form.site_tagline}
                  onChange={handleChange}
                  placeholder="e.g. Quality furniture for every NZ home"
                  className="gs-input"
                />
              </div>

              <div className="gs-field-group full-width">
                <label className="gs-label">
                  Top Announcement Bar Message
                  <span className="gs-hint">Notice pinned at the very top of storefront</span>
                </label>
                <input
                  type="text"
                  name="announcement_bar_text"
                  value={form.announcement_bar_text}
                  onChange={handleChange}
                  placeholder="e.g. Welcome to AF Furnishings • Free Auckland Delivery on orders over $1,000"
                  className="gs-input"
                />
              </div>

              <div className="gs-field-group full-width">
                <label className="gs-label">Brand Logo</label>
                <div className="gs-logo-uploader-row">
                  <div className="gs-logo-preview-box">
                    {form.site_logo ? (
                      <img
                        src={getAssetUrl(form.site_logo)}
                        alt="Store Logo"
                        onError={(e) => { e.target.src = '/logo.png' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No Logo</span>
                    )}
                  </div>
                  <div className="gs-logo-actions">
                    <button
                      type="button"
                      className="gs-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {uploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleLogoUpload(e.target.files[0])
                        }
                      }}
                    />
                    <input
                      type="text"
                      name="site_logo"
                      value={form.site_logo}
                      onChange={handleChange}
                      placeholder="Or enter direct image URL (https://...)"
                      className="gs-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Customer Support */}
          <div className="gs-card">
            <div className="gs-card-header">
              <span>02</span>
              <h3>Customer Support &amp; Store Contact</h3>
            </div>
            <div className="gs-field-grid">
              <div className="gs-field-group">
                <label className="gs-label">Support Phone Number</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  placeholder="e.g. 0800 222 548"
                  className="gs-input"
                  required
                />
              </div>

              <div className="gs-field-group">
                <label className="gs-label">Customer Support Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="e.g. affurniture@gmail.com"
                  className="gs-input"
                  required
                />
              </div>

              <div className="gs-field-group">
                <label className="gs-label">Physical Store / Showroom Address</label>
                <input
                  type="text"
                  name="contact_address"
                  value={form.contact_address}
                  onChange={handleChange}
                  placeholder="e.g. Auckland, New Zealand"
                  className="gs-input"
                />
              </div>

              <div className="gs-field-group">
                <label className="gs-label">Operating / Showroom Hours</label>
                <input
                  type="text"
                  name="operating_hours"
                  value={form.operating_hours}
                  onChange={handleChange}
                  placeholder="e.g. Mon - Sat: 9:00 AM - 5:30 PM"
                  className="gs-input"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Media Channels */}
          <div className="gs-card">
            <div className="gs-card-header">
              <span>03</span>
              <h3>Social Media Profiles</h3>
            </div>
            <div className="gs-field-grid">
              <div className="gs-field-group">
                <label className="gs-label">Facebook Profile URL</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={form.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="gs-input"
                />
              </div>

              <div className="gs-field-group">
                <label className="gs-label">Instagram Profile URL</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={form.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="gs-input"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Footer & Legal Information */}
          <div className="gs-card">
            <div className="gs-card-header">
              <span>04</span>
              <h3>Footer &amp; Legal Notices</h3>
            </div>
            <div className="gs-field-grid">
              <div className="gs-field-group full-width">
                <label className="gs-label">Footer Copyright Notice</label>
                <input
                  type="text"
                  name="footer_text"
                  value={form.footer_text}
                  onChange={handleChange}
                  placeholder="e.g. © 2026 AF Furnishings. All rights reserved."
                  className="gs-input"
                />
              </div>

              <div className="gs-field-group full-width">
                <label className="gs-label">Footer Bottom Sub-Tagline / Badges Note</label>
                <input
                  type="text"
                  name="footer_tagline"
                  value={form.footer_tagline}
                  onChange={handleChange}
                  placeholder="e.g. Secure payments • Friendly service • Home delivery"
                  className="gs-input"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="gs-submit-bar">
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Ready to Publish?</strong>
              <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>Changes take effect on the storefront immediately.</span>
            </div>
            <button type="submit" className="gs-save-btn" disabled={saving}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {saving ? 'Saving Settings...' : 'Save Global Settings'}
            </button>
          </div>

        </form>
      )}
    </div>
  )
}

export default GlobalSettings;
