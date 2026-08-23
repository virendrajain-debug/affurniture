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

function AddProduct({ token }) {
  const [form, setForm] = useState({
    name: '', category_id: '', mrp: '', selling_price: '', discounted_price: '',
    description: '', stock: '', material: '', color: '', size: '',
    dimensions: '', weight: '', warranty: '', delivery_info: '',
    featured: false, new_arrival: false
  })
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, { file, url: reader.result, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.mrp) {
      return showToast('Please fill required fields', 'warning')
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (typeof val === 'boolean') {
          formData.append(key, val.toString())
        } else if (val !== '' && val !== null && val !== undefined) {
          formData.append(key, val)
        }
      })
      images.forEach(img => {
        formData.append('images', img.file)
      })

      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        showToast('Product added successfully', 'success')
        setForm({
          name: '', category_id: '', mrp: '', selling_price: '', discounted_price: '',
          description: '', stock: '', material: '', color: '', size: '',
          dimensions: '', weight: '', warranty: '', delivery_info: '',
          featured: false, new_arrival: false
        })
        setImages([])
      } else {
        const data = await res.json()
        showToast(data.message || 'Failed to add product', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
    setSubmitting(false)
  }

  return (
    <div className="add-product-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Add New Product</h2>
        <p>Fill in the details to list a new furniture item</p>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label>Product Name *</label>
            <input type="text" name="name" placeholder="e.g. Oakwood Dining Table" value={form.name} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section-title">Pricing</div>
        <div className="form-row form-row-3">
          <div className="input-group">
            <label>MRP ($) *</label>
            <input type="number" name="mrp" placeholder="e.g. 35000" value={form.mrp} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Selling Price ($)</label>
            <input type="number" name="selling_price" placeholder="e.g. 30000" value={form.selling_price} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Discounted Price ($)</label>
            <input type="number" name="discounted_price" placeholder="e.g. 27000" value={form.discounted_price} onChange={handleChange} />
          </div>
        </div>

        {form.mrp && form.discounted_price && (
          <div className="price-summary">
            <span className="price-mrp">MRP: ${Number(form.mrp).toLocaleString()}</span>
            <span className="price-selling">Selling: ${Number(form.selling_price || form.discounted_price).toLocaleString()}</span>
            <span className="price-discount">
              {Math.round(((form.mrp - (form.discounted_price || form.selling_price)) / form.mrp) * 100)}% OFF
            </span>
          </div>
        )}

        <div className="form-section-title">Product Details</div>
        <div className="form-row">
          <div className="input-group">
            <label>Material</label>
            <input type="text" name="material" placeholder="e.g. Solid Oak Wood" value={form.material} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Size</label>
            <select name="size" value={form.size} onChange={handleChange}>
              <option value="">Select size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Color</label>
          <div className="color-swatches">
            {COLOR_SWATCHES.map(c => (
              <button
                key={c.name}
                type="button"
                className={`color-swatch ${form.color === c.name ? 'selected' : ''}`}
                title={c.name}
                onClick={() => setForm({ ...form, color: c.name })}
                style={{ background: c.hex, border: c.hex === '#FFFFFF' ? '2px solid #d0d0d0' : '2px solid transparent' }}
              >
                {form.color === c.name && <span className="color-check">&#10003;</span>}
              </button>
            ))}
          </div>
          {form.color && <p className="color-selected-name">Selected: <strong>{form.color}</strong></p>}
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Dimensions (L x W x H)</label>
            <input type="text" name="dimensions" placeholder="e.g. 120cm x 80cm x 75cm" value={form.dimensions} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Weight (kg)</label>
            <input type="number" name="weight" placeholder="e.g. 25" value={form.weight} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Stock Quantity</label>
            <input type="number" name="stock" placeholder="e.g. 50" value={form.stock} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Warranty</label>
            <input type="text" name="warranty" placeholder="e.g. 1 Year Manufacturer Warranty" value={form.warranty} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Delivery Info</label>
            <input type="text" name="delivery_info" placeholder="e.g. Free delivery in 5-7 days" value={form.delivery_info} onChange={handleChange} />
          </div>
          <div className="input-group" />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea name="description" rows="4" placeholder="Write a short product description..." value={form.description} onChange={handleChange} />
        </div>

        <div className="form-section-title">Labels</div>
        <div className="form-row">
          <label className="checkbox-group">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            <span>Featured Product</span>
          </label>
          <label className="checkbox-group">
            <input type="checkbox" name="new_arrival" checked={form.new_arrival} onChange={handleChange} />
            <span>New Arrival</span>
          </label>
        </div>

        <div className="input-group">
          <label>Product Images</label>
          <label className="upload-area">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p>Click to upload or drag and drop</p>
            <span>PNG, JPG up to 5MB each</span>
          </label>
          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map((img, i) => (
                <div className="image-preview-item" key={i}>
                  <img src={img.url} alt={img.name} />
                  <button type="button" className="image-remove-btn" onClick={() => removeImage(i)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => {
            setForm({ name: '', category_id: '', mrp: '', selling_price: '', discounted_price: '', description: '', stock: '', material: '', color: '', size: '', dimensions: '', weight: '', warranty: '', delivery_info: '', featured: false, new_arrival: false })
            setImages([])
          }}>Clear All</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
