import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'

function SocialIcon({ platform }) {
  const key = (platform || '').toLowerCase().trim()
  if (key === 'instagram') return <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="20" height="20" />
  if (key === 'facebook') return <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="20" height="20" />
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>)
}

function Footer() {
  const [socialLinks, setSocialLinks] = useState([])
  const [about, setAbout] = useState({})
  const [logoUrl, setLogoUrl] = useState('/logo.png')

  useEffect(() => {
    const loadAll = () => {
      fetch(`${API_BASE}/api/social`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setSocialLinks(data) })
        .catch(() => {})
      fetch(`${API_BASE}/api/about`)
        .then(r => r.json())
        .then(data => { if (data) setAbout(data) })
        .catch(() => {})
      fetch(`${API_BASE}/api/settings`)
        .then(r => r.json())
        .then(data => {
          if (data?.site_logo) {
            const logo = data.site_logo.startsWith('http') ? data.site_logo : `${API_BASE}${data.site_logo}`
            setLogoUrl(logo)
            localStorage.setItem('site_logo', logo)
          }
        })
        .catch(() => {})
    }
    loadAll()
    const onLogoUpdate = () => {
      const cached = localStorage.getItem('site_logo')
      if (cached) setLogoUrl(cached)
      loadAll()
    }
    const logoInterval = setInterval(() => {
      fetch(`${API_BASE}/api/settings`).then(r => r.json()).then(d => {
        if (d?.site_logo) {
          const logo = d.site_logo.startsWith('http') ? d.site_logo : `${API_BASE}${d.site_logo}`
          if (logo !== localStorage.getItem('site_logo')) {
            localStorage.setItem('site_logo', logo)
            setLogoUrl(logo)
          }
        }
      }).catch(() => {})
    }, 15000)
    window.addEventListener('logo-updated', onLogoUpdate)
    window.addEventListener('storage', onLogoUpdate)
    return () => {
      clearInterval(logoInterval)
      window.removeEventListener('logo-updated', onLogoUpdate)
      window.removeEventListener('storage', onLogoUpdate)
    }
  }, [])

  return (
    <footer>
      <div className="footer-logo">
        <Link to="/"><img src={logoUrl} alt="AF Furnishings" /></Link>
      </div>

      <nav className="footer-nav">
        <Link to="/">Home</Link>
        <Link to="/category/lounge-suite">Lounge Suite</Link>
        <Link to="/category/bedroom">Bedroom</Link>
        <Link to="/category/dining">Dining</Link>
        <Link to="/category/living">Living</Link>
        <Link to="/about">About</Link>
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
          {socialLinks.length > 0 && (
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
        <span>&copy; 2026 AF Furnishings. All rights reserved.</span>
        <span>Secure payments &bull; Friendly service &bull; Home delivery</span>
      </div>
    </footer>
  )
}

export default Footer
