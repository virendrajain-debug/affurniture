import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

const defaultShowrooms = [
  {
    img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80',
    city: 'Auckland',
    desc: 'Central Auckland showroom with over 200 furniture displays. Open by appointment.',
    link: 'mailto:affurniture@gmail.com',
    linkText: 'Book a visit',
  },
  {
    img: 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=900&q=80',
    city: 'Wellington',
    desc: 'Wellington design studio with curated collections. Open by appointment.',
    link: 'mailto:affurniture@gmail.com',
    linkText: 'Book a visit',
  },
  {
    img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80',
    city: 'Online consultations',
    desc: 'Meet with our furnishing team from wherever you are. Virtual showroom tours available.',
    link: 'tel:12345667890',
    linkText: 'Call us',
  },
]

function ShowroomsPage() {
  const [data, setData] = useState(null)
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/showrooms`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(setBanners)
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

        <section className="stores" style={{ paddingTop: '60px' }}>
          <div className="section-title fade-in">
            <span>VISIT US</span>
            <h2>Our showrooms.</h2>
          </div>
          <div className="store-grid">
            {defaultShowrooms.map((s, i) => (
              <article key={i} className={`fade-in stagger-${i + 1}`}>
                <div className="store-img-wrap">
                  <img src={s.img} alt={s.city} />
                </div>
                <div className="store-content">
                  <h3>{s.city}</h3>
                  <p>{s.desc}</p>
                  <a href={s.link}>{s.linkText} &#8594;</a>
                </div>
              </article>
            ))}
          </div>
        </section>

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
