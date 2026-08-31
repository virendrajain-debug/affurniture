// ============================================================
// Phase 3: Dynamic Homepage Manager (Single-Column Linear Form)
// ============================================================
// Controls: Hero Sliders, Promotional Banners, and Featured Homepage Categories.
// Strict UX: Single-column, vertical top-to-bottom layout (No tabs, No live previews).
// API: GET /api/homepage & PUT /api/homepage, POST /api/upload
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function HomeManager({ token }) {
  const [heroSlides, setHeroSlides] = useState([])
  const [promoBanner1, setPromoBanner1] = useState({
    image: '',
    badge: 'AF WEEKLY SPECIAL',
    title: 'Bring comfort home.',
    subtitle: 'Explore our latest living-room arrivals with flexible weekly payments.',
    button_text: 'Shop Living',
    button_link: '/category/living',
  })
  const [promoBanner2, setPromoBanner2] = useState({
    image: '',
    badge: 'NEW ARRIVALS',
    title: 'Bedroom & Dining Essentials',
    subtitle: 'Premium handcrafted furniture built for New Zealand homes.',
    button_text: 'Explore Deals',
    button_link: '/on-sale',
  })
  const [allCategories, setAllCategories] = useState([])
  const [featuredCategoryIds, setFeaturedCategoryIds] = useState([])

  // New Slide Form State
  const [newSlide, setNewSlide] = useState({
    image: '',
    tagline: 'AF FURNISHINGS',
    title: 'Comfort made for everyday living.',
    description: 'Furniture, beds and appliances to make your home feel complete.',
    button_link: '/category/lounge-suite',
    active: true,
  })
  const [editingSlideIndex, setEditingSlideIndex] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlide, setUploadingSlide] = useState(false)
  const [uploadingPromo1, setUploadingPromo1] = useState(false)
  const [uploadingPromo2, setUploadingPromo2] = useState(false)
  const [toast, setToast] = useState(null)

  const slideFileRef = useRef(null)
  const promo1FileRef = useRef(null)
  const promo2FileRef = useRef(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load Homepage Data on Mount
  useEffect(() => {
    const loadHomepageData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/homepage`)
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === 'object') {
            if (Array.isArray(data.hero_slides)) setHeroSlides(data.hero_slides)
            if (data.promo_banner_1) setPromoBanner1(prev => ({ ...prev, ...data.promo_banner_1 }))
            if (data.promo_banner_2) setPromoBanner2(prev => ({ ...prev, ...data.promo_banner_2 }))
            if (Array.isArray(data.all_categories)) setAllCategories(data.all_categories)
            if (Array.isArray(data.featured_categories)) setFeaturedCategoryIds(data.featured_categories.map(String))
          }
        }
      } catch {
        showToast('Failed to load homepage configuration', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadHomepageData()
  }, [])

  // Universal Upload Helper
  const handleUpload = async (file, type) => {
    if (!file) return
    if (type === 'slide') setUploadingSlide(true)
    if (type === 'promo1') setUploadingPromo1(true)
    if (type === 'promo2') setUploadingPromo2(true)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.url || data.imageUrl || data.image_url || data.secure_url
        if (url) {
          if (type === 'slide') setNewSlide(prev => ({ ...prev, image: url }))
          if (type === 'promo1') setPromoBanner1(prev => ({ ...prev, image: url }))
          if (type === 'promo2') setPromoBanner2(prev => ({ ...prev, image: url }))
          showToast('Image uploaded successfully!', 'success')
        }
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch {
      showToast('Error uploading image file', 'error')
    } finally {
      if (type === 'slide') setUploadingSlide(false)
      if (type === 'promo1') setUploadingPromo1(false)
      if (type === 'promo2') setUploadingPromo2(false)
    }
  }

  // Slide CRUD Actions
  const handleAddOrUpdateSlide = (e) => {
    e.preventDefault()
    if (!newSlide.image && !newSlide.title) {
      showToast('Please provide an image URL or title for the slide', 'error')
      return
    }

    if (editingSlideIndex !== null) {
      setHeroSlides(prev => {
        const copy = [...prev]
        copy[editingSlideIndex] = { ...newSlide }
        return copy
      })
      setEditingSlideIndex(null)
      showToast('Slide updated!', 'info')
    } else {
      setHeroSlides(prev => [...prev, { ...newSlide, id: Date.now() }])
      showToast('New slide added to rotation!', 'success')
    }

    // Reset Form
    setNewSlide({
      image: '',
      tagline: 'AF FURNISHINGS',
      title: '',
      description: '',
      button_link: '/category/lounge-suite',
      active: true,
    })
  }

  const handleEditSlide = (index) => {
    setEditingSlideIndex(index)
    setNewSlide({ ...heroSlides[index] })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleDeleteSlide = (index) => {
    if (heroSlides.length <= 1) {
      showToast('Keep at least one hero slide for the homepage', 'info')
      return
    }
    setHeroSlides(prev => prev.filter((_, i) => i !== index))
    showToast('Slide removed from rotation', 'info')
  }

  const handleToggleSlideActive = (index) => {
    setHeroSlides(prev => {
      const copy = [...prev]
      copy[index].active = !copy[index].active
      return copy
    })
  }

  // Category Toggle Action
  const toggleCategory = (catId) => {
    const idStr = String(catId)
    setFeaturedCategoryIds(prev => 
      prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
    )
  }

  // Save All Homepage Changes
  const handleSaveHomepage = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      hero_slides: heroSlides,
      promo_banner_1: promoBanner1,
      promo_banner_2: promoBanner2,
      featured_categories: featuredCategoryIds,
    }

    try {
      const res = await fetch(`${API_BASE}/api/homepage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('Homepage hero sliders and banners published successfully!', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save homepage settings', 'error')
      }
    } catch {
      showToast('Server error while saving homepage', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="home-manager-container">
      <style>{`
        .home-manager-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          color: var(--text-primary);
        }

        .hm-header-box {
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .hm-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }

        .hm-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .hm-form-vertical {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hm-card {
          background: var(--card-bg, rgba(255, 255, 255, 0.03));
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .hm-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .hm-card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .hm-card-header span {
          font-size: 0.78rem;
          color: var(--accent-color, #d4af37);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hm-field-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .hm-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hm-field-group.full-width {
          grid-column: 1 / -1;
        }

        .hm-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hm-hint {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .hm-input {
          width: 100%;
          padding: 12px 14px;
          background: var(--input-bg, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.92rem;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .hm-input:focus {
          outline: none;
          border-color: var(--accent-color, #d4af37);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        /* Slide List Table */
        .hm-slides-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .hm-slide-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          gap: 14px;
        }

        .hm-slide-thumb {
          width: 90px;
          height: 55px;
          border-radius: 6px;
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
        }

        .hm-slide-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hm-slide-meta {
          flex: 1;
          min-width: 0;
        }

        .hm-slide-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hm-slide-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .hm-slide-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hm-btn-sm {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--input-bg, rgba(255, 255, 255, 0.05));
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hm-btn-sm:hover {
          background: var(--border-color);
        }

        .hm-btn-sm.delete:hover {
          background: #ef4444;
          color: #fff;
          border-color: #ef4444;
        }

        .hm-btn-sm.active-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .hm-btn-sm.inactive-badge {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* Uploader Rows */
        .hm-uploader-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hm-preview-box {
          width: 120px;
          height: 70px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .hm-preview-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hm-upload-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--hover-bg, rgba(255, 255, 255, 0.08));
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          width: fit-content;
        }

        /* Checkbox Category Grid */
        .hm-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .hm-category-check-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hm-category-check-card.checked {
          border-color: var(--accent-color, #d4af37);
          background: rgba(212, 175, 55, 0.08);
        }

        .hm-category-check-card input {
          accent-color: var(--accent-color, #d4af37);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        /* Sticky Bottom Action Bar */
        .hm-submit-bar {
          position: sticky;
          bottom: 20px;
          background: var(--header-bg, #1a2238);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          z-index: 50;
        }

        .hm-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--accent-color, #d4af37);
          color: #000;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hm-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
        }

        .hm-toast {
          position: fixed;
          bottom: 90px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          z-index: 1000;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
          animation: toastIn 0.25s ease;
        }
        .hm-toast.success { background: #10b981; color: #fff; }
        .hm-toast.error { background: #ef4444; color: #fff; }
        .hm-toast.info { background: #3b82f6; color: #fff; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {toast && <div className={`hm-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="hm-header-box">
        <h2 className="hm-title">Homepage Visual Studio</h2>
        <p className="hm-subtitle">Manage rotating hero slider banners, mid-page promotional posters, and featured homepage categories.</p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading homepage configuration...
        </div>
      ) : (
        <form className="hm-form-vertical" onSubmit={handleSaveHomepage}>

          {/* Section 1: Hero Slider Rotation */}
          <div className="hm-card">
            <div className="hm-card-header">
              <span>01</span>
              <h3>Rotating Hero Banner Sliders</h3>
            </div>

            {/* Current Slides List */}
            <div className="hm-slides-list">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Active Sliders in Rotation ({heroSlides.length})
              </span>
              {heroSlides.map((slide, idx) => (
                <div key={slide.id || idx} className="hm-slide-item">
                  <div className="hm-slide-thumb">
                    <img src={getAssetUrl(slide.image)} alt={slide.title || 'Slide'} onError={(e) => { e.target.src = 'https://placehold.co/300x180?text=Slide' }} />
                  </div>
                  <div className="hm-slide-meta">
                    <h4 className="hm-slide-title">{slide.title || 'Untitled Slide'}</h4>
                    <p className="hm-slide-sub">{slide.tagline || 'AF FURNISHINGS'} &bull; {slide.button_link || '/category/lounge-suite'}</p>
                  </div>
                  <div className="hm-slide-actions">
                    <button
                      type="button"
                      className={`hm-btn-sm ${slide.active !== false ? 'active-badge' : 'inactive-badge'}`}
                      onClick={() => handleToggleSlideActive(idx)}
                    >
                      {slide.active !== false ? 'Active' : 'Hidden'}
                    </button>
                    <button type="button" className="hm-btn-sm" onClick={() => handleEditSlide(idx)}>
                      Edit
                    </button>
                    <button type="button" className="hm-btn-sm delete" onClick={() => handleDeleteSlide(idx)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Slide Sub-Form */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', color: 'var(--accent-color, #d4af37)' }}>
                {editingSlideIndex !== null ? `Edit Slide #${editingSlideIndex + 1}` : 'Add New Hero Slide'}
              </h4>
              <div className="hm-field-grid">
                <div className="hm-field-group full-width">
                  <label className="hm-label">Slide Image</label>
                  <div className="hm-uploader-row">
                    <div className="hm-preview-box">
                      {newSlide.image ? (
                        <img src={getAssetUrl(newSlide.image)} alt="Slide" onError={(e) => { e.target.src = 'https://placehold.co/300x180?text=Slide' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No Image</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <button
                        type="button"
                        className="hm-upload-btn"
                        onClick={() => slideFileRef.current?.click()}
                        disabled={uploadingSlide}
                      >
                        {uploadingSlide ? 'Uploading...' : 'Browse Image'}
                      </button>
                      <input
                        ref={slideFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUpload(e.target.files[0], 'slide')
                          }
                        }}
                      />
                      <input
                        type="text"
                        value={newSlide.image}
                        onChange={(e) => setNewSlide(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Image URL (https://...)"
                        className="hm-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Eyebrow Tagline</label>
                  <input
                    type="text"
                    value={newSlide.tagline}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. AF FURNISHINGS"
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Hero Title</label>
                  <input
                    type="text"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Comfort made for everyday living."
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group full-width">
                  <label className="hm-label">Subtext / Description</label>
                  <input
                    type="text"
                    value={newSlide.description}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Furniture, beds and appliances to make your home feel complete."
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Button Target Link</label>
                  <input
                    type="text"
                    value={newSlide.button_link}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/category/lounge-suite"
                    className="hm-input"
                  />
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                <button type="button" className="hm-save-btn" onClick={handleAddOrUpdateSlide} style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  {editingSlideIndex !== null ? 'Save Slide Updates' : '+ Add Slide to Rotation'}
                </button>
                {editingSlideIndex !== null && (
                  <button
                    type="button"
                    className="hm-btn-sm"
                    onClick={() => {
                      setEditingSlideIndex(null)
                      setNewSlide({ image: '', tagline: 'AF FURNISHINGS', title: '', description: '', button_link: '/category/lounge-suite', active: true })
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Mid-Page Promotional Banners */}
          <div className="hm-card">
            <div className="hm-card-header">
              <span>02</span>
              <h3>Mid-Page Promotional Banners</h3>
            </div>

            {/* Promo Banner 1 */}
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Promotional Feature Banner #1 (Main Mid-Page Poster)</h4>
              <div className="hm-field-grid">
                <div className="hm-field-group full-width">
                  <label className="hm-label">Poster Image</label>
                  <div className="hm-uploader-row">
                    <div className="hm-preview-box">
                      {promoBanner1.image ? (
                        <img src={getAssetUrl(promoBanner1.image)} alt="Promo 1" onError={(e) => { e.target.src = 'https://placehold.co/600x300?text=Promo+1' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No Image</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <button
                        type="button"
                        className="hm-upload-btn"
                        onClick={() => promo1FileRef.current?.click()}
                        disabled={uploadingPromo1}
                      >
                        {uploadingPromo1 ? 'Uploading...' : 'Browse Image'}
                      </button>
                      <input
                        ref={promo1FileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUpload(e.target.files[0], 'promo1')
                          }
                        }}
                      />
                      <input
                        type="text"
                        value={promoBanner1.image}
                        onChange={(e) => setPromoBanner1(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Image URL (https://...)"
                        className="hm-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Badge Text</label>
                  <input
                    type="text"
                    value={promoBanner1.badge}
                    onChange={(e) => setPromoBanner1(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. AF WEEKLY SPECIAL"
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Headline Title</label>
                  <input
                    type="text"
                    value={promoBanner1.title}
                    onChange={(e) => setPromoBanner1(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Bring comfort home."
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group full-width">
                  <label className="hm-label">Subtitle Copy</label>
                  <input
                    type="text"
                    value={promoBanner1.subtitle}
                    onChange={(e) => setPromoBanner1(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Explore our latest living-room arrivals with flexible payments."
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Button Label</label>
                  <input
                    type="text"
                    value={promoBanner1.button_text}
                    onChange={(e) => setPromoBanner1(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Shop Living"
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Button Link URL</label>
                  <input
                    type="text"
                    value={promoBanner1.button_link}
                    onChange={(e) => setPromoBanner1(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/category/living"
                    className="hm-input"
                  />
                </div>
              </div>
            </div>

            {/* Promo Banner 2 */}
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Promotional Feature Banner #2 (Secondary Showcase)</h4>
              <div className="hm-field-grid">
                <div className="hm-field-group full-width">
                  <label className="hm-label">Poster Image</label>
                  <div className="hm-uploader-row">
                    <div className="hm-preview-box">
                      {promoBanner2.image ? (
                        <img src={getAssetUrl(promoBanner2.image)} alt="Promo 2" onError={(e) => { e.target.src = 'https://placehold.co/600x300?text=Promo+2' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>No Image</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <button
                        type="button"
                        className="hm-upload-btn"
                        onClick={() => promo2FileRef.current?.click()}
                        disabled={uploadingPromo2}
                      >
                        {uploadingPromo2 ? 'Uploading...' : 'Browse Image'}
                      </button>
                      <input
                        ref={promo2FileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUpload(e.target.files[0], 'promo2')
                          }
                        }}
                      />
                      <input
                        type="text"
                        value={promoBanner2.image}
                        onChange={(e) => setPromoBanner2(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Image URL (https://...)"
                        className="hm-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Badge Text</label>
                  <input
                    type="text"
                    value={promoBanner2.badge}
                    onChange={(e) => setPromoBanner2(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. NEW ARRIVALS"
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Headline Title</label>
                  <input
                    type="text"
                    value={promoBanner2.title}
                    onChange={(e) => setPromoBanner2(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Bedroom &amp; Dining Essentials"
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group full-width">
                  <label className="hm-label">Subtitle Copy</label>
                  <input
                    type="text"
                    value={promoBanner2.subtitle}
                    onChange={(e) => setPromoBanner2(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Premium handcrafted furniture built for New Zealand homes."
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Button Label</label>
                  <input
                    type="text"
                    value={promoBanner2.button_text}
                    onChange={(e) => setPromoBanner2(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Explore Deals"
                    className="hm-input"
                  />
                </div>

                <div className="hm-field-group">
                  <label className="hm-label">Button Link URL</label>
                  <input
                    type="text"
                    value={promoBanner2.button_link}
                    onChange={(e) => setPromoBanner2(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/on-sale"
                    className="hm-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Featured Categories on Homepage */}
          <div className="hm-card">
            <div className="hm-card-header">
              <span>03</span>
              <h3>Featured Categories on Homepage</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Check the product categories below to feature their collections and product grids on the live homepage.
            </p>

            <div className="hm-categories-grid">
              {allCategories.map((cat) => {
                const isChecked = featuredCategoryIds.includes(String(cat.id))
                return (
                  <label key={cat.id} className={`hm-category-check-card ${isChecked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    <strong style={{ fontSize: '0.88rem' }}>{cat.name}</strong>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Sticky Bottom Publish Bar */}
          <div className="hm-submit-bar">
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Save Homepage Configuration?</strong>
              <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>Sliders, promotional posters, and featured categories update live immediately.</span>
            </div>
            <button type="submit" className="hm-save-btn" disabled={saving}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {saving ? 'Publishing Homepage...' : 'Publish Homepage'}
            </button>
          </div>

        </form>
      )}
    </div>
  )
}

export default HomeManager;
