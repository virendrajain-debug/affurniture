// ============================================================
// Premium Slider & Banner Management Module (Theme Engine Enabled)
// ============================================================
// Features: Homepage hero slider CRUD, direct API integration,
// active status toggles, image upload to backend media storage.
// API: /api/hero-sliders & /api/upload
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Slider({ token }) {
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    id: null,
    title: '',
    tagline: '',
    description: '',
    image: '',
    sort_order: 0,
    active: 1,
  })

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSliders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setSliders(data)
      } else {
        showToast('Failed to load sliders', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  const openModal = (
    banner = { id: null, title: '', tagline: '', description: '', image: '', sort_order: 0, active: 1 }
  ) => {
    setForm(banner)
    setModal(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
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
        const imageUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        setForm((prev) => ({ ...prev, image: imageUrl }))
        showToast('Image uploaded successfully', 'success')
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch {
      showToast('Server error during upload', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.image) {
      return showToast('Title and Image are required', 'warning')
    }

    const payload = {
      title: form.title.trim(),
      tagline: form.tagline?.trim() || '',
      description: form.description?.trim() || '',
      image: form.image,
      alt: form.title.trim(),
      sort_order: Number(form.sort_order) || 0,
      active: form.active ? 1 : 0,
    }

    try {
      const url = form.id ? `${API_BASE}/api/hero-sliders/${form.id}` : `${API_BASE}/api/hero-sliders`
      const method = form.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(`Banner ${form.id ? 'updated' : 'added'} successfully`, 'success')
        setModal(false)
        fetchSliders()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save banner', 'error')
      }
    } catch {
      showToast('Server error while saving banner', 'error')
    }
  }

  const handleToggle = async (id, currentActive) => {
    const slider = sliders.find((s) => s.id === id)
    if (!slider) return

    const newActiveState = currentActive ? 0 : 1

    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...slider, active: newActiveState }),
      })

      if (res.ok) {
        setSliders((prev) =>
          prev.map((s) => (s.id === id ? { ...s, active: newActiveState } : s))
        )
      } else {
        showToast('Failed to update status', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return

    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        showToast('Banner deleted', 'success')
        setSliders((prev) => prev.filter((s) => s.id !== id))
      } else {
        showToast('Failed to delete banner', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-action-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .p-action-bar h2 { font-size: 1.5rem; color: var(--text-primary); margin: 0 0 4px 0; font-weight: 600; }
        .p-action-bar p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }

        .p-table-wrap { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .p-data-table th { background: var(--header-bg); padding: 16px 20px; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border-color); }
        .p-data-table td { padding: 16px 20px; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .p-data-table tr:last-child td { border-bottom: none; }
        .p-data-table tbody tr:hover { background: var(--hover-bg); }

        .p-banner-img { width: 90px; height: 48px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color); background: var(--header-bg); }
        
        .p-toggle { width: 40px; height: 20px; border-radius: 10px; position: relative; cursor: pointer; transition: background 0.2s; }
        .p-toggle-thumb { width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 2px; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

        .p-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; }
        .p-badge.active { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .p-badge.inactive { background: rgba(148, 163, 184, 0.1); color: var(--text-secondary); border: 1px solid var(--border-color); }

        .p-action-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-right: 8px; }
        .p-action-btn:hover { background: var(--hover-bg); color: var(--text-primary); border-color: var(--accent-color); }
        .p-action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

        .p-empty-state, .page-loading { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border-radius: 12px; border: 1px solid var(--border-color); }
        .p-empty-state p { margin: 12px 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        .p-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .p-modal-card { background: var(--sidebar-bg); width: 100%; max-width: 480px; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .p-modal-header { background: var(--header-bg); padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .p-modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.15rem; font-weight: 600; }
        
        .p-modal-body { padding: 24px; overflow-y: auto; max-height: 70vh; }
        .p-input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus { border-color: var(--accent-color); }

        .p-upload-label { display: block; background: var(--header-bg); border: 2px dashed var(--border-color); color: var(--text-primary); padding: 16px; border-radius: 8px; text-align: center; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
        .p-upload-label:hover { border-color: var(--accent-color); color: var(--accent-color); }

        .p-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--header-bg); }
        
        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

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
          <h2>Hero Sliders</h2>
          <p>Manage and configure homepage carousel banners.</p>
        </div>
        <button className="p-btn p-btn-primary" onClick={() => openModal()}>+ Add Banner</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading banners...</div>
      ) : sliders.length === 0 ? (
        <div className="p-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <p>No banners added yet</p>
          <span>Click '+ Add Banner' above to create your first homepage slider.</span>
        </div>
      ) : (
        <div className="p-table-wrap">
          <table className="p-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Slider Name</th>
                <th>Banner Preview</th>
                <th>Toggle Active</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sliders.map((s, index) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{s.sort_order ?? index + 1}</td>
                  <td>
                    <strong>{s.title}</strong>
                    {s.tagline && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-color)' }}>{s.tagline}</span>}
                  </td>
                  <td>
                    <img src={s.image} alt={s.title} className="p-banner-img" onError={(e) => { e.target.src = 'https://via.placeholder.com/180x90?text=Invalid+Image' }} />
                  </td>
                  <td>
                    <div 
                      className="p-toggle" 
                      onClick={() => handleToggle(s.id, s.active)}
                      style={{ background: s.active ? '#10B981' : 'var(--border-color)' }}
                    >
                      <div className="p-toggle-thumb" style={{ left: s.active ? '22px' : '2px' }} />
                    </div>
                  </td>
                  <td>
                    <span className={`p-badge ${s.active ? 'active' : 'inactive'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="p-action-btn" onClick={() => openModal(s)}>Edit</button>
                    <button className="p-action-btn delete" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="p-modal-overlay" onClick={() => setModal(false)}>
          <div className="p-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>{form.id ? 'Edit Banner' : 'Add New Banner'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="p-modal-body">
                <div className="p-input-group">
                  <label className="p-label">Banner Title *</label>
                  <input 
                    type="text" 
                    className="p-input"
                    placeholder="Enter banner title..." 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    required
                  />
                </div>

                <div className="p-input-group">
                  <label className="p-label">Tagline (Optional)</label>
                  <input 
                    type="text" 
                    className="p-input"
                    placeholder="e.g. LUXURY LIVING" 
                    value={form.tagline || ''} 
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })} 
                  />
                </div>

                <div className="p-input-group">
                  <label className="p-label">Description (Optional)</label>
                  <input 
                    type="text" 
                    className="p-input"
                    placeholder="Brief banner text..." 
                    value={form.description || ''} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  />
                </div>

                <div className="p-input-group">
                  <label className="p-label">Banner Image *</label>
                  <label className="p-upload-label">
                    {uploading ? 'Uploading image...' : form.image ? 'Change Banner Image' : 'Upload Image File'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploading}
                      hidden 
                    />
                  </label>
                  {form.image && (
                    <img src={form.image} alt="preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px', border: '1px solid var(--border-color)' }} />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '10px' }} onClick={() => setForm({ ...form, active: form.active ? 0 : 1 })}>
                  <div className="p-toggle" style={{ background: form.active ? '#10B981' : 'var(--border-color)' }}>
                    <div className="p-toggle-thumb" style={{ left: form.active ? '22px' : '2px' }} />
                  </div>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Active Banner</span>
                </div>
              </div>

              <div className="p-modal-footer">
                <button type="button" className="p-btn p-btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="p-btn p-btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Slider