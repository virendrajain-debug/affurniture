// ============================================================
// Premium Site Colors & Theme Settings Module (Theme Engine Enabled)
// ============================================================
// Features: Dynamic storefront color customization, live color pickers,
// real-time preview box, fully integrated with global themes.
// API: GET /api/settings/all, PUT /api/settings
// ============================================================

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
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/settings/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === 'object') setColors(data)
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
        body: JSON.stringify(colors),
      })
      if (res.ok) {
        showToast('Colors saved successfully', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save colors', 'error')
      }
    } catch {
      showToast('Server error while saving settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .p-action-bar h2 { font-size: 1.5rem; color: var(--text-primary); margin: 0 0 4px 0; font-weight: 600; }
        .p-action-bar p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }

        .p-color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .p-color-card {
          background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px;
          padding: 20px; display: flex; gap: 16px; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          transition: transform 0.2s, border-color 0.2s;
        }
        .p-color-card:hover { transform: translateY(-2px); border-color: var(--accent-color); }

        .p-color-preview { width: 48px; height: 48px; border-radius: 10px; border: 1px solid var(--border-color); flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        .p-color-info { flex: 1; min-width: 0; }
        .p-color-info label { display: block; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .p-color-info p { margin: 0 0 10px; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3; }

        .p-color-input-row { display: flex; gap: 8px; align-items: center; }
        .p-color-input-row input[type="color"] { -webkit-appearance: none; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; background: none; }
        .p-color-input-row input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        .p-color-input-row input[type="color"]::-webkit-color-swatch { border: 1px solid var(--border-color); border-radius: 6px; }
        
        .p-color-hex {
          flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);
          font-size: 0.85rem; color: var(--text-primary); background: var(--header-bg); outline: none;
          font-family: monospace; transition: border-color 0.2s;
        }
        .p-color-hex:focus { border-color: var(--accent-color); }

        .p-preview-section { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-preview-section h3 { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
        
        .p-preview-box { border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: all 0.3s ease; }
        .p-preview-header { padding: 14px 20px; font-weight: 600; font-size: 0.9rem; }
        .p-preview-content { padding: 24px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
        .p-preview-content h4 { margin: 0; font-size: 1.25rem; font-weight: 700; }
        .p-preview-content p { margin: 0; font-size: 0.9rem; opacity: 0.85; }
        .p-preview-price { font-size: 1.1rem; font-weight: 700; }
        .p-preview-content button { padding: 10px 20px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; margin-top: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

        .p-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
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
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-action-bar">
        <div>
          <h2>Site Colors</h2>
          <p>Pick colors for your storefront. Changes apply live on the frontend.</p>
        </div>
        <button className="p-btn p-btn-primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Colors'}
        </button>
      </div>

      {loading ? (
        <div className="page-loading">Loading site settings...</div>
      ) : (
        <div className="p-color-grid">
          {COLOR_FIELDS.map((f) => (
            <div className="p-color-card" key={f.key}>
              <div className="p-color-preview" style={{ background: colors[f.key] || '#ccc' }} />
              <div className="p-color-info">
                <label>{f.label}</label>
                <p>{f.desc}</p>
                <div className="p-color-input-row">
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
                    className="p-color-hex"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-preview-section">
        <h3>Live Preview Box</h3>
        <div
          className="p-preview-box"
          style={{
            background: colors.bg_color || '#fffdf9',
            color: colors.text_color || '#28241f',
          }}
        >
          <div className="p-preview-header" style={{ background: colors.header_bg || '#29251f', color: '#fff' }}>
            Storefront Header Preview
          </div>
          <div className="p-preview-content">
            <h4 style={{ color: colors.primary_color || '#28241f' }}>Elegant Furniture Collection</h4>
            <p>This is a live preview of how body paragraphs and product descriptions look on your site.</p>
            <span className="p-preview-price" style={{ color: colors.accent_color || '#aa7a3e' }}>
              $1,299.00
            </span>
            <button style={{ background: colors.button_color || '#29251f', color: '#fff' }}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings