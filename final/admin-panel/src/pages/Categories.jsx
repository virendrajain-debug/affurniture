// ============================================================
// Collection Structure & Category Ordering Manager
// ============================================================
// Features:
//  - Clean Up (▲) and Down (▼) buttons for fine-tuned ordering
//  - Sorted in ascending order (Slots 1 -> 7, followed by Other Categories)
//  - Clean Add Category input with strict maxLength={20}
//  - Inline Subcategories accordion
//  - API: GET /api/categories, POST /api/categories, PUT /api/categories/:id,
//         DELETE /api/categories/:id, PUT /api/categories/reorder,
//         GET /api/subcategories, POST /api/subcategories, PUT /api/subcategories/:id, DELETE /api/subcategories/:id
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function Categories({ token }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Add / Edit Category State
  const [newCatName, setNewCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [expandedCatId, setExpandedCatId] = useState(null)

  // Subcategory Add / Edit State
  const [newSubNames, setNewSubNames] = useState({}) // { [catId]: string }

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch all categories & subcategories on mount
  const fetchCategoriesAndSubs = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/subcategories`),
      ])
      const catData = await catRes.json()
      const subData = await subRes.json()

      if (Array.isArray(catData)) {
        const sorted = [...catData].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        setCategories(sorted)
      }
      if (Array.isArray(subData)) {
        setSubcategories(subData)
      }
    } catch {
      showToast('Failed to load collection data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoriesAndSubs()
  }, [])

  // Persist reordered array to backend
  const persistReorder = async (newOrderedList) => {
    setCategories(newOrderedList)
    try {
      await fetch(`${API_BASE}/api/categories/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          categories: newOrderedList.map((c, idx) => ({ id: c.id, sort_order: idx + 1 })),
        }),
      })
    } catch {
      newOrderedList.forEach((c, idx) => {
        fetch(`${API_BASE}/api/categories/${c.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ name: c.name, sort_order: idx + 1 }),
        }).catch(() => {})
      })
    }
  }

  // Split into Frontpage (Slots 1–7) and Other Categories in ascending order
  const frontpageCategories = categories.slice(0, 7)
  const otherCategories = categories.slice(7)

  // 1. Up & Down Button Reordering
  const handleMoveUp = (globalIndex) => {
    if (globalIndex <= 0) return
    const listCopy = [...categories]
    const temp = listCopy[globalIndex]
    listCopy[globalIndex] = listCopy[globalIndex - 1]
    listCopy[globalIndex - 1] = temp
    persistReorder(listCopy)
    showToast('Position moved up', 'info')
  }

  const handleMoveDown = (globalIndex) => {
    if (globalIndex >= categories.length - 1) return
    const listCopy = [...categories]
    const temp = listCopy[globalIndex]
    listCopy[globalIndex] = listCopy[globalIndex + 1]
    listCopy[globalIndex + 1] = temp
    persistReorder(listCopy)
    showToast('Position moved down', 'info')
  }

  // 2. Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault()
    const trimmed = newCatName.trim()
    if (!trimmed) return showToast('Enter a category name', 'warning')
    if (trimmed.length > 20) return showToast('Category name cannot exceed 20 characters', 'error')

    try {
      const nextOrder = categories.length + 1
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ name: trimmed, sort_order: nextOrder }),
      })
      if (res.ok) {
        setNewCatName('')
        showToast('Category created successfully', 'success')
        fetchCategoriesAndSubs()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to create category', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    }
  }

  // 3. Rename Category
  const handleRenameCategory = async (id) => {
    const trimmed = editCatName.trim()
    if (!trimmed) return showToast('Category name cannot be empty', 'warning')
    if (trimmed.length > 20) return showToast('Category name cannot exceed 20 characters', 'error')

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ name: trimmed }),
      })
      if (res.ok) {
        showToast('Category updated', 'success')
        setEditingCatId(null)
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to update category', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // 4. Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? All subcategories will also be removed.`)) return
    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Category deleted', 'success')
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to delete category', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // 5. Image Upload Helper
  const handleImageUpload = async (catId, file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    formData.append('file', file)
    try {
      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })
      if (uploadRes.ok) {
        const d = await uploadRes.json()
        const url = d.url || d.imageUrl || d.image_url
        if (url) {
          await fetch(`${API_BASE}/api/categories/${catId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({ image: url }),
          })
          showToast('Category image updated', 'success')
          fetchCategoriesAndSubs()
        }
      }
    } catch {
      showToast('Error uploading image', 'error')
    }
  }

  // Subcategory Actions
  const handleAddSubcategory = async (catId) => {
    const name = (newSubNames[catId] || '').trim()
    if (!name) return showToast('Enter subcategory name', 'warning')
    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ category_id: catId, name }),
      })
      if (res.ok) {
        showToast('Subcategory added', 'success')
        setNewSubNames(prev => ({ ...prev, [catId]: '' }))
        fetchCategoriesAndSubs()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDeleteSubcategory = async (subId) => {
    if (!window.confirm('Delete this subcategory?')) return
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${subId}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Subcategory deleted', 'success')
        fetchCategoriesAndSubs()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // Render a Category Card Item
  const renderCategoryCard = (cat, globalIndex, isFrontpage) => {
    const isExpanded = expandedCatId === cat.id
    const isEditing = editingCatId === cat.id
    const childSubs = subcategories.filter(s => String(s.category_id) === String(cat.id))

    return (
      <div
        key={cat.id}
        style={{
          background: 'var(--header-bg, #1a2238)',
          borderRadius: '10px',
          border: `1px solid ${isExpanded ? 'var(--accent-color, #d4af37)' : 'var(--border-color, rgba(255,255,255,0.1))'}`,
          overflow: 'hidden',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Card Row */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Slot & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
            {/* Slot Number Badge */}
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isFrontpage ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isFrontpage ? 'var(--accent-color, #d4af37)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: isFrontpage ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={isFrontpage ? `Frontpage Slot #${globalIndex + 1}` : `Catalog Item #${globalIndex + 1}`}
            >
              #{globalIndex + 1}
            </span>

            {/* Thumbnail */}
            <label style={{ cursor: 'pointer', flexShrink: 0 }} title="Click to upload category image">
              <img
                src={getAssetUrl(cat.image)}
                alt={cat.name}
                className="admin-thumb"
                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Category' }}
              />
              <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(cat.id, e.target.files[0])} />
            </label>

            {/* Category Name & Inline Edit */}
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                <input
                  type="text"
                  maxLength={20}
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.9rem', flex: 1, maxWidth: '240px' }}
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  autoFocus
                />
                <button type="button" className="btn-icon btn-add" onClick={() => handleRenameCategory(cat.id)} title="Save Name">
                  &#10003;
                </button>
                <button type="button" className="btn-icon btn-delete" onClick={() => setEditingCatId(null)} title="Cancel">
                  &#10005;
                </button>
              </div>
            ) : (
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span
                    className="badge badge-default"
                    style={{ fontSize: '0.72rem', cursor: 'pointer' }}
                    onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                  >
                    {childSubs.length} Subcategories {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Up / Down Ordering Buttons & Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            
            {/* Up and Down Buttons */}
            <div style={{ display: 'inline-flex', gap: '4px' }}>
              <button
                type="button"
                className="btn-icon"
                disabled={globalIndex === 0}
                onClick={() => handleMoveUp(globalIndex)}
                title="Move Up in Sequence"
                style={{
                  width: '34px',
                  height: '34px',
                  opacity: globalIndex === 0 ? 0.25 : 1,
                  cursor: globalIndex === 0 ? 'not-allowed' : 'pointer',
                  background: 'var(--input-bg, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                &#9650;
              </button>

              <button
                type="button"
                className="btn-icon"
                disabled={globalIndex === categories.length - 1}
                onClick={() => handleMoveDown(globalIndex)}
                title="Move Down in Sequence"
                style={{
                  width: '34px',
                  height: '34px',
                  opacity: globalIndex === categories.length - 1 ? 0.25 : 1,
                  cursor: globalIndex === categories.length - 1 ? 'not-allowed' : 'pointer',
                  background: 'var(--input-bg, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                &#9660;
              </button>
            </div>

            {/* Rename Category Icon */}
            <button
              type="button"
              className="btn-icon btn-edit"
              onClick={() => {
                setEditingCatId(cat.id)
                setEditCatName(cat.name)
              }}
              title="Rename Category"
              style={{ width: '34px', height: '34px' }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Delete Category Icon */}
            <button
              type="button"
              className="btn-icon btn-delete"
              onClick={() => handleDeleteCategory(cat.id, cat.name)}
              title="Delete Category"
              style={{ width: '34px', height: '34px' }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

          </div>
        </div>

        {/* Subcategories Accordion */}
        {isExpanded && (
          <div style={{ padding: '14px 16px 16px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Subcategories ({childSubs.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {childSubs.length === 0 ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No subcategories yet.</span>
              ) : (
                childSubs.map(s => (
                  <span
                    key={s.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'var(--input-bg, rgba(255,255,255,0.05))',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                    }}
                  >
                    {s.name}
                    <button
                      type="button"
                      onClick={() => handleDeleteSubcategory(s.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}
                      title="Delete Subcategory"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', maxWidth: '380px' }}>
              <input
                type="text"
                placeholder="Add new subcategory..."
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                value={newSubNames[cat.id] || ''}
                onChange={(e) => setNewSubNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubcategory(cat.id) }}
              />
              <button type="button" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => handleAddSubcategory(cat.id)}>
                + Add
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Clean Add New Category Bar (Single Input with strict 20 character limit) */}
      <form onSubmit={handleAddCategory} className="admin-card" style={{ display: 'flex', gap: '12px', padding: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            maxLength={20}
            style={{ width: '100%', boxSizing: 'border-box', paddingRight: '55px' }}
            placeholder="Enter category name (e.g. Lounge Suite, Bedroom)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: newCatName.length >= 20 ? '#ef4444' : 'var(--text-secondary)', pointerEvents: 'none' }}>
            {newCatName.length}/20
          </span>
        </div>
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          + Add Category
        </button>
      </form>

      {/* Container 1: Frontpage Categories (Slots 1 to 7) */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Frontpage Categories (Top 7)
              <span className="badge badge-purple" style={{ fontSize: '0.78rem' }}>
                {frontpageCategories.length} / 7 Active
              </span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Top 7 categories in ascending order (#1 to #7) automatically featured on the storefront navbar and homepage. Use ▲ / ▼ to reorder.
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : frontpageCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            No frontpage categories assigned yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {frontpageCategories.map((cat, idx) => renderCategoryCard(cat, idx, true))}
          </div>
        )}
      </div>

      {/* Container 2: All Other Categories */}
      {otherCategories.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                All Other Categories
                <span className="badge badge-default" style={{ fontSize: '0.78rem' }}>
                  {otherCategories.length} Categories
                </span>
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Additional categories accessible via catalog search, product filters, and direct collection links. Use ▲ to move a category up into the top 7.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {otherCategories.map((cat, relIdx) => renderCategoryCard(cat, relIdx + 7, false))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories;
