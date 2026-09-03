import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function DeliveryInfoPage() {
  const [data, setData] = useState(null)
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/page-content/delivery-info`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
    ]).then(([deliveryData, settingsData]) => {
      if (deliveryData) setData(deliveryData)
      if (settingsData) setBanners(settingsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src={getAssetUrl(banners.delivery_info_banner) || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85'} alt="Delivery Information" />
          <div className="terms-hero-overlay">
            <span>SHIPPING</span>
            <h1>Delivery Information</h1>
            <p>Everything you need to know about our delivery services</p>
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
              <div className="terms-text" dangerouslySetInnerHTML={{ __html: data?.content || 'Delivery information is being updated. Please check back later.' }} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default DeliveryInfoPage
