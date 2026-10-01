import React, { useState, useEffect, useRef, useCallback } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function RichTextEditor({ value, onChange, placeholder = 'Enter formatted text content...' }) {
  const editorRef = useRef(null)
  const lastValue = useRef('')
  const initialized = useRef(false)

  useEffect(() => {
    if (editorRef.current && value !== lastValue.current) {
      editorRef.current.innerHTML = value || ''
      lastValue.current = value || ''
      if (!initialized.current) initialized.current = true
    }
  }, [value, initialized])

  const execCmd = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg)
    if (editorRef.current) { lastValue.current = editorRef.current.innerHTML; onChange(lastValue.current) }
  }

  const handleInput = () => {
    if (editorRef.current) { lastValue.current = editorRef.current.innerHTML; onChange(lastValue.current) }
  }

  return (
    <div style={{ borderRadius: '8px', border: '1px solid var(--border-color, #e5e1d8)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color, #e5e1d8)', alignItems: 'center' }}>
        <button type="button" onClick={() => execCmd('bold')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}><strong>B</strong></button>
        <button type="button" onClick={() => execCmd('italic')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}><em>I</em></button>
        <button type="button" onClick={() => execCmd('underline')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}><u>U</u></button>
        <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}>H2</button>
        <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}>H3</button>
        <button type="button" onClick={() => execCmd('formatBlock', '<p>')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}>P</button>
        <button type="button" onClick={() => execCmd('insertUnorderedList')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}>• List</button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-primary, #e8e4dd)', cursor: 'pointer' }}>1. List</button>
        <button type="button" onClick={() => execCmd('removeFormat')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-color, #e5e1d8)', color: 'var(--text-secondary, #888)', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto', padding: '12px 14px', color: 'var(--text-primary, #e8e4dd)', fontSize: '0.85rem', lineHeight: 1.6, outline: 'none' }}
      />
    </div>
  )
}

const FIXED_PAGES = [
  { slug: 'about', title: 'About Us' },
  { slug: 'on-sale', title: 'On Sale' },
  { slug: 'terms', title: 'Terms & Conditions' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'delivery-info', title: 'Delivery Information' },
  { slug: 'returns', title: 'Returns & Refund Policy' },
  { slug: 'contact', title: 'Contact Us' },
]

const BANNER_KEY_MAP = {
  about: 'about_banner',
  'on-sale': 'on_sale_banner',
  terms: 'terms_banner',
  'privacy-policy': 'privacy_banner',
  'delivery-info': 'delivery_info_banner',
  returns: 'returns_banner',
  contact: 'contact_banner',
}

const STANDARD_SLUGS = ['on-sale', 'terms', 'privacy-policy', 'delivery-info', 'returns']

const SECTION_TYPES = ['primary_section', 'value_1', 'value_2', 'value_3', 'features', 'conclusion']

const CARD_STYLE = {
  padding: '20px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border-color, #e5e1d8)',
  marginBottom: '16px',
}

const LABEL_STYLE = {
  fontSize: '0.78rem',
  color: 'var(--text-secondary, #888)',
  fontWeight: 600,
  display: 'block',
  marginBottom: '6px',
}

const INPUT_STYLE = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-color, #e5e1d8)',
  borderRadius: '8px',
  color: 'var(--text-primary, #e8e4dd)',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none',
}

const SECTION_HEADER = {
  fontSize: '1.05rem',
  fontWeight: 700,
  color: 'var(--text-primary, #e8e4dd)',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

const SECTION_NUM = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'var(--accent-color, #aa7a3e)',
  color: '#000',
  fontSize: '0.75rem',
  fontWeight: 800,
  flexShrink: 0,
}

function BannerUpload({ value, onChange, authToken, fallback }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const displayValue = value || fallback || ''

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const headers = {}
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers, body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        onChange(data.url)
      } else {
        alert(data.message || 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fallback || 'https://example.com/banner.jpg'}
            style={INPUT_STYLE}
          />
          {value && value !== fallback && fallback && (
            <button type="button" onClick={() => onChange('')} style={{ marginTop: 4, fontSize: '0.72rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear custom image</button>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 16px',
            background: 'var(--accent-color, #aa7a3e)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
            whiteSpace: 'nowrap',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #888)', marginTop: '6px', display: 'block' }}>
        Recommended resolution: 1920 x 520 pixels
      </span>
      {displayValue && (
        <div style={{ marginTop: '10px', position: 'relative' }}>
          <img src={getAssetUrl(displayValue)} alt="Preview" style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color, #e5e1d8)' }}
            onError={(e) => { e.target.style.display = 'none' }} />
          {!value && fallback && (
            <span style={{ position: 'absolute', bottom: 6, right: 6, fontSize: '0.65rem', background: 'rgba(0,0,0,0.7)', color: '#aaa', padding: '2px 8px', borderRadius: 4 }}>Current website image</span>
          )}
        </div>
      )}
    </div>
  )
}

function PageEditor({ token }) {
  const [pages, setPages] = useState([])
  const [activeSlug, setActiveSlug] = useState('about')
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  const authToken = getAuthToken(token)

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const authHeaders = useCallback(() => {
    const h = { 'Content-Type': 'application/json' }
    if (authToken) h['Authorization'] = `Bearer ${authToken}`
    return h
  }, [authToken])

  const loadAllPages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/page-content`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to fetch pages')
      const data = await res.json()
      setPages(Array.isArray(data) ? data : [])
    } catch {
      addToast('Failed to load pages list', 'error')
    }
  }, [authHeaders, addToast])

  const loadPageData = useCallback(async (slug) => {
    setLoading(true)
    try {
      if (slug === 'about') {
        const [aboutRes, sectionsRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/about`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/about-sections`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/settings`, { headers: authHeaders() }),
        ])
        const about = aboutRes.ok ? await aboutRes.json() : {}
        const sectionsRaw = sectionsRes.ok ? await sectionsRes.json() : []
        const settings = settingsRes.ok ? await settingsRes.json() : {}

        const sections = {}
        if (Array.isArray(sectionsRaw)) {
          sectionsRaw.forEach(s => { sections[s.type] = s })
        }

        setForm({
          about_banner: settings.about_banner || '',
          primary_title: sections.primary_section?.title || '',
          company_name: about.company_name || '',
          tagline: about.tagline || '',
          story_description: about.description || '',
          story_image: about.image_1 || '',
          features_title: sections.features?.title || '',
          features_description: sections.features?.description || '',
          val_1_title: sections.value_1?.title || '',
          val_1_desc: sections.value_1?.description || '',
          val_1_image: sections.value_1?.image || '',
          val_2_title: sections.value_2?.title || '',
          val_2_desc: sections.value_2?.description || '',
          val_2_image: sections.value_2?.image || '',
          val_3_title: sections.value_3?.title || '',
          val_3_desc: sections.value_3?.description || '',
          val_3_image: sections.value_3?.image || '',
          conclusion_title: sections.conclusion?.title || '',
          conclusion_desc: sections.conclusion?.description || '',
          conclusion_image: about.image_2 || '',
          address: about.address || '',
          phone: about.phone || '',
          email: about.email || '',
        })
      } else if (slug === 'contact') {
        const [pageRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/page-content/contact`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/settings`, { headers: authHeaders() }),
        ])
        const page = pageRes.ok ? await pageRes.json() : {}
        const settings = settingsRes.ok ? await settingsRes.json() : {}
        const content = (() => {
          if (!page.content) return {}
          if (typeof page.content === 'string') { try { return JSON.parse(page.content) } catch { return {} } }
          return page.content
        })()

        setForm({
          contact_banner: settings.contact_banner || '',
          contact_phone: settings.phone || content.phone || '',
          contact_email: settings.email || content.email || '',
          address: content.address || '',
          business_hours: content.business_hours || '',
        })
      } else if (STANDARD_SLUGS.includes(slug)) {
        const bannerKey = BANNER_KEY_MAP[slug]
        let [pageRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/page-content/${slug}`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/settings`, { headers: authHeaders() }),
        ])

        // Auto-create the page if it doesn't exist yet
        if (pageRes.status === 404) {
          const titles = { 'on-sale': 'On Sale', 'terms': 'Terms & Conditions', 'privacy-policy': 'Privacy Policy', 'delivery-info': 'Delivery Information', 'returns': 'Returns & Refund Policy' }
          await fetch(`${API_BASE}/api/page-content`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ slug, title: titles[slug] || slug, content: { content: '' }, page_type: 'standard', banner_image: '', meta_description: '', sort_order: 0, active: true }),
          })
          pageRes = await fetch(`${API_BASE}/api/page-content/${slug}`, { headers: authHeaders() })
        }

        const page = pageRes.ok ? await pageRes.json() : null
        const settings = settingsRes.ok ? await settingsRes.json() : {}
        const content = page ? (() => {
          if (!page.content) return ''
          if (typeof page.content === 'string') {
            try { const parsed = JSON.parse(page.content); return parsed.content || page.content } catch { return page.content }
          }
          if (typeof page.content === 'object' && page.content !== null) {
            return page.content.content || JSON.stringify(page.content)
          }
          return ''
        })() : ''

        setForm({
          title: page?.title || '',
          banner_image: settings[bannerKey] || '',
          content,
        })
      } else {
        const res = await fetch(`${API_BASE}/api/page-content/${slug}`, { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          const content = (() => {
            if (!data.content) return ''
            if (typeof data.content === 'string') {
              try { const parsed = JSON.parse(data.content); return parsed.content || data.content } catch { return data.content }
            }
            if (typeof data.content === 'object' && data.content !== null) {
              return data.content.content || JSON.stringify(data.content)
            }
            return ''
          })()
          setForm({
            title: data.title || '',
            slug: data.slug || slug,
            meta_description: data.meta_description || '',
            banner_image: data.banner_image || '',
            content,
            page_type: data.page_type || '',
          })
        } else {
          setForm({ title: '', slug, meta_description: '', banner_image: '', content: '', page_type: 'dynamic' })
        }
      }
    } catch {
      addToast('Failed to load page content', 'error')
    } finally {
      setLoading(false)
    }
  }, [authHeaders, addToast])

  useEffect(() => { loadAllPages() }, [loadAllPages])
  useEffect(() => { loadPageData(activeSlug) }, [activeSlug, loadPageData])

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const isAbout = activeSlug === 'about'
  const isContact = activeSlug === 'contact'
  const isStandard = STANDARD_SLUGS.includes(activeSlug)
  const isDynamic = !isAbout && !isContact && !isStandard

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      if (isAbout) {
        const [aboutRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/about`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              company_name: form.company_name || '',
              tagline: form.tagline || '',
              description: form.story_description || '',
              image_1: form.story_image || '',
              image_2: form.conclusion_image || '',
              address: form.address || '',
              phone: form.phone || '',
              email: form.email || '',
            }),
          }),
          fetch(`${API_BASE}/api/settings`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ about_banner: form.about_banner || '' }),
          }),
        ])

        const sectionTypes = [
          { type: 'primary_section', title: form.primary_title || '', description: '', image: '' },
          { type: 'features', title: form.features_title || '', description: form.features_description || '', image: '' },
          { type: 'value_1', title: form.val_1_title || '', description: form.val_1_desc || '', image: form.val_1_image || '' },
          { type: 'value_2', title: form.val_2_title || '', description: form.val_2_desc || '', image: form.val_2_image || '' },
          { type: 'value_3', title: form.val_3_title || '', description: form.val_3_desc || '', image: form.val_3_image || '' },
          { type: 'conclusion', title: form.conclusion_title || '', description: form.conclusion_desc || '', image: '' },
        ]

        const sectionResults = await Promise.all(
          sectionTypes.map(s =>
            fetch(`${API_BASE}/api/about-sections/${s.type}`, {
              method: 'PUT',
              headers: authHeaders(),
              body: JSON.stringify(s),
            })
          )
        )

        const allOk = aboutRes.ok && settingsRes.ok && sectionResults.every(r => r.ok)
        if (allOk) {
          addToast('About page saved successfully!', 'success')
        } else {
          addToast('Some parts failed to save. Please try again.', 'error')
        }
      } else if (isContact) {
        const [pageRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/page-content/contact`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              title: 'Contact Us',
              content: {
                phone: form.contact_phone || '',
                email: form.contact_email || '',
                address: form.address || '',
                business_hours: form.business_hours || '',
              },
            }),
          }),
          fetch(`${API_BASE}/api/settings`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              contact_banner: form.contact_banner || '',
              phone: form.contact_phone || '',
              email: form.contact_email || '',
            }),
          }),
        ])
        if (pageRes.ok && settingsRes.ok) {
          addToast('Contact page saved successfully!', 'success')
        } else {
          addToast('Failed to save contact page', 'error')
        }
      } else if (isStandard) {
        const bannerKey = BANNER_KEY_MAP[activeSlug]
        const [pageRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/page-content/${activeSlug}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              title: form.title || '',
              content: { content: form.content || '' },
            }),
          }),
          fetch(`${API_BASE}/api/settings`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ [bannerKey]: form.banner_image || '' }),
          }),
        ])
        if (pageRes.ok && settingsRes.ok) {
          addToast('Page saved successfully!', 'success')
        } else {
          addToast('Failed to save page', 'error')
        }
      } else {
        const res = await fetch(`${API_BASE}/api/page-content/${activeSlug}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            title: form.title || '',
            content: { content: form.content || '' },
            page_type: form.page_type || 'dynamic',
            banner_image: form.banner_image || '',
            meta_description: form.meta_description || '',
          }),
        })
        if (res.ok) {
          addToast('Page saved successfully!', 'success')
        } else {
          addToast('Failed to save page', 'error')
        }
      }

      loadAllPages()
      setTimeout(() => loadPageData(activeSlug), 200)
    } catch {
      addToast('Server connection error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const renderInput = (label, fieldKey, placeholder, type = 'text') => (
    <div style={{ marginBottom: '14px' }}>
      <label style={LABEL_STYLE}>{label}</label>
      <input
        type={type}
        value={form[fieldKey] || ''}
        onChange={(e) => setField(fieldKey, e.target.value)}
        placeholder={placeholder}
        style={INPUT_STYLE}
      />
    </div>
  )

  const renderBanner = (bannerKey, fallback) => (
    <div style={CARD_STYLE}>
      <div style={SECTION_HEADER}>
        <span style={SECTION_NUM}>B</span>
        Banner Image
      </div>
      <BannerUpload value={form[bannerKey] || ''} onChange={(val) => setField(bannerKey, val)} authToken={authToken} fallback={fallback} />
    </div>
  )

  const renderRichText = (label, fieldKey, placeholder) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>{label}</label>
        <span style={{ fontSize: '0.7rem', color: 'var(--accent-color, #aa7a3e)' }}>Rich Text</span>
      </div>
      <RichTextEditor value={form[fieldKey] || ''} onChange={(val) => setField(fieldKey, val)} placeholder={placeholder} />
    </div>
  )

  const renderImageUpload = (label, fieldKey, fallback) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={LABEL_STYLE}>{label}</label>
      <BannerUpload value={form[fieldKey] || ''} onChange={(val) => setField(fieldKey, val)} authToken={authToken} fallback={fallback} />
    </div>
  )

  const FB = {
    about_banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    on_sale_banner: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=2000&q=85',
    story_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85',
    val_1_image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    val_2_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    val_3_image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80',
    conclusion_image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85',
    terms_banner: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2000&q=85',
    privacy_banner: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85',
    delivery_info_banner: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85',
    returns_banner: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=85',
    contact_banner: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=85',
  }

  const renderAboutPage = () => (
    <>
      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>01</span>
          Hero Banner
        </div>
        {renderBanner('about_banner', FB.about_banner)}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>02</span>
          Hero Header Text
        </div>
        {renderInput('Eyebrow Text (e.g. "OUR STORY")', 'primary_title', 'Used as hero eyebrow')}
        {renderInput('Page Title (e.g. "About AF Furnishings")', 'company_name', 'Main heading')}
        {renderInput('Subtitle', 'tagline', 'Brief tagline or subtitle')}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>03</span>
          Our Story
        </div>
        {renderRichText('Story Description', 'story_description', 'Write your story here...')}
        {renderImageUpload('Story Image', 'story_image', FB.story_image)}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>04</span>
          Our Values
        </div>
        {renderInput('Values Section Title (e.g. "OUR VALUES")', 'features_title', 'Section eyebrow')}
        {renderInput('Values Section Subtitle', 'features_description', 'e.g., What we stand for.')}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-color, #aa7a3e)', marginBottom: '10px' }}>Value Card 1</div>
          {renderInput('Title', 'val_1_title', 'e.g., Quality Craftsmanship')}
          {renderRichText('Description', 'val_1_desc', 'Describe this value...')}
          {renderImageUpload('Image', 'val_1_image', FB.val_1_image)}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-color, #aa7a3e)', marginBottom: '10px' }}>Value Card 2</div>
          {renderInput('Title', 'val_2_title', 'e.g., Customer Focus')}
          {renderRichText('Description', 'val_2_desc', 'Describe this value...')}
          {renderImageUpload('Image', 'val_2_image', FB.val_2_image)}
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-color, #aa7a3e)', marginBottom: '10px' }}>Value Card 3</div>
          {renderInput('Title', 'val_3_title', 'e.g., Innovation')}
          {renderRichText('Description', 'val_3_desc', 'Describe this value...')}
          {renderImageUpload('Image', 'val_3_image', FB.val_3_image)}
        </div>
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>05</span>
          Visit Our Showroom / Conclusion
        </div>
        {renderInput('Headline (e.g. "Visit Our Showroom")', 'conclusion_title', 'Section eyebrow')}
        {renderRichText('Description', 'conclusion_desc', 'Showroom details...')}
        {renderImageUpload('Team / Showroom Image', 'conclusion_image', FB.conclusion_image)}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>06</span>
          Contact Info
        </div>
        {renderInput('Address', 'address', 'Full business address')}
        {renderInput('Phone', 'phone', 'e.g., 0800 222 548')}
        {renderInput('Email', 'email', 'e.g., affurniture@gmail.com', 'email')}
      </div>
    </>
  )

  const renderContactPage = () => (
    <>
      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>01</span>
          Banner Image
        </div>
        {renderBanner('contact_banner', FB.contact_banner)}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>02</span>
          Contact Information
        </div>
        {renderInput('Phone', 'contact_phone', 'e.g., 0800 222 548')}
        {renderInput('Email', 'contact_email', 'e.g., affurniture@gmail.com', 'email')}
        {renderInput('Address', 'address', 'Full business address')}
        {renderInput('Business Hours', 'business_hours', 'e.g., Mon-Fri 9am-6pm')}
      </div>
    </>
  )

  const renderStandardPage = () => {
    const bannerKey = BANNER_KEY_MAP[activeSlug] || activeSlug + '_banner'
    const bannerFallback = FB[bannerKey] || ''
    return (
    <>
      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>01</span>
          Banner Image
        </div>
        {renderBanner('banner_image', bannerFallback)}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>02</span>
          Page Content
        </div>
        {renderInput('Title', 'title', 'Enter page title')}
        {renderRichText('Main Body Content', 'content', 'Write your page content here...')}
      </div>
    </>
    )
  }

  const renderDynamicPage = () => (
    <>
      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>01</span>
          Page Details
        </div>
        {renderInput('Title', 'title', 'Enter page title')}
        <div style={{ marginBottom: '14px' }}>
          <label style={LABEL_STYLE}>Slug (URL)</label>
          <input type="text" value={form.slug || activeSlug} style={{ ...INPUT_STYLE, opacity: 0.6 }} disabled />
        </div>
        {renderInput('Meta Description', 'meta_description', 'Brief description for search engines')}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>02</span>
          Banner Image
        </div>
        {renderBanner('banner_image')}
      </div>

      <div style={CARD_STYLE}>
        <div style={SECTION_HEADER}>
          <span style={SECTION_NUM}>03</span>
          Page Content
        </div>
        {renderRichText('Main Body Content', 'content', 'Write your page content here...')}
      </div>
    </>
  )

  const renderForm = () => {
    if (isAbout) return renderAboutPage()
    if (isContact) return renderContactPage()
    if (isStandard) return renderStandardPage()
    if (isDynamic) return renderDynamicPage()
    return renderStandardPage()
  }

  const pageTitle = FIXED_PAGES.find(p => p.slug === activeSlug)?.title || form.title || activeSlug

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', maxWidth: '900px', margin: '0 auto' }}>
      <style>{`@keyframes toastSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', color: '#fff', background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#3b82f6', boxShadow: '0 6px 24px rgba(0,0,0,0.3)', animation: 'toastSlideIn 0.25s ease' }}>
            {t.msg}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '20px 0', marginBottom: '8px', borderBottom: '1px solid var(--border-color, #e5e1d8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary, #888)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Page to Edit:</label>
          <select
            value={activeSlug}
            onChange={(e) => setActiveSlug(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color, #e5e1d8)',
              borderRadius: '8px',
              color: 'var(--text-primary, #e8e4dd)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              minWidth: '220px',
              outline: 'none',
            }}
          >
            {FIXED_PAGES.map(p => (
              <option key={p.slug} value={p.slug} style={{ background: '#28241f', color: '#e8e4dd' }}>{p.title}</option>
            ))}
            {pages.filter(p => !FIXED_PAGES.some(f => f.slug === p.slug)).length > 0 && (
              <optgroup label="Dynamic Pages" style={{ background: '#28241f', color: '#888' }}>
                {pages.filter(p => !FIXED_PAGES.some(f => f.slug === p.slug)).map(p => (
                  <option key={p.slug} value={p.slug} style={{ background: '#28241f', color: '#e8e4dd' }}>{p.title || p.slug}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            padding: '10px 24px',
            background: 'var(--accent-color, #aa7a3e)',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.88rem',
            border: 'none',
            borderRadius: 8,
            cursor: saving || loading ? 'not-allowed' : 'pointer',
            opacity: saving || loading ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {saving ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {loading ? (
        <div style={{ ...CARD_STYLE, textAlign: 'center', padding: 60, color: 'var(--text-secondary, #888)' }}>Loading page content...</div>
      ) : (
        <>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-color, #aa7a3e)', marginBottom: '16px', marginTop: '20px' }}>
            Editing: {pageTitle}
          </div>
          {renderForm()}
        </>
      )}
    </div>
  )
}

export default PageEditor
