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

const editLabel = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#666', marginBottom: '4px' }
const editInput = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }

function ProductList({ token }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
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
      setProducts(data)
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
    if (!confirm('Are you sure you want to delete this product?')) return
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

  const imgGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '8px' }
  const imgItemStyle = { position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', border: '1px solid #e2e8f0' }
  const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  const imgRemoveBtn = { position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '14px', lineHeight: 1 }

  return (
    <div className="product-list-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Product List</h2>
        <p>All furniture products currently listed</p>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products listed yet</p>
          <span>Add your first product from the Add Product page</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>MRP</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Labels</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="order-id">{p.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.images && typeof p.images === 'object' && p.images.length > 0 ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>No img</div>
                      )}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category_name || '-'}</td>
                  <td>${Number(p.mrp).toLocaleString()}</td>
                  <td>${Number(p.selling_price || p.mrp).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${p.stock > 0 ? 'replied' : 'pending'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.featured ? <span className="status-badge replied" style={{ fontSize: 11 }}>Featured</span> : null}
                      {p.new_arrival ? <span className="status-badge pending" style={{ fontSize: 11 }}>New</span> : null}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="view-btn" onClick={() => handleEdit(p)} title="Edit product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="view-btn" onClick={() => handleDelete(p.id)} title="Delete" style={{ color: '#e74c3c' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {editProduct && (
        <div className="enquiry-modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="enquiry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="enquiry-modal-close" onClick={() => setEditProduct(null)}>&times;</button>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1a1a2e' }}>Edit Product</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={editLabel}>Product Name</label>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Category</label>
                  <select name="category_id" value={editForm.category_id} onChange={handleEditChange} style={editInput}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={editLabel}>MRP ($)</label>
                  <input type="number" name="mrp" value={editForm.mrp} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Selling Price ($)</label>
                  <input type="number" name="selling_price" value={editForm.selling_price} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Material</label>
                  <input type="text" name="material" value={editForm.material} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Stock</label>
                  <input type="number" name="stock" value={editForm.stock} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Dimensions</label>
                  <input type="text" name="dimensions" value={editForm.dimensions} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Weight (kg)</label>
                  <input type="number" name="weight" value={editForm.weight} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Warranty</label>
                  <input type="text" name="warranty" value={editForm.warranty} onChange={handleEditChange} style={editInput} />
                </div>
                <div>
                  <label style={editLabel}>Delivery Info</label>
                  <input type="text" name="delivery_info" value={editForm.delivery_info} onChange={handleEditChange} style={editInput} />
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={editLabel}>Color</label>
                <div className="color-swatches">
                  {COLOR_SWATCHES.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      className={`color-swatch ${editForm.color === c.name ? 'selected' : ''}`}
                      title={c.name}
                      onClick={() => setEditForm({ ...editForm, color: c.name })}
                      style={{ background: c.hex, border: c.hex === '#FFFFFF' ? '2px solid #d0d0d0' : '2px solid transparent' }}
                    >
                      {editForm.color === c.name && <span className="color-check">&#10003;</span>}
                    </button>
                  ))}
                </div>
                {editForm.color && <p className="color-selected-name">Selected: <strong>{editForm.color}</strong></p>}
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={editLabel}>Description</label>
                <textarea name="description" rows="3" value={editForm.description} onChange={handleEditChange} style={{ ...editInput, resize: 'vertical' }} />
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={editLabel}>Product Images</label>
                {existingImages.length > 0 && (
                  <div style={imgGridStyle}>
                    {existingImages.map((url, i) => (
                      <div key={'e' + i} style={imgItemStyle}>
                        <img src={url} alt={`Existing ${i}`} style={imgStyle} />
                        <button type="button" style={imgRemoveBtn} onClick={() => removeExistingImage(i)}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
                {editImages.length > 0 && (
                  <div style={imgGridStyle}>
                    {editImages.map((img, i) => (
                      <div key={'n' + i} style={imgItemStyle}>
                        <img src={img.url} alt={`New ${i}`} style={imgStyle} />
                        <button type="button" style={imgRemoveBtn} onClick={() => removeEditImage(i)}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
                <label style={{ ...editInput, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer', justifyContent: 'center', borderStyle: 'dashed' }}>
                  <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} hidden />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Add Images
                </label>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="checkbox" name="featured" checked={editForm.featured} onChange={handleEditChange} style={{ width: '18px', height: '18px' }} />
                  Featured
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="checkbox" name="new_arrival" checked={editForm.new_arrival} onChange={handleEditChange} style={{ width: '18px', height: '18px' }} />
                  New Arrival
                </label>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
