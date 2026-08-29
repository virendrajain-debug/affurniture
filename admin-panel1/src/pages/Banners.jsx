// ============================================================
// Premium Banners & Hero Sliders Module (Theme Engine Enabled)
// ============================================================
// Features: Hero Slides CRUD, Page Banners CRUD, File Uploads, Tabs
// API: /api/hero-sliders, /api/page-banners, /api/upload
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Banners({ token }) {
  const [sliders, setSliders] = useState([])
  const [pageBanners, setPageBanners] = useState([])
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [newSlide, setNewSlide] = useState({ image: '', alt: '', tagline: '', title: '', description: '', sort_order: 0, active: 1 })
  const [editingSlide, setEditingSlide] = useState(null)

  const [newBanner, setNewBanner] = useState({ page_key: '', label: '', image: '' })
  const [editingBanner, setEditingBanner] = useState(null)

  const [uploading, setUploading] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [slidersRes, bannersRes] = await Promise.all([
        fetch(`${API_BASE}/api/hero-sliders`),
        fetch(`${API_BASE}/api/page-banners`),
      ])

      if (slidersRes.ok) {
        const slidersData = await slidersRes.json()
        if (Array.isArray(slidersData)) setSliders(slidersData)
      }

      if (bannersRes.ok) {
        const bannersData = await bannersRes.json()
        if (Array.isArray(bannersData)) setPageBanners(bannersData)
      }
    } catch {
      showToast('Failed to load banner data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpload = async (file, onSet) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const fullUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        onSet(fullUrl)
        showToast('Image uploaded', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload error', 'error')
    } finally {
      setUploading(false)
    }
  }

  // ---- Hero Sliders ----
  const handleAddSlide = async () => {
    if (!newSlide.image.trim()) return showToast('Enter or upload an image', 'error')
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSlide),
      })
      if (res.ok) {
        showToast('Slide added successfully', 'success')
        setNewSlide({ image: '', alt: '', tagline: '', title: '', description: '', sort_order: 0, active: 1 })
        const data = await fetch(`${API_BASE}/api/hero-sliders`).then((r) => r.json())
        if (Array.isArray(data)) setSliders(data)
      } else {
        showToast('Failed to add slide', 'error')
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
        showToast('Slide updated successfully', 'success')
        setEditingSlide(null)
        const data = await fetch(`${API_BASE}/api/hero-sliders`).then((r) => r.json())
        if (Array.isArray(data)) setSliders(data)
      } else {
        showToast('Failed to update slide', 'error')
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
        setSliders((prev) => prev.filter((s) => s.id !== id))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggleSlide = async (id, currentActive) => {
    const slide = sliders.find((s) => s.id === id)
    if (!slide) return
    const newActive = currentActive ? 0 : 1
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...slide, active: newActive }),
      })
      if (res.ok) {
        setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, active: newActive } : s)))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // ---- Page Banners ----
  const handleAddBanner = async () => {
    if (!newBanner.page_key.trim()) return showToast('Enter a page key', 'error')
    if (!newBanner.image.trim()) return showToast('Enter or upload an image', 'error')
    try {
      const res = await fetch(`${API_BASE}/api/page-banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBanner),
      })
      if (res.ok) {
        showToast('Banner added successfully', 'success')
        setNewBanner({ page_key: '', label: '', image: '' })
        const data = await fetch(`${API_BASE}/api/page-banners`).then((r) => r.json())
        if (Array.isArray(data)) setPageBanners(data)
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to add banner', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleUpdateBanner = async (id) => {
    if (!editingBanner) return
    try {
      const res = await fetch(`${API_BASE}/api/page-banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingBanner),
      })
      if (res.ok) {
        showToast('Banner updated successfully', 'success')
        setEditingBanner(null)
        const data = await fetch(`${API_BASE}/api/page-banners`).then((r) => r.json())
        if (Array.isArray(data)) setPageBanners(data)
      } else {
        showToast('Failed to update banner', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      const res = await fetch(`${API_BASE}/api/page-banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Banner deleted', 'success')
        setPageBanners((prev) => prev.filter((b) => b.id !== id))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; padding: 24px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-tabs { display: flex; gap: 12px; margin-bottom: 24px; }
        .p-tab-btn {
          background: var(--sidebar-bg); color: var(--text-secondary); border: 1px solid var(--border-color);
          padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .p-tab-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-tab-btn.active { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card h3 { font-size: 1.15rem; color: var(--text-primary); margin: 0 0 16px; font-weight: 600; }

        .p-input-group { margin-bottom: 16px; }
        .p-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .p-input {
          width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
          font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .p-input:focus { outline: none; border-color: var(--accent-color); }

        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 8px; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-secondary { background: var(--hover-bg); border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-secondary:hover { background: var(--border-color); color: var(--text-primary); }
        
        .btn-sm { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-sm:hover { background: var(--hover-bg); color: var(--text-primary); }
        .btn-sm.edit:hover { color: var(--accent-color); border-color: var(--accent-color); }
        .btn-sm.delete:hover { color: #ef4444; border-color: #ef4444; }

        .item-row { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; margin-bottom: 16px; padding: 16px; }
        .item-thumb { width: 180px; height: 110px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); flex-shrink: 0; background: var(--header-bg); }
        .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .status-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; cursor: pointer; }
        .status-badge.active { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .status-badge.pending { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }

        .empty-state { padding: 40px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 0 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

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

      <div className="p-tabs">
        <button className={`p-tab-btn ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>
          Hero Slider ({sliders.length})
        </button>
        <button className={`p-tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>
          Page Banners ({pageBanners.length})
        </button>
      </div>

      {activeTab === 'hero' && (
        <div>
          <div className="p-card">
            <h3>Add New Slide</h3>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="p-input-group" style={{ margin: 0 }}>
                <label className="p-label">Image URL / Upload *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" value={newSlide.image} onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })} placeholder="Paste image URL or upload..." className="p-input" style={{ flex: 1 }} />
                  <button className="p-btn p-btn-secondary" onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { if (e.target.files[0]) handleUpload(e.target.files[0], (url) => setNewSlide((prev) => ({ ...prev, image: url }))) }; i.click() }}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>

              {newSlide.image && (
                <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={newSlide.image} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="p-input-group" style={{ margin: 0 }}>
                  <label className="p-label">Tagline</label>
                  <input type="text" value={newSlide.tagline} onChange={(e) => setNewSlide({ ...newSlide, tagline: e.target.value })} placeholder="e.g. AF FURNISHINGS" className="p-input" />
                </div>
                <div className="p-input-group" style={{ margin: 0 }}>
                  <label className="p-label">Title</label>
                  <input type="text" value={newSlide.title} onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })} placeholder="e.g. Comfort made for everyday living." className="p-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div className="p-input-group" style={{ margin: 0 }}>
                  <label className="p-label">Description</label>
                  <input type="text" value={newSlide.description} onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })} placeholder="Short description..." className="p-input" />
                </div>
                <div className="p-input-group" style={{ margin: 0 }}>
                  <label className="p-label">Sort Order</label>
                  <input type="number" value={newSlide.sort_order} onChange={(e) => setNewSlide({ ...newSlide, sort_order: Number(e.target.value) })} className="p-input" />
                </div>
              </div>

              <button className="p-btn p-btn-primary" onClick={handleAddSlide} style={{ justifySelf: 'flex-start' }}>Add Slide</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {sliders.map((slide, idx) => (
              <div key={slide.id} className="item-row">
                {editingSlide && editingSlide._id === slide.id ? (
                  <div style={{ padding: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Editing Slide #{idx + 1}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="p-btn p-btn-secondary" onClick={() => setEditingSlide(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
                        <button className="p-btn p-btn-primary" onClick={() => handleUpdateSlide(slide.id)} style={{ padding: '6px 14px', fontSize: '12px' }}>Save Changes</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="text" value={editingSlide.image} onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })} placeholder="Image URL" className="p-input" style={{ flex: 1 }} />
                        <button className="p-btn p-btn-secondary" onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { if (e.target.files[0]) handleUpload(e.target.files[0], (url) => setEditingSlide((prev) => ({ ...prev, image: url }))) }; i.click() }}>Upload</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" value={editingSlide.tagline || ''} onChange={(e) => setEditingSlide({ ...editingSlide, tagline: e.target.value })} placeholder="Tagline" className="p-input" />
                        <input type="text" value={editingSlide.title || ''} onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })} placeholder="Title" className="p-input" />
                      </div>
                      <input type="text" value={editingSlide.description || ''} onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })} placeholder="Description" className="p-input" />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="item-thumb">
                      {slide.image ? <img src={slide.image} alt={slide.alt || `Slide ${idx + 1}`} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=No+Image' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '12px' }}>No Image</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{slide.tagline || 'No tagline'}</span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{slide.title || 'No title'}</h4>
                        </div>
                        <span className={`status-badge ${slide.active ? 'active' : 'pending'}`} onClick={() => handleToggleSlide(slide.id, slide.active)}>
                          {slide.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 12px', fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.description || 'No description'}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-sm edit" onClick={() => setEditingSlide({ ...slide, _id: slide.id })} title="Edit Slide">Edit</button>
                        <button className="btn-sm delete" onClick={() => handleDeleteSlide(slide.id)} title="Delete Slide">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sliders.length === 0 && <div className="empty-state"><p>No hero slides yet</p><span>Add your first slide above</span></div>}
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div>
          <div className="p-card">
            <h3>Add New Page Banner</h3>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div className="p-input-group" style={{ margin: 0 }}>
                  <label className="p-label">Page Key *</label>
                  <input type="text" value={newBanner.page_key} onChange={(e) => setNewBanner({ ...newBanner, page_key: e.target.value })} placeholder="e.g. about_us" className="p-input" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Unique route identifier (no spaces)</span>
                </div>
                <div className="p-input-group" style={{ margin: 0 }}>
                  <label className="p-label">Label</label>
                  <input type="text" value={newBanner.label} onChange={(e) => setNewBanner({ ...newBanner, label: e.target.value })} placeholder="e.g. About Us Page" className="p-input" />
                </div>
              </div>

              <div className="p-input-group" style={{ margin: 0 }}>
                <label className="p-label">Banner Image URL / Upload *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" value={newBanner.image} onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })} placeholder="Paste image URL or upload..." className="p-input" style={{ flex: 1 }} />
                  <button className="p-btn p-btn-secondary" onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { if (e.target.files[0]) handleUpload(e.target.files[0], (url) => setNewBanner((prev) => ({ ...prev, image: url }))) }; i.click() }}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>

              {newBanner.image && (
                <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={newBanner.image} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <button className="p-btn p-btn-primary" onClick={handleAddBanner} style={{ justifySelf: 'flex-start' }}>Add Banner</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {pageBanners.map((banner) => (
              <div key={banner.id} className="item-row">
                {editingBanner && editingBanner._id === banner.id ? (
                  <div style={{ padding: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Editing: {banner.label || banner.page_key}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="p-btn p-btn-secondary" onClick={() => setEditingBanner(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
                        <button className="p-btn p-btn-primary" onClick={() => handleUpdateBanner(banner.id)} style={{ padding: '6px 14px', fontSize: '12px' }}>Save Changes</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                        <input type="text" value={editingBanner.page_key} onChange={(e) => setEditingBanner({ ...editingBanner, page_key: e.target.value })} placeholder="Page key" className="p-input" />
                        <input type="text" value={editingBanner.label} onChange={(e) => setEditingBanner({ ...editingBanner, label: e.target.value })} placeholder="Label" className="p-input" />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="text" value={editingBanner.image} onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })} placeholder="Image URL" className="p-input" style={{ flex: 1 }} />
                        <button className="p-btn p-btn-secondary" onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { if (e.target.files[0]) handleUpload(e.target.files[0], (url) => setEditingBanner((prev) => ({ ...prev, image: url }))) }; i.click() }}>Upload</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="item-thumb">
                      {banner.image ? <img src={banner.image} alt={banner.label} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=No+Image' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '12px' }}>No Image</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{banner.page_key}</span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{banner.label || banner.page_key}</h4>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="btn-sm edit" onClick={() => setEditingBanner({ ...banner, _id: banner.id })} title="Edit Banner">Edit</button>
                        <button className="btn-sm delete" onClick={() => handleDeleteBanner(banner.id)} title="Delete Banner">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {pageBanners.length === 0 && <div className="empty-state"><p>No page banners yet</p><span>Add your first page banner above</span></div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners