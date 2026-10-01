import { useState, useEffect } from 'react'
import { getAssetUrl } from '../config'
import { getJson } from '../api'

const defaultSlides = [
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern green sofa in a living room',
    tagline: 'AF FURNISHINGS',
    title: 'Comfort made for everyday living.',
    desc: 'Furniture, beds and appliances to make your home feel complete.',
    button_link: '/category/living-room',
  },
]

function Hero() {
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState(defaultSlides)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson('/api/homepage')
      .then(data => {
        if (data && Array.isArray(data.hero_slides) && data.hero_slides.length > 0) {
          const activeSlides = data.hero_slides.filter(s => s.active !== false)
          if (activeSlides.length > 0) {
            setSlides(activeSlides.map(s => ({
              image: getAssetUrl(s.image) || defaultSlides[0].image,
              alt: s.alt || '',
              tagline: s.tagline || '',
              title: s.title || '',
              desc: s.description || '',
              button_link: s.button_link || '',
            })))
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="hero" id="home">
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.image}
          alt={slide.alt}
          className={`hero-slide ${i === current ? 'active' : ''}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
      <div className="hero-shade"></div>
      <div className="hero-curve" aria-hidden="true"></div>
      <div className="hero-copy" key={current}>
        <span>{slides[current]?.tagline}</span>
        <h1>{slides[current]?.title}</h1>
        <p>{slides[current]?.desc}</p>
        {slides[current]?.button_link && (
          <a href={slides[current].button_link} className="hero-cta">Shop Now</a>
        )}
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
