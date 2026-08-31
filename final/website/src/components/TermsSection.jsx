// ============================================================
// Terms & Conditions Section Component
// ============================================================
// Displays Terms content fetched from the API.
// Read-only section for website visitors.
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function TermsSection() {
  const [terms, setTerms] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/terms`)
      .then(r => r.json())
      .then(setTerms)
      .catch(() => {})
  }, [])

  return (
    <section className="terms-section" id="terms">
      <div className="section-title">
        <span>LEGAL</span>
        <h2>Terms & Conditions.</h2>
      </div>
      <div className="terms-content">
        {terms?.content ? (
          <pre className="terms-text">{terms.content}</pre>
        ) : (
          <p>Terms & Conditions will be available soon.</p>
        )}
      </div>
    </section>
  )
}

export default TermsSection
