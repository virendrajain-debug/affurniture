// ============================================================
// Premium Ad Campaign / Promotional Showcase Manager
// ============================================================
// Features: Visual Editor matching the storefront Weekly Special Banner,
// Badge/Tagline, Headline, Description/Price Subtext, CTA Button & Link,
// Background Image Uploader with live realistic preview, and Active toggle.
// API: /api/ad-campaigns, /api/upload
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function AdCampaign({ token }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  const authToken = getAuthToken(token)

  // Active or selected campaign form state
  const [activeForm, setActiveForm] = useState({
    id: null,
    name: 'Weekly Special Showcase',
    badge: 'AF WEEKLY SPECIAL',
    title: 'Bring comfort home.',
    description: 'Explore our latest living-room arrivals, all priced at $00.',
    cta_text: 'SHOP SOFAS',
    cta_link: '#sofas',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
    position: 'homepage',
    sort_order: 0,
    active: 1,
  })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/ad-campaigns`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setCampaigns(data)
          const primary = data[0]
          setActiveForm({
            id: primary.id,
            name: primary.name || 'Weekly Special Showcase',
            badge: primary.badge || 'AF WEEKLY SPECIAL',
            title: primary.title || 'Bring comfort home.',
            description: primary.description || 'Explore our latest living-room arrivals, all priced at $00.',
            cta_text: primary.cta_text || 'SHOP SOFAS',
            cta_link: primary.cta_link || primary.link || '#sofas',
            image: primary.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
            position: primary.position || 'homepage',
            sort_order: primary.sort_order || 0,
            active: primary.active !== undefined ? primary.active : 1,
          })
        } else {
          setCampaigns([])
        }
      }
    } catch {
      showToast('Failed to load ad campaigns', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleImageUpload = async (file) => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.imageUrl || data.url
        setActiveForm((prev) => ({ ...prev, image: url }))
        showToast('Background image uploaded successfully', 'success')
      } else {
        showToast('Image upload failed', 'error')
      }
    } catch {
      showToast('Server error uploading image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleActive = () => {
    setActiveForm((prev) => ({ ...prev, active: prev.active ? 0 : 1 }))
  }

  const handleResetDefaults = () => {
    setActiveForm({
      ...activeForm,
      badge: 'AF WEEKLY SPECIAL',
      title: 'Bring comfort home.',
      description: 'Explore our latest living-room arrivals, all priced at $00.',
      cta_text: 'SHOP SOFAS',
      cta_link: '#sofas',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
    })
    showToast('Reset to default values', 'info')
  }

  const handleSaveCampaign = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: activeForm.name || 'Weekly Special Showcase',
        badge: activeForm.badge,
        title: activeForm.title,
        description: activeForm.description,
        cta_text: activeForm.cta_text,
        cta_link: activeForm.cta_link,
        image: activeForm.image,
        position: activeForm.position || 'homepage',
        sort_order: activeForm.sort_order || 0,
        active: activeForm.active ? 1 : 0,
      }

      let res
      if (activeForm.id) {
        res = await fetch(`${API_BASE}/api/ad-campaigns/${activeForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${API_BASE}/api/ad-campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        showToast('Campaign published successfully', 'success')
        fetchCampaigns()
      } else {
        showToast('Failed to save campaign', 'error')
      }
    } catch {
      showToast('Server error while saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Ad Campaign & Promotional Showcase</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: activeForm.active ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
              {activeForm.active ? 'Active on Storefront' : 'Hidden'}
            </span>
            <input
              type="checkbox"
              checked={!!activeForm.active}
              onChange={handleToggleActive}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Live Realistic Storefront Preview */}
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '240px',
            marginBottom: '24px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }}
        >
          <img
            src={activeForm.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85'}
            alt={activeForm.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/1800x600?text=Promotional+Banner' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '30px',
              color: '#fff',
            }}
          >
            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '8px' }}>
              {activeForm.badge || 'AF WEEKLY SPECIAL'}
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
              {activeForm.title || 'Bring comfort home.'}
            </h1>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, margin: '0 0 16px', lineHeight: 1.4, maxWidth: '420px' }}>
              {activeForm.description || 'Explore our latest living-room arrivals.'}
            </p>
            <span className="btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 18px', fontSize: '0.8rem', pointerEvents: 'none' }}>
              {activeForm.cta_text || 'SHOP SOFAS'}
            </span>
          </div>
        </div>

        {/* Visual Form Editor */}
        <form onSubmit={handleSaveCampaign}>
          <div className="admin-grid-2">
            <div className="form-group">
              <label className="form-label">Badge / Eyebrow Text</label>
              <input
                type="text"
                className="form-input"
                value={activeForm.badge}
                onChange={(e) => setActiveForm({ ...activeForm, badge: e.target.value })}
                placeholder="e.g. AF WEEKLY SPECIAL"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Headline / Title</label>
              <input
                type="text"
                className="form-input"
                value={activeForm.title}
                onChange={(e) => setActiveForm({ ...activeForm, title: e.target.value })}
                placeholder="e.g. Bring comfort home."
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Price Subtext</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={activeForm.description}
              onChange={(e) => setActiveForm({ ...activeForm, description: e.target.value })}
              placeholder="e.g. Explore our latest living-room arrivals, all priced at $00."
              disabled={loading}
            />
          </div>

          <div className="admin-grid-2">
            <div className="form-group">
              <label className="form-label">CTA Button Label</label>
              <input
                type="text"
                className="form-input"
                value={activeForm.cta_text}
                onChange={(e) => setActiveForm({ ...activeForm, cta_text: e.target.value })}
                placeholder="e.g. SHOP SOFAS"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CTA Destination URL</label>
              <input
                type="text"
                className="form-input"
                value={activeForm.cta_link}
                onChange={(e) => setActiveForm({ ...activeForm, cta_link: e.target.value })}
                placeholder="e.g. #sofas or /category/living-room"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Background Banner Image *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                value={activeForm.image}
                onChange={(e) => setActiveForm({ ...activeForm, image: e.target.value })}
                placeholder="Enter background image URL or upload..."
                disabled={loading}
                style={{ flex: 1, minWidth: '220px' }}
              />
              <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="btn-primary" disabled={saving || uploading || loading}>
              {saving ? 'Saving...' : 'Save & Publish Campaign'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleResetDefaults}>
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdCampaign
