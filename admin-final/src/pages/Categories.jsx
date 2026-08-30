// ============================================================
// Premium Catalog Structure & Categories Manager (Dual-Mode Theme Engine)
// ============================================================
// Features:
//  - HTML5 Drag-and-Drop Reordering with instant persistence
//  - Storefront Navbar Limit Bar (Slots 1 to 7 Active for Storefront Header)
//  - Additional Catalog Categories lower section
//  - Inline Subcategories Accordion with count badge and inline CRUD
//  - Compact SVG micro-action buttons with tooltips
//  - Category image uploader and inline rename
//  - API: GET /api/categories, POST /api/categories, PUT /api/categories/:id,
//         DELETE /api/categories/:id, PUT /api/categories/reorder,
//         GET /api/subcategories, POST /api/subcategories, PUT /api/subcategories/:id, DELETE /api/subcategories/:id
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function Categories({ token }) {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Create Category State
  const [newCatName, setNewCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [expandedCatId, setExpandedCatId] = useState(null)

  // Subcategory Add / Edit State
  const [newSubNames, setNewSubNames] = useState({}) // { [catId]: string }
  const [editingSubId, setEditingSubId] = useState(null)
  const [editSubName, setEditSubName] = useState('')

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

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
      showToast('Failed to load catalog data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoriesAndSubs()
  }, [])

  // 1. Create Category
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return showToast('Enter a category name', 'warning')
    const activeToken = getActiveToken()
    try {
      const nextOrder = categories.length + 1
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ name: newCatName.trim(), sort_order: nextOrder }),
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
      showToast('Server error', 'error')
    }
  }

  // 2. Rename Category
  const handleRenameCategory = async (catId) => {
    if (!editCatName.trim()) return
    const activeToken = getActiveToken()
    try {
      const cat = categories.find((c) => c.id === catId)
      const res = await fetch(`${API_BASE}/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ name: editCatName.trim(), image: cat?.image, sort_order: cat?.sort_order }),
      })
      if (res.ok) {
        setEditingCatId(null)
        showToast('Category renamed', 'success')
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to rename category', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // 3. Delete Category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category? Associated products may lose their category assignment.')) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        showToast('Category deleted', 'success')
        if (expandedCatId === catId) setExpandedCatId(null)
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to delete category', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // 4. Upload / Change Category Thumbnail
  const handleImageUpload = async (catId, file) => {
    if (!file) return
    const activeToken = getActiveToken()
    const formData = new FormData()
    formData.append('image', file)

    try {
      const uploadRes = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
        body: formData,
      })
      if (!uploadRes.ok) {
        showToast('Image upload failed', 'error')
        return
      }
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.imageUrl || uploadData.url

      const cat = categories.find((c) => c.id === catId)
      const updateRes = await fetch(`${API_BASE}/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ name: cat.name, image: imageUrl, sort_order: cat.sort_order }),
      })

      if (updateRes.ok) {
        showToast('Category image updated', 'success')
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to update category image', 'error')
      }
    } catch {
      showToast('Server error during image upload', 'error')
    }
  }

  // 5. Drag and Drop Reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd()
      return
    }

    const updated = [...categories]
    const [moved] = updated.splice(draggedIndex, 1)
    updated.splice(targetIndex, 0, moved)

    const reorderedWithPositions = updated.map((cat, idx) => ({
      ...cat,
      sort_order: idx + 1,
    }))

    setCategories(reorderedWithPositions)
    handleDragEnd()

    const activeToken = getActiveToken()
    try {
      await fetch(`${API_BASE}/api/categories/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({
          categories: reorderedWithPositions.map((c) => ({ id: c.id, sort_order: c.sort_order })),
        }),
      })
      showToast('Navbar order updated', 'success')
    } catch {
      showToast('Failed to sync new order', 'error')
    }
  }

  // 6. Subcategory CRUD
  const handleAddSubcategory = async (catId) => {
    const name = (newSubNames[catId] || '').trim()
    if (!name) return showToast('Enter a subcategory name', 'warning')
    const activeToken = getActiveToken()

    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ category_id: catId, name }),
      })
      if (res.ok) {
        showToast('Subcategory added', 'success')
        setNewSubNames((prev) => ({ ...prev, [catId]: '' }))
        fetchCategoriesAndSubs()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to add subcategory', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleRenameSubcategory = async (subId, catId) => {
    if (!editSubName.trim()) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ name: editSubName.trim(), category_id: catId }),
      })
      if (res.ok) {
        showToast('Subcategory renamed', 'success')
        setEditingSubId(null)
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to update subcategory', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDeleteSubcategory = async (subId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${subId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        showToast('Subcategory deleted', 'success')
        fetchCategoriesAndSubs()
      } else {
        showToast('Failed to delete subcategory', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const navbarCategories = categories.slice(0, 7)
  const additionalCategories = categories.slice(7)

  // Render a Category Card Item with Inline Accordion
  const renderCategoryCard = (cat, idx, isSlotActive) => {
    const isExpanded = expandedCatId === cat.id
    const isEditing = editingCatId === cat.id
    const childSubs = subcategories.filter((s) => String(s.category_id) === String(cat.id))

    return (
      <div
        key={cat.id}
        style={{
          background: 'var(--header-bg)',
          borderRadius: '10px',
          border: `1px solid ${isExpanded ? 'var(--accent-color)' : 'var(--border-color)'}`,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          opacity: draggedIndex === idx ? 0.4 : 1,
        }}
      >
        {/* Category Header Row */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'grab',
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, idx)}
        >
          {/* Drag Handle & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
            <span style={{ color: 'var(--text-secondary)', cursor: 'grab', fontSize: '1.2rem', userSelect: 'none' }}>
              ⋮⋮
            </span>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isSlotActive ? 'var(--accent-color)' : 'var(--hover-bg)',
                color: isSlotActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: isSlotActive ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {idx + 1}
            </span>

            {/* Thumbnail */}
            <label style={{ cursor: 'pointer', flexShrink: 0 }} title="Click to change category image">
              <img
                src={cat.image || 'https://placehold.co/100x100?text=Category'}
                alt={cat.name}
                className="admin-thumb"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Category' }}
              />
              <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(cat.id, e.target.files[0])} />
            </label>

            {/* Category Name & Inline Edit */}
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.9rem', flex: 1, maxWidth: '280px' }}
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  autoFocus
                />
                <button type="button" className="btn-icon btn-add" onClick={() => handleRenameCategory(cat.id)} title="Save Name">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button type="button" className="btn-icon btn-delete" onClick={() => setEditingCatId(null)} title="Cancel">
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {cat.product_count || 0} Products
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>&bull;</span>
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

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Accordion Toggle Icon */}
            <button
              type="button"
              className={`btn-icon ${isExpanded ? 'btn-view' : ''}`}
              onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
              title={isExpanded ? 'Hide Subcategories' : 'View Subcategories Accordion'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isExpanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
              </svg>
            </button>

            {/* Edit Category Icon */}
            <button
              type="button"
              className="btn-icon btn-edit"
              onClick={() => {
                setEditingCatId(cat.id)
                setEditCatName(cat.name)
              }}
              title="Edit Category Name"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Delete Category Icon */}
            <button
              type="button"
              className="btn-icon btn-delete"
              onClick={() => handleDeleteCategory(cat.id)}
              title="Delete Category"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INLINE SUBCATEGORIES ACCORDION TRAY                          */}
        {/* ============================================================ */}
        {isExpanded && (
          <div
            className="accordion-tray"
            style={{
              background: 'var(--sidebar-bg)',
              borderTop: '1px solid var(--border-color)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-color)' }}>
                Subcategories ({childSubs.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Child collections for {cat.name}
              </span>
            </div>

            {/* Subcategories List */}
            {childSubs.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No subcategories added yet. Add one below to organize products under {cat.name}.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {childSubs.map((sub) => {
                  const isSubEditing = editingSubId === sub.id
                  return (
                    <div
                      key={sub.id}
                      style={{
                        background: 'var(--header-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {isSubEditing ? (
                        <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '2px 8px', fontSize: '0.8rem', width: '130px' }}
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn-icon btn-add"
                            style={{ width: '24px', height: '24px' }}
                            onClick={() => handleRenameSubcategory(sub.id, cat.id)}
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            style={{ width: '24px', height: '24px' }}
                            onClick={() => setEditingSubId(null)}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sub.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            ({sub.product_count || 0})
                          </span>

                          <button
                            type="button"
                            className="btn-icon btn-edit"
                            style={{ width: '24px', height: '24px' }}
                            onClick={() => {
                              setEditingSubId(sub.id)
                              setEditSubName(sub.name)
                            }}
                            title="Edit Subcategory"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            style={{ width: '24px', height: '24px' }}
                            onClick={() => handleDeleteSubcategory(sub.id)}
                            title="Delete Subcategory"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Inline Add Subcategory Input Form */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', maxWidth: '420px' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                placeholder={`+ Add subcategory to ${cat.name}...`}
                value={newSubNames[cat.id] || ''}
                onChange={(e) => setNewSubNames({ ...newSubNames, [cat.id]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubcategory(cat.id)
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => handleAddSubcategory(cat.id)}
              >
                + Add Sub
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="admin-header">
        <h2 className="admin-title">Catalog Structure & Collections</h2>
      </div>

      {/* Add New Category Bar */}
      <form onSubmit={handleAddCategory} className="admin-card" style={{ display: 'flex', gap: '12px', padding: '16px' }}>
        <input
          type="text"
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Enter new category name (e.g. Home Office, Outdoor Dining)..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          + Add Category
        </button>
      </form>

      {/* Storefront Navbar Categories (Max 7 Active Slots) */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Storefront Navbar Categories (Slots 1–7)</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Top 7 categories automatically populate the storefront navigation menu. Drag to reorder.
            </span>
          </div>
          <span className="badge badge-purple">{navbarCategories.length} / 7 Active in Header</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading categories...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navbarCategories.map((cat, idx) => renderCategoryCard(cat, idx, true))}
          </div>
        )}
      </div>

      {/* Additional Categories (Below Slot 7) */}
      {additionalCategories.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Additional Catalog Categories (Slots 8+)</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Catalog categories accessible via Shop Furniture search and full collections.
              </span>
            </div>
            <span className="badge badge-default">{additionalCategories.length} Categories</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {additionalCategories.map((cat, relIdx) => renderCategoryCard(cat, relIdx + 7, false))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
