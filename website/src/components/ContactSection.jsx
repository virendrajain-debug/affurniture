// ============================================================
// Contact Section Component
// ============================================================
// Contact form that submits enquiries to the API.
// Calls POST /api/enquiries with type="contact".
//
// FIELDS: Name, Email, Phone, Message
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [storeLocations, setStoreLocations] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const [settings, setSettings] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/store-locations`).then(r => r.json()).then(d => { if (Array.isArray(d)) setStoreLocations(d) }).catch(() => {})
    fetch(`${API_BASE}/api/social`).then(r => r.json()).then(d => { if (Array.isArray(d)) setSocialLinks(d) }).catch(() => {})
    fetch(`${API_BASE}/api/settings`).then(r => r.json()).then(d => { if (d) setSettings(d) }).catch(() => {})
  }, [])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Submit contact form to API
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      showToast('Please fill in name and email', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'contact' }),
      })
      if (res.ok) {
        showToast('Message sent! We\'ll get back to you soon.', 'success')
        setForm({ name: '', email: '', phone: '', message: '' })
      } else {
        showToast('Failed to send message', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
    setSubmitting(false)
  }

  return (
    <section className="contact-section" id="contact">
      <div className="section-title">
        <span>GET IN TOUCH</span>
        <h2>Contact us.</h2>
      </div>
      <div className="contact-content">
        <div className="contact-inner">
          <form className="contact-form" onSubmit={handleSubmit}>
            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
            <div className="input-group">
              <label>Your Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
            </div>
            <div className="input-group">
              <label>Your Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea name="message" rows="4" value={form.message} onChange={handleChange} placeholder="How can we help you?" />
            </div>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="contact-info-sidebar">
            <h3>Reach Us</h3>
            {settings.phone && (
              <div className="contact-info-item">
                <span className="contact-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </span>
                <div>
                  <strong>Phone</strong>
                  <p>{settings.phone}</p>
                </div>
              </div>
            )}
            {settings.email && (
              <div className="contact-info-item">
                <span className="contact-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <div>
                  <strong>Email</strong>
                  <p>{settings.email}</p>
                </div>
              </div>
            )}
            {storeLocations.length > 0 && storeLocations.slice(0, 2).map(loc => (
              <div key={loc.id} className="contact-info-item">
                <span className="contact-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <strong>{loc.name}</strong>
                  <p>{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>
                </div>
              </div>
            ))}
            {socialLinks.length > 0 && (
              <div className="contact-social-links">
                <strong>Follow Us</strong>
                <div className="contact-social-icons">
                  {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
                      {link.platform?.toLowerCase() === 'instagram' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      ) : link.platform?.toLowerCase() === 'facebook' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
