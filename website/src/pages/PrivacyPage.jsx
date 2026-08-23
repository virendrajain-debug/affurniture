import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PrivacyPage() {
  const [privacy, setPrivacy] = useState(null)
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/privacy`)
      .then(r => r.json())
      .then(setPrivacy)
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
          <img src={banners.privacy_banner || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85'} alt="Privacy & Security" />
          <div className="terms-hero-overlay">
            <span>YOUR PRIVACY</span>
            <h1>Privacy Policy</h1>
            <p>How we collect, use and protect your personal information</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {privacy?.content || 'Privacy Policy content is being updated. Please check back later.'}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default PrivacyPage
