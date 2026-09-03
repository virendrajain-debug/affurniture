import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ReturnsPage() {
  const [data, setData] = useState(null)
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/page-content/returns`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
    ]).then(([returnsData, settingsData]) => {
      if (returnsData) setData(returnsData)
      if (settingsData) setBanners(settingsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src={getAssetUrl(banners.returns_banner) || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=85'} alt="Returns" />
          <div className="terms-hero-overlay">
            <span>EASY RETURNS</span>
            <h1>Returns &amp; Refunds</h1>
            <p>Our hassle-free return policy for your peace of mind</p>
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
              <div className="terms-text" dangerouslySetInnerHTML={{ __html: data?.content || 'Returns information is being updated. Please check back later.' }} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ReturnsPage
