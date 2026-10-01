// ============================================================
// Premium Product Inventory & Catalog Studio
// ============================================================
// Features:
//  - Fully dynamic storefront sync:
//      * Featured on Homepage toggle
//      * On Sale toggle & Discounted Price calculation
//      * Interactive Hex Color Palette + Custom Color Swatches
//      * Sizes & Configurations chips
//      * Material, Warranty, and Delivery Terms
//      * Multi-image Gallery with Drag-and-drop, URL input, and Primary Image selector
//      * Pricing (MRP, Selling Price, Weekly Finance)
//      * Full Rich Text Description with clean SVG toolbar
//  - Zero redundant page headers (global topbar displays current breadcrumb/title)
//  - 100% clean SVG icons (zero emotes or unicode artifacts)
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
      weight: '',
    warranty: '5 Years Frame & Foam Warranty',
    delivery_info: '2-5 business days across Auckland / Nationwide delivery',
    featured: false,
    on_sale: false,
    new_arrival: false,
    description: '',
  }

  const [form, setForm] = useState(initialForm)

  // Images State - Thumbnail (1) + Extra Review Images (up to 20)
  const [thumbnailImage, setThumbnailImage] = useState('')
  const [newThumbnailFile, setNewThumbnailFile] = useState(null)
  const [extraImages, setExtraImages] = useState([])
  const [newExtraFiles, setNewExtraFiles] = useState([])
  const [directImageUrl, setDirectImageUrl] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragTarget, setDragTarget] = useState('')

  // Color Palette State
  const [selectedColors, setSelectedColors] = useState([])
  const [customColorHex, setCustomColorHex] = useState('#aa7a3e')
  const [customColorName, setCustomColorName] = useState('')

  // Sizes State
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sizePrices, setSizePrices] = useState({})   // { "Queen": "1299" }
  const [sizeMrps, setSizeMrps] = useState({})       // { "Queen": "1599" }
  const [customSizeInput, setCustomSizeInput] = useState('')

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
    setThumbnailImage('')
    setNewThumbnailFile(null)
    setExtraImages([])
    setNewExtraFiles([])
    setDirectImageUrl('')
    setSelectedColors([])
    setSelectedSizes([])
    setSizePrices({})
    setSizeMrps({})
    setActiveProductId(null)
    setIsCreating(true)
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
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
      weight: product.weight || '',
      warranty: product.warranty || '5 Years Frame & Foam Warranty',
      delivery_info: product.delivery_info || '2-5 business days across Auckland',
      featured: Boolean(product.featured),
      on_sale: isOnSale,
      new_arrival: Boolean(product.new_arrival),
      description: product.description || '',
    })

    // Parse images into thumbnail + extras
    let imgs = []
    if (Array.isArray(product.images)) imgs = product.images
    else if (typeof product.images === 'string') {
      try { imgs = JSON.parse(product.images) } catch { imgs = [product.images] }
    }
    const validImgs = imgs.filter(Boolean)
    if (validImgs.length > 0) {
      setThumbnailImage(validImgs[0])
      setExtraImages(validImgs.slice(1, 21))
    } else {
      setThumbnailImage('')
      setExtraImages([])
    }
    setNewThumbnailFile(null)
    setNewExtraFiles([])
    setDirectImageUrl('')

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

    // Parse sizes + per-size prices
    const sizeList = product.size ? product.size.split(',').map(s => s.trim()).filter(Boolean) : []
    setSelectedSizes(sizeList)

    let parsedSizePrices = {}
    try {
      parsedSizePrices = product.size_prices ? JSON.parse(product.size_prices) : {}
    } catch {
      parsedSizePrices = {}
    }
    const nextSizePrices = {}
    sizeList.forEach(name => {
      const value = parsedSizePrices[name]
      if (value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))) {
        nextSizePrices[name] = String(value)
      }
    })
    setSizePrices(nextSizePrices)

    let parsedSizeMrps = {}
    try {
      parsedSizeMrps = product.size_mrps ? JSON.parse(product.size_mrps) : {}
    } catch {
      parsedSizeMrps = {}
    }
    const nextSizeMrps = {}
    sizeList.forEach(name => {
      const value = parsedSizeMrps[name]
      if (value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))) {
        nextSizeMrps[name] = String(value)
      }
    })
    setSizeMrps(nextSizeMrps)

    setModalOpen(true)
    document.body.style.overflow = 'hidden'
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

  const handleSizePriceChange = (size, value) => {
    setSizePrices(prev => ({ ...prev, [size]: value }))
  }

  const handleSizeMrpChange = (size, value) => {
    setSizeMrps(prev => ({ ...prev, [size]: value }))
  }

  // Direct image URL adder
  const handleAddDirectImageUrl = () => {
    const url = directImageUrl.trim()
    if (!url) return
    if (!url.startsWith('http')) return showToast('Please enter a valid image URL (e.g. https://...)', 'warning')
    if (dragTarget === 'thumbnail') {
      setThumbnailImage(url)
    } else if (dragTarget === 'extra' && extraImages.length < 20) {
      setExtraImages(prev => [...prev, url])
    } else {
      // Default: add to extras if under limit
      if (extraImages.length < 20) {
        setExtraImages(prev => [...prev, url])
      } else {
        return showToast('Maximum 20 extra review images allowed', 'warning')
      }
    }
    setDirectImageUrl('')
    showToast('Image URL added', 'success')
  }

  // File selection & drop
  const handleFileSelect = (e, target) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (target === 'thumbnail') {
      setNewThumbnailFile(files[0])
      showToast('Thumbnail image queued for upload', 'info')
    } else {
      const remaining = 20 - extraImages.length - newExtraFiles.length
      if (remaining <= 0) {
        showToast('Maximum 20 extra review images allowed', 'warning')
        return
      }
      const accepted = files.slice(0, remaining)
      setNewExtraFiles(prev => [...prev, ...accepted])
      showToast(`${accepted.length} extra image(s) queued for upload`, 'info')
    }
  }

  const handleDrop = (e, target) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length === 0) return

    if (target === 'thumbnail') {
      setNewThumbnailFile(files[0])
      showToast('Thumbnail image queued for upload', 'info')
    } else {
      const remaining = 20 - extraImages.length - newExtraFiles.length
      if (remaining <= 0) {
        showToast('Maximum 20 extra review images allowed', 'warning')
        return
      }
      const accepted = files.slice(0, remaining)
      setNewExtraFiles(prev => [...prev, ...accepted])
      showToast(`${accepted.length} extra image(s) queued for upload`, 'info')
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

      // Per-size prices: only sizes that are still selected are kept
      const sizePriceMap = {}
      selectedSizes.forEach(name => {
        const raw = sizePrices[name]
        if (raw === undefined || raw === null || raw === '') return
        const price = Number(raw)
        if (Number.isFinite(price) && price >= 0) sizePriceMap[name] = price
      })
      formData.append('size_prices', JSON.stringify(sizePriceMap))

      // Per-size MRP (strikethrough price): only sizes that are still selected are kept
      const sizeMrpMap = {}
      selectedSizes.forEach(name => {
        const raw = sizeMrps[name]
        if (raw === undefined || raw === null || raw === '') return
        const price = Number(raw)
        if (Number.isFinite(price) && price >= 0) sizeMrpMap[name] = price
      })
      formData.append('size_mrps', JSON.stringify(sizeMrpMap))

      // Build ordered images array: thumbnail first, then extras
      const orderedExisting = []
      if (thumbnailImage) orderedExisting.push(thumbnailImage)
      extraImages.forEach(img => orderedExisting.push(img))
      formData.append('existing_images', JSON.stringify(orderedExisting))

      // Append new thumbnail file
      if (newThumbnailFile) {
        formData.append('images', newThumbnailFile)
      }
      // Append new extra files
      newExtraFiles.forEach(file => {
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
        document.body.style.overflow = ''
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
      {modalOpen && createPortal((
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
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { document.body.style.overflow = ''; setModalOpen(false) } }}
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
              margin: 'auto',
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
                  Configure product specifications, live pricing, image gallery, and color palette.
                </span>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => { document.body.style.overflow = ''; setModalOpen(false) }}
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

              {/* Section 3: Product Images - Thumbnail + Extra Review Images */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  03. Product Images
                </span>

                {/* Thumbnail Section */}
                <div style={{ background: 'var(--sidebar-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 700 }}>
                    Thumbnail Image (1 required)
                  </label>
                  <div
                    onDrop={(e) => handleDrop(e, 'thumbnail')}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); setDragTarget('thumbnail') }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => { setDragTarget('thumbnail'); document.getElementById('thumb-file-input')?.click() }}
                    style={{
                      border: `2px dashed ${isDragOver && dragTarget === 'thumbnail' ? 'var(--accent-color, #d4af37)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '18px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragOver && dragTarget === 'thumbnail' ? 'rgba(212, 175, 55, 0.08)' : 'var(--header-bg)',
                      transition: 'all 0.2s ease',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {(thumbnailImage || newThumbnailFile) ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={newThumbnailFile ? URL.createObjectURL(newThumbnailFile) : getAssetUrl(thumbnailImage)}
                          alt="Thumbnail"
                          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent-color, #d4af37)' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/120x120?text=Image' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setThumbnailImage(''); setNewThumbnailFile(null) }}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1 }}
                          title="Remove thumbnail"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block', color: 'var(--accent-color, #d4af37)' }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          Click or drag to upload thumbnail
                        </p>
                        <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                          PNG, JPG, WebP &middot; Recommended: <strong>1200 x 900 px</strong> (4:3) &middot; Max 5 MB
                        </span>
                      </>
                    )}
                    <input id="thumb-file-input" type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => handleFileSelect(e, 'thumbnail')} />
                  </div>
                </div>

                {/* Extra Review Images Section */}
                <div style={{ background: 'var(--sidebar-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 700 }}>
                    Extra Review Images (up to 20)
                  </label>

                  {/* Add by URL */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Paste image URL (https://...)"
                      value={directImageUrl}
                      onChange={(e) => setDirectImageUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDirectImageUrl() } }}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button type="button" className="btn-secondary" onClick={handleAddDirectImageUrl} style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      + Add URL
                    </button>
                  </div>

                  {/* Thumbnails Grid for extras */}
                  {(extraImages.length > 0 || newExtraFiles.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      {/* Existing Extra Images */}
                      {extraImages.map((imgUrl, idx) => (
                        <div
                          key={`extra-${idx}`}
                          style={{
                            position: 'relative',
                            height: '95px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '2px solid var(--border-color)',
                            background: '#000',
                          }}
                        >
                          <img src={getAssetUrl(imgUrl)} alt={`Extra ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/100x95?text=Image' }} />
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExtraImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                            title="Remove Image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}

                      {/* New Extra Files */}
                      {newExtraFiles.map((file, idx) => (
                        <div
                          key={`newextra-${idx}`}
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
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#10b981', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewExtraFiles(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1 }}
                            title="Remove File"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropzone for extras */}
                  {(extraImages.length + newExtraFiles.length) < 20 && (
                    <div
                      onDrop={(e) => handleDrop(e, 'extra')}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); setDragTarget('extra') }}
                      onDragLeave={() => setIsDragOver(false)}
                      onClick={() => { setDragTarget('extra'); document.getElementById('extra-file-input')?.click() }}
                      style={{
                        border: `2px dashed ${isDragOver && dragTarget === 'extra' ? 'var(--accent-color, #d4af37)' : 'var(--border-color)'}`,
                        borderRadius: '8px',
                        padding: '14px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: isDragOver && dragTarget === 'extra' ? 'rgba(212, 175, 55, 0.08)' : 'var(--header-bg)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 4px', display: 'block', color: 'var(--accent-color, #d4af37)' }}>
                        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                      </svg>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        Drag & drop or click to add more images
                      </p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        {20 - extraImages.length - newExtraFiles.length} slot(s) remaining &middot; Recommended: <strong>1200 x 900 px</strong> (4:3) &middot; Max 5 MB each
                      </span>
                      <input id="extra-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => handleFileSelect(e, 'extra')} />
                    </div>
                  )}

                  {(extraImages.length + newExtraFiles.length) >= 20 && (
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '8px' }}>
                      Maximum 20 extra review images reached.
                    </p>
                  )}
                </div>
              </div>

              {/* Section 4: Color Palette & Specifications */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '10px' }}>
                  04. Color Palette & Specifications
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

                {/* Specifications */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
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

                  {/* Price per size */}
                  {selectedSizes.length > 0 && (
                    <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)' }}>
                        Price per size
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                        {selectedSizes.map(size => (
                          <div
                            key={size}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--header-bg)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '6px 8px',
                            }}
                          >
                            <span
                              title={size}
                              style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                              {size}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }} title="Regular price / MRP">MRP</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={sizeMrps[size] ?? ''}
                              onChange={(e) => handleSizeMrpChange(size, e.target.value)}
                              placeholder="0"
                              aria-label={`MRP for ${size}`}
                              style={{ width: '70px', padding: '5px 7px', fontSize: '0.8rem', background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', borderRadius: '5px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>$</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={sizePrices[size] ?? ''}
                              onChange={(e) => handleSizePriceChange(size, e.target.value)}
                              placeholder="0"
                              aria-label={`Price for ${size}`}
                              style={{ width: '70px', padding: '5px 7px', fontSize: '0.8rem', background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', borderRadius: '5px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        MRP is the regular (struck-through) price, $ is the sale price. Leave blank to fall back to the default product price for that size.
                      </p>
                    </div>
                  )}
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
                  onClick={() => { document.body.style.overflow = ''; setModalOpen(false) }}
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
        ), document.body)}
    </div>
  )
}

export default ProductList;
