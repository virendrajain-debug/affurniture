// ============================================================
// Premium Product List Page (Theme Engine Enabled)
// ============================================================
// Features a premium data table and a high-end editing modal
// fully integrated with the global CSS Theme Engine.
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const COLOR_SWATCHES = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Brown', hex: '#6B4226' },
  { name: 'Walnut', hex: '#5B4332' },
  { name: 'Oak', hex: '#C19A6B' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Red', hex: '#C0392B' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Blue', hex: '#2E86C1' },
  { name: 'Green', hex: '#27AE60' },
  { name: 'Teal', hex: '#1ABC9C' },
  { name: 'Gold', hex: '#AA7A3E' },
]

function ProductList({ token }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Edit Modal States
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editImages, setEditImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`)
      const data = await res.json()
      if (Array.isArray(data)) setProducts(data)
    } catch {
      showToast('Failed to load products', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
    fetch(`${API_BASE}/api/categories`).then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Product deleted', 'success')
        fetchProducts()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleEdit = (p) => {
    setEditProduct(p)
    setEditForm({
      name: p.name || '',
      category_id: p.category_id || '',
      mrp: p.mrp || '',
      selling_price: p.selling_price || '',
      description: p.description || '',
      stock: p.stock || '',
      material: p.material || '',
      color: p.color || '',
      size: p.size || '',
      dimensions: p.dimensions || '',
      weight: p.weight || '',
      warranty: p.warranty || '',
      delivery_info: p.delivery_info || '',
      featured: p.featured ? true : false,
      new_arrival: p.new_arrival ? true : false,
    })
    setExistingImages(Array.isArray(p.images) ? p.images : [])
    setEditImages([])
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value })
  }

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditImages(prev => [...prev, { file, url: reader.result }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeEditImage = (index) => {
    setEditImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(editForm).forEach(([key, val]) => {
        if (typeof val === 'boolean') {
          formData.append(key, val.toString())
        } else if (val !== '' && val !== null && val !== undefined) {
          formData.append(key, val)
        }
      })
      formData.append('existing_images', JSON.stringify(existingImages))
      editImages.forEach(img => {
        formData.append('images', img.file)
      })

      const res = await fetch(`${API_BASE}/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        showToast('Product updated successfully', 'success')
        setEditProduct(null)
        fetchProducts()
      } else {
        showToast('Failed to update product', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Premium Table */
        .p-table-wrap { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .p-data-table th { background: var(--header-bg); padding: 16px 20px; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border-color); }
        .p-data-table td { padding: 16px 20px; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .p-data-table tr:last-child td { border-bottom: none; }
        .p-data-table tbody tr:hover { background: var(--hover-bg); }
        
        .p-product-cell { display: flex; align-items: center; gap: 12px; }
        .p-product-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color); }
        .p-product-no-img { width: 44px; height: 44px; border-radius: 8px; background: var(--header-bg); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; border: 1px solid var(--border-color); }
        .p-product-name { font-weight: 600; color: var(--text-primary); }

        .p-action-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .p-action-btn.edit { color: var(--text-secondary); }
        .p-action-btn.edit:hover { background: var(--hover-bg); color: var(--accent-color); }
        .p-action-btn.delete { color: #ef4444; }
        .p-action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); }

        .p-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; }
        .p-badge.stock-in { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .p-badge.stock-out { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .p-badge.featured { background: rgba(255, 126, 179, 0.1); color: var(--accent-color); border: 1px solid var(--border-color); }
        .p-badge.new { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }

        .p-empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border-radius: 12px; border: 1px solid var(--border-color); }
        .p-empty-state p { margin: 12px 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        /* Premium Modal */
        .p-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .p-modal-card { background: var(--sidebar-bg); width: 100%; max-width: 900px; max-height: 90vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .p-modal-header { background: var(--header-bg); padding: 20px 30px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .p-modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.15rem; font-weight: 600; }
        .p-modal-close { background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; line-height: 1; padding: 0; transition: color 0.2s; }
        .p-modal-close:hover { color: #ef4444; }
        
        .p-modal-body { padding: 30px; overflow-y: auto; flex: 1; }
        
        .p-grid { display: grid; gap: 20px; margin-bottom: 20px; }
        .p-grid-2 { grid-template-columns: repeat(2, 1fr); }
        .p-grid-3 { grid-template-columns: repeat(3, 1fr); }
        .p-input-group { display: flex; flex-direction: column; gap: 6px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); transition: all 0.2s; outline: none; width: 100%; box-sizing: border-box; }
        .p-input:focus { border-color: var(--accent-color); }
        select.p-input { appearance: none; background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; cursor: pointer; }

        .p-color-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .p-color-swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; text-shadow: 0px 1px 2px rgba(0,0,0,0.5); }
        .p-color-swatch.selected { box-shadow: 0 0 0 2px var(--sidebar-bg), 0 0 0 4px var(--accent-color); transform: scale(1.1); }
        
        .p-checkbox-group { display: flex; gap: 20px; }
        .p-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; color: var(--text-primary); font-weight: 500; }
        .p-checkbox-label input { width: 16px; height: 16px; accent-color: var(--accent-color); }

        .p-media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin-top: 8px; }
        .p-media-add { aspect-ratio: 1; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--header-bg); cursor: pointer; color: var(--text-secondary); }
        .p-media-add:hover { border-color: var(--accent-color); color: var(--accent-color); }
        .p-media-item { aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--border-color); position: relative; overflow: hidden; background: var(--header-bg); }
        .p-media-item img { width: 100%; height: 100%; object-fit: cover; }
        .p-image-delete { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 4px; background: rgba(0,0,0,0.7); color: #ef4444; border: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .p-modal-footer { padding: 20px 30px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--header-bg); flex-shrink: 0; }
        .p-btn { padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Toast */
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

      {loading ? (
        <div className="p-empty-state"><p>Loading catalog...</p></div>
      ) : products.length === 0 ? (
        <div className="p-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <p>No products listed yet</p>
          <span>Go to 'Add Product' to create your first listing.</span>
        </div>
      ) : (
        <div className="p-table-wrap">
          <table className="p-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Inventory</th>
                <th>Labels</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-order-id" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{p.id}</td>
                  <td>
                    <div className="p-product-cell">
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0]} alt={p.name} className="p-product-img" />
                      ) : (
                        <div className="p-product-no-img">N/A</div>
                      )}
                      <span className="p-product-name">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category_name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>${Number(p.selling_price || p.mrp).toLocaleString()}</strong>
                      {p.selling_price && p.mrp && <del style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>${Number(p.mrp).toLocaleString()}</del>}
                    </div>
                  </td>
                  <td>
                    <span className={`p-badge ${p.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {p.featured ? <span className="p-badge featured">Featured</span> : null}
                      {p.new_arrival ? <span className="p-badge new">New</span> : null}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button className="p-action-btn edit" onClick={() => handleEdit(p)} title="Edit product">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="p-action-btn delete" onClick={() => handleDelete(p.id)} title="Delete product">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editProduct && (
        <div className="p-modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="p-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Edit Product</h3>
              <button className="p-modal-close" onClick={() => setEditProduct(null)}>&times;</button>
            </div>
            
            <div className="p-modal-body">
              <div className="p-grid p-grid-2">
                <div className="p-input-group">
                  <label className="p-label">Product Name</label>
                  <input type="text" name="name" className="p-input" value={editForm.name} onChange={handleEditChange} />
                </div>
                <div className="p-input-group">
                  <label className="p-label">Category</label>
                  <select name="category_id" className="p-input" value={editForm.category_id} onChange={handleEditChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-grid p-grid-3">
                <div className="p-input-group">
                  <label className="p-label">MRP ($)</label>
                  <input type="number" name="mrp" className="p-input" value={editForm.mrp} onChange={handleEditChange} />
                </div>
                <div className="p-input-group">
                  <label className="p-label">Selling Price ($)</label>
                  <input type="number" name="selling_price" className="p-input" value={editForm.selling_price} onChange={handleEditChange} />
                </div>
                <div className="p-input-group">
                  <label className="p-label">Stock</label>
                  <input type="number" name="stock" className="p-input" value={editForm.stock} onChange={handleEditChange} />
                </div>
              </div>

              <div className="p-grid p-grid-2">
                <div className="p-input-group">
                  <label className="p-label">Material</label>
                  <input type="text" name="material" className="p-input" value={editForm.material} onChange={handleEditChange} />
                </div>
                <div className="p-input-group">
                  <label className="p-label">Dimensions</label>
                  <input type="text" name="dimensions" className="p-input" value={editForm.dimensions} onChange={handleEditChange} />
                </div>
              </div>

              <div className="p-input-group" style={{ marginBottom: '20px' }}>
                <label className="p-label">Color</label>
                <div className="p-color-grid">
                  {COLOR_SWATCHES.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      className={`p-color-swatch ${editForm.color === c.name ? 'selected' : ''}`}
                      title={c.name}
                      onClick={() => setEditForm({ ...editForm, color: c.name })}
                      style={{ background: c.hex, border: c.hex === '#FFFFFF' ? '1px solid var(--border-color)' : '1px solid transparent' }}
                    >
                      {editForm.color === c.name && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-input-group" style={{ marginBottom: '20px' }}>
                <label className="p-label">Description</label>
                <textarea name="description" className="p-input" rows="3" value={editForm.description} onChange={handleEditChange} style={{ resize: 'vertical' }} />
              </div>

              <div className="p-input-group">
                <label className="p-label">Product Gallery</label>
                <div className="p-media-grid">
                  {/* Existing Images */}
                  {existingImages.map((url, i) => (
                    <div key={'e' + i} className="p-media-item">
                      <img src={url} alt={`Existing ${i}`} />
                      <button type="button" className="p-image-delete" onClick={() => removeExistingImage(i)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  {/* New Uploaded Images */}
                  {editImages.map((img, i) => (
                    <div key={'n' + i} className="p-media-item">
                      <img src={img.url} alt={`New ${i}`} />
                      <button type="button" className="p-image-delete" onClick={() => removeEditImage(i)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  {/* Add Image Button */}
                  <label className="p-media-add">
                    <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} hidden />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </label>
                </div>
              </div>

              <div className="p-checkbox-group" style={{ marginTop: '24px' }}>
                <label className="p-checkbox-label">
                  <input type="checkbox" name="featured" checked={editForm.featured} onChange={handleEditChange} />
                  Featured
                </label>
                <label className="p-checkbox-label">
                  <input type="checkbox" name="new_arrival" checked={editForm.new_arrival} onChange={handleEditChange} />
                  New Arrival
                </label>
              </div>
            </div>

            <div className="p-modal-footer">
              <button className="p-btn p-btn-outline" onClick={() => setEditProduct(null)}>Cancel</button>
              <button className="p-btn p-btn-primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList