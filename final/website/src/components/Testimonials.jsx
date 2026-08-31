import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function Testimonials() {
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data)
      })
      .catch(() => {})
  }, [])

  if (testimonials.length === 0) return null

  return (
    <section className="testimonials">
      <div className="section-title fade-in">
        <span>FROM OUR CUSTOMERS</span>
        <h2>Homes made happier.</h2>
      </div>
      <div className="testimonial-grid">
        {testimonials.slice(0, 3).map((t) => (
          <blockquote key={t.id} className="testimonial-card fade-in">
            <div className="testimonial-stars">{'★'.repeat(t.rating || 5)}</div>
            <p>&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-author">
              {t.avatar ? (
                <img src={`${API_BASE}${t.avatar}`} alt={t.name} className="testimonial-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="testimonial-avatar">{t.name?.charAt(0)}</div>
              )}
              <div>
                <cite>&mdash; {t.name}</cite>
                {t.location && <span className="testimonial-location">{t.location}</span>}
              </div>
            </div>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
