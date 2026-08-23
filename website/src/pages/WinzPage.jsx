import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

const catalogProducts = [
  {
    name: 'Haven Sofa',
    desc: 'A welcoming three-seat sofa with soft cushions, supportive seating and a relaxed modern look for your living room.',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Willow Bedroom Set',
    desc: 'A simple bedroom foundation with warm finishes and practical storage to help create a calm, comfortable space.',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Haven Dining Set',
    desc: 'An everyday table setting made for shared meals, family conversations and easy gatherings at home.',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  },
]

const moreProducts = [
  { name: 'Harbour Armchair', desc: 'A soft reading chair with a welcoming silhouette.', img: 'https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=800&q=80' },
  { name: 'Elm Coffee Table', desc: 'A clean-lined table for lounge essentials.', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80' },
  { name: 'Oak Wardrobe', desc: 'Generous everyday storage with a warm finish.', img: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80' },
  { name: 'Willow Bedside', desc: 'A useful bedside companion with drawer storage.', img: 'https://images.unsplash.com/photo-1616627986600-94e21e68e75b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Arden Sideboard', desc: 'A practical display and storage piece for dining.', img: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Meadow Dining Chair', desc: 'A simple chair designed for daily gatherings.', img: 'https://images.unsplash.com/photo-1617098474202-0d0d7f60c56b?auto=format&fit=crop&w=800&q=80' },
]

function WinzPage() {
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(setBanners)
      .catch(() => {})
  }, [])

  return (
    <>
      <Header />
      <main>
        <section className="winz-hero">
          <div className="winz-hero-img">
            <img src={banners.winz_banner || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85'} alt="Modern home interior" />
          </div>
          <div className="winz-hero-copy">
            <span>AF FURNISHINGS</span>
            <h1>Furniture for<br /><em>your fresh start.</em></h1>
            <p>Discover home essentials for everyday living. Browse the collections, then get in touch for friendly help.</p>
            <a href="#range" className="primary">View the range</a>
          </div>
        </section>

        <section className="feature-strip">
          <div>
            <b>01</b>
            <span><strong>Furniture essentials</strong>Practical pieces for every room.</span>
          </div>
          <div>
            <b>02</b>
            <span><strong>Simple guidance</strong>Our team is ready to help.</span>
          </div>
          <div>
            <b>03</b>
            <span><strong>Easy contact</strong>Call or email us anytime.</span>
          </div>
        </section>

        <section className="range" id="range">
          <div className="section-title">
            <span>CATALOGUE PICKS</span>
            <h2>Home essentials.</h2>
            <p>Explore a few practical furniture choices for a comfortable home.</p>
          </div>
          <div className="range-grid">
            {catalogProducts.map((p, i) => (
              <article key={i} className="range-card">
                <img src={p.img} alt={p.name} />
                <div className="range-card-title">
                  <h3>{p.name}</h3>
                </div>
                <div className="range-card-body">
                  <p>{p.desc}</p>
                  <Link to={`/winz-quote?product=${encodeURIComponent(p.name)}`} className="btn-enquiry">Get a quote</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="more-products">
          <div className="section-title">
            <span>MORE TO EXPLORE</span>
            <h2>More ways to furnish home.</h2>
          </div>
          <div className="more-grid">
            {moreProducts.map((p, i) => (
              <article key={i} className="more-card">
                <img src={p.img} alt={p.name} />
                <div className="more-card-title">
                  <h3>{p.name}</h3>
                </div>
                <div className="more-card-body">
                  <p>{p.desc}</p>
                  <Link to={`/winz-quote?product=${encodeURIComponent(p.name)}`} className="btn-enquiry">Get a quote</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="steps">
          <div className="section-title">
            <span>THE AF PROCESS</span>
            <h2>Three simple steps.</h2>
            <p>Our catalogue is here to make choosing furniture feel easy and straightforward.</p>
          </div>
          <ol className="steps-list">
            <li>
              <b>Browse</b>
              <span>See the furniture range and decide what suits your home.</span>
            </li>
            <li>
              <b>Contact</b>
              <span>Call or email our team to discuss available options.</span>
            </li>
            <li>
              <b>Choose</b>
              <span>Confirm the pieces that make your new space feel right.</span>
            </li>
          </ol>
        </section>

        <section className="winz-contact">
          <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85" alt="Comfortable furnished room" />
          <div>
            <span>WE&apos;RE HERE TO HELP</span>
            <h2>Ready to choose your pieces?</h2>
            <p>Speak with AF Furnishings about the current range and your home needs.</p>
            <div className="contact-buttons">
              <a className="primary" href="tel:12345667890">Call us</a>
              <a href="mailto:affurniture@gmail.com" className="contact-email">affurniture@gmail.com</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default WinzPage
