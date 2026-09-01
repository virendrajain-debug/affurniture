// ============================================================
// Premium CMS Page Content & Text Studio
// ============================================================
// Features:
//   - Dropdown page selector (About Us, Home, WinZ, Finance, Delivery, Returns, Terms, Privacy, Shop Furniture, Contact, Store Locations)
//   - For About Us Page:
//     - 1. Top Hero Eyebrow, Title, Subtitle
//     - 2. Our Story Section: Title + Rich Text Formatted Story Content
//     - 3. Our Values 3-Grid: Title + Rich Text Formatted Description (NO subtitle!)
//     - 4. Showroom Showcase: Headline + Rich Text Formatted Description
//   - For Home Page: Hero Carousel Titles/Subtitles & Deals Text
//   - For Standard CMS Pages: Eyebrow, Title, Subtitle & Full Rich Text WYSIWYG Content
//   - Sticky top and bottom publish buttons with instant toast feedback
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

// Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder = 'Enter formatted text content...' }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const execCmd = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg, #1f2937)', overflow: 'hidden' }}>
      {/* Formatting Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
        <button type="button" onClick={() => execCmd('bold')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => execCmd('italic')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Italic"><em>I</em></button>
        <button type="button" onClick={() => execCmd('underline')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Underline"><u>U</u></button>
        <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Heading 2">H2</button>
        <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Heading 3">H3</button>
        <button type="button" onClick={() => execCmd('formatBlock', '<p>')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Paragraph">P</button>
        <button type="button" onClick={() => execCmd('insertUnorderedList')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Bullet List">• List</button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }} title="Numbered List">1. List</button>
        <button type="button" onClick={() => execCmd('removeFormat')} style={{ padding: '3px 8px', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }} title="Clear Formatting">✕</button>
      </div>

      {/* Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: '120px',
          maxHeight: '260px',
          overflowY: 'auto',
          padding: '12px 14px',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          outline: 'none',
        }}
      />
    </div>
  )
}

const PAGES_LIST = [
  { key: 'about', label: 'About Us Page' },
  { key: 'home', label: 'Home Page CMS Text' },
  { key: 'winz', label: 'WinZ Quotes Page' },
  { key: 'finance', label: 'Finance Guide Page' },
  { key: 'delivery-info', label: 'Delivery Information Page' },
  { key: 'returns', label: 'Returns & Refund Policy Page' },
  { key: 'terms', label: 'Terms & Conditions Page' },
  { key: 'privacy-policy', label: 'Privacy Policy Page' },
  { key: 'shop-furniture', label: 'Shop Furniture Guide Page' },
  { key: 'contact', label: 'Contact Us Page' },
  { key: 'store-locations', label: 'Store Locations Page' },
]

function PageEditor({ token }) {
  const { pageKey: routeKey } = useParams()
  const navigate = useNavigate()

  const [activePageKey, setActivePageKey] = useState(
    routeKey ? (routeKey === 'winz-quotes' ? 'winz' : routeKey === 'finance-guide' ? 'finance' : routeKey) : 'about'
  )

  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadPageData = async (pageKey) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageKey}`)
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object') {
          setForm(data)
        }
      }
    } catch {
      showToast('Failed to load page text from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData(activePageKey)
  }, [activePageKey])

  const handleFieldChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`${API_BASE}/api/pages/${activePageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        showToast('Page text & formatted descriptions published live!', 'success')
        loadPageData(activePageKey)
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to save page', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
            Select Page to Edit Texts:
          </label>
          <select
            className="filter-select"
            value={activePageKey}
            onChange={(e) => {
              setActivePageKey(e.target.value)
              navigate(`/dashboard/pages/${e.target.value}`)
            }}
            style={{ minWidth: '300px', fontWeight: 600 }}
          >
            {PAGES_LIST.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={saving || loading}
          style={{ padding: '8px 22px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {saving ? 'Publishing...' : 'Publish Page Texts'}
        </button>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading page content...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* ============================================================
              1. ABOUT US PAGE TEXT STUDIO
          ============================================================ */}
          {activePageKey === 'about' && (
            <>
              {/* Section 1: Top Hero Header */}
              <div className="admin-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  1. Top Hero Header Text
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Eyebrow / Tagline</label>
                    <input type="text" className="form-input" value={form.eyebrow || ''} onChange={(e) => handleFieldChange('eyebrow', e.target.value)} placeholder="e.g. OUR STORY" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Page Main Title</label>
                    <input type="text" className="form-input" value={form.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="e.g. About AF Furnishings" />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Hero Subtitle</label>
                  <input type="text" className="form-input" value={form.subtitle || ''} onChange={(e) => handleFieldChange('subtitle', e.target.value)} placeholder="e.g. Quality furniture for every New Zealand home" />
                </div>
              </div>

              {/* Section 2: Our Story Feature Section */}
              <div className="admin-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  2. Our Story Feature Text &amp; Rich Description
                </h4>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Story Section Title</label>
                  <input type="text" className="form-input" value={form.story_title || ''} onChange={(e) => handleFieldChange('story_title', e.target.value)} placeholder="e.g. Who We Are" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Formatted Story Description *</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-color, #d4af37)' }}>Rich Text Formatting Enabled</span>
                  </label>
                  <RichTextEditor value={form.story_content || ''} onChange={(val) => handleFieldChange('story_content', val)} placeholder="Enter company background and story..." />
                </div>
              </div>

              {/* Section 3: Our Values 3-Grid (Title & Description Only, NO Subtitle) */}
              <div className="admin-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  3. Our Values 3-Grid (Title &amp; Description Only)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {/* Card 1 */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Value Card 1 Title</label>
                      <input type="text" className="form-input" value={form.val_1_title || ''} onChange={(e) => handleFieldChange('val_1_title', e.target.value)} placeholder="e.g. Quality First" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Value Card 1 Description</label>
                      <RichTextEditor value={form.val_1_desc || ''} onChange={(val) => handleFieldChange('val_1_desc', val)} placeholder="Enter description..." />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Value Card 2 Title</label>
                      <input type="text" className="form-input" value={form.val_2_title || ''} onChange={(e) => handleFieldChange('val_2_title', e.target.value)} placeholder="e.g. Comfort Always" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Value Card 2 Description</label>
                      <RichTextEditor value={form.val_2_desc || ''} onChange={(val) => handleFieldChange('val_2_desc', val)} placeholder="Enter description..." />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Value Card 3 Title</label>
                      <input type="text" className="form-input" value={form.val_3_title || ''} onChange={(e) => handleFieldChange('val_3_title', e.target.value)} placeholder="e.g. For Every Home" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Value Card 3 Description</label>
                      <RichTextEditor value={form.val_3_desc || ''} onChange={(val) => handleFieldChange('val_3_desc', val)} placeholder="Enter description..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Showroom Showcase Text */}
              <div className="admin-card" style={{ padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  4. Showroom Showcase Text &amp; Description
                </h4>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Showroom Section Headline</label>
                  <input type="text" className="form-input" value={form.showroom_title || ''} onChange={(e) => handleFieldChange('showroom_title', e.target.value)} placeholder="e.g. Experience Comfort in Person" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Showroom Formatted Description</label>
                  <RichTextEditor value={form.showroom_desc || ''} onChange={(val) => handleFieldChange('showroom_desc', val)} placeholder="Enter showroom description..." />
                </div>
              </div>
            </>
          )}

          {/* ============================================================
              2. HOME PAGE CMS TEXT
          ============================================================ */}
          {activePageKey === 'home' && (
            <div className="admin-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Homepage Hero Slides Text &amp; Deals
              </h4>

              {/* Slide 1 */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '8px' }}>Hero Slide 1 Text</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" className="form-input" value={form.hero_1_title || ''} onChange={(e) => handleFieldChange('hero_1_title', e.target.value)} placeholder="Slide 1 Title" />
                  <input type="text" className="form-input" value={form.hero_1_subtitle || ''} onChange={(e) => handleFieldChange('hero_1_subtitle', e.target.value)} placeholder="Slide 1 Subtitle" />
                </div>
              </div>

              {/* Slide 2 */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '8px' }}>Hero Slide 2 Text</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" className="form-input" value={form.hero_2_title || ''} onChange={(e) => handleFieldChange('hero_2_title', e.target.value)} placeholder="Slide 2 Title" />
                  <input type="text" className="form-input" value={form.hero_2_subtitle || ''} onChange={(e) => handleFieldChange('hero_2_subtitle', e.target.value)} placeholder="Slide 2 Subtitle" />
                </div>
              </div>

              {/* Slide 3 */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '8px' }}>Hero Slide 3 Text</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" className="form-input" value={form.hero_3_title || ''} onChange={(e) => handleFieldChange('hero_3_title', e.target.value)} placeholder="Slide 3 Title" />
                  <input type="text" className="form-input" value={form.hero_3_subtitle || ''} onChange={(e) => handleFieldChange('hero_3_subtitle', e.target.value)} placeholder="Slide 3 Subtitle" />
                </div>
              </div>

              {/* Deals Text */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '8px' }}>Deals Section Text</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" className="form-input" value={form.deals_headline || ''} onChange={(e) => handleFieldChange('deals_headline', e.target.value)} placeholder="Deals Headline" />
                  <input type="text" className="form-input" value={form.deals_subtitle || ''} onChange={(e) => handleFieldChange('deals_subtitle', e.target.value)} placeholder="Deals Subtitle" />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              3. STANDARD CMS PAGES (WinZ, Delivery, Returns, Terms, Privacy, Shop Furniture, Contact, Store Locations)
          ============================================================ */}
          {activePageKey !== 'about' && activePageKey !== 'home' && (
            <div className="admin-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                {PAGES_LIST.find(p => p.key === activePageKey)?.label} Content
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Eyebrow / Badge</label>
                  <input type="text" className="form-input" value={form.eyebrow || ''} onChange={(e) => handleFieldChange('eyebrow', e.target.value)} placeholder="e.g. LEGAL / INFO" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Main Page Title</label>
                  <input type="text" className="form-input" value={form.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Page Title" />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Page Subtitle</label>
                <input type="text" className="form-input" value={form.subtitle || ''} onChange={(e) => handleFieldChange('subtitle', e.target.value)} placeholder="Page Subtitle" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Main Body Content (Rich Text Formatted)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-color, #d4af37)' }}>Toolbar Formatting</span>
                </label>
                <RichTextEditor value={form.content || form.intro_content || ''} onChange={(val) => handleFieldChange('content', val)} placeholder="Enter full page content..." />
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || loading}
              style={{ padding: '10px 28px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              {saving ? 'Publishing...' : 'Publish Page Texts'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageEditor;
