// ============================================================
// Premium CMS Page Content Studio (Strictly Text & Rich Content)
// ============================================================
// Features:
//  - Top Left Page Selector Dropdown (About, WinZ, Finance, Delivery, Returns, Terms, Privacy, Shop Furniture, Contact, Home)
//  - Top: Full WYSIWYG Rich Text Editor with Text Formatting Toolbar
//  - Below: All structured text fields available on that page (Headings, Subtitles, Intro, Callouts, Contact, Delivery Rates)
//  - ZERO BANNER UPLOADS (Banners are managed in the dedicated Banners Studio)
//  - Sticky bottom publish bar with instant toast confirmation
//  - API: GET /api/pages/:pageKey & PUT /api/pages/:pageKey
// ============================================================

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

const PAGES_LIST = [
  { key: 'about', label: 'About Us Page' },
  { key: 'winz', label: 'WinZ Quotes Page' },
  { key: 'finance', label: 'Finance Guide Page' },
  { key: 'delivery-info', label: 'Delivery Information Page' },
  { key: 'returns', label: 'Returns & Refund Policy Page' },
  { key: 'terms', label: 'Terms & Conditions Page' },
  { key: 'privacy-policy', label: 'Privacy Policy Page' },
  { key: 'shop-furniture', label: 'Shop Furniture Guide Page' },
  { key: 'contact', label: 'Contact Us Page' },
  { key: 'home', label: 'Home Page CMS Text' },
]

function PageEditor({ token }) {
  const { pageKey: routeKey } = useParams()
  const navigate = useNavigate()

  const [activePageKey, setActivePageKey] = useState(
    routeKey ? (routeKey === 'winz-quotes' ? 'winz' : routeKey === 'finance-guide' ? 'finance' : routeKey) : 'about'
  )

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    eyebrow: '',
    content: '',
    intro_content: '',
    callout_title: '',
    callout_text: '',
    callout_badge: '',
    phone: '',
    email: '',
    address: '',
    hours: '',
    delivery_auckland: '',
    delivery_north: '',
    delivery_south: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const editorRef = useRef(null)
  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load page data
  const loadPageData = async (pageKey) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageKey}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object') {
          const pageTitleFallback = PAGES_LIST.find(p => p.key === pageKey)?.label.replace(' Page', '') || ''
          setForm({
            title: data.title || data.company_name || pageTitleFallback,
            subtitle: data.subtitle || data.tagline || '',
            eyebrow: data.eyebrow || data.promo_badge || 'AF FURNISHINGS',
            content: data.content || data.about_story || data.description || '',
            intro_content: data.intro_content || '',
            callout_title: data.callout_title || data.promo_title || '',
            callout_text: data.callout_text || '',
            callout_badge: data.callout_badge || '',
            phone: data.phone || data.support_phone || '',
            email: data.email || data.support_email || '',
            address: data.address || data.store_address || '',
            hours: data.hours || data.opening_hours || '',
            delivery_auckland: data.delivery_auckland || '1-3 Business Days ($49)',
            delivery_north: data.delivery_north || '3-5 Business Days ($89)',
            delivery_south: data.delivery_south || '4-7 Business Days ($129)',
          })
          if (editorRef.current) {
            editorRef.current.innerHTML = data.content || data.about_story || data.description || ''
          }
        }
      }
    } catch {
      showToast('Failed to load page content', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData(activePageKey)
  }, [activePageKey])

  // Handle page dropdown switch
  const handlePageDropdownChange = (newKey) => {
    setActivePageKey(newKey)
    navigate(`/dashboard/pages/${newKey}`)
  }

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Rich Text Editor Commands
  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    if (editorRef.current) {
      editorRef.current.focus()
      setForm(prev => ({ ...prev, content: editorRef.current.innerHTML }))
    }
  }

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://...):')
    if (url) execCmd('createLink', url)
  }

  // Save Page Content
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      content: editorRef.current ? editorRef.current.innerHTML : form.content,
    }

    try {
      const res = await fetch(`${API_BASE}/api/pages/${activePageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(`${PAGES_LIST.find(p => p.key === activePageKey)?.label} updated successfully!`, 'success')
      } else {
        const d = await res.json().catch(() => ({}))
        showToast(d.message || 'Failed to update page', 'error')
      }
    } catch {
      showToast('Server connection error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const activePageLabel = PAGES_LIST.find(p => p.key === activePageKey)?.label || 'Page Content'

  return (
    <div className="admin-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Top Filter Toolbar (Top Left Page Selector Dropdown) */}
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
            Selected Page:
          </label>
          <select
            className="filter-select"
            value={activePageKey}
            onChange={(e) => handlePageDropdownChange(e.target.value)}
            style={{ minWidth: '260px', fontWeight: 600 }}
          >
            {PAGES_LIST.map(opt => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={saving || loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '0.88rem' }}
        >
          {saving ? 'Publishing...' : 'Save & Publish Page'}
        </button>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading {activePageLabel} text...
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* TOP SECTION: Rich Text Editor with Formatting Toolbar */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="admin-card-title">
                  Primary Page Body & Paragraph Content
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Main formatted text displayed on the public storefront for this page.
                </span>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div style={{ borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--header-bg)', overflow: 'hidden' }}>
              {/* Text Formatting Toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px 12px', background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
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

              {/* Editable Body */}
              <div
                ref={editorRef}
                contentEditable
                onInput={() => {
                  if (editorRef.current) {
                    setForm(prev => ({ ...prev, content: editorRef.current.innerHTML }))
                  }
                }}
                style={{
                  minHeight: '260px',
                  padding: '16px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  lineHeight: 1.7,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* SECTION 2: Page Headings & Metadata */}
          <div className="admin-card">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '12px' }}>
              02. Page Headings & Metadata
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Page Title (H1 Headline) *</label>
                <input
                  type="text"
                  className="form-input"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. About AF Furnishings"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Eyebrow / Header Tag</label>
                <input
                  type="text"
                  className="form-input"
                  name="eyebrow"
                  value={form.eyebrow}
                  onChange={handleFormChange}
                  placeholder="e.g. AF FURNISHINGS"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Page Subtitle / Tagline</label>
              <textarea
                rows={2}
                className="form-textarea"
                name="subtitle"
                value={form.subtitle}
                onChange={handleFormChange}
                placeholder="e.g. Premium handcrafted furniture designed for New Zealand living."
              />
            </div>
          </div>

          {/* SECTION 3: Page-Specific Content Fields */}
          {activePageKey === 'contact' && (
            <div className="admin-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '12px' }}>
                03. Contact Details & Showroom Information
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Support Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="e.g. 0800 234 333"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Support Email</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="e.g. sales@affurnishings.co.nz"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Showroom Address</label>
                  <input
                    type="text"
                    className="form-input"
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="e.g. 123 Great South Road, Auckland"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Operating Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    name="hours"
                    value={form.hours}
                    onChange={handleFormChange}
                    placeholder="e.g. Mon-Sat: 9am - 5pm, Sun: 10am - 4pm"
                  />
                </div>
              </div>
            </div>
          )}

          {activePageKey === 'delivery-info' && (
            <div className="admin-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '12px' }}>
                03. Regional Delivery Estimates & Rates
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Auckland Region Delivery</label>
                  <input
                    type="text"
                    className="form-input"
                    name="delivery_auckland"
                    value={form.delivery_auckland}
                    onChange={handleFormChange}
                    placeholder="e.g. 1-3 Business Days ($49)"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">North Island Delivery</label>
                  <input
                    type="text"
                    className="form-input"
                    name="delivery_north"
                    value={form.delivery_north}
                    onChange={handleFormChange}
                    placeholder="e.g. 3-5 Business Days ($89)"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">South Island Delivery</label>
                  <input
                    type="text"
                    className="form-input"
                    name="delivery_south"
                    value={form.delivery_south}
                    onChange={handleFormChange}
                    placeholder="e.g. 4-7 Business Days ($129)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Callout Section for Winz, Finance, About, etc. */}
          {(activePageKey === 'winz' || activePageKey === 'finance' || activePageKey === 'about') && (
            <div className="admin-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--accent-color, #d4af37)', display: 'block', marginBottom: '12px' }}>
                03. Secondary Callout & Action Box
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Callout Title</label>
                  <input
                    type="text"
                    className="form-input"
                    name="callout_title"
                    value={form.callout_title}
                    onChange={handleFormChange}
                    placeholder="e.g. Fast 3-Step WinZ Quotations"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Callout Badge</label>
                  <input
                    type="text"
                    className="form-input"
                    name="callout_badge"
                    value={form.callout_badge}
                    onChange={handleFormChange}
                    placeholder="e.g. APPROVED SUPPLIER"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Callout Details / Steps</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  name="callout_text"
                  value={form.callout_text}
                  onChange={handleFormChange}
                  placeholder="e.g. Choose items -> Request formal quote -> Submit to Work & Income."
                />
              </div>
            </div>
          )}

          {/* Sticky Bottom Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--sidebar-bg, #111827)',
              border: '1px solid var(--border-color)',
              position: 'sticky',
              bottom: '16px',
              zIndex: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Currently editing: <strong>{activePageLabel}</strong>
            </span>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving || loading}
              style={{ padding: '10px 26px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {saving ? 'Publishing Changes...' : 'Save & Publish Page Content'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PageEditor;
