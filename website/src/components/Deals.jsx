function Deals() {
  return (
    <section className="deals" id="deals">
      <div className="fade-in">
        <h2>Limited-Time Weekly Deals</h2>
        <p>Comfortable furniture at straightforward prices. Flexible weekly payments available.</p>
      </div>
      <div className="deal-grid">
        <div className="deal-card fade-in stagger-1">
          <div className="deal-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3>NZ Wide Delivery</h3>
          <p>Fast and reliable delivery to your doorstep anywhere in New Zealand.</p>
        </div>
        <div className="deal-card fade-in stagger-2">
          <div className="deal-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h3>Easy Weekly Payment Plans</h3>
          <p>Spread the cost with simple weekly instalments that suit your budget.</p>
        </div>
        <div className="deal-card fade-in stagger-3">
          <div className="deal-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h3>Interest-Free Available</h3>
          <p>Enjoy flexible finance options with interest-free payment plans.</p>
        </div>
      </div>
    </section>
  )
}

export default Deals
