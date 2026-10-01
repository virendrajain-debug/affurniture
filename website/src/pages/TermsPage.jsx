import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getJson } from '../api'
import Header from '../components/Header'
import Footer from '../components/Footer'

function TermsPage() {
  const [terms, setTerms] = useState(null)
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/page-content/terms`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      getJson('/api/settings').catch(() => ({})),
    ]).then(([termsData, settingsData]) => {
      if (termsData) setTerms(termsData)
      if (settingsData) setBanners(settingsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src={getAssetUrl(banners.terms_banner) || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80'} alt="Terms and Conditions" loading="lazy" decoding="async" />
          <div className="terms-hero-overlay">
            <span>LEGAL</span>
            <h1>Terms &amp; Conditions</h1>
            <p>Please read these terms carefully before using our services</p>
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
              <div className="terms-text" dangerouslySetInnerHTML={{ __html: terms?.content || 'Terms & Conditions content is being updated. Please check back later.' }} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default TermsPage
