import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, getAssetUrl } from '../config'

function SocialIcon({ platform }) {
  const key = (platform || '').toLowerCase().trim()
  if (key === 'instagram') return <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="20" height="20" />
  if (key === 'facebook') return <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="20" height="20" />
  return null
}

function Footer() {
  const [socialLinks, setSocialLinks] = useState([])
  const [about, setAbout] = useState({})
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAll = () => {
      Promise.all([
        fetch(`${API_BASE}/api/categories`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/social`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/about`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      ]).then(([cats, settings, socials, aboutData]) => {
        if (Array.isArray(cats)) setCategories(cats)
        if (settings) {
          if (settings.site_logo) setLogoUrl(getAssetUrl(settings.site_logo))
        }
        if (Array.isArray(socials)) setSocialLinks(socials)
        if (aboutData) setAbout(aboutData)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
    loadAll()
  }, [])

  return (
    <footer>
      <div className="footer-logo">
        <Link to="/"><img src={logoUrl} alt="AF Furnishings" /></Link>
      </div>

      <nav className="footer-nav">
        <Link to="/">Home</Link>
        {categories.map(cat => (
          <Link key={cat.id || cat.name} to={`/category/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>{cat.name}</Link>
        ))}
        <Link to="/about">About</Link>
        <Link to="/on-sale">On Sale</Link>
      </nav>

      <div className="footer-columns">
        <div>
          <h3>AF Furnishings</h3>
          <Link to="/store-locations">Store Locations</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/apply-for-finance">Apply for Finance</Link>
        </div>
        <div>
          <h3>Customer care</h3>
          <Link to="/delivery-info">Delivery information</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
        <div>
          <h3>Get in touch</h3>
          {about.phone && <a href={`tel:${about.phone}`}>{about.phone}</a>}
          {about.email && <a href={`mailto:${about.email}`}>{about.email}</a>}
          {socialLinks.filter(link => ['instagram', 'facebook'].includes((link.platform || '').toLowerCase())).length > 0 && (
            <div className="footer-social-row">
              {socialLinks.filter(link => ['instagram', 'facebook'].includes((link.platform || '').toLowerCase())).map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title={link.platform}>
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} AF Furnishings. All rights reserved.</span>
        <span>Secure payments &bull; Friendly service &bull; Home delivery</span>
      </div>
    </footer>
  )
}

export default Footer
