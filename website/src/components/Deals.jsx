import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const DEFAULT_CARDS = [
  { icon: 'delivery', title: 'NZ Wide Delivery', description: 'Fast and reliable delivery to your doorstep anywhere in New Zealand.' },
  { icon: 'payment', title: 'Easy Weekly Payment Plans', description: 'Spread the cost with simple weekly instalments that suit your budget.' },
  { icon: 'shield', title: 'Interest-Free Available', description: 'Enjoy flexible finance options with interest-free payment plans.' },
]

const ICONS = {
  delivery: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  payment: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
}

function Deals() {
  const [title, setTitle] = useState('Limited-Time Weekly Deals')
  const [subtitle, setSubtitle] = useState('Comfortable furniture at straightforward prices. Flexible weekly payments available.')
  const [cards, setCards] = useState(DEFAULT_CARDS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/deals`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
          setCards(data.cards)
          if (data.title) setTitle(data.title)
          if (data.subtitle) setSubtitle(data.subtitle)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="deals" id="deals">
      <div className="fade-in">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="deal-grid">
        {cards.map((card, idx) => (
          <div key={idx} className={`deal-card fade-in stagger-${idx + 1}`}>
            <div className="deal-icon-circle">
              {ICONS[card.icon] || ICONS.delivery}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Deals
