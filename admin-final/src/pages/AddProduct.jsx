// ============================================================
// Premium Add Product Module
// ============================================================
// Features: Comprehensive product creation form, hex color palette picker +
// custom color adder, size tags, dimensions, multi-image upload with
// thumbnail preview and primary image selector, dynamic category/subcategory
// filtering, and global theme styling.
// API: POST /api/products (multipart/form-data with Bearer token)
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

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
    brand: '',
    description: '',
    featured: false,
    new_arrival: false,
    on_sale: false,
  })

  // Custom Color State
  const [customColorName, setCustomColorName] = useState('')
  const [customColorHex, setCustomColorHex] = useState('#ff7eb3')

  const [sizeInput, setSizeInput] = useState('')
  const [sizes, setSizes] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [images, setImages] = useState([])
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getActiveToken = () => {
    return (
      getAuthToken(token) ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('af_admin_token') ||
      ''
    )
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {})

    fetch(`${API_BASE}/api/subcategories`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSubcategories(d))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Multi-Color Selection Logic
  const handleColorToggle = (colorName) => {
    const current = form.color ? form.color.split(',').map((c) => c.trim()).filter(Boolean) : []
    let updated
    if (current.includes(colorName)) {
      updated = current.filter((c) => c !== colorName)
    } else {
      updated = [...current, colorName]
    }
    setForm((prev) => ({ ...prev, color: updated.join(', ') }))
  }

  const handleAddCustomColor = () => {
    if (!customColorName.trim() && !customColorHex) return
    const name = customColorName.trim() || customColorHex
    const customValue = `${name} (${customColorHex})`
    const current = form.color ? form.color.split(',').map((c) => c.trim()).filter(Boolean) : []
    if (current.includes(customValue) || current.includes(name)) {
      showToast('Color already added', 'warning')
      return
    }
    const updated = [...current, customValue]
    setForm((prev) => ({ ...prev, color: updated.join(', ') }))
    setCustomColorName('')
    showToast(`Added custom color: ${customValue}`, 'success')
  }

  const selectedColorsList = form.color ? form.color.split(',').map((c) => c.trim()).filter(Boolean) : []

  // Size Tags Logic
  const handleAddSize = () => {
    if (!sizeInput.trim()) return
    const newSizes = sizeInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const combined = Array.from(new Set([...sizes, ...newSizes]))
    setSizes(combined)
    setSizeInput('')
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

  // Image Upload Logic
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages])
  }

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return
    const selectedImg = images[index]
    const rest = images.filter((_, i) => i !== index)
    setImages([selectedImg, ...rest])
    showToast('Primary storefront thumbnail updated', 'info')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.mrp || !form.category_id) {
      showToast('Please fill in Product Title, Category, and Price', 'error')
      return
    }

    const authToken = getActiveToken()
    setSubmitting(true)

    try {
      const formData = new FormData()
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key])
      })

      if (sizes.length > 0) {
        formData.set('size', sizes.join(', '))
      }

      images.forEach((imgObj) => {
        formData.append('images', imgObj.file)
      })

      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })

      if (res.ok) {
        showToast('Product created successfully!', 'success')
        // Reset form
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
          brand: '',
          description: '',
          featured: false,
          new_arrival: false,
          on_sale: false,
        })
        setSizes([])
        setImages([])
      } else {
        const data = await res.json().catch(() => ({}))
        showToast(data.message || 'Failed to create product', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCategorySubs = subcategories.filter(
    (s) => String(s.category_id) === String(form.category_id)
  )

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h2 className="admin-title">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Left Column: Core Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Basic Info Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Basic Product Information</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Product Title / Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Marina Luxury Lounge Chair"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category_id"
                  className="form-select"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subcategory</label>
                <select
                  name="subcategory_id"
                  className="form-select"
                  value={form.subcategory_id}
                  onChange={handleChange}
                  disabled={!form.category_id}
                >
                  <option value="">None / General</option>
                  {selectedCategorySubs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  className="form-input"
                  placeholder="e.g. AF Exclusive"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Material</label>
                <input
                  type="text"
                  name="material"
                  className="form-input"
                  placeholder="e.g. Solid Oak Wood, Premium Velvet"
                  value={form.material}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="form-group">
                <label className="form-label">Dimensions (L x W x H)</label>
                <input
                  type="text"
                  name="dimensions"
                  className="form-input"
                  placeholder="e.g. 210cm x 95cm x 85cm"
                  value={form.dimensions}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight</label>
                <input
                  type="text"
                  name="weight"
                  className="form-input"
                  placeholder="e.g. 45 kg"
                  value={form.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows={4}
                className="form-textarea"
                placeholder="Detailed description of features, craft, and comfort..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Color & Size Palette Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Color Palette & Sizes</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Quick Color Swatches</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {COLOR_SWATCHES.map((sw) => {
                  const isSelected = selectedColorsList.includes(sw.name)
                  return (
                    <div
                      key={sw.name}
                      onClick={() => handleColorToggle(sw.name)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 10px',
                        borderRadius: '16px',
                        background: isSelected ? 'var(--active-bg)' : 'var(--sidebar-bg)',
                        border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: sw.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                      <span>{sw.name}</span>
                    </div>
                  )
                })}
              </div>

              {/* Custom Color Creator */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  style={{ width: '38px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Custom Color Name (e.g. Emerald Green)"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  style={{ maxWidth: '240px' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCustomColor}
                >
                  + Add Color
                </button>
              </div>

              {selectedColorsList.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-color)', margin: '8px 0 0', fontWeight: 600 }}>
                  Selected: {form.color}
                </p>
              )}
            </div>

            {/* Size Tags */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Available Sizes</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. King, Queen, Double, 3-Seater..."
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={handleSizeKeyDown}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddSize}
                >
                  Add Size
                </button>
              </div>

              {sizes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {sizes.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--active-bg)',
                        color: 'var(--text-primary)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pricing & Stock Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Pricing & Stock</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Regular Price (MRP $) *</label>
              <input
                type="number"
                name="mrp"
                className="form-input"
                placeholder="e.g. 1299"
                value={form.mrp}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discounted / Selling Price ($)</label>
              <input
                type="number"
                name="selling_price"
                className="form-input"
                placeholder="e.g. 999 (Leave blank if no discount)"
                value={form.selling_price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Available Inventory Quantity *</label>
              <input
                type="number"
                name="stock"
                className="form-input"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Product Media Gallery */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Product Images</h3>
            </div>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed var(--border-color)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--header-bg)',
              }}
            >
              <input type="file" multiple accept="image/*" hidden onChange={handleImageUpload} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Click to Upload Product Images</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PNG, JPG, WebP up to 5MB</span>
            </label>

            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '14px' }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: i === 0 ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSetPrimaryImage(i)}
                    title={i === 0 ? 'Primary Image' : 'Click to make Primary'}
                  >
                    <img src={img.preview} alt={`upload-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    {i === 0 && (
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--accent-color)', color: '#fff', fontSize: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(i)
                      }}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.65rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility Badges */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Promotions & Badges</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Featured Product (Highlight on Home Page)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="new_arrival"
                  checked={form.new_arrival}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>New Arrival Badge</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Product...' : 'Publish Product to Storefront'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
