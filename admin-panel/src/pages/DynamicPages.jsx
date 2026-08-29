import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function DynamicPages({ token }) {
  const [pages, setPages] = useState([])
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const empty = { title: '', slug: '', category: 'General', content: '', banner_image: '', meta_description: '', sort_order: 0, active: true }
  const [form, setForm] = useState(empty)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pagesRes, catsRes] = await Promise.all([
        fetch(`${API_BASE}/api/dynamic-pages`),
        fetch(`${API_BASE}/api/dynamic-pages/categories`),
      ])
      if (pagesRes.ok) { const d = await pagesRes.json(); if (Array.isArray(d)) setPages(d) }
      if (catsRes.ok) { const d = await catsRes.json(); if (Array.isArray(d)) setCategories(d) }
    } catch { showToast('Failed to load pages', 'error') }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = filterCat ? pages.filter(p => p.category === filterCat) : pages

  const openNew = () => { setForm(empty); setEditing(null); setShowForm(true) }
  const openEdit = (page) => { setForm({ ...page, active: !!page.active }); setEditing(page.id); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title.trim()) return showToast('Title is required', 'warning')
    const url = editing ? `${API_BASE}/api/dynamic-pages/${editing}` : `${API_BASE}/api/dynamic-pages`
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        showToast(editing ? 'Page updated' : 'Page created', 'success')
        setShowForm(false)
        fetchAll()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to save', 'error')
      }
    } catch { showToast('Server error', 'error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return
    try {
      const res = await fetch(`${API_BASE}/api/dynamic-pages/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { showToast('Page deleted', 'success'); fetchAll() }
      else showToast('Failed to delete', 'error')
    } catch { showToast('Server error', 'error') }
  }

  const handleBannerUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { setForm(prev => ({ ...prev, banner_image: data.url })); showToast('Banner uploaded', 'success') }
    } catch { showToast('Upload failed', 'error') }
    setUploading(false)
  }

  const handleSlugGenerate = () => {
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setForm(prev => ({ ...prev, slug }))
  }

  return (
    <div style={{ padding: 24 }}>
      <style>{`
        .dp-toast { position: fixed; top: 24px; right: 24px; z-index: 9999; background: var(--sidebar-bg); border-left: 4px solid var(--accent-color); color: var(--text-primary); padding: 16px 24px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; animation: fadeIn 0.3s; }
        .dp-toast.error { border-left-color: #ef4444; }
        .dp-toast.success { border-left-color: #22c55e; }
        .dp-toast.warning { border-left-color: #f59e0b; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .dp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .dp-header h2 { font-size: 1.5rem; color: var(--text-primary); margin: 0; font-weight: 600; }
        .dp-header p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }
        .dp-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
        .dp-chip { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--header-bg); color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .dp-chip:hover { border-color: var(--accent-color); color: var(--text-primary); }
        .dp-chip.active { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
        .dp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .dp-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; transition: border-color 0.2s; cursor: pointer; }
        .dp-card:hover { border-color: var(--accent-color); }
        .dp-card-top { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; }
        .dp-card h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0; }
        .dp-card-cat { font-size: 0.75rem; color: var(--accent-color); font-weight: 600; margin-top: 4px; }
        .dp-card-meta { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
        .dp-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); }
        .dp-card-slug { font-size: 0.75rem; color: var(--text-secondary); font-family: monospace; }
        .dp-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
        .dp-badge.active { background: rgba(34,197,94,0.1); color: #22c55e; }
        .dp-badge.inactive { background: rgba(239,68,68,0.1); color: #ef4444; }
        .dp-actions { display: flex; gap: 4px; }
        .dp-icon-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); width: 30px; height: 30px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .dp-icon-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .dp-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: #ef4444; }
        .dp-empty { text-align: center; padding: 60px 20px; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .dp-empty p { font-weight: 600; color: var(--text-primary); margin: 12px 0 4px; }
        .dp-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .dp-btn-primary { background: var(--accent-color); color: #fff; }
        .dp-btn-primary:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .dp-btn-ghost { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .dp-btn-ghost:hover { background: var(--hover-bg); color: var(--text-primary); }
        .dp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .dp-modal { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 16px; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 28px; }
        .dp-modal h2 { font-size: 1.3rem; color: var(--text-primary); margin: 0 0 24px; font-weight: 600; }
        .dp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .dp-form-full { margin-bottom: 16px; }
        .dp-form-group label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .dp-form-group input, .dp-form-group select, .dp-form-group textarea { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box; outline: none; }
        .dp-form-group input:focus, .dp-form-group textarea:focus { border-color: var(--accent-color); }
        .dp-form-group textarea { min-height: 300px; resize: vertical; font-family: monospace; line-height: 1.6; }
        .dp-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }
        .dp-toggle { display: flex; align-items: center; gap: 10px; }
        .dp-toggle-track { width: 40px; height: 22px; border-radius: 22px; background: var(--border-color); cursor: pointer; position: relative; transition: background 0.2s; }
        .dp-toggle-track.on { background: var(--accent-color); }
        .dp-toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
        .dp-toggle-track.on .dp-toggle-knob { transform: translateX(18px); }
        .dp-banner-preview { width: 100%; max-height: 160px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color); margin-bottom: 8px; }
        @media (max-width: 640px) { .dp-form-row { grid-template-columns: 1fr; } }
      `}</style>

      {toast && <div className={`dp-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="dp-header">
        <div>
          <h2>Dynamic Pages</h2>
          <p>Create and manage any page on your website — About Us, Warranty, Custom landing pages, and more.</p>
        </div>
        <button className="dp-btn dp-btn-primary" onClick={openNew}>+ New Page</button>
      </div>

      <div className="dp-bar">
        <span className={`dp-chip ${!filterCat ? 'active' : ''}`} onClick={() => setFilterCat('')}>All ({pages.length})</span>
        {categories.map(cat => (
          <span key={cat} className={`dp-chip ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>
            {cat} ({pages.filter(p => p.category === cat).length})
          </span>
        ))}
      </div>

      {loading ? (
        <div className="dp-empty">Loading pages...</div>
      ) : filtered.length === 0 ? (
        <div className="dp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.5 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No pages yet</p>
          <span>Create your first dynamic page using the button above.</span>
        </div>
      ) : (
        <div className="dp-grid">
          {filtered.map(page => (
            <div className="dp-card" key={page.id} onClick={() => openEdit(page)}>
              <div className="dp-card-top">
                <div>
                  <h3>{page.title}</h3>
                  <div className="dp-card-cat">{page.category}</div>
                </div>
                <div className="dp-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="dp-icon-btn danger" onClick={() => handleDelete(page.id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
              <div className="dp-card-meta">{page.content ? page.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : 'No content yet'}</div>
              <div className="dp-card-footer">
                <span className="dp-card-slug">/{page.slug}</span>
                <span className={`dp-badge ${page.active ? 'active' : 'inactive'}`}>{page.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="dp-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Page' : 'Create New Page'}</h2>

            <div className="dp-form-row">
              <div className="dp-form-group">
                <label>Page Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. About Us" />
              </div>
              <div className="dp-form-group">
                <label>URL Slug</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="auto-generated" style={{ flex: 1 }} />
                  <button className="dp-btn dp-btn-ghost" style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={handleSlugGenerate}>Generate</button>
                </div>
              </div>
            </div>

            <div className="dp-form-row">
              <div className="dp-form-group">
                <label>Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Company, Policies, FAQ" list="dp-categories" />
                <datalist id="dp-categories">
                  {['Company', 'Policies', 'FAQ', 'Information', 'General'].map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="dp-form-group">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="dp-form-row">
              <div className="dp-form-group">
                <label>Meta Description (SEO)</label>
                <input type="text" value={form.meta_description} onChange={(e) => setForm(prev => ({ ...prev, meta_description: e.target.value }))} placeholder="Brief description for search engines" />
              </div>
              <div className="dp-form-group">
                <label>Status</label>
                <div className="dp-toggle" onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}>
                  <div className={`dp-toggle-track ${form.active ? 'on' : ''}`}><div className="dp-toggle-knob" /></div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{form.active ? 'Active' : 'Draft'}</span>
                </div>
              </div>
            </div>

            <div className="dp-form-full">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Banner Image</label>
              {form.banner_image && <img src={form.banner_image} alt="Banner" className="dp-banner-preview" />}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) handleBannerUpload(e.target.files[0]) }} />
                <button className="dp-btn dp-btn-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Banner'}
                </button>
                <input type="text" value={form.banner_image} onChange={(e) => setForm(prev => ({ ...prev, banner_image: e.target.value }))} placeholder="Or paste image URL" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--header-bg)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              </div>
            </div>

            <div className="dp-form-full">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Page Content (HTML supported)</label>
              <textarea value={form.content} onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Write your page content here. HTML tags are supported for formatting." />
            </div>

            <div className="dp-form-actions">
              <button className="dp-btn dp-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="dp-btn dp-btn-primary" onClick={handleSave}>{editing ? 'Update Page' : 'Create Page'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DynamicPages
