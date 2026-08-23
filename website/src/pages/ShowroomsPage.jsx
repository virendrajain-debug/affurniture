import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ShowroomsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/showrooms`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=2000&q=85" alt="Our Showrooms" />
          <div className="terms-hero-overlay">
            <span>OUR LOCATIONS</span>
            <h1>Our Showrooms</h1>
            <p>Visit us and experience quality furniture in person</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {data?.content || 'Showrooms information is being updated. Please check back later.'}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ShowroomsPage
