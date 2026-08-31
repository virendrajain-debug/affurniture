import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function WinzQuote() {
  const [searchParams] = useSearchParams()
  const prefillProduct = searchParams.get('product') || ''

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    product_name: prefillProduct,
    message: '',
  })

  const [winzProducts, setWinzProducts] = useState([])
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(API_BASE + '/api/winz-products?active_only=true')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setWinzProducts(data) })
      .catch(() => {})
  }, [])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      showToast('Please fill in name and email', 'warning')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        showToast('Failed to submit. Please try again.', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
    setSubmitting(false)
  }

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="winz-quote-banner">
          <div className="winz-quote-banner-inner">
            <span>GET AN OFFICIAL QUOTE</span>
            <h1>WINZ Furniture Quotation</h1>
            <p>Select your required furniture items and our team will generate your formal Work and Income quote.</p>
          </div>
        </section>

        <section className="winz-quote-section">
          {submitted ? (
            <div className="winz-quote-success">
              <div className="enquiry-success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Quote Request Submitted!</h2>
              <p>Thank you, <strong>{form.name}</strong>. We've received your quote request{form.product_name ? ` for ${form.product_name}` : ''}.</p>
              <p>Our team will review your request and send the official WINZ quotation within 24 hours.</p>
              <p className="enquiry-success-note">Confirmation sent to <strong>{form.email}</strong></p>
              <button className="enquiry-success-btn" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', product_name: '', message: '' }) }}>
                Submit Another Quote
              </button>
            </div>
          ) : (
            <div className="winz-quote-form-wrap">
              <div className="section-title">
                <span>AF FURNISHINGS</span>
                <h2>Fill in your details</h2>
                <p>We'll help you get approved with an official WINZ supplier quote.</p>
              </div>

              <form className="winz-quote-form" onSubmit={handleSubmit}>
                {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

                <div className="form-row">
                  <div className="input-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required />
                  </div>
                  <div className="input-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 021 123 4567" />
                  </div>

                  <div className="input-group">
                    <label>Requested WinZ Product / Package</label>
                    <select
                      name="product_name"
                      value={form.product_name}
                      onChange={handleChange}
                      style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    >
                      <option value="">-- Select a WinZ Catalogue Product --</option>
                      {winzProducts.map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.category} {p.price ? `- $${p.price}` : ''})
                        </option>
                      ))}
                      <option value="Custom Furniture Package">Custom Furniture Package / Multiple Items</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Additional Notes / WinZ Case Manager Details</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows="4" placeholder="Tell us if you need delivery, specific room dimensions, or Case Manager contact information..." />
                </div>

                <button type="submit" className="winz-submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting Quote Request...' : 'Submit WinZ Quote Request'}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default WinzQuote;
