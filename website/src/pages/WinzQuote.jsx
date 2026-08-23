import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function WinzQuote() {
  const [searchParams] = useSearchParams()
  const prefillProduct = searchParams.get('product') || ''

  const [form, setForm] = useState({
    name: '', email: '', phone: '', product_name: prefillProduct, message: '',
  })
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
            <span>GET A QUOTE</span>
            <h1>WinZ Furniture Quote</h1>
            <p>Tell us what you need and we'll get back to you with the best options.</p>
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
              <p>Thank you, <strong>{form.name}</strong>. We've received your quote request{form.product_name ? ` for <strong>{form.product_name}</strong>` : ''}.</p>
              <p>Our team will review your request and get back to you within 1-2 business days.</p>
              <p className="enquiry-success-note">You'll receive a confirmation at <strong>{form.email}</strong></p>
              <button className="enquiry-success-btn" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', product_name: '', message: '' }) }}>
                Submit Another Quote
              </button>
            </div>
          ) : (
            <div className="winz-quote-form-wrap">
              <div className="section-title">
                <span>AF FURNISHINGS</span>
                <h2>Fill in your details</h2>
                <p>We'll help you find the right furniture for your home.</p>
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
                    <label>Phone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" />
                  </div>
                  <div className="input-group">
                    <label>Product Interested In</label>
                    <input type="text" name="product_name" value={form.product_name} onChange={handleChange} placeholder="e.g. Haven Sofa" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Message</label>
                  <textarea name="message" rows="4" value={form.message} onChange={handleChange} placeholder="Tell us about your furniture needs, preferred colors, budget, etc." />
                </div>

                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Quote Request'}
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

export default WinzQuote
