import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const bannerKeys = [
  { key: 'home_hero_banner', label: 'Home Page Hero (Fallback)', fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85' },
  { key: 'showrooms_banner', label: 'Showrooms Page', fallback: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=2000&q=85' },
  { key: 'delivery_info_banner', label: 'Delivery Info Page', fallback: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85' },
  { key: 'shop_furniture_banner', label: 'Shop Furniture Page', fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85' },
  { key: 'returns_banner', label: 'Returns Page', fallback: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=85' },
  { key: 'terms_banner', label: 'Terms & Conditions Page', fallback: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2000&q=85' },
  { key: 'privacy_banner', label: 'Privacy Policy Page', fallback: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85' },
  { key: 'about_banner', label: 'About Us Page', fallback: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85' },
  { key: 'winz_banner', label: 'WinZ Page', fallback: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85' },
  { key: 'contact_banner', label: 'Contact Us Page', fallback: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=85' },
]

function Banners({ token }) {
  const [banners, setBanners] = useState({})
  const [sliders, setSliders] = useState([])
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [newSlide, setNewSlide] = useState({ image: '', alt: '', tagline: '', title: '', description: '', sort_order: 0 })
  const [editingSlide, setEditingSlide] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/settings`).then(r => r.json()),
      fetch(`${API_BASE}/api/hero-sliders`).then(r => r.json()),
    ]).then(([settingsData, slidersData]) => {
      setBanners(settingsData)
      if (Array.isArray(slidersData)) setSliders(slidersData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleBannerChange = (key, value) => {
    setBanners(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveBanners = async () => {
    try {
      const payload = {}
      bannerKeys.forEach(({ key, fallback }) => {
        payload[key] = banners[key] || fallback
      })
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (res.ok) showToast('Banner images saved', 'success')
      else showToast('Failed to save', 'error')
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleAddSlide = async () => {
    if (!newSlide.image.trim()) return showToast('Enter image URL', 'warning')
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSlide),
      })
      if (res.ok) {
        showToast('Slide added', 'success')
        setNewSlide({ image: '', alt: '', tagline: '', title: '', description: '', sort_order: 0 })
        const data = await fetch(`${API_BASE}/api/hero-sliders`).then(r => r.json())
        if (Array.isArray(data)) setSliders(data)
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleUpdateSlide = async (id) => {
    if (!editingSlide) return
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingSlide),
      })
      if (res.ok) {
        showToast('Slide updated', 'success')
        setEditingSlide(null)
        const data = await fetch(`${API_BASE}/api/hero-sliders`).then(r => r.json())
        if (Array.isArray(data)) setSliders(data)
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Slide deleted', 'success')
        setSliders(sliders.filter(s => s.id !== id))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggleSlide = async (id, active) => {
    const slide = sliders.find(s => s.id === id)
    if (!slide) return
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...slide, active: active ? 0 : 1 }),
      })
      if (res.ok) {
        const data = await fetch(`${API_BASE}/api/hero-sliders`).then(r => r.json())
        if (Array.isArray(data)) setSliders(data)
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2d7c5', fontSize: '13px', color: '#28241f', background: '#fffdf9', fontFamily: 'monospace' }
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#2a3f6e', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }

  return (
    <div className="terms-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Page Banners & Hero Sliders</h2>
        <p>Manage hero slider images and page banner images</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={activeTab === 'hero' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('hero')}
        >
          Hero Slider ({sliders.length})
        </button>
        <button
          className={activeTab === 'banners' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('banners')}
        >
          Page Banners
        </button>
      </div>

      {activeTab === 'hero' && (
        <div>
          {/* Add New Slide */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2d7c5', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1a2744', margin: '0 0 16px' }}>Add New Slide</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Image URL *</label>
                <input type="text" value={newSlide.image} onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })} placeholder="Paste image URL..." style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input type="text" value={newSlide.tagline} onChange={(e) => setNewSlide({ ...newSlide, tagline: e.target.value })} placeholder="e.g. AF FURNISHINGS" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Title (HTML allowed)</label>
                  <input type="text" value={newSlide.title} onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })} placeholder="e.g. Comfort made for everyday living." style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input type="text" value={newSlide.description} onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })} placeholder="Short description..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" value={newSlide.sort_order} onChange={(e) => setNewSlide({ ...newSlide, sort_order: Number(e.target.value) })} style={inputStyle} />
                </div>
              </div>
              {newSlide.image && (
                <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5' }}>
                  <img src={newSlide.image} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <button className="btn-primary" onClick={handleAddSlide} style={{ alignSelf: 'flex-start' }}>Add Slide</button>
            </div>
          </div>

          {/* Existing Slides */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {sliders.map((slide, idx) => (
              <div key={slide.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', overflow: 'hidden' }}>
                {editingSlide && editingSlide._id === slide.id ? (
                  /* Edit Mode */
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#1a2744' }}>Editing Slide #{idx + 1}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" onClick={() => setEditingSlide(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
                        <button className="btn-primary" onClick={() => handleUpdateSlide(slide.id)} style={{ padding: '6px 14px', fontSize: '12px' }}>Save</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <input type="text" value={editingSlide.image} onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })} placeholder="Image URL" style={inputStyle} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" value={editingSlide.tagline} onChange={(e) => setEditingSlide({ ...editingSlide, tagline: e.target.value })} placeholder="Tagline" style={inputStyle} />
                        <input type="text" value={editingSlide.title} onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })} placeholder="Title" style={inputStyle} />
                      </div>
                      <input type="text" value={editingSlide.description} onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })} placeholder="Description" style={inputStyle} />
                      {editingSlide.image && (
                        <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5' }}>
                          <img src={editingSlide.image} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
                    <div style={{ width: '200px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', flexShrink: 0, background: '#f5f5f5' }}>
                      {slide.image ? (
                        <img src={slide.image} alt={slide.alt || `Slide ${idx + 1}`} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=No+Image' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>No Image</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{slide.tagline || 'No tagline'}</span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#1a2744' }}>{slide.title || 'No title'}</h4>
                        </div>
                        <span
                          className={`status-badge ${slide.active ? 'active' : 'pending'}`}
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                          onClick={() => handleToggleSlide(slide.id, slide.active)}
                        >
                          {slide.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 8px', fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.description || 'No description'}</p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-sm edit" onClick={() => setEditingSlide({ ...slide, _id: slide.id })} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-sm delete" onClick={() => handleDeleteSlide(slide.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sliders.length === 0 && (
              <div className="empty-state"><p>No hero slides yet</p><span>Add your first slide above</span></div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div>
          <div style={{ display: 'grid', gap: '24px', marginTop: '8px' }}>
            {bannerKeys.map(({ key, label, fallback }) => {
              const url = banners[key] || fallback
              return (
                <div key={key} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2d7c5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontWeight: '600', color: '#28241f', fontSize: '14px' }}>{label}</label>
                    <button onClick={() => handleBannerChange(key, fallback)} style={{ background: 'none', border: 'none', color: '#aa7a3e', cursor: 'pointer', fontSize: '13px' }}>Reset to default</button>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '300px', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', flexShrink: 0 }}>
                      <img src={url} alt={label} onError={(e) => { e.target.src = fallback }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={banners[key] || ''} onChange={(e) => handleBannerChange(key, e.target.value)} placeholder={fallback} disabled={loading} style={inputStyle} />
                      <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>Paste an image URL (Unsplash, Cloudinary, or any direct image link)</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="editor-actions" style={{ marginTop: '24px' }}>
            <button className="btn-primary" onClick={handleSaveBanners}>Save All Banners</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners
