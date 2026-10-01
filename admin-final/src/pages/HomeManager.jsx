import React, { useState, useEffect, useRef, useCallback } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

const DEFAULT_SLIDE = { image: '', tagline: 'AF FURNISHINGS', title: '', description: '', button_link: '/category/lounge-suite', active: true }
const DEFAULT_PROMO = { image: '', badge: 'AF WEEKLY SPECIAL', title: '', subtitle: '', button_text: '', button_link: '' }
const DEFAULT_CARDS = [
  { icon: 'delivery', title: 'NZ Wide Delivery', description: 'Fast and reliable delivery to your doorstep anywhere in New Zealand.' },
  { icon: 'payment', title: 'Easy Weekly Payment Plans', description: 'Spread the cost with simple weekly instalments that suit your budget.' },
  { icon: 'shield', title: 'Interest-Free Available', description: 'Enjoy flexible finance options with interest-free payment plans.' },
]
const ICON_OPTIONS = [
  { value: 'delivery', label: 'Delivery Truck' },
  { value: 'payment', label: 'Payment' },
  { value: 'shield', label: 'Shield' },
]

/* ── Shared sub-components (OUTSIDE parent to avoid remount on keystroke) ── */

const Section = ({ num, id, title, collapsed, toggle, children }) => (
  <div style={S.card}>
    <div style={S.cardHead} onClick={() => toggle(id)}>
      <span style={S.sectionNum}>{String(num).padStart(2, '0')}</span>
      <h3 style={S.sectionTitle}>{title}</h3>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ marginLeft: 'auto', transition: 'transform .2s', transform: collapsed ? 'rotate(-90deg)' : 'none' }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
    {!collapsed && <div>{children}</div>}
  </div>
)

const Input = ({ label, value, onChange, placeholder, full, type = 'text' }) => (
  <div style={{ ...S.field, ...(full ? { gridColumn: '1/-1' } : {}) }}>
    <label style={S.label}>{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={S.input}
    />
  </div>
)

const ImageUploader = ({ label, value, onChange, fileRef, uploading, uploadFn, sizeHint }) => (
  <div>
    <label style={S.label}>{label || 'Image'}</label>
    <div style={S.uploadRow}>
      <div style={S.previewBox}>
        {value
          ? <img src={getAssetUrl(value)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://placehold.co/300x180?text=Image' }} />
          : <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>No Image</span>}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button type="button" style={S.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Browse Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { if (e.target.files?.[0]) uploadFn(e.target.files[0], onChange) }} />
        {sizeHint && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #888)' }}>Recommended: {sizeHint}</span>}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Image URL (https://...)"
          style={S.input}
        />
      </div>
    </div>
  </div>
)

const SlideCard = ({ slide, idx, onEdit, onDelete, onToggle }) => (
  <div style={S.slideItem}>
    <div style={S.slideThumb}>
      <img src={getAssetUrl(slide.image)} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://placehold.co/300x180?text=Slide' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={S.slideTitle}>{slide.title || 'Untitled'}</div>
      <div style={S.slideMeta}>{slide.tagline || 'AF FURNISHINGS'} &bull; {slide.button_link || '/'}</div>
    </div>
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <button type="button" style={slide.active !== false ? S.badgeActive : S.badgeHidden} onClick={() => onToggle(idx)}>
        {slide.active !== false ? 'Active' : 'Hidden'}
      </button>
      <button type="button" style={S.smBtn} onClick={() => onEdit(idx)}>Edit</button>
      <button type="button" style={{ ...S.smBtn, color: '#ef4444' }} onClick={() => onDelete(idx)}>Delete</button>
    </div>
  </div>
)

const PromoForm = ({ label, banner, setBanner, fileRef, uploading, uploadFn }) => (
  <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-color, #e5e1d8)' }}>
    <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: 'var(--text-primary, #28241f)' }}>{label}</h4>
    <div style={S.grid}>
      <ImageUploader value={banner.image} onChange={url => setBanner(prev => ({ ...prev, image: url }))} fileRef={fileRef} uploading={!!uploading} uploadFn={uploadFn} sizeHint="1440 x 400 pixels" />
      <Input label="Badge Text" value={banner.badge} onChange={v => setBanner(prev => ({ ...prev, badge: v }))} placeholder="e.g. AF WEEKLY SPECIAL" />
      <Input label="Title" value={banner.title} onChange={v => setBanner(prev => ({ ...prev, title: v }))} placeholder="e.g. Bring comfort home." />
      <Input label="Subtitle" value={banner.subtitle} onChange={v => setBanner(prev => ({ ...prev, subtitle: v }))} full placeholder="Subtitle copy..." />
      <Input label="Button Text" value={banner.button_text} onChange={v => setBanner(prev => ({ ...prev, button_text: v }))} placeholder="Shop Living" />
      <Input label="Button Link" value={banner.button_link} onChange={v => setBanner(prev => ({ ...prev, button_link: v }))} placeholder="/category/living" />
    </div>
  </div>
)

/* ── Main component ── */

function HomeManager({ token }) {
  const [heroSlides, setHeroSlides] = useState([])
  const [promoBanner1, setPromoBanner1] = useState(DEFAULT_PROMO)
  const [dealsTitle, setDealsTitle] = useState('Limited-Time Weekly Deals')
  const [dealsSubtitle, setDealsSubtitle] = useState('Comfortable furniture at straightforward prices.')
  const [dealsCards, setDealsCards] = useState(DEFAULT_CARDS)
  const [aboutForm, setAboutForm] = useState({
    company_name: 'AF Furnishings',
    tagline: 'Quality furniture for every New Zealand home',
    description: '',
    image_1: '',
    image_2: '',
    address: '',
    phone: '',
    email: '',
  })
  const [editingSlide, setEditingSlide] = useState(null)
  const [slideDraft, setSlideDraft] = useState({ ...DEFAULT_SLIDE })
  const [collapsed, setCollapsed] = useState({ hero: false, promo: false, deals: false, about: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  const slideFileRef = useRef(null)
  const promo1FileRef = useRef(null)
  const aboutImg1Ref = useRef(null)
  const aboutImg2Ref = useRef(null)
  const authToken = getAuthToken(token)

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const toggle = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  const headers = { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [homeRes, dealsRes, aboutRes] = await Promise.all([
          fetch(`${API_BASE}/api/homepage`),
          fetch(`${API_BASE}/api/deals`),
          fetch(`${API_BASE}/api/about`, { cache: 'no-store' }),
        ])
        if (homeRes.ok) {
          const d = await homeRes.json()
          if (Array.isArray(d.hero_slides)) setHeroSlides(d.hero_slides)
          if (d.promo_banner_1) setPromoBanner1(prev => ({ ...prev, ...d.promo_banner_1 }))
        }
        if (dealsRes.ok) {
          const d = await dealsRes.json()
          if (d.title) setDealsTitle(d.title)
          if (d.subtitle) setDealsSubtitle(d.subtitle)
          if (Array.isArray(d.cards)) setDealsCards(d.cards)
        }
        if (aboutRes.ok) {
          const d = await aboutRes.json()
          if (d && typeof d === 'object' && d.id) {
            setAboutForm(prev => ({
              ...prev,
              company_name: d.company_name || prev.company_name,
              tagline: d.tagline || prev.tagline,
              description: d.description || prev.description,
              image_1: d.image_1 || prev.image_1,
              image_2: d.image_2 || prev.image_2,
              address: d.address || prev.address,
              phone: d.phone || prev.phone,
              email: d.email || prev.email,
            }))
          }
        }
      } catch { addToast('Failed to load homepage data', 'error') }
      setLoading(false)
    })()
  }, [])

  const [uploadingField, setUploadingField] = useState(null)

  const uploadImage = async (file, onSuccess) => {
    setUploadingField(file.name)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: fd,
      })
      if (res.ok) {
        const d = await res.json()
        const url = d.url || d.imageUrl || d.image_url || d.secure_url
        if (url) { onSuccess(url); addToast('Image uploaded!', 'success'); setUploadingField(null); return }
      }
      addToast('Upload failed', 'error')
    } catch { addToast('Upload error', 'error') }
    setUploadingField(null)
  }

  const startEditSlide = (idx) => {
    setEditingSlide(idx)
    setSlideDraft({ ...heroSlides[idx] })
  }

  const cancelSlideEdit = () => { setEditingSlide(null); setSlideDraft({ ...DEFAULT_SLIDE }) }

  const saveSlide = () => {
    if (!slideDraft.title && !slideDraft.image) { addToast('Need at least a title or image', 'error'); return }
    if (editingSlide !== null) {
      const updated = [...heroSlides]; updated[editingSlide] = { ...slideDraft }; setHeroSlides(updated)
      addToast('Slide updated', 'success')
    } else {
      if (heroSlides.length >= 5) { addToast('Max 5 slides', 'error'); return }
      setHeroSlides(prev => [...prev, { ...slideDraft, id: Date.now() }])
      addToast('Slide added', 'success')
    }
    setEditingSlide(null); setSlideDraft({ ...DEFAULT_SLIDE })
  }

  const deleteSlide = (idx) => {
    if (heroSlides.length <= 1) { addToast('Keep at least one slide', 'info'); return }
    setHeroSlides(prev => prev.filter((_, i) => i !== idx))
    addToast('Slide removed', 'info')
  }

  const toggleSlide = (idx) => {
    setHeroSlides(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s))
  }

  const updateCard = (idx, field, value) => {
    setDealsCards(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('[HomeManager] Saving with token:', authToken ? authToken.substring(0, 20) + '...' : 'NO TOKEN')
      console.log('[HomeManager] Hero slides:', heroSlides.length, 'Promo1:', promoBanner1.title)
      
      const [dealsRes, homeRes, aboutRes] = await Promise.all([
        fetch(`${API_BASE}/api/deals`, {
          method: 'PUT', headers,
          body: JSON.stringify({ title: dealsTitle, subtitle: dealsSubtitle, cards: dealsCards }),
        }),
        fetch(`${API_BASE}/api/homepage`, {
          method: 'PUT', headers,
          body: JSON.stringify({ hero_slides: heroSlides, promo_banner_1: promoBanner1 }),
        }),
        fetch(`${API_BASE}/api/about`, {
          method: 'PUT', headers,
          body: JSON.stringify(aboutForm),
        }),
      ])
      
      const dealsBody = await dealsRes.json().catch(() => ({}))
      const homeBody = await homeRes.json().catch(() => ({}))
      const aboutBody = await aboutRes.json().catch(() => ({}))
      
      console.log('[HomeManager] Deals:', dealsRes.status, 'Homepage:', homeRes.status, 'About:', aboutRes.status)
      
      if (dealsRes.ok && homeRes.ok && aboutRes.ok) {
        addToast('Homepage saved! Refresh website to see changes.', 'success')
      } else {
        const errors = []
        if (!dealsRes.ok) errors.push(`Deals (${dealsRes.status})`)
        if (!homeRes.ok) errors.push(`Homepage (${homeRes.status})`)
        if (!aboutRes.ok) errors.push(`About (${aboutRes.status})`)
        addToast(`Save failed: ${errors.join(', ')}`, 'error')
      }
    } catch (err) {
      console.error('[HomeManager] Save error:', err)
      addToast('Save failed - server error: ' + err.message, 'error')
    }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary, #888)' }}>Loading homepage data...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 100px', color: 'var(--text-primary, #28241f)' }}>
      <style>{`@keyframes toastSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...S.toast, background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#3b82f6', color: '#fff' }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: '1px solid var(--border-color, #e5e1d8)' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Homepage Manager</h2>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary, #888)' }}>Manage hero slider, promo banners, and deals & benefits.</p>
      </div>

      {/* Hero Slider */}
      <Section num={1} id="hero" title="Hero Slider" collapsed={collapsed.hero} toggle={toggle}>
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 8, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #888)' }}>
            Slides ({heroSlides.length}/5)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {heroSlides.map((slide, idx) => <SlideCard key={slide.id || idx} slide={slide} idx={idx} onEdit={startEditSlide} onDelete={deleteSlide} onToggle={toggleSlide} />)}
          </div>
          <div style={S.slideForm}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', color: 'var(--accent-color, #aa7a3e)' }}>
              {editingSlide !== null ? `Edit Slide #${editingSlide + 1}` : 'Add New Slide'}
            </h4>
            <div style={S.grid}>
              <ImageUploader value={slideDraft.image} onChange={url => setSlideDraft(p => ({ ...p, image: url }))} fileRef={slideFileRef} uploading={!!uploadingField} uploadFn={uploadImage} sizeHint="1920 x 520 pixels" />
              <Input label="Tagline" value={slideDraft.tagline} onChange={v => setSlideDraft(p => ({ ...p, tagline: v }))} placeholder="e.g. AF FURNISHINGS" />
              <Input label="Title" value={slideDraft.title} onChange={v => setSlideDraft(p => ({ ...p, title: v }))} placeholder="e.g. Comfort made for everyday living." />
              <Input label="Description" value={slideDraft.description} onChange={v => setSlideDraft(p => ({ ...p, description: v }))} full placeholder="Short description..." />
              <Input label="Button Link" value={slideDraft.button_link} onChange={v => setSlideDraft(p => ({ ...p, button_link: v }))} placeholder="/category/lounge-suite" />
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <button type="button" style={S.addBtn} onClick={saveSlide}>
                {editingSlide !== null ? 'Update Slide' : '+ Add Slide'}
              </button>
              {editingSlide !== null && (
                <button type="button" style={S.smBtn} onClick={cancelSlideEdit}>Cancel</button>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Promo Banners */}
      <Section num={2} id="promo" title="Promo Banners" collapsed={collapsed.promo} toggle={toggle}>
        <div style={{ padding: 16 }}>
          <PromoForm label="Promo Banner" banner={promoBanner1} setBanner={setPromoBanner1} fileRef={promo1FileRef} uploading={uploadingField} uploadFn={uploadImage} />
        </div>
      </Section>

      {/* Deals */}
      <Section num={3} id="deals" title="Deals & Benefits" collapsed={collapsed.deals} toggle={toggle}>
        <div style={{ padding: 16 }}>
          <div style={S.grid}>
            <Input label="Section Title" value={dealsTitle} onChange={setDealsTitle} full placeholder="e.g. Limited-Time Weekly Deals" />
            <Input label="Subtitle" value={dealsSubtitle} onChange={setDealsSubtitle} full placeholder="e.g. Comfortable furniture at straightforward prices." />
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dealsCards.map((card, idx) => (
              <div key={idx} style={S.dealCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color, #aa7a3e)' }}>Card {idx + 1}</span>
                  <select value={card.icon} onChange={e => updateCard(idx, 'icon', e.target.value)} style={{ ...S.input, width: 'auto', padding: '8px 12px' }}>
                    {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={S.grid}>
                  <Input label="Title" value={card.title} onChange={v => updateCard(idx, 'title', v)} />
                  <Input label="Description" value={card.description} onChange={v => updateCard(idx, 'description', v)} full />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* About Us Section */}
      <Section num={4} id="about" title="About Us Section" collapsed={collapsed.about} toggle={toggle}>
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 12, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #888)' }}>
            This section appears on the homepage between categories and footer.
          </div>
          <div style={S.grid}>
            <Input label="Company Name" value={aboutForm.company_name} onChange={v => setAboutForm(p => ({ ...p, company_name: v }))} placeholder="e.g. AF Furnishings" />
            <Input label="Tagline" value={aboutForm.tagline} onChange={v => setAboutForm(p => ({ ...p, tagline: v }))} placeholder="e.g. Quality furniture for every NZ home" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={S.label}>Description</label>
            <textarea
              value={aboutForm.description}
              onChange={e => setAboutForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell customers about your company..."
              rows={3}
              style={{ ...S.input, resize: 'vertical', minHeight: 80 }}
            />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ImageUploader label="Image 1 (Main)" value={aboutForm.image_1} onChange={url => setAboutForm(p => ({ ...p, image_1: url }))} fileRef={aboutImg1Ref} uploading={!!uploadingField} uploadFn={uploadImage} sizeHint="900 x 600 pixels" />
            <ImageUploader label="Image 2 (Secondary)" value={aboutForm.image_2} onChange={url => setAboutForm(p => ({ ...p, image_2: url }))} fileRef={aboutImg2Ref} uploading={!!uploadingField} uploadFn={uploadImage} sizeHint="900 x 600 pixels" />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Input label="Address" value={aboutForm.address} onChange={v => setAboutForm(p => ({ ...p, address: v }))} placeholder="e.g. Auckland, NZ" />
            <Input label="Phone" value={aboutForm.phone} onChange={v => setAboutForm(p => ({ ...p, phone: v }))} placeholder="e.g. 0800 222 548" />
            <Input label="Email" value={aboutForm.email} onChange={v => setAboutForm(p => ({ ...p, email: v }))} placeholder="e.g. info@af.co.nz" />
          </div>
        </div>
      </Section>

      {/* Save bar - Floating at bottom */}
      <div style={S.saveBar}>
        <div>
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Save Homepage?</strong>
          <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>Hero slider, promos, deals, and about section update live.</span>
        </div>
        <button type="button" style={S.saveBtn} onClick={handleSave} disabled={saving}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      <div style={{ height: 100 }} /> {/* Spacer for fixed save bar */}
    </div>
  )
}

const S = {
  card: { background: 'var(--card-bg, rgba(255,255,255,0.03))', border: '1px solid var(--border-color, #e5e1d8)', borderRadius: 14, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 20 },
  cardHead: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border-color, #e5e1d8)', cursor: 'pointer', userSelect: 'none' },
  sectionNum: { fontSize: '0.78rem', color: 'var(--accent-color, #aa7a3e)', fontWeight: 600 },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #28241f)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #28241f)' },
  input: { width: '100%', padding: '11px 14px', background: 'var(--input-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color, #e5e1d8)', borderRadius: 8, color: 'var(--text-primary, #28241f)', fontSize: '0.92rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
  uploadRow: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  previewBox: { width: 120, height: 70, borderRadius: 8, background: 'var(--input-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color, #e5e1d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color, #e5e1d8)', borderRadius: 8, color: 'var(--text-primary, #28241f)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: 'fit-content' },
  slideItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color, #e5e1d8)', borderRadius: 10 },
  slideThumb: { width: 90, height: 55, borderRadius: 6, overflow: 'hidden', background: '#000', flexShrink: 0 },
  slideTitle: { fontSize: '0.92rem', fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  slideMeta: { fontSize: '0.78rem', color: 'var(--text-secondary, #888)' },
  slideForm: { padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color, #e5e1d8)', borderRadius: 10 },
  smBtn: { padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-color, #e5e1d8)', background: 'var(--input-bg, rgba(255,255,255,0.05))', color: 'var(--text-primary, #28241f)', cursor: 'pointer' },
  badgeActive: { padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer' },
  badgeHidden: { padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' },
  addBtn: { padding: '8px 18px', fontSize: '0.88rem', fontWeight: 700, background: 'var(--accent-color, #aa7a3e)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer' },
  dealCard: { padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color, #e5e1d8)', borderRadius: 10 },
  toast: { position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 6px 24px rgba(0,0,0,0.3)', animation: 'toastSlideIn 0.25s ease' },
  saveBar: { position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--header-bg, #1a1e29)', borderTop: '2px solid var(--accent-color, #aa7a3e)', borderRadius: 0, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 30px rgba(0,0,0,0.5)', zIndex: 999 },
  saveBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'var(--accent-color, #aa7a3e)', color: '#000', fontWeight: 800, fontSize: '1rem', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 4px 16px rgba(170,122,62,0.4)' },
}

export default HomeManager
