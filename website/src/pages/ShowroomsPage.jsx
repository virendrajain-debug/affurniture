import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ShowroomsPage() {
  const [data, setData] = useState(null)
  const [banners, setBanners] = useState({})
  const [locations, setLocations] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/showrooms`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(setBanners)
      .catch(() => {})
    fetch(`${API_BASE}/api/store-locations`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLocations(data) })
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src={banners.showrooms_banner || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=2000&q=85'} alt="Our Showrooms" />
          <div className="terms-hero-overlay">
            <span>OUR LOCATIONS</span>
            <h1>Our Showrooms</h1>
            <p>Visit us and experience quality furniture in person</p>
          </div>
        </section>

        {locations.length > 0 && (
          <section className="stores" style={{ paddingTop: '60px' }}>
            <div className="section-title fade-in">
              <span>OUR STORES</span>
              <h2>Find us near you.</h2>
            </div>
            <div className="store-grid">
              {locations.map((loc, i) => (
                <article key={loc.id} className={`fade-in stagger-${i + 1}`}>
                  <div className="store-img-wrap">
                    <img src={loc.google_map_url ? `https://maps.googleapis.com/maps/api/staticmap?center=${loc.latitude},${loc.longitude}&zoom=15&size=600x400&markers=${loc.latitude},${loc.longitude}` : 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80'} alt={loc.name} />
                  </div>
                  <div className="store-content">
                    <h3>{loc.name}</h3>
                    <p>{loc.description || loc.address}</p>
                    {loc.phone && <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{loc.phone}</p>}
                    {loc.email && <p style={{ fontSize: '0.9rem' }}>{loc.email}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {data?.content && (
          <section className="terms-section">
            <div className="terms-content">
              <div className="terms-text">
                {data.content}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

export default ShowroomsPage
