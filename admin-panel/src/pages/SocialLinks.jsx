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
  const [form, setForm] = useState({ platform: 'instagram', url: '', icon: 'instagram', sort_order: 0, enabled: true })

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/social/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLinks(data)
      }
    } catch {
      showToast('Failed to load social links', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLinks() }, [])

  const resetForm = () => {
    setForm({ platform: 'instagram', url: '', icon: 'instagram', sort_order: 0, enabled: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (link) => {
    setForm({
      platform: link.platform,
      url: link.url,
      icon: link.icon || link.platform,
      sort_order: link.sort_order,
      enabled: !!link.enabled,
    })
    setEditingId(link.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.url.trim()) {
      showToast('URL is required', 'error')
      return
    }
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `${API_BASE}/api/social/${editingId}` : `${API_BASE}/api/social`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        showToast(editingId ? 'Social link updated' : 'Social link added', 'success')
        resetForm()
        fetchLinks()
      } else {
        showToast('Failed to save', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this social link?')) return
    try {
      const res = await fetch(`${API_BASE}/api/social/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Social link deleted', 'success')
        fetchLinks()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggle = async (link) => {
    try {
      const res = await fetch(`${API_BASE}/api/social/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...link, enabled: link.enabled ? 0 : 1 }),
      })
      if (res.ok) fetchLinks()
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
    <div className="social-links-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <div>
          <h2>Social Media Links</h2>
          <p>Manage social media links displayed on the website</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>+ Add Link</button>
      </div>

      {showForm && (
        <div className="social-form-card">
          <h3>{editingId ? 'Edit Social Link' : 'Add New Social Link'}</h3>
          <div className="social-form-grid">
            <div className="form-group">
              <label>Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value, icon: e.target.value })}>
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                placeholder="https://www.instagram.com/yourpage"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Enabled
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Add Link'}</button>
            <button className="btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>
      ) : links.length === 0 ? (
        <div className="empty-state">
          <p>No social links configured yet.</p>
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>+ Add your first link</button>
        </div>
      ) : (
        <div className="social-links-list">
          {links.map((link) => (
            <div key={link.id} className={`social-link-item ${!link.enabled ? 'disabled' : ''}`}>
              <span className="social-link-icon">{getPlatformIcon(link.platform)}</span>
              <div className="social-link-info">
                <span className="social-link-platform">{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="social-link-url">{link.url}</a>
              </div>
              <span className="social-link-order">#{link.sort_order}</span>
              <div className="social-link-actions">
                <button className="btn-toggle" onClick={() => handleToggle(link)} title={link.enabled ? 'Disable' : 'Enable'}>
                  {link.enabled ? '👁️' : '👁️‍🗨️'}
                </button>
                <button className="btn-edit" onClick={() => handleEdit(link)} title="Edit">✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(link.id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SocialLinks
