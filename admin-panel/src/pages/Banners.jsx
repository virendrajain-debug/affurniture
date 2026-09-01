import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

const PAGE_DEFINITIONS = [
  {
    key: 'home',
    label: 'Home Page — 3 Hero Carousel Slides',
    sections: [{
      title: 'Hero Carousel Slides',
      isGrid: true,
      slots: [
        { key: 'hero_1', name: 'Hero Slide 1', desc: 'First slide shown in homepage carousel.' },
        { key: 'hero_2', name: 'Hero Slide 2', desc: 'Second slide shown in homepage carousel.' },
        { key: 'hero_3', name: 'Hero Slide 3', desc: 'Third slide shown in homepage carousel.' },
      ],
    }],
  },
  {
    key: 'about',
    label: 'About Us Page — 6 Banner Slots',
    sections: [
      { title: 'Section 1 · Top Hero Header', slots: [{ key: 'hero', name: 'Hero Header Banner', desc: 'Full-width hero image at top of About Us page.' }] },
      { title: 'Section 2 · Our Story Feature Image', slots: [{ key: 'story', name: 'Story Feature Image', desc: 'Image shown beside the company story text.' }] },
      { title: 'Section 3 · Our Values 3-Grid', isGrid: true, slots: [
        { key: 'val_1', name: 'Value Card 1 Image', desc: 'Image for first values card (Quality First).' },
        { key: 'val_2', name: 'Value Card 2 Image', desc: 'Image for second values card (Comfort Always).' },
        { key: 'val_3', name: 'Value Card 3 Image', desc: 'Image for third values card (For Every Home).' },
      ]},
      { title: 'Section 4 · Showroom Banner', slots: [{ key: 'showroom', name: 'Showroom Showcase Banner', desc: 'Interior showroom photo at the bottom of About Us.' }] },
    ],
  },
  {
    key: 'winz',
    label: 'WinZ Quotes Page — Hero + 3 Catalogue Picks',
    sections: [
      { title: 'Top Hero Banner', slots: [{ key: 'hero', name: 'Hero Banner', desc: 'WinZ page hero header image.' }] },
      { title: 'Catalogue Pick Graphics', isGrid: true, slots: [
        { key: 'cat_1', name: 'Catalogue Pick 1', desc: 'Sofa / lounge suite image.' },
        { key: 'cat_2', name: 'Catalogue Pick 2', desc: 'Bedroom suite image.' },
        { key: 'cat_3', name: 'Catalogue Pick 3', desc: 'Dining suite image.' },
      ]},
    ],
  },
  { key: 'delivery-info', label: 'Delivery Information Page', sections: [{ title: 'Page Banners', slots: [
    { key: 'hero', name: 'Hero Header Banner', desc: 'Delivery page top hero image.' },
    { key: 'logistics', name: 'Logistics / Fleet Image', desc: 'Secondary logistics or truck photo.' },
  ]}]},
  { key: 'finance', label: 'Finance Guide Page', sections: [{ title: 'Page Banners', slots: [
    { key: 'hero', name: 'Hero Header Banner', desc: 'Finance guide hero image.' },
    { key: 'feature', name: 'Finance Feature Image', desc: 'Secondary feature image for calculator section.' },
  ]}]},
  { key: 'returns', label: 'Returns & Refund Policy', sections: [{ title: 'Hero Banner', slots: [{ key: 'hero', name: 'Hero Header Banner', desc: 'Returns policy hero image.' }] }]},
  { key: 'terms', label: 'Terms & Conditions', sections: [{ title: 'Hero Banner', slots: [{ key: 'hero', name: 'Hero Header Banner', desc: 'Terms page hero image.' }] }]},
  { key: 'privacy-policy', label: 'Privacy Policy', sections: [{ title: 'Hero Banner', slots: [{ key: 'hero', name: 'Hero Header Banner', desc: 'Privacy policy hero image.' }] }]},
  { key: 'shop-furniture', label: 'Shop Furniture Guide', sections: [{ title: 'Hero Banner', slots: [{ key: 'hero', name: 'Hero Header Banner', desc: 'Shop furniture guide hero image.' }] }]},
  { key: 'contact', label: 'Contact Us Page', sections: [{ title: 'Page Banners', slots: [
    { key: 'hero', name: 'Hero Header Banner', desc: 'Contact page hero image.' },
    { key: 'showroom', name: 'Showroom Location Photo', desc: 'Physical store entrance photo.' },
  ]}]},
  { key: 'store-locations', label: 'Store Locations & Showrooms', sections: [{ title: 'Page Banners', slots: [
    { key: 'hero', name: 'Hero Header Banner', desc: 'Store locations hero image.' },
    { key: 'auckland_store', name: 'Auckland Showroom Photo', desc: 'Auckland showroom floor photo.' },
    { key: 'wellington_store', name: 'Wellington Showroom Photo', desc: 'Wellington showroom floor photo.' },
  ]}]},
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

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/page-banners?page_key=${selectedPage}`)
      if (res.ok) { const d = await res.json(); if (Array.isArray(d)) setBanners(d) }
    } catch {}
    setLoading(false)
  }

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/media-gallery`)
      if (res.ok) { const d = await res.json(); if (Array.isArray(d)) setMediaGallery(d) }
    } catch {}
  }

  useEffect(() => { fetchBanners(); fetchGallery() }, [selectedPage])

  useEffect(() => {
    const pageDef = PAGE_DEFINITIONS.find(p => p.key === selectedPage)
    const drafts = {}
    pageDef?.sections.forEach(sec => {
      sec.slots.forEach(slot => {
        const live = banners.find(b => b.page_key === selectedPage && b.slot === slot.key && b.image)
        drafts[slot.key] = { page_key: selectedPage, slot: slot.key, image: live?.image || '', directUrl: '' }
      })
    })
    setSlotDrafts(drafts)
  }, [selectedPage, banners])

  const setDraft = (slotKey, field, value) =>
    setSlotDrafts(prev => ({ ...prev, [slotKey]: { ...prev[slotKey], [field]: value } }))

  const handleUpload = async (slotKey, file) => {
    if (!file) return
    setUploadingSlot(slotKey)
    setDraft(slotKey, 'image', URL.createObjectURL(file))
    const fd = new FormData(); fd.append('image', file); fd.append('file', file)
    try {
      const r = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}, body: fd })
      if (r.ok) { const d = await r.json(); const url = d.url || d.imageUrl || d.image_url; if (url) { setDraft(slotKey, 'image', url); showToast('Uploaded! Click Save Banner to go live.', 'success'); fetchGallery() } }
      else showToast('Upload failed. Paste a direct URL instead.', 'warning')
    } catch { showToast('Upload connection error. Paste a direct URL instead.', 'warning') }
    finally { setUploadingSlot(null) }
  }

  const handleSave = async (slotKey) => {
    const draft = slotDrafts[slotKey]
    if (!draft?.image?.trim()) return showToast('Upload or paste an image URL first.', 'warning')
    setSavingSlot(slotKey)
    try {
      const r = await fetch(`${API_BASE}/api/page-banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({ page_key: selectedPage, slot: slotKey, label: slotKey, title: slotKey, subtitle: '', description: '', cta_text: '', cta_link: '', image: draft.image.trim(), active: 1, sort_order: 0 }),
      })
      showToast(r.ok ? 'Banner saved & live on website!' : 'Saved (minor server note — check backend logs)', r.ok ? 'success' : 'warning')
      fetchBanners(); fetchGallery()
    } catch { showToast('Connection error saving banner.', 'error') }
    finally { setSavingSlot(null) }
  }

  const handleDeleteGallery = async (e, item) => {
    e.stopPropagation()
    if (!window.confirm('Delete this image from the gallery?')) return
    try {
      const r = await fetch(`${API_BASE}/api/media-gallery/${encodeURIComponent(item.id || item.filename)}?url=${encodeURIComponent(item.url)}`, { method: 'DELETE', headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} })
      if (r.ok) { showToast('Deleted from gallery', 'info'); fetchGallery() }
    } catch { showToast('Failed to delete', 'error') }
  }

  const currentPageDef = PAGE_DEFINITIONS.find(p => p.key === selectedPage)

  const BannerCard = ({ slot, isGrid }) => {
    const draft = slotDrafts[slot.key] || {}
    const isSaving = savingSlot === slot.key
    const isUploading = uploadingSlot === slot.key
    const inputId = `file-${slot.key}`
    const galleryOpen = showGalleryFor === slot.key

    return (
      <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--card-bg, #1f2937)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Card header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{slot.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{slot.desc}</div>
          </div>
          <button
            onClick={() => handleSave(slot.key)}
            disabled={isSaving || isUploading}
            style={{ padding: '5px 14px', fontSize: '0.78rem', background: 'var(--accent-color,#d4af37)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {isSaving ? 'Saving…' : '✓ Save Banner'}
          </button>
        </div>

        {/* Thumbnail */}
        {draft.image ? (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: isGrid ? '150px' : '190px', background: '#000' }}>
            <img src={getAssetUrl(draft.image)} alt={slot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://placehold.co/800x300?text=Banner' }} />
            <button onClick={() => setDraft(slot.key, 'image', '')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: '4px', width: 24, height: 24, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
          </div>
        ) : (
          <div onClick={() => document.getElementById(inputId)?.click()} style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '28px 12px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{isUploading ? 'Uploading…' : 'Click to upload'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-color,#d4af37)', marginTop: 4 }}>PNG · JPG · WebP</div>
          </div>
        )}

        <input id={inputId} type="file" accept="image/*" hidden onChange={e => { if (e.target.files[0]) handleUpload(slot.key, e.target.files[0]) }} />

        {/* URL row + gallery */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={() => document.getElementById(inputId)?.click()} style={{ padding: '5px 10px', fontSize: '0.78rem', background: 'var(--accent-color,#d4af37)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {isUploading ? '…' : '📁 Upload'}
          </button>
          <input
            type="text"
            className="form-input"
            placeholder="Or paste image URL (https://…)"
            value={draft.directUrl || ''}
            onChange={e => setDraft(slot.key, 'directUrl', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && draft.directUrl?.trim()) { setDraft(slot.key, 'image', draft.directUrl.trim()); setDraft(slot.key, 'directUrl', '') } }}
            style={{ flex: 1, fontSize: '0.78rem', padding: '5px 8px' }}
          />
          <button onClick={() => { if (draft.directUrl?.trim()) { setDraft(slot.key, 'image', draft.directUrl.trim()); setDraft(slot.key, 'directUrl', '') } }} style={{ padding: '5px 10px', fontSize: '0.78rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Set</button>
          <button onClick={() => setShowGalleryFor(galleryOpen ? null : slot.key)} style={{ padding: '5px 10px', fontSize: '0.78rem', background: galleryOpen ? 'var(--accent-color,#d4af37)' : 'var(--hover-bg)', color: galleryOpen ? '#000' : 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>🖼 Gallery</button>
        </div>

        {/* Gallery grid */}
        {galleryOpen && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--accent-color,#d4af37)', fontWeight: 700, marginBottom: 8 }}>Uploaded Gallery ({mediaGallery.length}) — Click to select · × to delete</div>
            {mediaGallery.length === 0
              ? <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>No images uploaded yet.</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 6, maxHeight: 130, overflowY: 'auto' }}>
                  {mediaGallery.map((item, idx) => (
                    <div key={item.id || idx} onClick={() => { setDraft(slot.key, 'image', item.url); showToast('Selected! Click Save Banner to go live.', 'info') }} style={{ position: 'relative', height: 52, borderRadius: 5, overflow: 'hidden', cursor: 'pointer', border: draft.image === item.url ? '2px solid var(--accent-color,#d4af37)' : '1px solid var(--border-color)' }}>
                      <img src={getAssetUrl(item.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://placehold.co/80x80?text=IMG' }} />
                      <button onClick={e => handleDeleteGallery(e, item)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: 3, width: 16, height: 16, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="admin-page" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Toolbar */}
      <div style={{ background: 'var(--sidebar-bg,#111827)', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Page:</label>
          <select className="filter-select" value={selectedPage} onChange={e => setSelectedPage(e.target.value)} style={{ minWidth: 320, fontWeight: 600 }}>
            {PAGE_DEFINITIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload images only — texts are managed under <strong>Pages</strong></span>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading live banners…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {currentPageDef?.sections.map((sec, sIdx) => (
            <div key={sIdx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-color,#d4af37)', flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{sec.title}</h3>
              </div>
              {sec.isGrid ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px,1fr))', gap: 14 }}>
                  {sec.slots.map(slot => <BannerCard key={slot.key} slot={slot} isGrid />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {sec.slots.map(slot => <BannerCard key={slot.key} slot={slot} />)}
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
