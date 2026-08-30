// ============================================================
// Premium About Us Page Editor Module (Theme Engine Enabled)
// ============================================================
// Features: Main Banner, Primary Section, 3-Column Horizontal 
// Features Grid with individual image uploads, and Conclusion block.
// API: GET /api/about-sections, PUT /api/about-sections/:type, POST /api/upload
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function SectionCard({ type, label, number, sections, handleChange, handleSave, handleFileUpload, loading, uploading, fileInputs }) {
  return (
    <div className="p-card">
      <div className="p-card-header">
        {number && <span className="p-card-number">{number}</span>}
        <h3>{label}</h3>
        <button className="p-btn p-btn-primary" onClick={() => handleSave(type)} disabled={loading || uploading === type}>
          Save {label}
        </button>
      </div>

      <div className="p-input-group">
        <label className="p-label">Title</label>
        <input
          type="text"
          value={sections[type]?.title || ''}
          onChange={(e) => handleChange(type, 'title', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Enter section title..."
        />
      </div>

      <div className="p-input-group" style={{ marginTop: '16px' }}>
        <label className="p-label">Description</label>
        <textarea
          rows={5}
          value={sections[type]?.description || ''}
          onChange={(e) => handleChange(type, 'description', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Enter section description..."
          style={{ resize: 'vertical', lineHeight: '1.6' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label className="p-label">Section Image</label>
        {sections[type]?.image && (
          <div className="p-img-preview">
            <img src={sections[type].image} alt={label} onError={(e) => { e.target.style.display = 'none' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
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
            {uploading === type ? 'Uploading...' : 'Choose File'}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {sections[type]?.image ? 'Image loaded' : 'No file chosen'}
          </span>
        </div>
        <input
          type="text"
          value={sections[type]?.image || ''}
          onChange={(e) => handleChange(type, 'image', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Or paste image URL..."
          style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}
        />
      </div>
    </div>
  )
}

function FeaturesGridCard({ sections, handleFeatureChange, handleFeatureUpload, handleSave, loading, uploading, fileInputs }) {
  let featureItems = [
    { title: '', description: '', image: '' },
    { title: '', description: '', image: '' },
    { title: '', description: '', image: '' },
  ]
  try {
    const parsed = JSON.parse(sections.features?.description || '[]')
    if (Array.isArray(parsed)) {
      featureItems = [parsed[0] || featureItems[0], parsed[1] || featureItems[1], parsed[2] || featureItems[2]]
    }
  } catch {}

  const updateFeatureItem = (index, field, value) => {
    const updated = [...featureItems]
    updated[index] = { ...updated[index], [field]: value }
    handleFeatureChange('features', 'description', JSON.stringify(updated))
  }

  return (
    <div className="p-card">
      <div className="p-card-header">
        <span className="p-card-number">3</span>
        <h3>Features Grid (3 Horizontal Items)</h3>
        <button className="p-btn p-btn-primary" onClick={() => handleSave('features')} disabled={loading}>
          Save Features Grid
        </button>
      </div>

      <div className="p-input-group" style={{ marginBottom: '24px' }}>
        <label className="p-label">Grid Section Main Title</label>
        <input
          type="text"
          value={sections.features?.title || ''}
          onChange={(e) => handleFeatureChange('features', 'title', e.target.value)}
          disabled={loading}
          className="p-input"
          placeholder="Main features section title..."
        />
      </div>

      <div className="p-features-horizontal-grid">
        {featureItems.map((item, idx) => (
          <div className="p-feature-subcard" key={idx}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: 'var(--accent-color)', fontWeight: 600 }}>
              Feature Item #{idx + 1}
            </h4>

            <div className="p-input-group" style={{ marginBottom: '12px' }}>
              <label className="p-label">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateFeatureItem(idx, 'title', e.target.value)}
                disabled={loading}
                className="p-input"
                placeholder={`Feature ${idx + 1} title`}
              />
            </div>

            <div className="p-input-group" style={{ marginBottom: '12px' }}>
              <label className="p-label">Description</label>
              <textarea
                rows={3}
                value={item.description}
                onChange={(e) => updateFeatureItem(idx, 'description', e.target.value)}
                disabled={loading}
                className="p-input"
                placeholder={`Feature ${idx + 1} description`}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label className="p-label">Feature Image</label>
              {item.image && (
                <div className="p-img-preview" style={{ height: '120px' }}>
                  <img src={item.image} alt={`Feature ${idx + 1}`} onError={(e) => { e.target.style.display = 'none' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
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
                  onClick={() => fileInputs.current[`feature_${idx}`]?.click()}
                  disabled={uploading === `feature_${idx}`}
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                >
                  {uploading === `feature_${idx}` ? 'Uploading...' : 'Choose File'}
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.image ? 'Loaded' : 'No file'}
                </span>
              </div>
              <input
                type="text"
                value={item.image}
                onChange={(e) => updateFeatureItem(idx, 'image', e.target.value)}
                disabled={loading}
                className="p-input"
                placeholder="Or paste image URL..."
                style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.8rem', padding: '8px 12px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function About({ token }) {
  const [activeTab, setActiveTab] = useState('homepage')
  const [sections, setSections] = useState({
    main_banner: { title: '', description: '', image: '' },
    primary_section: { title: '', description: '', image: '' },
    features: { title: '', description: '', image: '' },
    conclusion: { title: '', description: '', image: '' },
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const [toast, setToast] = useState(null)
  const fileInputs = useRef({})
  const [homepageAbout, setHomepageAbout] = useState({ company_name: '', tagline: '', description: '', address: '', phone: '', email: '' })
  const [homepageFeatures, setHomepageFeatures] = useState([
    { title: 'Premium Quality', subtitle: 'Handpicked materials and craftsmanship', icon: '✦' },
    { title: 'Flexible Payments', subtitle: 'Weekly plans that suit your budget', icon: '○' },
    { title: 'Nationwide Delivery', subtitle: 'Careful delivery to your doorstep', icon: '♡' },
  ])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true)
      try {
        const [sectionsRes, aboutRes] = await Promise.all([
          fetch(`${API_BASE}/api/about-sections`),
          fetch(`${API_BASE}/api/about`),
        ])
        if (sectionsRes.ok) {
          const data = await sectionsRes.json()
          if (Array.isArray(data)) {
            const map = {}
            data.forEach((s) => {
              map[s.type] = { title: s.title || '', description: s.description || '', image: s.image || '' }
            })
            setSections((prev) => ({ ...prev, ...map }))
          }
        }
        if (aboutRes.ok) {
          const about = await aboutRes.json()
          if (about) {
            setHomepageAbout({
              company_name: about.company_name || '',
              tagline: about.tagline || '',
              description: about.description || '',
              address: about.address || '',
              phone: about.phone || '',
              email: about.email || '',
            })
            try {
              const featuresRes = await fetch(`${API_BASE}/api/about-sections/homepage`)
              if (featuresRes.ok) {
                const feat = await featuresRes.json()
                if (feat?.description) {
                  const parsed = JSON.parse(feat.description)
                  if (Array.isArray(parsed) && parsed.length === 3) setHomepageFeatures(parsed)
                }
              }
            } catch {}
          }
        }
      } catch {
        showToast('Failed to load about data', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchSections()
  }, [])

  const handleChange = (type, field, value) => {
    setSections((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }))
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
        const imageUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        handleChange(type, 'image', imageUrl)
        showToast('Image uploaded successfully', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload error', 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleFeatureUpload = async (index, file) => {
    if (!file) return
    setUploading(`feature_${index}`)
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
        const imageUrl = data.url?.startsWith('http') ? data.url : `${API_BASE}${data.url}`
        let featureItems = [
          { title: '', description: '', image: '' },
          { title: '', description: '', image: '' },
          { title: '', description: '', image: '' },
        ]
        try {
          const parsed = JSON.parse(sections.features.description)
          if (Array.isArray(parsed)) {
            featureItems = [parsed[0] || featureItems[0], parsed[1] || featureItems[1], parsed[2] || featureItems[2]]
          }
        } catch {}
        featureItems[index].image = imageUrl
        handleChange('features', 'description', JSON.stringify(featureItems))
        showToast('Feature image uploaded', 'success')
      } else {
        showToast('Upload failed', 'error')
      }
    } catch {
      showToast('Upload error', 'error')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/api/about-sections/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          title: sections[type]?.title || '',
          description: sections[type]?.description || '',
          image: sections[type]?.image || '',
        }),
      })
      if (res.ok) {
        showToast('Section saved successfully!', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save section', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleSaveHomepageAbout = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(homepageAbout),
      })
      if (res.ok) {
        await fetch(`${API_BASE}/api/about-sections/homepage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: 'homepage', title: 'About Features', description: JSON.stringify(homepageFeatures), image: '' }),
        })
        showToast('Homepage About saved!', 'success')
      } else {
        showToast('Failed to save', 'error')
      }
    } catch { showToast('Server error', 'error') }
  }

  const sharedProps = { sections, handleChange, handleSave, handleFileUpload, loading, uploading, fileInputs }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .p-card-number { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-color); color: #fff; font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .p-card-header h3 { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 0; flex: 1; }

        .p-input-group { display: flex; flex-direction: column; gap: 6px; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus { border-color: var(--accent-color); }

        .p-img-preview { width: 100%; max-width: 350px; height: 180px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); margin-bottom: 10px; background: var(--header-bg); }
        .p-img-preview img { width: 100%; height: 100%; object-fit: cover; }

        .p-features-horizontal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 1024px) { .p-features-horizontal-grid { grid-template-columns: 1fr; } }
        
        .p-feature-subcard { background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; }

        .p-btn { padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .p-btn-secondary { background: var(--hover-bg); border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-secondary:hover { background: var(--border-color); color: var(--text-primary); }

        .toast-premium {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);
          color: var(--text-primary); padding: 16px 24px; border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem;
          display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out;
        }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }
        .toast-premium.warning { border-left-color: #f59e0b; }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`p-btn ${activeTab === 'homepage' ? 'p-btn-primary' : 'p-btn-secondary'}`} onClick={() => setActiveTab('homepage')}>Homepage About</button>
        <button className={`p-btn ${activeTab === 'aboutpage' ? 'p-btn-primary' : 'p-btn-secondary'}`} onClick={() => setActiveTab('aboutpage')}>About Us Page</button>
      </div>

      {activeTab === 'homepage' && (
        <div className="p-card">
          <div className="p-card-header">
            <h3>Homepage About Section</h3>
            <button className="p-btn p-btn-primary" onClick={handleSaveHomepageAbout} disabled={loading}>Save Homepage About</button>
          </div>
          <div className="p-input-group" style={{ marginBottom: 16 }}>
            <label className="p-label">Company Name</label>
            <input type="text" className="p-input" value={homepageAbout.company_name} onChange={e => setHomepageAbout({...homepageAbout, company_name: e.target.value})} placeholder="AF Furnishings" />
          </div>
          <div className="p-input-group" style={{ marginBottom: 16 }}>
            <label className="p-label">Tagline</label>
            <input type="text" className="p-input" value={homepageAbout.tagline} onChange={e => setHomepageAbout({...homepageAbout, tagline: e.target.value})} placeholder="Quality furniture for every home" />
          </div>
          <div className="p-input-group" style={{ marginBottom: 24 }}>
            <label className="p-label">Description</label>
            <textarea className="p-input" rows="3" value={homepageAbout.description} onChange={e => setHomepageAbout({...homepageAbout, description: e.target.value})} style={{ resize: 'vertical' }} />
          </div>
          <h4 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-primary)' }}>Feature Cards</h4>
          <div className="p-features-horizontal-grid">
            {homepageFeatures.map((f, idx) => (
              <div className="p-feature-subcard" key={idx}>
                <div className="p-input-group" style={{ marginBottom: 12 }}>
                  <label className="p-label">Icon (emoji/character)</label>
                  <input type="text" className="p-input" value={f.icon} onChange={e => { const updated = [...homepageFeatures]; updated[idx] = {...updated[idx], icon: e.target.value}; setHomepageFeatures(updated) }} />
                </div>
                <div className="p-input-group" style={{ marginBottom: 12 }}>
                  <label className="p-label">Title</label>
                  <input type="text" className="p-input" value={f.title} onChange={e => { const updated = [...homepageFeatures]; updated[idx] = {...updated[idx], title: e.target.value}; setHomepageFeatures(updated) }} />
                </div>
                <div className="p-input-group">
                  <label className="p-label">Subtitle</label>
                  <input type="text" className="p-input" value={f.subtitle} onChange={e => { const updated = [...homepageFeatures]; updated[idx] = {...updated[idx], subtitle: e.target.value}; setHomepageFeatures(updated) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'aboutpage' && (
        <>
          <SectionCard type="main_banner" label="Main Banner" number="1" {...sharedProps} />
          <SectionCard type="primary_section" label="Primary Section" number="2" {...sharedProps} />
          <FeaturesGridCard
            sections={sections}
            handleFeatureChange={handleChange}
            handleFeatureUpload={handleFeatureUpload}
            handleSave={handleSave}
            loading={loading}
            uploading={uploading}
            fileInputs={fileInputs}
          />
          <SectionCard type="conclusion" label="Conclusion Block" number="4" {...sharedProps} />
        </>
      )}
    </div>
  )
}

export default About