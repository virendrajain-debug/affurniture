import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function Banners({ token }) {
  const [sliders, setSliders] = useState([])
  const [pageBanners, setPageBanners] = useState([])
  const [activeTab, setActiveTab] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [newSlide, setNewSlide] = useState({ image: '', alt: '', tagline: '', title: '', description: '', sort_order: 0 })
  const [editingSlide, setEditingSlide] = useState(null)

  const [newBanner, setNewBanner] = useState({ page_key: '', label: '', image: '' })
  const [editingBanner, setEditingBanner] = useState(null)

  const [uploading, setUploading] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/hero-sliders`).then(r => r.json()),
      fetch(`${API_BASE}/api/page-banners`).then(r => r.json()),
    ]).then(([slidersData, bannersData]) => {
      if (Array.isArray(slidersData)) setSliders(slidersData)
      if (Array.isArray(bannersData)) setPageBanners(bannersData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (file, onSet) => {
    if (!file) return
    setUploading('upload')
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
        onSet(`${API_BASE}${data.url}`)
        showToast('Image uploaded', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload error', 'error')
    } finally {
      setUploading(null)
    }
  }

  // ---- Hero Sliders ----
  const handleAddSlide = async () => {
    if (!newSlide.image.trim()) return showToast('Enter or upload an image', 'warning')
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
    } catch { showToast('Server error', 'error') }
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
    } catch { showToast('Server error', 'error') }
  }

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { showToast('Slide deleted', 'success'); setSliders(sliders.filter(s => s.id !== id)) }
    } catch { showToast('Server error', 'error') }
  }

  const handleToggleSlide = async (id, active) => {
    const slide = sliders.find(s => s.id === id)
    if (!slide) return
    try {
      await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...slide, active: active ? 0 : 1 }),
      })
      const data = await fetch(`${API_BASE}/api/hero-sliders`).then(r => r.json())
      if (Array.isArray(data)) setSliders(data)
    } catch { showToast('Server error', 'error') }
  }

  // ---- Page Banners ----
  const handleAddBanner = async () => {
    if (!newBanner.page_key.trim()) return showToast('Enter a page key', 'warning')
    if (!newBanner.image.trim()) return showToast('Enter or upload an image', 'warning')
    try {
      const res = await fetch(`${API_BASE}/api/page-banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBanner),
      })
      if (res.ok) {
        showToast('Banner added', 'success')
        setNewBanner({ page_key: '', label: '', image: '' })
        const data = await fetch(`${API_BASE}/api/page-banners`).then(r => r.json())
        if (Array.isArray(data)) setPageBanners(data)
      } else {
        const d = await res.json()
        showToast(d.message || 'Failed', 'error')
      }
    } catch { showToast('Server error', 'error') }
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
        showToast('Banner updated', 'success')
        setEditingBanner(null)
        const data = await fetch(`${API_BASE}/api/page-banners`).then(r => r.json())
        if (Array.isArray(data)) setPageBanners(data)
      }
    } catch { showToast('Server error', 'error') }
  }

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      const res = await fetch(`${API_BASE}/api/page-banners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { showToast('Banner deleted', 'success'); setPageBanners(pageBanners.filter(b => b.id !== id)) }
    } catch { showToast('Server error', 'error') }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2d7c5', fontSize: '13px', color: '#28241f', background: '#fffdf9', fontFamily: 'monospace' }
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#2a3f6e', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }

  const UploadBtn = ({ onFile, children }) => (
    <button
      className="btn-secondary"
      onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { if (e.target.files[0]) onFile(e.target.files[0]) }; i.click() }}
      disabled={uploading === 'upload'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      {uploading === 'upload' ? 'Uploading...' : (children || 'Upload')}
    </button>
  )

  const ImageInput = ({ value, onChange, onUpload }) => (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload..." style={{ ...inputStyle, flex: 1 }} />
        <UploadBtn onFile={onUpload}>Upload</UploadBtn>
      </div>
      {value && (
        <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5' }}>
          <img src={value} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
    </div>
  )

  return (
    <div className="terms-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Page Banners & Hero Sliders</h2>
        <p>Manage hero slider images and page banner images</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button className={activeTab === 'hero' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('hero')}>Hero Slider ({sliders.length})</button>
        <button className={activeTab === 'banners' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('banners')}>Page Banners ({pageBanners.length})</button>
      </div>

      {/* ============ HERO SLIDER TAB ============ */}
      {activeTab === 'hero' && (
        <div>
          {/* Add New Slide */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1a2744', margin: '0 0 16px' }}>Add New Slide</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <ImageInput value={newSlide.image} onChange={(v) => setNewSlide({ ...newSlide, image: v })} onUpload={(f) => handleUpload(f, (url) => setNewSlide(prev => ({ ...prev, image: url })))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Tagline</label><input type="text" value={newSlide.tagline} onChange={(e) => setNewSlide({ ...newSlide, tagline: e.target.value })} placeholder="e.g. AF FURNISHINGS" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Title (HTML allowed)</label><input type="text" value={newSlide.title} onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })} placeholder="e.g. Comfort made for everyday living." style={inputStyle} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Description</label><input type="text" value={newSlide.description} onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })} placeholder="Short description..." style={inputStyle} /></div>
                  <div><label style={labelStyle}>Sort Order</label><input type="number" value={newSlide.sort_order} onChange={(e) => setNewSlide({ ...newSlide, sort_order: Number(e.target.value) })} style={inputStyle} /></div>
                </div>
                <button className="btn-primary" onClick={handleAddSlide} style={{ alignSelf: 'flex-start' }}>Add Slide</button>
              </div>
            </div>
          </div>

          {/* Existing Slides */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {sliders.map((slide, idx) => (
              <div key={slide.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', overflow: 'hidden' }}>
                {editingSlide && editingSlide._id === slide.id ? (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#1a2744' }}>Editing Slide #{idx + 1}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" onClick={() => setEditingSlide(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
                        <button className="btn-primary" onClick={() => handleUpdateSlide(slide.id)} style={{ padding: '6px 14px', fontSize: '12px' }}>Save</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <ImageInput value={editingSlide.image} onChange={(v) => setEditingSlide({ ...editingSlide, image: v })} onUpload={(f) => handleUpload(f, (url) => setEditingSlide(prev => ({ ...prev, image: url })))} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" value={editingSlide.tagline} onChange={(e) => setEditingSlide({ ...editingSlide, tagline: e.target.value })} placeholder="Tagline" style={inputStyle} />
                        <input type="text" value={editingSlide.title} onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })} placeholder="Title" style={inputStyle} />
                      </div>
                      <input type="text" value={editingSlide.description} onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })} placeholder="Description" style={inputStyle} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
                    <div style={{ width: '200px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', flexShrink: 0, background: '#f5f5f5' }}>
                      {slide.image ? <img src={slide.image} alt={slide.alt || `Slide ${idx + 1}`} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=No+Image' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>No Image</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{slide.tagline || 'No tagline'}</span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#1a2744' }}>{slide.title || 'No title'}</h4>
                        </div>
                        <span className={`status-badge ${slide.active ? 'active' : 'pending'}`} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => handleToggleSlide(slide.id, slide.active)}>{slide.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p style={{ margin: '4px 0 8px', fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.description || 'No description'}</p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-sm edit" onClick={() => setEditingSlide({ ...slide, _id: slide.id })} title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className="btn-sm delete" onClick={() => handleDeleteSlide(slide.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
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

      {/* ============ PAGE BANNERS TAB ============ */}
      {activeTab === 'banners' && (
        <div>
          {/* Add New Banner */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', marginBottom: '24px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1a2744', margin: '0 0 16px' }}>Add New Page Banner</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Page Key *</label>
                  <input type="text" value={newBanner.page_key} onChange={(e) => setNewBanner({ ...newBanner, page_key: e.target.value })} placeholder="e.g. about_us" style={inputStyle} />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>Unique key (no spaces)</p>
                </div>
                <div>
                  <label style={labelStyle}>Label</label>
                  <input type="text" value={newBanner.label} onChange={(e) => setNewBanner({ ...newBanner, label: e.target.value })} placeholder="e.g. About Us Page" style={inputStyle} />
                </div>
              </div>
              <ImageInput value={newBanner.image} onChange={(v) => setNewBanner({ ...newBanner, image: v })} onUpload={(f) => handleUpload(f, (url) => setNewBanner(prev => ({ ...prev, image: url })))} />
              <button className="btn-primary" onClick={handleAddBanner} style={{ alignSelf: 'flex-start' }}>Add Banner</button>
            </div>
          </div>

          {/* Existing Banners */}
          <div style={{ display: 'grid', gap: '16px' }}>
            {pageBanners.map((banner) => (
              <div key={banner.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', overflow: 'hidden' }}>
                {editingBanner && editingBanner._id === banner.id ? (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#1a2744' }}>Editing: {banner.label || banner.page_key}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" onClick={() => setEditingBanner(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
                        <button className="btn-primary" onClick={() => handleUpdateBanner(banner.id)} style={{ padding: '6px 14px', fontSize: '12px' }}>Save</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                        <input type="text" value={editingBanner.page_key} onChange={(e) => setEditingBanner({ ...editingBanner, page_key: e.target.value })} placeholder="Page key" style={inputStyle} />
                        <input type="text" value={editingBanner.label} onChange={(e) => setEditingBanner({ ...editingBanner, label: e.target.value })} placeholder="Label" style={inputStyle} />
                      </div>
                      <ImageInput value={editingBanner.image} onChange={(v) => setEditingBanner({ ...editingBanner, image: v })} onUpload={(f) => handleUpload(f, (url) => setEditingBanner(prev => ({ ...prev, image: url })))} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
                    <div style={{ width: '200px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', flexShrink: 0, background: '#f5f5f5' }}>
                      {banner.image ? <img src={banner.image} alt={banner.label} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=No+Image' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>No Image</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{banner.page_key}</span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#1a2744' }}>{banner.label || banner.page_key}</h4>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-sm edit" onClick={() => setEditingBanner({ ...banner, _id: banner.id })} title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className="btn-sm delete" onClick={() => handleDeleteBanner(banner.id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
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
