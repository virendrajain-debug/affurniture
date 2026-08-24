import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function About({ token }) {
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
        handleChange(type, 'image', `${API_BASE}${data.url}`)
        showToast('Image uploaded', 'success')
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

  const SectionCard = ({ type, label, showImage = true, number }) => (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2d7c5', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {number && (
          <span style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#1a2744', color: '#fff', fontSize: '14px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>{number}</span>
        )}
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: '#1a2744', margin: 0, flex: 1 }}>{label}</h3>
        <button
          className="btn-primary"
          onClick={() => handleSave(type)}
          disabled={loading}
          style={{ background: '#1a2744', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: '600' }}
        >
          Save{label.includes('Conclusion') ? ' Conclusion' : ''}
        </button>
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2a3f6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Image</label>
          {sections[type].image && (
            <div style={{ width: '100%', maxWidth: '400px', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', marginBottom: '12px' }}>
              <img
                src={sections[type].image}
                alt={label}
                onError={(e) => { e.target.style.display = 'none' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={el => fileInputs.current[type] = el}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(type, e.target.files[0])}
            />
            <button
              onClick={() => fileInputs.current[type]?.click()}
              disabled={uploading === type}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #c5d5e8',
                background: '#f8fafd', color: '#1a2744', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif"
              }}
            >
              {uploading === type ? 'Uploading...' : 'Choose File'}
            </button>
            <span style={{ fontSize: '13px', color: '#888' }}>
              {sections[type].image ? 'File selected' : 'No file chosen'}
            </span>
          </div>
          <input
            type="text"
            value={sections[type].image}
            onChange={(e) => handleChange(type, 'image', e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2d7c5', fontSize: '13px', background: '#fffdf9', color: '#1a1a2e', outline: 'none', fontFamily: 'monospace', marginTop: '10px' }}
            placeholder="Or paste image URL..."
          />
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>
            Upload from computer or paste a URL
          </p>
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

      <SectionCard type="main_banner" label="Main Banner" number="1" />
      <SectionCard type="primary_section" label="Primary Section" number="2" />
      <SectionCard type="features" label="Features Grid" number="3" showImage={false} />
      <SectionCard type="conclusion" label="Conclusion Block" number="4" />
    </div>
  )
}

export default About
