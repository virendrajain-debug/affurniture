import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function AboutPage() {
  const [about, setAbout] = useState(null)
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/about`)
      .then(r => r.json())
      .then(setAbout)
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
        <section className="about-hero-banner">
          <img src={banners.about_banner || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85'} alt="AF Furnishings showroom" />
          <div className="about-hero-overlay">
            <span>OUR STORY</span>
            <h1>About AF Furnishings</h1>
            <p>Quality furniture for every New Zealand home</p>
          </div>
        </section>

        <section className="about-full-story">
          <div className="about-story-grid">
            <div className="about-story-img">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85" alt="Our team" />
            </div>
            <div className="about-story-text">
              <span>WHO WE ARE</span>
              <h2>{about?.company_name || 'AF Furnishings'}</h2>
              <p>{about?.description || 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.'}</p>
              <p>Founded in New Zealand, we have been serving families across the country with beautiful, durable furniture at honest prices. Our showrooms in Auckland and Wellington showcase our carefully curated collections.</p>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="section-title">
            <span>OUR VALUES</span>
            <h2>What we stand for.</h2>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80" alt="Quality" />
              <h3>Quality First</h3>
              <p>Every piece of furniture is crafted from premium materials, built to last for years of daily use.</p>
            </div>
            <div className="about-value-card">
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80" alt="Comfort" />
              <h3>Comfort Always</h3>
              <p>We test every sofa, chair and bed to ensure it meets our comfort standards before it reaches you.</p>
            </div>
            <div className="about-value-card">
              <img src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80" alt="Community" />
              <h3>For Every Home</h3>
              <p>With flexible weekly payments, we make quality furniture accessible to every New Zealand family.</p>
            </div>
          </div>
        </section>

        <section className="about-team">
          <div className="about-team-grid">
            <div className="about-team-text">
              <span>OUR TEAM</span>
              <h2>Meet the people behind AF Furnishings.</h2>
              <p>Our team of friendly furniture experts is here to help you find the perfect pieces for your home. From selecting the right sofa to planning your dream bedroom, we guide you every step of the way.</p>
              <p>Visit our showrooms in Auckland or Wellington, or contact us online for a virtual consultation.</p>
            </div>
            <div className="about-team-img">
              <img src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85" alt="Our showroom" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default AboutPage
