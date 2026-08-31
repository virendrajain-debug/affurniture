import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function AboutPage() {
  const [pageData, setPageData] = useState({})
  const [banners, setBanners] = useState([])

  useEffect(() => {
    fetch(API_BASE + '/api/pages/about')
      .then(r => r.json())
      .then(d => { if (d) setPageData(d) })
      .catch(() => {})

    fetch(API_BASE + '/api/page-banners?page_key=about')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data) })
      .catch(() => {})
  }, [])

  const heroBanner = banners.find(b => b.slot === 'hero' && b.active === 1)
  const storyBanner = banners.find(b => b.slot === 'story' && b.active === 1)
  const val1 = banners.find(b => b.slot === 'val_1' && b.active === 1)
  const val2 = banners.find(b => b.slot === 'val_2' && b.active === 1)
  const val3 = banners.find(b => b.slot === 'val_3' && b.active === 1)
  const showroomBanner = banners.find(b => b.slot === 'showroom' && b.active === 1)

  const activeValues = [val1, val2, val3].filter(Boolean)

  return (
    <>
      <Header />
      <main className="about-page">
        {/* 1. Top Hero Banner (1) */}
        {heroBanner && (
          <section className="about-hero-banner">
            <img src={getAssetUrl(heroBanner.image)} alt={heroBanner.title || pageData.title || 'About Us'} />
            <div className="about-hero-overlay">
              <span>{heroBanner.label || pageData.eyebrow || 'OUR STORY'}</span>
              <h1>{heroBanner.title || pageData.title || 'About AF Furnishings'}</h1>
              <p>{heroBanner.subtitle || pageData.subtitle || 'Quality furniture for every New Zealand home'}</p>
            </div>
          </section>
        )}

        {/* 2. Story Grid with Feature Image & Formatted Description (1) */}
        <section className="about-full-story">
          <div className="about-story-grid">
            {storyBanner && (
              <div className="about-story-img">
                <img src={getAssetUrl(storyBanner.image)} alt={storyBanner.title || 'Our story'} />
              </div>
            )}
            <div className="about-story-text" style={{ gridColumn: storyBanner ? undefined : '1 / -1' }}>
              <span>{pageData.callout_badge || 'WHO WE ARE'}</span>
              <h2>{storyBanner?.title || pageData.callout_title || pageData.company_name || 'AF Furnishings'}</h2>
              {storyBanner?.description ? (
                <div dangerouslySetInnerHTML={{ __html: storyBanner.description }} />
              ) : pageData.content ? (
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
              ) : (
                <>
                  <p>{pageData.description || 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.'}</p>
                  <p>Founded in New Zealand, we have been serving families across the country with beautiful, durable furniture at honest prices.</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 3. Values Grid (3) - Title & Description Only */}
        {activeValues.length > 0 && (
          <section className="about-values">
            <div className="section-title">
              <span>OUR VALUES</span>
              <h2>{pageData.about_mission || 'What we stand for.'}</h2>
            </div>
            <div className="about-values-grid" style={{ gridTemplateColumns: `repeat(${activeValues.length}, 1fr)` }}>
              {activeValues.map((v, i) => (
                <div key={v.id || i} className="about-value-card">
                  <img src={getAssetUrl(v.image)} alt={v.title || 'Value'} />
                  <h3>{v.title || 'Quality'}</h3>
                  {v.description ? (
                    <div className="about-value-desc" dangerouslySetInnerHTML={{ __html: v.description }} />
                  ) : (
                    <p>{v.subtitle || 'Every piece is crafted from premium materials.'}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Showroom Showcase (1) */}
        {showroomBanner && (
          <section className="about-showroom-banner" style={{ padding: '0 20px 60px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', minHeight: '280px', position: 'relative' }}>
              <img src={getAssetUrl(showroomBanner.image)} alt={showroomBanner.title || 'Showroom'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {(showroomBanner.title || showroomBanner.description || showroomBanner.subtitle) && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', padding: '30px 24px 24px', color: '#fff' }}>
                  {showroomBanner.title && <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{showroomBanner.title}</h3>}
                  {showroomBanner.description ? (
                    <div style={{ margin: '6px 0 0', fontSize: '0.92rem', opacity: 0.95 }} dangerouslySetInnerHTML={{ __html: showroomBanner.description }} />
                  ) : showroomBanner.subtitle ? (
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{showroomBanner.subtitle}</p>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

export default AboutPage;
