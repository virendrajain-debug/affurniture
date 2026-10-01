import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ApplyForFinance() {
  const [searchParams] = useSearchParams()
  const prefillProduct = searchParams.get('product') || ''

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '', state: '', income_source: '', products: prefillProduct
  })
  const [files, setFiles] = useState([])
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(f => {
      if (f.size > 10 * 1024 * 1024) { setToast({ type: 'error', msg: 'File too large (max 10MB)' }); return false }
      return true
    })
    setFiles(prev => [...prev, ...valid].slice(0, 2))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.first_name || !form.email || !form.phone) {
      setToast({ type: 'error', msg: 'Please fill in all required fields' })
      return
    }
    setSubmitting(true)
    setToast(null)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      files.forEach(f => fd.append('documents', f))
      const res = await fetch(`${API_BASE}/api/finance-applications`, { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        setToast({ type: 'error', msg: data.message || 'Submission failed' })
      }
    } catch {
      setToast({ type: 'error', msg: 'Network error. Please try again.' })
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="about-page">
          <section className="terms-hero-banner" style={{ height: '400px' }}>
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80" alt="Finance" loading="lazy" decoding="async" />
            <div className="terms-hero-overlay">
              <span>FINANCE</span>
              <h1>Apply for Finance</h1>
            </div>
          </section>
          <section className="terms-section" style={{ paddingTop: '60px' }}>
            <div className="terms-content">
              <div className="enquiry-success">
                <div className="enquiry-success-icon">&#10003;</div>
                <h2>Application Submitted!</h2>
                <p>Thank you for your finance application. Our team will review it and get back to you within 1-2 business days.</p>
                <button className="enquiry-success-btn" onClick={() => { setSuccess(false); setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', state: '', income_source: '', products: '' }); setFiles([]) }}>Submit Another Application</button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="about-page">
        <section className="terms-hero-banner" style={{ height: '400px' }}>
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80" alt="Finance" loading="lazy" decoding="async" />
          <div className="terms-hero-overlay">
            <span>FINANCE</span>
            <h1>Apply for Finance</h1>
          </div>
        </section>

        <section className="terms-section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <div className="terms-content">
            <div className="finance-intro">
              <p>At AF Furnishings, we don't believe there is only one finance option that fits all, instead we help you find the Finance option that best suits you and your unique situation.</p>
              <p>Normal lending criteria and loan terms apply. Weekly payments are indicative only, and are based on a term of 36 months. Weekly payments include optional single Insurance protection.</p>
            </div>

            <form className="finance-form" onSubmit={handleSubmit}>
              {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

              <div className="form-row">
                <div className="input-group">
                  <label>First Name *</label>
                  <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Email *</label>
                  <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Phone *</label>
                  <input type="tel" name="phone" placeholder="Telephone number" value={form.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-group">
                <label>Address *</label>
                <textarea name="address" placeholder="Enter your address here" value={form.address} onChange={handleChange} rows={4} required />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>City</label>
                  <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>State/Province/Region</label>
                  <input type="text" name="state" placeholder="State/Province/Region" value={form.state} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Income Source *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="income_source" value="Benefit" checked={form.income_source === 'Benefit'} onChange={handleChange} />
                      <span>Benefit</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="income_source" value="Work" checked={form.income_source === 'Work'} onChange={handleChange} />
                      <span>Work</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="income_source" value="Both" checked={form.income_source === 'Both'} onChange={handleChange} />
                      <span>Both</span>
                    </label>
                  </div>
                </div>
                <div className="input-group">
                  <label>Products *</label>
                  <textarea name="products" placeholder="Which product are you enquiring about" value={form.products} onChange={handleChange} rows={4} />
                </div>
              </div>

              <div className="input-group">
                <label>File Upload</label>
                <div
                  className={`finance-file-drop ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p>Supported format: JPG, JPEG, PNG, GIF.</p>
                  <p>Please upload valid photo ID (Driver's License - Front/Back or Passport)</p>
                  <div className="finance-drop-zone">
                    <span className="finance-drop-text">DRAG & DROP FILES HERE</span>
                    <span className="finance-drop-or">or</span>
                    <span className="finance-drop-browse">Browse Files</span>
                  </div>
                  <span className="finance-file-count">{files.length} of 2</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
                {files.length > 0 && (
                  <div className="finance-file-list">
                    {files.map((f, i) => (
                      <div key={i} className="finance-file-item">
                        <span>{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="finance-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>

            <div className="finance-logos">
              <div className="finance-logos-track">
                <span>Yes! Finance</span>
                <span>Gem</span>
                <span>Finance Now</span>
                <span>Gilrose Finance</span>
                <span>Afterpay</span>
                <span>Zip</span>
                <span>Q Card</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ApplyForFinance
