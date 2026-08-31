// ============================================================
// Premium About Us Page Editor Module (Theme Engine Enabled)
// ============================================================
// Features: Live Storefront Image Previews, Sync with @website assets,
// Individual section image file uploaders & URL inputs,
// 3-Card Values Grid editor, and Company Details editor.
// API: /api/about-sections, /api/about, /api/upload
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

const STOREFRONT_DEFAULTS = {
  banner: {
    title: 'About AF Furnishings',
    description: 'Quality furniture for every New Zealand home',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
  },
  primary: {
    title: 'Who We Are',
    description: 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.\n\nFounded in New Zealand, we have been serving families across the country with beautiful, durable furniture at honest prices.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85',
  },
  features: {
    title: 'What We Stand For',
    description: JSON.stringify([
      { title: 'Quality First', description: 'Every piece of furniture is crafted from premium materials, built to last for years of daily use.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
      { title: 'Comfort Always', description: 'We test every sofa, chair and bed to ensure it meets our comfort standards before it reaches you.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
      { title: 'For Every Home', description: 'With flexible weekly payments, we make quality furniture accessible to every New Zealand family.', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80' },
    ]),
  },
  conclusion: {
    title: 'Meet the people behind AF Furnishings',
    description: 'Our team of friendly furniture experts is here to help you find the perfect pieces for your home. From selecting the right sofa to planning your dream bedroom, we guide you every step of the way.\n\nVisit our showrooms in Auckland or Wellington, or contact us online for a virtual consultation.',
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85',
  },
}

function SectionCard({ type, label, number, sections, handleChange, handleSave, handleFileUpload, loading, uploading, fileInputs }) {
  const currentImg = sections[type]?.image || STOREFRONT_DEFAULTS[type]?.image || ''

  return (
    <div className="p-card">
      <div className="p-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {number && <span className="p-card-number">{number}</span>}
          <h3 style={{ margin: 0 }}>{label}</h3>
        </div>
        <button className="p-btn p-btn-primary" onClick={() => handleSave(type)} disabled={loading || uploading === type}>
          Save {label}
        </button>
      </div>

      <div className="p-input-group" style={{ marginTop: '16px' }}>
        <label className="p-label">Section Title</label>
        <input
          type="text"
          value={sections[type]?.title ?? STOREFRONT_DEFAULTS[type]?.title ?? ''}
          onChange={(e) => handleChange(type, 'title', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Enter section title..."
        />
      </div>

      <div className="p-input-group" style={{ marginTop: '16px' }}>
        <label className="p-label">Description Content</label>
        <textarea
          rows={4}
          value={sections[type]?.description ?? STOREFRONT_DEFAULTS[type]?.description ?? ''}
          onChange={(e) => handleChange(type, 'description', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Enter section description..."
          style={{ resize: 'vertical', lineHeight: '1.6' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label className="p-label">Storefront Live Image Preview</label>
        {currentImg && (
          <div className="p-img-preview">
            <img src={currentImg} alt={label} onError={(e) => { e.target.src = 'https://placehold.co/600x300?text=Image+Not+Found' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
          <input
            ref={(el) => (fileInputs.current[type] = el)}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(type, e.target.files[0])}
          />
          <button
            type="button"
            className="p-btn p-btn-secondary"
            onClick={() => fileInputs.current[type]?.click()}
            disabled={uploading === type}
          >
            {uploading === type ? 'Uploading...' : 'Upload Replacement'}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {sections[type]?.image ? 'Custom image uploaded' : 'Storefront default asset active'}
          </span>
        </div>
        <input
          type="text"
          value={sections[type]?.image ?? ''}
          onChange={(e) => handleChange(type, 'image', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Or paste custom image URL..."
          style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}
        />
      </div>
    </div>
  )
}

function FeaturesGridCard({ sections, handleFeatureChange, handleFeatureUpload, handleSave, loading, uploading, fileInputs }) {
  let featureItems = [
    { title: 'Quality First', description: 'Every piece of furniture is crafted from premium materials, built to last for years of daily use.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
    { title: 'Comfort Always', description: 'We test every sofa, chair and bed to ensure it meets our comfort standards before it reaches you.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
    { title: 'For Every Home', description: 'With flexible weekly payments, we make quality furniture accessible to every New Zealand family.', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80' },
  ]
  try {
    const raw = sections.features?.description
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        featureItems = [parsed[0] || featureItems[0], parsed[1] || featureItems[1], parsed[2] || featureItems[2]]
      }
    }
  } catch {}

  return (
    <div className="p-card">
      <div className="p-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="p-card-number">3</span>
          <h3 style={{ margin: 0 }}>Core Values (3-Card Feature Grid)</h3>
        </div>
        <button className="p-btn p-btn-primary" onClick={() => handleSave('features')} disabled={loading || !!uploading}>
          Save Values Grid
        </button>
      </div>

      <div className="p-input-group" style={{ marginTop: '16px' }}>
        <label className="p-label">Grid Section Title</label>
        <input
          type="text"
          value={sections.features?.title ?? 'What We Stand For'}
          onChange={(e) => handleFeatureChange('section_title', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="e.g. What We Stand For"
        />
      </div>

      <div className="p-features-grid" style={{ marginTop: '20px' }}>
        {featureItems.map((item, idx) => (
          <div key={idx} className="p-feature-col">
            <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Card {idx + 1}</h4>
            <div className="p-input-group">
              <label className="p-label">Title</label>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                disabled={loading}
                className="p-input"
                placeholder="Card title..."
              />
            </div>
            <div className="p-input-group" style={{ marginTop: '10px' }}>
              <label className="p-label">Description</label>
              <textarea
                rows={3}
                value={item.description || ''}
                onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                disabled={loading}
                className="p-input"
                placeholder="Card description..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              <label className="p-label">Card Image Preview</label>
              {item.image && (
                <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '8px' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  ref={(el) => (fileInputs.current[`feature_${idx}`] = el)}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFeatureUpload(idx, e.target.files[0])}
                />
                <button
                  type="button"
                  className="p-btn p-btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={() => fileInputs.current[`feature_${idx}`]?.click()}
                  disabled={uploading === `feature_${idx}`}
                >
                  {uploading === `feature_${idx}` ? 'Uploading...' : 'Upload'}
                </button>
                <input
                  type="text"
                  value={item.image || ''}
                  onChange={(e) => handleFeatureChange(idx, 'image', e.target.value)}
                  disabled={loading}
                  className="p-input"
                  placeholder="Paste URL..."
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function About({ token }) {
  const [sections, setSections] = useState({
    banner: { title: '', description: '', image: '' },
    primary: { title: '', description: '', image: '' },
    features: { title: '', description: '[]', image: '' },
    conclusion: { title: '', description: '', image: '' },
  })

  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  })

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [toast, setToast] = useState(null)
  const fileInputs = useRef({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [secRes, compRes] = await Promise.all([
        fetch(`${API_BASE}/api/about-sections`),
        fetch(`${API_BASE}/api/about`),
      ])

      if (secRes.ok) {
        const secData = await secRes.json()
        if (Array.isArray(secData) && secData.length > 0) {
          const map = {}
          secData.forEach((s) => {
            map[s.type] = {
              title: s.title || '',
              description: s.description || '',
              image: s.image || '',
            }
          })
          setSections((prev) => ({ ...prev, ...map }))
        }
      }

      if (compRes.ok) {
        const compData = await compRes.json()
        if (compData) {
          setCompanyInfo({
            company_name: compData.company_name || 'AF Furnishings',
            tagline: compData.tagline || '',
            description: compData.description || '',
            address: compData.address || '',
            phone: compData.phone || '',
            email: compData.email || '',
          })
        }
      }
    } catch {
      showToast('Failed to load About Us details', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (type, field, value) => {
    setSections((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const handleFeatureChange = (target, field, value) => {
    setSections((prev) => {
      let featureItems = [
        { title: 'Quality First', description: 'Every piece of furniture is crafted from premium materials, built to last for years of daily use.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
        { title: 'Comfort Always', description: 'We test every sofa, chair and bed to ensure it meets our comfort standards before it reaches you.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
        { title: 'For Every Home', description: 'With flexible weekly payments, we make quality furniture accessible to every New Zealand family.', image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80' },
      ]
      try {
        const parsed = JSON.parse(prev.features?.description || '[]')
        if (Array.isArray(parsed) && parsed.length > 0) {
          featureItems = [parsed[0] || featureItems[0], parsed[1] || featureItems[1], parsed[2] || featureItems[2]]
        }
      } catch {}

      if (target === 'section_title') {
        return {
          ...prev,
          features: {
            ...prev.features,
            title: value,
          },
        }
      }

      featureItems[target] = { ...featureItems[target], [field]: value }
      return {
        ...prev,
        features: {
          ...prev.features,
          description: JSON.stringify(featureItems),
        },
      }
    })
  }

  const handleFileUpload = async (type, file) => {
    if (!file) return
    setUploading(type)
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
        handleChange(type, 'image', fullUrl)
        showToast('Image uploaded successfully', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload server error', 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleFeatureUpload = async (idx, file) => {
    if (!file) return
    setUploading(`feature_${idx}`)
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
        handleFeatureChange(idx, 'image', fullUrl)
        showToast('Card image uploaded', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload server error', 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async (type) => {
    try {
      const payload = {
        title: sections[type]?.title ?? STOREFRONT_DEFAULTS[type]?.title ?? '',
        description: sections[type]?.description ?? STOREFRONT_DEFAULTS[type]?.description ?? '',
        image: sections[type]?.image ?? STOREFRONT_DEFAULTS[type]?.image ?? '',
      }

      const res = await fetch(`${API_BASE}/api/about-sections/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(`${type.toUpperCase()} section saved successfully!`, 'success')
      } else {
        showToast('Failed to save section', 'error')
      }
    } catch {
      showToast('Server error while saving section', 'error')
    }
  }

  const handleSaveCompany = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyInfo),
      })
      if (res.ok) {
        showToast('Company information updated!', 'success')
      } else {
        showToast('Failed to update company information', 'error')
      }
    } catch {
      showToast('Server error while saving company information', 'error')
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.3s ease-out; padding: 24px; max-width: 1200px; margin: 0 auto; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .p-card-number { width: 28px; height: 28px; border-radius: 50%; background: var(--accent-color); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; }

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

        .p-img-preview {
          width: 100%; height: 200px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);
          background: #000; margin-bottom: 10px;
        }
        .p-img-preview img { width: 100%; height: 100%; object-fit: cover; }

        .p-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .p-feature-col { background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; }

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
        }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      {/* 1. Header Banner */}
      <SectionCard
        type="banner"
        label="Top Page Banner"
        number="1"
        sections={sections}
        handleChange={handleChange}
        handleSave={handleSave}
        handleFileUpload={handleFileUpload}
        loading={loading}
        uploading={uploading}
        fileInputs={fileInputs}
      />

      {/* 2. Primary Story */}
      <SectionCard
        type="primary"
        label="Full Story (Who We Are)"
        number="2"
        sections={sections}
        handleChange={handleChange}
        handleSave={handleSave}
        handleFileUpload={handleFileUpload}
        loading={loading}
        uploading={uploading}
        fileInputs={fileInputs}
      />

      {/* 3. Features / Values 3-Card Grid */}
      <FeaturesGridCard
        sections={sections}
        handleFeatureChange={handleFeatureChange}
        handleFeatureUpload={handleFeatureUpload}
        handleSave={handleSave}
        loading={loading}
        uploading={uploading}
        fileInputs={fileInputs}
      />

      {/* 4. Conclusion / Team */}
      <SectionCard
        type="conclusion"
        label="Meet Our Team & Showroom"
        number="4"
        sections={sections}
        handleChange={handleChange}
        handleSave={handleSave}
        handleFileUpload={handleFileUpload}
        loading={loading}
        uploading={uploading}
        fileInputs={fileInputs}
      />

      {/* 5. Company Info */}
      <div className="p-card">
        <div className="p-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="p-card-number">5</span>
            <h3 style={{ margin: 0 }}>Company Information (Storefront Footer & Contact Sync)</h3>
          </div>
          <button className="p-btn p-btn-primary" onClick={handleSaveCompany} disabled={loading}>
            Save Company Info
          </button>
        </div>

        <form onSubmit={handleSaveCompany}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="p-input-group">
              <label className="p-label">Company Name</label>
              <input
                type="text"
                className="p-input"
                value={companyInfo.company_name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, company_name: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="p-input-group">
              <label className="p-label">Tagline</label>
              <input
                type="text"
                className="p-input"
                value={companyInfo.tagline}
                onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
                placeholder="e.g. Quality furniture for every New Zealand home"
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="p-input-group">
              <label className="p-label">Phone</label>
              <input
                type="text"
                className="p-input"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                placeholder="e.g. 12345667890"
                disabled={loading}
              />
            </div>
            <div className="p-input-group">
              <label className="p-label">Email</label>
              <input
                type="email"
                className="p-input"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                placeholder="e.g. affurniture@gmail.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-input-group">
            <label className="p-label">Physical Address</label>
            <input
              type="text"
              className="p-input"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              placeholder="e.g. 123 Queen Street, Auckland, New Zealand"
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default About
