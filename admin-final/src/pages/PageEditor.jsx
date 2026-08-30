// ============================================================
// Luxury Pages & Media Visual Studio
// ============================================================
// Features:
//  - Luxury Segmented Tab Switcher with kinetic scroll & glow indicators
//  - Complete 8-Page Data Editors & Rich Layout Slots:
//      1. 🏠 Home Page (Static Hero + Carousel Slider + Promotional Ad Showcase)
//      2. 📖 About Us (1-1-3-1 Image Slots + Story Bio + 3 Core Values + Team Banner)
//      3. 🚚 Delivery Information (Banner + Rich Text Editor + Live Storefront Preview)
//      4. 🔄 Returns Policy (Banner + Rich Text Editor + Live Storefront Preview)
//      5. 📜 Terms & Conditions (Banner + Rich Text Editor + Live Storefront Preview)
//      6. 🔒 Privacy Policy (Banner + Rich Text Editor + Live Storefront Preview)
//      7. 🛋️ Shop Furniture (Banner + Category Intro & Guide + Live Storefront Preview)
//      8. 📍 Contact & Store Locations (Banner + Contact Info + Live Map Iframe + Showrooms)
//  - Minimalist purged headers allowing clean executive layout
//  - Real-time WYSIWYG rich text editor with side-by-side storefront live preview
//  - Sticky / floating action bar with micro-success notifications
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

export const PAGES_CONFIG = [
  { key: 'home', icon: '🏠', label: 'Home' },
  { key: 'about', icon: '📖', label: 'About Us' },
  { key: 'delivery-info', icon: '🚚', label: 'Delivery Info' },
  { key: 'returns', icon: '🔄', label: 'Returns Policy' },
  { key: 'terms', icon: '📜', label: 'Terms & Conditions' },
  { key: 'privacy-policy', icon: '🔒', label: 'Privacy Policy' },
  { key: 'shop-furniture', icon: '🛋️', label: 'Shop Furniture' },
  { key: 'contact', icon: '📍', label: 'Contact & Locations' },
]

// ============================================================
// Rich Text Editor Component with WYSIWYG & Raw HTML
// ============================================================
function RichTextEditor({ value, onChange, placeholder = 'Type your content here...' }) {
  const [mode, setMode] = useState('visual') // 'visual' | 'html'
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, mode])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCmd = (cmd, val = null) => {
    if (mode !== 'visual') return
    document.execCommand(cmd, false, val)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInsertLink = () => {
    if (mode !== 'visual') return
    const url = window.prompt('Enter URL (e.g. https://... or /products):')
    if (url) {
      execCmd('createLink', url)
    }
  }

  return (
    <div className="rte-container">
      {/* Editor Toolbar */}
      <div className="rte-toolbar">
        {/* View Mode Toggle */}
        <div className="rte-btn-group" style={{ marginRight: '6px' }}>
          <button
            type="button"
            className={`rte-btn ${mode === 'visual' ? 'active' : ''}`}
            onClick={() => setMode('visual')}
            title="Visual WYSIWYG Editor"
          >
            Visual
          </button>
          <button
            type="button"
            className={`rte-btn ${mode === 'html' ? 'active' : ''}`}
            onClick={() => setMode('html')}
            title="Raw HTML Source Code"
          >
            &lt;/&gt; HTML
          </button>
        </div>

        <div className="rte-separator" />

        {/* Formatting Actions */}
        {mode === 'visual' ? (
          <>
            <div className="rte-btn-group">
              <button type="button" className="rte-btn" onClick={() => execCmd('bold')} title="Bold (Ctrl+B)">
                <strong>B</strong>
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('italic')} title="Italic (Ctrl+I)">
                <em>I</em>
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('underline')} title="Underline (Ctrl+U)">
                <u>U</u>
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('strikeThrough')} title="Strikethrough">
                <s>S</s>
              </button>
            </div>

            <div className="rte-separator" />

            <div className="rte-btn-group">
              <button type="button" className="rte-btn" onClick={() => execCmd('formatBlock', '<h2>')} title="Heading 2">
                H2
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('formatBlock', '<h3>')} title="Heading 3">
                H3
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('formatBlock', '<p>')} title="Normal Paragraph">
                P
              </button>
            </div>

            <div className="rte-separator" />

            <div className="rte-btn-group">
              <button type="button" className="rte-btn" onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
                • List
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('insertOrderedList')} title="Numbered List">
                1. List
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('formatBlock', '<blockquote>')} title="Quote Block">
                “ Quote
              </button>
            </div>

            <div className="rte-separator" />

            <div className="rte-btn-group">
              <button type="button" className="rte-btn" onClick={() => execCmd('justifyLeft')} title="Align Left">
                ⇤
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('justifyCenter')} title="Align Center">
                ≡
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('justifyRight')} title="Align Right">
                ⇥
              </button>
            </div>

            <div className="rte-separator" />

            <div className="rte-btn-group">
              <button type="button" className="rte-btn" onClick={handleInsertLink} title="Insert Link">
                🔗 Link
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('insertHorizontalRule')} title="Horizontal Divider">
                ―
              </button>
              <button type="button" className="rte-btn" onClick={() => execCmd('removeFormat')} title="Clear Formatting">
                ✕ Clear
              </button>
            </div>
          </>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
            Editing Raw HTML Source Code directly.
          </span>
        )}
      </div>

      {/* Editor Body */}
      {mode === 'visual' ? (
        <div
          ref={editorRef}
          className="rte-editor-area"
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          placeholder={placeholder}
        />
      ) : (
        <textarea
          className="rte-code-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<h1>Type HTML source here...</h1>"
        />
      )}
    </div>
  )
}

// ============================================================
// Real-Time Live Standard Storefront Preview Pane Component
// ============================================================
function LivePreviewPane({ pageSlug, title, subtitle, bannerImage, bodyHtml }) {
  return (
    <div className="rte-preview-pane">
      {/* Storefront Header Bar */}
      <div style={{ background: '#29251f', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>AF FURNISHINGS</span>
        <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>Storefront Live Preview</span>
      </div>

      {/* Realistic Hero Banner */}
      <div className="rte-preview-hero">
        <img
          src={bannerImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'}
          alt={title || pageSlug}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/1200x500?text=Header+Banner' }}
        />
        <div className="rte-preview-hero-overlay">
          <span className="rte-preview-badge">{pageSlug.replace('-', ' ')}</span>
          <h1 className="rte-preview-title">{title || 'Page Title'}</h1>
          {subtitle && <p className="rte-preview-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Storefront Styled Body Content */}
      <div
        className="rte-preview-body"
        dangerouslySetInnerHTML={{
          __html: bodyHtml || '<p style="color: #888; font-style: italic;">No content written yet. Start typing in the editor on the left to see live changes.</p>',
        }}
      />
    </div>
  )
}

// ============================================================
// Real-Time Live About Us Storefront Preview Pane Component
// ============================================================
function AboutLivePreviewPane({ aboutData, aboutSlots }) {
  return (
    <div className="rte-preview-pane">
      {/* Storefront Header Bar */}
      <div style={{ background: '#29251f', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>AF FURNISHINGS</span>
        <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>About Us Live Preview</span>
      </div>

      {/* Hero Banner (Slot 1) */}
      <div className="rte-preview-hero">
        <img
          src={aboutSlots.slot1_top_banner || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'}
          alt="About Hero"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/1200x500?text=Hero+Banner' }}
        />
        <div className="rte-preview-hero-overlay">
          <span className="rte-preview-badge">OUR STORY</span>
          <h1 className="rte-preview-title">{aboutData.company_name || 'About AF Furnishings'}</h1>
          <p className="rte-preview-subtitle">{aboutData.tagline || 'Quality furniture for every New Zealand home'}</p>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px', color: '#28241f', background: '#fffdf9' }}>
        {/* Story Section (Slot 2) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px', alignItems: 'center' }}>
          <div style={{ borderRadius: '8px', overflow: 'hidden', height: '170px' }}>
            <img src={aboutSlots.slot2_feature_img || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85'} alt="Who We Are" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Feature' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aa7a3e', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              {aboutData.story_title || 'WHO WE ARE'}
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#28241f', margin: '0 0 8px' }}>
              {aboutData.company_name || 'AF Furnishings'}
            </h2>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#4a453e', margin: '0 0 6px' }}>
              {aboutData.story_p1 || aboutData.description}
            </p>
            {aboutData.story_p2 && (
              <p style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#4a453e', margin: 0 }}>
                {aboutData.story_p2}
              </p>
            )}
          </div>
        </div>

        {/* Values Section (Slot 3 A, B, C) */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aa7a3e', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
              OUR VALUES
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#28241f', margin: 0 }}>
              {aboutData.values_title || 'What we stand for.'}
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {/* Value 1 */}
            <div style={{ background: '#f8f5ee', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ height: '80px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                <img src={aboutSlots.slot3_img_a || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'} alt="Value 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Card+1' }} />
              </div>
              <strong style={{ fontSize: '0.82rem', color: '#28241f', display: 'block', marginBottom: '3px' }}>{aboutData.value1_title || 'Quality First'}</strong>
              <p style={{ fontSize: '0.72rem', color: '#6a655e', lineHeight: 1.35, margin: 0 }}>{aboutData.value1_desc}</p>
            </div>
            {/* Value 2 */}
            <div style={{ background: '#f8f5ee', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ height: '80px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                <img src={aboutSlots.slot3_img_b || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'} alt="Value 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Card+2' }} />
              </div>
              <strong style={{ fontSize: '0.82rem', color: '#28241f', display: 'block', marginBottom: '3px' }}>{aboutData.value2_title || 'Comfort Always'}</strong>
              <p style={{ fontSize: '0.72rem', color: '#6a655e', lineHeight: 1.35, margin: 0 }}>{aboutData.value2_desc}</p>
            </div>
            {/* Value 3 */}
            <div style={{ background: '#f8f5ee', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ height: '80px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                <img src={aboutSlots.slot3_img_c || 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80'} alt="Value 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Card+3' }} />
              </div>
              <strong style={{ fontSize: '0.82rem', color: '#28241f', display: 'block', marginBottom: '3px' }}>{aboutData.value3_title || 'For Every Home'}</strong>
              <p style={{ fontSize: '0.72rem', color: '#6a655e', lineHeight: 1.35, margin: 0 }}>{aboutData.value3_desc}</p>
            </div>
          </div>
        </div>

        {/* Team Section (Slot 4) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aa7a3e', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              OUR TEAM
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#28241f', margin: '0 0 6px' }}>
              {aboutData.team_title || 'Meet the people behind AF Furnishings.'}
            </h3>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#4a453e', margin: 0 }}>
              {aboutData.team_desc}
            </p>
          </div>
          <div style={{ borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
            <img src={aboutSlots.slot4_bottom_banner || 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85'} alt="Team Showroom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Team+Showroom' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Real-Time Live Contact & Locations Preview Pane
// ============================================================
function ContactLivePreviewPane({ contactData, storeLocations, bannerImg }) {
  return (
    <div className="rte-preview-pane">
      {/* Storefront Header Bar */}
      <div style={{ background: '#29251f', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>AF FURNISHINGS</span>
        <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>Contact & Locations Live Preview</span>
      </div>

      {/* Hero Banner */}
      <div className="rte-preview-hero">
        <img
          src={bannerImg || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=85'}
          alt="Contact Header"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/1200x500?text=Contact+Banner' }}
        />
        <div className="rte-preview-hero-overlay">
          <span className="rte-preview-badge">GET IN TOUCH</span>
          <h1 className="rte-preview-title">Contact &amp; Showrooms</h1>
          <p className="rte-preview-subtitle">We would love to hear from you — visit our showrooms or reach out anytime</p>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#fffdf9' }}>
        {/* Contact Info Overview Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8f5ee', padding: '16px', borderRadius: '10px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#aa7a3e', textTransform: 'uppercase' }}>Direct Phone</span>
            <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.9rem', color: '#28241f' }}>{contactData.phone || '0800 222 548'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#aa7a3e', textTransform: 'uppercase' }}>Customer Support</span>
            <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.9rem', color: '#28241f' }}>{contactData.email || 'affurniture@gmail.com'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#aa7a3e', textTransform: 'uppercase' }}>Main Showroom</span>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#4a453e' }}>{contactData.address || 'Auckland, New Zealand'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#aa7a3e', textTransform: 'uppercase' }}>Opening Hours</span>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#4a453e' }}>{contactData.hours || 'Mon-Sat: 9am - 5:30pm | Sun: 10am - 4:30pm'}</p>
          </div>
        </div>

        {/* Real-time Map Iframe Preview */}
        {contactData.google_map_url && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#aa7a3e', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Live Interactive Map Preview
            </span>
            <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <iframe
                src={contactData.google_map_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Google Maps Preview"
              />
            </div>
          </div>
        )}

        {/* Showrooms Grid */}
        {storeLocations.length > 0 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#aa7a3e', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Showroom Locations ({storeLocations.length})
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {storeLocations.map((loc) => (
                <div key={loc.id} style={{ background: '#fff', border: '1px solid #eae6df', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#28241f', display: 'block', marginBottom: '2px' }}>{loc.name}</strong>
                  <p style={{ fontSize: '0.78rem', color: '#6a655e', margin: '0 0 4px' }}>{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>
                  {loc.phone && <p style={{ fontSize: '0.75rem', color: '#aa7a3e', margin: 0 }}>📞 {loc.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Real-Time Live Home Storefront Preview Pane
// ============================================================
function HomeLivePreviewPane({ activeBannerImg, bannersList, homePromo }) {
  const activeHero = bannersList.find(b => b.active) || {
    title: 'Quality Furniture for Every Home',
    subtitle: 'Comfort made for everyday living in New Zealand.',
    button_text: 'Shop Living Room',
    button_link: '/category/living-room',
    image: activeBannerImg || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'
  }

  return (
    <div className="rte-preview-pane">
      {/* Storefront Header Bar */}
      <div style={{ background: '#29251f', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>AF FURNISHINGS</span>
        <span style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase' }}>Home Page Live Preview</span>
      </div>

      {/* Hero Carousel Simulation */}
      <div className="rte-preview-hero" style={{ height: '220px' }}>
        <img
          src={activeHero.image || activeBannerImg || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'}
          alt="Home Hero"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/1200x500?text=Hero+Carousel' }}
        />
        <div className="rte-preview-hero-overlay">
          <span className="rte-preview-badge">NEW ZEALAND LIVING</span>
          <h1 className="rte-preview-title" style={{ fontSize: '1.35rem' }}>{activeHero.title || 'Quality Furniture for Every Home'}</h1>
          <p className="rte-preview-subtitle">{activeHero.subtitle || 'Comfort made for everyday living.'}</p>
          {activeHero.button_text && (
            <div style={{ marginTop: '10px' }}>
              <span style={{ background: '#aa7a3e', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                {activeHero.button_text} &rarr;
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rotating Carousel Indicators */}
      {bannersList.length > 0 && (
        <div style={{ background: '#221f1a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.7rem', color: '#aa7a3e', fontWeight: 700, textTransform: 'uppercase' }}>Active Slides ({bannersList.filter(b => b.active).length}):</span>
          {bannersList.map((b, idx) => (
            <span
              key={b.id || idx}
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: b.active ? '#aa7a3e' : 'rgba(255,255,255,0.1)',
                color: b.active ? '#fff' : 'rgba(255,255,255,0.6)',
                whiteSpace: 'nowrap'
              }}
            >
              {idx + 1}. {b.title ? b.title.slice(0, 18) : 'Slide'}
            </span>
          ))}
        </div>
      )}

      {/* Promotional Ad Banner Slot Preview */}
      <div style={{ padding: '18px 20px', background: '#fffdf9' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#aa7a3e', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Promotional Ad Showcase Slot
        </span>
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '120px', background: '#29251f' }}>
          <img
            src={homePromo.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80'}
            alt="Weekly Special"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
            onError={(e) => { e.target.src = 'https://placehold.co/1200x400?text=Weekly+Special+Promo' }}
          />
          <div style={{ position: 'absolute', inset: 0, padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
            <span style={{ background: '#aa7a3e', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, width: 'fit-content', marginBottom: '4px' }}>
              WEEKLY SPECIAL
            </span>
            <strong style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>{homePromo.title || 'Up to 30% Off Living Room Suites'}</strong>
            <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>{homePromo.subtitle || 'Shop our limited-time contemporary lounge deals.'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main PageEditor Studio Component
// ============================================================
function PageEditor({ token }) {
  const { pageKey } = useParams()
  const navigate = useNavigate()
  
  // Normalize store-locations to contact tab if route matched
  const rawKey = (pageKey || 'home').toLowerCase()
  const activeKey = rawKey === 'store-locations' ? 'contact' : rawKey

  // Page Content State
  const [pageData, setPageData] = useState({
    title: '',
    subtitle: '',
    body_html: '',
    meta_description: '',
    banner_image: '',
  })

  // View Layout Mode: 'split' | 'editor' | 'preview'
  const [viewLayout, setViewLayout] = useState('split')

  const [activeBannerImg, setActiveBannerImg] = useState('')
  const [bannersList, setBannersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // 1-1-3-1 About Us State
  const [aboutData, setAboutData] = useState({
    company_name: 'AF Furnishings',
    tagline: 'Quality furniture for every New Zealand home',
    story_title: 'WHO WE ARE',
    description: 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.',
    story_p1: 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.',
    story_p2: 'Founded in New Zealand, we have been serving families across the country with beautiful, durable furniture at honest prices. Our showrooms in Auckland and Wellington showcase our carefully curated collections.',
    values_title: 'What we stand for.',
    value1_title: 'Quality First',
    value1_desc: 'Every piece of furniture is crafted from premium materials, built to last for years of daily use.',
    value2_title: 'Comfort Always',
    value2_desc: 'We test every sofa, chair and bed to ensure it meets our comfort standards before it reaches you.',
    value3_title: 'For Every Home',
    value3_desc: 'With flexible weekly payments, we make quality furniture accessible to every New Zealand family.',
    team_title: 'Meet the people behind AF Furnishings.',
    team_desc: 'Our team of friendly furniture experts is here to help you find the perfect pieces for your home. From selecting the right sofa to planning your dream bedroom, we guide you every step of the way. Visit our showrooms in Auckland or Wellington, or contact us online for a virtual consultation.',
    address: 'Auckland, New Zealand',
    phone: '0800 222 548',
    email: 'affurniture@gmail.com',
  })

  const [aboutSlots, setAboutSlots] = useState({
    slot1_top_banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    slot2_feature_img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85',
    slot3_img_a: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    slot3_img_b: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
    slot3_img_c: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80',
    slot4_bottom_banner: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85',
  })

  // Home Multi-Banner Slider State
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    button_link: '',
    image: '',
    active: 1,
  })

  // Home Promotional Ad Showcase Slot State
  const [homePromo, setHomePromo] = useState({
    title: 'Up to 30% Off Living Room Suites',
    subtitle: 'Limited-time deals on contemporary lounge suites.',
    button_text: 'Explore Sale',
    button_link: '/on-sale',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80',
  })

  // Contact & Locations State
  const [contactData, setContactData] = useState({
    phone: '0800 222 548',
    email: 'affurniture@gmail.com',
    address: '123 Queen Street, Auckland',
    hours: 'Mon-Sat: 9am - 5:30pm | Sun: 10am - 4:30pm',
    google_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.3!2d174.76!3d-36.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1',
  })

  const [storeLocations, setStoreLocations] = useState([])
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    google_map_url: '',
    description: '',
    active: 1,
  })
  const [editingLocation, setEditingLocation] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const getActiveAuthToken = () => {
    return (
      getAuthToken(token) ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('af_admin_token') ||
      ''
    )
  }

  // Load active page data
  const loadPageData = async () => {
    setLoading(true)
    const authToken = getActiveAuthToken()

    try {
      if (activeKey === 'about') {
        // Load About Us 1-1-3-1 Data
        const res = await fetch(`${API_BASE}/api/about`)
        if (res.ok) {
          const data = await res.json()
          setAboutData(data)
          setAboutSlots({
            slot1_top_banner: data.slot1_top_banner || '',
            slot2_feature_img: data.slot2_feature_img || '',
            slot3_img_a: data.slot3_img_a || '',
            slot3_img_b: data.slot3_img_b || '',
            slot3_img_c: data.slot3_img_c || '',
            slot4_bottom_banner: data.slot4_bottom_banner || '',
          })
          setActiveBannerImg(data.slot1_top_banner || '')
        }
      } else if (activeKey === 'home') {
        // Load Hero Slider banners & Promo Ad
        const slidersRes = await fetch(`${API_BASE}/api/hero-sliders`)
        if (slidersRes.ok) {
          const data = await slidersRes.json()
          setBannersList(Array.isArray(data) ? data : [])
        }

        // Load Static Page Banner
        const pageRes = await fetch(`${API_BASE}/api/pages/home`)
        if (pageRes.ok) {
          const data = await pageRes.json()
          setPageData(data)
          setActiveBannerImg(data.banner_image || '')
        }

        // Load Ad Campaign Promo Slot
        const adRes = await fetch(`${API_BASE}/api/ad-campaigns`)
        if (adRes.ok) {
          const ads = await adRes.json()
          if (Array.isArray(ads) && ads.length > 0) {
            setHomePromo({
              title: ads[0].title || 'Up to 30% Off Living Room Suites',
              subtitle: ads[0].subtitle || 'Limited-time deals on contemporary lounge suites.',
              button_text: ads[0].button_text || 'Explore Sale',
              button_link: ads[0].button_link || '/on-sale',
              image: ads[0].image_url || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80',
            })
          }
        }
      } else if (activeKey === 'contact') {
        // Load Contact Info & Showrooms
        const pageRes = await fetch(`${API_BASE}/api/pages/contact`)
        if (pageRes.ok) {
          const data = await pageRes.json()
          setPageData(data)
          setActiveBannerImg(data.banner_image || '')
        }
        const aboutRes = await fetch(`${API_BASE}/api/about`)
        if (aboutRes.ok) {
          const data = await aboutRes.json()
          setContactData({
            phone: data.phone || '0800 222 548',
            email: data.email || 'affurniture@gmail.com',
            address: data.address || 'Auckland, New Zealand',
            hours: 'Mon-Sat: 9am - 5:30pm | Sun: 10am - 4:30pm',
            google_map_url: data.google_map_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.3!2d174.76!3d-36.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1',
          })
        }
        const locsRes = await fetch(`${API_BASE}/api/store-locations`)
        if (locsRes.ok) {
          const data = await locsRes.json()
          setStoreLocations(Array.isArray(data) ? data : [])
        }
      } else {
        // Standard Rich Text Pages (delivery-info, returns, terms, privacy-policy, shop-furniture)
        const res = await fetch(`${API_BASE}/api/pages/${activeKey}`)
        if (res.ok) {
          const data = await res.json()
          setPageData(data)
          setActiveBannerImg(data.banner_image || '')
        }
      }
    } catch (err) {
      console.error('Failed to load page content:', err)
      showToast('Failed to load page content', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [activeKey, token])

  // Save standard page content
  const handleSavePage = async () => {
    setSaving(true)
    const authToken = getActiveAuthToken()

    try {
      const res = await fetch(`${API_BASE}/api/pages/${activeKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...pageData,
          banner_image: activeBannerImg || pageData.banner_image,
        }),
      })

      if (res.ok) {
        showToast(`${PAGES_CONFIG.find(p => p.key === activeKey)?.label || 'Page'} published successfully!`, 'success')
      } else {
        showToast('Failed to save page changes', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Save 1-1-3-1 About Us architecture
  const handleSaveAbout = async () => {
    setSaving(true)
    const authToken = getActiveAuthToken()

    try {
      const payload = {
        ...aboutData,
        ...aboutSlots,
      }
      const res = await fetch(`${API_BASE}/api/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('About Us story & slots published successfully!', 'success')
      } else {
        showToast('Failed to update About Us', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Save Contact & Store Settings
  const handleSaveContact = async () => {
    setSaving(true)
    const authToken = getActiveAuthToken()

    try {
      await fetch(`${API_BASE}/api/pages/contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ ...pageData, banner_image: activeBannerImg || pageData.banner_image }),
      })

      await fetch(`${API_BASE}/api/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ ...aboutData, phone: contactData.phone, email: contactData.email, address: contactData.address }),
      })

      showToast('Contact info & locations updated successfully!', 'success')
    } catch {
      showToast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Save Home Promotional Ad Showcase Slot
  const handleSaveHomePromo = async () => {
    setSaving(true)
    const authToken = getActiveAuthToken()
    try {
      const res = await fetch(`${API_BASE}/api/ad-campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          title: homePromo.title,
          subtitle: homePromo.subtitle,
          button_text: homePromo.button_text,
          button_link: homePromo.button_link,
          image_url: homePromo.image,
          active: 1
        })
      })
      if (res.ok) {
        showToast('Weekly Promotional Ad Slot published!', 'success')
      } else {
        showToast('Failed to update Promo slot', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Upload file utility
  const handleUploadFile = async (file, onDone) => {
    if (!file) return
    setUploading(true)
    const authToken = getActiveAuthToken()
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload/single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.url || data.path || data.imageUrl
        onDone(url)
        showToast('Image uploaded successfully', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Image upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  // Location Showroom CRUD
  const handleSaveLocation = async (e) => {
    e.preventDefault()
    setSaving(true)
    const authToken = getActiveAuthToken()

    try {
      const method = editingLocation ? 'PUT' : 'POST'
      const url = editingLocation
        ? `${API_BASE}/api/store-locations/${editingLocation.id}`
        : `${API_BASE}/api/store-locations`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(locationForm),
      })

      if (res.ok) {
        showToast(editingLocation ? 'Showroom updated' : 'Showroom added', 'success')
        setLocationForm({ name: '', address: '', city: '', phone: '', email: '', google_map_url: '', description: '', active: 1 })
        setEditingLocation(null)
        loadPageData()
      } else {
        showToast('Failed to save showroom', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Delete this showroom location?')) return
    const authToken = getActiveAuthToken()
    try {
      const res = await fetch(`${API_BASE}/api/store-locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        showToast('Location deleted', 'success')
        setStoreLocations((prev) => prev.filter((l) => l.id !== id))
      }
    } catch {
      showToast('Delete failed', 'error')
    }
  }

  // Home Multi-Banner Rotation CRUD
  const handleAddBanner = async () => {
    if (!newBanner.image) return showToast('Please enter or upload a banner image', 'warning')
    const authToken = getActiveAuthToken()
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(newBanner),
      })
      if (res.ok) {
        showToast('Banner added to rotation gallery', 'success')
        setNewBanner({ title: '', subtitle: '', description: '', button_text: '', button_link: '', image: '', active: 1 })
        loadPageData()
      } else {
        showToast('Failed to add banner', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggleBanner = async (banner) => {
    const newActive = banner.active ? 0 : 1
    const authToken = getActiveAuthToken()
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ ...banner, active: newActive }),
      })
      if (res.ok) {
        setBannersList((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, active: newActive === 1 } : b))
        )
        showToast(`Banner ${newActive ? 'activated' : 'hidden'}`, 'success')
      } else {
        showToast('Toggle failed', 'error')
      }
    } catch {
      showToast('Toggle failed', 'error')
    }
  }

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner from gallery?')) return
    const authToken = getActiveAuthToken()
    try {
      const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        showToast('Banner deleted', 'success')
        setBannersList((prev) => prev.filter((b) => b.id !== id))
      }
    } catch {
      showToast('Delete failed', 'error')
    }
  }

  // Unified save trigger based on active tab
  const handlePrimarySave = () => {
    if (activeKey === 'about') {
      handleSaveAbout()
    } else if (activeKey === 'contact') {
      handleSaveContact()
    } else if (activeKey === 'home') {
      handleSavePage()
    } else {
      handleSavePage()
    }
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* ============================================================ */}
      {/* 1. LUXURY SEGMENTED PAGE SWITCHER & ACTION BAR               */}
      {/* ============================================================ */}
      <div className="page-editor-topbar">
        {/* Kinetic Scrollable Segmented Tab Strip */}
        <div className="page-tab-strip-wrapper">
          <nav className="page-tab-strip" aria-label="Storefront Pages Switcher">
            {PAGES_CONFIG.map((p) => {
              const isActive = activeKey === p.key
              return (
                <button
                  key={p.key}
                  type="button"
                  className={`page-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(`/dashboard/pages/${p.key}`)}
                >
                  <span className="tab-icon">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Action Controls: View Switcher & Primary Publish Button */}
        <div className="page-editor-actions">
          {/* Split / Edit / Preview Toggle */}
          <div className="filter-toolbar" style={{ margin: 0 }}>
            <button
              type="button"
              className={viewLayout === 'split' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
              onClick={() => setViewLayout('split')}
              title="Side-by-Side Split View"
            >
              ◫ Split
            </button>
            <button
              type="button"
              className={viewLayout === 'editor' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
              onClick={() => setViewLayout('editor')}
              title="Editor Only"
            >
              ✎ Edit
            </button>
            <button
              type="button"
              className={viewLayout === 'preview' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
              onClick={() => setViewLayout('preview')}
              title="Storefront Live Preview"
            >
              👁 Preview
            </button>
          </div>

          {/* Master Publish Button */}
          <button
            type="button"
            className="btn-primary"
            onClick={handlePrimarySave}
            disabled={saving || uploading}
            style={{ padding: '8px 18px', minHeight: '38px', fontWeight: 700 }}
          >
            {saving ? 'Publishing...' : '💾 Publish Live'}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TAB 1: 🏠 HOME PAGE (CAROUSEL SLIDERS + AD SHOWCASE)      */}
      {/* ============================================================ */}
      {activeKey === 'home' && (
        <div className={viewLayout === 'split' ? 'rte-split-layout' : ''}>
          {/* Left Column: Form & Sliders Manager */}
          {(viewLayout === 'split' || viewLayout === 'editor') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Static Main Hero Banner */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Main Hero Banner (Default Static)</h3>
                </div>

                <div style={{ height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                  <img
                    src={activeBannerImg || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'}
                    alt="Home Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://placehold.co/1200x500?text=Home+Banner' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={activeBannerImg}
                    onChange={(e) => setActiveBannerImg(e.target.value)}
                    placeholder="Main Banner Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleUploadFile(e.target.files[0], (url) => setActiveBannerImg(url))}
                    />
                    Upload
                  </label>
                </div>

                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Hero Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pageData.title || ''}
                      onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                      placeholder="e.g. Quality Furniture for Every Home"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Hero Subtitle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pageData.subtitle || ''}
                      onChange={(e) => setPageData({ ...pageData, subtitle: e.target.value })}
                      placeholder="e.g. Comfort made for everyday living."
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Banner Carousel Manager */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Rotating Carousel Slides ({bannersList.length})</h3>
                </div>

                {/* Add New Slide Form */}
                <div style={{ background: 'var(--header-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    + Add New Carousel Slide
                  </span>
                  <div className="admin-grid-2" style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Slide Headline (e.g. Modern Living)"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Subtitle (e.g. 20% off Lounge Sets)"
                      value={newBanner.subtitle}
                      onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                    />
                  </div>
                  <div className="admin-grid-2" style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Button Text (e.g. Shop Living)"
                      value={newBanner.button_text}
                      onChange={(e) => setNewBanner({ ...newBanner, button_text: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Button Link (e.g. /category/living-room)"
                      value={newBanner.button_link}
                      onChange={(e) => setNewBanner({ ...newBanner, button_link: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Image URL or upload"
                      value={newBanner.image}
                      onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                    />
                    <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleUploadFile(e.target.files[0], (url) => setNewBanner({ ...newBanner, image: url }))}
                      />
                      Upload
                    </label>
                    <button type="button" className="btn-primary" onClick={handleAddBanner} style={{ whiteSpace: 'nowrap' }}>
                      Add Slide
                    </button>
                  </div>
                </div>

                {/* Slides List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bannersList.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '14px', fontSize: '0.85rem' }}>
                      No rotating slides created yet. Add slides above to activate carousel rotation.
                    </p>
                  ) : (
                    bannersList.map((banner, index) => (
                      <div
                        key={banner.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--header-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>#{index + 1}</span>
                          <img
                            src={banner.image}
                            alt={banner.title || 'Slide'}
                            style={{ width: '56px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            onError={(e) => { e.target.src = 'https://placehold.co/100x60?text=Slide' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {banner.title || 'Untitled Slide'}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {banner.button_text ? `CTA: "${banner.button_text}"` : 'No CTA'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            className={`badge ${banner.active ? 'badge-success' : 'badge-default'}`}
                            onClick={() => handleToggleBanner(banner)}
                            style={{ cursor: 'pointer', border: 'none' }}
                          >
                            {banner.active ? '● Active' : '○ Hidden'}
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteBanner(banner.id)}
                            title="Delete Slide"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Promotional Ad Showcase Slot */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Weekly Promotional Ad Slot</h3>
                  <button type="button" className="btn-secondary" onClick={handleSaveHomePromo} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                    Update Promo
                  </button>
                </div>

                <div className="admin-grid-2" style={{ marginBottom: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ad Headline</label>
                    <input
                      type="text"
                      className="form-input"
                      value={homePromo.title}
                      onChange={(e) => setHomePromo({ ...homePromo, title: e.target.value })}
                      placeholder="e.g. Up to 30% Off Living Room Suites"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ad Subtitle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={homePromo.subtitle}
                      onChange={(e) => setHomePromo({ ...homePromo, subtitle: e.target.value })}
                      placeholder="e.g. Limited-time deals on contemporary lounge suites."
                    />
                  </div>
                </div>

                <div className="admin-grid-2" style={{ marginBottom: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Button CTA Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={homePromo.button_text}
                      onChange={(e) => setHomePromo({ ...homePromo, button_text: e.target.value })}
                      placeholder="e.g. Explore Sale"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Button Link URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={homePromo.button_link}
                      onChange={(e) => setHomePromo({ ...homePromo, button_link: e.target.value })}
                      placeholder="e.g. /on-sale"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={homePromo.image}
                    onChange={(e) => setHomePromo({ ...homePromo, image: e.target.value })}
                    placeholder="Ad Banner Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleUploadFile(e.target.files[0], (url) => setHomePromo({ ...homePromo, image: url }))}
                    />
                    Upload
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Home Storefront Live Preview */}
          {(viewLayout === 'split' || viewLayout === 'preview') && (
            <div style={{ position: viewLayout === 'split' ? 'sticky' : 'static', top: '24px' }}>
              <HomeLivePreviewPane
                activeBannerImg={activeBannerImg}
                bannersList={bannersList}
                homePromo={homePromo}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TAB 2: 📖 ABOUT US (1-1-3-1 COMPLETE ARCHITECTURE)        */}
      {/* ============================================================ */}
      {activeKey === 'about' && (
        <div className={viewLayout === 'split' ? 'rte-split-layout' : ''}>
          {/* Left Column: 1-1-3-1 Slot Controls */}
          {(viewLayout === 'split' || viewLayout === 'editor') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Slot 1: Top Hero Banner */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Slot 1 &bull; Top Hero Banner</h3>
                </div>

                <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                  <img src={aboutSlots.slot1_top_banner} alt="About Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/1200x400?text=Top+Banner' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutSlots.slot1_top_banner}
                    onChange={(e) => setAboutSlots({ ...aboutSlots, slot1_top_banner: e.target.value })}
                    placeholder="Hero Banner Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="file" accept="image/*" hidden onChange={(e) => handleUploadFile(e.target.files[0], (url) => setAboutSlots({ ...aboutSlots, slot1_top_banner: url }))} />
                    Upload
                  </label>
                </div>

                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Company Headline</label>
                    <input
                      type="text"
                      className="form-input"
                      value={aboutData.company_name}
                      onChange={(e) => setAboutData({ ...aboutData, company_name: e.target.value })}
                      placeholder="About AF Furnishings"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Tagline</label>
                    <input
                      type="text"
                      className="form-input"
                      value={aboutData.tagline}
                      onChange={(e) => setAboutData({ ...aboutData, tagline: e.target.value })}
                      placeholder="Quality furniture for every New Zealand home"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 2: Brand Story / Feature Image + Bio Paragraphs */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Slot 2 &bull; Brand Story &amp; Feature Image</h3>
                </div>

                <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                  <img src={aboutSlots.slot2_feature_img} alt="Story Feature" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Feature+Image' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutSlots.slot2_feature_img}
                    onChange={(e) => setAboutSlots({ ...aboutSlots, slot2_feature_img: e.target.value })}
                    placeholder="Feature Story Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="file" accept="image/*" hidden onChange={(e) => handleUploadFile(e.target.files[0], (url) => setAboutSlots({ ...aboutSlots, slot2_feature_img: url }))} />
                    Upload
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Story Section Eyebrow</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.story_title}
                    onChange={(e) => setAboutData({ ...aboutData, story_title: e.target.value })}
                    placeholder="WHO WE ARE"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Bio Paragraph 1</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={aboutData.story_p1 || aboutData.description}
                    onChange={(e) => setAboutData({ ...aboutData, story_p1: e.target.value, description: e.target.value })}
                    placeholder="AF Furnishings provides quality furniture..."
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Bio Paragraph 2</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={aboutData.story_p2}
                    onChange={(e) => setAboutData({ ...aboutData, story_p2: e.target.value })}
                    placeholder="Founded in New Zealand, we have been serving families..."
                  />
                </div>
              </div>

              {/* Slot 3: Three-Grid Core Values */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Slot 3 &bull; Core Values (3 Value Cards)</h3>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Values Section Heading</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.values_title}
                    onChange={(e) => setAboutData({ ...aboutData, values_title: e.target.value })}
                    placeholder="What we stand for."
                  />
                </div>

                <div className="admin-grid-3">
                  {/* Value 1 */}
                  <div style={{ background: 'var(--header-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={aboutSlots.slot3_img_a} alt="Value 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Card+1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={aboutSlots.slot3_img_a}
                        onChange={(e) => setAboutSlots({ ...aboutSlots, slot3_img_a: e.target.value })}
                        style={{ fontSize: '0.75rem', padding: '4px 6px' }}
                        placeholder="Image URL"
                      />
                      <label className="btn-secondary" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
                        <input type="file" accept="image/*" hidden onChange={(e) => handleUploadFile(e.target.files[0], (url) => setAboutSlots({ ...aboutSlots, slot3_img_a: url }))} />
                        Upload
                      </label>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={aboutData.value1_title}
                      onChange={(e) => setAboutData({ ...aboutData, value1_title: e.target.value })}
                      placeholder="Quality First"
                      style={{ fontWeight: 600, fontSize: '0.82rem' }}
                    />
                    <textarea
                      className="form-textarea"
                      rows="2"
                      value={aboutData.value1_desc}
                      onChange={(e) => setAboutData({ ...aboutData, value1_desc: e.target.value })}
                      placeholder="Description..."
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* Value 2 */}
                  <div style={{ background: 'var(--header-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={aboutSlots.slot3_img_b} alt="Value 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Card+2' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={aboutSlots.slot3_img_b}
                        onChange={(e) => setAboutSlots({ ...aboutSlots, slot3_img_b: e.target.value })}
                        style={{ fontSize: '0.75rem', padding: '4px 6px' }}
                        placeholder="Image URL"
                      />
                      <label className="btn-secondary" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
                        <input type="file" accept="image/*" hidden onChange={(e) => handleUploadFile(e.target.files[0], (url) => setAboutSlots({ ...aboutSlots, slot3_img_b: url }))} />
                        Upload
                      </label>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={aboutData.value2_title}
                      onChange={(e) => setAboutData({ ...aboutData, value2_title: e.target.value })}
                      placeholder="Comfort Always"
                      style={{ fontWeight: 600, fontSize: '0.82rem' }}
                    />
                    <textarea
                      className="form-textarea"
                      rows="2"
                      value={aboutData.value2_desc}
                      onChange={(e) => setAboutData({ ...aboutData, value2_desc: e.target.value })}
                      placeholder="Description..."
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* Value 3 */}
                  <div style={{ background: 'var(--header-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ height: '90px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={aboutSlots.slot3_img_c} alt="Value 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Card+3' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={aboutSlots.slot3_img_c}
                        onChange={(e) => setAboutSlots({ ...aboutSlots, slot3_img_c: e.target.value })}
                        style={{ fontSize: '0.75rem', padding: '4px 6px' }}
                        placeholder="Image URL"
                      />
                      <label className="btn-secondary" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
                        <input type="file" accept="image/*" hidden onChange={(e) => handleUploadFile(e.target.files[0], (url) => setAboutSlots({ ...aboutSlots, slot3_img_c: url }))} />
                        Upload
                      </label>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={aboutData.value3_title}
                      onChange={(e) => setAboutData({ ...aboutData, value3_title: e.target.value })}
                      placeholder="For Every Home"
                      style={{ fontWeight: 600, fontSize: '0.82rem' }}
                    />
                    <textarea
                      className="form-textarea"
                      rows="2"
                      value={aboutData.value3_desc}
                      onChange={(e) => setAboutData({ ...aboutData, value3_desc: e.target.value })}
                      placeholder="Description..."
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Slot 4: Bottom Team Banner & Highlights */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Slot 4 &bull; Bottom Team Banner &amp; Highlights</h3>
                </div>

                <div style={{ height: '130px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                  <img src={aboutSlots.slot4_bottom_banner} alt="Team" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/1200x400?text=Bottom+Banner' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutSlots.slot4_bottom_banner}
                    onChange={(e) => setAboutSlots({ ...aboutSlots, slot4_bottom_banner: e.target.value })}
                    placeholder="Bottom Banner Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="file" accept="image/*" hidden onChange={(e) => handleUploadFile(e.target.files[0], (url) => setAboutSlots({ ...aboutSlots, slot4_bottom_banner: url }))} />
                    Upload
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Team Heading</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.team_title}
                    onChange={(e) => setAboutData({ ...aboutData, team_title: e.target.value })}
                    placeholder="Meet the people behind AF Furnishings."
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Team Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={aboutData.team_desc}
                    onChange={(e) => setAboutData({ ...aboutData, team_desc: e.target.value })}
                    placeholder="Our team of friendly furniture experts..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Real-Time About Us Storefront Live Preview */}
          {(viewLayout === 'split' || viewLayout === 'preview') && (
            <div style={{ position: viewLayout === 'split' ? 'sticky' : 'static', top: '24px' }}>
              <AboutLivePreviewPane aboutData={aboutData} aboutSlots={aboutSlots} />
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TAB 8: 📍 CONTACT & STORE LOCATIONS DEDICATED EDITOR      */}
      {/* ============================================================ */}
      {activeKey === 'contact' && (
        <div className={viewLayout === 'split' ? 'rte-split-layout' : ''}>
          {/* Left Column: Contact Controls & Showrooms */}
          {(viewLayout === 'split' || viewLayout === 'editor') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Banner */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Contact &amp; Locations Header Banner</h3>
                </div>

                <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                  <img
                    src={activeBannerImg || pageData.banner_image || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=85'}
                    alt="Contact Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={activeBannerImg || pageData.banner_image || ''}
                    onChange={(e) => {
                      setActiveBannerImg(e.target.value)
                      setPageData((prev) => ({ ...prev, banner_image: e.target.value }))
                    }}
                    placeholder="Banner Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleUploadFile(e.target.files[0], (url) => {
                        setActiveBannerImg(url)
                        setPageData((prev) => ({ ...prev, banner_image: url }))
                      })}
                    />
                    Upload
                  </label>
                </div>
              </div>

              {/* Direct Store Contact Info */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Store Details &amp; Map Coordinates</h3>
                </div>

                <div className="admin-grid-2" style={{ marginBottom: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="e.g. 0800 222 548"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="e.g. auckland@affurnishings.co.nz"
                    />
                  </div>
                </div>

                <div className="admin-grid-2" style={{ marginBottom: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Physical Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={contactData.address}
                      onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                      placeholder="e.g. 123 Queen Street, Auckland"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Operating Hours</label>
                    <input
                      type="text"
                      className="form-input"
                      value={contactData.hours}
                      onChange={(e) => setContactData({ ...contactData, hours: e.target.value })}
                      placeholder="e.g. Mon-Sat: 9am - 5:30pm"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Google Maps Embed URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={contactData.google_map_url}
                    onChange={(e) => setContactData({ ...contactData, google_map_url: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
              </div>

              {/* Showrooms & Locations Manager */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">{editingLocation ? 'Edit Showroom' : '+ Add Showroom Location'}</h3>
                  {editingLocation && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setEditingLocation(null)
                        setLocationForm({ name: '', address: '', city: '', phone: '', email: '', google_map_url: '', description: '', active: 1 })
                      }}
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Showroom / Store Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. AF Furnishings Auckland Central"
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-grid-2">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 123 Queen Street"
                        value={locationForm.address}
                        onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Auckland"
                        value={locationForm.city}
                        onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-grid-2">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 0800 222 548"
                        value={locationForm.phone}
                        onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. auckland@affurnishings.co.nz"
                        value={locationForm.email}
                        onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingLocation ? 'Update Showroom' : 'Add Showroom'}
                  </button>
                </form>

                {/* Existing Locations */}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Registered Showrooms ({storeLocations.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {storeLocations.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No showrooms registered yet.
                    </p>
                  ) : (
                    storeLocations.map((loc) => (
                      <div
                        key={loc.id}
                        style={{
                          background: 'var(--header-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{loc.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                            {loc.address}{loc.city ? `, ${loc.city}` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            onClick={() => {
                              setEditingLocation(loc)
                              setLocationForm(loc)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteLocation(loc.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Contact & Locations Live Preview */}
          {(viewLayout === 'split' || viewLayout === 'preview') && (
            <div style={{ position: viewLayout === 'split' ? 'sticky' : 'static', top: '24px' }}>
              <ContactLivePreviewPane
                contactData={contactData}
                storeLocations={storeLocations}
                bannerImg={activeBannerImg || pageData.banner_image}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ALL OTHER PAGES: RICH TEXT WYSIWYG & LIVE STOREFRONT      */}
      {/* ============================================================ */}
      {activeKey !== 'about' && activeKey !== 'home' && activeKey !== 'contact' && (
        <div className={viewLayout === 'split' ? 'rte-split-layout' : ''}>
          {/* Left Column: Form & WYSIWYG Editor */}
          {(viewLayout === 'split' || viewLayout === 'editor') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Banner Settings */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">{PAGES_CONFIG.find(p => p.key === activeKey)?.label || 'Page'} Header Banner</h3>
                </div>

                <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                  <img
                    src={activeBannerImg || pageData.banner_image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'}
                    alt="Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={activeBannerImg || pageData.banner_image || ''}
                    onChange={(e) => {
                      setActiveBannerImg(e.target.value)
                      setPageData((prev) => ({ ...prev, banner_image: e.target.value }))
                    }}
                    placeholder="Banner Image URL"
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleUploadFile(e.target.files[0], (url) => {
                        setActiveBannerImg(url)
                        setPageData((prev) => ({ ...prev, banner_image: url }))
                      })}
                    />
                    Upload
                  </label>
                </div>
              </div>

              {/* Rich Content & Meta */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Page Content &amp; Meta</h3>
                </div>

                <div className="admin-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Headline / Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pageData.title || ''}
                      onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                      placeholder="e.g. Delivery Information"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subtitle / Eyebrow</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pageData.subtitle || ''}
                      onChange={(e) => setPageData({ ...pageData, subtitle: e.target.value })}
                      placeholder="e.g. Everything you need to know"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Meta Description (SEO)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.meta_description || ''}
                    onChange={(e) => setPageData({ ...pageData, meta_description: e.target.value })}
                    placeholder="Brief summary for search engines..."
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Body Rich Content</label>
                  <RichTextEditor
                    value={pageData.body_html}
                    onChange={(val) => setPageData({ ...pageData, body_html: val })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Live Storefront Preview */}
          {(viewLayout === 'split' || viewLayout === 'preview') && (
            <div style={{ position: viewLayout === 'split' ? 'sticky' : 'static', top: '24px' }}>
              <LivePreviewPane
                pageSlug={activeKey}
                title={pageData.title}
                subtitle={pageData.subtitle}
                bannerImage={activeBannerImg || pageData.banner_image}
                bodyHtml={pageData.body_html}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PageEditor
