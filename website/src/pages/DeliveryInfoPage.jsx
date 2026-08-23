import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function DeliveryInfoPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/delivery-info`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85" alt="Delivery Information" />
          <div className="terms-hero-overlay">
            <span>SHIPPING</span>
            <h1>Delivery Information</h1>
            <p>Everything you need to know about our delivery services</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {data?.content || 'Delivery information is being updated. Please check back later.'}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default DeliveryInfoPage
