import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const COLOR_FIELDS = [
  { key: 'primary_color', label: 'Primary Color', desc: 'Main brand color (headings, borders)' },
  { key: 'accent_color', label: 'Accent / Gold', desc: 'Highlight color (prices, links, badges)' },
  { key: 'bg_color', label: 'Background Color', desc: 'Main page background' },
  { key: 'text_color', label: 'Text Color', desc: 'Body text and paragraphs' },
  { key: 'button_color', label: 'Button Color', desc: 'Shop Now and CTA buttons' },
  { key: 'header_bg', label: 'Header Background', desc: 'Header bar background when scrolled' },
]

function Settings({ token }) {
  const [colors, setColors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setColors(data))
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(colors),
      })
      if (res.ok) {
        showToast('Colors saved successfully', 'success')
      } else {
        showToast('Failed to save', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
    setSaving(false)
  }

  const handleChange = (key, value) => {
    setColors({ ...colors, [key]: value })
  }

  return (
    <div className="settings-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <div>
          <h2>Site Colors</h2>
          <p>Pick colors for the website. Changes apply live on the frontend.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Colors'}
        </button>
      </div>

      {loading ? (
        <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>
      ) : (
        <div className="color-grid">
          {COLOR_FIELDS.map(f => (
            <div className="color-card" key={f.key}>
              <div className="color-preview" style={{ background: colors[f.key] || '#ccc' }} />
              <div className="color-info">
                <label>{f.label}</label>
                <p>{f.desc}</p>
                <div className="color-input-row">
                  <input
                    type="color"
                    value={colors[f.key] || '#000000'}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                  />
                  <input
                    type="text"
                    value={colors[f.key] || ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder="#000000"
                    className="color-hex"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="color-preview-section">
        <h3>Preview</h3>
        <div className="color-preview-box" style={{
          background: colors.bg_color || '#fffdf9',
          color: colors.text_color || '#28241f',
        }}>
          <div className="color-preview-header" style={{ background: colors.header_bg || '#29251f', color: '#fff' }}>
            Header Preview
          </div>
          <div className="color-preview-content">
            <h4 style={{ color: colors.primary_color || '#28241f' }}>Heading Text</h4>
            <p>This is how body text will look on your site.</p>
            <span className="color-preview-price" style={{ color: colors.accent_color || '#aa7a3e' }}>$1,299</span>
            <button style={{ background: colors.button_color || '#29251f', color: '#fff' }}>Shop Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
