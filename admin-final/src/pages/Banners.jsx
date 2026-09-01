// ============================================================
// Premium Banners Management Studio (Strictly Banners & Media Only)
// ============================================================
// Features:
//   - ZERO text inputs (all text editing is in the Pages module)
//   - Clean graphic management for every banner slot across all pages
//   - Live active thumbnail preview & remove option
//   - Explicit 📁 Upload Image button
//   - Direct Image URL input with "Set URL"
//   - Previously Uploaded Media Gallery with Red Cross delete button
//   - Single "Save Banner" button per slot
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

const PAGE_DEFINITIONS = [
  {
    key: 'home',
    label: 'Home Page (3 Carousel Hero Slides)',
    sections: [
      {
        title: 'Homepage Hero Carousel Slides (3-Column Grid)',
        isGrid: true,
        slots: [
          { key: 'hero_1', name: 'Hero Slide 1 (Green Sofa)', desc: 'First rotating hero slide on homepage.' },
          { key: 'hero_2', name: 'Hero Slide 2 (Bedroom Suite)', desc: 'Second rotating hero slide on homepage.' },
          { key: 'hero_3', name: 'Hero Slide 3 (Dining Room)', desc: 'Third rotating hero slide on homepage.' },
        ],
      },
    ],
  },
  {
    key: 'about',
    label: 'About Us Page (6 Banners / 1-1-3-1 Layout)',
    sections: [
      {
        title: '1. Top Hero Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Header Banner (1)', desc: 'Large hero header banner at top of About Us page.' }],
      },
      {
        title: '2. Our Story Feature Section',
        slots: [{ key: 'story', name: 'Our Story Feature Graphic (1)', desc: 'Feature image displayed beside the company story.' }],
      },
      {
        title: '3. Our Values Grid (3-Column Graphics)',
        isGrid: true,
        slots: [
          { key: 'val_1', name: 'Quality First Card Graphic (3)', desc: 'Graphic for 1st value card.' },
          { key: 'val_2', name: 'Comfort Always Card Graphic (3)', desc: 'Graphic for 2nd value card.' },
          { key: 'val_3', name: 'For Every Home Card Graphic (3)', desc: 'Graphic for 3rd value card.' },
        ],
      },
      {
        title: '4. Showroom Showcase Banner',
        slots: [{ key: 'showroom', name: 'Showroom Showcase Banner (1)', desc: 'Showroom interior photograph or showcase banner.' }],
      },
    ],
  },
  {
    key: 'winz',
    label: 'WinZ Quotes Page (Hero + 3-Column Catalogue Picks)',
    sections: [
      {
        title: 'Top Hero Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for Work and Income quotations guide.' }],
      },
      {
        title: 'Catalogue Picks Grid (3-Column Graphics)',
        isGrid: true,
        slots: [
          { key: 'cat_1', name: 'Catalogue Pick 1 Graphic (Haven Sofa)', desc: 'Living room suite catalogue pick.' },
          { key: 'cat_2', name: 'Catalogue Pick 2 Graphic (Willow Bedroom)', desc: 'Bedroom suite catalogue pick.' },
          { key: 'cat_3', name: 'Catalogue Pick 3 Graphic (Haven Dining)', desc: 'Dining collection catalogue pick.' },
        ],
      },
    ],
  },
  {
    key: 'delivery-info',
    label: 'Delivery Information Page',
    sections: [
      {
        title: 'Delivery & Logistics Layout',
        slots: [
          { key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for nationwide logistics.' },
          { key: 'logistics', name: 'Logistics Fleet Photo', desc: 'Delivery truck or warehouse image.' },
        ],
      },
    ],
  },
  {
    key: 'finance',
    label: 'Finance Guide Page',
    sections: [
      {
        title: 'Finance Guide Layout',
        slots: [
          { key: 'hero', name: 'Top Hero Banner', desc: 'Hero header banner for Finance page.' },
          { key: 'feature', name: 'Finance Feature Guide Image', desc: 'Feature image for weekly repayment calculator.' },
        ],
      },
    ],
  },
  {
    key: 'returns',
    label: 'Returns & Refund Policy Page',
    sections: [
      {
        title: 'Returns Policy Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for 7-day returns policy.' }],
      },
    ],
  },
  {
    key: 'terms',
    label: 'Terms & Conditions Page',
    sections: [
      {
        title: 'Terms of Service Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for terms and warranty clauses.' }],
      },
    ],
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy Page',
    sections: [
      {
        title: 'Privacy Policy Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for customer data privacy.' }],
      },
    ],
  },
  {
    key: 'shop-furniture',
    label: 'Shop Furniture Guide Page',
    sections: [
      {
        title: 'Shop Furniture Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for catalog showcase guide.' }],
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact Us Page',
    sections: [
      {
        title: 'Contact Header & Showroom Location',
        slots: [
          { key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for contact enquiries.' },
          { key: 'showroom', name: 'Showroom Location Photo', desc: 'Photo of the physical showroom or store entrance.' },
        ],
      },
    ],
  },
  {
    key: 'store-locations',
    label: 'Store Locations & Showrooms',
    sections: [
      {
        title: 'Store Locations Header & Showrooms',
        slots: [
          { key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for store locations.' },
          { key: 'auckland_store', name: 'Auckland Showroom Photo', desc: 'Photo of the Auckland showroom floor.' },
          { key: 'wellington_store', name: 'Wellington Showroom Photo', desc: 'Photo of the Wellington showroom floor.' },
        ],
      },
    ],
  },
]

function Banners({ token }) {
  const [selectedPage, setSelectedPage] = useState('home')
  const [banners, setBanners] = useState([])
  const [mediaGallery, setMediaGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingSlot, setSavingSlot] = useState(null)
  const [uploadingSlot, setUploadingSlot] = useState(null)
  const [showGalleryFor, setShowGalleryFor] = useState(null)
  const [toast, setToast] = useState(null)

  const [slotDrafts, setSlotDrafts] = useState({})
  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Fetch all banners from DB
  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/page-banners`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setBanners(data)
      }
    } catch {
      showToast('Failed to load banners from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Media Gallery
  const fetchMediaGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/media-gallery`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setMediaGallery(data)
      }
    } catch {}
  }

  useEffect(() => {
    fetchBanners()
    fetchMediaGallery()
  }, [])

  // Sync draft states
  useEffect(() => {
    const pageDef = PAGE_DEFINITIONS.find(p => p.key === selectedPage) || PAGE_DEFINITIONS[0]
    const drafts = {}

    pageDef.sections.forEach(sec => {
      sec.slots.forEach(slot => {
        const existingBanner = banners.find(b => b.page_key === selectedPage && b.slot === slot.key)

        if (existingBanner) {
          drafts[slot.key] = {
            id: existingBanner.id,
            page_key: selectedPage,
            slot: slot.key,
            image: existingBanner.image || '',
            directUrl: '',
          }
        } else {
          drafts[slot.key] = {
            id: null,
            page_key: selectedPage,
            slot: slot.key,
            image: '',
            directUrl: '',
          }
        }
      })
    })

    setSlotDrafts(drafts)
  }, [selectedPage, banners])

  const handleDraftChange = (slotKey, field, value) => {
    setSlotDrafts(prev => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        [field]: value,
      },
    }))
  }

  const handleUploadForSlot = async (slotKey, file) => {
    if (!file) return
    setUploadingSlot(slotKey)

    const previewUrl = URL.createObjectURL(file)
    handleDraftChange(slotKey, 'image', previewUrl)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('file', file)

    try {
      const uploadRes = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })

      if (uploadRes.ok) {
        const d = await uploadRes.json()
        const serverUrl = d.url || d.imageUrl || d.image_url
        if (serverUrl) {
          handleDraftChange(slotKey, 'image', serverUrl)
          showToast('Image uploaded! Click "Save Banner" to publish.', 'success')
          fetchMediaGallery()
        }
      } else {
        showToast('Image upload failed on server. You can also paste direct URL.', 'warning')
      }
    } catch {
      showToast('Image upload connection error', 'error')
    } finally {
      setUploadingSlot(null)
    }
  }

  const handleDeleteGalleryItem = async (e, item) => {
    e.stopPropagation()
    if (!window.confirm('Delete this image from the gallery?')) return

    try {
      const res = await fetch(`${API_BASE}/api/media-gallery/${encodeURIComponent(item.id || item.filename)}?url=${encodeURIComponent(item.url)}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Image removed from gallery', 'info')
        fetchMediaGallery()
      }
    } catch {
      showToast('Failed to delete image', 'error')
    }
  }

  const handleSaveSlot = async (slotKey) => {
    const draft = slotDrafts[slotKey]
    if (!draft) return
    if (!draft.image || !draft.image.trim()) {
      return showToast('Please upload or enter an image URL for this banner', 'warning')
    }

    setSavingSlot(slotKey)
    try {
      const payload = {
        page_key: selectedPage,
        slot: slotKey,
        image: draft.image.trim(),
        active: 1,
        sort_order: 0,
      }

      const res = await fetch(`${API_BASE}/api/page-banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('Banner graphic saved & live on website frontend!', 'success')
        fetchBanners()
        fetchMediaGallery()
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to save banner', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSavingSlot(null)
    }
  }

  const currentPageDef = PAGE_DEFINITIONS.find(p => p.key === selectedPage) || PAGE_DEFINITIONS[0]

  const renderBannerCard = (slot, isGridItem = false) => {
    const draft = slotDrafts[slot.key] || {}
    const isSavingThis = savingSlot === slot.key
    const isUploadingThis = uploadingSlot === slot.key
    const fileInputId = `file-input-${slot.key}`
    const isGalleryOpen = showGalleryFor === slot.key

    return (
      <div
        key={slot.key}
        className="admin-card"
        style={{
          padding: '18px',
          border: '1px solid var(--border-color)',
          background: 'var(--card-bg, #1f2937)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'none',
        }}
      >
        {/* Header with Slot Name & Description */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '12px',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {slot.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {slot.desc}
            </span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSaveSlot(slot.key)}
            disabled={isSavingThis || isUploadingThis}
            style={{ padding: '5px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {isSavingThis ? 'Saving...' : 'Save Banner'}
          </button>
        </div>

        {/* Live Active Thumbnail Preview */}
        <div style={{ marginBottom: '10px' }}>
          {draft.image ? (
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: isGridItem ? '160px' : '200px', border: '1px solid var(--border-color)', background: '#000', marginBottom: '8px' }}>
              <img
                src={getAssetUrl(draft.image)}
                alt={slot.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://placehold.co/800x300?text=Banner+Image' }}
              />
              <button
                type="button"
                onClick={() => handleDraftChange(slot.key, 'image', '')}
                style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.9rem' }}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById(fileInputId)?.click()}
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '24px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                marginBottom: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 4px', display: 'block', color: 'var(--text-secondary)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>
                {isUploadingThis ? 'Uploading image...' : 'Click to upload image'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-color, #d4af37)', marginTop: '2px', display: 'block' }}>
                + Upload (PNG, JPG, WebP)
              </span>
            </div>
          )}

          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { if (e.target.files[0]) handleUploadForSlot(slot.key, e.target.files[0]); }}
          />

          {/* Action Row: Upload Button + Direct URL input + Gallery button */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => document.getElementById(fileInputId)?.click()}
              style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--accent-color, #d4af37)', color: '#000', fontWeight: 600 }}
            >
              {isUploadingThis ? 'Uploading...' : '📁 Upload'}
            </button>
            <input
              type="text"
              className="form-input"
              placeholder="Or paste direct image URL (https://...)"
              value={draft.directUrl || ''}
              onChange={(e) => handleDraftChange(slot.key, 'directUrl', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (draft.directUrl?.trim()) {
                    handleDraftChange(slot.key, 'image', draft.directUrl.trim())
                    handleDraftChange(slot.key, 'directUrl', '')
                    showToast('Image URL set! Click "Save Banner" to publish.', 'info')
                  }
                }
              }}
              style={{ flex: 1, fontSize: '0.78rem', padding: '5px 8px' }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (draft.directUrl?.trim()) {
                  handleDraftChange(slot.key, 'image', draft.directUrl.trim())
                  handleDraftChange(slot.key, 'directUrl', '')
                  showToast('Image URL set! Click "Save Banner" to publish.', 'info')
                }
              }}
              style={{ padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              Set URL
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowGalleryFor(isGalleryOpen ? null : slot.key)}
              style={{ padding: '5px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap', background: isGalleryOpen ? 'var(--accent-color, #d4af37)' : undefined, color: isGalleryOpen ? '#000' : undefined }}
              title="Open uploaded media gallery"
            >
              🖼 Gallery
            </button>
          </div>

          {/* Uploaded Gallery Grid with Cross Deletion */}
          {isGalleryOpen && (
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color, #d4af37)', textTransform: 'uppercase' }}>
                  Select from Uploaded Gallery ({mediaGallery.length}):
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Click image to select • Click &times; to delete</span>
              </div>

              {mediaGallery.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  No uploaded images found in gallery yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                  {mediaGallery.map((item, mIdx) => (
                    <div
                      key={item.id || mIdx}
                      onClick={() => {
                        handleDraftChange(slot.key, 'image', item.url)
                        showToast('Selected image from gallery! Click "Save Banner" to publish.', 'info')
                      }}
                      style={{
                        position: 'relative',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: draft.image === item.url ? '2px solid var(--accent-color, #d4af37)' : '1px solid var(--border-color)',
                        background: '#000',
                      }}
                      title={item.filename || 'Click to select'}
                    >
                      <img
                        src={getAssetUrl(item.url)}
                        alt={item.filename || 'Gallery item'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=IMG' }}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleDeleteGalleryItem(e, item)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                        title="Delete permanently from gallery"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Top Filter Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Target Page:
          </label>
          <select
            className="filter-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            style={{ minWidth: '320px', fontWeight: 600 }}
          >
            {PAGE_DEFINITIONS.map(opt => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Managing <strong>{currentPageDef.label.split(' (')[0]}</strong> banner graphics
        </span>
      </div>

      {/* Grid Layout Cards */}
      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading active banners for {currentPageDef.label}...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {currentPageDef.sections.map((sec, sIdx) => (
            <div key={sIdx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color, #d4af37)' }} />
                <h3 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {sec.title}
                </h3>
              </div>

              {sec.isGrid ? (
                /* 3-Column Grid Layout */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {sec.slots.map(slot => renderBannerCard(slot, true))}
                </div>
              ) : (
                /* Single Full-Width Banner Cards */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sec.slots.map(slot => renderBannerCard(slot, false))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Banners;
