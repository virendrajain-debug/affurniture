import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

const defaultSlides = [
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    alt: 'Modern green sofa in a living room',
    tagline: 'AF FURNISHINGS',
    title: <>Comfort made<br/>for <i>everyday living.</i></>,
    desc: 'Furniture, beds and appliances to make your home feel complete.',
  },
  {
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=85',
    alt: 'Cozy bedroom with wooden furniture',
    tagline: 'BEDROOM COLLECTION',
    title: <>Rest <i>beautifully.</i></>,
    desc: 'Discover beds, mattresses and bedroom sets designed for comfort.',
  },
  {
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=2000&q=85',
    alt: 'Elegant dining room setup',
    tagline: 'DINING COLLECTION',
    title: <>Gather around<br/><i>good moments.</i></>,
    desc: 'Tables and chairs made for family gatherings and dinner parties.',
  },
]

function Hero() {
  const [current, setCurrent] = useState(0)
  const [banners, setBanners] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(setBanners)
      .catch(() => {})
  }, [])

  const slides = defaultSlides.map((s, i) => i === 0 && banners.home_hero_banner ? { ...s, image: banners.home_hero_banner } : s)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero" id="home">
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.image}
          alt={slide.alt}
          className={`hero-slide ${i === current ? 'active' : ''}`}
        />
      ))}
      <div className="hero-shade"></div>
      <div className="hero-curve" aria-hidden="true"></div>
      <div className="hero-copy" key={current}>
        <span>{slides[current].tagline}</span>
        <h1>{slides[current].title}</h1>
        <p>{slides[current].desc}</p>
      </div>
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
