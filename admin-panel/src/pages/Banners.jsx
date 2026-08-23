import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const bannerKeys = [
  { key: 'home_hero_banner', label: 'Home Page Hero', fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85' },
  { key: 'showrooms_banner', label: 'Showrooms Page', fallback: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=2000&q=85' },
  { key: 'delivery_info_banner', label: 'Delivery Info Page', fallback: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85' },
  { key: 'shop_furniture_banner', label: 'Shop Furniture Page', fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85' },
  { key: 'returns_banner', label: 'Returns Page', fallback: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=85' },
  { key: 'terms_banner', label: 'Terms & Conditions Page', fallback: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2000&q=85' },
  { key: 'privacy_banner', label: 'Privacy Policy Page', fallback: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85' },
  { key: 'about_banner', label: 'About Us Page', fallback: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85' },
  { key: 'winz_banner', label: 'WinZ Page', fallback: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85' },
  { key: 'contact_banner', label: 'Contact Us Page', fallback: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=85' },
]

function Banners({ token }) {
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(data => setBanners(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key, value) => {
    setBanners(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      const payload = {}
      bannerKeys.forEach(({ key, fallback }) => {
        payload[key] = banners[key] || fallback
      })
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        showToast('Banner images saved', 'success')
      } else {
        showToast('Failed to save', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="terms-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Page Banners</h2>
        <p>Edit hero banner images for each page</p>
      </div>

      <div style={{ display: 'grid', gap: '24px', marginTop: '20px' }}>
        {bannerKeys.map(({ key, label, fallback }) => {
          const url = banners[key] || fallback
          return (
            <div key={key} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2d7c5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', color: '#28241f', fontSize: '14px' }}>{label}</label>
                <button
                  onClick={() => handleChange(key, fallback)}
                  style={{ background: 'none', border: 'none', color: '#aa7a3e', cursor: 'pointer', fontSize: '13px' }}
                >
                  Reset to default
                </button>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '300px', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2d7c5', flexShrink: 0 }}>
                  <img
                    src={url}
                    alt={label}
                    onError={(e) => { e.target.src = fallback }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={banners[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={fallback}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid #e2d7c5', fontSize: '13px', color: '#28241f',
                      background: '#fffdf9', fontFamily: 'monospace',
                    }}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>
                    Paste an image URL (Unsplash, Cloudinary, or any direct image link)
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="editor-actions" style={{ marginTop: '24px' }}>
        <button className="btn-primary" onClick={handleSave}>Save All Banners</button>
      </div>
    </div>
  )
}

export default Banners
