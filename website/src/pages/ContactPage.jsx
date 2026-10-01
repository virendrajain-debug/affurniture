import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

function ContactPage() {
  const [banners, setBanners] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setBanners(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main>
        <section className="terms-hero-banner">
          <img src={getAssetUrl(banners.contact_banner) || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1200&q=80'} alt="Contact Us" loading="lazy" decoding="async" />
          <div className="terms-hero-overlay">
            <span>GET IN TOUCH</span>
            <h1>Contact Us</h1>
            <p>We'd love to hear from you — reach out anytime</p>
          </div>
        </section>
        <div style={{ paddingTop: '60px' }}>
          <ContactSection />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ContactPage
