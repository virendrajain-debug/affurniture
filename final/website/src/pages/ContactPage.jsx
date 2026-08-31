import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ContactSection from '../components/ContactSection'

function ContactPage() {
  const [pageData, setPageData] = useState({})
  const [banners, setBanners] = useState([])

  useEffect(() => {
    fetch(API_BASE + '/api/pages/contact')
      .then(r => r.json())
      .then(d => { if (d) setPageData(d) })
      .catch(() => {})

    fetch(API_BASE + '/api/page-banners?page_key=contact')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data) })
      .catch(() => {})
  }, [])

  const activeHero = banners.find(b => b.slot === 'hero' && b.active === 1)

  return (
    <>
      <Header />
      <main className="about-page">
        {/* Banner only if active === 1 */}
        {activeHero && (
          <section className="terms-hero-banner">
            <img src={getAssetUrl(activeHero.image)} alt={activeHero.title || pageData.title || 'Contact Us'} />
            <div className="terms-hero-overlay">
              <span>{activeHero.label || pageData.eyebrow || 'GET IN TOUCH'}</span>
              <h1>{activeHero.title || pageData.title || 'Contact Us'}</h1>
              <p>{activeHero.subtitle || pageData.subtitle || ''}</p>
            </div>
          </section>
        )}

        
        <div style={{ paddingTop: activeHero ? '40px' : '80px' }}>
          <ContactSection />
        </div>
        
      </main>
      <Footer />
    </>
  )
}

export default ContactPage;
