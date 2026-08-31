// ============================================================
// Premium Social Media Links Module (Theme Engine Enabled)
// ============================================================
// Features: Social platform link management, custom sort order,
// enable/disable toggles, fully integrated with global themes.
// API: GET /api/social/all, POST, PUT /:id, DELETE /:id
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const PLATFORM_OPTIONS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Pinterest', value: 'pinterest' },
  { label: 'Twitter / X', value: 'twitter' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Other', value: 'other' },
]

function SocialLinks({ token }) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    platform: 'instagram',
    url: '',
    icon: 'instagram',
    sort_order: 0,
    enabled: 1,
  })

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/social/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setLinks(data)
      } else {
        showToast('Failed to load social links', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchLinks()
  }, [token])

  const resetForm = () => {
    setForm({
      platform: 'instagram',
      url: '',
      icon: 'instagram',
      sort_order: 0,
      enabled: 1,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (link) => {
    setForm({
      platform: link.platform || 'instagram',
      url: link.url || '',
      icon: link.icon || link.platform || 'instagram',
      sort_order: link.sort_order ?? 0,
      enabled: link.enabled ? 1 : 0,
    })
    setEditingId(link.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.url.trim()) {
      return showToast('URL is required', 'error')
    }

    const payload = {
      platform: form.platform,
      url: form.url.trim(),
      icon: form.icon || form.platform,
      sort_order: Number(form.sort_order) || 0,
      enabled: form.enabled ? 1 : 0,
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `${API_BASE}/api/social/${editingId}` : `${API_BASE}/api/social`

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(
          editingId ? 'Social link updated successfully' : 'Social link added successfully',
          'success'
        )
        resetForm()
        fetchLinks()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save social link', 'error')
      }
    } catch {
      showToast('Server error while saving', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this social link?')) return
    try {
      const res = await fetch(`${API_BASE}/api/social/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Social link deleted', 'success')
        setLinks((prev) => prev.filter((l) => l.id !== id))
      } else {
        showToast('Failed to delete link', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggle = async (link) => {
    const newEnabledState = link.enabled ? 0 : 1
    try {
      const res = await fetch(`${API_BASE}/api/social/${link.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...link,
          enabled: newEnabledState,
        }),
      })
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, enabled: newEnabledState } : l))
        )
      } else {
        showToast('Failed to update status', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: '📷',
      facebook: '📘',
      pinterest: '📌',
      twitter: '🐦',
      youtube: '▶️',
      tiktok: '🎵',
      linkedin: '💼',
      whatsapp: '💬',
      other: '🔗',
    }
    return icons[platform] || '🔗'
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-action-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .p-action-bar h2 { font-size: 1.5rem; color: var(--text-primary); margin: 0 0 4px 0; font-weight: 600; }
        .p-action-bar p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }

        .p-form-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-form-card h3 { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); }
        
        .p-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
        @media(max-width: 768px) { .p-grid { grid-template-columns: 1fr; } }

        .p-input-group { display: flex; flex-direction: column; gap: 6px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        .p-input, .p-select { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus, .p-select:focus { border-color: var(--accent-color); }
        .p-select { cursor: pointer; }

        .p-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem; color: var(--text-primary); font-weight: 500; }
        .p-checkbox-label input { width: 18px; height: 18px; accent-color: var(--accent-color); cursor: pointer; }

        .p-form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

        .p-links-list { display: flex; flex-direction: column; gap: 12px; }
        .p-link-item {
          background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px;
          padding: 16px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          transition: transform 0.2s, border-color 0.2s;
        }
        .p-link-item:hover { transform: translateY(-2px); border-color: var(--accent-color); }
        .p-link-item.disabled { opacity: 0.5; }

        .p-link-icon { font-size: 1.5rem; width: 40px; height: 40px; border-radius: 8px; background: var(--header-bg); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); flex-shrink: 0; }
        .p-link-info { flex: 1; min-width: 0; }
        .p-link-platform { font-weight: 600; color: var(--text-primary); font-size: 1rem; display: block; margin-bottom: 2px; }
        .p-link-url { font-size: 0.85rem; color: var(--accent-color); text-decoration: none; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .p-link-url:hover { text-decoration: underline; }

        .p-link-order { font-size: 0.8rem; color: var(--text-secondary); font-family: monospace; background: var(--header-bg); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); }

        .p-link-actions { display: flex; gap: 8px; align-items: center; }
        .p-action-icon-btn { background: var(--header-bg); border: 1px solid var(--border-color); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .p-action-icon-btn:hover { background: var(--hover-bg); color: var(--text-primary); border-color: var(--accent-color); }
        .p-action-icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }

        .page-loading, .empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 12px 0 16px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

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

      <div className="p-action-bar">
        <div>
          <h2>Social Media Links</h2>
          <p>Manage and configure social links displayed across your storefront.</p>
        </div>
        {!showForm && (
          <button className="p-btn p-btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>+ Add Link</button>
        )}
      </div>

      {showForm && (
        <div className="p-form-card">
          <h3>{editingId ? 'Edit Social Link' : 'Add New Social Link'}</h3>
          <form onSubmit={handleSave}>
            <div className="p-grid">
              <div className="p-input-group">
                <label className="p-label">Platform</label>
                <select 
                  className="p-select" 
                  value={form.platform} 
                  onChange={(e) => setForm({ ...form, platform: e.target.value, icon: e.target.value })}
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="p-input-group">
                <label className="p-label">Profile URL</label>
                <input
                  type="url"
                  className="p-input"
                  placeholder="https://www.instagram.com/yourpage"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                />
              </div>

              <div className="p-input-group">
                <label className="p-label">Sort Order</label>
                <input
                  type="number"
                  className="p-input"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="p-input-group" style={{ justifyContent: 'center' }}>
                <label className="p-checkbox-label" style={{ marginTop: '18px' }}>
                  <input
                    type="checkbox"
                    checked={form.enabled === 1 || form.enabled === true}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked ? 1 : 0 })}
                  />
                  Enable on Storefront
                </label>
              </div>
            </div>

            <div className="p-form-actions">
              <button type="button" className="p-btn p-btn-outline" onClick={resetForm}>Cancel</button>
              <button type="submit" className="p-btn p-btn-primary">{editingId ? 'Update Link' : 'Save Link'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading social links...</div>
      ) : links.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          <p>No social links configured yet.</p>
          <button className="p-btn p-btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>+ Add your first link</button>
        </div>
      ) : (
        <div className="p-links-list">
          {links.map((link) => (
            <div key={link.id} className={`p-link-item ${!link.enabled ? 'disabled' : ''}`}>
              <span className="p-link-icon">{getPlatformIcon(link.platform)}</span>
              <div className="p-link-info">
                <span className="p-link-platform">{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-link-url">{link.url}</a>
              </div>
              <span className="p-link-order" title="Sort Order">#{link.sort_order ?? 0}</span>
              <div className="p-link-actions">
                <button className="p-action-icon-btn" onClick={() => handleToggle(link)} title={link.enabled ? 'Disable link' : 'Enable link'}>
                  {link.enabled ? '👁️' : '🚫'}
                </button>
                <button className="p-action-icon-btn" onClick={() => handleEdit(link)} title="Edit link">
                  ✏️
                </button>
                <button className="p-action-icon-btn delete" onClick={() => handleDelete(link.id)} title="Delete link">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SocialLinks