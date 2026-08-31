import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'


function ReturnsPage() {
  const [pageData, setPageData] = useState({})
  const [banners, setBanners] = useState([])

  useEffect(() => {
    fetch(API_BASE + '/api/pages/returns')
      .then(r => r.json())
      .then(d => { if (d) setPageData(d) })
      .catch(() => {})

    fetch(API_BASE + '/api/page-banners?page_key=returns')
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
            <img src={getAssetUrl(activeHero.image)} alt={activeHero.title || pageData.title || 'Returns & Refund Policy'} />
            <div className="terms-hero-overlay">
              <span>{activeHero.label || pageData.eyebrow || 'OUR GUARANTEE'}</span>
              <h1>{activeHero.title || pageData.title || 'Returns & Refund Policy'}</h1>
              <p>{activeHero.subtitle || pageData.subtitle || ''}</p>
            </div>
          </section>
        )}

        
        <section className="terms-section" style={{ paddingTop: activeHero ? '60px' : '80px', paddingBottom: '60px' }}>
          <div className="terms-content">
            <div className="terms-text">
              {pageData.content ? (
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
              ) : (
                <p>Content is being updated. Please check back shortly.</p>
              )}
            </div>
          </div>
        </section>
        
      </main>
      <Footer />
    </>
  )
}

export default ReturnsPage;
