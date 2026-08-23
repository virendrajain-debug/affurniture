import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'

function SocialIcon({ platform }) {
  const icons = {
    instagram: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    facebook: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
    twitter: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    youtube: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"/>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
      </svg>
    ),
    linkedin: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  }
  return icons[platform] || (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  )
}

function Footer() {
  const [socialLinks, setSocialLinks] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/social`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSocialLinks(data) })
      .catch(() => {})
  }, [])

  return (
    <footer>
      <div className="footer-logo">
        <Link to="/"><img src="/logo.png" alt="AF Furnishings" /></Link>
      </div>

      <nav className="footer-nav">
        <Link to="/">Home</Link>
        <a href="/#sofas">Sofas</a>
        <a href="/#bedroom">Bedroom</a>
        <a href="/#dining">Dining</a>
        <a href="/#living">Living</a>
        <Link to="/about">About</Link>
      </nav>

      <div className="footer-columns">
        <div>
          <h3>AF Furnishings</h3>
          <Link to="/showrooms">Showrooms</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/shop-furniture">Shop furniture</Link>
        </div>
        <div>
          <h3>Customer care</h3>
          <Link to="/delivery-info">Delivery information</Link>
          <a href="/#deals">Returns</a>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
        <div>
          <h3>Get in touch</h3>
          <a href="tel:12345667890">12345667890</a>
          <a href="mailto:affurniture@gmail.com">affurniture@gmail.com</a>
          {socialLinks.length > 0 && (
            <div className="footer-social">
              {socialLinks.map((link) => (
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
