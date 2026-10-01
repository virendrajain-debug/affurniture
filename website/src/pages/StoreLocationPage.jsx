import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function StoreLocationPage() {
  const [locations, setLocations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/store-locations`, { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data)
          setSelected(data[0])
        }
      } catch { setLocations([]) }
      setLoading(false)
    }
    fetchLocations()
  }, [])

  const openInGoogleMaps = (loc) => {
    if (loc.latitude && loc.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`, '_blank')
    } else if (loc.google_map_url) {
      window.open(loc.google_map_url, '_blank')
    }
  }

  const getMapEmbedUrl = (loc) => {
    if (loc.latitude && loc.longitude) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50000!2d${loc.longitude}!3d${loc.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${loc.latitude},${loc.longitude}`
    }
    return loc.google_map_url || ''
  }

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner">
          <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80" alt="Our Stores" loading="lazy" decoding="async" />
          <div className="terms-hero-overlay">
            <span>VISIT US</span>
            <h1>Our Store Locations</h1>
            <p>Find us at a location near you</p>
          </div>
        </section>

        <section className="store-location-page">
          <div className="store-location-container">
            <div className="store-locations-sidebar">
              <h2>Our Stores</h2>
              {loading ? (
                <div className="category-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading locations...</p>
                </div>
              ) : locations.length === 0 ? (
                <p className="store-loading-text">No store locations available yet.</p>
              ) : (
                <div className="store-location-list">
                  {locations.map(loc => (
                    <div
                      key={loc.id}
                      className={`store-location-card ${selected?.id === loc.id ? 'active' : ''}`}
                      onClick={() => setSelected(loc)}
                    >
                      {loc.image && (
                        <div className="store-location-img">
                          <img src={getAssetUrl(loc.image)} alt={loc.name} />
                        </div>
                      )}
                      <h3>{loc.name}</h3>
                      {loc.address && <p className="store-loc-address">{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>}
                      {loc.phone && <p className="store-loc-phone">Phone: {loc.phone}</p>}
                      {loc.email && <p className="store-loc-email">Email: {loc.email}</p>}
                      {loc.description && <p className="store-loc-desc">{loc.description}</p>}
                      <div className="store-loc-actions">
                        <button className="store-directions-btn" onClick={(e) => { e.stopPropagation(); openInGoogleMaps(loc) }}>
                          Get Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="store-map-container">
              {selected ? (
                <>
                  <div className="store-map-wrapper">
                    <iframe
                      src={getMapEmbedUrl(selected)}
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: '16px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Store Location Map"
                    />
                  </div>
                  <div className="store-map-info">
                    <h3>{selected.name}</h3>
                    {selected.address && <p>{selected.address}{selected.city ? `, ${selected.city}` : ''}</p>}
                    <button className="primary" onClick={() => openInGoogleMaps(selected)}>
                      Open in Google Maps
                    </button>
                  </div>
                </>
              ) : (
                <div className="store-map-placeholder">
                  <p>Select a store location to view on map</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default StoreLocationPage
