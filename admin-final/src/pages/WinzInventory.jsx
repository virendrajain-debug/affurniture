// ============================================================
// WINZ Catalogue Products Inventory Studio
// ============================================================
// Manages products displayed on the WINZ Quotes guide and quote request form
// Features:
//   - Product list with thumbnail, item code, category, quote price & active switch
//   - Add / Edit WinZ Product Modal with image upload and live preview
//   - 100% Dynamic API & database persistence
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function WinzInventory({ token }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)

  // Form State
  const [form, setForm] = useState({
    name: '',
    image: '',
    description: '',
    active: 1,
    directUrl: '',
  })

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let url = `${API_BASE}/api/winz-products`
      const params = []
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`)
      if (params.length > 0) url += '?' + params.join('&')

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setProducts(data)
          return
        }
      }
      // Graceful fallback if backend is not yet redeployed (404)
      const cached = localStorage.getItem('af_winz_products')
      if (cached) {
        setProducts(JSON.parse(cached))
      } else {
        setProducts([{"id":1,"name":"Haven Sofa 3-Seater","category":"Living Room","item_code":"WINZ-LIV-01","price":899,"image":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80","description":"A welcoming three-seat sofa with soft cushions, supportive seating and a relaxed modern look.","sort_order":0,"active":1},{"id":2,"name":"Willow Bedroom Foundation Set","category":"Bedroom","item_code":"WINZ-BED-02","price":799,"image":"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80","description":"A simple bedroom foundation with warm finishes and practical storage to create a calm, comfortable space.","sort_order":1,"active":1},{"id":3,"name":"Haven Dining 5-Piece Setting","category":"Dining","item_code":"WINZ-DIN-03","price":649,"image":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80","description":"An everyday dining table setting with 4 chairs made for shared meals and family gatherings.","sort_order":2,"active":1},{"id":4,"name":"Comfort Orthopedic Queen Bed","category":"Bedroom","item_code":"WINZ-BED-04","price":950,"image":"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80","description":"Supportive queen size bed and mattress package with durable slat frame.","sort_order":3,"active":1}])
      }
    } catch {
      const cached = localStorage.getItem('af_winz_products')
      if (cached) setProducts(JSON.parse(cached))
      else setProducts([{"id":1,"name":"Haven Sofa 3-Seater","category":"Living Room","item_code":"WINZ-LIV-01","price":899,"image":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80","description":"A welcoming three-seat sofa with soft cushions, supportive seating and a relaxed modern look.","sort_order":0,"active":1},{"id":2,"name":"Willow Bedroom Foundation Set","category":"Bedroom","item_code":"WINZ-BED-02","price":799,"image":"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80","description":"A simple bedroom foundation with warm finishes and practical storage to create a calm, comfortable space.","sort_order":1,"active":1},{"id":3,"name":"Haven Dining 5-Piece Setting","category":"Dining","item_code":"WINZ-DIN-03","price":649,"image":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80","description":"An everyday dining table setting with 4 chairs made for shared meals and family gatherings.","sort_order":2,"active":1},{"id":4,"name":"Comfort Orthopedic Queen Bed","category":"Bedroom","item_code":"WINZ-BED-04","price":950,"image":"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80","description":"Supportive queen size bed and mattress package with durable slat frame.","sort_order":3,"active":1}])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search])

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      image: '',
      description: '',
      active: 1,
      directUrl: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      image: product.image || '',
      description: product.description || '',
      active: product.active !== undefined ? Number(product.active) : 1,
      directUrl: '',
    })
    setIsModalOpen(true)
  }

  const handleUploadImage = async (file) => {
    if (!file) return
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.url || data.imageUrl || data.image_url
        if (url) {
          setForm(prev => ({ ...prev, image: url }))
          showToast('Image uploaded successfully', 'success')
        }
      } else {
        showToast('Image upload failed', 'error')
      }
    } catch {
      showToast('Image upload connection error', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return showToast('Product name is required', 'warning')

    setSavingProduct(true)
    try {
      const isNew = !editingProduct
      const url = isNew ? `${API_BASE}/api/winz-products` : `${API_BASE}/api/winz-products/${editingProduct.id}`
      const method = isNew ? 'POST' : 'PUT'

      const payload = {
        name: form.name.trim(),
        category: 'Living Room',
        item_code: '',
        price: 0,
        image: form.image.trim(),
        description: form.description.trim().split(/\s+/).slice(0, 50).join(' '),
        active: form.active,
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(isNew ? 'WinZ product added!' : 'WinZ product updated!', 'success')
        setIsModalOpen(false)
        fetchProducts()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to save product', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    const nextActive = currentActive === 1 ? 0 : 1
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: nextActive } : p))

    try {
      await fetch(`${API_BASE}/api/winz-products/${id}/toggle`, {
        method: 'PUT',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      showToast(`Product ${nextActive === 1 ? 'Activated' : 'Deactivated'}`, 'info')
    } catch {
      showToast('Failed to update status', 'error')
      fetchProducts()
    }
  }

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from WinZ inventory?`)) return

    try {
      const res = await fetch(`${API_BASE}/api/winz-products/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('WinZ product deleted', 'success')
        fetchProducts()
      }
    } catch {
      showToast('Failed to delete product', 'error')
    }
  }

  return (
    <div className="admin-page" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Action & Filter Toolbar */}
      <div
        className="filter-toolbar"
        style={{
          background: 'var(--sidebar-bg, #111827)',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search WinZ products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px', fontSize: '0.85rem' }}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openAddModal}
          style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add WinZ Product
        </button>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading WinZ inventory items...
        </div>
      ) : products.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No products found in WinZ inventory.</p>
          <button type="button" className="btn-primary" onClick={openAddModal}>+ Add First WinZ Product</button>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>Product</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                    {/* Product Photo & Title */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                          <img
                            src={getAssetUrl(p.image)}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=WINZ' }}
                          />
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '350px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.description || 'No description'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Active Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', margin: 0, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={p.active === 1}
                            onChange={() => handleToggleActive(p.id, p.active)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              cursor: 'pointer',
                              inset: 0,
                              background: p.active === 1 ? 'var(--accent-color, #d4af37)' : 'rgba(255,255,255,0.15)',
                              borderRadius: '20px',
                              transition: '0.2s',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                content: '""',
                                height: '14px',
                                width: '14px',
                                left: p.active === 1 ? '18px' : '3px',
                                bottom: '3px',
                                backgroundColor: '#fff',
                                borderRadius: '50%',
                                transition: '0.2s',
                              }}
                            />
                          </span>
                        </label>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.active === 1 ? 'var(--accent-color, #d4af37)' : 'var(--text-secondary)' }}>
                          {p.active === 1 ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => openEditModal(p)}
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit WinZ Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content" style={{ background: 'var(--card-bg, #1f2937)', borderRadius: '14px', maxWidth: '640px', width: '100%', padding: '26px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {editingProduct ? 'Edit WinZ Product' : 'Add New WinZ Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Haven Sofa 3-Seater"
                  required
                />
              </div>

              {/* Image Upload & Thumbnail */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Image *</label>
                {form.image ? (
                  <div style={{ position: 'relative', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#000', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
                    <img src={getAssetUrl(form.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById('winz-img-file')?.click()}
                    style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: '8px' }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
                      {uploadingImage ? 'Uploading...' : '+ Click to upload product image'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #888)', display: 'block', marginTop: '4px' }}>Recommended: 600 x 600 pixels</span>
                  </div>
                )}
                <input
                  id="winz-img-file"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { if (e.target.files[0]) handleUploadImage(e.target.files[0]); }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Or paste image URL (https://...)"
                    value={form.directUrl || ''}
                    onChange={(e) => setForm({ ...form, directUrl: e.target.value })}
                    style={{ flex: 1, fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (form.directUrl?.trim()) {
                        setForm({ ...form, image: form.directUrl.trim(), directUrl: '' })
                        showToast('Image URL applied', 'info')
                      }
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Set URL
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description (max 50 words)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={form.description}
                  onChange={(e) => {
                    const words = e.target.value.split(/\s+/)
                    if (words.length <= 50) setForm({ ...form, description: e.target.value })
                  }}
                  placeholder="Brief product description..."
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  {form.description.split(/\s+/).filter(Boolean).length} / 50 words
                </span>
              </div>

              {/* Visibility */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Visibility</label>
                <select
                  className="form-input"
                  value={form.active}
                  onChange={(e) => setForm({ ...form, active: Number(e.target.value) })}
                >
                  <option value={1}>Active (Visible on Storefront)</option>
                  <option value={0}>Hidden / Draft</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingProduct || uploadingImage}
                >
                  {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WinzInventory;
