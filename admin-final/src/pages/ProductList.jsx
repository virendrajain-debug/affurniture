// ============================================================
// Premium Product Inventory & Catalog Studio
// ============================================================
// Features:
//  - Fully dynamic storefront sync:
//      * Featured on Homepage toggle
//      * On Sale toggle & Discounted Price calculation
//      * Interactive Hex Color Palette + Custom Color Swatches
//      * Dimensions (Width x Depth x Height & formatted text)
//      * Sizes & Configurations chips
//      * Material, Warranty, and Delivery Terms
//      * Multi-image Gallery with Drag-and-drop, URL input, and Primary Image selector
//      * Pricing (MRP, Selling Price, Weekly Finance)
//      * Full Rich Text Description with clean SVG toolbar
//  - Zero redundant page headers (global topbar displays current breadcrumb/title)
//  - 100% clean SVG icons (zero emotes or unicode artifacts)
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

const PRESET_COLORS = [
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

const PRESET_SIZES = [
  'Single', 'King Single', 'Double', 'Queen', 'King', 'Super King',
  'Small', 'Medium', 'Large', '2-Seater', '3-Seater', 'Modular', 'Corner Chaise'
]

// Clean Rich Text Editor with SVG Icons
function RichTextEditor({ value, onChange, placeholder = 'Enter full product description and specifications...' }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInsertLink = () => {
    const url = window.prompt('Enter website URL:')
    if (url) execCmd('createLink', url)
  }

  return (
    <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--header-bg)', overflow: 'hidden' }}>
      {/* Editor Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px 10px', background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
        <button type="button" className="btn-icon" onClick={() => execCmd('bold')} title="Bold" style={{ width: '28px', height: '28px', fontWeight: 700 }}>
          B
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('italic')} title="Italic" style={{ width: '28px', height: '28px', fontStyle: 'italic' }}>
          I
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('underline')} title="Underline" style={{ width: '28px', height: '28px', textDecoration: 'underline' }}>
          U
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('strikeThrough')} title="Strikethrough" style={{ width: '28px', height: '28px', textDecoration: 'line-through' }}>
          S
        </button>

        <span style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px' }} />

        <button type="button" className="btn-icon" onClick={() => execCmd('formatBlock', '<h2>')} title="Heading 2" style={{ width: '32px', height: '28px', fontSize: '0.8rem', fontWeight: 700 }}>
          H2
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('formatBlock', '<h3>')} title="Heading 3" style={{ width: '32px', height: '28px', fontSize: '0.78rem', fontWeight: 600 }}>
          H3
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('formatBlock', '<p>')} title="Paragraph" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
          P
        </button>

        <span style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px' }} />

        <button type="button" className="btn-icon" onClick={() => execCmd('insertUnorderedList')} title="Bullet List" style={{ width: '28px', height: '28px' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('insertOrderedList')} title="Numbered List" style={{ width: '28px', height: '28px' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h2v4H4M4 14h3l-3 4h3"/></svg>
        </button>

        <span style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px' }} />

        <button type="button" className="btn-icon" onClick={handleInsertLink} title="Insert Link" style={{ width: '28px', height: '28px' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <button type="button" className="btn-icon" onClick={() => execCmd('removeFormat')} title="Clear Formatting" style={{ width: '28px', height: '28px', color: '#ef4444' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{
          minHeight: '140px',
          padding: '12px 14px',
          color: 'var(--text-primary)',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          outline: 'none',
        }}
      />
    </div>
  )
}

function ProductList({ token }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [subcategoryFilter, setSubcategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeProductId, setActiveProductId] = useState(null)
  const [saving, setSaving] = useState(false)

  const initialForm = {
    name: '',
    category_id: '',
    subcategory_id: '',
    brand: 'AF Furnishings',
    sku: '',
    mrp: '',
    selling_price: '',
    discounted_price: '',
    weekly_price: '',
    stock: 10,
    material: '',
    dimensions: '',
    weight: '',
    warranty: '5 Years Frame & Foam Warranty',
    delivery_info: '2-5 business days across Auckland / Nationwide delivery',
    featured: false,
    on_sale: false,
    new_arrival: false,
    description: '',
  }

  const [form, setForm] = useState(initialForm)

  // Images State
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [directImageUrl, setDirectImageUrl] = useState('')
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)

  // Color Palette State
  const [selectedColors, setSelectedColors] = useState([])
  const [customColorHex, setCustomColorHex] = useState('#aa7a3e')
  const [customColorName, setCustomColorName] = useState('')

  // Sizes State
  const [selectedSizes, setSelectedSizes] = useState([])
  const [customSizeInput, setCustomSizeInput] = useState('')

  const fileInputRef = useRef(null)
  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/subcategories`),
      ])
      const prodData = await prodRes.json()
      const catData = await catRes.json()
      const subData = await subRes.json()

      if (Array.isArray(prodData)) setProducts(prodData)
      else if (prodData && Array.isArray(prodData.products)) setProducts(prodData.products)

      if (Array.isArray(catData)) setCategories(catData)
      if (Array.isArray(subData)) setSubcategories(subData)
    } catch {
      showToast('Failed to load inventory data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Open Create Drawer
  const handleOpenCreate = () => {
    setForm(initialForm)
    setExistingImages([])
    setNewImageFiles([])
    setDirectImageUrl('')
    setPrimaryImageIdx(0)
    setSelectedColors([])
    setSelectedSizes([])
    setActiveProductId(null)
    setIsCreating(true)
    setModalOpen(true)
  }

  // Open Edit Drawer
  const handleOpenEdit = (product) => {
    setIsCreating(false)
    setActiveProductId(product.id)

    const isOnSale = Boolean(
      (product.discounted_price && Number(product.discounted_price) > 0 && Number(product.discounted_price) < Number(product.mrp)) ||
      (product.selling_price && Number(product.selling_price) < Number(product.mrp))
    )

    setForm({
      name: product.name || '',
      category_id: product.category_id || '',
      subcategory_id: product.subcategory_id || '',
      brand: product.brand || 'AF Furnishings',
      sku: product.sku || '',
      mrp: product.mrp || '',
      selling_price: product.selling_price || product.discounted_price || '',
      discounted_price: product.discounted_price || product.selling_price || '',
      weekly_price: product.weekly_price || '',
      stock: product.stock !== undefined ? product.stock : 10,
      material: product.material || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      warranty: product.warranty || '5 Years Frame & Foam Warranty',
      delivery_info: product.delivery_info || '2-5 business days across Auckland',
      featured: Boolean(product.featured),
      on_sale: isOnSale,
      new_arrival: Boolean(product.new_arrival),
      description: product.description || '',
    })

    // Parse images
    let imgs = []
    if (Array.isArray(product.images)) imgs = product.images
    else if (typeof product.images === 'string') {
      try { imgs = JSON.parse(product.images) } catch { imgs = [product.images] }
    }
    setExistingImages(imgs.filter(Boolean))
    setNewImageFiles([])
    setDirectImageUrl('')
    setPrimaryImageIdx(0)

    // Parse colors
    if (product.color) {
      const colors = product.color.split(',').map(c => c.trim()).filter(Boolean)
      const parsedColors = colors.map(raw => {
        const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/)
        const hex = hexMatch ? hexMatch[0] : '#808080'
        const name = hexMatch ? raw.replace(hexMatch[0], '').replace(/[()]/g, '').trim() : raw
        return { name: name || 'Custom', hex }
      })
      setSelectedColors(parsedColors)
    } else {
      setSelectedColors([])
    }

    // Parse sizes
    if (product.size) {
      setSelectedSizes(product.size.split(',').map(s => s.trim()).filter(Boolean))
    } else {
      setSelectedSizes([])
    }

    setModalOpen(true)
  }

  // Auto-calculate weekly price
  const handleAutoWeekly = () => {
    const price = Number(form.selling_price || form.discounted_price || form.mrp)
    if (price > 0) {
      const weekly = Math.ceil(price / 52)
      setForm(prev => ({ ...prev, weekly_price: weekly }))
      showToast(`Weekly price set to $${weekly}/week`, 'info')
    }
  }

  // Form input change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // Color Swatch Selection
  const handleToggleColor = (swatch) => {
    setSelectedColors(prev => {
      const exists = prev.some(c => c.hex.toLowerCase() === swatch.hex.toLowerCase())
      if (exists) return prev.filter(c => c.hex.toLowerCase() !== swatch.hex.toLowerCase())
      return [...prev, swatch]
    })
  }

  const handleAddCustomColor = () => {
    if (!customColorHex) return
    const name = customColorName.trim() || 'Custom'
    if (!selectedColors.some(c => c.hex.toLowerCase() === customColorHex.toLowerCase())) {
      setSelectedColors(prev => [...prev, { name, hex: customColorHex }])
      setCustomColorName('')
    }
  }

  const handleRemoveColor = (hex) => {
    setSelectedColors(prev => prev.filter(c => c.hex !== hex))
  }

  // Size Selection
  const handleToggleSize = (size) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) return prev.filter(s => s !== size)
      return [...prev, size]
    })
  }

  const handleAddCustomSize = () => {
    const s = customSizeInput.trim()
    if (s && !selectedSizes.includes(s)) {
      setSelectedSizes(prev => [...prev, s])
      setCustomSizeInput('')
    }
  }

  // Direct image URL adder
  const handleAddDirectImageUrl = () => {
    const url = directImageUrl.trim()
    if (!url) return
    if (!url.startsWith('http')) return showToast('Please enter a valid image URL (e.g. https://...)', 'warning')
    setExistingImages(prev => [...prev, url])
    setDirectImageUrl('')
    showToast('Image URL added to gallery', 'success')
  }

  // File selection & drop
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files])
      showToast(`${files.length} image(s) queued for upload`, 'info')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files])
      showToast(`${files.length} image(s) queued for upload`, 'info')
    }
  }

  // Submit Product (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return showToast('Product title is required', 'warning')
    if (!form.mrp && !form.selling_price) return showToast('Please set a regular MRP or selling price', 'warning')

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name.trim())
      formData.append('category_id', form.category_id || '')
      formData.append('subcategory_id', form.subcategory_id || '')
      formData.append('brand', form.brand || 'AF Furnishings')
      formData.append('sku', form.sku || '')
      
      const effectiveMrp = form.mrp || form.selling_price
      const effectiveSelling = form.on_sale && form.discounted_price ? form.discounted_price : (form.selling_price || form.mrp)
      const effectiveDiscount = form.on_sale ? (form.discounted_price || form.selling_price) : ''

      formData.append('mrp', effectiveMrp)
      formData.append('selling_price', effectiveSelling)
      formData.append('discounted_price', effectiveDiscount)
      formData.append('weekly_price', form.weekly_price || '')
      formData.append('stock', form.stock || 0)
      formData.append('material', form.material || '')
      formData.append('dimensions', form.dimensions || '')
      formData.append('weight', form.weight || '')
      formData.append('warranty', form.warranty || '')
      formData.append('delivery_info', form.delivery_info || '')
      formData.append('featured', form.featured ? 'true' : 'false')
      formData.append('new_arrival', form.new_arrival ? 'true' : 'false')
      formData.append('description', form.description || '')

      // Serialize colors and sizes
      const colorString = selectedColors.map(c => `${c.name} (${c.hex})`).join(', ')
      formData.append('color', colorString)
      formData.append('size', selectedSizes.join(', '))

      // Reorder existing images if primary is changed
      let orderedExisting = [...existingImages]
      if (primaryImageIdx < existingImages.length) {
        const [prim] = orderedExisting.splice(primaryImageIdx, 1)
        orderedExisting.unshift(prim)
      }
      formData.append('existing_images', JSON.stringify(orderedExisting))

      // Append new files
      newImageFiles.forEach(file => {
        formData.append('images', file)
      })

      const url = isCreating ? `${API_BASE}/api/products` : `${API_BASE}/api/products/${activeProductId}`
      const method = isCreating ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })

      if (res.ok) {
        showToast(isCreating ? 'Product created successfully' : 'Product updated successfully', 'success')
        setModalOpen(false)
        fetchData()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to save product', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Product deleted', 'success')
        fetchData()
      } else {
        showToast('Failed to delete product', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // Dependent subcategories for toolbar filter
  const availableSubcategories = subcategories.filter(s => {
    if (categoryFilter === 'all') return false
    return String(s.category_id) === String(categoryFilter)
  })

  // Filter Products Table
  const filteredProducts = products.filter(p => {
    const matchSearch =
      !searchTerm.trim() ||
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchCategory = true
    if (categoryFilter !== 'all') {
      matchCategory =
        String(p.category_id) === String(categoryFilter) ||
        (p.category_name && p.category_name.toLowerCase() === categoryFilter.toLowerCase())
    }

    let matchSubcategory = true
    if (categoryFilter !== 'all' && subcategoryFilter !== 'all') {
      matchSubcategory =
        String(p.subcategory_id) === String(subcategoryFilter) ||
        (p.subcategory_name && p.subcategory_name.toLowerCase() === subcategoryFilter.toLowerCase())
    }

    return matchSearch && matchCategory && matchSubcategory
  })

  // Calculate discount preview in form
  const calcDiscountPercent = () => {
    const regular = Number(form.mrp)
    const sale = Number(form.discounted_price || form.selling_price)
    if (regular > 0 && sale > 0 && sale < regular) {
      return Math.round(((regular - sale) / regular) * 100)
    }
    return 0
  }

  const discountPercent = calcDiscountPercent()

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Sleek Filter & Search Toolbar (Zero internal H1/H2 header clutter) */}
      <div
        className="filter-toolbar"
        style={{
          background: 'var(--sidebar-bg, #111827)',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        {/* Search input with SVG search icon */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px' }}
          />
        </div>

        {/* Category filter */}
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setSubcategoryFilter('all')
          }}
          style={{ minWidth: '180px' }}
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Subcategory filter */}
        <select
          className="filter-select"
          value={subcategoryFilter}
          onChange={(e) => setSubcategoryFilter(e.target.value)}
          disabled={categoryFilter === 'all' || availableSubcategories.length === 0}
          style={{
            minWidth: '180px',
            opacity: (categoryFilter === 'all' || availableSubcategories.length === 0) ? 0.5 : 1,
            cursor: (categoryFilter === 'all' || availableSubcategories.length === 0) ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="all">
            {categoryFilter === 'all'
              ? 'Select Category First'
              : availableSubcategories.length === 0
              ? 'No Subcategories'
              : `All Subcategories (${availableSubcategories.length})`}
          </option>
          {availableSubcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Primary Add Product Action Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Product Data Table */}
      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading inventory...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.4 }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>No products found</h3>
          <p style={{ margin: '8px 0 16px 0', fontSize: '0.85rem' }}>
            {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Create your first product to display on the storefront.'}
          </p>
          <button className="btn-primary" onClick={handleOpenCreate}>
            + Add Product
          </button>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price & Weekly</th>
                  <th>Stock</th>
                  <th>Badges</th>
                  <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  let img = 'https://placehold.co/80x80?text=Product'
                  if (p.images) {
                    if (Array.isArray(p.images) && p.images.length > 0) img = p.images[0]
                    else if (typeof p.images === 'string') {
                      try {
                        const parsed = JSON.parse(p.images)
                        if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0]
                      } catch {
                        img = p.images
                      }
                    }
                  }

                  const hasDiscount = (p.discounted_price && Number(p.discounted_price) > 0 && Number(p.discounted_price) < Number(p.mrp)) || (p.selling_price && p.mrp && Number(p.selling_price) < Number(p.mrp))
                  const weekly = p.weekly_price || (p.selling_price ? Math.ceil(Number(p.selling_price) / 52) : null)

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Image */}
                      <td style={{ textAlign: 'center', padding: '10px' }}>
                        <img
                          src={getAssetUrl(img)}
                          alt={p.name}
                          style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=Product' }}
                        />
                      </td>

                      {/* Product Name & Details */}
                      <td style={{ padding: '10px 14px' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                          {p.name}
                        </strong>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                          {p.brand && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.brand}</span>}
                          {p.sku && <span className="badge badge-default" style={{ fontSize: '0.7rem' }}>SKU: {p.sku}</span>}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.78rem' }}>
                          {p.category_name || 'Unassigned'}
                        </span>
                        {p.subcategory_name && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {p.subcategory_name}
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            ${Number(p.discounted_price || p.selling_price || p.mrp || 0).toLocaleString()}
                          </strong>
                          {hasDiscount && (
                            <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                              ${Number(p.mrp).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {weekly && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-color, #d4af37)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                            ${weekly}/wk
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '10px 14px' }}>
                        {p.stock > 0 ? (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            {p.stock} in stock
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                            Out of stock
                          </span>
                        )}
                      </td>

                      {/* Badges */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {p.featured === 1 && <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Featured</span>}
                          {p.new_arrival === 1 && <span className="badge badge-default" style={{ fontSize: '0.7rem' }}>New</span>}
                          {hasDiscount && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Sale</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', padding: '10px 14px' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-icon btn-edit"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete Product"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
        </div>
      )}

      {/* Add / Edit Product Drawer / Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--sidebar-bg)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {isCreating ? 'Add New Product' : `Edit Product: ${form.name}`}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Configure product specifications, live pricing, image gallery, color palette, and dimensions.
                </span>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setModalOpen(false)}
                style={{ width: '32px', height: '32px', fontSize: '1.1rem' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Section 1: Basic Information */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  01. Basic Information
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category *</label>
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
              </div>

              {/* Section 2: Pricing, Sale Status & Stock */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  02. Pricing, Sale & Inventory
                </span>
                
                {/* On Sale Switch Banner */}
                <div style={{ background: 'var(--sidebar-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      name="on_sale"
                      checked={form.on_sale}
                      onChange={handleFormChange}
                      style={{ width: '18px', height: '18px', accentColor: '#eab308' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                        Mark as &quot;On Sale&quot;
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Displays SALE badge and lists product under the On Sale deals page.
                      </span>
                    </div>
                  </label>

                  {form.on_sale && discountPercent > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                      -{discountPercent}% Discount Active
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Regular Price / MRP ($NZD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      name="mrp"
                      value={form.mrp}
                      onChange={handleFormChange}
                      placeholder="1599.00"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      {form.on_sale ? 'Sale / Discounted Price ($NZD) *' : 'Selling Price ($NZD) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      name={form.on_sale ? 'discounted_price' : 'selling_price'}
                      value={form.on_sale ? (form.discounted_price || form.selling_price) : form.selling_price}
                      onChange={(e) => {
                        const val = e.target.value
                        if (form.on_sale) {
                          setForm(prev => ({ ...prev, discounted_price: val, selling_price: val }))
                        } else {
                          setForm(prev => ({ ...prev, selling_price: val }))
                        }
                      }}
                      placeholder="1299.00"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Weekly ($NZD)</label>
                      <button type="button" onClick={handleAutoWeekly} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                        Auto Calc
                      </button>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      name="weekly_price"
                      value={form.weekly_price}
                      onChange={handleFormChange}
                      placeholder="e.g. 25.00"
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
              </div>

              {/* Section 3: Product Images Gallery */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  03. Product Images Gallery
                </span>
                <div style={{ background: 'var(--sidebar-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  
                  {/* Image Dropzone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragOver ? 'var(--accent-color, #d4af37)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '22px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragOver ? 'rgba(212, 175, 55, 0.08)' : 'var(--header-bg)',
                      transition: 'all 0.2s ease',
                      marginBottom: '14px',
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block', color: 'var(--accent-color, #d4af37)' }}>
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Drag and drop image files here, or click to browse
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                      PNG, JPG, WebP supported. First image is automatically set as Primary thumbnail.
                    </span>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={handleFileSelect} />
                  </div>

                  {/* Add by Image URL */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Or paste direct image URL (https://...)"
                      value={directImageUrl}
                      onChange={(e) => setDirectImageUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDirectImageUrl() } }}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button type="button" className="btn-secondary" onClick={handleAddDirectImageUrl} style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      + Add URL
                    </button>
                  </div>

                  {/* Thumbnails Grid */}
                  {(existingImages.length > 0 || newImageFiles.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px' }}>
                      {/* Existing Images */}
                      {existingImages.map((imgUrl, idx) => (
                        <div
                          key={`exist-${idx}`}
                          style={{
                            position: 'relative',
                            height: '95px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: `2px solid ${primaryImageIdx === idx ? 'var(--accent-color, #d4af37)' : 'var(--border-color)'}`,
                            background: '#000',
                          }}
                        >
                          <img src={getAssetUrl(imgUrl)} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/100x95?text=Image' }} />
                          <span
                            onClick={() => setPrimaryImageIdx(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              background: primaryImageIdx === idx ? 'var(--accent-color, #d4af37)' : 'rgba(0,0,0,0.65)',
                              color: primaryImageIdx === idx ? '#000' : '#fff',
                              fontSize: '0.65rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            {primaryImageIdx === idx ? 'Primary' : 'Set Primary'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                            title="Remove Image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}

                      {/* New Image Files */}
                      {newImageFiles.map((file, idx) => (
                        <div
                          key={`new-${idx}`}
                          style={{
                            position: 'relative',
                            height: '95px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '2px solid var(--accent-color, #d4af37)',
                            background: '#000',
                          }}
                        >
                          <img src={URL.createObjectURL(file)} alt="New upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#10b981', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewImageFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                            title="Remove File"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Color Palette, Dimensions & Specifications */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  04. Color Palette, Dimensions & Specifications
                </span>
                
                {/* Color Palette Builder */}
                <div style={{ background: 'var(--sidebar-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Color Palette (Front Swatches)
                  </label>
                  
                  {/* Preset Swatches */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {PRESET_COLORS.map((swatch) => {
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
                            border: `1.5px solid ${isSelected ? 'var(--accent-color, #d4af37)' : 'var(--border-color)'}`,
                            background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--header-bg)',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: swatch.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                          <span>{swatch.name}</span>
                          {isSelected && <span>&#10003;</span>}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom Hex Adder */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      style={{ width: '38px', height: '36px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', padding: '2px', background: 'none' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hex (#AA7A3E)"
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
                      style={{ flex: 1, minWidth: '150px', fontSize: '0.85rem' }}
                    />
                    <button type="button" className="btn-secondary" onClick={handleAddCustomColor} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      + Add Swatch
                    </button>
                  </div>

                  {/* Active Selected Swatches */}
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
                            background: 'var(--header-bg)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.78rem',
                          }}
                        >
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.hex }} />
                          <span>{c.name}</span>
                          <span style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }} onClick={() => handleRemoveColor(c.hex)}>
                            &times;
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dimensions & Specifications */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Dimensions (e.g. 210cm W x 95cm D x 85cm H)</label>
                    <input
                      type="text"
                      className="form-input"
                      name="dimensions"
                      value={form.dimensions}
                      onChange={handleFormChange}
                      placeholder="e.g. 210cm W x 95cm D x 85cm H"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Material / Fabric / Timber</label>
                    <input
                      type="text"
                      className="form-input"
                      name="material"
                      value={form.material}
                      onChange={handleFormChange}
                      placeholder="e.g. Solid Oak, Velvet Fabric, Top-Grain Leather"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Warranty Terms</label>
                    <input
                      type="text"
                      className="form-input"
                      name="warranty"
                      value={form.warranty}
                      onChange={handleFormChange}
                      placeholder="e.g. 5 Years Frame & Foam Warranty"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Delivery Estimate</label>
                    <input
                      type="text"
                      className="form-input"
                      name="delivery_info"
                      value={form.delivery_info}
                      onChange={handleFormChange}
                      placeholder="e.g. 2-5 business days across Auckland"
                    />
                  </div>
                </div>

                {/* Sizes Selector */}
                <div style={{ background: 'var(--sidebar-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Available Sizes / Configurations
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {PRESET_SIZES.map((size) => {
                      const isSelected = selectedSizes.includes(size)
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleToggleSize(size)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: `1.5px solid ${isSelected ? 'var(--accent-color, #d4af37)' : 'var(--border-color)'}`,
                            background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--header-bg)',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          {size} {isSelected && <span>&#10003;</span>}
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add custom size (e.g. 4-Seater + Chaise)..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize() } }}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button type="button" className="btn-secondary" onClick={handleAddCustomSize} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      + Add Size
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 5: Badges & Storefront Flags */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  05. Badges & Storefront Flags
                </span>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', background: 'var(--sidebar-bg)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  
                  {/* Featured Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleFormChange}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color, #d4af37)' }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Featured on Homepage</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show in top curated collections</span>
                    </div>
                  </label>

                  {/* New Arrival Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      name="new_arrival"
                      checked={form.new_arrival}
                      onChange={handleFormChange}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>New Arrival Badge</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Highlight as newly added collection</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 6: Full Description (WYSIWYG) */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  06. Full Description & Overview
                </span>
                <RichTextEditor
                  value={form.description}
                  onChange={(val) => setForm(prev => ({ ...prev, description: val }))}
                />
              </div>

              {/* Sticky Modal Action Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  position: 'sticky',
                  bottom: 0,
                  background: 'var(--header-bg)',
                  zIndex: 10,
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  style={{ padding: '10px 20px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? 'Saving...' : isCreating ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList;
