// ============================================================
// Premium Multi-Banner & Page Media Manager (Theme Engine Enabled)
// ============================================================
// Features:
//  - Page Selection Dropdown for all pages (Home, About, Contact, Delivery, Returns, Terms, Privacy, WinZ, Shop Furniture)
//  - Multi-Banner Gallery per page with individual Active toggles
//  - Multiple active banners -> Rotating live slider; Single active -> Static Hero
//  - Section layout slots (1-1-3 rich media blocks for content pages)
//  - Full fields: Image Upload/URL, Title, Subtitle, CTA Button & Link, Sort Order, Active toggle
// API: /api/hero-sliders, /api/page-banners, /api/settings, /api/about-sections, /api/upload
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const PAGE_CONFIGS = [
  {
    key: 'home',
    label: 'Home Page (Home Banner & Sliders)',
    defaultImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Comfort made for everyday living.',
    defaultSubtitle: 'AF FURNISHINGS',
    defaultDesc: 'Quality sofas, beds, and furniture packages crafted for every New Zealand home.',
    hasSlots: false,
  },
  {
    key: 'about',
    settingKey: 'about_banner',
    label: 'About Us (Page Banner & Content Slots)',
    defaultImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'About AF Furnishings',
    defaultSubtitle: 'OUR STORY',
    defaultDesc: 'Quality furniture for every New Zealand home',
    hasSlots: true,
  },
  {
    key: 'delivery_info',
    settingKey: 'delivery_info_banner',
    label: 'Delivery Info Page',
    defaultImg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Delivery Information',
    defaultSubtitle: 'SHIPPING',
    defaultDesc: 'Everything you need to know about our nationwide delivery services',
    hasSlots: false,
  },
  {
    key: 'returns',
    settingKey: 'returns_banner',
    label: 'Returns Policy Page',
    defaultImg: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Returns Policy',
    defaultSubtitle: 'OUR POLICY',
    defaultDesc: 'Hassle-free returns and customer satisfaction guarantee',
    hasSlots: false,
  },
  {
    key: 'terms',
    settingKey: 'terms_banner',
    label: 'Terms & Conditions Page',
    defaultImg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Terms & Conditions',
    defaultSubtitle: 'LEGAL INFORMATION',
    defaultDesc: 'Please read our terms carefully before using our services',
    hasSlots: false,
  },
  {
    key: 'privacy_policy',
    settingKey: 'privacy_banner',
    label: 'Privacy Policy Page',
    defaultImg: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Privacy Policy',
    defaultSubtitle: 'PRIVACY & SECURITY',
    defaultDesc: 'How we collect, protect and handle your personal data',
    hasSlots: false,
  },
  {
    key: 'contact',
    settingKey: 'contact_banner',
    label: 'Contact Us Page',
    defaultImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Get in Touch',
    defaultSubtitle: 'CONTACT US',
    defaultDesc: 'Visit our showrooms or send us a message anytime',
    hasSlots: false,
  },
  {
    key: 'winz',
    settingKey: 'winz_banner',
    label: 'WinZ & Finance Page',
    defaultImg: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Work & Income (WINZ) Quotes',
    defaultSubtitle: 'WINZ REGISTERED SUPPLIER',
    defaultDesc: 'Fast official WINZ quotes delivered straight to your email',
    hasSlots: false,
  },
  {
    key: 'shop_furniture',
    settingKey: 'shop_furniture_banner',
    label: 'Shop Furniture Page',
    defaultImg: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=2000&q=85',
    defaultTitle: 'Explore Furniture',
    defaultSubtitle: 'FULL CATALOG',
    defaultDesc: 'Discover modern, durable furniture collections for every room',
    hasSlots: false,
  },
]

function Banners({ token }) {
  const [selectedPage, setSelectedPage] = useState('home')
  const [bannersList, setBannersList] = useState([])
  const [aboutSections, setAboutSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  // New Banner Form State
  const [newBanner, setNewBanner] = useState({
    image: '',
    title: '',
    subtitle: '',
    description: '',
    button_text: 'EXPLORE NOW',
    button_link: '#',
    sort_order: 0,
    active: 1,
    slot: 'hero',
  })

  // Edit Banner Form State
  const [editingBanner, setEditingBanner] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      if (selectedPage === 'home') {
        const res = await fetch(`${API_BASE}/api/hero-sliders`)
        if (res.ok) {
          const data = await res.json()
          setBannersList(Array.isArray(data) ? data : [])
        }
      } else {
        const res = await fetch(`${API_BASE}/api/page-banners?page_key=${selectedPage}`)
        if (res.ok) {
          const data = await res.json()
          setBannersList(Array.isArray(data) ? data : [])
        }
      }

      // If About page, also fetch section slots
      if (selectedPage === 'about') {
        const res = await fetch(`${API_BASE}/api/about-sections`)
        if (res.ok) {
          const data = await res.json()
          setAboutSections(Array.isArray(data) ? data : [])
        }
      }
    } catch {
      showToast('Failed to load banner data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const pageCfg = PAGE_CONFIGS.find((p) => p.key === selectedPage)
    setNewBanner({
      image: '',
      title: pageCfg?.defaultTitle || '',
      subtitle: pageCfg?.defaultSubtitle || '',
      description: pageCfg?.defaultDesc || '',
      button_text: 'EXPLORE NOW',
      button_link: '#',
      sort_order: 0,
      active: 1,
      slot: 'hero',
    })
  }, [selectedPage])

  const handleUpload = async (file, onSet) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const fullUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        onSet(fullUrl)
        showToast('Image uploaded successfully', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload server error', 'error')
    } finally {
      setUploading(false)
    }
  }

  // ---- Add New Banner ----
  const handleAddBanner = async () => {
    if (!newBanner.image.trim()) return showToast('Please enter or upload an image', 'error')

    try {
      const pageCfg = PAGE_CONFIGS.find((p) => p.key === selectedPage)
      if (selectedPage === 'home') {
        const res = await fetch(`${API_BASE}/api/hero-sliders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            image: newBanner.image,
            tagline: newBanner.subtitle,
            title: newBanner.title,
            description: newBanner.description,
            sort_order: Number(newBanner.sort_order) || 0,
            active: newBanner.active ? 1 : 0,
          }),
        })
        if (res.ok) {
          showToast('Banner slide added successfully', 'success')
          loadData()
          setNewBanner((prev) => ({ ...prev, image: '' }))
        } else {
          showToast('Failed to add banner slide', 'error')
        }
      } else {
        const res = await fetch(`${API_BASE}/api/page-banners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            page_key: selectedPage,
            label: pageCfg?.label || selectedPage,
            image: newBanner.image,
            title: newBanner.title,
            subtitle: newBanner.subtitle,
            description: newBanner.description,
            button_text: newBanner.button_text,
            button_link: newBanner.button_link,
            sort_order: Number(newBanner.sort_order) || 0,
            active: newBanner.active ? 1 : 0,
            slot: newBanner.slot || 'hero',
          }),
        })
        if (res.ok) {
          if (newBanner.active && pageCfg?.settingKey) {
            await fetch(`${API_BASE}/api/settings`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ [pageCfg.settingKey]: newBanner.image }),
            })
          }
          showToast('Banner added successfully', 'success')
          loadData()
          setNewBanner((prev) => ({ ...prev, image: '' }))
        } else {
          showToast('Failed to add banner', 'error')
        }
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // ---- Update Existing Banner ----
  const handleUpdateBanner = async (id) => {
    if (!editingBanner) return
    try {
      const pageCfg = PAGE_CONFIGS.find((p) => p.key === selectedPage)
      if (selectedPage === 'home') {
        const res = await fetch(`${API_BASE}/api/hero-sliders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editingBanner),
        })
        if (res.ok) {
          showToast('Banner slide updated', 'success')
          setEditingBanner(null)
          loadData()
        }
      } else {
        const res = await fetch(`${API_BASE}/api/page-banners/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editingBanner),
        })
        if (res.ok) {
          if (editingBanner.active && pageCfg?.settingKey) {
            await fetch(`${API_BASE}/api/settings`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ [pageCfg.settingKey]: editingBanner.image }),
            })
          }
          showToast('Banner updated successfully', 'success')
          setEditingBanner(null)
          loadData()
        }
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // ---- Toggle Banner Active Status ----
  const handleToggleBanner = async (item) => {
    const newActive = item.active ? 0 : 1
    const pageCfg = PAGE_CONFIGS.find((p) => p.key === selectedPage)
    try {
      if (selectedPage === 'home') {
        await fetch(`${API_BASE}/api/hero-sliders/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...item, active: newActive }),
        })
      } else {
        await fetch(`${API_BASE}/api/page-banners/${item.id}/toggle`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (newActive === 1 && pageCfg?.settingKey) {
          await fetch(`${API_BASE}/api/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ [pageCfg.settingKey]: item.image }),
          })
        }
      }
      showToast(newActive ? 'Banner set to Active' : 'Banner Inactive (Hidden)', 'success')
      loadData()
    } catch {}
  }

  // ---- Delete Banner ----
  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner from the gallery?')) return
    try {
      const url =
        selectedPage === 'home'
          ? `${API_BASE}/api/hero-sliders/${id}`
          : `${API_BASE}/api/page-banners/${id}`

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Banner deleted', 'success')
        loadData()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // ---- Section Layout Slots (About Us 1-1-3 layout) ----
  const handleSaveSlot = async (type, data) => {
    try {
      const res = await fetch(`${API_BASE}/api/about-sections/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        showToast(`${type.toUpperCase()} layout slot updated`, 'success')
        const r = await fetch(`${API_BASE}/api/about-sections`)
        if (r.ok) setAboutSections(await r.json())
      }
    } catch {}
  }

  const selectedOpt = PAGE_CONFIGS.find((p) => p.key === selectedPage)
  const activeCount = bannersList.filter((b) => b.active).length

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.3s ease-out; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .p-page-selector-card {
          background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px;
          padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }
        .p-selector-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .p-selector-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 4px 0 0; }
        
        .p-select-dropdown {
          min-width: 280px; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
          background: var(--header-bg); color: var(--text-primary); font-size: 0.95rem; font-weight: 600;
          outline: none; cursor: pointer; transition: border-color 0.2s;
        }
        .p-select-dropdown:focus { border-color: var(--accent-color); }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .p-card-title { font-size: 1.15rem; color: var(--text-primary); margin: 0; font-weight: 700; }

        .p-input-group { margin-bottom: 16px; }
        .p-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .p-input {
          width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
          font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .p-input:focus { outline: none; border-color: var(--accent-color); }

        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-secondary { background: var(--hover-bg); border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-secondary:hover { background: var(--border-color); color: var(--text-primary); }

        /* Media Banner Grid */
        .banner-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .banner-item-card {
          background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 12px;
          overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s;
        }
        .banner-item-card:hover { transform: translateY(-2px); border-color: var(--accent-color); }
        .banner-item-card.is-active { border-color: var(--accent-color); box-shadow: 0 0 0 1px var(--accent-color); }

        .banner-img-wrap { position: relative; width: 100%; height: 180px; background: #000; overflow: hidden; }
        .banner-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .banner-active-pill {
          position: absolute; top: 12px; right: 12px; padding: 4px 10px; border-radius: 50px;
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase; cursor: pointer;
          backdrop-filter: blur(6px); transition: all 0.2s;
        }
        .banner-active-pill.active { background: rgba(34, 197, 94, 0.9); color: #fff; }
        .banner-active-pill.inactive { background: rgba(0,0,0,0.6); color: #bbb; border: 1px solid rgba(255,255,255,0.2); }

        .banner-content-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .banner-title-text { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
        .banner-sub-text { font-size: 0.75rem; font-weight: 700; color: var(--accent-color); text-transform: uppercase; margin-bottom: 6px; }
        .banner-desc-text { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; margin: 0 0 12px; flex: 1; }

        .banner-card-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: auto; }
        .btn-action { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .btn-action:hover { background: var(--hover-bg); color: var(--text-primary); }
        .btn-action.del:hover { color: #ef4444; border-color: #ef4444; }

        .info-note-box {
          background: var(--header-bg); border-left: 4px solid var(--accent-color); padding: 12px 18px;
          border-radius: 6px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;
        }

        .toast-premium {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);
          color: var(--text-primary); padding: 16px 24px; border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem;
          display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out;
        }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }

        @media (max-width: 768px) {
          .premium-module { padding: 12px; }
          .p-page-selector-card { flex-direction: column; align-items: stretch; }
          .p-select-dropdown { width: 100%; min-width: auto; }
        }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      {/* 1. Top Page Selection Dropdown */}
      <div className="p-page-selector-card">
        <div>
          <div className="p-selector-label">Pages & Media Manager</div>
          <div className="p-selector-title">{selectedOpt?.label}</div>
        </div>
        <div>
          <select
            className="p-select-dropdown"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            {PAGE_CONFIGS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="info-note-box">
        <strong>Multi-Banner Engine:</strong>{' '}
        {activeCount > 1
          ? `${activeCount} active banners selected. They will automatically rotate as a live slider on the storefront.`
          : activeCount === 1
          ? '1 active banner selected. It will render as a static banner.'
          : 'No active banners selected. Storefront will use default placeholder.'}
      </div>

      {/* 2. Upload / Add Banner Card */}
      <div className="p-card">
        <h3 className="p-card-title">Add New Banner to {selectedOpt?.label}</h3>
        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          <div className="p-input-group" style={{ margin: 0 }}>
            <label className="p-label">Banner Image *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="p-input"
                placeholder="Enter image URL or choose file to upload..."
                value={newBanner.image}
                onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                style={{ flex: 1, minWidth: '220px' }}
              />
              <label className="p-btn p-btn-secondary" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    handleUpload(e.target.files[0], (url) =>
                      setNewBanner((prev) => ({ ...prev, image: url }))
                    )
                  }
                  disabled={uploading}
                />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
          </div>

          {newBanner.image && (
            <div
              style={{
                width: '100%',
                height: '160px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={newBanner.image}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="p-input-group" style={{ margin: 0 }}>
              <label className="p-label">Subtitle / Badge Text</label>
              <input
                type="text"
                className="p-input"
                placeholder="e.g. OUR STORY or SPECIAL OFFER"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
              />
            </div>
            <div className="p-input-group" style={{ margin: 0 }}>
              <label className="p-label">Headline / Title</label>
              <input
                type="text"
                className="p-input"
                placeholder="e.g. Quality Living Room Sets"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              />
            </div>
          </div>

          <div className="p-input-group" style={{ margin: 0 }}>
            <label className="p-label">Description / Subtext</label>
            <textarea
              rows={2}
              className="p-input"
              placeholder="Short descriptive banner text..."
              value={newBanner.description}
              onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="p-input-group" style={{ margin: 0 }}>
              <label className="p-label">CTA Button Text</label>
              <input
                type="text"
                className="p-input"
                placeholder="e.g. EXPLORE NOW"
                value={newBanner.button_text}
                onChange={(e) => setNewBanner({ ...newBanner, button_text: e.target.value })}
              />
            </div>
            <div className="p-input-group" style={{ margin: 0 }}>
              <label className="p-label">CTA Link / Anchor</label>
              <input
                type="text"
                className="p-input"
                placeholder="e.g. /products or #contact"
                value={newBanner.button_link}
                onChange={(e) => setNewBanner({ ...newBanner, button_link: e.target.value })}
              />
            </div>
            <div className="p-input-group" style={{ margin: 0 }}>
              <label className="p-label">Sort Order</label>
              <input
                type="number"
                className="p-input"
                value={newBanner.sort_order}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, sort_order: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <button
            className="p-btn p-btn-primary"
            onClick={handleAddBanner}
            style={{ justifySelf: 'flex-start' }}
            disabled={uploading}
          >
            Add Banner to Gallery
          </button>
        </div>
      </div>

      {/* 3. Uploaded Banners Gallery & Active Multi-Selection */}
      <div className="p-card">
        <div className="p-card-header">
          <h3 className="p-card-title">
            Gallery for {selectedOpt?.label} ({bannersList.length})
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Toggle pills to enable/disable banners in live rotation.
          </span>
        </div>

        {bannersList.length === 0 && !loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No custom banners in gallery yet. Add one above!
          </div>
        ) : (
          <div className="banner-gallery-grid">
            {bannersList.map((b) => (
              <div key={b.id} className={`banner-item-card ${b.active ? 'is-active' : ''}`}>
                <div className="banner-img-wrap">
                  <img
                    src={b.image}
                    alt={b.title || 'Banner'}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x200?text=No+Image'
                    }}
                  />
                  <span
                    className={`banner-active-pill ${b.active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleBanner(b)}
                    title="Click to toggle Active status"
                  >
                    {b.active ? '✓ Active' : 'Hidden'}
                  </span>
                </div>
                <div className="banner-content-body">
                  {b.subtitle || b.tagline ? (
                    <div className="banner-sub-text">{b.subtitle || b.tagline}</div>
                  ) : null}
                  <div className="banner-title-text">{b.title || 'Untitled Banner'}</div>
                  {b.description && <div className="banner-desc-text">{b.description}</div>}
                  <div className="banner-card-actions">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Order: {b.sort_order || 0}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-action" onClick={() => setEditingBanner(b)}>
                        Edit
                      </button>
                      <button
                        className="btn-action del"
                        onClick={() => handleDeleteBanner(b.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Edit Modal if editing */}
      {editingBanner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="p-card"
            style={{
              width: '100%',
              maxWidth: '600px',
              margin: 0,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="p-card-header">
              <h3 className="p-card-title">Edit Banner</h3>
              <button className="btn-action" onClick={() => setEditingBanner(null)}>
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="p-input-group" style={{ margin: 0 }}>
                <label className="p-label">Banner Image</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="p-input"
                    value={editingBanner.image || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, image: e.target.value })
                    }
                  />
                  <label className="p-btn p-btn-secondary" style={{ cursor: 'pointer' }}>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleUpload(e.target.files[0], (url) =>
                          setEditingBanner((prev) => ({ ...prev, image: url }))
                        )
                      }
                    />
                    Upload
                  </label>
                </div>
              </div>

              <div className="p-input-group" style={{ margin: 0 }}>
                <label className="p-label">Headline / Title</label>
                <input
                  type="text"
                  className="p-input"
                  value={editingBanner.title || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                />
              </div>

              <div className="p-input-group" style={{ margin: 0 }}>
                <label className="p-label">Subtitle</label>
                <input
                  type="text"
                  className="p-input"
                  value={editingBanner.subtitle || editingBanner.tagline || ''}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      subtitle: e.target.value,
                      tagline: e.target.value,
                    })
                  }
                />
              </div>

              <div className="p-input-group" style={{ margin: 0 }}>
                <label className="p-label">Description</label>
                <textarea
                  rows={2}
                  className="p-input"
                  value={editingBanner.description || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, description: e.target.value })
                  }
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  className="p-btn p-btn-primary"
                  onClick={() => handleUpdateBanner(editingBanner.id)}
                >
                  Save Changes
                </button>
                <button
                  className="p-btn p-btn-secondary"
                  onClick={() => setEditingBanner(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Section Layout Slots for Rich Pages (e.g. About Us 1-1-3 Content Grid) */}
      {selectedOpt?.hasSlots && (
        <div className="p-card">
          <div className="p-card-header">
            <h3 className="p-card-title">Section Layout Media Slots (1-1-3 Story & Values Blocks)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Controls in-page body image blocks below the main banner.
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Slot 1: Story Image */}
            <div
              style={{
                background: 'var(--header-bg)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-primary)' }}>
                1. Full Story Showroom Image
              </h4>
              <div
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                <img
                  src={
                    aboutSections.find((s) => s.type === 'primary')?.image ||
                    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85'
                  }
                  alt="Story"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <label className="p-btn p-btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    handleUpload(e.target.files[0], (url) =>
                      handleSaveSlot('primary', { title: 'Who We Are', image: url })
                    )
                  }
                />
                Upload Story Image
              </label>
            </div>

            {/* Slot 2: Team & Showroom */}
            <div
              style={{
                background: 'var(--header-bg)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 style={{ margin: '0 0 10px', color: 'var(--text-primary)' }}>
                2. Team & Showroom Image
              </h4>
              <div
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                <img
                  src={
                    aboutSections.find((s) => s.type === 'conclusion')?.image ||
                    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85'
                  }
                  alt="Team"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <label className="p-btn p-btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    handleUpload(e.target.files[0], (url) =>
                      handleSaveSlot('conclusion', { title: 'Meet Our Team', image: url })
                    )
                  }
                />
                Upload Team Image
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners
