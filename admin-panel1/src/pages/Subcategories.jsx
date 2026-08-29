// ============================================================
// Premium Subcategories Management Module (Theme Engine Enabled)
// ============================================================
// Features: Subcategory CRUD linked to parent categories.
// API: GET, POST, and DELETE /api/subcategories with Bearer token.
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Subcategories({ token }) {
  const [subcategories, setSubcategories] = useState([])
  const [categories, setCategories] = useState([])
  const [parentCategoryId, setParentCategoryId] = useState('')
  const [subName, setSubName] = useState('')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/subcategories`),
      ])

      if (catRes.ok) {
        const catData = await catRes.json()
        if (Array.isArray(catData)) setCategories(catData)
      }

      if (subRes.ok) {
        const subData = await subRes.json()
        if (Array.isArray(subData)) setSubcategories(subData)
      }
    } catch {
      showToast('Failed to load category data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!parentCategoryId) return showToast('Select a parent category', 'warning')
    if (!subName.trim()) return showToast('Enter a subcategory name', 'warning')

    const parent = categories.find((c) => String(c.id) === String(parentCategoryId))
    const payload = {
      name: subName.trim(),
      category_id: parentCategoryId,
      category_name: parent?.name || '',
    }

    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json().catch(() => null)
        setSubcategories((prev) => [
          ...prev,
          data && data.id ? data : { id: Date.now(), name: subName.trim(), category: parent?.name, category_id: parentCategoryId },
        ])
        setSubName('')
        showToast('Subcategory added successfully', 'success')
      } else {
        const data = await res.json().catch(() => ({}))
        showToast(data.message || 'Failed to add subcategory', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subcategory?')) return

    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setSubcategories((prev) => prev.filter((c) => c.id !== id))
        showToast('Subcategory removed', 'success')
      } else {
        showToast('Failed to remove subcategory', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; padding: 24px; box-sizing: border-box; width: 100%; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card h3 { font-size: 1.15rem; color: var(--text-primary); margin: 0 0 16px; font-weight: 600; }

        .p-input-group { margin-bottom: 0; }
        .p-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .p-input, .p-select {
          width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
          font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box;
          transition: border-color 0.2s; outline: none;
        }
        .p-input:focus, .p-select:focus { border-color: var(--accent-color); }
        .p-select { cursor: pointer; appearance: none; background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }

        .p-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        
        .btn-icon {
          background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);
          width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-icon:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

        .p-categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .p-category-card {
          background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px;
          padding: 20px; display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: transform 0.2s, border-color 0.2s;
        }
        .p-category-card:hover { transform: translateY(-2px); border-color: var(--accent-color); }
        
        .cat-info h3 { margin: 0 0 4px; font-size: 1.05rem; color: var(--text-primary); font-weight: 600; }
        .cat-count { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }

        .page-loading, .empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 12px 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

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
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-card">
        <h3>Create New Subcategory</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '14px', alignItems: 'flex-end' }}>
          <div className="p-input-group">
            <label className="p-label">Parent Category *</label>
            <select 
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              className="p-select"
            >
              <option value="">Select Parent Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="p-input-group">
            <label className="p-label">Subcategory Name *</label>
            <input
              type="text"
              placeholder="e.g. Sectional Sofas"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="p-input"
            />
          </div>

          <button type="submit" className="p-btn p-btn-primary" style={{ height: '45px' }}>Add Subcategory</button>
        </form>
      </div>

      {loading ? (
        <div className="page-loading">Loading subcategories...</div>
      ) : subcategories.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <p>No subcategories yet</p>
          <span>Add your first subcategory using the form above.</span>
        </div>
      ) : (
        <div className="p-categories-grid">
          {subcategories.map((sub) => (
            <div className="p-category-card" key={sub.id}>
              <div className="cat-info">
                <h3>{sub.name}</h3>
                <span className="cat-count">Parent: {sub.category || sub.category_name || 'General'}</span>
              </div>
              <button className="btn-icon" onClick={() => handleDelete(sub.id)} title="Remove Subcategory">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Subcategories