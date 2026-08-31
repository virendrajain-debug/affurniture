import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'

const DEFAULT_STORES = [
  {
    img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80',
    city: 'Auckland',
    desc: 'Central Auckland showroom with over 200 furniture displays. Open by appointment.',
  },
  {
    img: 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=900&q=80',
    city: 'Wellington',
    desc: 'Wellington design studio with curated collections. Open by appointment.',
  },
  {
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80',
    city: 'Online consultations',
    desc: 'Meet with our furnishing team from wherever you are. Virtual showroom tours available.',
  },
]

function Stores() {
  const [stores, setStores] = useState(DEFAULT_STORES)

  useEffect(() => {
    fetch(`${API_BASE}/api/store-locations`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStores(data.map(s => ({
            img: s.image || DEFAULT_STORES[0].img,
            city: s.name,
            desc: s.description || s.address || '',
            id: s.id,
          })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="stores" id="living">
      <div className="section-title fade-in">
        <span>VISIT US</span>
        <h2>Our showrooms.</h2>
      </div>
      <div className="store-grid">
        {stores.map((s, i) => (
          <article key={s.id || i} className={`fade-in stagger-${i + 1}`}>
            <div className="store-img-wrap">
              <img src={s.img} alt={s.city} />
            </div>
            <div className="store-content">
              <h3>{s.city}</h3>
              <p>{s.desc}</p>
              <Link to="/store-locations">Visit Us &#8594;</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Stores
