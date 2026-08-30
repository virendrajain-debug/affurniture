// ============================================================
// Premium Subcategories Management Module
// ============================================================
// Features: Parent category selector filter, full CRUD, sort ordering,
// live product counts, modern responsive table, and inline editing.
// API: GET, POST /api/subcategories, PUT /api/subcategories/:id, DELETE /api/subcategories/:id
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function Subcategories({ token }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [selectedCatFilter, setSelectedCatFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Add Subcategory State
  const [newSubName, setNewSubName] = useState('')
  const [newSubCatId, setNewSubCatId] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit Modal State
  const [editingSub, setEditingSub] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCatId, setEditCatId] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const getActiveToken = () => {
    return (
      getAuthToken(token) ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('af_admin_token') ||
      ''
    )
  }

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/subcategories`),
      ])
      if (catRes.ok) {
        const catData = await catRes.json()
        if (Array.isArray(catData)) {
          setCategories(catData)
          if (catData.length > 0 && !newSubCatId) setNewSubCatId(catData[0].id)
        }
      }
      if (subRes.ok) {
        const subData = await subRes.json()
        if (Array.isArray(subData)) setSubcategories(subData)
      }
    } catch {
      showToast('Failed to load subcategories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    if (!newSubName.trim()) return showToast('Please enter a subcategory name', 'warning')
    if (!newSubCatId) return showToast('Please select a parent category', 'warning')

    const activeToken = getActiveToken()
    setAdding(true)
    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          name: newSubName.trim(),
          category_id: newSubCatId,
        }),
      })

      if (res.ok) {
        showToast('Subcategory created successfully', 'success')
        setNewSubName('')
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to create subcategory', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleOpenEdit = (sub) => {
    setEditingSub(sub)
    setEditName(sub.name)
    setEditCatId(sub.category_id)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return showToast('Name cannot be empty', 'warning')
    const activeToken = getActiveToken()
    setSavingEdit(true)
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${editingSub.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          category_id: editCatId,
        }),
      })

      if (res.ok) {
        showToast('Subcategory updated successfully', 'success')
        setEditingSub(null)
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update subcategory', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      })
      if (res.ok) {
        showToast('Subcategory deleted', 'success')
        fetchData()
      } else {
        showToast('Failed to delete subcategory', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const filteredSubs = subcategories.filter((s) => {
    if (selectedCatFilter === 'all') return true
    return String(s.category_id) === String(selectedCatFilter)
  })

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Card: Create Form */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Add New Subcategory</h3>
          </div>

          <form onSubmit={handleAddSubcategory}>
            <div className="form-group">
              <label className="form-label">Parent Category *</label>
              <select
                className="form-select"
                value={newSubCatId}
                onChange={(e) => setNewSubCatId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subcategory Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ergonomic Chairs, Dining Tables"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '6px' }}
              disabled={adding}
            >
              {adding ? 'Creating...' : '+ Create Subcategory'}
            </button>
          </form>
        </div>

        {/* Right Card: Subcategories Table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Existing Subcategories ({filteredSubs.length})</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="filter-select"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container contain-content">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Subcategory Name</th>
                  <th>Parent Category</th>
                  <th>Products</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      Loading subcategories...
                    </td>
                  </tr>
                ) : filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No subcategories found.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub, index) => (
                    <tr key={sub.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {index + 1}
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{sub.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge-purple">{sub.category_name || 'Category'}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {sub.product_count || 0} products
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-icon btn-edit"
                            onClick={() => handleOpenEdit(sub)}
                            title="Edit Subcategory"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(sub.id, sub.name)}
                            title="Delete Subcategory"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Subcategory Modal */}
      {editingSub && (
        <div className="modal-overlay" onClick={() => setEditingSub(null)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Subcategory</h3>
              <button className="modal-close-btn" onClick={() => setEditingSub(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Parent Category</label>
                  <select
                    className="form-select"
                    value={editCatId}
                    onChange={(e) => setEditCatId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Subcategory Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingSub(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subcategories
