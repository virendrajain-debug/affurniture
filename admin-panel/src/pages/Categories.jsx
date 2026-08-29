import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function Categories({ token }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [expandedCat, setExpandedCat] = useState(null)
  const [newCatName, setNewCatName] = useState('')
  const [editingCat, setEditingCat] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [newSubName, setNewSubName] = useState('')
  const [addingSubTo, setAddingSubTo] = useState(null)
  const [editingSub, setEditingSub] = useState(null)
  const [editSubName, setEditSubName] = useState('')
  const fileInputRef = useRef({})

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`)
      const data = await res.json()
      if (Array.isArray(data)) setCategories(data)
    } catch { showToast('Failed to load categories', 'error') }
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return showToast('Enter a category name', 'warning')
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName.trim() }),
      })
      if (res.ok) { setNewCatName(''); showToast('Category created', 'success'); fetchCategories() }
      else { const d = await res.json().catch(() => ({})); showToast(d.message || 'Failed', 'error') }
    } catch { showToast('Server error', 'error') }
  }

  const handleRenameCategory = async (catId) => {
    if (!editCatName.trim()) return
    try {
      const res = await fetch(`${API_BASE}/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editCatName.trim() }),
      })
      if (res.ok) { setEditingCat(null); showToast('Category renamed', 'success'); fetchCategories() }
      else { const d = await res.json().catch(() => ({})); showToast(d.message || 'Failed', 'error') }
    } catch { showToast('Server error', 'error') }
  }

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category and all its subcategories?')) return
    try {
      const res = await fetch(`${API_BASE}/api/categories/${catId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { showToast('Category deleted', 'success'); fetchCategories() }
      else showToast('Failed to delete', 'error')
    } catch { showToast('Server error', 'error') }
  }

  const handleImageUpload = async (catId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const uploadRes = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      if (uploadData.url) {
        const cat = categories.find(c => c.id === catId)
        await fetch(`${API_BASE}/api/categories/${catId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: cat.name, image: uploadData.url }),
        })
        showToast('Image updated', 'success')
        fetchCategories()
      }
    } catch { showToast('Upload failed', 'error') }
  }

  const handleMoveCategory = async (catId, direction) => {
    const idx = categories.findIndex(c => c.id === catId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return
    const current = categories[idx]
    const swap = categories[swapIdx]
    try {
      await fetch(`${API_BASE}/api/categories/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: current.name, image: current.image || '', sort_order: swap.sort_order || 0 }),
      })
      await fetch(`${API_BASE}/api/categories/${swap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: swap.name, image: swap.image || '', sort_order: current.sort_order || 0 }),
      })
      fetchCategories()
    } catch { showToast('Reorder failed', 'error') }
  }

  const handleAddSubcategory = async (catId) => {
    if (!newSubName.trim()) return showToast('Enter a subcategory name', 'warning')
    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSubName.trim(), category_id: catId }),
      })
      if (res.ok) { setNewSubName(''); setAddingSubTo(null); showToast('Subcategory added', 'success'); fetchCategories() }
      else { const d = await res.json().catch(() => ({})); showToast(d.message || 'Failed', 'error') }
    } catch { showToast('Server error', 'error') }
  }

  const handleRenameSubcategory = async (subId, catId) => {
    if (!editSubName.trim()) return
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editSubName.trim(), category_id: catId }),
      })
      if (res.ok) { setEditingSub(null); showToast('Subcategory renamed', 'success'); fetchCategories() }
      else { const d = await res.json().catch(() => ({})); showToast(d.message || 'Failed', 'error') }
    } catch { showToast('Server error', 'error') }
  }

  const handleDeleteSubcategory = async (subId) => {
    if (!window.confirm('Delete this subcategory?')) return
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${subId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) { showToast('Subcategory deleted', 'success'); fetchCategories() }
      else showToast('Failed to delete', 'error')
    } catch { showToast('Server error', 'error') }
  }

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .cm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .cm-header h2 { font-size: 1.5rem; color: var(--text-primary); margin: 0; font-weight: 600; }
        .cm-header p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }
        .cm-add-bar { display: flex; gap: 12px; margin-bottom: 24px; }
        .cm-input { flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box; transition: border-color 0.2s; }
        .cm-input:focus { outline: none; border-color: var(--accent-color); }
        .cm-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
        .cm-btn-primary { background: var(--accent-color); color: #fff; }
        .cm-btn-primary:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .cm-btn-ghost { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .cm-btn-ghost:hover { background: var(--hover-bg); color: var(--text-primary); }
        .cm-btn-sm { padding: 6px 12px; font-size: 0.8rem; }
        .cm-cat-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: border-color 0.2s; }
        .cm-cat-card:hover { border-color: var(--accent-color); }
        .cm-cat-header { display: flex; align-items: center; gap: 14px; padding: 16px 20px; cursor: pointer; }
        .cm-cat-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border-color); background: var(--hover-bg); flex-shrink: 0; }
        .cm-cat-img-placeholder { width: 48px; height: 48px; border-radius: 10px; border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.75rem; flex-shrink: 0; cursor: pointer; background: var(--hover-bg); }
        .cm-cat-img-placeholder:hover { border-color: var(--accent-color); color: var(--accent-color); }
        .cm-cat-name-wrap { flex: 1; min-width: 0; }
        .cm-cat-name { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin: 0; }
        .cm-cat-name input { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); background: var(--header-bg); border: 1px solid var(--accent-color); border-radius: 6px; padding: 4px 10px; width: 100%; }
        .cm-cat-name input:focus { outline: none; }
        .cm-cat-meta { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }
        .cm-cat-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .cm-icon-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .cm-icon-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .cm-icon-btn.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: #ef4444; }
        .cm-icon-btn.accent:hover { background: rgba(34,197,94,0.1); color: #22c55e; border-color: #22c55e; }
        .cm-sub-list { border-top: 1px solid var(--border-color); padding: 12px 20px 16px 82px; }
        .cm-sub-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; transition: background 0.15s; }
        .cm-sub-item:hover { background: var(--hover-bg); }
        .cm-sub-name { flex: 1; font-size: 0.9rem; color: var(--text-primary); }
        .cm-sub-name input { font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); border: 1px solid var(--accent-color); border-radius: 6px; padding: 4px 10px; width: 100%; }
        .cm-sub-count { font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; }
        .cm-sub-actions { display: flex; gap: 4px; }
        .cm-add-sub { display: flex; gap: 8px; margin-top: 8px; padding: 8px 12px; }
        .cm-add-sub input { flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-primary); background: var(--header-bg); }
        .cm-add-sub input:focus { outline: none; border-color: var(--accent-color); }
        .cm-empty { text-align: center; padding: 60px 20px; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .cm-empty p { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: 12px 0 4px; }
        .toast-cm { position: fixed; top: 24px; right: 24px; z-index: 9999; background: var(--sidebar-bg); border-left: 4px solid var(--accent-color); color: var(--text-primary); padding: 16px 24px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem; animation: fadeIn 0.3s ease-out; }
        .toast-cm.error { border-left-color: #ef4444; }
        .toast-cm.success { border-left-color: #22c55e; }
        .toast-cm.warning { border-left-color: #f59e0b; }
      `}</style>

      {toast && <div className={`toast-cm ${toast.type}`}>{toast.msg}</div>}

      <div className="cm-header">
        <div>
          <h2>Categories & Subcategories</h2>
          <p>Manage your product categories. Drag to reorder, click names to edit.</p>
        </div>
      </div>

      <form className="cm-add-bar" onSubmit={handleAddCategory}>
        <input
          type="text"
          className="cm-input"
          placeholder="New category name (e.g. Office Furniture)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <button type="submit" className="cm-btn cm-btn-primary">Add Category</button>
      </form>

      {loading ? (
        <div className="cm-empty">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="cm-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.5 }}>
            <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <p>No categories yet</p>
          <span>Add your first category above to get started.</span>
        </div>
      ) : (
        categories.map((cat, idx) => (
          <div className="cm-cat-card" key={cat.id}>
            <div className="cm-cat-header" onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="cm-cat-img" />
              ) : (
                <label className="cm-cat-img-placeholder" onClick={(e) => e.stopPropagation()}>
                  + img
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) handleImageUpload(cat.id, e.target.files[0]) }} />
                </label>
              )}

              <div className="cm-cat-name-wrap">
                {editingCat === cat.id ? (
                  <div className="cm-cat-name" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      onBlur={() => handleRenameCategory(cat.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCategory(cat.id); if (e.key === 'Escape') setEditingCat(null) }}
                    />
                  </div>
                ) : (
                  <h3 className="cm-cat-name" onDoubleClick={(e) => { e.stopPropagation(); setEditingCat(cat.id); setEditCatName(cat.name) }}>{cat.name}</h3>
                )}
                <div className="cm-cat-meta">{cat.product_count || 0} products · {(cat.subcategories || []).length} subcategories</div>
              </div>

              <div className="cm-cat-actions" onClick={(e) => e.stopPropagation()}>
                <button className="cm-icon-btn" onClick={() => handleMoveCategory(cat.id, 'up')} disabled={idx === 0} title="Move up">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button className="cm-icon-btn" onClick={() => handleMoveCategory(cat.id, 'down')} disabled={idx === categories.length - 1} title="Move down">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button className="cm-icon-btn accent" onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name) }} title="Rename">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className="cm-icon-btn danger" onClick={() => handleDeleteCategory(cat.id)} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>

            {expandedCat === cat.id && (
              <div className="cm-sub-list">
                {(cat.subcategories || []).map(sub => (
                  <div className="cm-sub-item" key={sub.id}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>&#9472;</span>
                    {editingSub === sub.id ? (
                      <div className="cm-sub-name">
                        <input
                          autoFocus
                          value={editSubName}
                          onChange={(e) => setEditSubName(e.target.value)}
                          onBlur={() => handleRenameSubcategory(sub.id, cat.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubcategory(sub.id, cat.id); if (e.key === 'Escape') setEditingSub(null) }}
                        />
                      </div>
                    ) : (
                      <span className="cm-sub-name" onDoubleClick={() => { setEditingSub(sub.id); setEditSubName(sub.name) }}>{sub.name}</span>
                    )}
                    <span className="cm-sub-count">{sub.product_count || 0} products</span>
                    <div className="cm-sub-actions">
                      <button className="cm-icon-btn" style={{ width: 26, height: 26 }} onClick={() => { setEditingSub(sub.id); setEditSubName(sub.name) }} title="Rename">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="cm-icon-btn danger" style={{ width: 26, height: 26 }} onClick={() => handleDeleteSubcategory(sub.id)} title="Delete">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}

                {addingSubTo === cat.id ? (
                  <div className="cm-add-sub">
                    <input
                      autoFocus
                      placeholder="Subcategory name"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubcategory(cat.id); if (e.key === 'Escape') { setAddingSubTo(null); setNewSubName('') } }}
                    />
                    <button className="cm-btn cm-btn-primary cm-btn-sm" onClick={() => handleAddSubcategory(cat.id)}>Add</button>
                    <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={() => { setAddingSubTo(null); setNewSubName('') }}>Cancel</button>
                  </div>
                ) : (
                  <button className="cm-btn cm-btn-ghost cm-btn-sm" style={{ marginTop: 8, marginLeft: 12 }} onClick={() => { setAddingSubTo(cat.id); setNewSubName('') }}>
                    + Add subcategory
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default Categories
