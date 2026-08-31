import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'

function AboutSection() {
  const [about, setAbout] = useState(null)
  const [banners, setBanners] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/about`)
      .then(r => r.json())
      .then(setAbout)
      .catch(() => {})

    fetch(`${API_BASE}/api/page-banners?page_key=about`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data) })
      .catch(() => {})
  }, [])

  const storyBanner = banners.find(b => b.slot === 'story' && b.active === 1)
  const showroomBanner = banners.find(b => b.slot === 'showroom' && b.active === 1)

  const imgMain = storyBanner?.image ? getAssetUrl(storyBanner.image) : (about?.slot2_feature_img || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85')
  const imgSec = showroomBanner?.image ? getAssetUrl(showroomBanner.image) : (about?.slot3_img_a || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=85')

  return (
    <section className="about-section" id="about">
      <div className="section-title">
        <span>ABOUT US</span>
        <h2>{about?.company_name || 'AF Furnishings'}</h2>
      </div>
      <div className="about-grid">
        <div className="about-image-col">
          <img src={imgMain} alt="Our showroom" className="about-img-main" />
          <img src={imgSec} alt="Quality furniture" className="about-img-secondary" />
        </div>
        <div className="about-text-col">
          {about?.tagline && <h3>{about.tagline}</h3>}
          <p>{about?.description || 'Quality furniture for every home. We provide comfortable, stylish furniture to make your living spaces complete. Our mission is to bring warmth and comfort to every New Zealand home.'}</p>
          <p>We offer a wide range of furniture including living room suites, bedroom sets, and dining collections. With flexible weekly payment options, we make quality furniture accessible to everyone.</p>
          <div className="about-features">
            <div className="about-feature">
              <span className="about-feature-icon">&#10022;</span>
              <div>
                <strong>Premium Quality</strong>
                <p>Handpicked materials and craftsmanship</p>
              </div>
            </div>
            <div className="about-feature">
              <span className="about-feature-icon">&#9676;</span>
              <div>
                <strong>Flexible Payments</strong>
                <p>Weekly plans that suit your budget</p>
              </div>
            </div>
            <div className="about-feature">
              <span className="about-feature-icon">&#9825;</span>
              <div>
                <strong>Nationwide Delivery</strong>
                <p>Careful delivery to your doorstep</p>
              </div>
            </div>
          </div>
          <div className="about-contact-row">
            {about?.address && <div><strong>Visit Us:</strong> {about.address}</div>}
            {about?.phone && <div><strong>Call:</strong> {about.phone}</div>}
            {about?.email && <div><strong>Email:</strong> {about.email}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection;
