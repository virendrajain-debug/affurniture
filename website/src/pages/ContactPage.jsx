import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

function ContactPage() {
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(setBanners)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main>
        <section className="terms-hero-banner">
          <img src={banners.contact_banner || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=2000&q=85'} alt="Contact Us" />
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
