import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Deals from './components/Deals'
import Category from './components/Category'
import ProductGrid from './components/ProductGrid'
import PromoPoster from './components/PromoPoster'
import Testimonials from './components/Testimonials'
import Stores from './components/Stores'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import AboutPage from './pages/AboutPage'
import WinzPage from './pages/WinzPage'
import WinzQuote from './pages/WinzQuote'
import ProductDetail from './pages/ProductDetail'
import PrivacyPage from './pages/PrivacyPage'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function HomePage() {
  return (
    <>
      <Header />
      <main id="home">
        <Hero />
        <Deals />

        <Category
          id="lounge"
          title="Lounge Suite"
          subtitle="Comfort for every day"
          image="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85"
          link="#sofas"
        />

        <ProductGrid
          sectionId="sofas"
          label="SOFAS & LOUNGE"
          title="Relax in style."
          category="Living Room"
        />

        <Category
          id="bedroom"
          title="Bedroom"
          subtitle="Rest beautifully"
          image="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=85"
          link="#bedroom-products"
          reverse
        />

        <ProductGrid
          sectionId="bedroom-products"
          label="BEDROOM COLLECTION"
          title="Beautiful rest begins here."
          category="Bedroom"
          compact
        />

        <Category
          id="dining"
          title="Dining"
          subtitle="Gather around good moments"
          image="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1800&q=85"
          link="#dining-products"
        />

        <ProductGrid
          sectionId="dining-products"
          label="DINING COLLECTION"
          title="Made for gathering."
          category="Dining"
        />

        <PromoPoster />
        <Testimonials />
        <Stores />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/winz" element={<WinzPage />} />
        <Route path="/winz-quote" element={<WinzQuote />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
