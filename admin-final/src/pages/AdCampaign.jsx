// ============================================================
// Premium Ad Campaign Studio (Storefront Promo Poster Control)
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function AdCampaign({ token }) {
  const [form, setForm] = useState({
    badge: 'AF WEEKLY SPECIAL',
    title: 'Bring comfort home.',
    subtitle: 'Explore our latest living-room arrivals, all priced at $00.',
    button_text: 'VIEW',
    button_link: '/category/living',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
    directUrl: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mediaGallery, setMediaGallery] = useState([])
  const [showGallery, setShowGallery] = useState(false)
  const [toast, setToast] = useState(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchCampaign = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/ad-campaigns`)
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object') {
          setForm({
            badge: data.badge || 'AF WEEKLY SPECIAL',
            title: data.title || 'Bring comfort home.',
            subtitle: data.subtitle || data.description || 'Explore our latest living-room arrivals, all priced at $00.',
            button_text: data.button_text || data.cta_text || 'VIEW',
            button_link: data.button_link || data.cta_link || '/category/living',
            image: data.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
            directUrl: '',
          })
        }
      }
    } catch {
      showToast('Failed to load ad campaign from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchMediaGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/media-gallery`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setMediaGallery(data)
      }
    } catch {}
  }

  useEffect(() => {
    fetchCampaign()
    fetchMediaGallery()
  }, [])

  const handleUploadImage = async (file) => {
    if (!file) return
    setUploading(true)

    const previewUrl = URL.createObjectURL(file)
    setForm(prev => ({ ...prev, image: previewUrl }))

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
        const url = data.url || data.imageUrl || data.image_url
        if (url) {
          setForm(prev => ({ ...prev, image: url }))
          showToast('Image uploaded! Click "Publish to Website" to save.', 'success')
          fetchMediaGallery()
        }
      } else {
        showToast('Upload failed on server. You can also paste direct URL.', 'warning')
      }
    } catch {
      showToast('Image upload connection error', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteGalleryItem = async (e, item) => {
    e.stopPropagation()
    if (!window.confirm('Delete this image from the gallery?')) return

    try {
      const res = await fetch(`${API_BASE}/api/media-gallery/${encodeURIComponent(item.id || item.filename)}?url=${encodeURIComponent(item.url)}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Image removed from gallery', 'info')
        fetchMediaGallery()
      }
    } catch {
      showToast('Failed to delete image', 'error')
    }
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!form.image?.trim()) return showToast('Please upload or set a banner graphic image', 'warning')
    if (!form.title?.trim()) return showToast('Please enter a campaign headline', 'warning')

    setSaving(true)
    try {
      const payload = {
        badge: form.badge.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.subtitle.trim(),
        button_text: form.button_text.trim(),
        cta_text: form.button_text.trim(),
        button_link: form.button_link.trim(),
        cta_link: form.button_link.trim(),
        image: form.image.trim(),
      }

      const res = await fetch(`${API_BASE}/api/ad-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('Ad Campaign published live to website frontend!', 'success')
        fetchCampaign()
        fetchMediaGallery()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to save campaign', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Top Header & Action Bar */}
      <div
        className="filter-toolbar"
        style={{
          background: 'var(--sidebar-bg, #111827)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Website Ad Campaign Poster
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Directly controls the mid-page promotional ad poster on the homepage
          </span>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={saving || uploading}
          style={{ padding: '9px 24px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {saving ? 'Publishing...' : 'Publish to Website'}
        </button>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading active Ad Campaign...
        </div>
      ) : (
        <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Row 1: Eyebrow Badge & Headline Title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Campaign Eyebrow Badge</label>
              <input
                type="text"
                className="form-input"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. AF WEEKLY SPECIAL"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Main Headline / Title *</label>
              <input
                type="text"
                className="form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Bring comfort home."
                required
              />
            </div>
          </div>

          {/* Row 2: Description Subtitle */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Description Subtitle / Body Copy</label>
            <textarea
              className="form-input"
              rows="3"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Explore our latest living-room arrivals, all priced at $00."
            />
          </div>

          {/* Row 3: Button Label & Link */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>CTA Button Label</label>
              <input
                type="text"
                className="form-input"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                placeholder="e.g. VIEW"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Button Destination Link / Route</label>
              <input
                type="text"
                className="form-input"
                value={form.button_link}
                onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                placeholder="e.g. /category/living or /on-sale"
              />
            </div>
          </div>

          {/* Row 4: Background Image Graphic with Controls */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Campaign Background Graphic</label>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => document.getElementById('ad-campaign-upload')?.click()}
                style={{ padding: '7px 16px', fontSize: '0.82rem', background: 'var(--accent-color, #d4af37)', color: '#000', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                {uploading ? 'Uploading...' : '📁 Upload Image'}
              </button>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #888)' }}>Recommended: 1440 x 400 pixels</span>

              <input
                type="text"
                className="form-input"
                placeholder="Or paste direct image URL (https://...)"
                value={form.directUrl || ''}
                onChange={(e) => setForm({ ...form, directUrl: e.target.value })}
                style={{ flex: 1, fontSize: '0.82rem' }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (form.directUrl?.trim()) {
                    setForm({ ...form, image: form.directUrl.trim(), directUrl: '' })
                    showToast('Image URL applied!', 'info')
                  }
                }}
                style={{ padding: '7px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                Set URL
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowGallery(!showGallery)}
                style={{ padding: '7px 14px', fontSize: '0.82rem', background: showGallery ? 'var(--accent-color, #d4af37)' : undefined, color: showGallery ? '#000' : undefined, whiteSpace: 'nowrap' }}
              >
                🖼 Gallery
              </button>
            </div>

            <input
              id="ad-campaign-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { if (e.target.files[0]) handleUploadImage(e.target.files[0]); }}
            />

            {/* Thumbnail Display */}
            {form.image && (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '160px', border: '1px solid var(--border-color)', background: '#000', marginBottom: '8px' }}>
                <img
                  src={getAssetUrl(form.image)}
                  alt="Active Campaign Graphic"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800' }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.9rem' }}
                  title="Remove image"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Uploaded Gallery Grid with Cross Deletion */}
            {showGallery && (
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color, #d4af37)' }}>
                    SELECT FROM UPLOADED GALLERY ({mediaGallery.length}):
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Click image to select • &times; to delete</span>
                </div>

                {mediaGallery.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    No uploaded images found.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {mediaGallery.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          setForm(prev => ({ ...prev, image: item.url }))
                          showToast('Selected image from gallery!', 'info')
                        }}
                        style={{
                          position: 'relative',
                          height: '60px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: form.image === item.url ? '2px solid var(--accent-color, #d4af37)' : '1px solid var(--border-color)',
                          background: '#000',
                        }}
                      >
                        <img src={getAssetUrl(item.url)} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={(e) => handleDeleteGalleryItem(e, item)}
                          style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '3px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', cursor: 'pointer' }}
                          title="Delete image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || uploading}
              style={{ padding: '10px 28px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              {saving ? 'Publishing...' : 'Publish to Website'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdCampaign;
