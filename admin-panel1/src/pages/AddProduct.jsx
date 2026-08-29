// ============================================================
// Premium Add Product Module (Theme Engine Enabled)
// ============================================================
// Features: Comprehensive product creation form, multi-image upload,
// size tags, pricing control, fully integrated with global themes.
// API: POST /api/products (multipart/form-data with Bearer token)
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function AddProduct({ token }) {
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    subcategory_id: '',
    mrp: '',
    selling_price: '',
    discounted_price: '',
    stock: '10',
    material: '',
    color: '',
    dimensions: '',
    weight: '',
    warranty: '',
    delivery_info: '',
    description: '',
    featured: false,
    new_arrival: false,
    on_sale: false,
  })

  const [sizeInput, setSizeInput] = useState('')
  const [sizes, setSizes] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [images, setImages] = useState([])
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})

    fetch(`${API_BASE}/api/subcategories`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSubcategories(data)
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()])
      setSizeInput('')
    }
  }

  const handleRemoveSize = (sizeToRemove) => {
    setSizes(sizes.filter((s) => s !== sizeToRemove))
  }

  const handleSizeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSize()
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, { file, url: reader.result, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setForm({
      name: '',
      category_id: '',
      subcategory_id: '',
      mrp: '',
      selling_price: '',
      discounted_price: '',
      stock: '10',
      material: '',
      color: '',
      dimensions: '',
      weight: '',
      warranty: '',
      delivery_info: '',
      description: '',
      featured: false,
      new_arrival: false,
      on_sale: false,
    })
    setSizes([])
    setImages([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.mrp || !form.category_id) {
      return showToast('Please fill required fields (Name, Category & MRP)', 'warning')
    }

    setSubmitting(true)
    try {
      const formData = new FormData()

      Object.entries(form).forEach(([key, val]) => {
        if (typeof val === 'boolean') {
          formData.append(key, val ? '1' : '0')
        } else if (val !== '' && val !== null && val !== undefined) {
          formData.append(key, val)
        }
      })

      if (sizes.length > 0) {
        formData.append('size', sizes.join(', '))
        formData.append('sizes', JSON.stringify(sizes))
      }

      images.forEach((img) => formData.append('images', img.file))

      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        showToast('Product added successfully', 'success')
        resetForm()
      } else {
        showToast(data.message || 'Failed to add product', 'error')
      }
    } catch {
      showToast('Server error while saving product', 'error')
    } finally {
      setSubmitting(false)
    }
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

        .p-size-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .p-size-tag { background: var(--header-bg); color: var(--text-primary); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; border: 1px solid var(--border-color); }
        .p-size-tag button { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0; font-size: 1rem; line-height: 1; }
        .p-size-tag button:hover { color: #ef4444; }

        .p-checkbox-row { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 14px; }
        .p-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem; color: var(--text-primary); font-weight: 500; }
        .p-checkbox-label input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-color); }

        .p-media-container { background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; }
        .p-media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
        .p-media-add { aspect-ratio: 1; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--sidebar-bg); cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
        .p-media-add:hover { border-color: var(--accent-color); color: var(--accent-color); }
        .p-media-item { aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--border-color); position: relative; overflow: hidden; background: var(--sidebar-bg); }
        .p-media-item img { width: 100%; height: 100%; object-fit: cover; }
        .p-image-delete { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 4px; background: rgba(0,0,0,0.7); color: #ef4444; border: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .p-image-delete:hover { background: #ef4444; color: white; }

        .p-form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--border-color); }
        .p-btn { padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s; }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

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

      <form className="p-form-card" onSubmit={handleSubmit}>
        <div className="p-grid p-grid-3">
          <div className="p-input-group">
            <label className="p-label">Product Name <span>*</span></label>
            <input type="text" name="name" className="p-input" placeholder="e.g. Oakwood Dining Table" value={form.name} onChange={handleChange} required />
          </div>
          <div className="p-input-group">
            <label className="p-label">Category <span>*</span></label>
            <select name="category_id" className="p-input" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="p-input-group">
            <label className="p-label">Subcategory</label>
            <select name="subcategory_id" className="p-input" value={form.subcategory_id} onChange={handleChange}>
              <option value="">Select subcategory...</option>
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="p-section-title">Pricing & Inventory</h3>
        <div className="p-grid p-grid-3">
          <div className="p-input-group">
            <label className="p-label">MRP ($) <span>*</span></label>
            <input type="number" name="mrp" className="p-input" placeholder="1200" value={form.mrp} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div className="p-input-group">
            <label className="p-label">Selling Price ($)</label>
            <input type="number" name="selling_price" className="p-input" placeholder="1000" value={form.selling_price} onChange={handleChange} min="0" step="0.01" />
          </div>
          <div className="p-input-group">
            <label className="p-label">Stock Units</label>
            <input type="number" name="stock" className="p-input" placeholder="10" value={form.stock} onChange={handleChange} min="0" />
          </div>
        </div>

        <div className="p-checkbox-row">
          <label className="p-checkbox-label">
            <input type="checkbox" name="on_sale" checked={form.on_sale} onChange={handleChange} />
            On Sale
          </label>
          <label className="p-checkbox-label">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Featured
          </label>
          <label className="p-checkbox-label">
            <input type="checkbox" name="new_arrival" checked={form.new_arrival} onChange={handleChange} />
            New Arrival
          </label>
        </div>

        <h3 className="p-section-title">Product Details</h3>
        <div className="p-grid p-grid-3">
          <div className="p-input-group">
            <label className="p-label">Material</label>
            <input type="text" name="material" className="p-input" placeholder="Solid Oak Wood" value={form.material} onChange={handleChange} />
          </div>
          <div className="p-input-group">
            <label className="p-label">Color</label>
            <input type="text" name="color" className="p-input" placeholder="e.g. Walnut Brown" value={form.color} onChange={handleChange} />
          </div>
          <div className="p-input-group">
            <label className="p-label">Dimensions</label>
            <input type="text" name="dimensions" className="p-input" placeholder="e.g. 180cm x 90cm x 75cm" value={form.dimensions} onChange={handleChange} />
          </div>
        </div>

        <div className="p-grid p-grid-2" style={{ marginTop: '20px' }}>
          <div className="p-input-group">
            <label className="p-label">Size Options</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className="p-input" placeholder="e.g. Standard, King (Press Enter)" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={handleSizeKeyDown} />
              <button type="button" className="p-btn p-btn-outline" onClick={handleAddSize} style={{ padding: '0 20px', height: '45px' }}>Add</button>
            </div>
            {sizes.length > 0 && (
              <div className="p-size-tags">
                {sizes.map((s, idx) => (
                  <span key={idx} className="p-size-tag">{s} <button type="button" onClick={() => handleRemoveSize(s)}>&times;</button></span>
                ))}
              </div>
            )}
          </div>
          <div className="p-input-group">
            <label className="p-label">Delivery Info</label>
            <input type="text" name="delivery_info" className="p-input" placeholder="e.g. Dispatched in 2-3 business days" value={form.delivery_info} onChange={handleChange} />
          </div>
        </div>

        <h3 className="p-section-title">Product Description</h3>
        <div className="p-input-group">
          <textarea name="description" className="p-input" rows="4" placeholder="Detailed product description..." value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
        </div>

        <h3 className="p-section-title">Media Gallery</h3>
        <div className="p-media-container">
          <div className="p-media-grid">
            <label className="p-media-add">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span style={{ marginTop: '6px' }}>Add Image</span>
            </label>
            {images.map((img, i) => (
              <div className="p-media-item" key={i}>
                <img src={img.url} alt={img.name} />
                <button type="button" className="p-image-delete" onClick={() => removeImage(i)}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-form-actions">
          <button type="button" className="p-btn p-btn-outline" onClick={resetForm}>Clear</button>
          <button type="submit" className="p-btn p-btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct