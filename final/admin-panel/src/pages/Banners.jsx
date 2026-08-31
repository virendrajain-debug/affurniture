// ============================================================
// Premium Banners Management Studio
// ============================================================
// Features:
//   - Home Page: 3-Image Slider only (Hero Slide 1, 2, 3)
//   - About Us Page: 1-1-3-1 layout with rich text editor for descriptions
//     - Values 3-grid: ONLY Title & Description (No Subtitle)
//   - Live active thumbnail & explicit 📁 Upload button
//   - Uploaded Media Gallery with Red Cross delete button
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

// Rich Text Editor Component for Banner Descriptions
function RichTextDescriptionEditor({ value, onChange, placeholder = 'Enter formatted description...' }) {
  const [mode, setMode] = useState('visual') // 'visual' | 'code'
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, mode])

  const execCmd = (cmd, arg = null) => {
    if (mode !== 'visual') return
    document.execCommand(cmd, false, arg)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg, #1f2937)', overflow: 'hidden', marginTop: '4px' }}>
      {/* Editor Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '6px 8px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
        <button type="button" onClick={() => execCmd('bold')} style={{ padding: '2px 7px', fontSize: '0.78rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => execCmd('italic')} style={{ padding: '2px 7px', fontSize: '0.78rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Italic"><em>I</em></button>
        <button type="button" onClick={() => execCmd('underline')} style={{ padding: '2px 7px', fontSize: '0.78rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Underline"><u>U</u></button>
        <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Heading 2">H2</button>
        <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Heading 3">H3</button>
        <button type="button" onClick={() => execCmd('formatBlock', '<p>')} style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Paragraph">P</button>
        <button type="button" onClick={() => execCmd('insertUnorderedList')} style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Bullet List">• List</button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Numbered List">1. List</button>
        <button type="button" onClick={() => execCmd('removeFormat')} style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }} title="Clear Formatting">✕</button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: '80px',
          maxHeight: '180px',
          overflowY: 'auto',
          padding: '8px 10px',
          color: 'var(--text-primary)',
          fontSize: '0.82rem',
          lineHeight: 1.45,
          outline: 'none',
        }}
      />
    </div>
  )
}

const PAGE_DEFINITIONS = [
  {
    key: 'home',
    label: 'Home Page (3 Carousel Hero Slides)',
    sections: [
      {
        title: 'Homepage Hero Carousel Slides (3-Column Grid)',
        isGrid: true,
        slots: [
          { key: 'hero_1', name: 'Hero Slide 1 (Green Sofa)', desc: 'First rotating hero slide on the homepage.' },
          { key: 'hero_2', name: 'Hero Slide 2 (Bedroom Suite)', desc: 'Second rotating hero slide on the homepage.' },
          { key: 'hero_3', name: 'Hero Slide 3 (Dining Room)', desc: 'Third rotating hero slide on the homepage.' },
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
        slots: [{ key: 'hero', name: 'Top Hero Banner (1)', desc: 'Large hero header banner at the top of About Us page.', hasSubtitle: true }],
      },
      {
        title: '2. Our Story Feature Section',
        slots: [{ key: 'story', name: 'Our Story Feature Image & Description (1)', desc: 'Image and formatted story description beside the company details.', hasRichDesc: true, hasSubtitle: true }],
      },
      {
        title: '3. Our Values Grid (3-Column Layout - Title & Description Only)',
        isGrid: true,
        slots: [
          { key: 'val_1', name: 'Quality First Card (3)', desc: 'First card in the 3-column values grid.', hasRichDesc: true, noSubtitle: true },
          { key: 'val_2', name: 'Comfort Always Card (3)', desc: 'Second card in the 3-column values grid.', hasRichDesc: true, noSubtitle: true },
          { key: 'val_3', name: 'For Every Home Card (3)', desc: 'Third card in the 3-column values grid.', hasRichDesc: true, noSubtitle: true },
        ],
      },
      {
        title: '4. Showroom Secondary Banner',
        slots: [{ key: 'showroom', name: 'Showroom Secondary Banner (1)', desc: 'Secondary showroom banner with formatted description.', hasRichDesc: true, hasSubtitle: true }],
      },
    ],
  },
  {
    key: 'winz',
    label: 'WinZ Quotes Page (Hero + 3-Column Catalogue Picks)',
    sections: [
      {
        title: 'Top Hero Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for Work and Income quotations guide.', hasSubtitle: true }],
      },
      {
        title: 'Catalogue Picks Grid (3-Column Frontend Layout)',
        isGrid: true,
        slots: [
          { key: 'cat_1', name: 'Catalogue Pick 1 (Haven Sofa)', desc: 'Living room suite catalogue pick.', hasSubtitle: true },
          { key: 'cat_2', name: 'Catalogue Pick 2 (Willow Bedroom)', desc: 'Bedroom suite catalogue pick.', hasSubtitle: true },
          { key: 'cat_3', name: 'Catalogue Pick 3 (Haven Dining)', desc: 'Dining collection catalogue pick.', hasSubtitle: true },
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
          { key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for nationwide logistics.', hasSubtitle: true },
          { key: 'logistics', name: 'Logistics Fleet Photo', desc: 'Delivery truck or warehouse image.', hasSubtitle: true },
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
          { key: 'hero', name: 'Top Hero Banner', desc: 'Hero header banner for Finance page.', hasSubtitle: true },
          { key: 'feature', name: 'Finance Feature Guide Image', desc: 'Feature image for weekly repayment calculator.', hasSubtitle: true },
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
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for 7-day returns policy.', hasSubtitle: true }],
      },
    ],
  },
  {
    key: 'terms',
    label: 'Terms & Conditions Page',
    sections: [
      {
        title: 'Terms of Service Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for terms and warranty clauses.', hasSubtitle: true }],
      },
    ],
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy Page',
    sections: [
      {
        title: 'Privacy Policy Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for customer data privacy.', hasSubtitle: true }],
      },
    ],
  },
  {
    key: 'shop-furniture',
    label: 'Shop Furniture Guide Page',
    sections: [
      {
        title: 'Shop Furniture Header Banner',
        slots: [{ key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for catalog showcase guide.', hasSubtitle: true }],
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
          { key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for contact enquiries.', hasSubtitle: true },
          { key: 'showroom', name: 'Showroom Location Photo', desc: 'Photo of the physical showroom or store entrance.', hasSubtitle: true },
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
          { key: 'hero', name: 'Top Hero Banner', desc: 'Header banner for store locations.', hasSubtitle: true },
          { key: 'auckland_store', name: 'Auckland Showroom Photo', desc: 'Photo of the Auckland showroom floor.', hasSubtitle: true },
          { key: 'wellington_store', name: 'Wellington Showroom Photo', desc: 'Photo of the Wellington showroom floor.', hasSubtitle: true },
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
            title: existingBanner.title || existingBanner.label || slot.name,
            subtitle: existingBanner.subtitle || '',
            description: existingBanner.description || existingBanner.subtitle || '',
            label: existingBanner.label || slot.name,
            cta_text: existingBanner.cta_text || '',
            cta_link: existingBanner.cta_link || '',
            active: existingBanner.active !== undefined ? Number(existingBanner.active) : 1,
            directUrl: '',
          }
        } else {
          drafts[slot.key] = {
            id: null,
            page_key: selectedPage,
            slot: slot.key,
            image: '',
            title: slot.name,
            subtitle: '',
            description: '',
            label: slot.name,
            cta_text: '',
            cta_link: '',
            active: 1,
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
        title: draft.title || '',
        subtitle: draft.subtitle || '',
        description: draft.description || draft.subtitle || '',
        label: draft.label || draft.title || slotKey,
        image: draft.image.trim(),
        cta_text: draft.cta_text || '',
        cta_link: draft.cta_link || '',
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
        showToast('Banner saved & live on website frontend!', 'success')
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
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '14px',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {slot.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {slot.desc}
            </span>
          </div>
        </div>

        {/* Live Active Thumbnail Preview */}
        <div style={{ marginBottom: '14px' }}>
          {draft.image ? (
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: isGridItem ? '140px' : '170px', border: '1px solid var(--border-color)', background: '#000', marginBottom: '8px' }}>
              <img
                src={getAssetUrl(draft.image)}
                alt={draft.title || slot.name}
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
                padding: '22px 14px',
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
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
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
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
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

        {/* Text Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
          {/* Title */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Title / Headline</label>
            <input
              type="text"
              className="form-input"
              value={draft.title || ''}
              onChange={(e) => handleDraftChange(slot.key, 'title', e.target.value)}
              placeholder="e.g. Comfort made for everyday living."
              style={{ fontSize: '0.82rem', padding: '6px 10px' }}
            />
          </div>

          {/* Subtitle (Hidden for Values 3-grid) */}
          {!slot.noSubtitle && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Subtitle / Short Tagline</label>
              <input
                type="text"
                className="form-input"
                value={draft.subtitle || ''}
                onChange={(e) => handleDraftChange(slot.key, 'subtitle', e.target.value)}
                placeholder="e.g. Furniture, beds and appliances..."
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
              />
            </div>
          )}

          {/* Rich Text Description (For About Us Story, Values 3-grid, and Showroom) */}
          {slot.hasRichDesc && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Formatted Description *</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent-color, #d4af37)' }}>Click toolbar to format</span>
              </label>
              <RichTextDescriptionEditor
                value={draft.description || draft.subtitle || ''}
                onChange={(val) => handleDraftChange(slot.key, 'description', val)}
                placeholder="Enter formatted description..."
              />
            </div>
          )}

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSaveSlot(slot.key)}
              disabled={isSavingThis || isUploadingThis}
              style={{ padding: '6px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {isSavingThis ? 'Saving...' : 'Save Banner'}
            </button>
          </div>
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
          Managing <strong>{currentPageDef.label.split(' (')[0]}</strong> banners
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
