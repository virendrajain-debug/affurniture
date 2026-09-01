import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

// ─── Rich Text Editor ───────────────────────────────────────
function RTE({ value, onChange, placeholder = 'Enter formatted content…', minHeight = 120 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) ref.current.innerHTML = value || ''
  }, [value])
  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg)
    if (ref.current) onChange(ref.current.innerHTML)
  }
  const onInput = () => { if (ref.current) onChange(ref.current.innerHTML) }

  const fmtBtns = [
    { label: 'B',       cmd: 'bold',                style: { fontWeight: 'bold' } },
    { label: 'I',       cmd: 'italic',              style: { fontStyle: 'italic' } },
    { label: 'U',       cmd: 'underline',           style: { textDecoration: 'underline' } },
    { label: 'H2',      cmd: 'formatBlock',         arg: '<h2>' },
    { label: 'H3',      cmd: 'formatBlock',         arg: '<h3>' },
    { label: '¶',       cmd: 'formatBlock',         arg: '<p>' },
    { label: '• List',  cmd: 'insertUnorderedList', arg: null },
    { label: '1. List', cmd: 'insertOrderedList',   arg: null },
  ]

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        {fmtBtns.map(({ label, cmd, arg, style }) => (
          <button key={label} type="button" onMouseDown={e => { e.preventDefault(); exec(cmd, arg) }} style={style}>{label}</button>
        ))}
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('removeFormat') }} style={{ marginLeft: 'auto' }}>✕ Clear</button>
      </div>
      <div
        ref={ref}
        className="rte-body"
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onBlur={onInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  )
}

// ─── Field helpers ───────────────────────────────────────────
function F({ label, children, tip }) {
  return (
    <div className="form-group" style={{ margin: 0 }}>
      <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {tip && <span style={{ color: 'var(--accent-color,#d4af37)', fontWeight: 400, fontSize: '0.7rem' }}>{tip}</span>}
      </label>
      {children}
    </div>
  )
}
function TF({ f, form, set, placeholder }) {
  return <input type="text" className="form-input" value={form[f] || ''} onChange={e => set(f, e.target.value)} placeholder={placeholder || f} />
}
function TA({ f, form, set, placeholder }) {
  return <textarea className="form-input" rows={3} value={form[f] || ''} onChange={e => set(f, e.target.value)} placeholder={placeholder || f} style={{ resize: 'vertical' }} />
}
function Card({ title, children }) {
  return (
    <div className="admin-card" style={{ padding: 20, borderRadius: 12 }}>
      <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}
function Row2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
}
function Row12({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>{children}</div>
}
function ValCardRow({ num, form, set }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.18)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-color,#d4af37)' }}>Value Card {num}</div>
      <F label="Card Title"><TF f={`val_${num}_title`} form={form} set={set} placeholder="e.g. Quality First" /></F>
      <F label="Card Description (Rich Text)" tip="Formatting Enabled">
        <RTE value={form[`val_${num}_desc`] || ''} onChange={v => set(`val_${num}_desc`, v)} placeholder="Enter value description…" minHeight={80} />
      </F>
    </div>
  )
}

// ─── Page list ───────────────────────────────────────────────
const PAGES = [
  { key: 'about', label: 'About Us Page' },
  { key: 'home', label: 'Home Page' },
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
  const [pageKey, setPageKey] = useState(
    routeKey ? (routeKey === 'winz-quotes' ? 'winz' : routeKey === 'finance-guide' ? 'finance' : routeKey) : 'about'
  )
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500) }
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const load = useCallback(async (key) => {
    setLoading(true)
    try {
      const r = await fetch(`${API_BASE}/api/pages/${key}`)
      if (r.ok) { const d = await r.json(); if (d && typeof d === 'object') { setForm(d) } }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load(pageKey) }, [pageKey])

  const save = async () => {
    setSaving(true)
    try {
      const r = await fetch(`${API_BASE}/api/pages/${pageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify(form),
      })
      showToast(r.ok ? 'Page texts published live on website!' : 'Saved (check backend logs for detail)', r.ok ? 'success' : 'warning')
      load(pageKey)
    } catch { showToast('Connection error.', 'error') }
    finally { setSaving(false) }
  }

  const PublishBtn = () => (
    <button type="button" onClick={save} disabled={saving || loading}
      style={{ padding: '8px 24px', background: 'var(--accent-color,#d4af37)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      {saving ? 'Publishing…' : 'Publish Page Texts'}
    </button>
  )

  return (
    <div className="admin-page" style={{ maxWidth: 1080, margin: '0 auto' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Toolbar */}
      <div style={{ background: 'var(--sidebar-bg,#111827)', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Edit Page Texts:</label>
          <select className="filter-select" value={pageKey} onChange={e => { setPageKey(e.target.value); navigate(`/dashboard/pages/${e.target.value}`) }} style={{ minWidth: 280, fontWeight: 600 }}>
            {PAGES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <PublishBtn />
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading live text…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ═══════════════ ABOUT US ═══════════════ */}
          {pageKey === 'about' && (<>
            <Card title="1 · Top Hero Header — Eyebrow, Title & Subtitle">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. OUR STORY" /></F>
                <F label="Page Main Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. About AF Furnishings" /></F>
              </Row12>
              <F label="Hero Subtitle / Tagline"><TF f="subtitle" form={form} set={set} placeholder="e.g. Quality furniture for every New Zealand home" /></F>
            </Card>

            <Card title="2 · Our Story Section">
              <Row2>
                <F label="Section Eyebrow Label"><TF f="callout_badge" form={form} set={set} placeholder="e.g. WHO WE ARE" /></F>
                <F label="Section Heading (H2)"><TF f="callout_title" form={form} set={set} placeholder="e.g. AF Furnishings" /></F>
              </Row2>
              <F label="Story Rich-Text Description" tip="Formatting Toolbar Enabled">
                <RTE value={form.story_content || form.content || ''} onChange={v => { set('story_content', v); set('content', v) }} placeholder="Tell your company story here…" />
              </F>
            </Card>

            <Card title="3 · Our Values Section">
              <F label="Values Section Heading (displayed above the 3 cards)">
                <TF f="about_mission" form={form} set={set} placeholder="e.g. What we stand for." />
              </F>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 14 }}>
                <ValCardRow num={1} form={form} set={set} />
                <ValCardRow num={2} form={form} set={set} />
                <ValCardRow num={3} form={form} set={set} />
              </div>
            </Card>

            <Card title="4 · Showroom Showcase">
              <Row2>
                <F label="Showroom Heading (H3)"><TF f="showroom_title" form={form} set={set} placeholder="e.g. Experience Comfort in Person" /></F>
                <F label="Showroom Subtitle"><TF f="showroom_subtitle" form={form} set={set} placeholder="Optional subtitle or tagline" /></F>
              </Row2>
              <F label="Showroom Description (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.showroom_desc || ''} onChange={v => set('showroom_desc', v)} placeholder="Describe the showroom experience…" minHeight={90} />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ HOME ═══════════════ */}
          {pageKey === 'home' && (<>
            {[1,2,3].map(n => (
              <Card key={n} title={`Hero Slide ${n} Texts`}>
                <Row2>
                  <F label="Eyebrow / Tagline"><TF f={`hero_${n}_label`} form={form} set={set} placeholder="e.g. AF FURNISHINGS" /></F>
                  <F label="Slide Title (H1)"><TF f={`hero_${n}_title`} form={form} set={set} placeholder="e.g. Comfort made for everyday living." /></F>
                </Row2>
                <Row2>
                  <F label="Slide Subtitle / Description"><TF f={`hero_${n}_subtitle`} form={form} set={set} placeholder="Supporting tagline text" /></F>
                  <F label="CTA Button Link"><TF f={`hero_${n}_cta_link`} form={form} set={set} placeholder="e.g. /category/lounge-suite" /></F>
                </Row2>
              </Card>
            ))}
            <Card title="Weekly Deals Section Texts">
              <Row2>
                <F label="Deals Headline"><TF f="deals_headline" form={form} set={set} placeholder="e.g. Weekly Deals & Clearance" /></F>
                <F label="Deals Subtitle"><TF f="deals_subtitle" form={form} set={set} placeholder="e.g. Save big on selected essentials" /></F>
              </Row2>
            </Card>
          </>)}

          {/* ═══════════════ WINZ ═══════════════ */}
          {pageKey === 'winz' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. OFFICIAL SUPPLIER" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Work and Income (WINZ) Quotes" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Short supporting statement" /></F>
            </Card>
            <Card title="Intro Body Content">
              <F label="Introduction Paragraphs (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || form.intro_content || ''} onChange={v => { set('content', v); set('intro_content', v) }} placeholder="How WINZ quotes work, process steps…" />
              </F>
            </Card>
            <Card title="Catalogue Picks Section">
              <F label="Section Heading"><TF f="range_heading" form={form} set={set} placeholder="e.g. Home essentials." /></F>
              <F label="Section Subtitle"><TF f="range_subtitle" form={form} set={set} placeholder="e.g. Explore practical furniture choices for a comfortable home." /></F>
            </Card>
            <Card title="Quote CTA Section">
              <Row2>
                <F label="CTA Eyebrow"><TF f="cta_eyebrow" form={form} set={set} placeholder="e.g. READY TO ORDER?" /></F>
                <F label="CTA Heading"><TF f="cta_title" form={form} set={set} placeholder="e.g. Get your WINZ quote today." /></F>
              </Row2>
              <F label="CTA Body Text"><TF f="cta_body" form={form} set={set} placeholder="e.g. We supply official registered WINZ itemised quotes." /></F>
            </Card>
          </>)}

          {/* ═══════════════ FINANCE ═══════════════ */}
          {pageKey === 'finance' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. EASY WEEKLY PLANS" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Flexible Furniture Finance" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Finance Body Content">
              <F label="Body Content (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Finance options, steps, terms…" />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ DELIVERY INFO ═══════════════ */}
          {pageKey === 'delivery-info' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. SHIPPING & LOGISTICS" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Delivery Information" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Delivery Content">
              <F label="Body Content (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Delivery timeframes, rates, regions…" />
              </F>
            </Card>
            <Card title="Delivery Rate Callouts (Optional)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <F label="Auckland / Metro Rate"><TF f="delivery_auckland" form={form} set={set} placeholder="e.g. 1-3 Business Days ($49)" /></F>
                <F label="North Island Rate"><TF f="delivery_north" form={form} set={set} placeholder="e.g. 3-5 Business Days ($89)" /></F>
                <F label="South Island Rate"><TF f="delivery_south" form={form} set={set} placeholder="e.g. 4-7 Business Days ($129)" /></F>
              </div>
            </Card>
          </>)}

          {/* ═══════════════ RETURNS ═══════════════ */}
          {pageKey === 'returns' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. OUR GUARANTEE" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Returns & 7-Day In-Home Trial Policy" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Returns Policy Content">
              <F label="Policy Content (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Returns process, conditions, exclusions…" />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ TERMS ═══════════════ */}
          {pageKey === 'terms' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. LEGAL & COMPLIANCE" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Terms & Conditions of Service" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Terms Content">
              <F label="Terms Body (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Terms, warranty, payment clauses…" />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ PRIVACY POLICY ═══════════════ */}
          {pageKey === 'privacy-policy' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. DATA PROTECTION" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Privacy & Customer Data Policy" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Privacy Policy Content">
              <F label="Policy Body (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Data collection, storage, rights…" />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ SHOP FURNITURE ═══════════════ */}
          {pageKey === 'shop-furniture' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. CATALOGUE GUIDE" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Shop Handcrafted Furniture" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Shop Furniture Content">
              <F label="Body Content (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Collections overview, categories…" />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ CONTACT ═══════════════ */}
          {pageKey === 'contact' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. GET IN TOUCH" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Contact AF Furnishings" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Contact Details">
              <Row2>
                <F label="Phone Number"><TF f="phone" form={form} set={set} placeholder="e.g. 0800 23 3876" /></F>
                <F label="Email Address"><TF f="email" form={form} set={set} placeholder="e.g. support@affurnishings.co.nz" /></F>
              </Row2>
              <F label="Store Address"><TF f="address" form={form} set={set} placeholder="e.g. 123 Great South Road, Penrose, Auckland" /></F>
              <F label="Opening Hours"><TF f="hours" form={form} set={set} placeholder="e.g. Mon–Sat 9am–5:30pm · Sun 10am–4pm" /></F>
            </Card>
            <Card title="Contact Page Body Content">
              <F label="Body Content (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Opening times, FAQ, directions…" />
              </F>
            </Card>
          </>)}

          {/* ═══════════════ STORE LOCATIONS ═══════════════ */}
          {pageKey === 'store-locations' && (<>
            <Card title="Hero Section Texts">
              <Row12>
                <F label="Eyebrow Badge"><TF f="eyebrow" form={form} set={set} placeholder="e.g. PHYSICAL STORES" /></F>
                <F label="Page Title (H1)"><TF f="title" form={form} set={set} placeholder="e.g. Visit Our Showrooms" /></F>
              </Row12>
              <F label="Hero Subtitle"><TF f="subtitle" form={form} set={set} placeholder="Supporting tagline" /></F>
            </Card>
            <Card title="Stores Section Texts">
              <Row2>
                <F label="Section Eyebrow"><TF f="stores_eyebrow" form={form} set={set} placeholder="e.g. OUR STORES" /></F>
                <F label="Section Heading"><TF f="stores_heading" form={form} set={set} placeholder="e.g. Find us near you." /></F>
              </Row2>
              <F label="Body Content (Rich Text)" tip="Formatting Enabled">
                <RTE value={form.content || ''} onChange={v => set('content', v)} placeholder="Showroom features, hours, directions…" />
              </F>
            </Card>
          </>)}

          {/* Bottom Publish */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <PublishBtn />
          </div>
        </div>
      )}
    </div>
  )
}

export default PageEditor;
