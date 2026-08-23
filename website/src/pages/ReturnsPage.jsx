import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ReturnsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/returns`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=85" alt="Returns" />
          <div className="terms-hero-overlay">
            <span>EASY RETURNS</span>
            <h1>Returns &amp; Refunds</h1>
            <p>Our hassle-free return policy for your peace of mind</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {data?.content || 'Returns information is being updated. Please check back later.'}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ReturnsPage
