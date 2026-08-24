import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function About({ token }) {
  const [sections, setSections] = useState({
    main_banner: { title: '', description: '', image: '' },
    primary_section: { title: '', description: '', image: '' },
    features: { title: '', description: '', image: '' },
  })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/about-sections`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {}
          data.forEach(s => {
            map[s.type] = { title: s.title || '', description: s.description || '', image: s.image || '' }
          })
          setSections(prev => ({ ...prev, ...map }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (type, field, value) => {
    setSections(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }))
  }

  const handleSave = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/api/about-sections/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(sections[type]),
      })
      if (res.ok) {
        showToast(`${type.replace(/_/g, ' ')} saved`, 'success')
      } else {
        showToast('Failed to save', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const SectionCard = ({ type, label, showImage = true }) => (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: '#1a2744', margin: 0 }}>{label}</h3>
        <button className="btn-primary" onClick={() => handleSave(type)} disabled={loading}>Save</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3f6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Title</label>
        <input
          type="text"
          value={sections[type].title}
          onChange={(e) => handleChange(type, 'title', e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #c5d5e8', fontSize: '14px', background: '#fffdf9', color: '#1a1a2e', outline: 'none' }}
          placeholder="Enter title..."
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3f6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Description</label>
        <textarea
          rows={5}
          value={sections[type].description}
          onChange={(e) => handleChange(type, 'description', e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #c5d5e8', fontSize: '14px', background: '#fffdf9', color: '#1a1a2e', outline: 'none', resize: 'vertical', lineHeight: '1.6' }}
          placeholder="Enter description..."
        />
      </div>

      {showImage && (
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3f6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Image URL</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {sections[type].image && (
              <div style={{ width: '200px', height: '130px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', flexShrink: 0 }}>
                <img
                  src={sections[type].image}
                  alt={label}
                  onError={(e) => { e.target.style.display = 'none' }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={sections[type].image}
                onChange={(e) => handleChange(type, 'image', e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #c5d5e8', fontSize: '13px', background: '#fffdf9', color: '#1a1a2e', outline: 'none', fontFamily: 'monospace' }}
                placeholder="Paste image URL (Unsplash, Cloudinary, etc.)"
              />
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>
                Paste a direct image link. Works with Unsplash, Cloudinary, or any image URL.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="about-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>About Us Page Editor</h2>
        <p>Edit the About Us page sections visible to customers</p>
      </div>

      <SectionCard type="main_banner" label="Main Banner" />
      <SectionCard type="primary_section" label="Primary Section" />
      <SectionCard type="features" label="Features Grid" showImage={false} />
    </div>
  )
}

export default About
