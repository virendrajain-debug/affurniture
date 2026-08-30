// ============================================================
// Premium Product Inventory & Management Visual Studio
// ============================================================
// Features:
//  - Full inventory table with live search & category filters
//  - Embedded responsive "+ Add Product" / "Edit Product" Drawer/Modal
//  - Interactive Hex Color Palette Builder with HTML color picker sync
//  - Multi-image drag-and-drop uploader with PRIMARY image selector
//  - Dimensions, material, and weight specifications
//  - Compact SVG micro-action buttons (No text clutter)
//  - Instant Persistence via POST /api/products & PUT /api/products/:id
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Blue', hex: '#2E86C1' },
  { name: 'Green', hex: '#27AE60' },
  { name: 'Teal', hex: '#1ABC9C' },
  { name: 'Gold', hex: '#AA7A3E' },
]

const POPULAR_SIZES = ['Single', 'King Single', 'Double', 'Queen', 'King', 'Super King', 'Small', 'Medium', 'Large', '2-Seater', '3-Seater', 'Modular']

function ProductList({ token }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeProductId, setActiveProductId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    subcategory_id: '',
    sku: '',
    mrp: '',
    selling_price: '',
    discounted_price: '',
    stock: 10,
    material: '',
    dimensions: '',
    weight: '',
    warranty: '1 Year Warranty',
    delivery_info: '2-5 business days across Auckland',
    featured: false,
    new_arrival: false,
    brand: 'AF Furnishings',
    description: '',
    color: '',
    size: '',
  })

  // Images state
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Color Swatches State
  const [selectedColors, setSelectedColors] = useState([])
  const [customColorHex, setCustomColorHex] = useState('#aa7a3e')
  const [customColorName, setCustomColorName] = useState('')

  // Sizes State
  const [selectedSizes, setSelectedSizes] = useState([])
  const [customSizeInput, setCustomSizeInput] = useState('')

  const fileInputRef = useRef(null)

  const getActiveToken = () => {
    return (
      getAuthToken(token) ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('af_admin_token') ||
      ''
    )
  }

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      } else if (data && Array.isArray(data.products)) {
        setProducts(data.products)
      }
    } catch {
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {})
    fetch(`${API_BASE}/api/subcategories`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSubcategories(d))
      .catch(() => {})

    // Check if redirected with ?action=add
    if (searchParams.get('action') === 'add') {
      handleOpenCreate()
    }
  }, [])

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsCreating(true)
    setActiveProductId(null)
    setForm({
      name: '',
      category_id: categories[0]?.id || '',
      subcategory_id: '',
      sku: `AF-${Math.floor(1000 + Math.random() * 9000)}`,
      mrp: '',
      selling_price: '',
      discounted_price: '',
      stock: 10,
      material: 'Solid Hardwood & Premium Fabric',
      dimensions: '',
      weight: '',
      warranty: '1 Year Manufacturer Warranty',
      delivery_info: '2-5 business days delivery across Auckland',
      featured: false,
      new_arrival: true,
      brand: 'AF Furnishings',
      description: '',
      color: '',
      size: '',
    })
    setExistingImages([])
    setNewImageFiles([])
    setPrimaryImageIdx(0)
    setSelectedColors([{ name: 'Oak', hex: '#C19A6B' }, { name: 'Grey', hex: '#808080' }])
    setSelectedSizes(['Queen'])
    setModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (p) => {
    setIsCreating(false)
    setActiveProductId(p.id)
    setForm({
      name: p.name || '',
      category_id: p.category_id || '',
      subcategory_id: p.subcategory_id || '',
      sku: p.sku || `AF-${p.id}`,
      mrp: p.mrp || '',
      selling_price: p.selling_price || '',
      discounted_price: p.discounted_price || '',
      stock: p.stock !== undefined ? p.stock : 10,
      material: p.material || '',
      dimensions: p.dimensions || '',
      weight: p.weight || '',
      warranty: p.warranty || '',
      delivery_info: p.delivery_info || '',
      featured: Boolean(p.featured === 1 || p.featured === true),
      new_arrival: Boolean(p.new_arrival === 1 || p.new_arrival === true),
      brand: p.brand || 'AF Furnishings',
      description: p.description || '',
      color: p.color || '',
      size: p.size || '',
    })

    // Parse existing images
    let imgs = []
    if (Array.isArray(p.images)) {
      imgs = p.images
    } else if (typeof p.images === 'string') {
      try {
        imgs = JSON.parse(p.images)
      } catch {
        imgs = p.images ? [p.images] : []
      }
    }
    setExistingImages(imgs)
    setNewImageFiles([])
    setPrimaryImageIdx(0)

    // Parse colors
    if (p.color) {
      const rawColors = p.color.split(',').map((c) => c.trim()).filter(Boolean)
      const parsedColors = rawColors.map((cStr) => {
        const hexMatch = cStr.match(/#([0-9A-Fa-f]{3,8})/)
        if (hexMatch) {
          const hex = `#${hexMatch[1]}`
          const name = cStr.replace(hexMatch[0], '').replace(/[()]/g, '').trim() || hex
          return { name, hex }
        }
        const known = COLOR_SWATCHES.find((s) => s.name.toLowerCase() === cStr.toLowerCase())
        return { name: cStr, hex: known ? known.hex : '#808080' }
      })
      setSelectedColors(parsedColors)
    } else {
      setSelectedColors([])
    }

    // Parse sizes
    if (p.size) {
      setSelectedSizes(p.size.split(',').map((s) => s.trim()).filter(Boolean))
    } else {
      setSelectedSizes([])
    }

    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    if (searchParams.get('action')) {
      setSearchParams({})
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Color Swatches Toggle
  const handleToggleColor = (swatch) => {
    const exists = selectedColors.some((c) => c.name.toLowerCase() === swatch.name.toLowerCase())
    if (exists) {
      setSelectedColors(selectedColors.filter((c) => c.name.toLowerCase() !== swatch.name.toLowerCase()))
    } else {
      setSelectedColors([...selectedColors, { name: swatch.name, hex: swatch.hex }])
    }
  }

  const handleAddCustomColor = () => {
    if (!customColorHex) return
    const name = customColorName.trim() || customColorHex
    if (!selectedColors.some((c) => c.hex.toLowerCase() === customColorHex.toLowerCase())) {
      setSelectedColors([...selectedColors, { name, hex: customColorHex }])
      setCustomColorName('')
    }
  }

  const handleRemoveColor = (hex) => {
    setSelectedColors(selectedColors.filter((c) => c.hex !== hex))
  }

  // Sizes Toggle
  const handleToggleSize = (s) => {
    if (selectedSizes.includes(s)) {
      setSelectedSizes(selectedSizes.filter((x) => x !== s))
    } else {
      setSelectedSizes([...selectedSizes, s])
    }
  }

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return
    const s = customSizeInput.trim()
    if (!selectedSizes.includes(s)) {
      setSelectedSizes([...selectedSizes, s])
      setCustomSizeInput('')
    }
  }

  // File Upload Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const valid = files.filter((f) => f.type.startsWith('image/'))
    setNewImageFiles((prev) => [...prev, ...valid])
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) setNewImageFiles((prev) => [...prev, ...files])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleRemoveNewImage = (idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx))
    if (primaryImageIdx >= existingImages.length + idx) {
      setPrimaryImageIdx(Math.max(0, primaryImageIdx - 1))
    }
  }

  const handleRemoveExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx))
    if (primaryImageIdx === idx) {
      setPrimaryImageIdx(0)
    } else if (primaryImageIdx > idx) {
      setPrimaryImageIdx(primaryImageIdx - 1)
    }
  }

  // Submit Product (Create or Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return showToast('Product title is required', 'warning')
    if (!form.selling_price) return showToast('Selling price is required', 'warning')

    const authToken = getActiveToken()
    setSaving(true)

    try {
      const colorStr = selectedColors.map((c) => `${c.name} (${c.hex})`).join(', ')
      const sizeStr = selectedSizes.join(', ')

      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('category_id', form.category_id)
      formData.append('subcategory_id', form.subcategory_id || '')
      formData.append('sku', form.sku || '')
      formData.append('mrp', form.mrp || form.selling_price)
      formData.append('selling_price', form.selling_price)
      formData.append('discounted_price', form.discounted_price || '')
      formData.append('stock', form.stock)
      formData.append('material', form.material || '')
      formData.append('dimensions', form.dimensions || '')
      formData.append('weight', form.weight || '')
      formData.append('warranty', form.warranty || '')
      formData.append('delivery_info', form.delivery_info || '')
      formData.append('featured', form.featured ? '1' : '0')
      formData.append('new_arrival', form.new_arrival ? '1' : '0')
      formData.append('brand', form.brand || 'AF Furnishings')
      formData.append('description', form.description || '')
      formData.append('color', colorStr)
      formData.append('size', sizeStr)
      formData.append('primary_image_index', primaryImageIdx)

      // Append retained existing images
      if (existingImages.length > 0) {
        formData.append('existing_images', JSON.stringify(existingImages))
      }

      // Append new image files
      newImageFiles.forEach((file) => {
        formData.append('images', file)
      })

      const url = isCreating ? `${API_BASE}/api/products` : `${API_BASE}/api/products/${activeProductId}`
      const method = isCreating ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })

      if (res.ok) {
        showToast(`Product ${isCreating ? 'created' : 'updated'} successfully!`, 'success')
        handleCloseModal()
        fetchProducts()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save product', 'error')
      }
    } catch {
      showToast('Server error while saving product', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return
    const authToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        showToast('Product deleted', 'success')
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        showToast('Failed to delete product', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchCategory = true
    if (categoryFilter !== 'all') {
      matchCategory =
        String(p.category_id) === String(categoryFilter) ||
        (p.category_name && p.category_name.toLowerCase() === categoryFilter.toLowerCase())
    }
    return matchSearch && matchCategory
  })

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Top Header Toolbar */}
      <div className="admin-header">
        <h2 className="admin-title">Product Inventory</h2>

        <button className="btn-primary" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-toolbar" style={{ background: 'var(--sidebar-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <input
          type="text"
          className="search-box"
          placeholder="Search products by title, SKU, brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ minWidth: '200px' }}
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Data Table */}
      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading product inventory...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <h3>No products found</h3>
          <p style={{ margin: '8px 0 16px 0', fontSize: '0.88rem' }}>
            {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Start by creating your first catalog product.'}
          </p>
          <button className="btn-primary" onClick={handleOpenCreate}>
            + Add Product
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Info</th>
                <th>Category</th>
                <th>Pricing (NZD)</th>
                <th>Stock</th>
                <th>Colors & Sizes</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                let img = p.primary_image || p.image || ''
                if (!img && p.images) {
                  try {
                    const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
                    img = Array.isArray(parsed) ? parsed[0] : parsed
                  } catch {}
                }

                return (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={img || 'https://placehold.co/100x100?text=No+Image'}
                        alt={p.name}
                        className="admin-thumb"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image' }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.92rem' }}>
                        {p.name}
                      </strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>SKU: {p.sku || `AF-${p.id}`}</span>
                        <span>&bull;</span>
                        <span>{p.brand || 'AF Furnishings'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-default">
                        {p.category_name || (categories.find((c) => String(c.id) === String(p.category_id))?.name || 'General')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--accent-color)', fontSize: '0.95rem' }}>
                          ${Number(p.selling_price || 0).toLocaleString()}
                        </strong>
                        {p.mrp && Number(p.mrp) > Number(p.selling_price) && (
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                            ${Number(p.mrp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${Number(p.stock) > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {Number(p.stock) > 0 ? `${p.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {p.color ? (
                          <span style={{ display: 'block', marginBottom: '2px' }}>
                            🎨 {p.color.length > 25 ? `${p.color.substring(0, 25)}...` : p.color}
                          </span>
                        ) : null}
                        {p.size ? <span>📏 {p.size}</span> : null}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {/* Micro-Action Edit */}
                        <button
                          type="button"
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Micro-Action Delete */}
                        <button
                          type="button"
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Delete Product"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* EMBEDDED ADD / EDIT PRODUCT MODAL (COMPLETE RICH STUDIO)     */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-container"
            style={{ maxWidth: '900px', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  {isCreating ? 'Create New Product' : `Edit: ${form.name}`}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {isCreating ? 'Fill in product specifications, gallery images, and color variants.' : `SKU: ${form.sku || activeProductId}`}
                </span>
              </div>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal} title="Close">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. General Info */}
                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Product Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Haven 3-Seater Fabric Lounge"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Brand / Manufacturer</label>
                    <input
                      type="text"
                      className="form-input"
                      name="brand"
                      value={form.brand}
                      onChange={handleFormChange}
                      placeholder="e.g. AF Furnishings"
                    />
                  </div>
                </div>

                {/* 2. Category & Subcategory */}
                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Parent Category *</label>
                    <select
                      className="form-select"
                      name="category_id"
                      value={form.category_id}
                      onChange={handleFormChange}
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

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subcategory</label>
                    <select
                      className="form-select"
                      name="subcategory_id"
                      value={form.subcategory_id}
                      onChange={handleFormChange}
                    >
                      <option value="">None / General</option>
                      {subcategories
                        .filter((sc) => !form.category_id || String(sc.category_id) === String(form.category_id))
                        .map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* 3. Pricing & Inventory */}
                <div className="admin-grid-3">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Selling Price ($NZD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      name="selling_price"
                      value={form.selling_price}
                      onChange={handleFormChange}
                      placeholder="1299.00"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Regular Price / MRP ($NZD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      name="mrp"
                      value={form.mrp}
                      onChange={handleFormChange}
                      placeholder="1599.00"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Units in Stock *</label>
                    <input
                      type="number"
                      className="form-input"
                      name="stock"
                      value={form.stock}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                {/* 4. Hex Color Swatches Palette Builder */}
                <div style={{ background: 'var(--header-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Color Variants & Hex Palette
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                    Select preset swatches or add custom hex tones.
                  </span>

                  {/* Preset Swatches */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {COLOR_SWATCHES.map((swatch) => {
                      const isSelected = selectedColors.some((c) => c.hex.toLowerCase() === swatch.hex.toLowerCase())
                      return (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => handleToggleColor(swatch)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--sidebar-bg)',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: swatch.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                          <span>{swatch.name}</span>
                          {isSelected && <span>✓</span>}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom Hex Color Adder */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      style={{ width: '38px', height: '36px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', padding: '2px', background: 'none' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hex (e.g. #AA7A3E)"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      style={{ width: '110px', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Color Name (e.g. Vintage Cognac)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      style={{ flex: 1, minWidth: '160px', fontSize: '0.85rem' }}
                    />
                    <button type="button" className="btn-secondary" onClick={handleAddCustomColor} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      + Add Swatch
                    </button>
                  </div>

                  {/* Active Selected Swatches List */}
                  {selectedColors.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                      {selectedColors.map((c) => (
                        <span
                          key={c.hex}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            background: 'var(--sidebar-bg)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.78rem',
                          }}
                        >
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.hex }} />
                          <span>{c.name}</span>
                          <span style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }} onClick={() => handleRemoveColor(c.hex)}>
                            ✕
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Product Image Gallery Uploader */}
                <div style={{ background: 'var(--header-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Product Images Gallery
                    </label>
                    <label
                      className="btn-secondary"
                      style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Upload Images
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={handleFileSelect} />
                    </label>
                  </div>

                  {/* Drag-and-Drop Dropzone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragOver ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragOver ? 'rgba(212, 175, 55, 0.07)' : 'var(--sidebar-bg)',
                      transition: 'all 0.2s ease',
                      marginBottom: existingImages.length > 0 || newImageFiles.length > 0 ? '14px' : '0',
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? 'var(--accent-color)' : 'var(--text-secondary)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}>
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: isDragOver ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: isDragOver ? 600 : 400 }}>
                      {isDragOver ? 'Drop images here' : 'Drag & drop PNG, JPG, WebP — or click to browse'}
                    </p>
                    {!isDragOver && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                        Click ★ PRIMARY to set thumbnail. Up to 10 images.
                      </span>
                    )}
                  </div>

                  {/* Gallery Thumbnails Grid */}
                  {(existingImages.length > 0 || newImageFiles.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                      {/* Existing Images */}
                      {existingImages.map((imgUrl, idx) => (
                        <div
                          key={`exist-${idx}`}
                          style={{
                            position: 'relative',
                            height: '90px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: `2px solid ${primaryImageIdx === idx ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: '#000',
                          }}
                        >
                          <img src={imgUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/100x90?text=Image' }} />
                          <span
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              background: primaryImageIdx === idx ? 'var(--accent-color)' : 'rgba(0,0,0,0.65)',
                              color: '#fff',
                              fontSize: '0.6rem',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: primaryImageIdx === idx ? 700 : 400,
                            }}
                            onClick={() => setPrimaryImageIdx(idx)}
                          >
                            {primaryImageIdx === idx ? '★ PRIMARY' : 'Set Primary'}
                          </span>
                          <button
                            type="button"
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.85)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleRemoveExistingImage(idx)}
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* New Upload Files */}
                      {newImageFiles.map((file, idx) => {
                        const previewUrl = URL.createObjectURL(file)
                        const overallIdx = existingImages.length + idx
                        return (
                          <div
                            key={`new-${idx}`}
                            style={{
                              position: 'relative',
                              height: '90px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: `2px solid ${primaryImageIdx === overallIdx ? 'var(--accent-color)' : '#3a9a6a'}`,
                              background: '#000',
                            }}
                          >
                            <img src={previewUrl} alt="New upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                background: primaryImageIdx === overallIdx ? 'var(--accent-color)' : 'rgba(0,0,0,0.65)',
                                color: '#fff',
                                fontSize: '0.6rem',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: primaryImageIdx === overallIdx ? 700 : 400,
                              }}
                              onClick={() => setPrimaryImageIdx(overallIdx)}
                            >
                              {primaryImageIdx === overallIdx ? '★ PRIMARY' : 'Set Primary'}
                            </span>
                            <button
                              type="button"
                              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.85)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => handleRemoveNewImage(idx)}
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 6. Specifications */}
                <div className="admin-grid-3">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Dimensions (W x D x H)</label>
                    <input
                      type="text"
                      className="form-input"
                      name="dimensions"
                      value={form.dimensions}
                      onChange={handleFormChange}
                      placeholder="e.g. 210cm x 95cm x 88cm"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Primary Material</label>
                    <input
                      type="text"
                      className="form-input"
                      name="material"
                      value={form.material}
                      onChange={handleFormChange}
                      placeholder="e.g. Solid Oak & Fabric"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Weight</label>
                    <input
                      type="text"
                      className="form-input"
                      name="weight"
                      value={form.weight}
                      onChange={handleFormChange}
                      placeholder="e.g. 58 kg"
                    />
                  </div>
                </div>

                {/* 7. Description */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Product Description</label>
                  <textarea
                    className="form-textarea"
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Provide detailed description, craftsmanship highlights, and care advice..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Publishing...' : isCreating ? 'Publish Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList