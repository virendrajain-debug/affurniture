import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PrivacyPage() {
  const [privacy, setPrivacy] = useState(null)
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/page-content/privacy-policy`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
    ]).then(([privacyData, settingsData]) => {
      if (privacyData) setPrivacy(privacyData)
      if (settingsData) setBanners(settingsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src={getAssetUrl(banners.privacy_banner) || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80'} alt="Privacy & Security" loading="lazy" decoding="async" />
          <div className="terms-hero-overlay">
            <span>YOUR PRIVACY</span>
            <h1>Privacy Policy</h1>
            <p>How we collect, use and protect your personal information</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            {loading ? (
              <div className="category-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            ) : (
              <div className="terms-text" dangerouslySetInnerHTML={{ __html: privacy?.content || 'Privacy Policy content is being updated. Please check back later.' }} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default PrivacyPage
