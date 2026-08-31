import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function WinzPage() {
  const [pageData, setPageData] = useState({})
  const [banners, setBanners] = useState([])
  const [winzProducts, setWinzProducts] = useState([])

  useEffect(() => {
    fetch(API_BASE + '/api/pages/winz')
      .then(r => r.json())
      .then(d => { if (d) setPageData(d) })
      .catch(() => {})

    fetch(API_BASE + '/api/page-banners?page_key=winz')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data) })
      .catch(() => {})

    fetch(API_BASE + '/api/winz-products?active_only=true')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setWinzProducts(data) })
      .catch(() => {})
  }, [])

  const activeHero = banners.find(b => b.slot === 'hero' && b.active === 1)
  const bannerImg = activeHero?.image ? getAssetUrl(activeHero.image) : (pageData.hero_banner || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85')

  return (
    <>
      <Header />
      <main>
        {/* Top Hero Banner */}
        <section className="winz-hero">
          <div className="winz-hero-img">
            <img src={bannerImg} alt={activeHero?.title || pageData.title || 'WINZ Quotes'} />
          </div>
          <div className="winz-hero-copy">
            <span>{activeHero?.label || pageData.eyebrow || 'AF FURNISHINGS'}</span>
            <h1>{activeHero?.title ? activeHero.title : (pageData.title ? pageData.title : <>Furniture for<br /><em>your fresh start.</em></>)}</h1>
            <p>{activeHero?.subtitle || pageData.subtitle || 'Discover home essentials for everyday living. Browse the collections, then get in touch for friendly help.'}</p>
            <a href="#range" className="primary">View the range</a>
          </div>
        </section>

        {pageData.content && (
          <section className="terms-section" style={{ paddingTop: '40px', paddingBottom: '20px' }}>
            <div className="terms-content">
              <div className="terms-text" dangerouslySetInnerHTML={{ __html: pageData.content }} />
            </div>
          </section>
        )}

        {/* Feature Steps */}
        <section className="feature-strip">
          <div>
            <b>01</b>
            <span><strong>Furniture essentials</strong>Practical pieces for every room.</span>
          </div>
          <div>
            <b>02</b>
            <span><strong>Simple guidance</strong>Our team is ready to help.</span>
          </div>
          <div>
            <b>03</b>
            <span><strong>Easy contact</strong>Call or email us anytime.</span>
          </div>
        </section>

        {/* Dynamic Catalogue Picks from winz_products */}
        <section className="range" id="range">
          <div className="section-title">
            <span>CATALOGUE PICKS</span>
            <h2>Home essentials.</h2>
            <p>Explore practical furniture choices for a comfortable home, eligible for WINZ quotes.</p>
          </div>
          <div className="range-grid">
            {winzProducts.map((p) => (
              <article key={p.id} className="range-card">
                <div className="range-img">
                  <img
                    src={getAssetUrl(p.image)}
                    alt={p.name}
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=WinZ+Product' }}
                  />
                  {p.price > 0 && <span className="product-badge">EST. ${Number(p.price).toLocaleString()}</span>}
                </div>
                <div className="range-info">
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-color, #d4af37)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    {p.category} {p.item_code ? `• ${p.item_code}` : ''}
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <Link to={`/winz-quote?product=${encodeURIComponent(p.name)}`} className="btn-range">
                    Get a quote
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="quote-cta">
          <div className="quote-cta-inner">
            <span>READY TO ORDER?</span>
            <h2>Get your WINZ quote today.</h2>
            <p>We supply official registered WINZ itemised quotes accepted across New Zealand.</p>
            <Link to="/winz-quote" className="primary">Request Official Quote</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default WinzPage;
