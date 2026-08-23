import { useState } from 'react'
import { API_BASE } from '../config'

export default function EnquiryModal({ product, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      setToast({ msg: 'Please fill in name and email', type: 'warning' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message || `Enquiry about ${product.name}`,
          product_id: product.id,
          product_name: product.name,
          type: 'product',
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        setToast({ msg: 'Enquiry sent successfully!', type: 'success' })
      } else {
        setToast({ msg: 'Failed to send enquiry', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Server error. Please try again.', type: 'error' })
    }
    setSubmitting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        {submitted ? (
          <div className="enquiry-success">
            <div className="enquiry-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Enquiry Sent!</h2>
            <p>Thank you <strong>{form.name}</strong>! We've received your enquiry about <strong>{product.name}</strong>.</p>
            <p className="enquiry-success-note">Our team will get back to you at <strong>{form.email}</strong> within 24 hours.</p>
            <button className="enquiry-success-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <h2>Enquire about</h2>
            <h3>{product.name}</h3>
            {product.selling_price && (
              <p className="modal-price">${Number(product.selling_price).toLocaleString()}</p>
            )}
            <form onSubmit={handleSubmit}>
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
                <textarea name="message" rows="3" value={form.message} onChange={handleChange} placeholder={`I'm interested in ${product.name}...`} />
              </div>
              <button type="submit" className="primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
