import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Testimonials({ token }) {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', role: 'Customer', quote: '', location: '', rating: '5', sort_order: '0', active: true })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchAll = () => {
    fetch(`${API_BASE}/api/testimonials/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTestimonials(data) })
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const resetForm = () => { setForm({ name: '', role: 'Customer', quote: '', location: '', rating: '5', sort_order: '0', active: true }); setAvatarFile(null); setAvatarPreview(''); setEditItem(null); setShowForm(false) }

  const openCreate = () => { resetForm(); setShowForm(true) }

  const openEdit = (t) => {
    setEditItem(t)
    setForm({ name: t.name || '', role: t.role || 'Customer', quote: t.quote || '', location: t.location || '', rating: String(t.rating || 5), sort_order: String(t.sort_order || 0), active: t.active === 1 })
    setAvatarPreview(t.avatar ? `${API_BASE}${t.avatar}` : '')
    setShowForm(true)
  }

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)) }
  }

  const handleSave = async () => {
    if (!form.name || !form.quote) return showToast('Name and quote are required', 'warning')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('role', form.role)
      fd.append('quote', form.quote)
      fd.append('location', form.location)
      fd.append('rating', form.rating)
      fd.append('sort_order', form.sort_order)
      fd.append('active', form.active ? '1' : '0')
      if (avatarFile) fd.append('avatar', avatarFile)

      const url = editItem ? `${API_BASE}/api/testimonials/${editItem.id}` : `${API_BASE}/api/testimonials`
      const res = await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (res.ok) { showToast(editItem ? 'Updated' : 'Created', 'success'); resetForm(); fetchAll() }
      else showToast('Failed to save', 'error')
    } catch { showToast('Server error', 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      const res = await fetch(`${API_BASE}/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { showToast('Deleted', 'success'); fetchAll() }
    } catch { showToast('Server error', 'error') }
  }

  const toggleActive = async (t) => {
    try {
      const fd = new FormData()
      fd.append('name', t.name)
      fd.append('role', t.role || 'Customer')
      fd.append('quote', t.quote)
      fd.append('location', t.location || '')
      fd.append('rating', t.rating || 5)
      fd.append('sort_order', t.sort_order || 0)
      fd.append('active', t.active ? '0' : '1')
      await fetch(`${API_BASE}/api/testimonials/${t.id}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      fetchAll()
    } catch {}
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .p-form-card { background: var(--sidebar-bg); border-radius: 12px; border: 1px solid var(--border-color); padding: 40px; width: 100%; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-section-title { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 32px 0 16px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
        .p-grid { display: grid; gap: 20px; }
        .p-grid-2 { grid-template-columns: repeat(2, 1fr); }
        .p-grid-3 { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 768px) { .p-grid-2, .p-grid-3 { grid-template-columns: 1fr; } }
        .p-input-group { display: flex; flex-direction: column; gap: 6px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        .p-label span { color: #ef4444; }
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus { border-color: var(--accent-color); }
        select.p-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a6b0cf' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; cursor: pointer; }
        .p-checkbox-row { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 14px; }
        .p-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem; color: var(--text-primary); font-weight: 500; }
        .p-checkbox-label input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-color); }
        .p-media-container { background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; }
        .p-media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
        .p-media-add { aspect-ratio: 1; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--sidebar-bg); cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
        .p-media-add:hover { border-color: var(--accent-color); color: var(--accent-color); }
        .p-media-item { aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--border-color); position: relative; overflow: hidden; background: var(--sidebar-bg); }
        .p-media-item img { width: 100%; height: 100%; object-fit: cover; }
        .p-form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--border-color); }
        .p-btn { padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s; }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .p-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .p-header h2 { margin: 0; color: var(--text-primary); font-size: 1.5rem; }
        .p-table-wrap { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .p-data-table th { background: var(--header-bg); padding: 14px 20px; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border-color); }
        .p-data-table td { padding: 14px 20px; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .p-data-table tr:last-child td { border-bottom: none; }
        .p-data-table tbody tr:hover { background: var(--hover-bg); }
        .p-action-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .p-action-btn.edit { color: var(--text-secondary); }
        .p-action-btn.edit:hover { background: var(--hover-bg); color: var(--accent-color); }
        .p-action-btn.delete { color: #ef4444; }
        .p-action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); }
        .p-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; cursor: pointer; }
        .p-badge.active { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .p-badge.inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .toast-premium { position: fixed; top: 24px; right: 24px; z-index: 9999; background: var(--sidebar-bg); border-left: 4px solid var(--accent-color); color: var(--text-primary); padding: 16px 24px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out; }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }
        .toast-premium.warning { border-left-color: #f59e0b; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-header">
        <h2>Testimonials</h2>
        <button className="p-btn p-btn-primary" onClick={openCreate}>+ Add Testimonial</button>
      </div>

      {showForm && (
        <div className="p-form-card" style={{ marginBottom: 24 }}>
          <h3 className="p-section-title">{editItem ? 'Edit Testimonial' : 'New Testimonial'}</h3>
          <div className="p-grid p-grid-3">
            <div className="p-input-group">
              <label className="p-label">Name <span>*</span></label>
              <input type="text" className="p-input" placeholder="e.g. Mele T." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="p-input-group">
              <label className="p-label">Role</label>
              <input type="text" className="p-input" placeholder="e.g. Customer" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
            </div>
            <div className="p-input-group">
              <label className="p-label">Location</label>
              <input type="text" className="p-input" placeholder="e.g. Auckland" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>
          <div className="p-grid p-grid-2" style={{ marginTop: 20 }}>
            <div className="p-input-group">
              <label className="p-label">Quote <span>*</span></label>
              <textarea className="p-input" rows="4" placeholder="What the customer said..." value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <div className="p-grid p-grid-2">
                <div className="p-input-group">
                  <label className="p-label">Rating (1-5)</label>
                  <select className="p-input" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}>
                    {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="p-input-group">
                  <label className="p-label">Sort Order</label>
                  <input type="number" className="p-input" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} min="0" />
                </div>
              </div>
              <div className="p-checkbox-row" style={{ marginTop: 14 }}>
                <label className="p-checkbox-label">
                  <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                  Active
                </label>
              </div>
              <div className="p-input-group" style={{ marginTop: 20 }}>
                <label className="p-label">Avatar</label>
                <div className="p-media-container">
                  <div className="p-media-grid">
                    <label className="p-media-add">
                      <input type="file" accept="image/*" onChange={handleAvatar} hidden />
                      {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span style={{ marginTop: '6px' }}>Add Photo</span>
                      </>}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-form-actions">
            <button className="p-btn p-btn-outline" onClick={resetForm}>Cancel</button>
            <button className="p-btn p-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : testimonials.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No testimonials yet</p>
          <span>Click "+ Add Testimonial" to create one.</span>
        </div>
      ) : (
        <div className="p-table-wrap">
          <table className="p-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Quote</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {t.avatar ? <img src={`${API_BASE}${t.avatar}`} alt={t.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{t.name?.charAt(0)}</div>}
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        {t.location && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.location}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{t.role}</td>
                  <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.quote}</td>
                  <td>{'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}</td>
                  <td><span className={`p-badge ${t.active ? 'active' : 'inactive'}`} onClick={() => toggleActive(t)}>{t.active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button className="p-action-btn edit" onClick={() => openEdit(t)} title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="p-action-btn delete" onClick={() => handleDelete(t.id)} title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Testimonials
