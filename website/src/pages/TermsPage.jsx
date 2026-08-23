import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function TermsPage() {
  const [terms, setTerms] = useState(null)
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/terms`)
      .then(r => r.json())
      .then(setTerms)
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
          <img src={banners.terms_banner || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2000&q=85'} alt="Terms and Conditions" />
          <div className="terms-hero-overlay">
            <span>LEGAL</span>
            <h1>Terms &amp; Conditions</h1>
            <p>Please read these terms carefully before using our services</p>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {terms?.content || 'Terms & Conditions content is being updated. Please check back later.'}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default TermsPage
