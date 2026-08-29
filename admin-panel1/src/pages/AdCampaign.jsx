// ============================================================
// Premium Ad Campaign Module (Theme Engine Enabled)
// ============================================================
// Features: Campaign CRUD, Image Uploads to API, Modal form,
// status toggles, fully integrated with global themes.
// API: POST /api/upload
// ============================================================

import { useState } from 'react'
import { API_BASE } from '../config'

function AdCampaign({ token }) {
  const [ads, setAds] = useState([])
  const [modal, setModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ id: null, title: '', image: '', link: '', isActive: true })
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openModal = (ad = { id: null, title: '', image: '', link: '', isActive: true }) => {
    setForm(ad)
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
        const fullUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        setForm((prev) => ({ ...prev, image: fullUrl }))
        showToast('Ad banner uploaded', 'success')
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch {
      showToast('Server error during upload', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.image || !form.link.trim()) {
      return showToast('Campaign Name, Image, and Redirect Link are required', 'warning')
    }

    let updated = [...ads]
    if (form.id) {
      updated = updated.map((a) => (a.id === form.id ? form : a))
    } else {
      updated = [...updated, { ...form, id: Date.now() }]
    }

    setAds(updated)
    setModal(false)
    showToast('Ad Campaign saved successfully', 'success')
  }

  const toggle = (id) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)))
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this ad campaign?')) return
    setAds((prev) => prev.filter((a) => a.id !== id))
    showToast('Campaign removed', 'success')
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; padding: 24px; width: 100%; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        
        .p-table-wrap { 
          background: var(--sidebar-bg); 
          border: 1px solid var(--border-color); 
          border-radius: 12px; overflow: hidden; 
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); margin-top: 16px; 
        }
        .p-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .p-data-table th { 
          background: var(--header-bg); padding: 16px 20px; font-size: 0.75rem; 
          font-weight: 700; color: var(--text-secondary); text-transform: uppercase; 
          letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); 
        }
        .p-data-table td { padding: 16px 20px; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .p-data-table tr:last-child td { border-bottom: none; }
        .p-data-table tbody tr:hover { background: var(--hover-bg); }

        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 8px; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .p-btn-secondary { background: var(--hover-bg); border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-secondary:hover { background: var(--border-color); color: var(--text-primary); }
        
        .btn-sm { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; font-weight: 600; }
        .btn-sm:hover { background: var(--hover-bg); color: var(--text-primary); }
        .btn-sm.edit:hover { color: var(--accent-color); border-color: var(--accent-color); }
        .btn-sm.delete:hover { color: #ef4444; border-color: #ef4444; }

        .empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 0 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        .p-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease-out; }
        .p-modal-card { background: var(--sidebar-bg); width: 100%; max-width: 480px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); }
        .p-modal-header { background: var(--header-bg); padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .p-modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.15rem; font-weight: 600; }
        .p-modal-close { background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; line-height: 1; padding: 0; transition: color 0.2s; }
        .p-modal-close:hover { color: var(--accent-hover); }
        .p-modal-body { padding: 24px; }
        .p-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--header-bg); }

        .p-input-group { margin-bottom: 16px; }
        .p-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .p-input {
          width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
          font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .p-input:focus { outline: none; border-color: var(--accent-color); }

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
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 4px', fontWeight: 600 }}>Ad Campaigns</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Manage advertisement banners and target redirect links</p>
        </div>
        <button className="p-btn p-btn-primary" onClick={() => openModal()}>+ Add Campaign</button>
      </div>

      <div className="p-table-wrap">
        <table className="p-data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ad Name</th>
              <th>Banner Image</th>
              <th>Target Link</th>
              <th>Status Switch</th>
              <th>State</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.length > 0 ? (
              ads.map((a, index) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{a.title}</td>
                  <td>
                    <div style={{ width: '80px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--header-bg)' }}>
                      <img src={a.image} alt="ad banner" onError={(e) => { e.target.src = 'https://via.placeholder.com/160x80?text=No+Image' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td>
                    <a href={a.link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '500' }}>
                      View Link ↗
                    </a>
                  </td>
                  <td>
                    <div onClick={() => toggle(a.id)} style={{ width: '40px', height: '22px', background: a.isActive ? '#10B981' : 'var(--border-color)', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                      <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: a.isActive ? '21px' : '3px', transition: '0.3s' }} />
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600, background: a.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)', color: a.isActive ? '#10B981' : 'var(--text-secondary)' }}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="btn-sm edit" onClick={() => openModal(a)}>Edit</button>
                      <button className="btn-sm delete" onClick={() => handleDelete(a.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <p>No ad campaigns yet</p>
                    <span>Click "+ Add Campaign" above to create your first advertisement banner.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="p-modal-overlay" onClick={() => setModal(false)}>
          <div className="p-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>{form.id ? 'Edit Ad Campaign' : 'Add New Campaign'}</h3>
              <button className="p-modal-close" onClick={() => setModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="p-modal-body">
                <div className="p-input-group">
                  <label className="p-label">Campaign Name *</label>
                  <input type="text" placeholder="Enter ad name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="p-input" required />
                </div>
                
                <div className="p-input-group">
                  <label className="p-label">Redirect Link *</label>
                  <input type="url" placeholder="https://affurnishings.co.nz/sale" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="p-input" required />
                </div>
                
                <div className="p-input-group">
                  <label className="p-label">Ad Banner Image *</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <input type="text" placeholder="Paste image URL..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="p-input" style={{ flex: 1 }} />
                    <label className="p-btn p-btn-secondary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', margin: 0, padding: '10px 16px', fontSize: '0.85rem' }}>
                      {uploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {form.image && (
                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={form.image} alt="preview" onError={(e) => { e.target.style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingTop: '4px' }} onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                  <div style={{ width: '40px', height: '22px', background: form.isActive ? '#10B981' : 'var(--border-color)', borderRadius: '11px', position: 'relative', transition: '0.3s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: form.isActive ? '21px' : '3px', transition: '0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Set Campaign Active Immediately</span>
                </div>
              </div>

              <div className="p-modal-footer">
                <button type="button" className="p-btn p-btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="p-btn p-btn-primary" disabled={uploading}>Save Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdCampaign