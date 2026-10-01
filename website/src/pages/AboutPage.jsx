import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function AboutPage() {
  const [about, setAbout] = useState(null)
  const [banners, setBanners] = useState({})
  const [sections, setSections] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/about`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/api/about-sections`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
    ]).then(([aboutData, settingsData, sectionsData]) => {
      if (aboutData) setAbout(aboutData)
      if (settingsData) setBanners(settingsData)
      if (Array.isArray(sectionsData)) {
        const map = {}
        sectionsData.forEach(s => { map[s.type] = s })
        setSections(map)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const heroEyebrow = sections.primary_section?.title || 'OUR STORY'
  const heroTitle = about?.company_name || 'About AF Furnishings'
  const heroSubtitle = about?.tagline || 'Quality furniture for every New Zealand home'

  const valueCards = [
    sections.value_1?.title ? { title: sections.value_1.title, desc: sections.value_1.description, img: sections.value_1.image } : null,
    sections.value_2?.title ? { title: sections.value_2.title, desc: sections.value_2.description, img: sections.value_2.image } : null,
    sections.value_3?.title ? { title: sections.value_3.title, desc: sections.value_3.description, img: sections.value_3.image } : null,
  ].filter(Boolean)

  const defaultCards = [
    { title: 'Quality First', desc: 'Every piece of furniture is crafted from premium materials, built to last for years of daily use.', img: '' },
    { title: 'Comfort Always', desc: 'We test every sofa, chair and bed to ensure it meets our comfort standards before it reaches you.', img: '' },
    { title: 'For Every Home', desc: 'With flexible weekly payments, we make quality furniture accessible to every New Zealand family.', img: '' },
  ]

  const displayCards = valueCards.length > 0 ? valueCards : defaultCards

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="about-hero-banner">
          <img src={getAssetUrl(banners.about_banner) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'} alt="AF Furnishings showroom" loading="lazy" decoding="async" />
          <div className="about-hero-overlay">
            <span>{heroEyebrow}</span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
          </div>
        </section>

        <section className="about-full-story">
          <div className="about-story-grid">
            <div className="about-story-img">
              <img src={getAssetUrl(about?.image_1) || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85'} alt="Our team" />
            </div>
            <div className="about-story-text">
              <span>{sections.primary_section?.title || 'WHO WE ARE'}</span>
              <h2>{about?.company_name || 'AF Furnishings'}</h2>
              <p>{about?.description || 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.'}</p>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="section-title">
            <span>{sections.features?.title || 'OUR VALUES'}</span>
            <h2>{sections.features?.description || 'What we stand for.'}</h2>
          </div>
          <div className="about-values-grid">
            {displayCards.map((card, i) => (
              <div className="about-value-card" key={i}>
                {card.img ? (
                  <img src={getAssetUrl(card.img)} alt={card.title} />
                ) : (
                  <img src={['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&q=80'][i]} alt={card.title} />
                )}
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-team">
          <div className="about-team-grid">
            <div className="about-team-text">
              <span>{sections.conclusion?.title || 'OUR TEAM'}</span>
              <h2>{sections.conclusion?.description || 'Meet the people behind AF Furnishings.'}</h2>
              <p>Our team of friendly furniture experts is here to help you find the perfect pieces for your home. From selecting the right sofa to planning your dream bedroom, we guide you every step of the way.</p>
              <p>Visit our showrooms in Auckland or Wellington, or contact us online for a virtual consultation.</p>
            </div>
            <div className="about-team-img">
              <img src={getAssetUrl(about?.image_2) || getAssetUrl(sections.conclusion?.image) || 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=85'} alt="Our showroom" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default AboutPage
